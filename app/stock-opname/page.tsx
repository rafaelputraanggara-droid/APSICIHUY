'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

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

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning';
}

interface SessionData {
  sessionId: number;
  ruangan: string;
  dilakukan_oleh: string;
  items: Barang[];
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

export default function StockOpnamePage() {
  const router = useRouter();

  // Navigation / Phase State
  // 'setup' | 'scanning' | 'report'
  const [phase, setPhase] = useState<'setup' | 'scanning' | 'report'>('setup');

  // Phase 1: Setup State
  const [rooms, setRooms] = useState<string[]>([]);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [pjName, setPjName] = useState('');
  const [loadingRooms, setLoadingRooms] = useState(true);

  // Phase 2: Scanning State
  const [session, setSession] = useState<SessionData | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Phase 3: Report State
  const [report, setReport] = useState<FinishReport | null>(null);
  const [finishing, setFinishing] = useState(false);

  // Refs for QR Code continuous scan control
  const html5QrCodeRef = useRef<any>(null);
  const lastScannedRef = useRef<{ key: string; time: number } | null>(null);
  const toastIdCounterRef = useRef(0);

  // Fetch rooms list on mount
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await fetch('/api/stock-opname/rooms');
        const data = await res.json();
        if (data.success) {
          // data.data is an array of { room: '...', last_opname: '...' }
          const stringRooms = data.data.map((r: any) => typeof r === 'string' ? r : r.room);
          setRooms(stringRooms);
          if (stringRooms.length > 0) {
            setSelectedRoom(stringRooms[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load rooms:', err);
      } finally {
        setLoadingRooms(false);
      }
    };
    fetchRooms();
  }, []);

  // Clean up scanner on unmount or phase change
  useEffect(() => {
    return () => {
      stopCameraScanner();
    };
  }, []);

  // Custom Toast trigger
  const addToast = (message: string, type: 'success' | 'error' | 'warning') => {
    const id = ++toastIdCounterRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);

    // Automatically remove toast after 2.5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2500);
  };

  // Browser Audio Context beep sound generator
  const playBeep = (type: 'success' | 'error') => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      if (type === 'success') {
        // High pitched short beep for success
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
        gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
        oscillator.start();
        setTimeout(() => {
          oscillator.stop();
          audioCtx.close();
        }, 120);
      } else {
        // Low buzzing tone for error / warning
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(150, audioCtx.currentTime); // low pitch
        gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
        oscillator.start();
        setTimeout(() => {
          oscillator.stop();
          audioCtx.close();
        }, 400);
      }
    } catch (e) {
      console.warn('AudioContext failed:', e);
    }
  };

  // Start Camera Scanner
  const startCameraScanner = async () => {
    if (typeof window === 'undefined') return;

    setCameraError('');
    setCameraActive(true);

    try {
      // Dynamically import html5-qrcode only on client side to avoid SSR errors
      const { Html5Qrcode } = await import('html5-qrcode');

      // Ensure reader container exists
      const container = document.getElementById('qr-reader-target');
      if (!container) return;

      const html5QrCode = new Html5Qrcode('qr-reader-target');
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' }, // Default to back camera
        {
          fps: 10,
          qrbox: (width, height) => {
            const size = Math.min(width, height) * 0.7;
            return { width: size, height: size };
          }
        },
        async (decodedText) => {
          // Success Callback: Parse QR URL
          handleQrScanInput(decodedText);
        },
        () => {
          // Error Callback: Silent by default to avoid log spamming
        }
      );
    } catch (err: any) {
      console.error('Failed to start camera:', err);
      setCameraError(err.message || 'Izin kamera ditolak atau kamera tidak ditemukan.');
      setCameraActive(false);
    }
  };

  // Stop Camera Scanner
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

  // Process Scanned Text (URL or raw input)
  const handleQrScanInput = async (scannedText: string) => {
    if (!session) return;

    try {
      // 1. Extract Kode Barang & NUP
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

      if (!kode_barang || !no_urut_pendaft) {
        // Ignored or invalid format scanned
        return;
      }

      const scanKey = `${kode_barang}-${no_urut_pendaft}`;
      const now = Date.now();

      // 2. Debounce Check: Prevent double-read within 3 seconds for the same asset
      if (lastScannedRef.current && lastScannedRef.current.key === scanKey) {
        if (now - lastScannedRef.current.time < 3000) {
          return;
        }
      }

      // Update last scan ref
      lastScannedRef.current = { key: scanKey, time: now };

      // 3. Send Scan Request to Backend
      const res = await fetch('/api/stock-opname/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stok_opname_id: session.sessionId,
          kode_barang,
          no_urut_pendaft
        })
      });

      const data = await res.json();

      if (data.success) {
        // Sound feedback: High Beep
        playBeep('success');
        addToast(`Ditemukan: ${data.data.nama_barang} (NUP: ${data.data.no_urut_pendaft})`, 'success');

        // Update local items state immediately (re-check in UI table)
        setSession((prev) => {
          if (!prev) return null;
          const updatedItems = prev.items.map((item) => {
            if (item.kode_barang === kode_barang && item.no_urut_pendaft === parseInt(no_urut_pendaft)) {
              return { ...item, status_keberadaan: 'Ditemukan' as const, discan_pada: new Date().toISOString() };
            }
            return item;
          });
          return { ...prev, items: updatedItems };
        });

      } else {
        // Sound feedback: Buzz/Low Beep
        playBeep('error');
        addToast(data.error || 'Aset salah lokasi atau tidak terdaftar!', 'error');
      }

    } catch (err) {
      console.error('Scan processing error:', err);
    }
  };

  // Handle Simulating QR scan from PC UI
  const handleSimulateScan = (item: Barang) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const mockQr = `${origin}/lapor/${item.kode_barang}/${item.no_urut_pendaft}`;
    handleQrScanInput(mockQr);
  };

  // Start Session handler
  const handleStartSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom || !pjName.trim()) {
      alert('Ruangan dan Nama PJ Auditor wajib diisi!');
      return;
    }
    if (!rooms.includes(selectedRoom)) {
      alert('Ruangan tidak valid. Silakan ketik dan pilih ruangan yang tersedia dari daftar dropdown.');
      return;
    }

    try {
      const res = await fetch('/api/stock-opname/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ruangan: selectedRoom,
          dilakukan_oleh: pjName
        })
      });

      const data = await res.json();
      if (data.success) {
        setSession(data.data);
        setPhase('scanning');
        // Auto-start camera after transitioning phase
        setTimeout(() => {
          startCameraScanner();
        }, 300);
      } else {
        alert('Gagal memulai sesi: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan jaringan.');
    }
  };

  // Finish Session handler
  const handleFinishSession = async () => {
    if (!session) return;
    
    const confirmFinish = window.confirm('Apakah Anda yakin ingin menyelesaikan sesi Stock Opname ini? Barang yang belum di-scan akan dianggap hilang/selisih.');
    if (!confirmFinish) return;

    // Stop camera stream first
    await stopCameraScanner();

    setFinishing(true);
    try {
      const res = await fetch('/api/stock-opname/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stok_opname_id: session.sessionId
        })
      });

      const data = await res.json();
      if (data.success) {
        setReport(data.data);
        setPhase('report');
      } else {
        alert('Gagal mengakhiri sesi: ' + data.error);
        // Restart camera if it failed to finish
        startCameraScanner();
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan sistem.');
    } finally {
      setFinishing(false);
    }
  };

  // Filter items in scanning view
  const filteredItems = session
    ? session.items.filter((item) =>
        item.nama_barang.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.kode_barang.includes(searchQuery) ||
        item.merk_type.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const verifiedCount = session
    ? session.items.filter((item) => item.status_keberadaan === 'Ditemukan').length
    : 0;

  const totalCount = session ? session.items.length : 0;

  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto print:space-y-4 print:pb-0">
      
      {/* Dynamic Toast Notifications (Floating Overlays) */}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none print:hidden">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded-2xl shadow-xl text-xs font-bold text-white flex items-center gap-2 animate-slide-in pointer-events-auto ${
              t.type === 'success' ? 'bg-emerald-600 border border-emerald-500' :
              t.type === 'error' ? 'bg-rose-600 border border-rose-500 shadow-rose-100' :
              'bg-amber-500 border border-amber-400'
            }`}
          >
            {t.type === 'success' ? (
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* PHASE 1: SETUP PHASE */}
      {phase === 'setup' && (
        <div className="max-w-xl mx-auto space-y-8 animate-fade-in print:hidden">
          <div className="relative overflow-hidden bg-[var(--bg-banner)] transition-colors duration-400 text-white p-8 rounded-3xl shadow-lg text-center">
            <h1 className="text-3xl font-extrabold tracking-tight">Sesi Stok Opname Baru</h1>
            <p className="text-white/80 mt-2 text-sm">
              Pilih lokasi ruangan dan masukkan nama Anda selaku petugas auditor BMN untuk memulai verifikasi fisik.
            </p>
          </div>

          <div className="bg-[var(--bg-panel)] transition-colors duration-400 rounded-3xl border border-gray-200/80 shadow-sm p-6 sm:p-8">
            {loadingRooms ? (
              <div className="py-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-650 mx-auto mb-2"></div>
                <p className="text-sm text-gray-500 font-semibold">Memuat data lokasi ruangan...</p>
              </div>
            ) : rooms.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Tidak ada ruangan terdaftar dengan barang aktif. Silakan tambahkan barang terlebih dahulu.
              </div>
            ) : (
              <form onSubmit={handleStartSession} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Pilih Lokasi Ruangan</label>
                  <input
                    type="text"
                    list="stockOpnameRooms"
                    value={selectedRoom}
                    onChange={(e) => setSelectedRoom(e.target.value)}
                    placeholder="Ketik untuk mencari ruangan..."
                    className="mt-2 block w-full bg-[var(--bg-panel)] transition-colors duration-400 border border-gray-300 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <datalist id="stockOpnameRooms">
                    {rooms.map((room) => (
                      <option key={room} value={room} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700">Nama PJ Auditor / Petugas</label>
                  <input
                    type="text"
                    value={pjName}
                    onChange={(e) => setPjName(e.target.value)}
                    required
                    placeholder="Contoh: Heri Prasetyo (PJ Ruangan)"
                    className="mt-2 block w-full border border-gray-300 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center items-center gap-2 py-3 px-4 border border-transparent shadow-md text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition duration-150 cursor-pointer"
                  >
                    Mulai Sesi Stok Opname
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* PHASE 2: ACTIVE SCANNING PHASE */}
      {phase === 'scanning' && session && (
        <div className="space-y-6 animate-fade-in print:hidden">
          
          {/* Header Card */}
          <div className="bg-[var(--bg-panel)] transition-colors duration-400 rounded-3xl border border-gray-200/80 p-6 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 text-xxs font-bold rounded-full border border-indigo-150 uppercase tracking-wider mb-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Audit Berjalan
              </div>
              <h2 className="text-2xl font-extrabold text-[var(--text-main)] transition-colors duration-400">Stok Opname: {session.ruangan}</h2>
              <p className="text-xs text-gray-500 mt-1">Auditor: <strong className="text-gray-700">{session.dilakukan_oleh}</strong></p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-xs text-gray-400 font-bold block uppercase">Audit Progress</span>
                <span className="text-2xl font-black text-indigo-650">{verifiedCount} <span className="text-gray-400 font-bold text-sm">/ {totalCount} Aset</span></span>
              </div>
              <button
                onClick={handleFinishSession}
                disabled={finishing}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-5 py-3 rounded-xl shadow-md cursor-pointer transition flex items-center gap-2"
              >
                {finishing ? 'Menyimpan Sesi...' : 'Akhiri Sesi Audit'}
              </button>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Viewfinder Scanner */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-neutral-900 rounded-3xl border border-neutral-800 p-6 shadow-xl text-white flex flex-col items-center">
                <h3 className="text-sm font-bold text-[var(--text-muted)] tracking-wider uppercase mb-4">Viewfinder QR Kamera</h3>

                {/* Camera Holder */}
                <div className="relative w-full aspect-square max-w-[280px] bg-neutral-950 rounded-2xl border-2 border-neutral-700 overflow-hidden flex flex-col items-center justify-center shadow-inner group">
                  {cameraActive ? (
                    <>
                      {/* html5-qrcode target anchor */}
                      <div id="qr-reader-target" className="w-full h-full object-cover"></div>
                      
                      {/* Scanning laser visual overlay */}
                      <div className="absolute left-0 w-full h-0.5 bg-emerald-500 shadow-[0_0_8px_#10b981] animate-[scan_2s_infinite] pointer-events-none z-10"></div>
                      
                      {/* Corner Target Markers */}
                      <div className="absolute top-4 left-4 w-5 h-5 border-t-3 border-l-3 border-emerald-500 rounded-tl pointer-events-none z-15"></div>
                      <div className="absolute top-4 right-4 w-5 h-5 border-t-3 border-r-3 border-emerald-500 rounded-tr pointer-events-none z-15"></div>
                      <div className="absolute bottom-4 left-4 w-5 h-5 border-b-3 border-l-3 border-emerald-500 rounded-bl pointer-events-none z-15"></div>
                      <div className="absolute bottom-4 right-4 w-5 h-5 border-b-3 border-r-3 border-emerald-500 rounded-br pointer-events-none z-15"></div>
                    </>
                  ) : (
                    <div className="text-center p-4 space-y-3">
                      {cameraError ? (
                        <>
                          <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto border border-rose-500/20">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          </div>
                          <p className="text-xs text-rose-450 font-bold">Kamera Gagal Dimuat</p>
                          <p className="text-[10px] text-[var(--text-muted)] leading-normal max-w-[200px]">{cameraError}</p>
                          <button
                            onClick={startCameraScanner}
                            className="bg-neutral-800 text-xs hover:bg-neutral-700 px-4 py-1.5 rounded-lg border border-neutral-700 transition"
                          >
                            Coba Akses Lagi
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center mx-auto text-[var(--text-muted)] animate-pulse">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <p className="text-xs text-[var(--text-muted)] font-semibold">Menginisialisasi Kamera...</p>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="w-full text-center mt-3">
                  <p className="text-xxs text-[var(--text-muted)] font-medium leading-relaxed max-w-[280px] mx-auto">
                    Kamera dikonfigurasi untuk pemindaian **Beruntun**. Arahkan lensa ke QR Code fisik secara bergantian tanpa perlu me-reload kamera.
                  </p>
                </div>

                {/* Manual Scan Input Area (if camera fails or user wants to paste) */}
                <div className="w-full border-t border-neutral-800 mt-6 pt-6">
                  <span className="text-xxs font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-2.5">Input Manual Hasil QR</span>
                  <div className="flex gap-2">
                    <input
                      id="manual-qr-text"
                      type="text"
                      placeholder="Paste link lapor / kode barang..."
                      className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-350 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
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
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Scan
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Right Column: Expected Items Table with simulation */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-[var(--bg-panel)] transition-colors duration-400 rounded-3xl border border-gray-200/80 shadow-sm p-6 flex flex-col h-[520px]">
                
                {/* Search & Header */}
                <div className="border-b pb-4 mb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <h3 className="text-lg font-bold text-[var(--text-main)] transition-colors duration-400">Daftar Ekspektasi Ruangan</h3>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari aset..."
                    className="shadow-sm border border-gray-300 rounded-xl px-3 py-1.5 text-xs w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Table container with scroll */}
                <div className="flex-1 overflow-y-auto pr-1">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        <th className="px-3 py-2 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Aset</th>
                        <th className="px-3 py-2 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status Keberadaan</th>
                      </tr>
                    </thead>
                    <tbody className="bg-[var(--bg-panel)] transition-colors duration-400 divide-y divide-gray-200">
                      {filteredItems.length === 0 ? (
                        <tr>
                          <td colSpan={2} className="px-4 py-8 text-center text-xs text-gray-400">
                            Barang tidak ditemukan di ruangan ini.
                          </td>
                        </tr>
                      ) : (
                        filteredItems.map((item) => {
                          const isFound = item.status_keberadaan === 'Ditemukan';
                          return (
                            <tr 
                              key={item.id} 
                              className={`transition-colors duration-200 ${
                                isFound ? 'bg-emerald-50/20 hover:bg-emerald-50/30' : 'hover:bg-gray-50'
                              }`}
                            >
                              <td className="px-3 py-3">
                                <span className="font-mono text-[9px] font-bold bg-gray-100 px-1 py-0.5 rounded text-gray-500">
                                  {item.kode_barang} &bull; {item.no_urut_pendaft}
                                </span>
                                <h4 className="text-xs font-bold text-[var(--text-main)] transition-colors duration-400 mt-1 truncate max-w-[200px]">{item.nama_barang}</h4>
                                <p className="text-[10px] text-gray-400 truncate max-w-[200px]">{item.merk_type}</p>
                              </td>
                              <td className="px-3 py-3 text-center whitespace-nowrap">
                                <span className={`px-2 py-0.5 text-[10px] inline-flex items-center gap-1 leading-5 font-bold rounded-full ${
                                  isFound 
                                    ? 'bg-green-50 text-green-700 border border-green-200' 
                                    : 'bg-gray-100 text-gray-500 border border-gray-200 animate-pulse'
                                }`}>
                                  {isFound ? (
                                    <>
                                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                      </svg>
                                      Ditemukan
                                    </>
                                  ) : (
                                    <>
                                      <span className="h-1.5 w-1.5 rounded-full bg-gray-400"></span>
                                      Belum Ter-scan
                                    </>
                                  )}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* PHASE 3: SUMMARY REPORT PHASE (GAP REPORT) */}
      {phase === 'report' && report && (
        <div className="space-y-8 animate-fade-in print:space-y-4">
          
          {/* Header Card (Hide on Print) */}
          <div className="bg-[var(--bg-panel)] transition-colors duration-400 rounded-3xl border border-gray-200/80 p-6 shadow-sm flex justify-between items-center print:hidden">
            <div>
              <h2 className="text-xl font-extrabold text-[var(--text-main)] transition-colors duration-400">Stok Opname Berhasil Disimpan</h2>
              <p className="text-xs text-gray-400">Audit selesai pada {new Date(report.tanggal_selesai).toLocaleString()}</p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-[var(--bg-app)] hover:bg-indigo-50 dark:hover:bg-neutral-800 text-[var(--text-main)] font-bold border border-[var(--border-panel)] rounded-xl text-xs transition cursor-pointer"
              >
                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Cetak Laporan Gap
              </button>
              <button
                onClick={() => {
                  setPhase('setup');
                  setSession(null);
                  setReport(null);
                  setPjName('');
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4.5 py-2.5 rounded-xl shadow cursor-pointer transition"
              >
                Mulai Sesi Baru
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
            <div className="bg-[var(--bg-panel)] transition-colors duration-400 rounded-2xl border border-gray-200 p-5 shadow-sm print:p-3 print:border-none print:shadow-none">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Lokasi Ruangan</span>
              <p className="text-base font-extrabold text-[var(--text-main)] transition-colors duration-400 mt-1">{report.ruangan}</p>
            </div>
            <div className="bg-[var(--bg-panel)] transition-colors duration-400 rounded-2xl border border-gray-200 p-5 shadow-sm print:p-3 print:border-none print:shadow-none">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Auditor Pelaksana</span>
              <p className="text-base font-extrabold text-[var(--text-main)] transition-colors duration-400 mt-1">{report.dilakukan_oleh}</p>
            </div>
            <div className="bg-[var(--bg-panel)] transition-colors duration-400 rounded-2xl border border-gray-200 p-5 shadow-sm print:p-3 print:border-none print:shadow-none">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Waktu Audit</span>
              <p className="text-xs font-bold text-[var(--text-main)] transition-colors duration-400 mt-1.5 font-mono">
                {new Date(report.tanggal_mulai).toLocaleDateString()} &bull; {new Date(report.tanggal_mulai).toLocaleTimeString()} s/d {new Date(report.tanggal_selesai).toLocaleTimeString()}
              </p>
            </div>
          </div>

          {/* KPI Dashboard Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 print:grid-cols-4 print:gap-3">
            
            <div className="bg-[var(--bg-panel)] transition-colors duration-400 rounded-3xl border border-gray-200/80 p-5 shadow-sm text-center print:border-neutral-300">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Total Ekspektasi</span>
              <p className="text-3xl font-black text-[var(--text-main)] transition-colors duration-400 mt-1">{report.summary.totalItems}</p>
              <p className="text-xxs text-gray-450 mt-1">Item Tercatat di Database</p>
            </div>

            <div className="bg-[var(--bg-panel)] transition-colors duration-400 rounded-3xl border border-gray-200/80 p-5 shadow-sm text-center print:border-neutral-300">
              <span className="text-[10px] font-bold text-emerald-650 uppercase">Item Ditemukan</span>
              <p className="text-3xl font-black text-[var(--tag-success-text)] transition-colors duration-400 mt-1">{report.summary.itemsFound}</p>
              <p className="text-xxs text-emerald-500 mt-1">Fisik Ada & Terverifikasi</p>
            </div>

            <div className="bg-[var(--bg-panel)] transition-colors duration-400 rounded-3xl border border-gray-200/80 p-5 shadow-sm text-center print:border-neutral-300">
              <span className="text-[10px] font-bold text-[var(--tag-danger-text)] transition-colors duration-400 uppercase">Aset Hilang (Gap)</span>
              <p className="text-3xl font-black text-[var(--tag-danger-text)] transition-colors duration-400 mt-1">{report.summary.itemsMissing}</p>
              <p className="text-xxs text-rose-500 mt-1">Selisih Tidak Ditemukan</p>
            </div>

            <div className="bg-[var(--bg-panel)] transition-colors duration-400 rounded-3xl border border-gray-200/80 p-5 shadow-sm text-center print:border-neutral-300">
              <span className="text-[10px] font-bold text-indigo-650 uppercase">Tingkat Keberadaan</span>
              <p className="text-3xl font-black text-[var(--tag-info-text)] transition-colors duration-400 mt-1">
                {report.summary.totalItems > 0 
                  ? ((report.summary.itemsFound / report.summary.totalItems) * 100).toFixed(1)
                  : '0'}%
              </p>
              <p className="text-xxs text-indigo-500 mt-1">Akurasi Fisik vs Data</p>
            </div>

          </div>

          {/* Section: GAP / Missing Asets */}
          <div className="bg-[var(--bg-panel)] transition-colors duration-400 rounded-3xl border border-gray-200/80 shadow-sm p-6 print:border-none print:shadow-none print:p-0">
            <h3 className="text-base font-extrabold text-[var(--tag-danger-text)] transition-colors duration-400 border-b pb-3 mb-4 flex items-center gap-1.5 print:text-[var(--text-main)] print:border-neutral-800">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500 print:hidden"></span>
              DAFTAR GAP ASET : TIDAK DITEMUKAN ({report.summary.itemsMissing} Item)
            </h3>
            
            {report.gapList.length === 0 ? (
              <div className="py-8 text-center text-sm text-[var(--tag-success-text)] transition-colors duration-400 font-bold">
                ✓ Sempurna! Seluruh aset fisik lengkap dan terverifikasi di dalam ruangan ini (Tidak ada gap).
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200 border print:border-neutral-300">
                  <thead className="bg-[var(--bg-app)] transition-colors duration-400 print:bg-neutral-100">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-[10px] font-bold text-[var(--text-muted)] uppercase">Kode & NUP</th>
                      <th className="px-4 py-2.5 text-left text-[10px] font-bold text-[var(--text-muted)] uppercase">Nama Aset</th>
                      <th className="px-4 py-2.5 text-left text-[10px] font-bold text-[var(--text-muted)] uppercase">Merk / Spek</th>
                      <th className="px-4 py-2.5 text-center text-[10px] font-bold text-[var(--text-muted)] uppercase">Tahun</th>
                      <th className="px-4 py-2.5 text-center text-[10px] font-bold text-[var(--text-muted)] uppercase">Kondisi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-[var(--bg-panel)] transition-colors duration-400 divide-y divide-neutral-200">
                    {report.gapList.map((item) => (
                      <tr key={item.id} className="hover:bg-[var(--bg-app)] transition-colors duration-400 print:bg-[var(--bg-panel)] transition-colors duration-400 text-xs">
                        <td className="px-4 py-3 font-mono font-bold text-[var(--text-main)] transition-colors duration-400">{item.kode_barang} &bull; {String(item.no_urut_pendaft).padStart(3, '0')}</td>
                        <td className="px-4 py-3 font-semibold text-[var(--text-main)] transition-colors duration-400">{item.nama_barang}</td>
                        <td className="px-4 py-3 text-[var(--text-muted)]">{item.merk_type}</td>
                        <td className="px-4 py-3 text-center text-[var(--text-muted)] font-semibold">{item.th_perolehan}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${
                            item.kondisi === 'Baik' ? 'bg-green-50 text-green-700 border-green-200' :
                            item.kondisi === 'Rusak Ringan' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                            'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {item.kondisi}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section: Verified/Found Asets (Collapsed/Hidden on Print default if too long, or styled neatly) */}
          <div className="bg-[var(--bg-panel)] transition-colors duration-400 rounded-3xl border border-gray-200/80 shadow-sm p-6 print:border-none print:shadow-none print:p-0 print:break-before-page print:mt-6">
            <h3 className="text-base font-extrabold text-emerald-750 border-b pb-3 mb-4 flex items-center gap-1.5 print:text-[var(--text-main)] print:border-neutral-800">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 print:hidden"></span>
              DAFTAR ASET TERVERIFIKASI : DITEMUKAN ({report.summary.itemsFound} Item)
            </h3>

            {report.foundList.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">Belum ada aset terverifikasi di ruangan ini.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200 border print:border-neutral-300">
                  <thead className="bg-[var(--bg-app)] transition-colors duration-400 print:bg-neutral-100">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-[10px] font-bold text-[var(--text-muted)] uppercase">Kode & NUP</th>
                      <th className="px-4 py-2.5 text-left text-[10px] font-bold text-[var(--text-muted)] uppercase">Nama Aset</th>
                      <th className="px-4 py-2.5 text-left text-[10px] font-bold text-[var(--text-muted)] uppercase">Merk / Spek</th>
                      <th className="px-4 py-2.5 text-center text-[10px] font-bold text-[var(--text-muted)] uppercase">Waktu Scan</th>
                    </tr>
                  </thead>
                  <tbody className="bg-[var(--bg-panel)] transition-colors duration-400 divide-y divide-neutral-200">
                    {report.foundList.map((item) => (
                      <tr key={item.id} className="hover:bg-[var(--bg-app)] transition-colors duration-400 print:bg-[var(--bg-panel)] transition-colors duration-400 text-xs">
                        <td className="px-4 py-3 font-mono font-semibold text-[var(--text-muted)]">{item.kode_barang} &bull; {String(item.no_urut_pendaft).padStart(3, '0')}</td>
                        <td className="px-4 py-3 font-bold text-emerald-700">{item.nama_barang}</td>
                        <td className="px-4 py-3 text-[var(--text-muted)]">{item.merk_type}</td>
                        <td className="px-4 py-3 text-center font-mono text-[10px] text-[var(--text-muted)]">
                          {item.discan_pada ? new Date(item.discan_pada).toLocaleTimeString() : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Official Signature Area for Print */}
          <div className="hidden print:grid grid-cols-2 mt-16 pt-4 text-center text-xs">
            <div>
              <p className="text-[var(--text-muted)] mb-12">Petugas Pemeriksa / Auditor,</p>
              <p className="font-bold underline text-[var(--text-main)]">{report.dilakukan_oleh}</p>
              <p className="text-[var(--text-muted)] mt-0.5">PJ Ruangan BMN</p>
            </div>
            <div>
              <p className="text-[var(--text-muted)] mb-12">Mengetahui,<br />Kepala Unit Pengelola BMN FT,</p>
              <p className="font-bold underline text-[var(--text-main)]">Dr. Slamet Santoso, M.T.</p>
              <p className="text-[var(--text-muted)] mt-0.5">NIP. 19780512 200501 1 002</p>
            </div>
          </div>

        </div>
      )}

      {/* Viewfinder scan line keyframes style */}
      <style jsx>{`
        @keyframes scan {
          0% { top: 16px; }
          50% { top: calc(100% - 20px); }
          100% { top: 16px; }
        }
        @keyframes slide-in {
          0% { transform: translateX(100%); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
      `}</style>

    </div>
  );
}
