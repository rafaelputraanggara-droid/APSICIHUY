'use client';

import React, { useState, useEffect } from 'react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('simulated_user');
      if (saved) {
        window.location.href = '/';
      }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedUN = username.trim();
    const trimmedPW = password.trim();

    if (trimmedUN === 'AdminFakultasTeknikBiru' && trimmedPW === 'birusejati') {
      // Login as Admin BMN
      const user = {
        name: 'Admin BMN',
        email: 'admin@staff.uns.ac.id',
        role: 'Admin BMN',
      };
      localStorage.setItem('simulated_user', JSON.stringify(user));
      window.dispatchEvent(new Event('simulated_user_change'));
      window.location.href = '/';
    } else if (trimmedUN === 'PJRuanganFTBiru' && trimmedPW === 'birusejatidihati') {
      // Login as PJ Ruangan (Laboran)
      const user = {
        name: 'PJ Ruangan (Laboran)',
        email: 'laboran@ft.uns.ac.id',
        role: 'PJ_Ruangan',
      };
      localStorage.setItem('simulated_user', JSON.stringify(user));
      window.dispatchEvent(new Event('simulated_user_change'));
      window.location.href = '/';
    } else {
      setErrorMsg('Username atau Password yang Anda masukkan salah!');
    }
  };

  const handleAutofill = (role: 'admin' | 'pj') => {
    if (role === 'admin') {
      setUsername('AdminFakultasTeknikBiru');
      setPassword('birusejati');
    } else {
      setUsername('PJRuanganFTBiru');
      setPassword('birusejatidihati');
    }
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-neutral-900 via-indigo-950 to-neutral-900 p-4">
      <div className="w-full max-w-md bg-white/10 dark:bg-black/35 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        
        {/* Decorative background lights */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-600/20 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-violet-600/20 rounded-full blur-2xl pointer-events-none"></div>

        <div className="text-center mb-8 relative z-10">
          {/* Crisp Vector UNS Logo */}
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-neutral-100">
              <svg className="w-12 h-12" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="48" stroke="#003566" strokeWidth="4" fill="#ffffff" />
                <circle cx="50" cy="50" r="38" fill="#003566" />
                <path d="M50 20 L58 38 L78 40 L62 52 L68 72 L50 60 L32 72 L38 52 L22 40 L42 38 Z" fill="#FFC300" />
                <circle cx="50" cy="50" r="14" fill="#003566" />
                <text x="50" y="55" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="bold" fontFamily="sans-serif">UNS</text>
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">SIPRABU FT UNS</h1>
          <p className="text-xs text-neutral-400 mt-1 uppercase font-bold tracking-wider">
            Sistem Inventaris BMN Berbasis QR Code
          </p>
        </div>

        {/* Error Alert Box */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-950/30 border border-rose-900/40 text-rose-400 rounded-2xl text-xs font-bold flex items-center gap-2.5 animate-pulse">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-350 mb-1.5 pl-1">
              Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-450 pointer-events-none">
                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username Anda"
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-semibold placeholder-neutral-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-350 mb-1.5 pl-1">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-450 pointer-events-none">
                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password Anda"
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-10 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-semibold placeholder-neutral-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-450 hover:text-white transition-all cursor-pointer focus:outline-none"
              >
                {showPassword ? (
                  <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-950/50 hover:shadow transition-all cursor-pointer mt-2"
          >
            Masuk ke Sistem
          </button>
        </form>

        {/* Prototype Helper Box (Autofill helpers) */}
        <div className="mt-8 border-t border-white/10 pt-6 relative z-10">
          <p className="text-xxs font-bold uppercase tracking-wider text-neutral-450 mb-3.5 text-center">
            Pintasan Simulasi Akun (Autofill)
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleAutofill('admin')}
              className="px-3.5 py-2.5 bg-white/5 hover:bg-white/10 text-indigo-300 border border-white/10 rounded-xl text-xxs font-extrabold transition-all cursor-pointer text-center hover:scale-[1.02]"
            >
              Role: Admin BMN
            </button>
            <button
              onClick={() => handleAutofill('pj')}
              className="px-3.5 py-2.5 bg-white/5 hover:bg-white/10 text-emerald-300 border border-white/10 rounded-xl text-xxs font-extrabold transition-all cursor-pointer text-center hover:scale-[1.02]"
            >
              Role: PJ Ruangan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
