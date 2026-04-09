import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { settingsService } from '../services/settingsService';
import { User, AppSettings, UserRole } from '../types';

interface AdminDashboardProps {
  onBack: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'settings'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    appName: 'Radhit Studio Pro',
    appTagline: 'Bwork Digital agency & Content Studio',
    themeColor: '#C5A059',
    defaultApiKey: '',
    enableSecurity: false
  });
  const [saveStatus, setSaveStatus] = useState('');

  // Add User Modal State
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('USER');

  useEffect(() => {
    const loadSettings = async () => {
      const s = await settingsService.getSettings();
      setSettings(s);
    };
    loadSettings();
  }, []);

  useEffect(() => {
    const unsubscribe = authService.subscribeToAllUsers((updatedUsers) => {
      setUsers(updatedUsers);
    });
    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (uid: string, newStatus: User['status']) => {
    try {
      await authService.updateUserStatus(uid, newStatus);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await settingsService.saveSettings(settings);
      setSaveStatus('Pengaturan berhasil disimpan!');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail) return;

    try {
      await authService.createUser(newUserEmail, newUserRole, 'ACTIVE');
      setNewUserEmail('');
      setNewUserRole('USER');
      setShowAddUserModal(false);
      alert("Pengguna berhasil ditambahkan!");
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="flex-1 h-full overflow-y-auto custom-scrollbar p-4 md:p-8 animate-fade-in relative">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Admin Panel</h2>
            <p className="text-zinc-500 text-sm">Kelola pengguna dan konfigurasi aplikasi.</p>
          </div>
          <button 
            onClick={onBack}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg border border-zinc-800 text-sm transition-colors"
          >
            &larr; Kembali ke Aplikasi
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-zinc-800">
           <button 
             onClick={() => setActiveTab('users')}
             className={`pb-3 px-2 text-sm font-bold transition-colors border-b-2 ${activeTab === 'users' ? 'text-teal-400 border-teal-500' : 'text-zinc-500 border-transparent hover:text-white'}`}
           >
             Manajemen Pengguna
           </button>
           <button 
             onClick={() => setActiveTab('settings')}
             className={`pb-3 px-2 text-sm font-bold transition-colors border-b-2 ${activeTab === 'settings' ? 'text-teal-400 border-teal-500' : 'text-zinc-500 border-transparent hover:text-white'}`}
           >
             Pengaturan Aplikasi
           </button>
        </div>

        {activeTab === 'users' ? (
            <div className="flex flex-col gap-4">
               {/* Toolbar */}
               <div className="flex justify-end">
                  <button 
                    onClick={() => setShowAddUserModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-bold rounded-lg shadow-lg shadow-teal-900/20 transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                    </svg>
                    Tambah Pengguna
                  </button>
               </div>

               <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-zinc-400">
                    <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-200 uppercase text-xs font-bold tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Bergabung</th>
                        <th className="px-6 py-4">Peran</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {users.map((user) => (
                        <tr key={user.email} className="hover:bg-zinc-900/30 transition-colors">
                          <td className="px-6 py-4 font-medium text-white">
                            {user.email}
                            {user.role === 'ADMIN' && <span className="ml-2 text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/30">ADMIN</span>}
                          </td>
                          <td className="px-6 py-4">
                            {new Date(user.joinedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-6 py-4">
                            {user.role}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${
                              user.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                              user.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                              'bg-red-500/10 text-red-400 border-red-500/20'
                            }`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                                {user.status === 'PENDING' && (
                                  <button 
                                    onClick={() => handleStatusChange(user.uid!, 'ACTIVE')}
                                    className="text-xs bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-md transition-colors"
                                  >
                                    Setujui
                                  </button>
                                )}
                                {user.status === 'ACTIVE' && user.email !== 'radhit000@gmail.com' && (
                                  <button 
                                    onClick={() => handleStatusChange(user.uid!, 'INACTIVE')}
                                    className="text-xs bg-zinc-800 hover:bg-red-900/50 hover:text-red-300 text-zinc-400 px-3 py-1.5 rounded-md border border-zinc-700 transition-colors"
                                  >
                                    Nonaktifkan
                                  </button>
                                )}
                                {user.status === 'INACTIVE' && (
                                  <button 
                                    onClick={() => handleStatusChange(user.uid!, 'ACTIVE')}
                                    className="text-xs bg-zinc-800 hover:bg-green-900/50 hover:text-green-300 text-zinc-400 px-3 py-1.5 rounded-md border border-zinc-700 transition-colors"
                                  >
                                    Aktifkan
                                  </button>
                                )}
                                {user.email === 'radhit000@gmail.com' && (
                                  <span className="text-xs text-zinc-600 italic">Super Admin</span>
                                )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
        ) : (
            <div className="max-w-2xl">
               <form onSubmit={handleSaveSettings} className="space-y-6">
                  
                  {/* Branding Section */}
                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 shadow-lg">
                      <h3 className="text-lg font-bold text-white mb-4 border-b border-zinc-800 pb-2">Branding Aplikasi</h3>
                      <div className="grid gap-4">
                          <div>
                             <label className="block text-sm font-medium text-zinc-400 mb-1">Nama Aplikasi</label>
                             <input 
                                type="text" 
                                value={settings.appName} 
                                onChange={(e) => setSettings({...settings, appName: e.target.value})}
                                className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-2 text-white focus:border-teal-500 outline-none"
                             />
                          </div>
                          <div>
                             <label className="block text-sm font-medium text-zinc-400 mb-1">Tagline</label>
                             <input 
                                type="text" 
                                value={settings.appTagline} 
                                onChange={(e) => setSettings({...settings, appTagline: e.target.value})}
                                className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-2 text-white focus:border-teal-500 outline-none"
                             />
                          </div>
                          <div>
                             <label className="block text-sm font-medium text-zinc-400 mb-1">Warna Tema Utama (Hex)</label>
                             <div className="flex gap-2">
                                <input 
                                    type="color" 
                                    value={settings.themeColor} 
                                    onChange={(e) => setSettings({...settings, themeColor: e.target.value})}
                                    className="h-10 w-10 bg-transparent border-0 cursor-pointer"
                                />
                                <input 
                                    type="text" 
                                    value={settings.themeColor} 
                                    onChange={(e) => setSettings({...settings, themeColor: e.target.value})}
                                    className="flex-1 bg-black border border-zinc-700 rounded-lg px-4 py-2 text-white font-mono focus:border-teal-500 outline-none"
                                />
                             </div>
                          </div>
                      </div>
                  </div>

                  {/* System API Key Section */}
                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 shadow-lg">
                      <h3 className="text-lg font-bold text-white mb-4 border-b border-zinc-800 pb-2">Konfigurasi API Default</h3>
                      <p className="text-xs text-zinc-500 mb-4">
                        Kunci API ini akan digunakan secara otomatis oleh semua pengguna yang tidak mengatur API Key pribadi mereka.
                        Masukkan API Key dari akun Google Admin Anda di sini.
                      </p>
                      <div>
                         <label className="block text-sm font-medium text-zinc-400 mb-1">Default System API Key (Google / OpenRouter)</label>
                         <input 
                            type="password" 
                            value={settings.defaultApiKey} 
                            onChange={(e) => setSettings({...settings, defaultApiKey: e.target.value})}
                            placeholder="sk-or-v1... atau AIza..."
                            className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-2 text-white font-mono focus:border-teal-500 outline-none"
                         />
                      </div>
                  </div>

                  {/* Security Section */}
                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 shadow-lg">
                      <h3 className="text-lg font-bold text-white mb-4 border-b border-zinc-800 pb-2">Keamanan & Kompilasi</h3>
                      <div className="flex items-center justify-between">
                         <div>
                            <p className="text-sm text-white font-medium">Aktifkan Proteksi Kode (Secure Mode)</p>
                            <p className="text-xs text-zinc-500">Mencegah Klik Kanan dan Tombol Developer (F12) untuk mempersulit copy-paste kode.</p>
                         </div>
                         <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={settings.enableSecurity} 
                                onChange={(e) => setSettings({...settings, enableSecurity: e.target.checked})} 
                                className="sr-only peer" 
                            />
                            <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                         </label>
                      </div>
                  </div>

                  <div className="flex items-center gap-4">
                      <button 
                        type="submit" 
                        className="px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-zinc-200 transition-colors shadow-lg"
                      >
                        Simpan Semua Pengaturan
                      </button>
                      {saveStatus && <span className="text-green-400 text-sm animate-fade-in">{saveStatus}</span>}
                  </div>

               </form>
            </div>
        )}

        {/* Modal Add User */}
        {showAddUserModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md p-6 shadow-2xl relative">
              <h3 className="text-xl font-bold text-white mb-4">Tambah Pengguna Baru</h3>
              <form onSubmit={handleAddUser} className="space-y-4">
                <div>
                   <label className="block text-sm font-medium text-zinc-400 mb-1">Email Pengguna</label>
                   <input 
                      type="email" 
                      required
                      value={newUserEmail} 
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      placeholder="user@example.com"
                      className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-2 text-white focus:border-teal-500 outline-none"
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium text-zinc-400 mb-1">Peran (Role)</label>
                   <select 
                      value={newUserRole} 
                      onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                      className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-2 text-white focus:border-teal-500 outline-none"
                   >
                     <option value="USER">USER</option>
                     <option value="ADMIN">ADMIN</option>
                   </select>
                </div>
                <div className="flex gap-3 pt-2">
                   <button 
                     type="button" 
                     onClick={() => setShowAddUserModal(false)}
                     className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
                   >
                     Batal
                   </button>
                   <button 
                     type="submit" 
                     className="flex-1 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg shadow-lg shadow-teal-900/20 transition-colors"
                   >
                     Simpan Pengguna
                   </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};