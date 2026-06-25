'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// ─── Types ────────────────────────────────────────────────────────────────────

interface StoredUser {
  name: string;
  email: string;
  password: string;
  country?: string;
  phone?: string;
  createdAt: number;
}

interface ToastState {
  message: string;
  subtext?: string;
}

type SocialModalType = 'Google' | 'Instagram' | 'Forgot' | null;

// ─── Slide Data ───────────────────────────────────────────────────────────────

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

// ─── Storage Helpers ──────────────────────────────────────────────────────────

const STORAGE_KEYS = {
  USERS: 'mayfair_users',
  REMEMBERED: 'mayfair_remembered_name',
  USER_NAME: 'mayfair_user_name',
};

function getAllUsers(): StoredUser[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  } catch {
    return [];
  }
}

function saveUser(user: StoredUser): void {
  const users = getAllUsers();
  const existingIdx = users.findIndex(
    (u) => u.email.toLowerCase() === user.email.toLowerCase()
  );
  if (existingIdx >= 0) {
    users[existingIdx] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

function findUserByName(name: string): StoredUser | null {
  const users = getAllUsers();
  return (
    users.find((u) => u.name.toLowerCase() === name.toLowerCase()) || null
  );
}

function getNameSuggestions(query: string): string[] {
  if (!query.trim()) return [];
  const users = getAllUsers();
  const q = query.toLowerCase();
  return users
    .filter((u) => u.name.toLowerCase().startsWith(q))
    .map((u) => u.name)
    .slice(0, 5);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter();

  // — Carousel
  const [isMounted, setIsMounted] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  // responsive small check
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  // — Mode
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // — UI state
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [socialModal, setSocialModal] = useState<SocialModalType>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  // — Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState('');
  const [phone, setPhone] = useState('');

  // — Autocomplete
  const [nameSuggestions, setNameSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // — Login-mode auto-fill
  const [loginAutoFilled, setLoginAutoFilled] = useState(false);
  const [loginUser, setLoginUser] = useState<StoredUser | null>(null);

  // ── Responsive setup ────────────────────────────────────────────────────────
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setIsSmallScreen(w < 1024); // matches lg breakpoint
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // ── Mount + carousel ───────────────────────────────────────────────────────

  useEffect(() => {
    setIsMounted(true);
    // Pre-fill remembered name
    const remembered = localStorage.getItem(STORAGE_KEYS.REMEMBERED);
    if (remembered) {
      setName(remembered);
      setRememberMe(true);
      // Check if this user is stored
      const found = findUserByName(remembered);
      if (found) {
        setLoginUser(found);
        setLoginAutoFilled(true);
      }
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % slideData.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // ── Name autocomplete ───────────────────────────────────────────────────────

  const handleNameChange = useCallback(
    (value: string) => {
      setName(value);
      setLoginAutoFilled(false);
      setLoginUser(null);

      if (!isRegisterMode) {
        const suggestions = getNameSuggestions(value);
        setNameSuggestions(suggestions);
        setShowSuggestions(suggestions.length > 0 && value.length > 0);
        setActiveSuggestion(-1);

        // Exact match auto-fill
        const exact = findUserByName(value);
        if (exact) {
          setLoginUser(exact);
          setLoginAutoFilled(true);
        }
      }
    },
    [isRegisterMode]
  );

  const handleSelectSuggestion = (suggestedName: string) => {
    setName(suggestedName);
    setShowSuggestions(false);
    setActiveSuggestion(-1);
    const found = findUserByName(suggestedName);
    if (found) {
      setLoginUser(found);
      setLoginAutoFilled(true);
    }
    nameInputRef.current?.focus();
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestion((prev) =>
        prev < nameSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestion((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && activeSuggestion >= 0) {
      e.preventDefault();
      handleSelectSuggestion(nameSuggestions[activeSuggestion]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        nameInputRef.current &&
        !nameInputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Mode switch ─────────────────────────────────────────────────────────────

  const switchMode = () => {
    setIsRegisterMode((prev) => !prev);
    setName('');
    setEmail('');
    setPassword('');
    setCountry('');
    setPhone('');
    setNameSuggestions([]);
    setShowSuggestions(false);
    setLoginAutoFilled(false);
    setLoginUser(null);
    setShowPassword(false);
  };

  // ── Save to Neon DB via API ──────────────────────────────────────────────────
  // Client-side helper that calls our server route. We keep this call non-blocking to preserve the UX.

  async function saveUserToDb(user: StoredUser) {
    try {
      const res = await fetch('/api/save-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error('DB save failed', text);
        setToast({
          message: 'Saved locally — DB failed',
          subtext: 'Account saved locally but failed to save to DB.',
        });
      } else {
        setToast({
          message: 'Account saved to Neon',
          subtext: 'Stored securely in your Postgres database.',
        });
      }
    } catch (err) {
      console.error('DB error', err);
      setToast({
        message: 'Saved locally — DB error',
        subtext: 'Could not reach the server to save account.',
      });
    } finally {
      setTimeout(() => setToast(null), 2500);
    }
  }

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isRegisterMode) {
      // ── Register
      const newUser: StoredUser = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        country: country.trim(),
        phone: phone.trim(),
        createdAt: Date.now(),
      };

      setToast({
        message: 'Saving account...',
        subtext: 'Please wait while we set up your login profile.',
      });

      setTimeout(() => {
        saveUser(newUser); // local storage (unchanged)
        // NEW: also persist to Neon (server)
        saveUserToDb(newUser);

        if (rememberMe) {
          localStorage.setItem(STORAGE_KEYS.REMEMBERED, newUser.name);
        } else {
          localStorage.removeItem(STORAGE_KEYS.REMEMBERED);
        }
        setToast({
          message: 'Account Created Successfully!',
          subtext: `Your email (${email}) has been registered.`,
        });
      }, 700);

      setTimeout(() => {
        localStorage.setItem(STORAGE_KEYS.USER_NAME, name.trim());
        setToast({
          message: `Welcome, ${name.trim() || 'User'}!`,
          subtext: 'Opening your home dashboard now...',
        });
        try {
          router.push('/home');
        } catch {
          window.location.href = '/home';
        }
      }, 1400);
    } else {
      // ── Login
      const found = loginUser || findUserByName(name.trim());

      if (!found) {
        setToast({
          message: 'Name not recognised',
          subtext: 'No account found with that name. Please register first.',
        });
        setTimeout(() => setToast(null), 3000);
        return;
      }

      // If auto-filled (recognised user), skip password check — just log in
      if (!loginAutoFilled && password && found.password !== password) {
        setToast({
          message: 'Incorrect password',
          subtext: 'Please check your password and try again.',
        });
        setTimeout(() => setToast(null), 3000);
        return;
      }

      if (rememberMe) {
        localStorage.setItem(STORAGE_KEYS.REMEMBERED, found.name);
      } else {
        localStorage.removeItem(STORAGE_KEYS.REMEMBERED);
      }

      localStorage.setItem(STORAGE_KEYS.USER_NAME, found.name);
      setToast({
        message: `Welcome back, ${found.name}!`,
        subtext: 'Taking you to the home page...',
      });

      setTimeout(() => {
        try {
          router.push('/home');
        } catch {
          window.location.href = '/home';
        }
      }, 800);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen lg:h-screen w-full flex flex-col lg:flex-row bg-neutral-950 overflow-y-auto lg:overflow-hidden select-none relative font-sans text-white">

      {/* ── Global Styles ── */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes premiumSpringBounce {
            0%   { opacity: 0; transform: scale(0.93) translateY(40px); }
            50%  { transform: scale(1.015) translateY(-2px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
          }
          @keyframes toastSlideIn {
            0%   { opacity: 0; transform: translateX(100px) scale(0.9); }
            100% { opacity: 1; transform: translateX(0) scale(1); }
          }
          @keyframes suggestionFadeIn {
            0%   { opacity: 0; transform: translateY(-6px) scale(0.98); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
          }
          @keyframes autofillPulse {
            0%   { box-shadow: 0 0 0 0 rgba(109,0,26,0.4); }
            70%  { box-shadow: 0 0 0 8px rgba(109,0,26,0); }
            100% { box-shadow: 0 0 0 0 rgba(109,0,26,0); }
          }
          .premium-bounce    { animation: premiumSpringBounce 700ms cubic-bezier(0.34,1.56,0.64,1) forwards; }
          .toast-slide       { animation: toastSlideIn 450ms cubic-bezier(0.16,1,0.3,1) forwards; }
          .suggestions-enter { animation: suggestionFadeIn 250ms cubic-bezier(0.16,1,0.3,1) forwards; }
          .autofill-pulse    { animation: autofillPulse 600ms ease-out; }
          .suggestion-item:hover { background: rgba(109,0,26,0.25); }
          input:-webkit-autofill,
          input:-webkit-autofill:hover,
          input:-webkit-autofill:focus {
            -webkit-text-fill-color: white;
            -webkit-box-shadow: 0 0 0px 1000px rgba(0,0,0,0.7) inset;
            transition: background-color 5000s ease-in-out 0s;
          }
        `
      }} />

      {/* ── Background Carousel ── */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        {slideData.map((slide, idx) => {
          const isActive = idx === currentImage;
          const imgScale = isActive ? (isSmallScreen ? 1.06 : 1.14) : 1.0;
          return (
            <div
              key={idx}
              className="absolute inset-0 w-full h-full"
              style={{
                opacity: isActive ? 1 : 0,
                zIndex: isActive ? 10 : 0,
                transition: 'opacity 1500ms ease-in-out',
              }}
            >
              <img
                src={slide.src}
                alt={slide.title}
                className="w-full h-full object-cover"
                style={{
                  transform: isActive ? `scale(${imgScale})` : 'scale(1.00)',
                  transition: isActive ? 'transform 5000ms ease-out' : 'none',
                }}
              />
            </div>
          );
        })}
        <div
          className="absolute inset-0 z-10"
          style={{
            background: isSmallScreen
              ? 'linear-gradient(to bottom, rgba(0,0,0,0.24), rgba(0,0,0,0.08))'
              : 'linear-gradient(to bottom, rgba(0,0,0,0.60), rgba(0,0,0,0.20), rgba(0,0,0,0.80))'
          }}
        />
        <div
          className="absolute inset-0 z-10"
          style={{
            backgroundColor: isSmallScreen ? 'rgba(0,0,0,0.10)' : 'rgba(0,0,0,0.30)'
          }}
        />
      </div>

      {/* ── Toast Notification ── */}
      {toast && (
        <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 flex items-center gap-4 px-5 sm:px-6 py-3 sm:py-4 rounded-2xl border bg-neutral-900/80 backdrop-blur-3xl border-white/[0.15] shadow-[0_25px_50px_rgba(0,0,0,0.8)] max-w-[calc(100vw-2rem)] sm:max-w-sm toast-slide">
          <div className="w-6 h-6 rounded-full bg-[#6D001A] flex items-center justify-center border border-white/20 shrink-0">
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold tracking-wide text-white truncate">{toast.message}</span>
            {toast.subtext && (
              <span className="text-[11px] text-neutral-400 mt-0.5 leading-tight truncate">{toast.subtext}</span>
            )}
          </div>
        </div>
      )}

      {/* ── Left Column: Carousel Text ── */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center lg:justify-end p-6 sm:p-10 lg:p-16 xl:p-20 relative z-20 pointer-events-none text-center lg:text-left mt-16 sm:mt-24 lg:mt-0">
        <div className="max-w-md mx-auto lg:mx-0 relative h-32 sm:h-24 lg:h-36 w-full flex flex-col justify-end">
          {slideData.map((slide, idx) => {
            const isActive = idx === currentImage;
            return (
              <div
                key={idx}
                className="absolute inset-x-0 bottom-0 w-full"
                style={{
                  opacity: isActive ? 1 : 0,
                  transform: isActive ? 'translateY(0px) scale(1)' : 'translateY(25px) scale(0.94)',
                  transition: 'all 900ms cubic-bezier(0.16,1,0.3,1)',
                }}
              >
                <h1 className="text-3xl sm:text-4xl xl:text-5xl font-serif font-bold text-white mb-2 tracking-wide drop-shadow-2xl">
                  {slide.title}
                </h1>
                <p className="text-neutral-300 text-xs sm:text-sm font-light tracking-wide max-w-sm mx-auto lg:mx-0 drop-shadow-lg">
                  {slide.subtitle}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Right Column: Auth Card ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-3 sm:p-6 lg:p-8 relative z-20 mt-2 sm:mt-6 lg:mt-0 mb-12 lg:mb-0">
        {isMounted && (
          <div
            key={isRegisterMode ? 'register-card' : 'login-card'}
            className="w-full max-w-md bg-white/[0.02] backdrop-blur-3xl border border-white/[0.09] shadow-[0_35px_70px_-15px_rgba(0,0,0,0.95)] p-5 sm:p-8 lg:p-10 rounded-3xl premium-bounce"
          >

            {/* ── Card Header ── */}
            <div className="mb-5 sm:mb-7">
              <h2 className="text-xl sm:text-2xl font-serif font-bold mb-1 tracking-wide">
                {isRegisterMode ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-neutral-400 text-[11px] sm:text-xs font-light tracking-wide leading-relaxed">
                {isRegisterMode
                  ? 'Fill in your details below to create your hotel account.'
                  : loginAutoFilled && loginUser
                    ? `Hello, ${loginUser.name} — tap Log In to continue.`
                    : 'Type your name to sign in, or start typing for suggestions.'}
              </p>

              {/* Auto-fill greeting badge */}
              {!isRegisterMode && loginAutoFilled && loginUser && (
                <div className="mt-3 flex items-center gap-2.5 bg-[#6D001A]/20 border border-[#6D001A]/40 rounded-xl px-3.5 py-2.5 autofill-pulse">
                  <div className="w-7 h-7 rounded-full bg-[#6D001A]/60 border border-white/20 flex items-center justify-center shrink-0 text-[11px] font-bold uppercase">
                    {loginUser.name.charAt(0)}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-semibold text-white truncate">{loginUser.name}</span>
                    <span className="text-[10px] text-neutral-400 truncate">{loginUser.email}</span>
                  </div>
                  <div className="ml-auto shrink-0">
                    <svg className="w-3.5 h-3.5 text-[#6D001A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}
            </div>

            {/* ── Form ── */}
            <form className="space-y-3" onSubmit={handleAuthSubmit}>

              {/* Name field with autocomplete */}
              <div className="relative">
                <label className="block text-[9px] font-bold text-neutral-400 mb-1 uppercase tracking-widest">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    ref={nameInputRef}
                    type="text"
                    required
                    autoComplete="off"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    onKeyDown={handleNameKeyDown}
                    onFocus={() => {
                      if (!isRegisterMode && nameSuggestions.length > 0) {
                        setShowSuggestions(true);
                      }
                    }}
                    placeholder={isRegisterMode ? 'Enter your full name' : 'Type your name...'}
                    className={`w-full bg-black/50 border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:bg-black/70 transition-all duration-300 pr-9 ${
                      loginAutoFilled
                        ? 'border-[#6D001A]/60 focus:border-[#6D001A]'
                        : 'border-white/10 focus:border-[#6D001A]'
                    }`}
                  />
                  {/* Clear button */}
                  {name && (
                    <button
                      type="button"
                      onClick={() => {
                        setName('');
                        setLoginAutoFilled(false);
                        setLoginUser(null);
                        setNameSuggestions([]);
                        setShowSuggestions(false);
                        nameInputRef.current?.focus();
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-neutral-600 hover:text-white transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Suggestions dropdown */}
                {showSuggestions && !isRegisterMode && (
                  <div
                    ref={suggestionsRef}
                    className="absolute top-full left-0 right-0 mt-1.5 bg-neutral-900/95 backdrop-blur-2xl border border-white/[0.12] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.9)] z-50 suggestions-enter"
                  >
                    <div className="px-3 pt-2.5 pb-1.5">
                      <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">
                        Registered accounts
                      </span>
                    </div>
                    {nameSuggestions.map((suggestion, idx) => {
                      const isHighlighted = idx === activeSuggestion;
                      const matchLen = name.length;
                      return (
                        <button
                          key={suggestion}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleSelectSuggestion(suggestion);
                          }}
                          className={`suggestion-item w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all duration-150 ${
                            isHighlighted ? 'bg-[#6D001A]/25' : ''
                          }`}
                        >
                          <div className="w-7 h-7 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center shrink-0 text-[11px] font-bold uppercase text-neutral-300">
                            {suggestion.charAt(0)}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs text-white font-medium truncate">
                              <span className="text-[#6D001A] font-bold">
                                {suggestion.slice(0, matchLen)}
                              </span>
                              {suggestion.slice(matchLen)}
                            </span>
                            <span className="text-[10px] text-neutral-500 truncate">
                              Registered account
                            </span>
                          </div>
                          {isHighlighted && (
                            <div className="ml-auto shrink-0">
                              <svg className="w-3 h-3 text-[#6D001A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          )}
                        </button>
                      );
                    })}
                    <div className="px-3 py-2 border-t border-white/[0.06]">
                      <span className="text-[9px] text-neutral-600">
                        ↑↓ navigate · Enter to select · Esc to close
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Register-only fields ── */}
              {isRegisterMode && (
                <>
                  <div>
                    <label className="block text-[9px] font-bold text-neutral-400 mb-1 uppercase tracking-widest">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@hotel.com"
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#6D001A] focus:bg-black/70 transition-all duration-300"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-bold text-neutral-400 mb-1 uppercase tracking-widest">
                        Country
                      </label>
                      <input
                        type="text"
                        required
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="Kenya"
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#6D001A] focus:bg-black/70 transition-all duration-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-neutral-400 mb-1 uppercase tracking-widest">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+254..."
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#6D001A] focus:bg-black/70 transition-all duration-300"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* ── Password ──
                  Register: always shown
                  Login: shown only if NOT auto-filled (i.e. user typed unknown name or partial) ── */}
              {(isRegisterMode || !loginAutoFilled) && (
                <div>
                  <label className="block text-[9px] font-bold text-neutral-400 mb-1 uppercase tracking-widest">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required={isRegisterMode}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-black/50 border border-white/10 rounded-xl pl-4 pr-12 py-2.5 text-xs text-white focus:outline-none focus:border-[#6D001A] focus:bg-black/70 transition-all duration-300"
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
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {!isRegisterMode && (
                    <p className="text-[10px] text-neutral-600 mt-1 leading-tight">
                      Optional if your name is already recognised above.
                    </p>
                  )}
                </div>
              )}

              {/* ── Remember Me + Forgot Password ── */}
              <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1">
                <button
                  type="button"
                  onClick={() => setRememberMe(!rememberMe)}
                  className="flex items-center gap-2.5 hover:text-white transition-colors focus:outline-none cursor-pointer"
                >
                  <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center shrink-0 ${rememberMe ? 'bg-[#6D001A] border-[#6D001A]' : 'border-white/20 bg-black/50'}`}>
                    {rememberMe && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span>Remember Me</span>
                </button>

                {!isRegisterMode && (
                  <button
                    type="button"
                    onClick={() => setSocialModal('Forgot')}
                    className="hover:text-[#6D001A] transition-colors focus:outline-none"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>

              {/* ── Submit button ── */}
              <button
                type="submit"
                className="w-full bg-[#6D001A] border border-white/10 text-white hover:bg-[#8A0022] active:scale-[0.98] font-bold py-3 rounded-xl transition-all duration-300 mt-2 shadow-lg shadow-[#6D001A]/30 tracking-wide text-xs uppercase"
              >
                {isRegisterMode ? 'Register Now' : loginAutoFilled ? `Continue as ${loginUser?.name?.split(' ')[0]}` : 'Log In'}
              </button>
            </form>

            {/* ── Divider ── */}
            <div className="my-4 sm:my-5 flex items-center gap-4">
              <div className="h-px bg-white/10 flex-1" />
              <span className="text-[8px] text-neutral-500 uppercase tracking-widest font-bold whitespace-nowrap">
                Or Sign In With
              </span>
              <div className="h-px bg-white/10 flex-1" />
            </div>

            {/* ── Social Buttons ── */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => setSocialModal('Google')}
                className="flex items-center justify-center gap-2 bg-white/[0.02] border border-white/10 rounded-xl py-2.5 text-xs text-white hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300 transform hover:-translate-y-0.5 font-medium"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
              <button
                type="button"
                onClick={() => setSocialModal('Instagram')}
                className="flex items-center justify-center gap-2 bg-white/[0.02] border border-white/10 rounded-xl py-2.5 text-xs text-white hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300 transform hover:-translate-y-0.5 font-medium"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                  <defs>
                    <linearGradient id="ig" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f09433"/>
                      <stop offset="25%" stopColor="#e6683c"/>
                      <stop offset="50%" stopColor="#dc2743"/>
                      <stop offset="75%" stopColor="#cc2366"/>
                      <stop offset="100%" stopColor="#bc1888"/>
                    </linearGradient>
                  </defs>
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="url(#ig)"/>
                  <path d="M12 7a5 5 0 100 10A5 5 0 0012 7zm0 8.2a3.2 3.2 0 110-6.4 3.2 3.2 0 010 6.4z" fill="white"/>
                  <circle cx="17.5" cy="6.5" r="1.2" fill="white"/>
                </svg>
                Instagram
              </button>
            </div>

            {/* ── Mode Switch ── */}
            <div className="mt-5 sm:mt-6 text-center text-xs text-neutral-400 font-light tracking-wide">
              {isRegisterMode ? 'Already have an account? ' : "Don't have an account? "}
              <button
                type="button"
                onClick={switchMode}
                className="text-white hover:text-[#6D001A] font-semibold underline underline-offset-4 transition-colors focus:outline-none"
              >
                {isRegisterMode ? 'Login Here' : 'Register Here'}
              </button>
            </div>

          </div>
        )}
      </div>

      {/* ── Social / Forgot Modal ── */}
      {socialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-neutral-900/40 backdrop-blur-3xl border border-white/[0.14] rounded-[32px] p-6 sm:p-8 max-w-sm w-full text-center shadow-[0_40px_80px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.15)] premium-bounce">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto mb-5 shadow-inner text-[#6D001A]">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9s2.015-9 4.5-9m0 0a9.004 9.004 0 018.716 2.253M12 3a9.004 9.004 0 00-8.716 2.253" />
              </svg>
            </div>
            <h3 className="text-xl font-serif font-bold text-white mb-2 tracking-wide">
              {socialModal === 'Google' && 'Google Login'}
              {socialModal === 'Instagram' && 'Instagram Login'}
              {socialModal === 'Forgot' && 'Reset Password'}
            </h3>
            <p className="text-neutral-300 text-xs leading-relaxed mb-6 px-3">
              This feature is currently being set up and will be available to use very soon.
            </p>
            <button
              type="button"
              onClick={() => setSocialModal(null)}
              className="w-full bg-white text-black font-bold py-3 rounded-xl text-xs uppercase tracking-wider hover:bg-neutral-200 transition-all shadow-md active:scale-[0.98] focus:outline-none"
            >
              Close Window
            </button>
          </div>
        </div>
      )}

    </div>
  );
}