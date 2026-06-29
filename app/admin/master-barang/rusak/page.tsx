"use client";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { openDocument } from "@/lib/openDocument";
const MySwal = withReactContent(Swal);


import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function ListBarangRusakPage() {
  const [laporanRusak, setLaporanRusak] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pdfToView, setPdfToView] = useState<string | null>(null);

  useEffect(() => {
    fetchLaporan();
  }, []);

  const fetchLaporan = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/maintenance?status=Menunggu Tindakan Admin");
      const data = await res.json();
      if (data.success) {
        setLaporanRusak(data.data);
      }
    } catch (error) {
      console.error("Gagal mengambil data laporan rusak", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, action: string) => {
    let confirmMsg = action === "Menunggu Perbaikan" ? "Teruskan laporan ini ke Teknisi (Sarpras/Laboran)?" : "Batalkan laporan ini?";
    if (!(await MySwal.fire({ title: 'Konfirmasi', text: String(confirmMsg), icon: 'warning', showCancelButton: true, confirmButtonColor: '#4f46e5', cancelButtonColor: '#d33', confirmButtonText: 'Ya', cancelButtonText: 'Batal', background: '#1a1a1a', color: '#ffffff' })).isConfirmed) return;

    try {
      const res = await fetch("/api/maintenance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: action }),
      });
      const data = await res.json();
      if (data.success) {
        MySwal.fire({ title: 'Notifikasi Sistem', text: String("Status laporan berhasil diperbarui."), icon: 'info', confirmButtonColor: '#4f46e5', background: '#1a1a1a', color: '#ffffff' });
        fetchLaporan();
      } else {
        MySwal.fire({ title: 'Notifikasi Sistem', text: String(data.error || "Gagal memperbarui status."), icon: 'info', confirmButtonColor: '#4f46e5', background: '#1a1a1a', color: '#ffffff' });
      }
    } catch (error) {
      MySwal.fire({ title: 'Notifikasi Sistem', text: String("Terjadi kesalahan sistem saat memperbarui laporan."), icon: 'info', confirmButtonColor: '#4f46e5', background: '#1a1a1a', color: '#ffffff' });
    }
  };

  const handleHapusBarang = async (laporanId: number, kode_barang: string, no_urut_pendaft: number) => {
    if (!(await MySwal.fire({ title: 'Konfirmasi', text: String(`Hapus barang secara permanen dari database (Kode: ${kode_barang}, NUP: ${no_urut_pendaft})?`), icon: 'warning', showCancelButton: true, confirmButtonColor: '#4f46e5', cancelButtonColor: '#d33', confirmButtonText: 'Ya', cancelButtonText: 'Batal', background: '#1a1a1a', color: '#ffffff' })).isConfirmed) return;

    try {
      // 1. Delete from barangs
      const resBarang = await fetch(`/api/barangs?kode_barang=${kode_barang}&no_urut_pendaft=${no_urut_pendaft}`, {
        method: "DELETE"
      });
      const dataBarang = await resBarang.json();
      
      if (!dataBarang.success) {
        MySwal.fire({ title: 'Notifikasi Sistem', text: String(dataBarang.error || "Gagal menghapus barang dari database."), icon: 'info', confirmButtonColor: '#4f46e5', background: '#1a1a1a', color: '#ffffff' });
        return;
      }

      // 2. Reject the maintenance report so it disappears from this queue
      await fetch("/api/maintenance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: laporanId, status: "Ditolak", catatan: "Barang dihapus dari sistem oleh Admin." }),
      });

      MySwal.fire({ title: 'Notifikasi Sistem', text: String("Barang berhasil dihapus dan laporan dibatalkan."), icon: 'info', confirmButtonColor: '#4f46e5', background: '#1a1a1a', color: '#ffffff' });
      fetchLaporan();
    } catch (error) {
      MySwal.fire({ title: 'Notifikasi Sistem', text: String("Terjadi kesalahan saat menghapus barang."), icon: 'info', confirmButtonColor: '#4f46e5', background: '#1a1a1a', color: '#ffffff' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="relative overflow-hidden bg-[var(--bg-banner)] p-8 rounded-3xl text-white shadow-xl transition-colors duration-400">
        <div className="relative z-10 space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            List Barang Rusak
          </h1>
          <p className="text-white/80 max-w-2xl text-sm sm:text-base">
            Daftar laporan kerusakan yang telah dikonfirmasi oleh PJ Ruangan atau Laboran. Lakukan verifikasi dan tentukan tindakan selanjutnya.
          </p>
        </div>
      </div>

      <div className="bg-[var(--bg-panel)] border border-[var(--border-panel)] rounded-2xl p-8 text-[var(--text-muted)] transition-colors duration-400">
        {isLoading ? (
          <p className="text-center py-8">Memuat laporan barang rusak...</p>
        ) : laporanRusak.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-neutral-300 dark:text-neutral-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
            </svg>
            <p>Tidak ada laporan barang rusak yang menunggu tindakan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {laporanRusak.map((laporan) => (
              <div key={laporan.id} className="border border-[var(--border-panel)] rounded-xl p-6 relative overflow-hidden bg-[var(--bg-app)] transition-colors duration-400">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-[var(--text-main)] text-lg transition-colors duration-400">{laporan.nama_barang || "Barang Tidak Diketahui"}</h4>
                    <p className="text-xs text-indigo-600 font-semibold">{laporan.kode_barang} - {laporan.no_urut_pendaft}</p>
                  </div>
                  <span className="px-3 py-1 bg-[var(--tag-warning-bg)] text-[var(--tag-warning-text)] transition-colors duration-400 text-xs font-bold rounded-full">
                    Menunggu Tindakan Admin
                  </span>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold transition-colors duration-400">Ruangan Asal</p>
                      <p className="text-sm font-medium text-[var(--text-main)] transition-colors duration-400">{laporan.ruangan_asal || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold transition-colors duration-400">Dilaporkan Oleh</p>
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
                      <button 
                        onClick={() => setPdfToView(laporan.foto_url)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-[var(--text-main)] font-bold rounded-xl text-xs transition-all shadow-sm"
                      >
                        <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Lihat Dokumen Kerusakan
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[var(--border-panel)]">
                  <button 
                    onClick={() => handleUpdateStatus(laporan.id, "Menunggu Perbaikan")}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-sm text-center"
                  >
                    Lakukan Perbaikan
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(laporan.id, "Ditolak")}
                    className="flex-1 py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-700 font-bold rounded-xl text-sm transition-all shadow-sm text-center"
                  >
                    Batalkan Perbaikan
                  </button>
                  <button 
                    onClick={() => handleHapusBarang(laporan.id, laporan.kode_barang, laporan.no_urut_pendaft)}
                    className="flex-1 py-2.5 bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold rounded-xl text-sm transition-all shadow-sm text-center"
                  >
                    Hapus Barang
                  </button>
                </div>
              </div>
            ))}
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
                Pratinjau Dokumen
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
    </div>
  );
}
