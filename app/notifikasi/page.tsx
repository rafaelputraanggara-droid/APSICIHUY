"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";

export default function NotifikasiPage() {
  const [activeTab, setActiveTab] = useState<"kerusakan" | "hilang" | "pendaftaran">("kerusakan");
  
  const [pendingAccounts, setPendingAccounts] = useState<any[]>([]);
  const [pendingKerusakan, setPendingKerusakan] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pdfToView, setPdfToView] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUser = sessionStorage.getItem("simulated_user");
      if (savedUser) {
        try {
          setUserRole(JSON.parse(savedUser).role);
        } catch (e) {}
      }
      
      const handleUserChange = () => {
        const updated = sessionStorage.getItem("simulated_user");
        if (updated) {
          try {
            setUserRole(JSON.parse(updated).role);
            if (JSON.parse(updated).role === "PJ_Ruangan" && activeTab === "pendaftaran") {
              setActiveTab("kerusakan");
            }
          } catch (e) {}
        }
      };
      
      window.addEventListener("simulated_user_change", handleUserChange);
      return () => window.removeEventListener("simulated_user_change", handleUserChange);
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "pendaftaran") {
      fetchPendingAccounts();
    } else if (activeTab === "kerusakan") {
      fetchPendingKerusakan();
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

  const fetchPendingKerusakan = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/maintenance?status=Menunggu");
      const data = await res.json();
      if (data.success) {
        setPendingKerusakan(data.data);
      }
    } catch (error) {
      console.error("Gagal mengambil data kerusakan", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateKerusakan = async (id: number, status: string) => {
    try {
      const res = await fetch("/api/maintenance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (data.success) {
        fetchPendingKerusakan();
      } else {
        alert(data.error || "Gagal memperbarui status.");
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem saat memperbarui laporan kerusakan.");
    }
  };

  const handleVerify = async (id: number, username: string, email: string, action: "approve" | "reject") => {
    try {
      const res = await fetch("/api/verify-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json();
      if (data.success) {
        if (action === "approve") {
          alert(`[SIMULASI EMAIL TERKIRIM KE ${email}]\n\nHalo ${username},\nAkun Anda telah DIVERIFIKASI. Anda sekarang bisa masuk ke SIPRABU.\n\nLink Login: http://localhost:3000/login`);
        } else {
          alert(`[SIMULASI EMAIL TERKIRIM KE ${email}]\n\nHalo ${username},\nMohon maaf, pendaftaran akun Anda DITOLAK.`);
        }
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
        <div className="relative overflow-hidden bg-[var(--bg-banner)] p-8 rounded-3xl text-white shadow-xl transition-colors duration-400">
          <div className="relative z-10 space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Pusat Notifikasi & Laporan
            </h1>
            <p className="text-white/80 max-w-2xl text-sm sm:text-base">
              Pantau laporan kerusakan, laporan barang hilang, dan pendaftaran akun baru.
            </p>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-[var(--border-panel)]">
          <nav className="flex space-x-8 overflow-x-auto" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("kerusakan")}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap cursor-pointer transition-all duration-200 ${
                activeTab === "kerusakan"
                  ? "border-indigo-600 text-indigo-600 dark:border-indigo-400"
                  : "border-transparent text-[var(--text-muted)] hover:text-neutral-700 hover:border-neutral-300 dark:text-neutral-400 dark:hover:text-neutral-300"
              }`}
            >
              Laporan Kerusakan
            </button>
            {userRole !== "Laboran" && (
              <button
                onClick={() => setActiveTab("hilang")}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap cursor-pointer transition-all duration-200 ${
                  activeTab === "hilang"
                    ? "border-indigo-600 text-indigo-600 dark:border-indigo-400"
                    : "border-transparent text-[var(--text-muted)] hover:text-neutral-700 hover:border-neutral-300 dark:text-neutral-400 dark:hover:text-neutral-300"
                }`}
              >
                Laporan Barang Hilang
              </button>
            )}
            {userRole === "Admin Fakultas" && (
              <button
                onClick={() => setActiveTab("pendaftaran")}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap cursor-pointer transition-all duration-200 ${
                  activeTab === "pendaftaran"
                    ? "border-indigo-600 text-indigo-600 dark:border-indigo-400"
                    : "border-transparent text-[var(--text-muted)] hover:text-neutral-700 hover:border-neutral-300 dark:text-neutral-400 dark:hover:text-neutral-300"
                }`}
              >
                Laporan Pendaftaran Akun Baru
              </button>
            )}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-[var(--bg-panel)] border border-[var(--border-panel)] rounded-2xl p-8 text-[var(--text-muted)] transition-colors duration-400">
          {activeTab === "kerusakan" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-[var(--text-main)] transition-colors duration-400">Daftar Laporan Kerusakan</h3>
              </div>
              
              {isLoading ? (
                <p className="text-center py-8">Memuat data laporan kerusakan...</p>
              ) : pendingKerusakan.length === 0 ? (
                <p className="text-center py-8">Belum ada laporan kerusakan baru yang masuk.</p>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {pendingKerusakan.map((laporan) => (
                    <div key={laporan.id} className="border border-[var(--border-panel)] rounded-xl p-6 relative overflow-hidden bg-[var(--bg-app)] transition-colors duration-400">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-bold text-[var(--text-main)] text-lg transition-colors duration-400">{laporan.nama_barang || "Barang Tidak Diketahui"}</h4>
                          <p className="text-xs text-indigo-600 font-semibold">{laporan.kode_barang} - {laporan.no_urut_pendaft}</p>
                        </div>
                        <span className="px-3 py-1 bg-[var(--tag-warning-bg)] text-[var(--tag-warning-text)] transition-colors duration-400 text-xs font-bold rounded-full">
                          Menunggu
                        </span>
                      </div>
                      
                      <div className="space-y-4 mb-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold transition-colors duration-400">Ruangan Asal</p>
                            <p className="text-sm font-medium text-[var(--text-main)] transition-colors duration-400">{laporan.ruangan_asal || "-"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold transition-colors duration-400">Pelapor</p>
                            <p className="text-sm font-medium text-[var(--text-main)] transition-colors duration-400">{laporan.dilaporkan_oleh}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold transition-colors duration-400">Kendala</p>
                          <p className="text-sm font-medium text-[var(--text-main)] transition-colors duration-400 mt-1">{laporan.deskripsi_kerusakan}</p>
                        </div>
                      </div>

                      {userRole === "Laboran" && (
                        <div className="flex gap-3 mt-4">
                          <button 
                            onClick={() => handleUpdateKerusakan(laporan.id, "Ditolak")}
                            className="flex-1 py-2.5 bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold rounded-xl text-sm transition-all shadow-sm"
                          >
                            Tolak
                          </button>
                          <button 
                            onClick={() => handleUpdateKerusakan(laporan.id, "Diterima")}
                            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-sm"
                          >
                            Terima Laporan
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {activeTab === "hilang" && (
            <div className="text-center">
              <h3 className="text-lg font-bold text-[var(--text-main)] transition-colors duration-400 mb-2">Daftar Laporan Barang Hilang</h3>
              <p>Belum ada laporan barang hilang yang tercatat.</p>
            </div>
          )}
          {activeTab === "pendaftaran" && userRole === "Admin Fakultas" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-[var(--text-main)] transition-colors duration-400">Pendaftaran Mahasiswa (Menunggu Verifikasi)</h3>
              </div>
              
              {isLoading ? (
                <p className="text-center py-8">Memuat data pendaftaran...</p>
              ) : pendingAccounts.length === 0 ? (
                <p className="text-center py-8">Belum ada pendaftaran akun baru.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pendingAccounts.map((acc) => (
                    <div key={acc.id} className="border border-[var(--border-panel)] rounded-xl p-6 relative overflow-hidden bg-[var(--bg-app)] transition-colors duration-400">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-bold text-[var(--text-main)] text-lg transition-colors duration-400">{acc.username}</h4>
                          <p className="text-xs text-indigo-600 font-semibold">{acc.nim}</p>
                        </div>
                        <span className="px-3 py-1 bg-[var(--tag-warning-bg)] text-[var(--tag-warning-text)] transition-colors duration-400 text-xs font-bold rounded-full">
                          Menunggu
                        </span>
                      </div>
                      
                      <div className="space-y-2 mb-6">
                        <div>
                          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold transition-colors duration-400">Email SSO</p>
                          <p className="text-sm font-medium text-[var(--text-main)] transition-colors duration-400">{acc.email_sso}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold transition-colors duration-400">Peran & Berkas</p>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-sm font-bold text-[var(--text-main)] transition-colors duration-400">
                              {acc.peran_pengaju === "PJ_Ruangan" ? "PJ Ruangan" : "Mahasiswa"}
                            </span>
                            <div className="flex gap-2">
                              {acc.dokumen_pdf ? (
                                <>
                                  <button
                                    onClick={() => setPdfToView(acc.dokumen_pdf)}
                                    className="px-3 py-1.5 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    Lihat PDF
                                  </button>
                                  <a
                                    href={acc.dokumen_pdf}
                                    download
                                    className="px-3 py-1.5 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Unduh
                                  </a>
                                </>
                              ) : (
                                <span className="text-xs text-[var(--text-muted)]">Tidak ada berkas</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 mt-4">
                        <button 
                          onClick={() => handleVerify(acc.id, acc.username, acc.email_sso, "reject")}
                          className="flex-1 py-2.5 bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold rounded-xl text-sm transition-all shadow-sm"
                        >
                          Tolak
                        </button>
                        <button 
                          onClick={() => handleVerify(acc.id, acc.username, acc.email_sso, "approve")}
                          className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-sm"
                        >
                          Setujui
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Lihat PDF */}
        {pdfToView && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
            <div className="bg-[var(--bg-panel)] transition-colors duration-400 rounded-3xl w-full max-w-4xl h-[85vh] shadow-2xl flex flex-col overflow-hidden relative">
              <div className="flex justify-between items-center p-4 border-b border-[var(--border-panel)]">
                <h3 className="font-bold text-[var(--text-main)] transition-colors duration-400 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Berkas Identitas (PDF)
                </h3>
                <button 
                  onClick={() => setPdfToView(null)}
                  className="p-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-rose-100 dark:hover:bg-rose-900/30 text-[var(--text-muted)] hover:text-rose-600 dark:hover:text-rose-400 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 bg-neutral-100 bg-[var(--bg-app)] p-2">
                <object 
                  data={pdfToView} 
                  type="application/pdf" 
                  className="w-full h-full rounded-xl"
                >
                  <p className="text-center mt-10">Browser Anda tidak mendukung preview PDF. <a href={pdfToView} download className="text-[var(--tag-info-text)] transition-colors duration-400 underline">Unduh PDF disini</a>.</p>
                </object>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
