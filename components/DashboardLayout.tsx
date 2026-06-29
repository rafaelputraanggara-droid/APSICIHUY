'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import { menuItems, subMenus, getMappedRole, riwayatSubMenus } from './navigationData';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileMasterOpen, setIsMobileMasterOpen] = useState(false);
  const [isMobileRiwayatOpen, setIsMobileRiwayatOpen] = useState(false);

  // Auto-detect system theme (Windows light/dark)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = (isDark: boolean) => {
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    };
    apply(mq.matches);
    const handler = (e: MediaQueryListEvent) => apply(e.matches);
    mq.addEventListener('change', handler);
    // Clean up old localStorage theme
    localStorage.removeItem('app-theme');
    return () => mq.removeEventListener('change', handler);
  }, []);

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
      <div className="min-h-screen bg-[var(--bg-app)] flex flex-col font-sans text-[var(--text-main)] transition-colors duration-300">
        {children}
      </div>
    );
  }

  // 2. Loading state while verifying auth
  if (loadingAuth || !currentUser) {
    return (
      <div className="min-h-screen bg-[var(--bg-app)] flex items-center justify-center transition-colors duration-300">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--text-muted)]"></div>
      </div>
    );
  }

  const isAdminBMN =
    currentUser.role === "Admin Fakultas" &&
    currentUser.email.endsWith("@staff.uns.ac.id");

  const activeRole = getMappedRole(currentUser.role);
  const visibleMenuItems = menuItems.filter(item => item.roles.includes(activeRole));

  return (
    <div className="min-h-screen bg-[var(--bg-app)] flex flex-col font-sans text-[var(--text-main)] transition-colors duration-300">
      {/* Top Navbar */}
      <header className="bg-[var(--bg-header)] border-b border-[var(--border-layout)] sticky top-0 z-30 h-16 flex items-center print:hidden transition-colors duration-300">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-full">
            <div className="flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-md text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-sidebar-hover)] focus:outline-none transition-colors"
              >
                <span className="sr-only">Open sidebar</span>
                {/* Menu Icon */}
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="flex-shrink-0 flex items-center ml-2 lg:ml-0 gap-2.5">
                <div className="h-8.5 w-8.5 rounded-xl bg-neutral-800 flex items-center justify-center text-white font-black text-lg shadow-sm">
                  S
                </div>
                <span className="text-lg font-black tracking-tight text-[var(--text-main)]">
                  SIPRABU <span className="font-bold">FT UNS</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Quick Role Badge */}
              <span className={`hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xxs font-bold uppercase tracking-wider ${
                isAdminBMN
                  ? "bg-[var(--tag-info-bg)] text-[var(--tag-info-text)] border border-[var(--border-panel)]"
                  : "bg-[var(--bg-sidebar-hover)] text-[var(--text-muted)] border border-[var(--border-panel)]"
              }`}>
                {currentUser.role}
              </span>

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center text-sm border border-[var(--border-panel)] hover:border-[var(--text-muted)] rounded-full py-1.5 px-3 focus:outline-none transition-all cursor-pointer bg-[var(--bg-panel)]"
                  id="user-menu"
                  aria-label="User menu"
                  aria-haspopup="true"
                >
                  <div className={`h-6.5 w-6.5 rounded-full flex items-center justify-center font-bold text-xs text-white ${
                    isAdminBMN ? "bg-neutral-800" : "bg-neutral-600"
                  }`}>
                    {currentUser.role.charAt(0)}
                  </div>
                  <span className="ml-2 hidden md:block text-xs font-semibold text-[var(--text-main)]">
                    {currentUser.name}
                  </span>
                  <svg className="ml-1.5 h-4 w-4 text-[var(--text-muted)]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>

                {isProfileOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-52 rounded-2xl shadow-lg bg-[var(--bg-panel)] border border-[var(--border-panel)] py-1.5 z-40">
                    <div className="px-4 py-2 border-b border-[var(--border-panel)]">
                      <p className="text-xs text-[var(--text-muted)] font-bold uppercase">Detail Akun</p>
                      <p className="text-xs font-bold text-[var(--text-main)] mt-1">{currentUser.name}</p>
                      <p className="text-xxs text-[var(--text-muted)] font-mono mt-0.5 truncate">{currentUser.email}</p>
                    </div>
                    <a href="#" className="block px-4 py-2 text-xs font-semibold text-[var(--text-main)] hover:bg-[var(--bg-sidebar-hover)]" role="menuitem">Profil Anda</a>
                    <a href="#" className="block px-4 py-2 text-xs font-semibold text-[var(--text-main)] hover:bg-[var(--bg-sidebar-hover)]" role="menuitem">Pengaturan</a>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left block px-4 py-2 text-xs font-semibold text-[var(--tag-danger-text)] hover:bg-[var(--bg-sidebar-hover)] border-t border-[var(--border-panel)] focus:outline-none cursor-pointer" 
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
            <div className="fixed inset-0 bg-black/60 transition-opacity" onClick={() => setIsMobileMenuOpen(false)}></div>
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[var(--bg-panel)] pt-5 pb-4 shadow-xl border-r border-[var(--border-panel)]">
              <div className="absolute top-0 right-0 -mr-12 pt-4">
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none bg-black/40 hover:bg-black/60"
                >
                  <span className="sr-only">Close sidebar</span>
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex-shrink-0 flex items-center px-4 gap-2 mb-6">
                <div className="h-8.5 w-8.5 rounded-xl bg-neutral-800 flex items-center justify-center text-white font-black text-lg">
                  S
                </div>
                <span className="text-lg font-black tracking-tight text-[var(--text-main)]">
                  SIPRABU <span className="font-bold">FT UNS</span>
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
                              pathname && pathname.startsWith("/admin/master-barang") ? "bg-[var(--bg-sidebar-active)] text-[var(--text-main)]" : "text-[var(--text-muted)]"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className={pathname && pathname.startsWith("/admin/master-barang") ? "text-[var(--text-main)]" : "text-[var(--text-muted)]"}>
                                {item.icon}
                              </span>
                              <span>{item.name}</span>
                            </div>
                            <svg
                              className={`w-4 h-4 text-[var(--text-muted)] transition-transform ${isMobileMasterOpen ? "transform rotate-180" : ""}`}
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
                                        ? "border-[var(--text-main)] bg-[var(--bg-sidebar-active)] text-[var(--text-main)]"
                                        : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]"
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

                    if (item.name === "Riwayat") {
                      return (
                        <div key={idx} className="space-y-1">
                          <button
                            onClick={() => setIsMobileRiwayatOpen(!isMobileRiwayatOpen)}
                            className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                              pathname && pathname.startsWith("/riwayat") ? "bg-[var(--bg-sidebar-active)] text-[var(--text-main)]" : "text-[var(--text-muted)]"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className={pathname && pathname.startsWith("/riwayat") ? "text-[var(--text-main)]" : "text-[var(--text-muted)]"}>
                                {item.icon}
                              </span>
                              <span>{item.name}</span>
                            </div>
                            <svg
                              className={`w-4 h-4 text-[var(--text-muted)] transition-transform ${isMobileRiwayatOpen ? "transform rotate-180" : ""}`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>

                          {isMobileRiwayatOpen && (
                            <div className="pl-9 space-y-1">
                              {riwayatSubMenus.filter(sub => !sub.roles || sub.roles.includes(activeRole)).map((sub, sIdx) => {
                                const isSubActive = pathname === sub.href;
                                return (
                                  <Link
                                    key={`riwayat-mob-${sIdx}`}
                                    href={sub.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center py-2 px-3 rounded-lg text-xs font-semibold tracking-wide border-l-2 ${
                                      isSubActive
                                        ? "border-[var(--text-main)] bg-[var(--bg-sidebar-active)] text-[var(--text-main)]"
                                        : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]"
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
                          isActive ? "bg-[var(--bg-sidebar-active)] text-[var(--text-main)]" : "text-[var(--text-muted)]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={isActive ? "text-[var(--text-main)]" : "text-[var(--text-muted)]"}>
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
              <div className="p-4 border-t border-[var(--border-panel)] flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className={`h-8.5 w-8.5 rounded-full flex items-center justify-center font-bold text-xs text-white ${
                    isAdminBMN ? "bg-neutral-800" : "bg-neutral-600"
                  }`}>
                    {currentUser.role.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[var(--text-main)]">{currentUser.name}</p>
                    <p className="text-xxs text-[var(--text-muted)]">{currentUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-center px-4 py-2 bg-[var(--tag-danger-bg)] text-[var(--tag-danger-text)] hover:opacity-80 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Keluar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-[var(--bg-app)] min-h-screen transition-colors duration-300">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
