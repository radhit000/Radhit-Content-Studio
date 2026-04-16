import React from 'react';
import { AppSettings } from '../types';

interface PendingApprovalProps {
  onLogout: () => void;
  appSettings: AppSettings;
  status: 'PENDING' | 'INACTIVE';
}

export const PendingApproval: React.FC<PendingApprovalProps> = ({ onLogout, appSettings, status }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none z-0"></div>
      
      <div 
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[100px] pointer-events-none opacity-20"
        style={{ backgroundColor: appSettings.themeColor }}
      ></div>

      <div className="w-full max-w-md p-8 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl relative z-10 mx-4 text-center">
        <div className="mb-8 flex flex-col items-center">
          <div className="relative w-20 h-20 rounded-full flex items-center justify-center border border-white/10 bg-black shadow-2xl mb-6">
             <div className="absolute inset-0 bg-gradient-to-tr from-black via-zinc-900 to-zinc-800 rounded-full"></div>
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-amber-500 relative z-10">
               <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
             </svg>
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-4 serif tracking-tight">
            {status === 'PENDING' ? 'Menunggu Persetujuan' : 'Akun Dinonaktifkan'}
          </h2>
          
          <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
            {status === 'PENDING' 
              ? 'Akun Anda telah berhasil terdaftar, namun memerlukan persetujuan dari Admin sebelum dapat mengakses fitur aplikasi. Silakan hubungi Admin untuk aktivasi.'
              : 'Akun Anda saat ini sedang dinonaktifkan oleh Admin. Silakan hubungi dukungan jika Anda merasa ini adalah kesalahan.'}
          </p>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 mb-8 w-full">
             <p className="text-xs text-zinc-500 mb-2 uppercase tracking-widest font-bold">Hubungi Admin</p>
             <a 
               href="https://wa.me/6281234567890" 
               target="_blank" 
               rel="noreferrer"
               className="text-sm font-bold hover:underline"
               style={{ color: appSettings.themeColor }}
             >
               WhatsApp Admin Support
             </a>
          </div>

          <button 
            onClick={onLogout}
            className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-xl transition-all border border-zinc-800 elegant-caps text-xs"
          >
            Keluar & Gunakan Akun Lain
          </button>
        </div>
      </div>
    </div>
  );
};
