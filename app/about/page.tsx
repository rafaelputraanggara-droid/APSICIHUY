import Link from "next/link";

export default function About() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-main)] transition-colors duration-400 sm:text-4xl">
          Tentang Kami
        </h1>
        <p className="text-base text-[var(--text-muted)] transition-colors duration-400">
          Halaman ini memberikan informasi singkat mengenai sistem APSI 2026.
        </p>
      </div>

      <div className="bg-[var(--bg-panel)] transition-colors duration-400 border border-[var(--border-panel)] rounded-2xl p-6 shadow-sm transition-colors duration-300">
        <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
          Sistem ini dikembangkan menggunakan kerangka kerja Next.js terbaru dengan integrasi penuh Tailwind CSS v4.
          Semua komponen dirancang agar responsif, modern, dan modular untuk mempermudah pemeliharaan jangka panjang.
        </p>

        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-200 px-4 py-2 text-sm font-semibold transition-all cursor-pointer"
          >
            Kembali ke Home
          </Link>
        </div>
      </div>
    </div>
  );
}

