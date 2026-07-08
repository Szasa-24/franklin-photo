'use client';

import { useState, useEffect } from 'react';
import { auth, googleAuthProvider } from '@/src/lib/firebase';
import { signInWithPopup, User } from 'firebase/auth';
import { Plus, Folder, Trash2, LogOut, Loader2, Lock, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState<{ id: number; name: string; createdAt: string }[]>([]);
  const [newSchoolName, setNewSchoolName] = useState("");
  const [newSchoolPassword, setNewSchoolPassword] = useState("");
  const [accessDenied, setAccessDenied] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [deletingSchoolId, setDeletingSchoolId] = useState<number | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<number, boolean>>({});
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      setUser(u);
      if (u) {
        setAccessDenied(false);
        fetchSchools(u);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchSchools = async (u: User) => {
    try {
      const token = await u.getIdToken();
      const res = await fetch('/api/admin/schools', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) {
        setAccessDenied(true);
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setSchools(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch (error: any) {
      console.error('Login failed', error);
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cross-origin-cookies-disabled') {
        alert("A bejelentkezés megszakadt vagy a böngésző blokkolta. Kérjük, nyissa meg az oldalt ÚJ LAPON a jobb felső sarokban található gombbal!");
      } else {
        alert("Hiba történt a bejelentkezés során: " + error.message);
      }
    }
  };

  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

  const handleLogout = () => {
    auth.signOut();
    setSchools([]);
    setAccessDenied(false);
  };

  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newSchoolName || !newSchoolPassword) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/schools', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newSchoolName, password: newSchoolPassword })
      });
      if (res.ok) {
        setNewSchoolName("");
        setNewSchoolPassword("");
        fetchSchools(user);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const confirmDeleteSchool = async (schoolId: number) => {
    if (!user) return;
    
    setIsDeleting(schoolId);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/admin/schools/${schoolId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchSchools(user);
      } else {
        console.error('Hiba történt a törlés során.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(null);
      setDeletingSchoolId(null);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-neutral-400"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  if (!user || accessDenied) {
    return (
      <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background Orbs */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-[20%] left-[20%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px]" />
          <div className="absolute bottom-[20%] right-[20%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[120px]" />
        </div>

        <div className="bg-black/40 backdrop-blur-2xl border border-white/10 p-10 rounded-[2rem] max-w-md w-full shadow-2xl text-center relative z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-[2rem] pointer-events-none" />
          
          <div className="flex justify-center mb-6 relative z-10">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Lock className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-semibold text-white mb-2 relative z-10">Adminisztráció</h1>
          <p className="text-neutral-400 text-sm mb-8 leading-relaxed relative z-10">Jelentkezz be Google fiókjával a folytatáshoz.</p>
          
          {isInIframe && (
            <div className="bg-orange-500/10 border border-orange-500/50 text-orange-400 px-4 py-4 rounded-xl mb-6 text-sm relative z-10 font-medium">
              ⚠️ Figyelem! Előnézeti módban vagy. A Google bejelentkezéshez <strong>nyisd meg az oldalt új lapon</strong> (kattints a jobb felső sarokban az Open in New Tab ikonra).
            </div>
          )}

          {accessDenied && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm relative z-10">
              Hozzáférés megtagadva. Kérjük, használjon jogosult fiókot.
            </div>
          )}
          
          <div className="space-y-4 relative z-10">
            <button 
              onClick={handleLogin}
              className="w-full bg-white text-black font-semibold py-4 rounded-2xl hover:bg-neutral-200 transition-transform active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)] flex justify-center items-center gap-3"
            >
              <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
              Google Bejelentkezés
            </button>
            <p className="text-xs text-neutral-500 text-center leading-relaxed">
              Hiba esetén (pl. azonnal eltűnő ablak) nyisd meg az oldalt <strong>Új Lapban</strong> (New Tab) a jobb felső sarokban található gombbal.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans pb-20">
      <nav className="border-b border-neutral-800 bg-neutral-900/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-medium">Franklin Photo <span className="text-neutral-500 font-light ml-2">Admin</span></div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors">
            <LogOut className="w-4 h-4" />
            Kijelentkezés
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {deletingSchoolId !== null && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-lg max-w-md w-full shadow-2xl">
              <h3 className="text-xl font-medium mb-4 text-white">Esemény törlése</h3>
              <p className="text-neutral-400 mb-8 leading-relaxed">
                Biztosan törölni szeretné ezt az eseményt? A művelet <strong>nem vonható vissza</strong>, és az összes hozzá tartozó kép véglegesen törlődik.
              </p>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setDeletingSchoolId(null)}
                  className="px-5 py-2.5 text-sm font-medium hover:bg-neutral-800 text-white rounded-md transition-colors"
                  disabled={isDeleting === deletingSchoolId}
                >
                  Mégse
                </button>
                <button 
                  onClick={() => confirmDeleteSchool(deletingSchoolId)}
                  className="px-5 py-2.5 bg-red-600 text-white text-sm font-medium hover:bg-red-500 rounded-md transition-colors disabled:opacity-50"
                  disabled={isDeleting === deletingSchoolId}
                >
                  {isDeleting === deletingSchoolId ? 'Törlés folyamatban...' : 'Igen, törlöm'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="lg:col-span-1 space-y-8">
          <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-6 shadow-xl">
            <h2 className="text-lg font-medium mb-6 flex items-center gap-2"><Plus className="w-5 h-5 text-neutral-400" /> Új Esemény</h2>
            <form onSubmit={handleCreateSchool} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Esemény / Iskola neve</label>
                <input
                  type="text"
                  value={newSchoolName}
                  onChange={(e) => setNewSchoolName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-white px-4 py-2.5 rounded-md focus:outline-none focus:border-neutral-500 transition-colors"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Kliens jelszó</label>
                <input
                  type="text"
                  value={newSchoolPassword}
                  onChange={(e) => setNewSchoolPassword(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-white px-4 py-2.5 rounded-md focus:outline-none focus:border-neutral-500 transition-colors"
                  required
                />
                <p className="text-xs text-neutral-500">A szülők/diákok ezzel a jelszóval fognak belépni.</p>
              </div>
              <button 
                type="submit" 
                className="w-full bg-white text-black font-medium py-2.5 rounded-md hover:bg-neutral-200 transition-colors mt-2"
              >
                Létrehozás
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-2xl font-light mb-8 text-white">Események Kezelése</h2>
          
          <div className="space-y-4">
            {schools.length === 0 ? (
              <div className="text-center py-16 text-neutral-500 border border-dashed border-neutral-800 rounded-lg">
                Még nincsenek létrehozott események.
              </div>
            ) : (
              schools.map(school => (
                <div key={school.id} className="bg-neutral-900 border border-neutral-800 rounded-lg p-5 flex items-center justify-between group hover:border-neutral-600 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="bg-neutral-800 p-3 rounded-md text-neutral-400">
                      <Folder className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{school.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-neutral-500">
                          Jelszó: {visiblePasswords[school.id] ? (school.passwordPlain || 'N/A') : '••••••••'}
                        </p>
                        <button 
                          onClick={() => setVisiblePasswords(prev => ({ ...prev, [school.id]: !prev[school.id] }))}
                          className="text-neutral-500 hover:text-white transition-colors"
                        >
                          {visiblePasswords[school.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </button>
                      </div>
                      <p className="text-xs text-neutral-600 mt-1">Létrehozva: {new Date(school.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link 
                      href={`/admin/school/${school.id}`}
                      className="px-4 py-2 bg-neutral-800 text-sm font-medium hover:bg-neutral-700 text-white rounded-md transition-colors"
                    >
                      Képek feltöltése
                    </Link>
                    <button 
                      onClick={() => setDeletingSchoolId(school.id)}
                      disabled={isDeleting === school.id}
                      className="text-neutral-600 hover:text-red-400 p-2 rounded-md transition-colors disabled:opacity-50"
                      title="Esemény törlése"
                    >
                      {isDeleting === school.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
