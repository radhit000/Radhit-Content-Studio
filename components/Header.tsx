import React from 'react';
import { AppSettings, User } from '../types';

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenSettings: () => void;
  onOpenAdmin: () => void;
  onLogout: () => void;
  appSettings: AppSettings;
  currentUser: User;
}

export const Header: React.FC<HeaderProps> = ({ 
  onToggleSidebar, 
  onOpenSettings,
  onOpenAdmin,
  onLogout,
  appSettings,
  currentUser
}) => {
  return (
    <header className="w-full py-4 px-4 flex items-center justify-between border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50 h-[89px]">
      <div className="flex items-center gap-3">
        <button 
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        <div className="relative group">
          <div 
            className="absolute inset-0 blur-xl rounded-full opacity-20 group-hover:opacity-40 transition-opacity"
            style={{ backgroundColor: appSettings.themeColor }}
          ></div>
          <div 
             className="relative w-12 h-12 rounded-full flex items-center justify-center border border-white/10 overflow-hidden bg-black shadow-2xl"
          >
             <div className="absolute inset-0 bg-gradient-to-tr from-black via-zinc-900 to-zinc-800"></div>
             <span 
               className="relative text-white font-light text-2xl serif italic"
               style={{ color: appSettings.themeColor }}
             >
               {appSettings.appName.charAt(0)}
             </span>
          </div>
        </div>

        <div className="ml-1">
          <div className="flex items-center gap-2">
            <h1 
              className="text-2xl font-bold tracking-tighter serif leading-none"
              style={{ color: '#fff' }}
            >
              {appSettings.appName}
            </h1>
            <span className="bg-teal-500 text-black text-[8px] font-black px-1.5 py-0.5 rounded-sm tracking-tighter">PRO</span>
          </div>
          <p 
            className="elegant-caps opacity-90 mt-1"
            style={{ color: appSettings.themeColor }}
          >
            {appSettings.appTagline}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {currentUser.role === 'ADMIN' && (
            <button 
              onClick={onOpenAdmin}
              className="px-3 py-1.5 rounded-lg flex items-center gap-2 group transition-all duration-300 relative overflow-hidden bg-teal-900/20 border border-teal-500/50 hover:bg-teal-900/40 hover:border-teal-400 shadow-[0_0_10px_rgba(20,184,166,0.3)]"
              title="Admin Panel"
            >
              <span className="hidden sm:block text-xs font-bold text-teal-400 group-hover:text-teal-300 tracking-wide">ADMIN</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-teal-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0m-9.75 0h9.75" />
              </svg>
            </button>
          )}

          <button 
            onClick={onOpenSettings}
            className="px-3 py-1.5 rounded-lg flex items-center gap-2 group transition-all duration-300 relative overflow-hidden bg-red-900/20 border border-red-500/50 hover:bg-red-900/40 hover:border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.3)] hover:shadow-[0_0_20px_rgba(239,68,68,0.6)]"
            title="Pengaturan API Key"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <span className="hidden sm:block text-xs font-bold text-red-400 group-hover:text-red-300 tracking-wide">API SETTINGS</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-red-500 group-hover:text-red-400 animate-pulse">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
            </svg>
          </button>
          
          <div className="h-6 w-px bg-zinc-800 hidden sm:block mx-2"></div>
          
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold leading-none">{currentUser.role}</span>
              <span className="text-xs text-zinc-300 font-medium truncate max-w-[120px]">{currentUser.email}</span>
            </div>
            <button 
              onClick={onLogout}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
              title="Logout"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};