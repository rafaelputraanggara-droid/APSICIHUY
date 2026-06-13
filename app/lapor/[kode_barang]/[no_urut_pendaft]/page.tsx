'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

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

export default function LaporKerusakanPage() {
  const params = useParams();
  const router = useRouter();
  
  // Dynamic Route Params
  const kode_barang = params?.kode_barang ? decodeURIComponent(params.kode_barang as string) : '';
  const no_urut_pendaft = params?.no_urut_pendaft ? decodeURIComponent(params.no_urut_pendaft as string) : '';

  // Local State
  const [barang, setBarang] = useState<Barang | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form State
  const [namaPelapor, setNamaPelapor] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Auth State
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem("simulated_user");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.role === "Mahasiswa/Dosen" || parsed.role === "Mahasiswa") {
          setIsAuthorized(true);
          // Autofill name if possible
          if (parsed.name) setNamaPelapor(parsed.name);
        }
      } catch (e) {}
    }
    setAuthChecked(true);
  }, []);

  // Fetch Barang details on load
  useEffect(() => {
    if (!kode_barang || !no_urut_pendaft) return;

    const fetchBarangDetail = async () => {
      try {
        const res = await fetch(`/api/barangs/detail?kode_barang=${encodeURIComponent(kode_barang)}&no_urut_pendaft=${encodeURIComponent(no_urut_pendaft)}`);
        const data = await res.json();
        
        if (data.success) {
          setBarang(data.data);
        } else {
          setError(data.error || 'Aset barang tidak ditemukan.');
        }
      } catch (err) {
        console.error('Error fetching details:', err);
        setError('Gagal menghubungkan ke server.');
      } finally {
        setLoading(false);
      }
    };

    fetchBarangDetail();
  }, [kode_barang, no_urut_pendaft]);

  // Autofill dynamic demo image link for testing ease
  const handleUseDemoPhoto = () => {
    setFotoUrl('https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&q=80&w=600');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barang) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/laporan-masuk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kode_barang: barang.kode_barang,
          no_urut_pendaft: barang.no_urut_pendaft,
          dilaporkan_oleh: namaPelapor,
          deskripsi_kerusakan: deskripsi,
          foto_url: fotoUrl
        })
      });

      const data = await res.json();
      if (data.success) {
        setIsSuccess(true);
      } else {
        alert('Gagal mengirimkan laporan: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan jaringan/sistem.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!authChecked) return null; // wait for client-side auth check

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-between font-sans">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-indigo-650 flex items-center justify-center text-white font-bold text-lg shadow-sm">S</div>
              <div>
                <h1 className="text-base font-extrabold text-gray-900 tracking-tight">SIPRABU FT UNS</h1>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Akses Ditolak</h2>
            <p className="text-sm text-gray-500 mb-6">
              Halaman pelaporan kerusakan ini hanya dapat diakses oleh Mahasiswa yang sudah terdaftar. Silakan login sebagai Mahasiswa terlebih dahulu.
            </p>
            <button 
              onClick={() => router.push('/')} 
              className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-md transition"
            >
              Kembali ke Beranda
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between font-sans">
      {/* Top Navigation */}
      <header className="bg-[var(--bg-panel)] transition-colors duration-400 border-b border-gray-200/80 sticky top-0 z-30 shadow-sm px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-indigo-650 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              S
            </div>
            <div>
              <h1 className="text-base font-extrabold text-gray-900 tracking-tight">SIPRABU FT UNS</h1>
              <p className="text-xxs text-gray-400 font-semibold uppercase tracking-wider">Lapor Aset BMN</p>
            </div>
          </div>
          <button 
            onClick={() => router.push('/')}
            className="text-xs font-bold text-gray-500 hover:text-indigo-650 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        {loading ? (
          /* Loading State */
          <div className="bg-[var(--bg-panel)] transition-colors duration-400 rounded-3xl border border-gray-200 p-8 shadow-sm text-center flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-650 mb-4"></div>
            <p className="text-sm font-semibold text-gray-500">Mengambil data aset barang...</p>
          </div>
        ) : error ? (
          /* Error State */
          <div className="bg-[var(--bg-panel)] transition-colors duration-400 rounded-3xl border border-red-200 p-8 shadow-sm text-center py-16">
            <div className="w-16 h-16 bg-red-50 text-red-650 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-extrabold text-gray-900 mb-2">Aset Tidak Ditemukan</h2>
            <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed mb-6">
              {error}. Pastikan QR Code yang Anda scan valid atau hubungi Administrator jika data terhapus.
            </p>
            <button
              onClick={() => router.push('/')}
              className="inline-flex justify-center px-5 py-2.5 bg-indigo-650 text-white rounded-xl text-sm font-bold shadow-md hover:bg-indigo-700 transition"
            >
              Kembali ke Dashboard
            </button>
          </div>
        ) : barang ? (
          /* Main Layout when Item is Found */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Asset Detail Card */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-[var(--bg-panel)] transition-colors duration-400 rounded-3xl border border-gray-200 p-6 shadow-sm space-y-5">
                <div className="border-b pb-4">
                  <span className="text-xxs font-bold uppercase tracking-wider text-[var(--tag-info-text)] transition-colors duration-400 bg-indigo-50 px-2.5 py-1 rounded-md">
                    Informasi Aset
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 mt-3">{barang.nama_barang}</h3>
                  <p className="text-xs text-gray-500 mt-1 font-semibold">{barang.merk_type}</p>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <span className="text-xxs font-bold text-gray-400 uppercase">Kode Barang</span>
                    <p className="text-sm font-bold font-mono text-gray-900">{barang.kode_barang}</p>
                  </div>
                  <div>
                    <span className="text-xxs font-bold text-gray-400 uppercase">No Urut Pendaftaran (NUP)</span>
                    <p className="text-sm font-bold font-mono text-gray-900">{String(barang.no_urut_pendaft).padStart(3, '0')}</p>
                  </div>
                  <div>
                    <span className="text-xxs font-bold text-gray-400 uppercase">Tahun Perolehan</span>
                    <p className="text-sm font-bold text-gray-900">{barang.th_perolehan}</p>
                  </div>
                  <div>
                    <span className="text-xxs font-bold text-gray-400 uppercase">Lokasi Ruangan</span>
                    <p className="text-sm font-bold text-indigo-700 bg-indigo-50/50 px-2 py-1 rounded-lg inline-block border border-indigo-100">{barang.lokasi_ruangan}</p>
                  </div>
                  <div>
                    <span className="text-xxs font-bold text-gray-400 uppercase">Kondisi Saat Ini</span>
                    <div>
                      <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-bold rounded-full border ${
                        barang.kondisi === 'Baik' ? 'bg-green-50 text-green-700 border-green-200' : 
                        barang.kondisi === 'Rusak Ringan' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                        'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {barang.kondisi}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Reporting Form */}
            <div className="lg:col-span-2">
              <div className="bg-[var(--bg-panel)] transition-colors duration-400 rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 border-b pb-4 mb-6">Laporkan Kerusakan Barang</h2>
                
                {isSuccess ? (
                  /* Success Screen inside Form Box */
                  <div className="text-center py-10 space-y-5 animate-fade-in">
                    <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto border border-green-200 shadow-sm">
                      <svg className="w-9 h-9 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-extrabold text-gray-900">Laporan Berhasil Terkirim!</h3>
                      <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
                        Terima kasih telah melaporkan kerusakan aset ini. PJ Ruangan (Laboran) akan segera mengecek dan menindaklanjuti laporan Anda secara real-time.
                      </p>
                    </div>
                    <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        onClick={() => {
                          setIsSuccess(false);
                          setNamaPelapor('');
                          setDeskripsi('');
                          setFotoUrl('');
                        }}
                        className="px-5 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-semibold transition"
                      >
                        Kirim Laporan Lain
                      </button>
                      <button
                        onClick={() => router.push('/')}
                        className="px-5 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md transition"
                      >
                        Buka Dashboard
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Form */
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700">
                        Nama / Identitas Pelapor <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={namaPelapor}
                        onChange={(e) => setNamaPelapor(e.target.value)}
                        required
                        className="mt-2 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-xl px-3.5 py-3 border focus:outline-none"
                        placeholder="Contoh: Budi Santoso (Mahasiswa / PJ Kelas)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700">
                        Deskripsi Kerusakan <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={4}
                        value={deskripsi}
                        onChange={(e) => setDeskripsi(e.target.value)}
                        required
                        className="mt-2 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-xl px-3.5 py-3 border focus:outline-none"
                        placeholder="Jelaskan bagian mana yang rusak dan gejala yang dialami (misal: Monitor bergaris-garis merah horizontal, tidak bisa menyala)."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700">
                        Link Foto Bukti Kerusakan
                      </label>
                      <div className="mt-2 flex gap-2">
                        <input
                          type="text"
                          value={fotoUrl}
                          onChange={(e) => setFotoUrl(e.target.value)}
                          className="shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-xl px-3.5 py-3 border focus:outline-none font-mono text-xs"
                          placeholder="Contoh: https://link-gambar.com/foto.jpg"
                        />
                        <button
                          type="button"
                          onClick={handleUseDemoPhoto}
                          className="flex-shrink-0 px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-750 rounded-xl text-xs font-semibold transition border border-gray-200 cursor-pointer"
                        >
                          Gunakan Foto Demo
                        </button>
                      </div>
                      <p className="mt-1.5 text-xs text-gray-400">Gunakan Foto Demo untuk mengisi URL gambar dummy agar mempermudah pengujian.</p>
                    </div>

                    {fotoUrl && (
                      <div className="border rounded-2xl p-2 bg-gray-50 inline-block">
                        <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Pratinjau Foto Bukti</span>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={fotoUrl} 
                          alt="Pratinjau kerusakan" 
                          className="max-h-[140px] rounded-xl object-cover border"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://placehold.co/300x150?text=Gambar+Tidak+Valid';
                          }}
                        />
                      </div>
                    )}

                    <div className="pt-4 flex justify-end border-t border-gray-100">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex justify-center py-3 px-8 border border-transparent shadow-md text-sm font-bold rounded-xl text-white bg-indigo-650 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition duration-150 cursor-pointer"
                      >
                        {submitting ? 'Mengirimkan...' : 'Kirim Laporan Kerusakan'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

          </div>
        ) : null}
      </main>

      {/* Footer */}
      <footer className="bg-[var(--bg-panel)] transition-colors duration-400 border-t border-gray-200/80 py-4 text-center text-xs text-gray-400 font-medium">
        SIPRABU &copy; 2026. FT Universitas Sebelas Maret.
      </footer>
    </div>
  );
}
