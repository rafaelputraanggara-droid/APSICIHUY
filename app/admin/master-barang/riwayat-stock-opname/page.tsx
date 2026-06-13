'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function RiwayatStockOpnamePage() {
  const [rooms, setRooms] = useState<string[]>([]);
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
            {rooms.map((room) => (
              <Link key={room} href={`/admin/master-barang/riwayat-stock-opname/${encodeURIComponent(room)}`} className="group">
                <div className="border border-[var(--border-panel)] rounded-2xl p-5 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer h-full flex flex-col justify-center items-center text-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-[var(--text-main)] transition-colors duration-400 text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{room}</h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
