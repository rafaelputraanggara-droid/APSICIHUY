"use client";

import React from "react";

export default function RuanganPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 dark:from-indigo-950 dark:to-violet-950 p-8 rounded-3xl text-white shadow-xl">
          <div className="relative z-10 space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Kelola Ruangan
            </h1>
            <p className="text-indigo-100 max-w-2xl text-sm sm:text-base">
              Manajemen data ruangan, gedung, lantai, dan penanggung jawab ruangan.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 text-center text-neutral-500">
          <p>Fitur ini sedang dalam tahap pengembangan.</p>
        </div>
      </div>
  );
}
