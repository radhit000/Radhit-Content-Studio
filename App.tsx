import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Workspace } from './components/Workspace';
import { ApiKeySettings } from './components/ApiKeySettings';
import { Login } from './components/Login';
import { PendingApproval } from './components/PendingApproval';
import { AdminDashboard } from './components/AdminDashboard';
import { AppState, ErrorState, FeatureItem, ProcessedImage, AppSettings, User } from './types';
import { editImageWithGemini } from './services/geminiService';
import { settingsService } from './services/settingsService';
import { authService } from './services/authService';
import { getDocFromServer, doc } from 'firebase/firestore';
import { db } from './firebase';

const App: React.FC = () => {
  console.log("App Component Rendered");
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  // UI State
  const [showSettings, setShowSettings] = useState(false);
  const [appSettings, setAppSettings] = useState<AppSettings>({
    appName: 'Radhit Studio Pro',
    appTagline: 'Bwork Digital agency & Content Studio',
    themeColor: '#C5A059',
    defaultApiKey: '',
    enableSecurity: false
  });

  // App Core State
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [originalMimeType, setOriginalMimeType] = useState<string>('image/png');
  
  // Gallery Logic: Store up to 4 results
  const [results, setResults] = useState<ProcessedImage[]>([]);
  const [activeResultId, setActiveResultId] = useState<string | null>(null);

  const [error, setError] = useState<ErrorState>({ hasError: false, message: '' });
  const [selectedFeature, setSelectedFeature] = useState<FeatureItem | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [hasAiStudioKey, setHasAiStudioKey] = useState(false);

  // --- CONNECTION TEST ---
  useEffect(() => {
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. ");
        }
      }
    };
    testConnection();
  }, []);

  // --- FIREBASE SUBSCRIPTIONS ---
  const isAuthReadyRef = React.useRef(false);

  useEffect(() => {
    // Subscribe to Auth
    const unsubscribeAuth = authService.subscribeToAuth((user) => {
      if (user) {
        console.log("Auth: User Logged In", user.email);
      } else {
        console.log("Auth: No User Profile Found");
      }
      setCurrentUser(user);
      isAuthReadyRef.current = true;
      setIsAuthReady(true);
    });

    // Fallback: If auth doesn't respond in 5 seconds, force ready
    const timeout = setTimeout(() => {
      if (!isAuthReadyRef.current) {
        console.warn("Auth subscription timed out, forcing ready state.");
        setIsAuthReady(true);
      }
    }, 5000);

    // Subscribe to Settings
    const unsubscribeSettings = settingsService.subscribeToSettings((settings) => {
      setAppSettings(settings);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeSettings();
      clearTimeout(timeout);
    };
  }, []);

  // Expose settings to window for Workspace button
  useEffect(() => {
    (window as any).openSettings = () => setShowSettings(true);
    return () => { delete (window as any).openSettings; };
  }, []);

  // Check for AI Studio Key
  useEffect(() => {
    const checkAiStudio = async () => {
      if (window.aistudio) {
        try {
          const hasKey = await window.aistudio.hasSelectedApiKey();
          setHasAiStudioKey(hasKey);
        } catch (e) {
          console.error("AI Studio Check Failed", e);
        }
      }
    };
    checkAiStudio();
  }, []);

  // --- SECURITY EFFECT ---
  useEffect(() => {
    if (appSettings.enableSecurity) {
      const disableRightClick = (e: MouseEvent) => e.preventDefault();
      const disableDevTools = (e: KeyboardEvent) => {
         if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I') || (e.ctrlKey && e.key === 'u')) {
           e.preventDefault();
         }
      };
      window.addEventListener('contextmenu', disableRightClick);
      window.addEventListener('keydown', disableDevTools);
      
      return () => {
        window.removeEventListener('contextmenu', disableRightClick);
        window.removeEventListener('keydown', disableDevTools);
      };
    }
  }, [appSettings.enableSecurity]);

  useEffect(() => {
    document.title = appSettings.appName;
  }, [appSettings.appName]);

  const handleSaveApiKey = async (key: string) => {
    if (currentUser) {
      try {
        const userId = (await import('./firebase')).auth.currentUser?.uid;
        if (userId) {
          await authService.updateUserApiKey(userId, key);
          setShowSettings(false);
        }
      } catch (e) {
        console.error("Failed to save API Key", e);
      }
    }
  };

  const handleImageSelected = useCallback((base64: string, mimeType: string) => {
    const fullBase64 = `data:${mimeType};base64,${base64}`;
    setOriginalImage(fullBase64);
    setOriginalMimeType(mimeType);
    setResults([]); 
    setActiveResultId(null);
    setAppState(AppState.UPLOADING);
    setError({ hasError: false, message: '' });
  }, []);

  // Check if a system-wide default key exists (Admin or Env or AI Studio)
  const hasDefaultKey = !!(appSettings.defaultApiKey || process.env.API_KEY || hasAiStudioKey);

  const handleGenerate = useCallback(async (prompt: string, aspectRatio?: string) => {
    const effectiveKey = settingsService.getEffectiveApiKey(currentUser?.customApiKey, appSettings) || (hasAiStudioKey ? 'AI_STUDIO_KEY' : '');

    if (!effectiveKey || effectiveKey.length < 10) {
       // If AI Studio is available but no key selected, try to prompt?
       if (window.aistudio && !hasAiStudioKey) {
          try {
             await window.aistudio.openSelectKey();
             setHasAiStudioKey(true);
             // Retry generation? Or let user click again.
             // For now, just show settings if still no key.
             if (!await window.aistudio.hasSelectedApiKey()) {
                setShowSettings(true);
                setError({ 
                  hasError: true, 
                  message: "API Key belum disetting. Silakan isi API Key terlebih dahulu sebelum aplikasi dapat digunakan.",
                  link: "https://youtu.be/9ey7iIsgQAk",
                  linkText: "Tonton Tutorial Pengisian API Key"
                });
                return;
             }
          } catch (e) {
             console.error("AI Studio Key Selection Failed", e);
             setShowSettings(true);
             setError({ 
               hasError: true, 
               message: "Gagal menghubungkan akun Google. Silakan coba lagi atau masukkan API Key manual.",
               link: "https://youtu.be/9ey7iIsgQAk",
               linkText: "Tonton Tutorial Pengisian API Key"
             });
             return;
          }
       } else {
          setShowSettings(true);
          setError({ 
            hasError: true, 
            message: "API Key belum disetting. Silakan isi API Key terlebih dahulu sebelum aplikasi dapat digunakan.",
            link: "https://youtu.be/9ey7iIsgQAk",
            linkText: "Tonton Tutorial Pengisian API Key"
          });
          return;
       }
    }

    setAppState(AppState.PROCESSING);
    setError({ hasError: false, message: '' });

    try {
      const base64Raw = originalImage ? originalImage.split(',')[1] : null;
      
      const generatedImageBase64 = await editImageWithGemini(
        base64Raw,
        originalMimeType,
        prompt,
        selectedFeature?.systemPrompt,
        aspectRatio || '1:1',
        currentUser?.customApiKey,
        appSettings
      );

      const newResult: ProcessedImage = {
        id: Date.now().toString(),
        original: originalImage || `data:image/png;base64,${generatedImageBase64}`,
        result: generatedImageBase64,
        prompt: prompt,
        timestamp: Date.now()
      };

      setResults(prev => {
        const newHistory = [...prev, newResult];
        if (newHistory.length > 4) newHistory.shift(); 
        return newHistory;
      });
      
      setActiveResultId(newResult.id);
      setAppState(AppState.COMPLETE);
    } catch (err: any) {
      console.error(err);
      setError({ 
        hasError: true, 
        message: err.message || "Gagal memproses gambar." 
      });
      setAppState(AppState.ERROR);
    }
  }, [originalImage, originalMimeType, selectedFeature, currentUser?.customApiKey, appSettings]);

  const handleReset = () => {
    console.log("App State Reset Triggered");
    setOriginalImage(null);
    setResults([]);
    setActiveResultId(null);
    setAppState(AppState.IDLE);
    setError({ hasError: false, message: '' });
  };

  const handleLogout = async () => {
    await authService.logout();
    setCurrentUser(null);
    setShowAdmin(false);
  };

  if (!isAuthReady) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center space-y-6">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-2 border-zinc-800 rounded-full"></div>
          <div 
            className="absolute inset-0 border-t-2 rounded-full animate-spin"
            style={{ borderColor: appSettings.themeColor }}
          ></div>
        </div>
        <p className="elegant-caps text-zinc-500 animate-pulse">Initializing Radhit Studio Pro</p>
      </div>
    );
  }

  if (!currentUser) {
    return <Login onLoginSuccess={setCurrentUser} appSettings={appSettings} />;
  }

  if (currentUser.status === 'PENDING' || currentUser.status === 'INACTIVE') {
    return <PendingApproval onLogout={handleLogout} appSettings={appSettings} status={currentUser.status} />;
  }
  
  return (
    <div className="h-screen bg-black text-white selection:bg-teal-500/30 flex flex-col overflow-hidden">
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none z-0"></div>
      
      <Header 
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
        onOpenSettings={() => setShowSettings(true)}
        onOpenAdmin={() => setShowAdmin(true)}
        onLogout={handleLogout}
        appSettings={appSettings}
        currentUser={currentUser}
      />

      {showSettings && (
        <ApiKeySettings 
          currentApiKey={currentUser?.customApiKey || ''}
          onSave={handleSaveApiKey}
          onClose={() => setShowSettings(false)}
          hasDefaultKey={hasDefaultKey}
          canConnectAiStudio={!!window.aistudio}
          isAiStudioConnected={hasAiStudioKey}
        />
      )}

      <div className="flex flex-1 relative z-10 overflow-hidden">
        {showAdmin ? (
          <AdminDashboard onBack={() => setShowAdmin(false)} />
        ) : (
          <>
            <Sidebar 
              isOpen={isSidebarOpen}
              onCloseMobile={() => setIsSidebarOpen(false)}
              selectedFeatureId={selectedFeature?.id || null}
              onSelectFeature={(feature) => setSelectedFeature(feature)}
              appSettings={appSettings}
            />
            <main className="flex-1 h-full overflow-y-auto custom-scrollbar p-4 md:p-8 relative">
              {error.hasError && (
                <div className="w-full max-w-4xl mx-auto mb-6 bg-red-900/20 border border-red-800 text-red-200 px-4 py-3 rounded-lg flex items-center gap-3 animate-fade-in">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-red-500 shrink-0">
                    <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.599-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                  </svg>
                  <div className="text-sm font-medium flex-1">
                    {error.message}
                    {error.link && (
                      <a href={error.link} target="_blank" rel="noreferrer" className="ml-2 underline text-blue-400 hover:text-blue-300">
                        {error.linkText || error.link}
                      </a>
                    )}
                  </div>
                  {(error.message.includes('Network Error') || error.message.includes('network-request-failed') || error.message.includes('auth/network-request-failed')) && (
                    <button 
                      onClick={() => window.open(window.location.href, '_blank')}
                      className="px-3 py-1 bg-red-500 text-white text-[10px] font-bold rounded-md hover:bg-red-400 transition-colors shrink-0"
                    >
                      BUKA DI TAB BARU
                    </button>
                  )}
                </div>
              )}
              <Workspace 
                selectedFeature={selectedFeature}
                originalImage={originalImage}
                results={results}
                isProcessing={appState === AppState.PROCESSING}
                activeResultId={activeResultId}
                onImageSelected={handleImageSelected}
                onGenerate={handleGenerate}
                onReset={handleReset}
                onSelectResult={(res) => setActiveResultId(res.id)}
                userApiKey={currentUser?.customApiKey} 
                appSettings={appSettings}
              />
            </main>
          </>
        )}
      </div>
    </div>
  );
};

export default App;