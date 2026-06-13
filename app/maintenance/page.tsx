"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";

export default function MaintenancePage() {
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
          } catch (e) {}
        }
      };
      
      window.addEventListener("simulated_user_change", handleUserChange);
      return () => window.removeEventListener("simulated_user_change", handleUserChange);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/maintenance");
      const data = await res.json();
      if (data.success) {
        setReports(data.data);
      }
    } catch (error) {
      console.error("Gagal mengambil data maintenance", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      const res = await fetch("/api/maintenance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        fetchReports(); // Refresh data
      } else {
        alert(data.error || "Gagal memperbarui status.");
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem.");
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Menunggu':
        return <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-[var(--tag-warning-bg)] text-[var(--tag-warning-text)] transition-colors duration-400">Menunggu</span>;
      case 'Diproses':
        return <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-[var(--tag-info-bg)] text-[var(--tag-info-text)] transition-colors duration-400">Sedang Diperbaiki</span>;
      case 'Selesai':
        return <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-[var(--tag-success-bg)] text-[var(--tag-success-text)] transition-colors duration-400">Selesai</span>;
      case 'Ditolak':
        return <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-[var(--tag-danger-bg)] text-[var(--tag-danger-text)] transition-colors duration-400">Ditolak</span>;
      default:
        return <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-neutral-100 text-neutral-800">{status}</span>;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-fade-in relative">
        <div className="relative overflow-hidden bg-[var(--bg-banner)] p-8 rounded-3xl text-white shadow-xl transition-colors duration-400">
          <div className="relative z-10 space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Maintenance Barang
            </h1>
            <p className="text-[var(--text-muted)] max-w-2xl text-sm sm:text-base font-medium">
              Manajemen laporan kerusakan dan pemeliharaan alat/fasilitas laboratorium. Pantau progres perbaikan oleh teknisi (Laboran).
            </p>
          </div>
        </div>

        <div className="bg-[var(--bg-panel)] border border-[var(--border-panel)] rounded-2xl shadow-sm overflow-hidden transition-colors duration-400">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800/50">
              <thead className="bg-[var(--bg-app)] transition-colors duration-400">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    Info Barang
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    Pelapor
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    Kendala
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    Aksi Perbaikan
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[var(--bg-panel)] transition-colors duration-400 divide-y divide-neutral-200 dark:divide-neutral-800/50">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-[var(--text-muted)] text-sm font-semibold">
                      Memuat data maintenance...
                    </td>
                  </tr>
                ) : reports.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-[var(--text-muted)] text-sm font-semibold">
                      Belum ada laporan kerusakan/maintenance.
                    </td>
                  </tr>
                ) : (
                  reports.map((report) => (
                    <tr key={report.id} className="hover:bg-[var(--bg-app)] transition-colors duration-400 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-bold text-[var(--text-main)] transition-colors duration-400">{report.nama_barang || "Barang Tidak Ditemukan"}</div>
                            <div className="text-xs text-[var(--tag-info-text)] transition-colors duration-400 font-mono mt-0.5">{report.kode_barang} - {report.no_urut_pendaft}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-[var(--text-main)] font-semibold transition-colors duration-400">{report.dilaporkan_oleh}</div>
                        <div className="text-xs text-[var(--text-muted)] transition-colors duration-400">{new Date(report.created_at).toLocaleDateString('id-ID')}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-[var(--text-main)] max-w-xs truncate transition-colors duration-400" title={report.deskripsi_kerusakan}>
                          {report.deskripsi_kerusakan}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(report.status_laporan)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {(userRole === "Admin Fakultas" || userRole === "Laboran") && report.status_laporan === "Menunggu" && (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleUpdateStatus(report.id, "Diproses")}
                              className="text-[var(--tag-info-text)] hover:text-indigo-900 bg-[var(--tag-info-bg)] hover:bg-indigo-200 px-3 py-1.5 rounded-lg transition-colors font-bold"
                            >
                              Tindaklanjuti
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(report.id, "Ditolak")}
                              className="text-[var(--tag-danger-text)] hover:text-rose-900 bg-[var(--tag-danger-bg)] hover:bg-rose-200 px-3 py-1.5 rounded-lg transition-colors font-bold"
                            >
                              Tolak
                            </button>
                          </div>
                        )}
                        {(userRole === "Admin Fakultas" || userRole === "Laboran") && report.status_laporan === "Diproses" && (
                          <button
                            onClick={() => handleUpdateStatus(report.id, "Selesai")}
                            className="text-[var(--tag-success-text)] hover:text-emerald-900 bg-[var(--tag-success-bg)] hover:bg-emerald-200 px-3 py-1.5 rounded-lg transition-colors font-bold"
                          >
                            Tandai Selesai
                          </button>
                        )}
                        {report.status_laporan === "Selesai" && (
                          <span className="text-[var(--text-muted)] text-xs font-semibold">Tuntas</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
