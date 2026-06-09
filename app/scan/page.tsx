'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Barang {
  id: number;
  kode_barang: string;
  no_urut_pendaft: number;
  nama_barang: string;
  merk_type: string;
  th_perolehan: number;
  kondisi: string;
  lokasi_ruangan: string;
}

export default function ScanPage() {
  const router = useRouter();
  
  // Data State
  const [barangs, setBarangs] = useState<Barang[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Scanner State
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scannedItemName, setScannedItemName] = useState<string>('');
  
  // Manual Input State
  const [manualUrl, setManualUrl] = useState('');

  // Fetch all registered items
  useEffect(() => {
    const fetchBarangs = async () => {
      try {
        const res = await fetch('/api/barangs');
        const data = await res.json();
        if (data.success) {
          setBarangs(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch assets for scanner:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBarangs();
  }, []);

  // Web Audio API beep sound
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(900, audioCtx.currentTime); // 900Hz tone
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        audioCtx.close();
      }, 120);
    } catch (e) {
      console.warn('Browser AudioContext beep block/error:', e);
    }
  };

  // Handle simulating scan for a specific item
  const handleSimulateScan = (item: Barang) => {
    if (scanStatus === 'scanning') return;
    
    setScanStatus('scanning');
    setScanResult(null);
    setScannedItemName(item.nama_barang);
    
    // Simulate 1.5 second viewfinder scan animation
    setTimeout(() => {
      playBeep();
      setScanStatus('success');
      
      const targetUrl = `/lapor/${item.kode_barang}/${item.no_urut_pendaft}`;
      setScanResult(targetUrl);
      
      // Auto-redirect after a brief success checkmark display
      setTimeout(() => {
        router.push(targetUrl);
      }, 1000);
      
    }, 1500);
  };

  // Decode manually entered URL or codes
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualUrl) return;

    setScanStatus('scanning');
    setScannedItemName('Input Manual / URL');

    setTimeout(() => {
      try {
        let match = null;
        
        // Pattern 1: Fully absolute URL http://localhost:3000/lapor/1.02.03.04.005/2
        // Pattern 2: Relative URL /lapor/1.02.03.04.005/2
        const laporIndex = manualUrl.indexOf('/lapor/');
        if (laporIndex !== -1) {
          const route = manualUrl.substring(laporIndex); // yields: /lapor/1.02.03.04.005/2
          const parts = route.split('/');
          if (parts.length >= 4) {
            match = {
              kode_barang: parts[2],
              no_urut_pendaft: parts[3]
            };
          }
        } else {
          // Pattern 3: User pasted raw "1.02.03.04.005 2" or "1.02.03.04.005/2"
          const cleanInput = manualUrl.replace(/\s+/g, '/');
          const parts = cleanInput.split('/');
          if (parts.length >= 2 && parts[0].includes('.')) {
            match = {
              kode_barang: parts[0],
              no_urut_pendaft: parts[1]
            };
          }
        }

        if (match) {
          playBeep();
          setScanStatus('success');
          const targetUrl = `/lapor/${match.kode_barang}/${match.no_urut_pendaft}`;
          setScanResult(targetUrl);
          
          setTimeout(() => {
            router.push(targetUrl);
          }, 1000);
        } else {
          setScanStatus('error');
          alert('Format URL atau Kode Barang tidak dikenali. Format yang benar: http://.../lapor/{kode}/{nup} atau {kode}/{nup}');
        }
      } catch (err) {
        setScanStatus('error');
        alert('Terjadi kesalahan saat mengurai input.');
      }
    }, 1200);
  };

  // Filter asset search
  const filteredBarangs = barangs.filter(b => 
    b.nama_barang.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.kode_barang.includes(searchQuery) ||
    b.merk_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.lokasi_ruangan.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Welcome Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-800 via-emerald-600 to-teal-650 text-white p-8 rounded-3xl shadow-lg">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse"></span>
            QR Scanner Simulator
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Scan Simulator QR Aset</h1>
          <p className="text-emerald-100 max-w-xl text-sm">
            Simulasikan proses pemindaian QR Code aset BMN menggunakan kamera virtual dan buka halaman formulir kerusakan secara otomatis.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Card: Simulated Camera Viewfinder */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-neutral-900 rounded-3xl border border-neutral-800 p-6 shadow-xl text-white flex flex-col items-center">
            <h3 className="text-sm font-bold text-neutral-400 tracking-wider uppercase mb-4">Viewfinder Kamera Simulasi</h3>
            
            {/* Outer Scanner Window */}
            <div className="relative w-full aspect-square max-w-[280px] bg-neutral-950 rounded-2xl border-2 border-neutral-700 overflow-hidden flex flex-col items-center justify-center shadow-inner group">
              
              {/* Corner Targets */}
              <div className="absolute top-4 left-4 w-5 h-5 border-t-3 border-l-3 border-emerald-500 rounded-tl"></div>
              <div className="absolute top-4 right-4 w-5 h-5 border-t-3 border-r-3 border-emerald-500 rounded-tr"></div>
              <div className="absolute bottom-4 left-4 w-5 h-5 border-b-3 border-l-3 border-emerald-500 rounded-bl"></div>
              <div className="absolute bottom-4 right-4 w-5 h-5 border-b-3 border-r-3 border-emerald-500 rounded-br"></div>
              
              {/* Scan state overlays */}
              {scanStatus === 'idle' && (
                <div className="text-center p-4 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-4v-4m-2 4h-2m-2-4h-2m8 0h2m-2 2h2m-4-6h4M6 6h4v4H6V6zm10 0h4v4h-4V6zM6 16h4v4H6v-4z" />
                    </svg>
                  </div>
                  <p className="text-xs text-neutral-400 font-bold">Kamera Siap</p>
                  <p className="text-xxs text-neutral-500 max-w-[200px]">Pilih aset di sebelah kanan atau input URL untuk mulai scan.</p>
                </div>
              )}

              {scanStatus === 'scanning' && (
                <>
                  {/* Laser scan line */}
                  <div className="absolute left-0 w-full h-0.5 bg-emerald-500 shadow-[0_0_8px_#10b981] animate-[scan_2s_infinite]"></div>
                  
                  <div className="text-center p-4 space-y-2 z-10">
                    <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mx-auto"></div>
                    <p className="text-xs text-emerald-450 font-bold animate-pulse">Memindai QR...</p>
                    <p className="text-xxs text-neutral-400 font-mono truncate max-w-[200px]">{scannedItemName}</p>
                  </div>
                </>
              )}

              {scanStatus === 'success' && (
                <div className="text-center p-4 space-y-3 z-10 bg-emerald-950/20 w-full h-full flex flex-col items-center justify-center animate-fade-in">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-xs text-emerald-400 font-extrabold">QR Sukses Terbaca!</p>
                  <p className="text-[10px] text-neutral-400 font-mono break-all px-2 bg-neutral-900 py-1 rounded border border-neutral-800">{scanResult}</p>
                </div>
              )}

              {scanStatus === 'error' && (
                <div className="text-center p-4 space-y-3 z-10 bg-red-950/20 w-full h-full flex flex-col items-center justify-center animate-fade-in">
                  <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto border border-red-500">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <p className="text-xs text-red-400 font-bold">Gagal Mengurai QR</p>
                  <button 
                    onClick={() => setScanStatus('idle')}
                    className="text-[10px] bg-neutral-800 border border-neutral-700 text-neutral-300 px-3 py-1 rounded-lg hover:bg-neutral-700 transition"
                  >
                    Coba Lagi
                  </button>
                </div>
              )}
            </div>

            {/* Input Manual Box inside camera area */}
            <div className="w-full border-t border-neutral-800 mt-6 pt-6">
              <span className="text-xxs font-bold text-neutral-500 uppercase tracking-wider block mb-2.5">Input Link QR Manual</span>
              <form onSubmit={handleManualSubmit} className="space-y-3">
                <input
                  type="text"
                  value={manualUrl}
                  onChange={(e) => setManualUrl(e.target.value)}
                  placeholder="Paste URL (e.g. http://localhost:3000/lapor/x/y)"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-neutral-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                />
                <button
                  type="submit"
                  disabled={!manualUrl || scanStatus === 'scanning'}
                  className="w-full bg-emerald-650 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl text-xs transition duration-150 cursor-pointer disabled:opacity-50"
                >
                  Proses & Dekode QR
                </button>
              </form>
            </div>

          </div>
        </div>

        {/* Right Card: Asset Search List for quick click testing */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm p-6">
            <div className="border-b pb-4 mb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Pilih Aset untuk Simulasi Scan</h2>
                <p className="text-xs text-gray-500 mt-0.5">Klik tombol scan pada salah satu barang di bawah untuk mengaktifkan pemindai.</p>
              </div>
              <span className="self-start px-3 py-1 bg-emerald-50 text-emerald-750 text-xs font-semibold rounded-full border border-emerald-100">
                {barangs.length} Terdaftar
              </span>
            </div>

            {/* Search Input */}
            <div className="mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari berdasarkan nama barang, kode, atau lokasi..."
                className="w-full shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block sm:text-sm border-gray-300 rounded-xl px-3.5 py-2.5 border focus:outline-none"
              />
            </div>

            {/* Items Container */}
            {loading ? (
              <div className="py-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-2"></div>
                <p className="text-xs text-gray-400 font-medium">Memuat data barang...</p>
              </div>
            ) : filteredBarangs.length === 0 ? (
              <p className="text-sm text-gray-400 py-10 text-center">Aset tidak ditemukan. Coba gunakan keyword lain.</p>
            ) : (
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {filteredBarangs.map((item) => (
                  <div 
                    key={item.id}
                    className="flex justify-between items-center p-3.5 bg-gray-50 hover:bg-indigo-50/20 border border-gray-200/60 rounded-2xl hover:border-indigo-300 transition duration-150"
                  >
                    <div className="min-w-0 pr-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-[10px] font-bold text-indigo-700 bg-indigo-50/50 px-1.5 py-0.5 rounded border border-indigo-100">
                          {item.kode_barang}
                        </span>
                        <span className="font-mono text-[10px] font-bold text-gray-450">
                          NUP: {item.no_urut_pendaft}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-gray-800 mt-1.5 truncate">{item.nama_barang}</h4>
                      <p className="text-xxs text-gray-500 mt-0.5 truncate">{item.merk_type} &bull; Ruang: {item.lokasi_ruangan}</p>
                    </div>

                    <button
                      onClick={() => handleSimulateScan(item)}
                      disabled={scanStatus === 'scanning'}
                      className="flex-shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm transition duration-150 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-4v-4m-2 4h-2m-2-4h-2m8 0h2m-2 2h2m-4-6h4M6 6h4v4H6V6zm10 0h4v4h-4V6zM6 16h4v4H6v-4z" />
                      </svg>
                      Simulasi Scan
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Embedded CSS for animation */}
      <style jsx>{`
        @keyframes scan {
          0% { top: 16px; }
          50% { top: calc(100% - 20px); }
          100% { top: 16px; }
        }
      `}</style>
    </div>
  );
}
