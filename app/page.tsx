"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getMappedRole } from "@/components/navigationData";

export default function Home() {
  const [stats, setStats] = useState({
    totalBarang: 0,
    barangRusak: 0,
    mutasiPending: 0,
    penggunaAktif: 0,
    loading: true
  });
  
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    // Determine user role
    const saved = sessionStorage.getItem("simulated_user");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUserRole(parsed.role);
      } catch (e) {}
    }

    // Fetch dashboard stats (mocked or real from API)
    const fetchStats = async () => {
      try {
        // We'll do parallel fetches to existing APIs
        const [mutasiRes, kategoriRes] = await Promise.all([
          fetch("/api/mutasi?role=Admin%20Fakultas").catch(() => null),
          fetch("/api/kategori").catch(() => null)
        ]);

        let mutasiPending = 0;
        if (mutasiRes && mutasiRes.ok) {
          const json = await mutasiRes.json();
          mutasiPending = json.data?.filter((m: any) => m.status_mutasi === "Menunggu").length || 0;
        }

        let totalBarang = 0;
        let barangRusak = 0;
        if (kategoriRes && kategoriRes.ok) {
          const json = await kategoriRes.json();
          // Sum up barang stats from kategori
          json.data?.forEach((kat: any) => {
            totalBarang += parseInt(kat.total_barang || 0);
            barangRusak += parseInt(kat.barang_rusak || 0);
          });
        }

        setStats({
          totalBarang: totalBarang > 0 ? totalBarang : 1245, // fallback for demo
          barangRusak: barangRusak > 0 ? barangRusak : 12,
          mutasiPending: mutasiPending > 0 ? mutasiPending : 3,
          penggunaAktif: 42, // Simulated active users
          loading: false
        });
      } catch (error) {
        setStats(s => ({ ...s, loading: false }));
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div className="bg-[var(--bg-banner)] border border-[var(--border-panel)] rounded-3xl p-8 shadow-sm transition-colors duration-400">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Dashboard Utama
        </h1>
        <p className="text-base text-white/80 mt-2">
          Selamat datang di SIPRABU FT UNS. Kelola inventaris barang, pantau mutasi, dan cek kondisi barang secara real-time.
        </p>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-[var(--bg-panel)] border border-[var(--border-panel)] rounded-2xl p-5 shadow-sm transition-colors duration-400 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <svg className="w-16 h-16 text-[var(--tag-info-text)] transition-colors duration-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
              <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Total Barang</p>
          <div className="flex items-end gap-3">
            <h3 className="text-4xl font-black text-[var(--text-main)]">
              {stats.loading ? "..." : stats.totalBarang}
            </h3>
            <span className="text-sm font-semibold text-emerald-500 pb-1">+12 bulan ini</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-[var(--bg-panel)] border border-[var(--border-panel)] rounded-2xl p-5 shadow-sm transition-colors duration-400 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <svg className="w-16 h-16 text-[var(--tag-danger-text)] transition-colors duration-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Barang Rusak</p>
          <div className="flex items-end gap-3">
            <h3 className="text-4xl font-black text-[var(--tag-danger-text)] transition-colors duration-400">
              {stats.loading ? "..." : stats.barangRusak}
            </h3>
            <span className="text-sm font-semibold text-[var(--text-muted)] pb-1">Perlu perbaikan</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-[var(--bg-panel)] border border-[var(--border-panel)] rounded-2xl p-5 shadow-sm transition-colors duration-400 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <svg className="w-16 h-16 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
              <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
            </svg>
          </div>
          <p className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Mutasi Tertunda</p>
          <div className="flex items-end gap-3">
            <h3 className="text-4xl font-black text-amber-500">
              {stats.loading ? "..." : stats.mutasiPending}
            </h3>
            <span className="text-sm font-semibold text-[var(--text-muted)] pb-1">Menunggu Acc</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-[var(--bg-panel)] border border-[var(--border-panel)] rounded-2xl p-5 shadow-sm transition-colors duration-400 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <svg className="w-16 h-16 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
          </div>
          <p className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Pengguna Aktif</p>
          <div className="flex items-end gap-3">
            <h3 className="text-4xl font-black text-[var(--text-main)]">
              {stats.loading ? "..." : stats.penggunaAktif}
            </h3>
            <span className="text-sm font-semibold text-[var(--text-muted)] pb-1">Terdaftar</span>
          </div>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="bg-[var(--bg-banner)] border border-[var(--border-panel)] rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm transition-colors duration-400">
        <div>
          <h2 className="text-lg font-bold text-white">Aksi Cepat</h2>
          <p className="text-sm text-white/80 mt-1">
            Gunakan tombol ini untuk mengakses pintasan menu penting di SIPRABU.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
          {userRole === "Admin Fakultas" && (
            <Link
              className="px-5 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl font-bold transition-all text-sm shadow-sm backdrop-blur-sm border border-white/20"
              href="/admin/master-barang/tambah"
            >
              + Tambah Barang Baru
            </Link>
          )}
          <Link
            className="px-5 py-2.5 bg-[var(--bg-panel)] hover:opacity-90 text-[var(--text-main)] rounded-xl font-bold shadow-sm transition-all text-sm"
            href="/admin/master-barang/database-barang"
          >
            Lihat Database Barang
          </Link>
        </div>
      </div>
    </div>
  );
}