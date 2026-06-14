"use client";

import React, { useState, useEffect } from "react";

export default function RiwayatMutasiPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [mutasiData, setMutasiData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("simulated_user");
      if (saved) {
        setCurrentUser(JSON.parse(saved));
      }

      const handleUserChange = () => {
        const updated = sessionStorage.getItem("simulated_user");
        if (updated) setCurrentUser(JSON.parse(updated));
      };
      window.addEventListener("simulated_user_change", handleUserChange);
      return () => window.removeEventListener("simulated_user_change", handleUserChange);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchMutasiData();
    }
  }, [currentUser]);

  const fetchMutasiData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/mutasi?role=${currentUser.role}&email=${encodeURIComponent(currentUser.email)}`);
      const data = await res.json();
      if (data.success) {
        setMutasiData(data.data);
      }
    } catch (error) {
      console.error("Gagal mengambil data mutasi", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) return null;

  const riwayatData = mutasiData.filter(m => m.status_mutasi !== "Menunggu");

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div className="relative overflow-hidden bg-[var(--bg-banner)] p-8 rounded-3xl text-white shadow-xl transition-colors duration-400">
        <div className="relative z-10 space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Riwayat Mutasi Barang
          </h1>
          <p className="text-white/80 max-w-2xl text-sm sm:text-base">
            Daftar pergerakan perpindahan barang yang sudah disetujui maupun ditolak.
          </p>
        </div>
      </div>

      <div className="bg-[var(--bg-panel)] transition-colors duration-400 border border-[var(--border-panel)] rounded-2xl shadow-sm overflow-hidden animate-fade-in">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-[var(--bg-app)] transition-colors duration-400">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  Data Barang
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  Pergerakan
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  Pengaju
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  Status Validasi
                </th>
              </tr>
            </thead>
            <tbody className="bg-[var(--bg-panel)] transition-colors duration-400 divide-y divide-neutral-200">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-[var(--text-muted)] text-sm">Memuat data...</td>
                </tr>
              ) : riwayatData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-[var(--text-muted)] text-sm">Belum ada riwayat mutasi.</td>
                </tr>
              ) : (
                riwayatData.map((m) => (
                  <tr key={m.id_mutasi} className="hover:bg-[var(--bg-app)] transition-colors duration-400">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-[var(--text-main)]">{m.nama_barang}</p>
                      <p className="text-xs text-[var(--text-muted)] font-mono mt-1">{m.kode_barang}_{m.no_urut_pendaft}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold text-[var(--text-muted)]">{m.ruangan_asal}</span>
                        <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                        <span className="font-semibold text-[var(--text-main)]">{m.id_ruangan_tujuan}</span>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] mt-1">Diajukan: {new Date(m.tanggal_mutasi).toLocaleDateString('id-ID')}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-[var(--text-main)]">{m.id_user_pengaju}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-start gap-1">
                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                          m.status_mutasi === 'Disetujui' ? 'bg-[var(--tag-success-bg)] text-[var(--tag-success-text)] transition-colors duration-400' : 'bg-[var(--tag-danger-bg)] text-[var(--tag-danger-text)] transition-colors duration-400'
                        }`}>
                          {m.status_mutasi}
                        </span>
                        {m.catatan_validasi && (
                          <p className="text-xs text-[var(--text-muted)] italic mt-1 max-w-[200px] truncate">
                            "{m.catatan_validasi}"
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
