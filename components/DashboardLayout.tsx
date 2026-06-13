'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import { menuItems, subMenus, getMappedRole } from './navigationData';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileMasterOpen, setIsMobileMasterOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [theme, setTheme] = useState("ocean");

  useEffect(() => {
    const storedTheme = localStorage.getItem("app-theme") || "ocean";
    setTheme(storedTheme);
    document.documentElement.setAttribute('data-theme', storedTheme);
  }, []);

  const changeTheme = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem("app-theme", newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // Simulated logged-in user state
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [pendingMutasiCount, setPendingMutasiCount] = useState(0);

  useEffect(() => {
    const fetchPendingMutasi = async () => {
      if (currentUser && currentUser.role === "Admin Fakultas") {
        try {
          const res = await fetch("/api/mutasi?role=Admin%20Fakultas");
          const json = await res.json();
          if (json.success) {
            const count = json.data.filter((m: any) => m.status_mutasi === "Menunggu").length;
            setPendingMutasiCount(count);
          }
        } catch (error) {}
      } else {
        setPendingMutasiCount(0);
      }
    };
    if (currentUser) {
      fetchPendingMutasi();
      const interval = setInterval(fetchPendingMutasi, 10000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  // Enforce authentication redirect
  useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== "undefined") {
        const saved = sessionStorage.getItem("simulated_user");
        if (!saved) {
          if (pathname !== "/login" && pathname !== "/register" && !pathname.endsWith("/cetak-label")) {
            window.location.href = "/login";
          }
        } else {
          try {
            const parsed = JSON.parse(saved);
            if (parsed.role === "Admin BMN" || parsed.role === "Admin") {
              parsed.role = "Admin Fakultas";
              parsed.name = "Admin Fakultas";
              sessionStorage.setItem("simulated_user", JSON.stringify(parsed));
            }
            setCurrentUser(parsed);
          } catch (e) {
            console.error("Failed to parse simulated user", e);
          }
        }
      }
      setLoadingAuth(false);
    };

    checkAuth();
    window.addEventListener("simulated_user_change", checkAuth);
    return () => window.removeEventListener("simulated_user_change", checkAuth);
  }, [pathname]);

  // Handle Logout
  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("simulated_user");
      window.dispatchEvent(new Event("simulated_user_change"));
      window.location.href = "/login";
    }
  };

  // 1. Bypass layout shell entirely for the login & register pages & print
  if (pathname === '/login' || pathname === '/register' || pathname.endsWith('/cetak-label')) {
    return (
      <div className="min-h-screen bg-neutral-900 flex flex-col font-sans text-gray-100">
        {children}
      </div>
    );
  }

  // 2. Loading state while verifying auth
  if (loadingAuth || !currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-650"></div>
      </div>
    );
  }

  const isAdminBMN =
    currentUser.role === "Admin Fakultas" &&
    currentUser.email.endsWith("@staff.uns.ac.id");

  const activeRole = getMappedRole(currentUser.role);
  const visibleMenuItems = menuItems.filter(item => item.roles.includes(activeRole));

  return (
    <div className="min-h-screen bg-[var(--bg-app)] flex flex-col font-sans text-[var(--text-header)] transition-colors duration-400">
      {/* Top Navbar */}
      <header className="bg-[var(--bg-header)] border-b border-[var(--border-layout)] sticky top-0 z-30 h-16 flex items-center print:hidden transition-colors duration-400">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-full">
            <div className="flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-550 hover:bg-gray-100 focus:outline-none"
              >
                <span className="sr-only">Open sidebar</span>
                {/* Menu Icon */}
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="flex-shrink-0 flex items-center ml-2 lg:ml-0 gap-2.5">
                <div className="h-8.5 w-8.5 rounded-xl bg-indigo-650 flex items-center justify-center text-white font-black text-lg shadow-sm shadow-indigo-200">
                  S
                </div>
                <span className="text-lg font-black text-indigo-600 tracking-tight">
                  SIPRABU <span className="text-[var(--text-header)] font-bold">FT UNS</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Quick Role Badge */}
              <span className={`hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xxs font-bold uppercase tracking-wider ${
                isAdminBMN
                  ? "bg-indigo-100 text-indigo-750 border border-indigo-200"
                  : "bg-neutral-100 text-neutral-700 border border-neutral-200"
              }`}>
                {currentUser.role}
              </span>

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center text-sm border border-neutral-200 hover:border-neutral-300 rounded-full py-1.5 px-3 focus:outline-none transition-all cursor-pointer bg-neutral-50/50"
                  id="user-menu"
                  aria-label="User menu"
                  aria-haspopup="true"
                >
                  <div className={`h-6.5 w-6.5 rounded-full flex items-center justify-center font-bold text-xs text-white ${
                    isAdminBMN ? "bg-indigo-600" : "bg-neutral-600"
                  }`}>
                    {currentUser.role.charAt(0)}
                  </div>
                  <span className="ml-2 hidden md:block text-xs font-semibold text-[var(--text-header)]">
                    {currentUser.name}
                  </span>
                  <svg className="ml-1.5 h-4 w-4 text-[var(--text-header)]-muted" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>

                {isProfileOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-52 rounded-2xl shadow-lg bg-white border border-neutral-150 py-1.5 z-40">
                    <div className="px-4 py-2 border-b border-neutral-100">
                      <p className="text-xs text-neutral-450 font-bold uppercase">Detail Akun</p>
                      <p className="text-xs font-bold text-neutral-800 mt-1">{currentUser.name}</p>
                      <p className="text-xxs text-neutral-550 font-mono mt-0.5 truncate">{currentUser.email}</p>
                    </div>
                    <a href="#" className="block px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50" role="menuitem">Profil Anda</a>
                    <a href="#" className="block px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50" role="menuitem">Pengaturan</a>
                    <button 
                      onClick={(e) => { e.preventDefault(); setIsThemeModalOpen(true); setIsProfileOpen(false); }}
                      className="w-full text-left block px-4 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-50" 
                      role="menuitem"
                    >
                      ✨ Tema Kustom
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left block px-4 py-2 text-xs font-semibold text-red-650 hover:bg-neutral-50 border-t border-neutral-100 focus:outline-none cursor-pointer" 
                      role="menuitem"
                    >
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Desktop */}
        <Sidebar />

        {/* Left Sidebar - Mobile (overlay drawer) */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex print:hidden">
            <div className="fixed inset-0 bg-neutral-900/60 transition-opacity" onClick={() => setIsMobileMenuOpen(false)}></div>
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white pt-5 pb-4 shadow-xl border-r border-neutral-200">
              <div className="absolute top-0 right-0 -mr-12 pt-4">
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none bg-neutral-900/40 hover:bg-neutral-900/60"
                >
                  <span className="sr-only">Close sidebar</span>
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex-shrink-0 flex items-center px-4 gap-2 mb-6">
                <div className="h-8.5 w-8.5 rounded-xl bg-indigo-650 flex items-center justify-center text-white font-black text-lg">
                  S
                </div>
                <span className="text-lg font-black text-indigo-600 tracking-tight">
                  SIPRABU <span className="text-gray-800">FT UNS</span>
                </span>
              </div>

              <div className="flex-1 h-0 overflow-y-auto px-3">
                <nav className="space-y-1">
                  {visibleMenuItems.map((item, idx) => {
                    if (item.name === "Master Barang") {
                      return (
                        <div key={idx} className="space-y-1">
                          <button
                            onClick={() => setIsMobileMasterOpen(!isMobileMasterOpen)}
                            className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                              pathname && pathname.startsWith("/admin/master-barang") ? "bg-indigo-50/50 text-indigo-600" : "text-neutral-650"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className={pathname && pathname.startsWith("/admin/master-barang") ? "text-indigo-600" : "text-neutral-405"}>
                                {item.icon}
                              </span>
                              <span>{item.name}</span>
                            </div>
                            <svg
                              className={`w-4 h-4 text-neutral-400 transition-transform ${isMobileMasterOpen ? "transform rotate-180" : ""}`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>

                          {isMobileMasterOpen && (
                            <div className="pl-9 space-y-1">
                              {subMenus.filter(sub => !sub.roles || sub.roles.includes(activeRole)).map((sub, sIdx) => {
                                const isSubActive = pathname === sub.href;
                                return (
                                  <Link
                                    key={sIdx}
                                    href={sub.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center py-2 px-3 rounded-lg text-xs font-semibold tracking-wide border-l-2 ${
                                      isSubActive
                                        ? "border-indigo-600 bg-indigo-50/60 text-indigo-600"
                                        : "border-transparent text-neutral-500 hover:text-neutral-900"
                                    }`}
                                  >
                                    {sub.name}
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    }

                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={idx}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium ${
                          isActive ? "bg-indigo-50 text-indigo-600" : "text-neutral-650"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={isActive ? "text-indigo-600" : "text-neutral-405"}>
                            {item.icon}
                          </span>
                          {item.name}
                        </div>
                        {item.name === "Mutasi Barang" && currentUser?.role === "Admin Fakultas" && pendingMutasiCount > 0 && (
                          <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                            {pendingMutasiCount}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Mobile Profile Display */}
              <div className="p-4 border-t border-neutral-100 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className={`h-8.5 w-8.5 rounded-full flex items-center justify-center font-bold text-xs text-white ${
                    isAdminBMN ? "bg-indigo-600" : "bg-neutral-600"
                  }`}>
                    {currentUser.role.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-800">{currentUser.name}</p>
                    <p className="text-xxs text-neutral-550">{currentUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-center px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Keluar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-[var(--bg-app)] min-h-screen transition-colors duration-400">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Theme Selection Modal */}
      {isThemeModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in print:hidden">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative">
            <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center">
              <h3 className="text-lg font-black text-neutral-900 dark:text-white tracking-tight">Tema Kustom</h3>
              <button onClick={() => setIsThemeModalOpen(false)} className="text-neutral-400 hover:text-neutral-600 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-xs font-bold text-neutral-500 mb-4 uppercase tracking-wider">Pilih Warna Favorit Anda</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: "ocean", name: "Ocean Blue", color: "bg-blue-600" },
                  { id: "breeze", name: "Soft Breeze", color: "bg-teal-400" },
                  { id: "emerald", name: "Emerald Forest", color: "bg-emerald-600" },
                  { id: "ruby", name: "Crimson Ruby", color: "bg-rose-700" },
                  { id: "cream", name: "Warm Amber", color: "bg-amber-600" },
                  { id: "dark", name: "Windows Dark", color: "bg-[#111111] border border-[#333333]" },
                  { id: "light", name: "Windows Light", color: "bg-[#f3f3f3] border border-[#cccccc]" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => changeTheme(t.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                      theme === t.id 
                        ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/30 dark:border-indigo-500 shadow-sm" 
                        : "border-neutral-100 hover:border-neutral-200 dark:border-neutral-800 dark:hover:border-neutral-700"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full shadow-inner ${t.color}`}></div>
                    <span className={`text-sm font-bold ${theme === t.id ? 'text-indigo-700 dark:text-indigo-400' : 'text-neutral-700 dark:text-neutral-300'}`}>
                      {t.name}
                    </span>
                    {theme === t.id && (
                      <svg className="w-4 h-4 ml-auto text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 flex justify-end">
              <button 
                onClick={() => setIsThemeModalOpen(false)}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm w-full sm:w-auto"
              >
                Terapkan Tema
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
