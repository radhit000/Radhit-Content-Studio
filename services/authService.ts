import { auth, db } from "../firebase";
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  User as FirebaseUser
} from "firebase/auth";
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs,
  query,
  where,
  onSnapshot,
  Unsubscribe
} from "firebase/firestore";
import { User, UserStatus, UserRole } from "../types";

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: any, operationType: OperationType, path: string | null) {
  if (error?.code === 'permission-denied' || error?.message?.includes('permissions')) {
    const errInfo: FirestoreErrorInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        emailVerified: auth.currentUser?.emailVerified,
        isAnonymous: auth.currentUser?.isAnonymous,
        tenantId: auth.currentUser?.tenantId,
        providerInfo: auth.currentUser?.providerData.map(provider => ({
          providerId: provider.providerId,
          displayName: provider.displayName,
          email: provider.email,
          photoUrl: provider.photoURL
        })) || []
      },
      operationType,
      path
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  }
  throw error;
}

const ADMIN_EMAILS = ['radhit000@gmail.com', 'risangalit@gmail.com'];

export const authService = {
  // Login with Google
  loginWithGoogle: async (): Promise<User> => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return authService.handleUserSync(result.user);
  },

  // Register with Email
  registerWithEmail: async (email: string, password: string): Promise<User> => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return authService.handleUserSync(result.user);
  },

  // Login with Email
  loginWithEmail: async (email: string, password: string): Promise<User> => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return authService.handleUserSync(result.user);
  },

  // Helper to sync Firebase User with Firestore User Profile
  handleUserSync: async (firebaseUser: FirebaseUser): Promise<User> => {
    // 1. Check if user profile exists by UID
    let userDoc;
    try {
      userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, `users/${firebaseUser.uid}`);
    }
    
    if (userDoc && userDoc.exists()) {
      return { ...userDoc.data(), uid: firebaseUser.uid } as User;
    }

    // 2. Check if user profile exists by Email (Pre-approved)
    const q = query(collection(db, 'users'), where('email', '==', firebaseUser.email));
    let querySnapshot;
    try {
      querySnapshot = await getDocs(q);
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'users');
    }
    
    if (querySnapshot && !querySnapshot.empty) {
      // User was pre-approved. Update their document with UID and set ID to UID
      const existingDoc = querySnapshot.docs[0];
      const userData = existingDoc.data() as User;
      const updatedUser = { ...userData, uid: firebaseUser.uid };
      
      try {
        await setDoc(doc(db, 'users', firebaseUser.uid), updatedUser);
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, `users/${firebaseUser.uid}`);
      }
      return updatedUser;
    }
    
    // 3. Create new user profile
    const isInitialAdmin = ADMIN_EMAILS.includes(firebaseUser.email || '');
    const newUser: User = {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      role: isInitialAdmin ? 'ADMIN' : 'USER',
      status: isInitialAdmin ? 'ACTIVE' : 'PENDING',
      joinedAt: Date.now()
    };
    try {
      await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${firebaseUser.uid}`);
    }
    return newUser;
  },

  logout: async () => {
    await signOut(auth);
  },

  // Listen for auth changes
  subscribeToAuth: (callback: (user: User | null, firebaseUser: FirebaseUser | null) => void) => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            callback({ ...userDoc.data(), uid: firebaseUser.uid } as User, firebaseUser);
          } else {
            callback(null, firebaseUser);
          }
        } catch (e) {
          handleFirestoreError(e, OperationType.GET, `users/${firebaseUser.uid}`);
        }
      } else {
        callback(null, null);
      }
    });
  },

  // Admin: Get all users
  getAllUsers: async (): Promise<User[]> => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      return querySnapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as User));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'users');
      return []; // unreachable
    }
  },

  // Admin: Subscribe to all users
  subscribeToAllUsers: (callback: (users: User[]) => void): Unsubscribe => {
    return onSnapshot(collection(db, 'users'), (snapshot) => {
      const users = snapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as User));
      callback(users);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    });
  },

  // Admin: Create user (pre-approve email)
  createUser: async (email: string, role: UserRole, status: UserStatus) => {
    const newUser: User = {
      email,
      role,
      status,
      joinedAt: Date.now()
    };
    
    try {
      const q = query(collection(db, 'users'), where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        throw new Error("Pengguna dengan email ini sudah terdaftar.");
      }

      await setDoc(doc(collection(db, 'users')), newUser);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'users');
    }
  },

  // Admin: Update user status
  updateUserStatus: async (uid: string, status: UserStatus) => {
    try {
      await updateDoc(doc(db, 'users', uid), { status });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${uid}`);
    }
  },

  // Admin: Update user role
  updateUserRole: async (uid: string, role: UserRole) => {
    try {
      await updateDoc(doc(db, 'users', uid), { role });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${uid}`);
    }
  },

  // Update User API Key
  updateUserApiKey: async (uid: string, apiKey: string) => {
    try {
      await updateDoc(doc(db, 'users', uid), { customApiKey: apiKey });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${uid}`);
    }
  }
};
