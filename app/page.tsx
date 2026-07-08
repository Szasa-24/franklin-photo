'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { X, ZoomIn } from 'lucide-react';

export default function LandingPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const portfolioImages = [
    "https://picsum.photos/seed/portfolio11/800/1000",
    "https://picsum.photos/seed/portfolio12/800/1000",
    "https://picsum.photos/seed/portfolio13/800/1000",
    "https://picsum.photos/seed/portfolio14/800/1000",
    "https://picsum.photos/seed/portfolio15/800/1000",
    "https://picsum.photos/seed/portfolio16/800/1000",
  ];

  return (
    <main className="min-h-screen bg-[#050505] text-white font-sans selection:bg-white/30 selection:text-white overflow-x-hidden">
      {/* Background Ambient Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-indigo-900/10 blur-[150px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-purple-900/10 blur-[150px] animate-pulse" style={{ animationDuration: '10s' }} />
      </div>

      {/* Floating iOS-style Navigation */}
      <nav className={`fixed w-full top-0 md:top-6 z-50 transition-all duration-500 ${scrolled ? 'px-2 md:px-6 py-2' : 'px-4 md:px-6 py-4'}`}>
        <div className={`max-w-4xl mx-auto rounded-full bg-[#1d1d1f]/80 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] flex items-center justify-between px-6 py-3 transition-all duration-500 ${scrolled ? 'py-2 scale-95' : 'py-3 scale-100'}`}>
          <div className="text-lg font-bold tracking-tighter text-white">
            Franklin<span className="text-white/40 font-light">Photo</span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-neutral-400">
            <a href="#portfolio" className="hover:text-white transition-colors">Portfólió</a>
            <a href="#services" className="hover:text-white transition-colors">Szolgáltatások</a>
          </div>
          <Link 
            href="/client" 
            className="text-xs md:text-sm font-semibold bg-white text-black px-5 py-2.5 rounded-full hover:scale-105 transition-transform shadow-lg"
          >
            Galéria Belépés
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[100svh] flex items-center justify-center pt-32 pb-20 px-6 z-10">
        <div className="max-w-6xl mx-auto w-full flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-20">
          <div className="flex-1 text-center lg:text-left space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-neutral-300 backdrop-blur-md mx-auto lg:mx-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              Prémium Fotózás
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5rem] font-semibold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white/90 to-white/30 leading-[1.1]">
              A te pillanatod.<br />Az én lencsém.
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-neutral-400 font-light max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Szenvedélyem a történetmesélés – képekben. Szabadúszó fotósként célom, hogy a legőszintébb formádban örökítselek meg. Legyen szó elegáns portréról vagy egy megismételhetetlen szalagavatóról, minden részletre odafigyelek.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start">
              <Link 
                href="/client" 
                className="inline-flex justify-center items-center gap-2 bg-white text-black px-8 py-4 rounded-full text-sm font-semibold hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.15)]"
              >
                Privát Galéria
              </Link>
              <a 
                href="#portfolio" 
                className="inline-flex justify-center items-center gap-2 bg-white/5 border border-white/10 text-white px-8 py-4 rounded-full text-sm font-medium hover:bg-white/10 transition-colors backdrop-blur-md"
              >
                Munkáim
              </a>
            </div>
          </div>
          
          <div className="flex-1 w-full relative max-w-md lg:max-w-none mx-auto animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
            <div className="relative aspect-[3/4] sm:aspect-[4/5] rounded-[2rem] sm:rounded-[3rem] overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] group">
              <Image
                src="https://picsum.photos/seed/franklin22/800/1000"
                alt="Franklin Photo Studio"
                fill
                className="object-cover transition-transform duration-[2000ms] group-hover:scale-110"
                referrerPolicy="no-referrer"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-transparent" />
              
              {/* Glassy Overlay Card on Image */}
              <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8 sm:right-8 bg-[#1d1d1f]/60 backdrop-blur-2xl border border-white/10 p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-2xl transition-transform duration-500 hover:-translate-y-2">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-medium text-white">Professzionális Minőség</div>
                    <div className="text-[10px] sm:text-xs text-neutral-400 mt-0.5">Kompromisszumok nélkül</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Bento Grid (Apple Style) */}
      <section id="services" className="py-24 px-4 sm:px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tighter text-white">Szolgáltatásaim</h2>
            <p className="text-neutral-400 font-light text-base sm:text-lg max-w-2xl mx-auto px-4">Minden fotózásra egyedi projektként tekintek, hogy a végeredmény tökéletes legyen.</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Feature - 2 columns */}
            <div className="lg:col-span-2 group rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-b from-white/10 to-transparent p-[1px] transition-transform duration-500 hover:scale-[1.02]">
              <div className="h-full rounded-[2rem] sm:rounded-[2.5rem] bg-[#121212]/80 backdrop-blur-3xl overflow-hidden relative flex flex-col justify-between">
                <div className="p-6 sm:p-8 md:p-10 relative z-10 max-w-xl">
                  <h3 className="text-2xl sm:text-3xl font-semibold text-white mb-4">Iskolafotózás & Szalagavató</h3>
                  <p className="text-neutral-400 leading-relaxed text-sm sm:text-base md:text-lg">
                    Több száz fős rendezvények professzionális lebonyolítása. Bár a fókusz az én kezemben van, a nagy eseményeken összeszokott stábbal dolgozom. A képeket azonnal, egy zárt, kiemelkedő biztonsággal védett privát galériába töltjük fel.
                  </p>
                </div>
                <div className="relative h-48 sm:h-64 md:h-80 w-full mt-4 sm:mt-6">
                  <Image 
                    src="https://picsum.photos/seed/school12/1000/600" 
                    alt="Szalagavató fotózás" 
                    fill 
                    className="object-cover object-top transition-transform duration-[2000ms] group-hover:scale-110 group-hover:translate-y-4" 
                    referrerPolicy="no-referrer" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/40 to-transparent" />
                </div>
              </div>
            </div>
            
            {/* Secondary Feature - 1 column */}
            <div className="lg:col-span-1 rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-b from-white/10 to-transparent p-[1px] transition-transform duration-500 hover:scale-[1.02]">
              <div className="h-full rounded-[2rem] sm:rounded-[2.5rem] bg-[#121212]/80 backdrop-blur-3xl p-6 sm:p-8 md:p-10 flex flex-col">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 mb-6 sm:mb-8 shrink-0">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-white mb-3 sm:mb-4">Portré & Fashion</h3>
                <p className="text-neutral-400 leading-relaxed flex-grow text-sm sm:text-base">
                  Szeretem megtalálni a legelőnyösebb szögeket és fényeket. Egy jó portré nem csak szép, hanem karakteres is. Hozzuk ki belőled a maximumot egy exkluzív fotózás keretében.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Gallery (Responsive Grid) */}
      <section id="portfolio" className="py-24 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tighter text-white mb-4">Munkáim</h2>
          <p className="text-neutral-400 font-light text-base sm:text-lg">Néhány pillanat, amire büszke vagyok.</p>
        </div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {portfolioImages.map((src, i) => (
              <div 
                key={i} 
                className="relative rounded-[2rem] overflow-hidden group shadow-2xl bg-[#121212]/80 border border-white/5 aspect-[4/5] cursor-pointer"
                onClick={() => setSelectedImage(src)}
              >
                <Image
                  src={src}
                  alt={`Portfolio munka ${i + 1}`}
                  fill
                  className="object-cover transition-transform duration-[2000ms] group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center backdrop-blur-[2px]">
                  <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500 flex items-center gap-2 bg-black/50 px-5 py-2.5 rounded-full border border-white/20">
                    <ZoomIn className="w-4 h-4 text-white" />
                    <span className="text-white text-xs sm:text-sm font-medium tracking-widest uppercase">Megtekintés</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 mt-12 border-t border-white/10 flex flex-col items-center gap-6 text-sm text-neutral-500 font-light z-10 relative">
        <div className="text-2xl font-bold tracking-tighter text-white/20 mb-2">Franklin<span className="font-light">Photo</span></div>
        <p className="text-center px-4">© {new Date().getFullYear()} Franklin. Minden jog fenntartva.</p>
        <Link href="/admin" className="text-neutral-600 hover:text-white transition-colors text-xs flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/5 hover:border-white/20">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Adminisztráció
        </Link>
      </footer>

      {/* Lightbox */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-300"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImage(null);
            }}
          >
            <X className="w-6 h-6" />
          </button>
          <div 
            className="relative w-full max-w-5xl aspect-[3/4] sm:aspect-auto sm:h-[85vh] rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={selectedImage}
              alt="Kiválasztott fotó"
              fill
              className="object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}
    </main>
  );
}
