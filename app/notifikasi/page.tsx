"use client";

import React, { useState } from "react";

export default function NotifikasiPage() {
  const [activeTab, setActiveTab] = useState<"kerusakan" | "hilang">("kerusakan");

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 dark:from-indigo-950 dark:to-violet-950 p-8 rounded-3xl text-white shadow-xl">
          <div className="relative z-10 space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Pusat Notifikasi & Laporan
            </h1>
            <p className="text-indigo-100 max-w-2xl text-sm sm:text-base">
              Pantau laporan kerusakan dan laporan barang hilang di laboratorium.
            </p>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-neutral-200 dark:border-neutral-800">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("kerusakan")}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap cursor-pointer transition-all duration-200 ${
                activeTab === "kerusakan"
                  ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                  : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300 dark:text-neutral-400 dark:hover:text-neutral-300"
              }`}
            >
              Laporan Kerusakan
            </button>
            <button
              onClick={() => setActiveTab("hilang")}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap cursor-pointer transition-all duration-200 ${
                activeTab === "hilang"
                  ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                  : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300 dark:text-neutral-400 dark:hover:text-neutral-300"
              }`}
            >
              Laporan Barang Hilang
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 text-center text-neutral-500">
          {activeTab === "kerusakan" && (
            <div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">Daftar Laporan Kerusakan</h3>
              <p>Belum ada laporan kerusakan baru yang masuk.</p>
            </div>
          )}
          {activeTab === "hilang" && (
            <div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">Daftar Laporan Barang Hilang</h3>
              <p>Belum ada laporan barang hilang yang tercatat.</p>
            </div>
          )}
        </div>
      </div>
  );
}
