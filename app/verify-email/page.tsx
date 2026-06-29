"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Sedang memverifikasi email Anda...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Token verifikasi tidak ditemukan pada URL.');
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await fetch('/api/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });
        const data = await res.json();

        if (data.success) {
          setStatus('success');
          setMessage(data.message);
        } else {
          setStatus('error');
          setMessage(data.error);
        }
      } catch (err) {
        setStatus('error');
        setMessage('Terjadi kesalahan jaringan saat memverifikasi token.');
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-banner)] p-4 transition-colors duration-400">
      <div className="w-full max-w-md bg-white/10 dark:bg-black/35 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden text-center">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 bg-[var(--bg-panel)] rounded-3xl flex items-center justify-center shadow-lg border border-[var(--border-panel)]">
            <svg className="w-14 h-14" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="48" stroke="#003566" strokeWidth="4" fill="#ffffff" />
              <circle cx="50" cy="50" r="38" fill="#003566" />
              <path d="M50 20 L58 38 L78 40 L62 52 L68 72 L50 60 L32 72 L38 52 L22 40 L42 38 Z" fill="#FFC300" />
              <circle cx="50" cy="50" r="14" fill="#003566" />
              <text x="50" y="55" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="bold" fontFamily="sans-serif">UNS</text>
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-black tracking-tight text-white mb-2">Verifikasi Email</h1>

        {status === 'loading' && (
          <div className="space-y-4">
            <div className="flex justify-center my-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"></div>
            </div>
            <p className="text-sm font-semibold text-white/80">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-center my-4">
              <div className="rounded-full bg-emerald-500/20 p-4 border border-emerald-500/50">
                <svg className="w-12 h-12 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <p className="text-sm font-semibold text-emerald-300">{message}</p>
            <button
              onClick={() => router.push('/login')}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-sm font-bold shadow-lg transition-all"
            >
              Lanjutkan ke Login
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-center my-4">
              <div className="rounded-full bg-rose-500/20 p-4 border border-rose-500/50">
                <svg className="w-12 h-12 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <p className="text-sm font-semibold text-rose-300">{message}</p>
            <button
              onClick={() => router.push('/login')}
              className="w-full py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-2xl text-sm font-bold shadow-lg transition-all"
            >
              Kembali ke Halaman Utama
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--bg-banner)] flex justify-center items-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"></div></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
