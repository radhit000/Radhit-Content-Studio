import React, { useState } from 'react';
import { authService } from '../services/authService';
import { User, AppSettings } from '../types';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
  appSettings?: AppSettings; // Optional default
}

const DEFAULT_SETTINGS: AppSettings = {
    appName: 'Radhit Studio Pro',
    appTagline: 'Bwork Digital agency & Content Studio',
    themeColor: '#C5A059',
    defaultApiKey: '',
    enableSecurity: false
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, appSettings = DEFAULT_SETTINGS }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' | 'info' } | null>(null);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const user = await authService.loginWithGoogle();
      onLoginSuccess(user);
    } catch (error: any) {
      console.error(error);
      let errorMsg = error.message || "Gagal masuk dengan Google.";
      
      // Handle specific Firebase Auth errors
      if (error.code === 'auth/network-request-failed' || error.message?.includes('network-request-failed')) {
        errorMsg = "Koneksi gagal (Network Error). Ini biasanya terjadi karena batasan browser di dalam preview. Silakan klik tombol 'Buka di Tab Baru' di bawah untuk login dengan lancar.";
      } else if (error.code === 'auth/the-service-is-currently-unavailable' || error.message?.includes('service-is-currently-unavailable')) {
        errorMsg = "Layanan Autentikasi Firebase belum aktif atau domain belum diizinkan. Silakan hubungi Admin untuk mengaktifkan 'Identity Toolkit API' dan menambahkan domain aplikasi ke 'Authorized Domains' di Firebase Console.";
      } else if (error.code === 'auth/unauthorized-domain') {
        const currentDomain = window.location.hostname;
        errorMsg = `Domain '${currentDomain}' belum terdaftar di Authorized Domains Firebase. Silakan tambahkan domain ini di Firebase Console > Authentication > Settings agar fitur Login dapat berfungsi.`;
      }

      setMessage({ 
        text: errorMsg, 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openInNewTab = () => {
    window.open(window.location.href, '_blank');
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setMessage({ text: "Email dan password wajib diisi.", type: 'error' });
      return;
    }

    setIsLoading(true);
    setMessage(null);
    try {
      const user = isRegisterMode 
        ? await authService.registerWithEmail(email, password)
        : await authService.loginWithEmail(email, password);
      onLoginSuccess(user);
    } catch (error: any) {
      console.error(error);
      let errorMsg = error.message || "Gagal melakukan autentikasi.";
      
      if (error.code === 'auth/user-not-found') {
        errorMsg = "Pengguna tidak ditemukan. Silakan daftar terlebih dahulu.";
      } else if (error.code === 'auth/wrong-password') {
        errorMsg = "Password salah.";
      } else if (error.code === 'auth/email-already-in-use') {
        errorMsg = "Email sudah digunakan oleh akun lain.";
      } else if (error.code === 'auth/weak-password') {
        errorMsg = "Password terlalu lemah (minimal 6 karakter).";
      } else if (error.code === 'auth/invalid-email') {
        errorMsg = "Format email tidak valid.";
      }

      setMessage({ text: errorMsg, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none z-0"></div>
      
      {/* Background Blobs - Dynamic Color */}
      <div 
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[100px] pointer-events-none opacity-20"
        style={{ backgroundColor: appSettings.themeColor }}
      ></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-zinc-800/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md p-8 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl relative z-10 mx-4">
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="relative group mb-8">
             <div 
               className="absolute inset-0 blur-2xl rounded-full opacity-30 group-hover:opacity-50 transition-opacity"
               style={{ backgroundColor: appSettings.themeColor }}
             ></div>
             <div 
                className="relative w-24 h-24 rounded-full flex items-center justify-center border border-white/10 bg-black shadow-2xl overflow-hidden"
             >
                <div className="absolute inset-0 bg-gradient-to-tr from-black via-zinc-900 to-zinc-800"></div>
                <span 
                  className="relative text-white font-black text-6xl serif italic"
                  style={{ color: appSettings.themeColor }}
                >
                  {appSettings.appName.charAt(0)}
                </span>
             </div>
          </div>
          
          <h1 className="text-5xl font-black text-white mb-4 serif tracking-tighter leading-none">
            {isRegisterMode ? 'Daftar Akun' : 'Selamat Datang'}
          </h1>
          <p 
            className="elegant-caps max-w-[90%] tracking-[0.3em]"
            style={{ color: appSettings.themeColor }}
          >
             {appSettings.appTagline}
          </p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg text-sm border font-light ${
            message.type === 'error' ? 'bg-red-900/10 border-red-900/50 text-red-200' : 
            message.type === 'info' ? 'bg-blue-900/10 border-blue-900/50 text-blue-200' : 
            'bg-green-900/10 border-green-900/50 text-green-200'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
          <div className="space-y-2">
            <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@contoh.com"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-teal-500 outline-none transition-all"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-teal-500 outline-none transition-all"
              required
            />
          </div>
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 elegant-caps text-xs"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : (
              isRegisterMode ? 'Daftar Sekarang' : 'Masuk'
            )}
          </button>
        </form>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-800"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-zinc-950 px-2 text-zinc-500">Atau</span>
          </div>
        </div>

        <div className="space-y-4">
          <button 
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-4 px-4 bg-white text-black font-medium rounded-xl hover:bg-zinc-100 transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 elegant-caps text-xs"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            Sign in with Google
          </button>

          <button 
            onClick={openInNewTab}
            className="w-full py-3 px-4 bg-zinc-900 text-zinc-400 font-medium rounded-xl hover:bg-zinc-800 hover:text-white transition-all border border-zinc-800 flex items-center justify-center gap-3 elegant-caps text-[10px]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
            Buka di Tab Baru (Rekomendasi)
          </button>
        </div>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsRegisterMode(!isRegisterMode)}
            className="text-xs text-zinc-400 hover:text-white transition-colors underline underline-offset-4"
          >
            {isRegisterMode ? 'Sudah punya akun? Masuk' : 'Belum punya akun? Daftar'}
          </button>
        </div>

        <div className="mt-10 pt-8 border-t border-zinc-900 text-center space-y-6">
           <p className="text-xs text-zinc-500 elegant-caps">
              Belum memiliki akses?{' '}
              <a 
                href="http://lynk.id/grappix/o7pl8d03ylpw/checkout" 
                target="_blank" 
                rel="noreferrer"
                className="hover:text-white transition-colors"
                style={{ color: appSettings.themeColor }}
              >
                Dapatkan Disini
              </a>
           </p>
           
           <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-lg p-3">
              <p className="text-xs text-zinc-500">
                <span className="font-semibold text-zinc-400">Info:</span> Gunakan email yang sama dengan email pembelian Anda.
              </p>
           </div>

           <div className="pt-8 opacity-60">
              <p className="text-[9px] elegant-caps tracking-[0.3em] mb-1">by</p>
              <p 
                className="text-[10px] font-bold tracking-widest uppercase"
                style={{ color: appSettings.themeColor }}
              >
                Bwork Digital agency & Content Studio
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};