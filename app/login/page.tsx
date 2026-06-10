"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [loginMode, setLoginMode] = useState<"none" | "mahasiswa" | "pj">("none");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("simulated_user");
      if (saved) {
        window.location.href = "/";
      }
    }
  }, []);

  const handleQuickLogin = (roleType: "admin" | "pj") => {
    if (roleType === "admin") {
      const user = {
        name: "Admin Fakultas",
        email: "admin@staff.uns.ac.id",
        role: "Admin Fakultas",
      };
      localStorage.setItem("simulated_user", JSON.stringify(user));
      window.dispatchEvent(new Event("simulated_user_change"));
      window.location.href = "/";
    } else {
      const user = {
        name: "PJ Ruangan (Laboran)",
        email: "laboran@ft.uns.ac.id",
        role: "PJ_Ruangan",
      };
      localStorage.setItem("simulated_user", JSON.stringify(user));
      window.dispatchEvent(new Event("simulated_user_change"));
      window.location.href = "/";
    }
  };

  const handleMahasiswaLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedUN = username.trim();
    const trimmedPW = password.trim();

    // Call simulated login API for Mahasiswa
    try {
      const res = await fetch("/api/login-mahasiswa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: trimmedUN, password: trimmedPW }),
      });
      const data = await res.json();
      
      if (data.success) {
        const user = {
          name: data.data.name || "Mahasiswa",
          email: data.data.email,
          role: "Mahasiswa/Dosen",
        };
        localStorage.setItem("simulated_user", JSON.stringify(user));
        window.dispatchEvent(new Event("simulated_user_change"));
        window.location.href = "/";
      } else {
        setErrorMsg(data.error || "Username atau Password salah!");
      }
    } catch (err) {
      setErrorMsg("Gagal terhubung ke server.");
    }
  };

  const handlePjLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedUN = username.trim();
    const trimmedPW = password.trim();

    try {
      const res = await fetch("/api/login-pj", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: trimmedUN, password: trimmedPW }),
      });
      const data = await res.json();
      
      if (data.success) {
        const user = {
          name: data.data.name,
          email: data.data.email,
          role: "PJ_Ruangan",
        };
        localStorage.setItem("simulated_user", JSON.stringify(user));
        window.dispatchEvent(new Event("simulated_user_change"));
        window.location.href = "/";
      } else {
        setErrorMsg(data.error || "Username atau Password salah!");
      }
    } catch (err) {
      setErrorMsg("Gagal terhubung ke server.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-banner)] transition-colors duration-400 p-4">
      <div className="w-full max-w-md bg-white/10 dark:bg-black/35 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative background lights */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-600/20 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-violet-600/20 rounded-full blur-2xl pointer-events-none"></div>

        <div className="text-center mb-8 relative z-10">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-[var(--bg-panel)] transition-colors duration-400 rounded-2xl flex items-center justify-center shadow-lg border border-[var(--border-panel)]">
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
          <p className="text-xs text-[var(--text-muted)] mt-1 uppercase font-bold tracking-wider">
            Masuk ke Sistem
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-950/30 border border-rose-900/40 text-rose-400 rounded-2xl text-xs font-bold flex items-center gap-2.5 animate-pulse">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {errorMsg}
          </div>
        )}

        {loginMode === "none" && (
          <div className="space-y-4 relative z-10 flex flex-col">
            <button
              onClick={() => handleQuickLogin("admin")}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-sm font-bold shadow-lg transition-all cursor-pointer"
            >
              Login sebagai Admin Fakultas
            </button>
            <button
              onClick={() => setLoginMode("pj")}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-sm font-bold shadow-lg transition-all cursor-pointer"
            >
              Login sebagai PJ Ruangan
            </button>
            <button
              onClick={() => setLoginMode("mahasiswa")}
              className="w-full py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-2xl text-sm font-bold shadow-lg transition-all cursor-pointer"
            >
              Login sebagai Mahasiswa
            </button>
          </div>
        )}
        {loginMode === "mahasiswa" && (
          <div className="relative z-10 animate-fade-in">
            <form onSubmit={handleMahasiswaLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-350 mb-1.5 pl-1">
                  Username Mahasiswa
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
                    placeholder="Masukkan username SSO"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-semibold"
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
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-10 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-450 hover:text-white transition-all cursor-pointer"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-bold shadow-lg transition-all cursor-pointer"
              >
                Masuk
              </button>
            </form>

            <div className="mt-4 text-center space-y-2">
              <Link href="/register?role=Mahasiswa" className="text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors block">
                Belum punya akun? Buat akun Mahasiswa
              </Link>
              <button 
                onClick={() => {
                  setLoginMode("none");
                  setErrorMsg(null);
                }} 
                className="text-xs text-[var(--text-muted)] hover:text-white underline mt-2"
              >
                Kembali ke pilihan login
              </button>
            </div>
          </div>
        )}

        {loginMode === "pj" && (
          <div className="relative z-10 animate-fade-in">
            <form onSubmit={handlePjLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-emerald-300 mb-1.5 pl-1">
                  Username PJ Ruangan
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
                    className="w-full bg-white/5 border border-emerald-900/50 rounded-2xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-emerald-300 mb-1.5 pl-1">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-450 pointer-events-none">
                    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password"
                    className="w-full bg-white/5 border border-emerald-900/50 rounded-2xl pl-10 pr-10 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-450 hover:text-white transition-all cursor-pointer"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-bold shadow-lg transition-all cursor-pointer"
              >
                Masuk
              </button>
            </form>

            <div className="mt-4 text-center space-y-2">
              <Link href="/register?role=PJ_Ruangan" className="text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors block">
                Belum punya akun? Buat akun PJ Ruangan
              </Link>
              <button 
                onClick={() => {
                  setLoginMode("none");
                  setErrorMsg(null);
                }} 
                className="text-xs text-[var(--text-muted)] hover:text-white underline mt-2"
              >
                Kembali ke pilihan login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
