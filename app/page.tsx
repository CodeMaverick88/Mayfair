'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  
  // Interface & Animation States
  const [currentImage, setCurrentImage] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Notification States
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [modalMessage, setModalMessage] = useState<string | null>(null);

  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Clean, beautiful descriptions that work flawlessly across all device layouts
  const slideData = [
    {
      src: '/Hotel.jpg',
      title: 'Welcome to Mayfair',
      subtitle: 'Experience warm hospitality and world-class service from the moment you arrive.'
    },
    {
      src: '/Bedroom 1.jpg',
      title: 'Luxury Guest Rooms',
      subtitle: 'Relax in beautifully designed, clean, and spacious guest suites.'
    },
    {
      src: '/Lobby.jpg',
      title: 'Premium Lounges',
      subtitle: 'Unwind or catch up on your work in our quiet, comfortable common areas.'
    },
    {
      src: '/Hotel Food.jpeg',
      title: 'Fine Dining',
      subtitle: 'Enjoy fresh, delicious meals prepared daily by our professional chefs.'
    },
    {
      src: '/Confrence Room.jpg',
      title: 'Excellent Events',
      subtitle: 'Host your business meetings, conferences, and celebrations in our modern halls.'
    },
    {
      src: '/Gym 2.jpg',
      title: 'Health & Wellness',
      subtitle: 'Keep up with your fitness routine in our fully equipped gym and relaxing spa.'
    },
    {
      src: '/Views.jpg',
      title: 'Stunning Views',
      subtitle: 'Take in beautiful city views while enjoying refreshing drinks at our rooftop lounge.'
    },
    {
      src: '/Front Desk.jpg',
      title: '24/7 Front Desk',
      subtitle: 'Our dedicated team is always available to help you with anything you need.'
    }
  ];

  // Trigger the loading bounce animation right after mount
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Faster 5-second image rotation loop
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % slideData.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slideData.length]);

  // Toast Auto-dismiss
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (name && email) {
      try {
        await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password })
        });
      } catch (error) {
        console.error("Error saving profile:", error);
      }
    }

    setToast({
      message: `Login successful! Welcome back, ${name || 'Guest'}.`,
      type: 'success'
    });

    setTimeout(() => {
      router.push('/home');
    }, 1800);
  };

  const openIntegrationModal = (provider: string) => {
    setModalMessage(`${provider} sign-in is currently being set up and will be ready soon.`);
  };

  return (
    <div className="min-h-screen lg:h-screen w-full flex flex-col lg:flex-row bg-neutral-950 overflow-y-auto lg:overflow-hidden select-none relative font-sans">
      
      {/* 1. FULL-SCREEN BACKGROUND CAROUSEL */}
      <div className="absolute inset-0 w-full h-full z-0">
        {slideData.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
              idx === currentImage ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={slide.src}
              alt={slide.title}
              className={`w-full h-full object-cover transition-transform duration-[5000ms] ease-out ${
                idx === currentImage ? 'scale-105' : 'scale-100'
              }`}
            />
          </div>
        ))}
        {/* Responsive Shaders to maximize readability across both dark and bright areas of custom images */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/70 lg:bg-gradient-to-r lg:from-black/60 lg:via-transparent lg:to-black/70 z-10" />
        <div className="absolute inset-0 bg-black/30 z-10" />
      </div>

      {/* 2. FLOATING NOTIFICATION TOAST */}
      <div 
        className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl border transition-all duration-500 ease-out transform ${
          toast 
            ? 'translate-x-0 opacity-100 scale-100 pointer-events-auto' 
            : 'translate-x-12 opacity-0 scale-95 pointer-events-none'
        } bg-white/[0.03] backdrop-blur-2xl border-white/[0.12] shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_15px_35px_rgba(0,0,0,0.6)] text-white`}
      >
        {toast?.type === 'success' && (
          <div className="w-5 h-5 rounded-full bg-[#6D001A] flex items-center justify-center border border-white/20 shadow-sm">
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
        <span className="text-sm font-medium tracking-wide">{toast?.message}</span>
      </div>

      {/* 3. POPUP MODAL WINDOW */}
      {modalMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md transition-all duration-300">
          <div className="bg-neutral-950/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Coming Soon</h3>
            <p className="text-neutral-400 text-sm leading-relaxed mb-6">{modalMessage}</p>
            <button 
              type="button" 
              onClick={() => setModalMessage(null)}
              className="w-full bg-white text-black font-semibold py-2.5 rounded-xl text-sm hover:bg-neutral-200 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* 4. BALANCED DESCRIPTION HEADER (Visible on ALL viewports) */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center lg:justify-end p-6 sm:p-10 lg:p-16 xl:p-20 relative z-20 pointer-events-none text-center lg:text-left mt-12 sm:mt-16 lg:mt-0">
        <div className="max-w-md mx-auto lg:mx-0 relative h-24 sm:h-28 lg:h-40 w-full flex flex-col justify-end">
          {slideData.map((slide, idx) => (
            <div
              key={idx}
              className={`absolute inset-x-0 bottom-0 w-full transition-all duration-1000 transform ${
                idx === currentImage
                  ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
                  : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
              }`}
            >
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-serif font-bold text-white mb-2 lg:mb-3 tracking-wide leading-tight drop-shadow-md">
                {slide.title}
              </h1>
              <p className="text-neutral-200 text-xs sm:text-sm lg:text-base font-light tracking-wide leading-relaxed drop-shadow-sm">
                {slide.subtitle}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 5. RIGHT COLUMN: BOUNCING GLASSMORPHISM LOG IN PORTAL */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative z-20 mt-4 sm:mt-6 lg:mt-0 mb-12 lg:mb-0">
        <div 
          style={{
            transition: 'all 2200ms cubic-bezier(0.16, 1.3, 0.3, 1)',
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? 'translateY(0px) scale(1)' : 'translateY(80px) scale(0.94)'
          }}
          className="w-full max-w-md bg-white/[0.02] backdrop-blur-3xl border border-white/[0.08] shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_25px_50px_-12px_rgba(0,0,0,0.8)] p-6 sm:p-8 lg:p-10 rounded-3xl"
        >
          <h2 className="text-xl sm:text-2xl font-serif font-bold mb-1 text-white tracking-wide">Hotel System Login</h2>
          <p className="text-neutral-400 text-xs mb-5 sm:mb-6 lg:mb-8 font-light tracking-wide">Please sign in to access your hotel management dashboard</p>

          <form className="space-y-3 sm:space-y-4" onSubmit={handleLoginSubmit}>
            <div>
              <label className="block text-[10px] font-semibold text-neutral-400 mb-1.5 uppercase tracking-widest">First Name</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name" 
                className="w-full bg-black/30 backdrop-blur-md border border-white/10 rounded-xl px-4 py-2.5 sm:py-3 text-sm text-white focus:outline-none focus:border-[#6D001A] focus:bg-black/50 transition-all duration-300" 
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-semibold text-neutral-400 mb-1.5 uppercase tracking-widest">Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@hotel.com" 
                className="w-full bg-black/30 backdrop-blur-md border border-white/10 rounded-xl px-4 py-2.5 sm:py-3 text-sm text-white focus:outline-none focus:border-[#6D001A] focus:bg-black/50 transition-all duration-300" 
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-semibold text-neutral-400 mb-1.5 uppercase tracking-widest">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full bg-black/30 backdrop-blur-md border border-white/10 rounded-xl pl-4 pr-12 py-2.5 sm:py-3 text-sm text-white focus:outline-none focus:border-[#6D001A] focus:bg-black/50 transition-all duration-300" 
                />
                
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-neutral-500 hover:text-white transition-colors focus:outline-none"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1">
              <button
                type="button"
                onClick={() => setRememberMe(!rememberMe)}
                className="flex items-center gap-2.5 hover:text-white transition-colors focus:outline-none bg-transparent border-none p-0 cursor-pointer text-left"
              >
                <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${
                  rememberMe 
                    ? 'bg-[#6D001A] border-[#6D001A] shadow-[0_0_8px_rgba(109,0,26,0.5)]' 
                    : 'border-white/20 bg-black/40'
                }`}>
                  {rememberMe && (
                    <svg className="w-2.5 h-2.5 text-white animate-fade-in" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span>Remember Me</span>
              </button>
              
              <button 
                type="button" 
                onClick={() => openIntegrationModal('Password recovery')}
                className="hover:text-[#6D001A] transition-colors bg-transparent border-none cursor-pointer p-0 focus:outline-none"
              >
                Forgot Password?
              </button>
            </div>

            <button 
              type="submit" 
              className="w-full bg-[#6D001A]/80 border border-white/10 text-white hover:bg-[#8A0022] font-bold py-3 rounded-xl transition-all duration-300 mt-2 shadow-lg shadow-[#6D001A]/20 tracking-wide backdrop-blur-md transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Log In
            </button>
          </form>

          <div className="my-5 flex items-center gap-4">
            <div className="h-px bg-white/10 flex-1" />
            <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-semibold">Or log in with</span>
            <div className="h-px bg-white/10 flex-1" />
          </div>

          {/* SOCIAL BUTTONS */}
          <div className="grid grid-cols-2 gap-4">
            <button 
              type="button" 
              onClick={() => openIntegrationModal('Google')}
              className="flex items-center justify-center gap-2 bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-xl py-2.5 text-sm text-white hover:bg-white/[0.07] hover:border-white/20 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Google
            </button>
            <button 
              type="button" 
              onClick={() => openIntegrationModal('Facebook')}
              className="flex items-center justify-center gap-2 bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-xl py-2.5 text-sm text-white hover:bg-white/[0.07] hover:border-white/20 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Facebook
            </button>
          </div>
          
          <div className="mt-5 text-center text-xs text-neutral-500 font-light tracking-wide">
            Don't have an account?{' '}
            <button 
              type="button"
              onClick={() => openIntegrationModal('Registration')}
              className="text-white hover:text-[#6D001A] font-medium transition-colors bg-transparent border-none p-0 cursor-pointer focus:outline-none"
            >
              Register Here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}