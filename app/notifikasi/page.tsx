"use client";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
const MySwal = withReactContent(Swal);


import React, { useState, useEffect } from "react";

import RiwayatLaporanPage from "../riwayat/laporan-saya/page";
import LoadingDots from "@/components/LoadingDots";
import TableSkeleton from "@/components/TableSkeleton";
import { openDocument } from "@/lib/openDocument";

export default function NotifikasiPage() {
  const [activeTab, setActiveTab] = useState<"kerusakan" | "hilang" | "pendaftaran" | "riwayat">("kerusakan");
  
  const [pendingAccounts, setPendingAccounts] = useState<any[]>([]);
  const [pendingKerusakan, setPendingKerusakan] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pdfToView, setPdfToView] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>("");
  const [kerusakanModal, setKerusakanModal] = useState<{ isOpen: boolean; id: number; action: string; catatan: string } | null>(null);
  const [barangHilang, setBarangHilang] = useState<any[]>([]);
  const [selectedHilangRoom, setSelectedHilangRoom] = useState<string | null>(null);
  
  const [hilangModal, setHilangModal] = useState<{ isOpen: boolean; barang: any; file: File | null } | null>(null);
  const fileHilangInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUser = sessionStorage.getItem("simulated_user");
      if (savedUser) {
        try {
          const role = JSON.parse(savedUser).role;
          setUserRole(role);
          if (role === "Mahasiswa/Dosen" || role === "Mahasiswa") {
            setActiveTab("riwayat");
          }
        } catch (e) {}
      }
      
      const handleUserChange = () => {
        const updated = sessionStorage.getItem("simulated_user");
        if (updated) {
          try {
            const parsedRole = JSON.parse(updated).role;
            setUserRole(parsedRole);
            if (parsedRole === "PJ_Ruangan" && activeTab === "pendaftaran") {
              setActiveTab("kerusakan");
            } else if ((parsedRole === "Mahasiswa/Dosen" || parsedRole === "Mahasiswa") && activeTab !== "riwayat") {
              setActiveTab("riwayat");
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
    } else if (activeTab === "hilang") {
      setSelectedHilangRoom(null);
      fetchBarangHilang();
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
      const res = await fetch("/api/maintenance?status=Menunggu Konfirmasi PJ");
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



  const fetchBarangHilang = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/barang-hilang");
      const data = await res.json();
      if (data.success) {
        setBarangHilang(data.data);
      }
    } catch (error) {
      console.error("Gagal mengambil data barang hilang", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateKerusakan = (id: number, status: string) => {
    setKerusakanModal({ isOpen: true, id, action: status, catatan: "" });
  };

  const submitUpdateKerusakan = async () => {
    if (!kerusakanModal) return;
    const { id, action, catatan } = kerusakanModal;
    
    if (action === "Ditolak" && !catatan.trim()) {
      MySwal.fire({ title: 'Notifikasi Sistem', text: String("Alasan penolakan wajib diisi!"), icon: 'info', confirmButtonColor: '#4f46e5', background: '#1a1a1a', color: '#ffffff' });
      return;
    }

    try {
      const res = await fetch("/api/maintenance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: action, catatan }),
      });
      const data = await res.json();
      if (data.success) {
        setKerusakanModal(null);
        fetchPendingKerusakan();
      } else {
        MySwal.fire({ title: 'Notifikasi Sistem', text: String(data.error || "Gagal memperbarui status."), icon: 'info', confirmButtonColor: '#4f46e5', background: '#1a1a1a', color: '#ffffff' });
      }
    } catch (error) {
      MySwal.fire({ title: 'Notifikasi Sistem', text: String("Terjadi kesalahan sistem saat memperbarui laporan kerusakan."), icon: 'info', confirmButtonColor: '#4f46e5', background: '#1a1a1a', color: '#ffffff' });
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
          MySwal.fire({ title: 'Notifikasi Sistem', text: String(`Pendaftaran ${username} berhasil disetujui.`), icon: 'info', confirmButtonColor: '#4f46e5', background: '#1a1a1a', color: '#ffffff' });
        } else {
          MySwal.fire({ title: 'Notifikasi Sistem', text: String(`Pendaftaran ${username} telah ditolak.`), icon: 'info', confirmButtonColor: '#4f46e5', background: '#1a1a1a', color: '#ffffff' });
        }
        fetchPendingAccounts();
      } else {
        MySwal.fire({ title: 'Notifikasi Sistem', text: String("Gagal memverifikasi akun."), icon: 'info', confirmButtonColor: '#4f46e5', background: '#1a1a1a', color: '#ffffff' });
      }
    } catch (error) {
      MySwal.fire({ title: 'Notifikasi Sistem', text: String("Terjadi kesalahan sistem saat memverifikasi."), icon: 'info', confirmButtonColor: '#4f46e5', background: '#1a1a1a', color: '#ffffff' });
    }
  };

  const submitResolusiHilang = async () => {
    if (!hilangModal || !hilangModal.file) {
      MySwal.fire({ title: 'Peringatan', text: 'Dokumen bukti wajib diunggah!', icon: 'warning', background: '#1a1a1a', color: '#ffffff' });
      return;
    }

    try {
      const fileToDataUrl = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      };
      
      const base64pdf = await fileToDataUrl(hilangModal.file);

      const res = await fetch("/api/barang-hilang", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          kode_barang: hilangModal.barang.kode_barang, 
          no_urut_pendaft: hilangModal.barang.no_urut_pendaft, 
          bukti_ditemukan_pdf: base64pdf 
        }),
      });
      const data = await res.json();
      if (data.success) {
        setHilangModal(null);
        fetchBarangHilang();
        MySwal.fire({ title: 'Berhasil', text: 'Barang berhasil ditandai telah ditemukan!', icon: 'success', confirmButtonColor: '#4f46e5', background: '#1a1a1a', color: '#ffffff' });
      } else {
        MySwal.fire({ title: 'Gagal', text: data.error || 'Terjadi kesalahan', icon: 'error', background: '#1a1a1a', color: '#ffffff' });
      }
    } catch (e) {
      MySwal.fire({ title: 'Gagal', text: 'Terjadi kesalahan jaringan', icon: 'error', background: '#1a1a1a', color: '#ffffff' });
    }
  };

  const visibleBarangHilang = barangHilang.filter(b => {
    if (userRole === "Laboran") {
      return b.lokasi_ruangan && (b.lokasi_ruangan.startsWith("6") || b.lokasi_ruangan.toLowerCase().includes("laboratorium"));
    }
    if (userRole === "PJ_Ruangan") {
      return b.lokasi_ruangan && (b.lokasi_ruangan.match(/^[1-5]/) && !b.lokasi_ruangan.toLowerCase().includes("laboratorium"));
    }
    return true; 
  });

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
            {userRole === "PJ_Ruangan" && (
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
            )}
            {userRole !== "Laboran" && userRole !== "Mahasiswa/Dosen" && userRole !== "Mahasiswa" && (
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
                <LoadingDots text="Memuat data laporan kerusakan..." />
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
                        {laporan.foto_url && (
                          <div className="pt-2 mt-2 border-t border-[var(--border-panel)]">
                            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold transition-colors duration-400 mb-2 mt-2">Bukti Kerusakan (PDF)</p>
                            <button onClick={() => openDocument(laporan.foto_url)} className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-[var(--text-main)] font-bold rounded-xl text-xs transition-all shadow-sm">
                              <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Buka / Unduh Dokumen
                            </button>
                          </div>
                        )}
                      </div>

                      {userRole === "PJ_Ruangan" && (
                        <div className="flex gap-3 mt-4">
                          <button 
                            onClick={() => handleUpdateKerusakan(laporan.id, "Ditolak")}
                            className="flex-1 py-2.5 bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold rounded-xl text-sm transition-all shadow-sm"
                          >
                            Tolak
                          </button>
                          <button 
                            onClick={() => handleUpdateKerusakan(laporan.id, "Menunggu Tindakan Admin")}
                            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-sm"
                          >
                            Teruskan ke Admin
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
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-[var(--text-main)] transition-colors duration-400">Daftar Laporan Barang Hilang (Dari Stok Opname)</h3>
              </div>
              
              {isLoading ? (
                <LoadingDots text="Memuat data barang hilang..." />
              ) : visibleBarangHilang.length === 0 ? (
                <p className="text-center py-8">Tidak ada barang hilang yang tercatat dari sesi stok opname.</p>
              ) : selectedHilangRoom ? (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center gap-4 border-b border-[var(--border-panel)] pb-4">
                    <button 
                      onClick={() => setSelectedHilangRoom(null)} 
                      className="p-2 bg-[var(--bg-panel)] transition-colors duration-400 border border-[var(--border-panel)] rounded-xl hover:bg-[var(--bg-app)]"
                    >
                      <svg className="w-5 h-5 text-neutral-600 dark:text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                    </button>
                    <div>
                      <h4 className="font-bold text-[var(--text-main)] text-xl transition-colors duration-400">Ruangan: {selectedHilangRoom}</h4>
                      <p className="text-sm text-[var(--text-muted)]">
                        {visibleBarangHilang.filter(b => b.lokasi_ruangan === selectedHilangRoom).length} Barang Hilang
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6">
                    {visibleBarangHilang.filter(b => b.lokasi_ruangan === selectedHilangRoom).map((barang, idx) => (
                      <div key={idx} className="border border-rose-200 dark:border-rose-900/50 rounded-xl p-6 relative overflow-hidden bg-rose-50/30 dark:bg-rose-900/10 transition-colors duration-400">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-bold text-[var(--text-main)] text-lg transition-colors duration-400">{barang.nama_barang || "Barang Tidak Diketahui"}</h4>
                            <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">{barang.kode_barang} - {barang.no_urut_pendaft}</p>
                          </div>
                          <span className="px-3 py-1 bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400 transition-colors duration-400 text-xs font-bold rounded-full">
                            Hilang
                          </span>
                        </div>
                        <p className="text-sm font-medium text-[var(--text-main)] transition-colors duration-400 mt-2">Dinyatakan hilang pada Stock Opname selesai tanggal: {new Date(barang.tanggal_selesai).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
                        
                        {(userRole === "PJ_Ruangan" || userRole === "Laboran") && (
                          <div className="pt-4 mt-4 border-t border-rose-200 dark:border-rose-900/30">
                            <button 
                              onClick={() => setHilangModal({ isOpen: true, barang: barang, file: null })}
                              className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm shadow-sm transition-all"
                            >
                              Tandai Telah Ditemukan
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from(new Set(visibleBarangHilang.map(b => b.lokasi_ruangan).filter(Boolean))).map((room) => {
                    const count = visibleBarangHilang.filter(b => b.lokasi_ruangan === room).length;
                    return (
                      <button 
                        key={room as string}
                        onClick={() => setSelectedHilangRoom(room as string)}
                        className="group flex flex-col items-center justify-center p-8 bg-[var(--bg-app)] border border-[var(--border-panel)] rounded-2xl hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:border-rose-300 dark:hover:border-rose-700 transition-all duration-300 shadow-sm relative"
                      >
                        <div className="absolute top-3 right-3 bg-rose-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md animate-pulse">
                          {count}
                        </div>
                        <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </div>
                        <h4 className="text-xl font-bold text-[var(--text-main)] mb-2 group-hover:text-rose-700 dark:group-hover:text-rose-400 transition-colors">{room as string}</h4>
                        <span className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 text-[var(--text-muted)] text-sm font-bold rounded-full">
                          Ada Barang Hilang
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          {activeTab === "riwayat" && (userRole === "Mahasiswa/Dosen" || userRole === "Mahasiswa") && (
            <div className="mt-[-1rem]">
              <RiwayatLaporanPage />
            </div>
          )}
          {activeTab === "pendaftaran" && userRole === "Admin Fakultas" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-[var(--text-main)] transition-colors duration-400">Pendaftaran Mahasiswa (Menunggu Verifikasi)</h3>
              </div>
              
              {isLoading ? (
                <LoadingDots text="Memuat data pendaftaran..." />
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
                                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    Lihat Dokumen
                                  </button>
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
                  <button onClick={() => openDocument(pdfToView)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Cetak / Buka</button>
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

        {/* Modal for Update Kerusakan (Tolak/Terima) */}
        {kerusakanModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-[var(--bg-panel)] rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-scale-in border border-[var(--border-panel)]">
              <div className="p-6 border-b border-[var(--border-panel)]">
                <h3 className="text-xl font-bold text-[var(--text-main)]">
                  {kerusakanModal.action === "Ditolak" ? "Tolak Laporan Kerusakan" : "Terima Laporan Kerusakan"}
                </h3>
              </div>
              <div className="p-6">
                <label className="block text-sm font-semibold text-[var(--text-main)] mb-2">
                  {kerusakanModal.action === "Ditolak" ? "Alasan Penolakan (Wajib)" : "Catatan Tambahan (Opsional)"}
                </label>
                <textarea
                  className="w-full border border-[var(--border-input)] rounded-xl p-3 bg-[var(--bg-input)] text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={4}
                  placeholder={kerusakanModal.action === "Ditolak" ? "Masukkan alasan kenapa laporan ditolak..." : "Catatan untuk pelapor (opsional)..."}
                  value={kerusakanModal.catatan}
                  onChange={(e) => setKerusakanModal({ ...kerusakanModal, catatan: e.target.value })}
                />
              </div>
              <div className="p-6 border-t border-[var(--border-panel)] bg-[var(--bg-app)] flex justify-end gap-3">
                <button
                  onClick={() => setKerusakanModal(null)}
                  className="px-5 py-2.5 rounded-xl font-bold text-[var(--text-muted)] hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={submitUpdateKerusakan}
                  className={`px-5 py-2.5 rounded-xl font-bold text-white transition-colors ${
                    kerusakanModal.action === "Ditolak" ? "bg-rose-600 hover:bg-rose-700" : "bg-emerald-600 hover:bg-emerald-700"
                  }`}
                >
                  Konfirmasi
                </button>
              </div>
            </div>
          </div>
        )}

      {/* Hilang Action Modal */}
      {hilangModal && hilangModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[var(--bg-panel)] rounded-3xl p-8 max-w-md w-full shadow-2xl relative transition-all animate-scale-in border border-[var(--border-panel)]">
            <h3 className="text-xl font-bold text-[var(--text-main)] mb-2">Barang Ditemukan</h3>
            <p className="text-sm text-[var(--text-muted)] mb-6">Unggah bukti (foto/PDF) bahwa barang <b>{hilangModal.barang.nama_barang}</b> telah ditemukan kembali.</p>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-[var(--text-muted)] mb-2">Unggah Bukti Dokumen</label>
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null;
                    if (f && f.size > 2 * 1024 * 1024) {
                      MySwal.fire({ title: 'Gagal', text: 'Ukuran file maksimal 2MB', icon: 'error', background: '#1a1a1a', color: '#ffffff' });
                      if (fileHilangInputRef.current) fileHilangInputRef.current.value = "";
                      return;
                    }
                    setHilangModal({ ...hilangModal, file: f });
                  }}
                  ref={fileHilangInputRef}
                  className="block w-full text-sm text-[var(--text-main)]
                    file:mr-4 file:py-2.5 file:px-4
                    file:rounded-xl file:border-0
                    file:text-sm file:font-semibold
                    file:bg-indigo-50 file:text-indigo-700
                    dark:file:bg-indigo-900/30 dark:file:text-indigo-400
                    hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900/50 cursor-pointer"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setHilangModal(null)} className="flex-1 py-3 bg-[var(--bg-app)] hover:bg-neutral-200 dark:hover:bg-neutral-800 text-[var(--text-main)] font-bold rounded-xl transition-colors">
                Batal
              </button>
              <button onClick={submitResolusiHilang} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all">
                Kirim Bukti
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
