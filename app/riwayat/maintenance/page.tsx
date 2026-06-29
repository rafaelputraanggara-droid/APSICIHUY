"use client";

import React, { useState, useEffect } from "react";

export default function RiwayatMaintenancePage() {
  const [maintenanceHistory, setMaintenanceHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pdfToView, setPdfToView] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>("");
  const [selectedMaintenanceRoom, setSelectedMaintenanceRoom] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUser = sessionStorage.getItem("simulated_user");
      if (savedUser) {
        try {
          const role = JSON.parse(savedUser).role;
          setUserRole(role);
        } catch (e) {}
      }
      
      const handleUserChange = () => {
        const updated = sessionStorage.getItem("simulated_user");
        if (updated) {
          try {
            const parsedRole = JSON.parse(updated).role;
            setUserRole(parsedRole);
          } catch (e) {}
        }
      };
      
      window.addEventListener("simulated_user_change", handleUserChange);
      return () => window.removeEventListener("simulated_user_change", handleUserChange);
    }
  }, []);

  useEffect(() => {
    fetchMaintenanceHistory();
  }, []);

  const fetchMaintenanceHistory = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/maintenance?status=Selesai");
      const data = await res.json();
      if (data.success) {
        setMaintenanceHistory(data.data);
      }
    } catch (error) {
      console.error("Gagal mengambil histori maintenance", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (userRole !== "Admin Fakultas" && userRole !== "Laboran" && userRole !== "PJ_Ruangan" && userRole !== "Sarpras") {
    return <div className="p-8 text-center">Anda tidak memiliki akses ke halaman ini.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div className="relative overflow-hidden bg-[var(--bg-banner)] p-8 rounded-3xl text-white shadow-xl transition-colors duration-400">
        <div className="relative z-10 space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Riwayat Maintenance
          </h1>
          <p className="text-white/80 max-w-2xl text-sm sm:text-base">
            Pantau dan cetak riwayat perbaikan barang (maintenance) yang sudah selesai dilakukan.
          </p>
        </div>
      </div>

      <div className="bg-[var(--bg-panel)] border border-[var(--border-panel)] rounded-2xl p-8 text-[var(--text-muted)] transition-colors duration-400">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-[var(--text-main)] transition-colors duration-400">Riwayat Perbaikan Barang Selesai</h3>
        </div>
        
        {isLoading ? (
          <p className="text-center py-8">Memuat riwayat maintenance...</p>
        ) : maintenanceHistory.length === 0 ? (
          <p className="text-center py-8">Belum ada riwayat maintenance yang selesai.</p>
        ) : selectedMaintenanceRoom ? (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-4 border-b border-[var(--border-panel)] pb-4">
              <button 
                onClick={() => setSelectedMaintenanceRoom(null)} 
                className="p-2 bg-[var(--bg-panel)] transition-colors duration-400 border border-[var(--border-panel)] rounded-xl hover:bg-[var(--bg-app)]"
              >
                <svg className="w-5 h-5 text-neutral-600 dark:text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h4 className="font-bold text-[var(--text-main)] text-xl transition-colors duration-400">Ruangan: {selectedMaintenanceRoom}</h4>
                <p className="text-sm text-[var(--text-muted)]">
                  {maintenanceHistory.filter(l => l.ruangan_asal === selectedMaintenanceRoom).length} Laporan Selesai
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {maintenanceHistory.filter(l => l.ruangan_asal === selectedMaintenanceRoom).map((laporan) => (
                <div key={laporan.id} className="border border-[var(--border-panel)] rounded-xl p-6 relative overflow-hidden bg-[var(--bg-app)] transition-colors duration-400">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-[var(--text-main)] text-lg transition-colors duration-400">{laporan.nama_barang || "Barang Tidak Diketahui"}</h4>
                      <p className="text-xs text-indigo-600 font-semibold">{laporan.kode_barang} - {laporan.no_urut_pendaft}</p>
                    </div>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 transition-colors duration-400 text-xs font-bold rounded-full">
                      Selesai
                    </span>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold transition-colors duration-400">Teknisi / Laboran</p>
                        <p className="text-sm font-medium text-[var(--text-main)] transition-colors duration-400">{laporan.nama_teknisi || "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold transition-colors duration-400">Kendala Awal</p>
                        <p className="text-sm font-medium text-[var(--text-main)] transition-colors duration-400 mt-1">{laporan.deskripsi_kerusakan}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 border-t border-[var(--border-panel)] pt-4">
                    {laporan.foto_url && (
                      <button 
                        onClick={() => setPdfToView(laporan.foto_url)}
                        className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-[var(--text-main)] font-bold rounded-xl text-xs transition-all shadow-sm flex justify-center items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Bukti Kerusakan Awal
                      </button>
                    )}
                    {laporan.bukti_penyelesaian_pdf && (
                      <button 
                        onClick={() => setPdfToView(laporan.bukti_penyelesaian_pdf)}
                        className="flex-1 py-2.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 font-bold rounded-xl text-xs transition-all shadow-sm flex justify-center items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Bukti Lokasi
                      </button>
                    )}
                    {laporan.foto_url && (
                      <button 
                        onClick={() => setPdfToView(laporan.foto_url)}
                        className="flex-1 py-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/30 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-400 font-bold rounded-xl text-xs transition-all shadow-sm flex justify-center items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Bukti Kerusakan
                      </button>
                    )}
                    {laporan.bukti_administrasi_pdf && (userRole === "Admin Fakultas" || userRole === "Laboran" || userRole === "Sarpras") && (
                      <button 
                        onClick={() => setPdfToView(laporan.bukti_administrasi_pdf)}
                        className="flex-1 py-2.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 font-bold rounded-xl text-xs transition-all shadow-sm flex justify-center items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Bukti Administrasi / Nota
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from(new Set(maintenanceHistory.map(l => l.ruangan_asal).filter(Boolean))).map((room) => {
              const count = maintenanceHistory.filter(l => l.ruangan_asal === room).length;
              return (
                <button 
                  key={room as string}
                  onClick={() => setSelectedMaintenanceRoom(room as string)}
                  className="group flex flex-col items-center justify-center p-8 bg-[var(--bg-app)] border border-[var(--border-panel)] rounded-2xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300 shadow-sm"
                >
                  <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold text-[var(--text-main)] mb-2 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">{room as string}</h4>
                  <span className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 text-[var(--text-muted)] text-sm font-bold rounded-full">
                    {count} Laporan Selesai
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Lihat PDF */}
      {pdfToView && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
          onClick={() => setPdfToView(null)}
        >
          <div 
            className="bg-[var(--bg-panel)] transition-colors duration-400 rounded-3xl w-full max-w-4xl h-[85vh] shadow-2xl flex flex-col overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b border-[var(--border-panel)]">
              <h3 className="font-bold text-[var(--text-main)] transition-colors duration-400 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Pratinjau Dokumen PDF
              </h3>
              <div className="flex items-center gap-3">
                <a 
                  href={pdfToView}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Cetak / Buka
                </a>
                <button 
                  onClick={() => setPdfToView(null)}
                  className="p-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-rose-100 dark:hover:bg-rose-900/30 text-[var(--text-muted)] hover:text-rose-600 dark:hover:text-rose-400 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
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
