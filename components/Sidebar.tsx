"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { menuItems, subMenus, maintenanceSubMenus, getMappedRole } from "./navigationData";

export default function Sidebar() {
  const pathname = usePathname();

  // Simulated logged-in user state
  const [currentUser, setCurrentUser] = useState({
    name: "PJ Ruangan (Laboran)",
    email: "laboran@ft.uns.ac.id",
    role: "PJ_Ruangan",
  });

  const [isMasterBarangOpen, setIsMasterBarangOpen] = useState(false);
  const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);
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
      const savedUser = sessionStorage.getItem("simulated_user");
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
    if (pathname && pathname.startsWith("/maintenance")) {
      setIsMaintenanceOpen(true);
    }
  }, [pathname]);

  // Toggle simulation user
  const handleToggleUser = () => {
    let nextUser;
    if (currentUser.role === "Admin Fakultas") {
      nextUser = {
        name: "PJ Ruangan (Dosen/Staff)",
        email: "pjruangan@ft.uns.ac.id",
        role: "PJ_Ruangan",
      };
    } else if (currentUser.role === "PJ_Ruangan") {
      nextUser = {
        name: "Laboran (Teknisi)",
        email: "laboran@ft.uns.ac.id",
        role: "Laboran",
      };
    } else {
      nextUser = {
        name: "Admin Fakultas",
        email: "admin@staff.uns.ac.id",
        role: "Admin Fakultas",
      };
    }

    setCurrentUser(nextUser);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("simulated_user", JSON.stringify(nextUser));
      // Dispatch custom event for real-time reactivity in other components/pages
      window.dispatchEvent(new Event("simulated_user_change"));
    }
  };

  const activeRole = getMappedRole(currentUser.role);

  // Filter items matching mapped active user role
  const visibleMenuItems = menuItems.filter(item => item.roles.includes(activeRole));

  return (
    <aside className="w-64 border-r border-[var(--border-sidebar)] bg-[var(--bg-sidebar)] flex flex-col h-[calc(100vh-4rem)] sticky top-16 hidden lg:flex transition-colors duration-400 z-20">
      <div className="flex-1 py-6 px-4 space-y-7 overflow-y-auto">
        <div className="space-y-1">
          <p className="px-3 text-xs font-semibold text-[var(--text-sidebar-default)] opacity-80 uppercase tracking-wider">Navigation</p>
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
                          ? "bg-[var(--bg-sidebar-active)] text-[var(--text-sidebar-active)] shadow-sm"
                          : "text-[var(--text-sidebar-default)] hover:bg-[var(--bg-sidebar-hover)] hover:text-[var(--text-sidebar-hover)]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`transition-colors duration-200 ${
                          pathname && pathname.startsWith("/admin/master-barang")
                            ? "text-[var(--text-sidebar-active)]"
                            : "text-[var(--text-sidebar-default)] opacity-80 group-hover:opacity-100 group-hover:text-[var(--text-sidebar-hover)]"
                        }`}>
                          {item.icon}
                        </span>
                        <span>{item.name}</span>
                      </div>
                      <svg
                        className={`w-4 h-4 transition-transform duration-250 ${
                          pathname && pathname.startsWith("/admin/master-barang") ? "text-[var(--text-sidebar-active)]" : "text-[var(--text-sidebar-default)]"
                        } ${isMasterBarangOpen ? "transform rotate-180" : ""}`}
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
                                ? "border-text-sidebar-active bg-[var(--bg-sidebar-active)]/30 text-[var(--text-sidebar-active)]"
                                : "border-transparent text-[var(--text-sidebar-default)] hover:bg-[var(--bg-sidebar-hover)]/50 hover:text-[var(--text-sidebar-hover)]"
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

              // Maintenance dropdown rendering
              if (item.name === "Maintenance") {
                return (
                  <div key={idx} className="space-y-1">
                    <button
                      onClick={() => setIsMaintenanceOpen(!isMaintenanceOpen)}
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group cursor-pointer text-left focus:outline-none ${
                        pathname && pathname.startsWith("/maintenance")
                          ? "bg-[var(--bg-sidebar-active)] text-[var(--text-sidebar-active)] shadow-sm"
                          : "text-[var(--text-sidebar-default)] hover:bg-[var(--bg-sidebar-hover)] hover:text-[var(--text-sidebar-hover)]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`transition-colors duration-200 ${
                          pathname && pathname.startsWith("/maintenance")
                            ? "text-[var(--text-sidebar-active)]"
                            : "text-[var(--text-sidebar-default)] opacity-80 group-hover:opacity-100 group-hover:text-[var(--text-sidebar-hover)]"
                        }`}>
                          {item.icon}
                        </span>
                        <span>{item.name}</span>
                      </div>
                      <svg
                        className={`w-4 h-4 transition-transform duration-250 ${
                          pathname && pathname.startsWith("/maintenance") ? "text-[var(--text-sidebar-active)]" : "text-[var(--text-sidebar-default)]"
                        } ${isMaintenanceOpen ? "transform rotate-180" : ""}`}
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
                        isMaintenanceOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
                      }`}
                    >
                      {maintenanceSubMenus.map((sub, sIdx) => {
                        const isSubActive = pathname === sub.href;
                        return (
                          <Link
                            key={sIdx}
                            href={sub.href}
                            className={`flex items-center py-2 px-3 rounded-lg text-xs font-semibold tracking-wide transition-all border-l-2 ${
                              isSubActive
                                ? "border-text-sidebar-active bg-[var(--bg-sidebar-active)]/30 text-[var(--text-sidebar-active)]"
                                : "border-transparent text-[var(--text-sidebar-default)] hover:bg-[var(--bg-sidebar-hover)]/50 hover:text-[var(--text-sidebar-hover)]"
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
                      ? "bg-[var(--bg-sidebar-active)] text-[var(--text-sidebar-active)] shadow-sm"
                      : "text-[var(--text-sidebar-default)] hover:bg-[var(--bg-sidebar-hover)] hover:text-[var(--text-sidebar-hover)]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`transition-colors duration-200 ${
                      isActive ? "text-[var(--text-sidebar-active)]" : "text-[var(--text-sidebar-default)] opacity-80 group-hover:opacity-100 group-hover:text-[var(--text-sidebar-hover)]"
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
      <div className="p-4 border-t border-[var(--border-sidebar)] bg-[var(--bg-sidebar-hover)]/30">
        <div className="flex flex-col gap-3.5">
          <div className="flex items-center gap-3">
            <div className={`h-9.5 w-9.5 rounded-full flex items-center justify-center font-bold text-sm border transition-colors duration-300 ${
              currentUser.role === "Admin Fakultas"
                ? "bg-indigo-600 border-indigo-500 text-white shadow-sm"
                : currentUser.role === "PJ_Ruangan"
                ? "bg-emerald-600 border-emerald-500 text-white shadow-sm"
                : "bg-rose-600 border-rose-500 text-white shadow-sm"
            }`}>
              {currentUser.role === "Admin Fakultas" ? "A" : currentUser.role === "PJ_Ruangan" ? "P" : "L"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[var(--text-sidebar-active)] truncate">
                {currentUser.name}
              </p>
              <p className="text-xs text-[var(--text-sidebar-default)] opacity-80 truncate">
                {currentUser.email}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleToggleUser}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-[var(--text-sidebar-active)] border border-white/10 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer hover:shadow"
          >
            <svg className="w-3.5 h-3.5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Simulasi: {currentUser.role === "Admin Fakultas" ? "PJ Ruangan" : currentUser.role === "PJ_Ruangan" ? "Laboran" : "Admin Fakultas"}
          </button>
        </div>
      </div>
    </aside>
  );
}
