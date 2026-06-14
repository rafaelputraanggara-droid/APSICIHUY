'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Barang {
  id: number;
  kode_barang: string;
  no_urut_pendaft: number;
  nama_barang: string;
  merk_type: string;
  th_perolehan: number;
  kondisi: string;
  status_keberadaan?: 'Ditemukan' | 'Tidak Ditemukan';
  discan_pada?: string | null;
}

interface GapSummary {
  totalItems: number;
  itemsFound: number;
  itemsMissing: number;
  gapPercentage: string;
}

interface FinishReport {
  sessionId: number;
  ruangan: string;
  dilakukan_oleh: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  summary: GapSummary;
  gapList: Barang[];
  foundList: Barang[];
}

export default function RiwayatLaporanPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [report, setReport] = useState<FinishReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await fetch(`/api/stock-opname/report?id=${id}`);
        const data = await res.json();
        if (data.success) {
          setReport(data.data);
        }
      } catch (err) {
        console.error('Failed to load report:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-24 text-[var(--text-muted)]">
        <p>Laporan tidak ditemukan.</p>
        <button onClick={() => router.back()} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg">Kembali</button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in print:space-y-4 max-w-5xl mx-auto">
      
      {/* Header Card (Hide on Print) */}
      <div className="bg-[var(--bg-panel)] transition-colors duration-400 rounded-3xl border border-gray-200/80 p-6 shadow-sm flex justify-between items-center print:hidden">
        <div>
          <button onClick={() => router.back()} className="text-sm text-indigo-600 font-bold mb-2 flex items-center gap-1 hover:underline">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali
          </button>
          <h2 className="text-xl font-extrabold text-[var(--text-main)] transition-colors duration-400">Detail Laporan Stok Opname #{report.sessionId}</h2>
          <p className="text-xs text-gray-400">Audit selesai pada {new Date(report.tanggal_selesai).toLocaleString()}</p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer"
          >
            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Cetak Laporan Gap
          </button>
        </div>
      </div>

      {/* Official Audit Document Header (Print-friendly format) */}
      <div className="hidden print:block border-b-3 border-neutral-900 pb-4 mb-6 text-center">
        <h1 className="text-lg font-black tracking-wide uppercase text-[var(--text-main)]">
          LAPORAN KETIDAKSESUAIAN (GAP REPORT) STOK OPNAME
        </h1>
        <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mt-1">
          SISTEM INFORMASI INVENTARIS BMN (SIPRABU) &bull; FT UNS
        </p>
      </div>

      {/* Sesi & Meta Data Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:grid-cols-3 print:gap-4">
        <div className="bg-[var(--bg-panel)] transition-colors duration-400 rounded-2xl border border-[var(--border-panel)] p-5 shadow-sm print:p-3 print:border-none print:shadow-none">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Lokasi Ruangan</span>
          <p className="text-base font-extrabold text-[var(--text-main)] transition-colors duration-400 mt-1">{report.ruangan}</p>
        </div>
        <div className="bg-[var(--bg-panel)] transition-colors duration-400 rounded-2xl border border-[var(--border-panel)] p-5 shadow-sm print:p-3 print:border-none print:shadow-none">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Auditor Pelaksana</span>
          <p className="text-base font-extrabold text-[var(--text-main)] transition-colors duration-400 mt-1">{report.dilakukan_oleh}</p>
        </div>
        <div className="bg-[var(--bg-panel)] transition-colors duration-400 rounded-2xl border border-[var(--border-panel)] p-5 shadow-sm print:p-3 print:border-none print:shadow-none">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Waktu Audit</span>
          <p className="text-xs font-bold text-[var(--text-main)] transition-colors duration-400 mt-1.5 font-mono">
            {new Date(report.tanggal_mulai).toLocaleDateString()} &bull; {new Date(report.tanggal_mulai).toLocaleTimeString()} s/d {new Date(report.tanggal_selesai).toLocaleTimeString()}
          </p>
        </div>
      </div>

      {/* KPI Dashboard Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 print:grid-cols-4 print:gap-3">
        
        <div className="bg-[var(--bg-panel)] transition-colors duration-400 rounded-3xl border border-[var(--border-panel)] p-5 shadow-sm text-center print:border-neutral-300">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Total Ekspektasi</span>
          <p className="text-3xl font-black text-[var(--text-main)] transition-colors duration-400 mt-1">{report.summary.totalItems}</p>
          <p className="text-xxs text-[var(--text-muted)] mt-1">Item Tercatat di Database</p>
        </div>

        <div className="bg-[var(--bg-panel)] transition-colors duration-400 rounded-3xl border border-[var(--border-panel)] p-5 shadow-sm text-center print:border-neutral-300">
          <span className="text-[10px] font-bold text-emerald-650 uppercase">Item Ditemukan</span>
          <p className="text-3xl font-black text-[var(--tag-success-text)] transition-colors duration-400 mt-1">{report.summary.itemsFound}</p>
          <p className="text-xxs text-emerald-500 mt-1">Fisik Ada & Terverifikasi</p>
        </div>

        <div className="bg-[var(--bg-panel)] transition-colors duration-400 rounded-3xl border border-[var(--border-panel)] p-5 shadow-sm text-center print:border-neutral-300">
          <span className="text-[10px] font-bold text-[var(--tag-danger-text)] transition-colors duration-400 uppercase">Aset Hilang (Gap)</span>
          <p className="text-3xl font-black text-[var(--tag-danger-text)] transition-colors duration-400 mt-1">{report.summary.itemsMissing}</p>
          <p className="text-xxs text-rose-500 mt-1">Selisih Tidak Ditemukan</p>
        </div>

        <div className="bg-[var(--bg-panel)] transition-colors duration-400 rounded-3xl border border-[var(--border-panel)] p-5 shadow-sm text-center print:border-neutral-300">
          <span className="text-[10px] font-bold text-indigo-650 uppercase">Tingkat Kehilangan</span>
          <p className="text-3xl font-black text-indigo-600 mt-1">{report.summary.gapPercentage}%</p>
          <p className="text-xxs text-indigo-400 mt-1">Rasio Gap terhadap Total</p>
        </div>

      </div>

      {/* Main Content Sections: GAP LIST and FOUND LIST */}
      <div className="space-y-8">
        
        {/* GAP LIST SECTION */}
        <div>
          <h3 className="text-sm font-bold text-rose-600 uppercase tracking-wider mb-4 border-b-2 border-rose-200 pb-2 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Daftar Aset Hilang / Selisih ({report.summary.itemsMissing})
          </h3>
          
          {report.gapList.length === 0 ? (
            <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl text-sm font-bold text-center border border-emerald-200 print:bg-transparent print:border-none print:text-left print:p-0">
              Hebat! Tidak ada gap aset (selisih). Semua barang ditemukan sesuai ekspektasi.
            </div>
          ) : (
            <div className="overflow-x-auto print:overflow-visible">
              <table className="min-w-full divide-y divide-gray-200 print:divide-neutral-400 border border-gray-200 print:border-neutral-400">
                <thead className="bg-rose-50 print:bg-neutral-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-rose-700 print:text-neutral-900 uppercase">Kode Aset / NUP</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-rose-700 print:text-neutral-900 uppercase">Nama Aset</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-rose-700 print:text-neutral-900 uppercase">Merk / Spesifikasi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 print:divide-neutral-400">
                  {report.gapList.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-3 text-sm font-mono text-gray-900">{item.kode_barang} &bull; {item.no_urut_pendaft}</td>
                      <td className="px-4 py-3 text-sm font-bold text-gray-900">{item.nama_barang || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{item.merk_type || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* FOUND LIST SECTION */}
        <div className="pt-6 print:pt-4 break-inside-avoid">
          <h3 className="text-sm font-bold text-emerald-650 uppercase tracking-wider mb-4 border-b-2 border-emerald-200 pb-2 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Daftar Aset Ditemukan ({report.summary.itemsFound})
          </h3>

          {report.foundList.length === 0 ? (
            <div className="bg-gray-50 text-gray-500 p-4 rounded-xl text-sm font-medium text-center border border-gray-200 print:bg-transparent print:border-none print:text-left print:p-0">
              Tidak ada aset yang ditemukan dalam ruangan ini.
            </div>
          ) : (
            <div className="overflow-x-auto print:overflow-visible">
              <table className="min-w-full divide-y divide-gray-200 print:divide-neutral-400 border border-gray-200 print:border-neutral-400">
                <thead className="bg-emerald-50 print:bg-neutral-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-emerald-700 print:text-neutral-900 uppercase">Kode Aset / NUP</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-emerald-700 print:text-neutral-900 uppercase">Nama Aset</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-emerald-700 print:text-neutral-900 uppercase">Discan Pada</th>
                  </tr>
                </thead>
                <tbody className="bg-[var(--bg-app)] transition-colors duration-400 divide-y divide-[var(--border-panel)] print:divide-neutral-400">
                  {report.foundList.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-3 text-sm font-mono text-[var(--text-main)] transition-colors duration-400">{item.kode_barang} &bull; {item.no_urut_pendaft}</td>
                      <td className="px-4 py-3 text-sm font-bold text-[var(--text-main)] transition-colors duration-400">{item.nama_barang || '-'}</td>
                      <td className="px-4 py-3 text-xs text-[var(--text-muted)] font-mono">{item.discan_pada ? new Date(item.discan_pada).toLocaleTimeString('id-ID') : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Signature Section for Print Only */}
      <div className="hidden print:block mt-16 pt-8 break-inside-avoid">
        <div className="flex justify-end pr-12">
          <div className="text-center">
            <p className="text-sm font-medium mb-16">Petugas Auditor Fisik</p>
            <p className="text-sm font-bold underline decoration-1 underline-offset-4">{report.dilakukan_oleh}</p>
          </div>
        </div>
      </div>

    </div>
  );
}
