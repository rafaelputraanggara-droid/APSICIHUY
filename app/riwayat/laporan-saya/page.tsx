'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { openDocument } from "@/lib/openDocument";
export default function RiwayatLaporanPage() {
  const router = useRouter();
  const [laporans, setLaporans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Authentication check
  useEffect(() => {
    const saved = sessionStorage.getItem("simulated_user");
    if (!saved) {
      router.push("/login");
      return;
    }

    try {
      const parsed = JSON.parse(saved);
      if (parsed.role !== "Mahasiswa/Dosen" && parsed.role !== "Mahasiswa") {
        router.push("/dashboard");
        return;
      }
      
      if (parsed.id || parsed.name) {
        fetchRiwayat(parsed.id || 0, parsed.name || "");
      } else {
        setLoading(false);
      }
    } catch (e) {
      router.push("/login");
    }
  }, [router]);

  const fetchRiwayat = async (pelaporId: number, pelaporName: string) => {
    try {
      const res = await fetch(`/api/riwayat-laporan?pelapor_id=${pelaporId}&nama_pelapor=${encodeURIComponent(pelaporName)}`);
      const data = await res.json();
      if (data.success) {
        setLaporans(data.data);
      } else {
        console.error("Gagal mengambil riwayat laporan", data.error);
      }
    } catch (error) {
      console.error("Kesalahan jaringan:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Diterima':
      case 'Selesai':
        return 'bg-[var(--tag-success-bg)] text-[var(--tag-success-text)]';
      case 'Ditolak':
        return 'bg-[var(--tag-danger-bg)] text-[var(--tag-danger-text)]';
      case 'Sedang Diperbaiki':
        return 'bg-[var(--tag-info-bg)] text-[var(--tag-info-text)]';
      default:
        return 'bg-[var(--tag-warning-bg)] text-[var(--tag-warning-text)]';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[var(--bg-panel)] transition-colors duration-400 p-6 rounded-2xl shadow-sm border border-[var(--border-panel)]">
        <h2 className="text-2xl font-bold text-[var(--text-main)] transition-colors duration-400">Riwayat Laporan Kerusakan</h2>
        <p className="text-sm text-[var(--text-muted)] mt-1">Daftar laporan kerusakan yang pernah Anda ajukan beserta status terbarunya.</p>
      </div>

      <div className="bg-[var(--bg-panel)] transition-colors duration-400 border border-[var(--border-panel)] rounded-2xl p-6 shadow-sm">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : laporans.length === 0 ? (
          <div className="text-center py-12 text-[var(--text-muted)]">
            <svg className="mx-auto h-12 w-12 text-neutral-300 dark:text-neutral-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>Anda belum pernah mengajukan laporan kerusakan.</p>
            <p className="text-xs mt-1 text-neutral-400">Silakan scan QR Code pada aset untuk membuat laporan baru.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {laporans.map((laporan) => (
              <div key={laporan.id} className="border border-[var(--border-panel)] rounded-xl p-5 relative overflow-hidden bg-[var(--bg-app)] transition-colors duration-400">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4 border-b border-[var(--border-panel)] pb-4">
                  <div>
                    <h3 className="font-bold text-[var(--text-main)] transition-colors duration-400 text-lg">{laporan.nama_barang || "Barang Tidak Diketahui"}</h3>
                    <p className="text-xs text-indigo-600 font-bold font-mono mt-0.5">{laporan.kode_barang} - NUP {laporan.no_urut_pendaft}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1.5">Dilaporkan pada {new Date(laporan.created_at).toLocaleString('id-ID')}</p>
                  </div>
                  <span className={`px-3 py-1.5 text-xs font-bold rounded-full ${getStatusColor(laporan.status_laporan)} w-fit`}>
                    {laporan.status_laporan}
                  </span>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-bold mb-1">Deskripsi Kerusakan Anda</p>
                    <p className="text-sm text-[var(--text-main)] bg-[var(--bg-panel)] p-3 rounded-xl border border-[var(--border-panel)]">{laporan.deskripsi_kerusakan}</p>
                  </div>

                  {(laporan.status_laporan === 'Ditolak' || (laporan.status_laporan === 'Diterima' && laporan.catatan_pj)) && (
                    <div className={`p-4 rounded-xl border ${laporan.status_laporan === 'Ditolak' ? 'bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-800' : 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800'}`}>
                      <p className={`text-xs uppercase tracking-wider font-bold mb-1.5 ${laporan.status_laporan === 'Ditolak' ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                        Catatan dari PJ Ruangan
                      </p>
                      <p className={`text-sm ${laporan.status_laporan === 'Ditolak' ? 'text-rose-900 dark:text-rose-200' : 'text-emerald-900 dark:text-emerald-200'}`}>
                        {laporan.catatan_pj || "Laporan Anda telah diterima."}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {laporan.foto_url && (
                      <div>
                        <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-bold mb-2">Bukti Kerusakan (Dikirim oleh Anda)</p>
                        <button onClick={() => openDocument(laporan.foto_url)} className="inline-block px-3 py-1.5 bg-[var(--bg-panel)] hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-[var(--border-panel)] rounded-lg text-xs font-bold text-[var(--text-main)] transition-colors">
                          Buka Pratinjau Bukti
                        </a>
                      </div>
                    )}
                    {laporan.status_laporan === 'Selesai' && laporan.bukti_penyelesaian_pdf && (
                      <div>
                        <p className="text-xs text-emerald-600 uppercase tracking-wider font-bold mb-2">Bukti Telah Diperbaiki (Oleh Laboran)</p>
                        <button onClick={() => openDocument(laporan.bukti_penyelesaian_pdf)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-bold text-emerald-700 dark:text-emerald-400 transition-colors">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Buka PDF
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
