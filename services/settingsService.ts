import { db, auth } from "../firebase";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { AppSettings } from "../types";

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

const SETTINGS_DOC = 'settings/global';

const DEFAULT_SETTINGS: AppSettings = {
  appName: 'Radhit Studio Pro',
  appTagline: 'Bwork Digital agency & Content Studio',
  themeColor: '#C5A059',
  defaultApiKey: '',
  enableSecurity: false
};

export const settingsService = {
  // Get initial settings
  getSettings: async (): Promise<AppSettings> => {
    try {
      const docSnap = await getDoc(doc(db, SETTINGS_DOC));
      if (docSnap.exists()) {
        return { ...DEFAULT_SETTINGS, ...docSnap.data() } as AppSettings;
      }
      return DEFAULT_SETTINGS;
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, SETTINGS_DOC);
      return DEFAULT_SETTINGS;
    }
  },

  // Subscribe to settings changes
  subscribeToSettings: (callback: (settings: AppSettings) => void) => {
    return onSnapshot(doc(db, SETTINGS_DOC), (docSnap) => {
      if (docSnap.exists()) {
        callback({ ...DEFAULT_SETTINGS, ...docSnap.data() } as AppSettings);
      } else {
        callback(DEFAULT_SETTINGS);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, SETTINGS_DOC);
    });
  },

  saveSettings: async (settings: AppSettings) => {
    try {
      await setDoc(doc(db, SETTINGS_DOC), settings);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, SETTINGS_DOC);
    }
  },

  // Helper to get effective API Key
  getEffectiveApiKey: (userKey?: string, settings?: AppSettings): string => {
    // 1. Priority: User-provided key in session
    if (userKey && userKey.length > 10) return userKey;
    
    // 2. Priority: Default API Key from Settings (Admin set)
    if (settings?.defaultApiKey && settings.defaultApiKey.length > 10) return settings.defaultApiKey;
    
    // 3. Priority: Environment Variable API_KEY (Platform injected)
    const envApiKey = (import.meta as any).env?.VITE_API_KEY || (process as any).env?.API_KEY;
    if (envApiKey && envApiKey.length > 10) return envApiKey;
    
    // 4. Priority: Environment Variable GEMINI_API_KEY (Platform injected - Google specific)
    const envGeminiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (process as any).env?.GEMINI_API_KEY;
    if (envGeminiKey && envGeminiKey.length > 10) return envGeminiKey;
    
    return '';
  },

  // Helper to get specifically a Google Gemini API Key
  getGoogleApiKey: (userKey?: string, settings?: AppSettings): string => {
    // 1. User key (if it's not OpenRouter)
    if (userKey && userKey.length > 10 && !userKey.startsWith('sk-or-')) return userKey;
    
    // 2. Settings key (if it's not OpenRouter)
    if (settings?.defaultApiKey && settings.defaultApiKey.length > 10 && !settings.defaultApiKey.startsWith('sk-or-')) return settings.defaultApiKey;
    
    // 3. GEMINI_API_KEY (Always Google)
    const envGeminiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (process as any).env?.GEMINI_API_KEY;
    if (envGeminiKey && envGeminiKey.length > 10) return envGeminiKey;
    
    // 4. API_KEY (if it's not OpenRouter)
    const envApiKey = (import.meta as any).env?.VITE_API_KEY || (process as any).env?.API_KEY;
    if (envApiKey && envApiKey.length > 10 && !envApiKey.startsWith('sk-or-')) return envApiKey;
    
    return '';
  }
};
