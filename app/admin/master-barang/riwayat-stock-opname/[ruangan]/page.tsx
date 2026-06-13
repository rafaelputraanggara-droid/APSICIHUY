'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RiwayatRuanganPage() {
  const params = useParams();
  const router = useRouter();
  const rawRuangan = params.ruangan as string;
  const ruangan = decodeURIComponent(rawRuangan);

  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`/api/stock-opname/history?ruangan=${encodeURIComponent(ruangan)}`);
        const data = await res.json();
        if (data.success) {
          setHistory(data.data);
        }
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [ruangan]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="p-2 bg-[var(--bg-panel)] transition-colors duration-400 border border-[var(--border-panel)] rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-[var(--text-muted)]"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div className="bg-[var(--bg-panel)] transition-colors duration-400 p-6 rounded-3xl shadow-sm border border-[var(--border-panel)] flex-1 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-main)] transition-colors duration-400">
              Riwayat Audit Fisik
            </h2>
            <p className="text-sm text-indigo-600 font-bold mt-1">Ruangan: {ruangan}</p>
          </div>
        </div>
      </div>

      <div className="bg-[var(--bg-panel)] transition-colors duration-400 rounded-3xl border border-[var(--border-panel)] p-6 shadow-sm">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-12 text-[var(--text-muted)]">
            <svg className="mx-auto h-12 w-12 text-neutral-300 dark:text-neutral-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p>Belum ada riwayat stock opname yang diselesaikan untuk ruangan ini.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((session) => (
              <div key={session.id} className="border border-[var(--border-panel)] rounded-2xl p-5 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-all flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--text-main)] transition-colors duration-400 text-lg">
                      Sesi Audit #{session.id}
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-1">
                      <p className="text-xs text-[var(--text-muted)] flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {new Date(session.tanggal_selesai).toLocaleString('id-ID')}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Petugas: {session.dilakukan_oleh}
                      </p>
                    </div>
                  </div>
                </div>
                
                <Link href={`/admin/master-barang/riwayat-stock-opname/laporan/${session.id}`}>
                  <button className="whitespace-nowrap px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition shadow-sm flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Lihat & Cetak Laporan
                  </button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
