import React, { useState } from 'react';

interface ApiKeySettingsProps {
  currentApiKey?: string;
  onSave: (key: string) => void;
  onClose: () => void;
  isMandatory?: boolean; 
  hasDefaultKey?: boolean;
  isAiStudioConnected?: boolean;
  canConnectAiStudio?: boolean;
}

export const ApiKeySettings: React.FC<ApiKeySettingsProps> = ({ 
  currentApiKey, 
  onSave, 
  onClose, 
  isMandatory = false, 
  hasDefaultKey = false,
  isAiStudioConnected = false,
  canConnectAiStudio = false
}) => {
  const [apiKey, setApiKey] = useState(currentApiKey || '');

  const handleConnectGoogle = async () => {
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        // We can't easily know if they succeeded without a callback or polling, 
        // but App.tsx handles the state update on re-render or we can trigger a reload
        window.location.reload(); 
      } catch (e) {
        console.error("Failed to connect Google Account", e);
      }
    }
  };

  const getProviderType = (key: string) => {
    if (!key) return null;
    if (key.startsWith('sk-or-')) return 'OpenRouter';
    if (key.startsWith('AIza')) return 'Google Gemini';
    return 'Unknown';
  };

  const detectedProvider = getProviderType(apiKey) || (hasDefaultKey ? 'Default System' : null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className={`bg-zinc-900 border rounded-xl w-full max-w-md p-6 shadow-2xl relative ${isMandatory && !hasDefaultKey ? 'border-red-500/50 ring-1 ring-red-500/20' : 'border-zinc-800'}`}>
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mb-6">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${isMandatory && !hasDefaultKey ? 'bg-red-900/30 text-red-400' : 'bg-teal-900/30 text-teal-400'}`}>
             {isMandatory && !hasDefaultKey ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
             ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                </svg>
             )}
          </div>
          <h2 className="text-xl font-bold text-white mb-1">
            {isMandatory && !hasDefaultKey ? "API Key Diperlukan" : "Pengaturan API Key"}
          </h2>
          <p className="text-zinc-500 text-sm">
             {hasDefaultKey 
               ? "Akun Default (Google Bowser) aktif."
               : isMandatory 
                 ? "Masukkan API Key dari Google AI Studio atau OpenRouter." 
                 : "Gunakan API Key pribadi untuk performa lebih baik."}
          </p>
        </div>

        <div className="space-y-4">
          {canConnectAiStudio && (
            <div className="p-4 bg-zinc-800/30 rounded-lg border border-zinc-700/50 mb-4">
               <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-white flex items-center gap-2">
                    <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    Akun Google (Browser)
                  </span>
                  {isAiStudioConnected ? (
                      <span className="text-[10px] bg-teal-900/50 text-teal-400 px-2 py-0.5 rounded font-bold border border-teal-500/30">TERHUBUNG</span>
                  ) : (
                      <span className="text-[10px] bg-zinc-700 text-zinc-400 px-2 py-0.5 rounded border border-zinc-600">BELUM TERHUBUNG</span>
                  )}
               </div>
               <button 
                  onClick={handleConnectGoogle}
                  className={`w-full py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${isAiStudioConnected ? 'bg-zinc-800 text-zinc-400 cursor-default border border-zinc-700' : 'bg-white text-black hover:bg-gray-100 shadow-lg hover:shadow-xl hover:scale-[1.02]'}`}
                  disabled={isAiStudioConnected}
               >
                  {isAiStudioConnected ? "Akun Google Terhubung" : "Hubungkan Akun Google"}
               </button>
               {!isAiStudioConnected && (
                  <p className="text-[10px] text-zinc-500 mt-2 text-center">
                    Gunakan akun Google Anda untuk akses API gratis tanpa copy-paste key.
                  </p>
               )}
            </div>
          )}

          <div className="space-y-2">
            <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-zinc-300">Google Gemini / OpenRouter Key</label>
                {detectedProvider && (
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${detectedProvider === 'OpenRouter' ? 'bg-purple-900/50 text-purple-400' : 'bg-teal-900/50 text-teal-400'}`}>
                        {detectedProvider}
                    </span>
                )}
            </div>
            <div className="relative">
                <input 
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={isAiStudioConnected ? "Menggunakan Akun Google Terhubung" : (hasDefaultKey ? "Menggunakan Default System Key" : "Google (AIza...) atau OpenRouter (sk-or-v1...)")}
                  className={`w-full bg-black border rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all font-mono text-sm ${hasDefaultKey && !apiKey ? 'border-teal-500/50 ring-1 ring-teal-500/20' : 'border-zinc-700'}`}
                />
                {hasDefaultKey && !apiKey && (
                    <div className="absolute right-3 top-3 text-[10px] text-teal-500 font-bold bg-teal-900/30 px-2 py-0.5 rounded pointer-events-none border border-teal-500/20">
                        {isAiStudioConnected ? "GOOGLE ACCOUNT" : "DEFAULT SYSTEM"}
                    </div>
                )}
                {apiKey && (
                    <button 
                        onClick={() => setApiKey('')}
                        className="absolute right-3 top-3 text-zinc-500 hover:text-red-400 transition-colors"
                        title="Hapus Key"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                          <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                        </svg>
                    </button>
                )}
            </div>
            {apiKey && detectedProvider === 'OpenRouter' && (
                <p className="text-[10px] text-purple-400">
                    * Pastikan akun OpenRouter memiliki credit/balance yang cukup.
                </p>
            )}
          </div>
          
          <div className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-800 flex flex-col gap-2">
             <p className="text-xs text-zinc-400 leading-relaxed">
               <span className="text-yellow-400 font-bold">Tutorial Pengisian API Key:</span>
             </p>
             <div className="flex gap-4">
                 <a 
                   href="https://youtu.be/9ey7iIsgQAk" 
                   target="_blank" 
                   rel="noreferrer"
                   className="text-xs text-red-400 hover:text-red-300 border-b border-red-500/30 hover:border-red-400 flex items-center gap-1"
                 >
                   <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                   Tonton Video Tutorial
                 </a>
             </div>
             <p className="text-xs text-zinc-400 leading-relaxed mt-2">
               <span className="text-yellow-400 font-bold">Penyedia yang didukung:</span>
             </p>
             <div className="flex gap-4">
                 <a 
                   href="https://aistudio.google.com/app/apikey" 
                   target="_blank" 
                   rel="noreferrer"
                   className="text-xs text-teal-400 hover:text-teal-300 border-b border-teal-500/30 hover:border-teal-400"
                 >
                   Google AI Studio &rarr;
                 </a>
                 <a 
                   href="https://openrouter.ai/keys" 
                   target="_blank" 
                   rel="noreferrer"
                   className="text-xs text-purple-400 hover:text-purple-300 border-b border-purple-500/30 hover:border-purple-400"
                 >
                   OpenRouter &rarr;
                 </a>
             </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button 
              onClick={onClose}
              className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {hasDefaultKey ? "Gunakan Default" : "Nanti Saja"}
            </button>
            <button 
              onClick={() => {
                onSave(apiKey);
                onClose();
              }}
              // Always enable save if we have a key OR if we want to clear it (empty string)
              // But if it's mandatory and we have NO default and NO key, disable it.
              disabled={isMandatory && !hasDefaultKey && !apiKey}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-lg 
                ${isMandatory && !hasDefaultKey && !apiKey
                  ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed' 
                  : 'bg-teal-600 hover:bg-teal-500 text-white shadow-teal-900/20'}`}
            >
              Simpan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};