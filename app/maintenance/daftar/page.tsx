"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";

export default function DaftarBarangRusakPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/maintenance?status=Diterima");
      const data = await res.json();
      if (data.success) {
        setReports(data.data);
      }
    } catch (error) {
      console.error("Gagal mengambil data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMulaiPerbaiki = async (id: number) => {
    try {
      const res = await fetch("/api/maintenance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "Sedang Diperbaiki" }),
      });
      const data = await res.json();
      if (data.success) {
        fetchReports();
      } else {
        alert(data.error || "Gagal memperbarui status.");
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem.");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-fade-in">
        <div className="relative overflow-hidden bg-[var(--bg-banner)] p-8 rounded-3xl text-white shadow-xl transition-colors duration-400">
          <div className="relative z-10 space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Daftar Barang Rusak
            </h1>
            <p className="text-[var(--text-muted)] max-w-2xl text-sm sm:text-base font-medium">
              Daftar laporan kerusakan yang telah Anda setujui. Silakan periksa detailnya dan mulai proses perbaikan.
            </p>
          </div>
        </div>

        <div className="bg-[var(--bg-panel)] border border-[var(--border-panel)] rounded-2xl shadow-sm overflow-hidden p-6 transition-colors duration-400">
          {isLoading ? (
            <p className="text-center py-8 text-[var(--text-muted)]">Memuat data...</p>
          ) : reports.length === 0 ? (
            <p className="text-center py-8 text-[var(--text-muted)]">Belum ada barang rusak yang harus diperbaiki saat ini.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reports.map((report) => (
                <div key={report.id} className="border border-[var(--border-panel)] rounded-xl p-5 bg-[var(--bg-app)] relative">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-[var(--text-main)] text-lg">{report.nama_barang || "Barang Tidak Diketahui"}</h4>
                      <p className="text-xs text-indigo-600 font-semibold mt-1">{report.kode_barang} - {report.no_urut_pendaft}</p>
                    </div>
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">
                      Diterima
                    </span>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div>
                      <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold">Ruangan Asal</p>
                      <p className="text-sm font-medium text-[var(--text-main)] mt-0.5">{report.ruangan_asal || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold">Deskripsi Kendala</p>
                      <p className="text-sm font-medium text-[var(--text-main)] mt-0.5">{report.deskripsi_kerusakan}</p>
                    </div>
                    {report.foto_url && (
                      <div>
                        <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold mb-1">Bukti Foto Kerusakan</p>
                        <img src={report.foto_url} alt="Foto Kerusakan" className="w-full h-40 object-cover rounded-lg border border-[var(--border-panel)]" />
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleMulaiPerbaiki(report.id)}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Mulai Perbaiki Barang
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
