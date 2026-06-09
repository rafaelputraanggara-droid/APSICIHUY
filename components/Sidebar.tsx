"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  // Simulated logged-in user state
  const [currentUser, setCurrentUser] = useState({
    name: "PJ Ruangan (Laboran)",
    email: "laboran@ft.uns.ac.id",
    role: "PJ_Ruangan",
  });

  // Master Barang dropdown toggle state
  const [isMasterBarangOpen, setIsMasterBarangOpen] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("simulated_user");
      if (savedUser) {
        try {
          setCurrentUser(JSON.parse(savedUser));
        } catch (e) {
          console.error("Failed to parse simulated user", e);
        }
      }
    }
  }, []);

  // Sync accordion state with current route path
  useEffect(() => {
    if (pathname && pathname.startsWith("/admin/master-barang")) {
      setIsMasterBarangOpen(true);
    }
  }, [pathname]);

  // Toggle simulation user
  const handleToggleUser = () => {
    const isCurrentlyAdmin = currentUser.role === "Admin BMN";
    const nextUser = isCurrentlyAdmin
      ? {
          name: "PJ Ruangan (Laboran)",
          email: "laboran@ft.uns.ac.id",
          role: "PJ_Ruangan",
        }
      : {
          name: "Admin BMN",
          email: "admin@staff.uns.ac.id",
          role: "Admin BMN",
        };

    setCurrentUser(nextUser);
    if (typeof window !== "undefined") {
      localStorage.setItem("simulated_user", JSON.stringify(nextUser));
      // Dispatch custom event for real-time reactivity in other components/pages
      window.dispatchEvent(new Event("simulated_user_change"));
    }
  };

  // Map simulated role to database/layout RBAC roles
  const getMappedRole = (role: string) => {
    if (role === "Admin BMN") return "Admin";
    return role; // e.g. "PJ_Ruangan"
  };

  const activeRole = getMappedRole(currentUser.role);

  // All menu items from the original DashboardLayout RBAC structure
  const menuItems = [
    {
      name: "Dashboard",
      href: "/",
      roles: ["Admin", "PJ_Ruangan", "Koorprodi", "Wadek"],
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
        </svg>
      )
    },
    {
      name: "Dashboard Laboran",
      href: "/laboran",
      roles: ["Admin", "PJ_Ruangan"],
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      name: "Master Barang",
      href: "/master-barang",
      roles: ["Admin"],
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    {
      name: "Data Ruangan",
      href: "/ruangan",
      roles: ["Admin", "PJ_Ruangan"],
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      name: "Mutasi Barang",
      href: "/mutasi",
      roles: ["Admin", "PJ_Ruangan"],
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      )
    },
    {
      name: "Laporan Kerusakan",
      href: "/laporan",
      roles: ["Admin", "PJ_Ruangan", "Wadek"],
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
    {
      name: "Stock Opname",
      href: "/stock-opname",
      roles: ["Admin", "PJ_Ruangan"],
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )
    },
    {
      name: "Laporan & Statistik",
      href: "/statistik",
      roles: ["Admin", "Koorprodi", "Wadek"],
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
        </svg>
      )
    },
    {
      name: "Scan QR Code",
      href: "/scan",
      roles: ["Admin", "PJ_Ruangan", "Mahasiswa/Dosen"],
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-4v-4m-2 4h-2m-2-4h-2m8 0h2m-2 2h2m-4-6h4M6 6h4v4H6V6zm10 0h4v4h-4V6zM6 16h4v4H6v-4z" />
        </svg>
      )
    },
    {
      name: "About",
      href: "/about",
      roles: ["Admin", "PJ_Ruangan", "Koorprodi", "Wadek", "Mahasiswa/Dosen"],
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  // Sub-menus for Master Barang
  const subMenus = [
    { name: "Tambah Data Barang", href: "/admin/master-barang/tambah" },
    { name: "Import SAKTI CSV", href: "/admin/master-barang/import" },
    { name: "Daftar Database Barang", href: "/admin/master-barang/database-barang" }
  ];

  // Filter items matching mapped active user role
  const visibleMenuItems = menuItems.filter(item => item.roles.includes(activeRole));

  return (
    <aside className="w-64 border-r border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 flex flex-col h-[calc(100vh-4rem)] sticky top-16 hidden lg:flex transition-colors duration-300 z-20">
      <div className="flex-1 py-6 px-4 space-y-7 overflow-y-auto">
        <div className="space-y-1">
          <p className="px-3 text-xs font-semibold text-neutral-450 dark:text-neutral-500 uppercase tracking-wider">Navigation</p>
          <nav className="space-y-1">
            {visibleMenuItems.map((item, idx) => {
              // Master Barang dropdown rendering
              if (item.name === "Master Barang") {
                return (
                  <div key={idx} className="space-y-1">
                    <button
                      onClick={() => setIsMasterBarangOpen(!isMasterBarangOpen)}
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group cursor-pointer text-left focus:outline-none ${
                        pathname && pathname.startsWith("/admin/master-barang")
                          ? "bg-indigo-50/50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400"
                          : "text-neutral-600 hover:bg-neutral-55 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900/60 dark:hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`transition-colors duration-200 ${
                          pathname && pathname.startsWith("/admin/master-barang")
                            ? "text-indigo-600 dark:text-indigo-400"
                            : "text-neutral-450 group-hover:text-neutral-900 dark:group-hover:text-white"
                        }`}>
                          {item.icon}
                        </span>
                        <span>{item.name}</span>
                      </div>
                      <svg
                        className={`w-4 h-4 text-neutral-400 transition-transform duration-250 ${
                          isMasterBarangOpen ? "transform rotate-180" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Sub-menus */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out pl-9 space-y-1 ${
                        isMasterBarangOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
                      }`}
                    >
                      {subMenus.map((sub, sIdx) => {
                        const isSubActive = pathname === sub.href;
                        return (
                          <Link
                            key={sIdx}
                            href={sub.href}
                            className={`flex items-center py-2 px-3 rounded-lg text-xs font-semibold tracking-wide transition-all border-l-2 ${
                              isSubActive
                                ? "border-indigo-600 bg-indigo-50/60 text-indigo-600 dark:border-indigo-500 dark:bg-indigo-950/30 dark:text-indigo-400"
                                : "border-transparent text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                            }`}
                          >
                            {sub.name}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              const isActive = pathname === item.href;
              return (
                <Link
                  key={idx}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group cursor-pointer ${
                    isActive
                      ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400"
                      : "text-neutral-600 hover:bg-neutral-55 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900/60 dark:hover:text-white"
                  }`}
                >
                  <span className={`transition-colors duration-200 ${
                    isActive ? "text-indigo-600 dark:text-indigo-400" : "text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white"
                  }`}>
                    {item.icon}
                  </span>
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Simulated User Profile Footer with Toggle Button */}
      <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-950/40">
        <div className="flex flex-col gap-3.5">
          <div className="flex items-center gap-3">
            <div className={`h-9.5 w-9.5 rounded-full flex items-center justify-center font-bold text-sm border transition-colors duration-300 ${
              currentUser.role === "Admin BMN"
                ? "bg-indigo-100 border-indigo-200 text-indigo-700 dark:bg-indigo-950 dark:border-indigo-900 dark:text-indigo-400"
                : "bg-neutral-100 border-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300"
            }`}>
              {currentUser.role === "Admin BMN" ? "A" : "L"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-neutral-900 dark:text-white truncate">
                {currentUser.name}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-455 truncate">
                {currentUser.email}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleToggleUser}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-neutral-50 dark:bg-neutral-900 dark:hover:bg-neutral-850 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer hover:shadow"
          >
            <svg className="w-3.5 h-3.5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Simulasi: {currentUser.role === "Admin BMN" ? "PJ Ruangan" : "Admin BMN"}
          </button>
        </div>
      </div>
    </aside>
  );
}
