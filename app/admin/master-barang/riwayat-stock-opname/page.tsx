'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function RiwayatStockOpnamePage() {
  const [rooms, setRooms] = useState<{room: string, last_opname: string | null}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await fetch('/api/stock-opname/rooms');
        const data = await res.json();
        if (data.success) {
          setRooms(data.data);
        }
      } catch (err) {
        console.error('Failed to load rooms:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-[var(--bg-panel)] transition-colors duration-400 p-6 rounded-3xl shadow-sm border border-[var(--border-panel)] flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-main)] transition-colors duration-400">Riwayat Stock Opname</h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">Pilih ruangan untuk melihat daftar riwayat audit fisik yang pernah dilakukan.</p>
        </div>
      </div>

      <div className="bg-[var(--bg-panel)] transition-colors duration-400 rounded-3xl border border-[var(--border-panel)] p-6 shadow-sm">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-12 text-[var(--text-muted)]">
            <svg className="mx-auto h-12 w-12 text-neutral-300 dark:text-neutral-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p>Belum ada daftar ruangan yang memiliki aset.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map(({room, last_opname}) => {
              let warning = true;
              if (last_opname) {
                const last = new Date(last_opname);
                const now = new Date();
                const diffTime = Math.abs(now.getTime() - last.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                warning = diffDays > 30;
              }
              
              return (
              <Link key={room} href={`/admin/master-barang/riwayat-stock-opname/${encodeURIComponent(room)}`} className="group">
                <div className={`border rounded-2xl p-5 transition-all cursor-pointer h-full flex flex-col justify-center items-center text-center gap-3 relative ${
                  warning 
                    ? 'border-rose-200 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-900/10 hover:bg-rose-100 dark:hover:bg-rose-900/30' 
                    : 'border-[var(--border-panel)] hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-300 dark:hover:border-indigo-700'
                }`}>
                  {warning && (
                    <div className="absolute top-3 right-3 text-rose-500 animate-pulse" title="Belum Stock Opname selama > 30 hari">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                  )}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform ${
                    warning 
                      ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400' 
                      : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400'
                  }`}>
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className={`font-bold text-lg transition-colors duration-400 ${
                    warning 
                      ? 'text-rose-700 dark:text-rose-300 group-hover:text-rose-800 dark:group-hover:text-rose-200' 
                      : 'text-[var(--text-main)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                  }`}>{room}</h3>
                  {warning && <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">Perlu Stok Opname!</p>}
                </div>
              </Link>
            )})}
          </div>
        )}
      </div>
    </div>
  );
}
