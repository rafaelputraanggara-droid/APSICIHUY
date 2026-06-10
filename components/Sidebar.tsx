"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { menuItems, subMenus, getMappedRole } from "./navigationData";

export default function Sidebar() {
  const pathname = usePathname();

  // Simulated logged-in user state
  const [currentUser, setCurrentUser] = useState({
    name: "PJ Ruangan (Laboran)",
    email: "laboran@ft.uns.ac.id",
    role: "PJ_Ruangan",
  });

  const [isMasterBarangOpen, setIsMasterBarangOpen] = useState(false);
  const [pendingMutasiCount, setPendingMutasiCount] = useState(0);

  useEffect(() => {
    const fetchPendingMutasi = async () => {
      if (currentUser.role === "Admin Fakultas") {
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
    fetchPendingMutasi();
    
    // Set up polling for real-time-ish updates
    const interval = setInterval(fetchPendingMutasi, 10000);
    return () => clearInterval(interval);
  }, [currentUser.role]);

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
    const isCurrentlyAdmin = currentUser.role === "Admin Fakultas";
    const nextUser = isCurrentlyAdmin
      ? {
          name: "PJ Ruangan (Laboran)",
          email: "laboran@ft.uns.ac.id",
          role: "PJ_Ruangan",
        }
      : {
          name: "Admin Fakultas",
          email: "admin@staff.uns.ac.id",
          role: "Admin Fakultas",
        };

    setCurrentUser(nextUser);
    if (typeof window !== "undefined") {
      localStorage.setItem("simulated_user", JSON.stringify(nextUser));
      // Dispatch custom event for real-time reactivity in other components/pages
      window.dispatchEvent(new Event("simulated_user_change"));
    }
  };

  const activeRole = getMappedRole(currentUser.role);

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
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group cursor-pointer ${
                    isActive
                      ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400"
                      : "text-neutral-600 hover:bg-neutral-55 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900/60 dark:hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`transition-colors duration-200 ${
                      isActive ? "text-indigo-600 dark:text-indigo-400" : "text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white"
                    }`}>
                      {item.icon}
                    </span>
                    {item.name}
                  </div>
                  {item.name === "Mutasi Barang" && currentUser.role === "Admin Fakultas" && pendingMutasiCount > 0 && (
                    <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                      {pendingMutasiCount}
                    </span>
                  )}
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
              currentUser.role === "Admin Fakultas"
                ? "bg-indigo-100 border-indigo-200 text-indigo-700 dark:bg-indigo-950 dark:border-indigo-900 dark:text-indigo-400"
                : "bg-neutral-100 border-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300"
            }`}>
              {currentUser.role === "Admin Fakultas" ? "A" : "L"}
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
            Simulasi: {currentUser.role === "Admin Fakultas" ? "PJ Ruangan" : "Admin Fakultas"}
          </button>
        </div>
      </div>
    </aside>
  );
}
