'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function MahasiswaScanPage() {
  const router = useRouter();
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const html5QrCodeRef = useRef<any>(null);

  useEffect(() => {
    // start camera on mount
    const timer = setTimeout(() => {
      startCameraScanner();
    }, 300);

    return () => {
      stopCameraScanner();
    };
  }, []);

  const startCameraScanner = async () => {
    if (typeof window === 'undefined') return;

    setCameraError('');
    setCameraActive(true);

    try {
      const { Html5Qrcode } = await import('html5-qrcode');

      const container = document.getElementById('qr-reader-target');
      if (!container) return;

      const html5QrCode = new Html5Qrcode('qr-reader-target');
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: (width, height) => {
            const size = Math.min(width, height) * 0.7;
            return { width: size, height: size };
          }
        },
        async (decodedText) => {
          handleQrScanInput(decodedText);
        },
        () => {}
      );
    } catch (err: any) {
      console.error('Failed to start camera:', err);
      setCameraError(err.message || 'Izin kamera ditolak atau kamera tidak ditemukan.');
      setCameraActive(false);
    }
  };

  const stopCameraScanner = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
      } catch (err) {
        console.error('Failed to stop scanner:', err);
      }
    }
    setCameraActive(false);
    html5QrCodeRef.current = null;
  };

  const handleQrScanInput = async (scannedText: string) => {
    try {
      let kode_barang = '';
      let no_urut_pendaft = '';

      const laporIndex = scannedText.indexOf('/lapor/');
      if (laporIndex !== -1) {
        const parts = scannedText.substring(laporIndex).split('/');
        if (parts.length >= 4) {
          kode_barang = parts[2];
          no_urut_pendaft = parts[3];
        }
      } else {
        const cleanInput = scannedText.replace(/\s+/g, '/');
        const parts = cleanInput.split('/');
        if (parts.length >= 2 && parts[0].includes('.')) {
          kode_barang = parts[0];
          no_urut_pendaft = parts[1];
        }
      }

      if (kode_barang && no_urut_pendaft) {
        await stopCameraScanner();
        router.push(`/lapor/${encodeURIComponent(kode_barang)}/${encodeURIComponent(no_urut_pendaft)}`);
      }
    } catch (err) {
      console.error('Scan processing error:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="relative overflow-hidden bg-[var(--bg-banner)] transition-colors duration-400 text-white p-8 rounded-3xl shadow-lg text-center">
        <h1 className="text-3xl font-extrabold tracking-tight">Scan QR Kerusakan</h1>
        <p className="text-white/80 mt-2 text-sm">
          Arahkan kamera ke QR Code label barang untuk melaporkan kerusakan.
        </p>
      </div>

      <div className="bg-[var(--bg-panel)] transition-colors duration-400 rounded-3xl border border-[var(--border-panel)] shadow-sm p-6 sm:p-12 flex flex-col items-center justify-center">
        <div className="relative w-full aspect-square max-w-sm bg-neutral-950 rounded-3xl border-4 border-neutral-800 overflow-hidden flex flex-col items-center justify-center shadow-2xl group">
          {cameraActive ? (
            <>
              <div id="qr-reader-target" className="w-full h-full object-cover"></div>
              <div className="absolute left-0 w-full h-1 bg-indigo-500 shadow-[0_0_15px_#6366f1] animate-[scan_2s_infinite] pointer-events-none z-10"></div>
              <div className="absolute top-6 left-6 w-8 h-8 border-t-4 border-l-4 border-indigo-500 rounded-tl-lg pointer-events-none z-15"></div>
              <div className="absolute top-6 right-6 w-8 h-8 border-t-4 border-r-4 border-indigo-500 rounded-tr-lg pointer-events-none z-15"></div>
              <div className="absolute bottom-6 left-6 w-8 h-8 border-b-4 border-l-4 border-indigo-500 rounded-bl-lg pointer-events-none z-15"></div>
              <div className="absolute bottom-6 right-6 w-8 h-8 border-b-4 border-r-4 border-indigo-500 rounded-br-lg pointer-events-none z-15"></div>
            </>
          ) : (
            <div className="text-center p-6 space-y-4">
              {cameraError ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto border border-rose-500/20">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <p className="text-sm text-rose-450 font-bold">Kamera Gagal Dimuat</p>
                  <p className="text-xs text-[var(--text-muted)] leading-normal max-w-[200px] mx-auto">{cameraError}</p>
                  <button
                    onClick={startCameraScanner}
                    className="mt-4 bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-500 px-6 py-2.5 rounded-xl shadow-lg transition"
                  >
                    Coba Akses Lagi
                  </button>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center mx-auto text-[var(--text-muted)] animate-pulse">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-[var(--text-muted)] font-semibold">Menginisialisasi Kamera...</p>
                </>
              )}
            </div>
          )}
        </div>

        <div className="w-full max-w-sm mt-8 border-t border-[var(--border-panel)] pt-8">
          <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-3 text-center">Input Manual Hasil QR (Simulasi)</span>
          <div className="flex gap-2">
            <input
              id="manual-qr-text"
              type="text"
              placeholder="Paste link lapor / kode barang..."
              className="flex-1 bg-[var(--bg-app)] transition-colors duration-400 border border-[var(--border-panel)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleQrScanInput(e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />
            <button
              onClick={() => {
                const input = document.getElementById('manual-qr-text') as HTMLInputElement;
                if (input && input.value) {
                  handleQrScanInput(input.value);
                  input.value = '';
                }
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl text-sm font-bold shadow-md transition cursor-pointer"
            >
              Scan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
