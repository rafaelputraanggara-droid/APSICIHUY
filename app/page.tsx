"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components";

export default function Home() {
  const [count, setCount] = useState(0);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
          Dashboard Utama
        </h1>
        <p className="text-base text-neutral-500 dark:text-neutral-400">
          Selamat datang di proyek APSI 2026. Berikut adalah demonstrasi penggunaan komponen yang telah dibuat.
        </p>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card
          title="Analitik Performa"
          description="Pantau perkembangan performa aplikasi Anda secara real-time dengan grafik interaktif."
          tag="Analytics"
          ctaText="Buka Analitik"
        />
        <Card
          title="Manajemen Proyek"
          description="Kelola tugas, tim, dan tenggat waktu proyek Anda dalam satu dashboard terintegrasi."
          tag="Projects"
          ctaText="Lihat Proyek"
        />
        <Card
          title="Interaksi Pengguna"
          description={`Anda telah mengklik tombol di bawah sebanyak ${count} kali. State React ini terhubung secara real-time.`}
          tag="Interactive"
          ctaText="Lihat Detail"
        />
      </div>

      {/* Interactive Testing Panel */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm transition-colors duration-300">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Counter Interaktif</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Gunakan tombol ini untuk menguji state React di halaman.
          </p>
        </div>
        <div className="flex gap-4 items-center w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-2xl font-bold text-neutral-900 dark:text-white w-12 text-center">
            {count}
          </span>
          <div className="flex gap-2">
            <button
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold shadow-sm transition-all cursor-pointer text-sm"
              onClick={() => setCount(count + 1)}
            >
              Tambah Hitungan
            </button>
            <Link
              className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-200 rounded-lg font-semibold transition-all text-sm"
              href="/about"
            >
              Tentang Kami
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}