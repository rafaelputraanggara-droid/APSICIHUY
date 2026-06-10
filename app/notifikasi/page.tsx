"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";

export default function NotifikasiPage() {
  const [activeTab, setActiveTab] = useState<"kerusakan" | "hilang" | "pendaftaran">("kerusakan");
  
  const [pendingAccounts, setPendingAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (activeTab === "pendaftaran") {
      fetchPendingAccounts();
    }
  }, [activeTab]);

  const fetchPendingAccounts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/pendaftaran");
      const data = await res.json();
      if (data.success) {
        setPendingAccounts(data.data);
      }
    } catch (error) {
      console.error("Gagal mengambil data pendaftaran", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (id: number, username: string, email: string) => {
    try {
      const res = await fetch("/api/verify-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "approve" }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`[SIMULASI EMAIL TERKIRIM KE ${email}]\n\nHalo ${username},\nAkun Anda telah DIVERIFIKASI. Anda sekarang bisa masuk ke SIPRABU.\n\nLink Login: http://localhost:3000/login`);
        fetchPendingAccounts();
      } else {
        alert("Gagal memverifikasi akun.");
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem saat memverifikasi.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 dark:from-indigo-950 dark:to-violet-950 p-8 rounded-3xl text-white shadow-xl">
          <div className="relative z-10 space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Pusat Notifikasi & Laporan
            </h1>
            <p className="text-indigo-100 max-w-2xl text-sm sm:text-base">
              Pantau laporan kerusakan, laporan barang hilang, dan pendaftaran akun baru.
            </p>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-neutral-200 dark:border-neutral-800">
          <nav className="flex space-x-8 overflow-x-auto" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("kerusakan")}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap cursor-pointer transition-all duration-200 ${
                activeTab === "kerusakan"
                  ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                  : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300 dark:text-neutral-400 dark:hover:text-neutral-300"
              }`}
            >
              Laporan Kerusakan
            </button>
            <button
              onClick={() => setActiveTab("hilang")}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap cursor-pointer transition-all duration-200 ${
                activeTab === "hilang"
                  ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                  : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300 dark:text-neutral-400 dark:hover:text-neutral-300"
              }`}
            >
              Laporan Barang Hilang
            </button>
            <button
              onClick={() => setActiveTab("pendaftaran")}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap cursor-pointer transition-all duration-200 ${
                activeTab === "pendaftaran"
                  ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                  : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300 dark:text-neutral-400 dark:hover:text-neutral-300"
              }`}
            >
              Laporan Pendaftaran Akun Baru
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 text-neutral-500">
          {activeTab === "kerusakan" && (
            <div className="text-center">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">Daftar Laporan Kerusakan</h3>
              <p>Belum ada laporan kerusakan baru yang masuk.</p>
            </div>
          )}
          {activeTab === "hilang" && (
            <div className="text-center">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">Daftar Laporan Barang Hilang</h3>
              <p>Belum ada laporan barang hilang yang tercatat.</p>
            </div>
          )}
          {activeTab === "pendaftaran" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Pendaftaran Mahasiswa (Menunggu Verifikasi)</h3>
              </div>
              
              {isLoading ? (
                <p className="text-center py-8">Memuat data pendaftaran...</p>
              ) : pendingAccounts.length === 0 ? (
                <p className="text-center py-8">Belum ada pendaftaran akun baru.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pendingAccounts.map((acc) => (
                    <div key={acc.id} className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 relative overflow-hidden bg-neutral-50 dark:bg-neutral-800/50">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-bold text-neutral-900 dark:text-white text-lg">{acc.username}</h4>
                          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">{acc.nim}</p>
                        </div>
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-bold rounded-full">
                          Menunggu
                        </span>
                      </div>
                      
                      <div className="space-y-2 mb-6">
                        <div>
                          <p className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">Email SSO</p>
                          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{acc.email_sso}</p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">Foto KTM</p>
                          <div className="mt-2 w-32 h-20 bg-neutral-200 dark:bg-neutral-700 rounded-lg overflow-hidden flex items-center justify-center border border-neutral-300 dark:border-neutral-600">
                            {acc.foto_ktm ? (
                              <img src={acc.foto_ktm} alt="KTM" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xs">Tidak ada</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button 
                          onClick={() => handleVerify(acc.id, acc.username, acc.email_sso)}
                          className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-sm"
                        >
                          Verifikasi Selesai
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
  );
}
