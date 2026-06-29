"use client";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
const MySwal = withReactContent(Swal);


import React, { useState, useEffect } from "react";

export default function CetakLaporanPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [jenisLaporan, setJenisLaporan] = useState("kerusakan"); // kerusakan, mutasi, stock-opname
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportData, setReportData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearched, setIsSearched] = useState(false);

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

  const handleCari = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) await MySwal.fire({ title: 'Notifikasi Sistem', text: String("Pilih rentang tanggal terlebih dahulu."), icon: 'info', confirmButtonColor: '#4f46e5', background: '#1a1a1a', color: '#ffffff' }); return;
    
    if (new Date(startDate) > new Date(endDate)) {
      await MySwal.fire({ title: 'Notifikasi Sistem', text: String("Tanggal mulai tidak boleh lebih besar dari tanggal akhir."), icon: 'info', confirmButtonColor: '#4f46e5', background: '#1a1a1a', color: '#ffffff' }); return;
    }

    setIsLoading(true);
    setIsSearched(true);
    try {
      const res = await fetch(`/api/riwayat-cetak?type=${jenisLaporan}&startDate=${startDate}&endDate=${endDate}`);
      const data = await res.json();
      if (data.success) {
        setReportData(data.data);
      } else {
        MySwal.fire({ title: 'Notifikasi Sistem', text: String("Gagal mengambil data"), icon: 'info', confirmButtonColor: '#4f46e5', background: '#1a1a1a', color: '#ffffff' });
      }
    } catch (err) {
      MySwal.fire({ title: 'Notifikasi Sistem', text: String("Terjadi kesalahan koneksi"), icon: 'info', confirmButtonColor: '#4f46e5', background: '#1a1a1a', color: '#ffffff' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!currentUser) return null;
  
  if (currentUser.role !== "Admin Fakultas" && currentUser.role !== "Laboran" && currentUser.role !== "PJ_Ruangan") {
    return <div className="p-8 text-center text-rose-500 font-bold">Akses Ditolak.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 print:m-0 print:p-0 print:space-y-4">
      {/* HEADER: Hidden on print */}
      <div className="relative overflow-hidden bg-[var(--bg-banner)] p-8 rounded-3xl text-white shadow-xl transition-colors duration-400 print:hidden">
        <div className="relative z-10 space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Cetak Laporan
          </h1>
          <p className="text-white/80 max-w-2xl text-sm sm:text-base">
            Cetak dan eksport daftar riwayat dalam rentang waktu tertentu.
          </p>
        </div>
      </div>

      {/* FILTER FORM: Hidden on print */}
      <div className="bg-[var(--bg-panel)] transition-colors duration-400 rounded-3xl border border-[var(--border-panel)] p-6 shadow-sm print:hidden">
        <form onSubmit={handleCari} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:w-1/4">
            <label className="block text-sm font-semibold text-[var(--text-main)] mb-2">Jenis Laporan</label>
            <select 
              value={jenisLaporan}
              onChange={(e) => setJenisLaporan(e.target.value)}
              className="w-full bg-[var(--bg-app)] transition-colors duration-400 border border-[var(--border-panel)] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-[var(--text-main)]"
            >
              <option value="kerusakan">Laporan Kerusakan / Maintenance Selesai</option>
              <option value="mutasi">Laporan Riwayat Mutasi Barang</option>
              <option value="stock-opname">Laporan Sesi Stock Opname Selesai</option>
            </select>
          </div>
          <div className="w-full md:w-1/4">
            <label className="block text-sm font-semibold text-[var(--text-main)] mb-2">Dari Tanggal</label>
            <input 
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-[var(--bg-app)] transition-colors duration-400 border border-[var(--border-panel)] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-[var(--text-main)]"
              required
            />
          </div>
          <div className="w-full md:w-1/4">
            <label className="block text-sm font-semibold text-[var(--text-main)] mb-2">Sampai Tanggal</label>
            <input 
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-[var(--bg-app)] transition-colors duration-400 border border-[var(--border-panel)] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-[var(--text-main)]"
              required
            />
          </div>
          <div className="w-full md:w-1/4">
            <button 
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md transition-colors"
            >
              Cari & Tampilkan
            </button>
          </div>
        </form>
      </div>

      {/* HASIL LAPORAN: Shown on print */}
      {isSearched && (
        <div className="bg-[var(--bg-panel)] transition-colors duration-400 rounded-3xl border border-[var(--border-panel)] p-8 shadow-sm print:shadow-none print:border-none print:p-0">
          <div className="flex justify-between items-start mb-6 border-b border-[var(--border-panel)] pb-4 print:border-black">
            <div>
              <h2 className="text-2xl font-extrabold text-[var(--text-main)] print:text-black">
                {jenisLaporan === "kerusakan" && "Laporan Riwayat Maintenance (Selesai)"}
                {jenisLaporan === "mutasi" && "Laporan Riwayat Mutasi Barang"}
                {jenisLaporan === "stock-opname" && "Laporan Sesi Stock Opname (Selesai)"}
              </h2>
              <p className="text-sm text-[var(--text-muted)] print:text-gray-700 mt-1">
                Periode: {new Date(startDate).toLocaleDateString('id-ID')} s/d {new Date(endDate).toLocaleDateString('id-ID')}
              </p>
            </div>
            <div className="print:hidden">
              <button 
                onClick={handlePrint}
                disabled={reportData.length === 0}
                className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-sm flex items-center gap-2 ${
                  reportData.length === 0 
                    ? "bg-neutral-200 text-neutral-400 cursor-not-allowed" 
                    : "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Cetak Dokumen
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-[var(--text-muted)]">Mengambil data...</p>
            </div>
          ) : reportData.length === 0 ? (
            <div className="text-center py-12 text-[var(--text-muted)] print:text-black">
              Tidak ada data laporan yang ditemukan pada rentang waktu tersebut.
            </div>
          ) : (
            <div className="overflow-x-auto">
              {/* TABLE UNTUK KERUSAKAN */}
              {jenisLaporan === "kerusakan" && (
                <table className="min-w-full divide-y divide-[var(--border-panel)] print:divide-black border border-[var(--border-panel)] print:border-black">
                  <thead className="bg-[var(--bg-app)] print:bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-[var(--text-muted)] print:text-black uppercase">Tgl Dilaporkan</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-[var(--text-muted)] print:text-black uppercase">Ruangan Asal</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-[var(--text-muted)] print:text-black uppercase">Barang</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-[var(--text-muted)] print:text-black uppercase">Teknisi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-[var(--bg-panel)] divide-y divide-[var(--border-panel)] print:divide-black">
                    {reportData.map((item, idx) => (
                      <tr key={idx} className="print:text-black">
                        <td className="px-4 py-3 text-sm">{new Date(item.tanggal_dilaporkan).toLocaleDateString('id-ID')}</td>
                        <td className="px-4 py-3 text-sm font-semibold">{item.ruangan_asal}</td>
                        <td className="px-4 py-3 text-sm">
                          <p className="font-bold">{item.nama_barang}</p>
                          <p className="text-xs font-mono text-indigo-600 print:text-gray-600">{item.kode_barang}_{item.no_urut_pendaft}</p>
                        </td>
                        <td className="px-4 py-3 text-sm">{item.nama_teknisi}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* TABLE UNTUK MUTASI */}
              {jenisLaporan === "mutasi" && (
                <table className="min-w-full divide-y divide-[var(--border-panel)] print:divide-black border border-[var(--border-panel)] print:border-black">
                  <thead className="bg-[var(--bg-app)] print:bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-[var(--text-muted)] print:text-black uppercase">Tgl Pengajuan</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-[var(--text-muted)] print:text-black uppercase">Pergerakan Ruangan</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-[var(--text-muted)] print:text-black uppercase">Barang</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-[var(--text-muted)] print:text-black uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-[var(--bg-panel)] divide-y divide-[var(--border-panel)] print:divide-black">
                    {reportData.map((item, idx) => (
                      <tr key={idx} className="print:text-black">
                        <td className="px-4 py-3 text-sm">{new Date(item.tanggal_mutasi).toLocaleDateString('id-ID')}</td>
                        <td className="px-4 py-3 text-sm font-semibold">
                          {item.ruangan_asal} &rarr; {item.id_ruangan_tujuan}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <p className="font-bold">{item.nama_barang}</p>
                          <p className="text-xs font-mono text-indigo-600 print:text-gray-600">{item.kode_barang}_{item.no_urut_pendaft}</p>
                        </td>
                        <td className="px-4 py-3 text-sm font-bold">{item.status_mutasi}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* TABLE UNTUK STOCK OPNAME */}
              {jenisLaporan === "stock-opname" && (
                <table className="min-w-full divide-y divide-[var(--border-panel)] print:divide-black border border-[var(--border-panel)] print:border-black">
                  <thead className="bg-[var(--bg-app)] print:bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-[var(--text-muted)] print:text-black uppercase">Sesi ID</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-[var(--text-muted)] print:text-black uppercase">Tgl Selesai</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-[var(--text-muted)] print:text-black uppercase">Ruangan</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-[var(--text-muted)] print:text-black uppercase">Pelaksana</th>
                    </tr>
                  </thead>
                  <tbody className="bg-[var(--bg-panel)] divide-y divide-[var(--border-panel)] print:divide-black">
                    {reportData.map((item, idx) => (
                      <tr key={idx} className="print:text-black">
                        <td className="px-4 py-3 text-sm font-bold">#{item.id}</td>
                        <td className="px-4 py-3 text-sm">{new Date(item.tanggal_selesai).toLocaleString('id-ID')}</td>
                        <td className="px-4 py-3 text-sm font-semibold">{item.ruangan}</td>
                        <td className="px-4 py-3 text-sm">{item.dilakukan_oleh}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          <div className="hidden print:block mt-16 pt-8">
            <div className="flex justify-end pr-12">
              <div className="text-center">
                <p className="text-sm font-medium mb-16">Dicetak oleh</p>
                <p className="text-sm font-bold underline decoration-1 underline-offset-4">{currentUser.name}</p>
                <p className="text-xs mt-1">{currentUser.role}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
