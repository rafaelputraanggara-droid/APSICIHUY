'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileMasterOpen, setIsMobileMasterOpen] = useState(false);

  // Simulated logged-in user state
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Enforce authentication redirect
  useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("simulated_user");
        if (!saved) {
          if (pathname !== "/login") {
            window.location.href = "/login";
          }
        } else {
          try {
            setCurrentUser(JSON.parse(saved));
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
      localStorage.removeItem("simulated_user");
      window.dispatchEvent(new Event("simulated_user_change"));
      window.location.href = "/login";
    }
  };

  // 1. Bypass layout shell entirely for the login page
  if (pathname === '/login') {
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
    currentUser.role === "Admin BMN" &&
    currentUser.email.endsWith("@staff.uns.ac.id");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900 transition-colors duration-300">
      {/* Top Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 h-16 flex items-center print:hidden">
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
                  SIPRABU <span className="text-gray-800 font-bold">FT UNS</span>
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
                  <span className="ml-2 hidden md:block text-xs font-semibold text-neutral-700">
                    {currentUser.name}
                  </span>
                  <svg className="ml-1.5 h-4 w-4 text-neutral-450" fill="currentColor" viewBox="0 0 20 20">
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
                  <Link
                    href="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                      pathname === "/" ? "bg-indigo-50 text-indigo-600" : "text-neutral-650"
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/laboran"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                      pathname === "/laboran" ? "bg-indigo-50 text-indigo-600" : "text-neutral-650"
                    }`}
                  >
                    Dashboard Laboran
                  </Link>

                  {isAdminBMN && (
                    <div className="space-y-1">
                      <button
                        onClick={() => setIsMobileMasterOpen(!isMobileMasterOpen)}
                        className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                          pathname && pathname.startsWith("/admin/master-barang") ? "bg-indigo-50/50 text-indigo-600" : "text-neutral-650"
                        }`}
                      >
                        <span>Master Barang</span>
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
                        <div className="pl-6 space-y-1">
                          <Link
                            href="/admin/master-barang/tambah"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block py-2 px-3 text-xs font-semibold text-neutral-500 rounded-lg hover:bg-neutral-50"
                          >
                            Tambah Data Barang
                          </Link>
                          <Link
                            href="/admin/master-barang/import"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block py-2 px-3 text-xs font-semibold text-neutral-500 rounded-lg hover:bg-neutral-50"
                          >
                            Import SAKTI CSV
                          </Link>
                          <Link
                            href="/admin/master-barang/cetak-qr"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block py-2 px-3 text-xs font-semibold text-neutral-500 rounded-lg hover:bg-neutral-50"
                          >
                            Cetak Label QR Code
                          </Link>
                        </div>
                      )}
                    </div>
                  )}

                  <Link
                    href="/about"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                      pathname === "/about" ? "bg-indigo-50 text-indigo-600" : "text-neutral-650"
                    }`}
                  >
                    About
                  </Link>
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
        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-gray-50/50 min-h-screen">
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
