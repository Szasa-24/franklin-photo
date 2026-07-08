'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Download, Lock, ChevronDown } from 'lucide-react';
import Link from 'next/link';

export default function ClientZone() {
  const [schools, setSchools] = useState<{ id: number; name: string }[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [activeSchoolName, setActiveSchoolName] = useState<string>('');
  const [photos, setPhotos] = useState<{ id: number; thumbnailPath: string; originalPath: string; filename: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    // Check if token exists
    const storedToken = localStorage.getItem('clientToken');
    const storedSchool = localStorage.getItem('clientSchoolName');
    if (storedToken) {
      setToken(storedToken);
      if (storedSchool) setActiveSchoolName(storedSchool);
    }
    
    // Fetch schools
    fetch('/api/client/schools')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setSchools(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (token) {
      fetch('/api/client/gallery', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Unauthorized');
      })
      .then(data => {
        if (Array.isArray(data)) setPhotos(data);
      })
      .catch(() => {
        handleLogout();
      });
    }
  }, [token]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!selectedSchool || !password) return;

    try {
      const res = await fetch('/api/client/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schoolId: selectedSchool, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || 'Hibás jelszó');
        return;
      }
      setToken(data.token);
      setActiveSchoolName(data.school.name);
      localStorage.setItem('clientToken', data.token);
      localStorage.setItem('clientSchoolName', data.school.name);
    } catch (err) {
      setLoginError('Hiba történt a bejelentkezés során.');
    }
  };

  const handleLogout = () => {
    setToken(null);
    setPhotos([]);
    setActiveSchoolName('');
    localStorage.removeItem('clientToken');
    localStorage.removeItem('clientSchoolName');
  };

  if (loading) {
    return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">Betöltés...</div>;
  }

  if (!token) {
    return (
      <main className="min-h-screen bg-[#000000] flex flex-col items-center justify-center font-sans px-4 relative overflow-hidden">
        {/* Background Orbs */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-[20%] right-[20%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px]" />
          <div className="absolute bottom-[20%] left-[20%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[120px]" />
        </div>
        
        <div className="w-full max-w-md bg-black/40 backdrop-blur-2xl border border-white/10 p-10 rounded-[2rem] relative z-10 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-[2rem] pointer-events-none" />
          
          <div className="flex justify-center mb-6 relative z-10">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Lock className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-semibold text-center text-white mb-2 relative z-10">Privát Galéria</h1>
          <p className="text-neutral-400 text-sm text-center mb-8 leading-relaxed relative z-10">Válaszd ki az eseményt és add meg a kapott jelszót.</p>
          
          <form onSubmit={handleLogin} className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider pl-1">Intézmény / Esemény</label>
              <div className="relative">
                <select
                  value={selectedSchool}
                  onChange={(e) => setSelectedSchool(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white px-5 py-4 rounded-xl appearance-none focus:outline-none focus:border-white/30 transition-colors disabled:opacity-50"
                  required
                  disabled={schools.length === 0}
                >
                  <option value="" disabled className="bg-neutral-900">
                    {schools.length === 0 ? "Jelenleg nincs elérhető esemény" : "Válasszon..."}
                  </option>
                  {schools.map(s => (
                    <option key={s.id} value={s.id} className="bg-neutral-900">{s.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 pointer-events-none" />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider pl-1">Jelszó</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-white px-5 py-4 rounded-xl focus:outline-none focus:border-white/30 transition-colors placeholder-neutral-600"
                placeholder="••••••••"
                required
              />
            </div>

            {loginError && <div className="text-red-400 text-sm text-center bg-red-500/10 py-2 rounded-lg">{loginError}</div>}
            
            <button type="submit" className="w-full bg-white text-black font-semibold py-4 rounded-xl hover:bg-neutral-200 transition-transform active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              Belépés a Galériába
            </button>
          </form>
        </div>
        
        <div className="mt-12 relative z-10 text-center">
            <Link href="/" className="text-neutral-500 hover:text-neutral-300 text-sm transition-colors">Vissza a főoldalra</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 font-sans">
      <nav className="fixed w-full top-0 z-50 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="text-xl font-medium tracking-tight">Franklin Photo | <span className="text-neutral-400 font-light">{activeSchoolName}</span></div>
          <div className="flex gap-4">
            <a href={`/api/client/download?token=${token}`} className="flex items-center gap-2 text-sm font-medium bg-white text-black px-4 py-2 hover:bg-neutral-200 transition-colors">
              <Download className="w-4 h-4" />
              Teljes album letöltése (ZIP)
            </a>
            <button onClick={handleLogout} className="text-sm text-neutral-400 hover:text-white transition-colors">Kilépés</button>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        {photos.length === 0 ? (
          <div className="text-center text-neutral-500 py-20">Még nincsenek feltöltött képek ehhez az eseményhez.</div>
        ) : (
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {photos.map((photo) => (
              <div key={photo.id} className="break-inside-avoid relative group overflow-hidden bg-neutral-900 border border-neutral-800">
                <Image
                  src={photo.thumbnailPath}
                  alt={photo.filename}
                  width={600}
                  height={800} // Placeholder height
                  className="w-full h-auto object-cover"
                  unoptimized // since we serve local dynamic files
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <a href={photo.originalPath} download={photo.filename} target="_blank" rel="noreferrer" className="bg-white text-black p-3 rounded-full hover:scale-105 transition-transform">
                    <Download className="w-5 h-5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
