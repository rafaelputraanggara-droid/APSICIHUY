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

  // Handle file input and convert to base64
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
      <div className="min-h-screen bg-[var(--bg-app)] flex flex-col justify-between font-sans transition-colors duration-300">
        <header className="bg-[var(--bg-panel)] border-b border-[var(--border-panel)] sticky top-0 z-30 shadow-sm px-6 py-4 transition-colors duration-300">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-neutral-800 flex items-center justify-center text-white font-bold text-lg shadow-sm">S</div>
              <div>
                <h1 className="text-base font-extrabold text-[var(--text-main)] tracking-tight">SIPRABU FT UNS</h1>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-panel)] p-8 rounded-3xl shadow-xl border border-[var(--border-panel)] max-w-md w-full text-center transition-colors duration-300">
            <div className="w-16 h-16 bg-[var(--tag-danger-bg)] text-[var(--tag-danger-text)] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[var(--border-panel)]">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[var(--text-main)] mb-2">Akses Ditolak</h2>
            <p className="text-sm text-[var(--text-muted)] mb-6">
              Halaman pelaporan kerusakan ini hanya dapat diakses oleh Mahasiswa yang sudah terdaftar. Silakan login sebagai Mahasiswa terlebih dahulu.
            </p>
            <button 
              onClick={() => router.push('/')} 
              className="bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-md transition"
            >
              Kembali ke Beranda
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-app)] flex flex-col justify-between font-sans transition-colors duration-300">
      {/* Top Navigation */}
      <header className="bg-[var(--bg-panel)] border-b border-[var(--border-panel)] sticky top-0 z-30 shadow-sm px-6 py-4 transition-colors duration-300">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-neutral-800 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              S
            </div>
            <div>
              <h1 className="text-base font-extrabold text-[var(--text-main)] tracking-tight">SIPRABU FT UNS</h1>
              <p className="text-xxs text-[var(--text-muted)] font-semibold uppercase tracking-wider">Lapor Aset BMN</p>
            </div>
          </div>
          <button 
            onClick={() => router.push('/')}
            className="text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] px-3 py-1.5 rounded-lg hover:bg-[var(--bg-sidebar-hover)] transition"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        {loading ? (
          /* Loading State */
          <div className="bg-[var(--bg-panel)] rounded-3xl border border-[var(--border-panel)] p-8 shadow-sm text-center flex flex-col items-center justify-center py-20 transition-colors duration-300">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--text-muted)] mb-4"></div>
            <p className="text-sm font-semibold text-[var(--text-muted)]">Mengambil data aset barang...</p>
          </div>
        ) : error ? (
          /* Error State */
          <div className="bg-[var(--bg-panel)] rounded-3xl border border-[var(--border-panel)] p-8 shadow-sm text-center py-16 transition-colors duration-300">
            <div className="w-16 h-16 bg-[var(--tag-danger-bg)] text-[var(--tag-danger-text)] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[var(--border-panel)]">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-extrabold text-[var(--text-main)] mb-2">Aset Tidak Ditemukan</h2>
            <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto leading-relaxed mb-6">
              {error}. Pastikan QR Code yang Anda scan valid atau hubungi Administrator jika data terhapus.
            </p>
            <button
              onClick={() => router.push('/')}
              className="inline-flex justify-center px-5 py-2.5 bg-neutral-800 text-white rounded-xl text-sm font-bold shadow-md hover:bg-neutral-700 transition"
            >
              Kembali ke Dashboard
            </button>
          </div>
        ) : barang ? (
          /* Main Layout when Item is Found */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Asset Detail Card */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-[var(--bg-panel)] rounded-3xl border border-[var(--border-panel)] p-6 shadow-sm space-y-5 transition-colors duration-300">
                <div className="border-b border-[var(--border-panel)] pb-4">
                  <span className="text-xxs font-bold uppercase tracking-wider text-[var(--tag-info-text)] bg-[var(--tag-info-bg)] px-2.5 py-1 rounded-md">
                    Informasi Aset
                  </span>
                  <h3 className="text-lg font-bold text-[var(--text-main)] mt-3">{barang.nama_barang}</h3>
                  <p className="text-xs text-[var(--text-muted)] mt-1 font-semibold">{barang.merk_type}</p>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <span className="text-xxs font-bold text-[var(--text-muted)] uppercase">Kode Barang</span>
                    <p className="text-sm font-bold font-mono text-[var(--text-main)]">{barang.kode_barang}</p>
                  </div>
                  <div>
                    <span className="text-xxs font-bold text-[var(--text-muted)] uppercase">No Urut Pendaftaran (NUP)</span>
                    <p className="text-sm font-bold font-mono text-[var(--text-main)]">{String(barang.no_urut_pendaft).padStart(3, '0')}</p>
                  </div>
                  <div>
                    <span className="text-xxs font-bold text-[var(--text-muted)] uppercase">Tahun Perolehan</span>
                    <p className="text-sm font-bold text-[var(--text-main)]">{barang.th_perolehan}</p>
                  </div>
                  <div>
                    <span className="text-xxs font-bold text-[var(--text-muted)] uppercase">Lokasi Ruangan</span>
                    <p className="text-sm font-bold text-[var(--tag-info-text)] bg-[var(--tag-info-bg)] px-2 py-1 rounded-lg inline-block border border-[var(--border-panel)]">{barang.lokasi_ruangan}</p>
                  </div>
                  <div>
                    <span className="text-xxs font-bold text-[var(--text-muted)] uppercase">Kondisi Saat Ini</span>
                    <div>
                      <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-bold rounded-full border ${
                        barang.kondisi === 'Baik' ? 'bg-[var(--tag-success-bg)] text-[var(--tag-success-text)] border-[var(--border-panel)]' : 
                        barang.kondisi === 'Rusak Ringan' ? 'bg-[var(--tag-warning-bg)] text-[var(--tag-warning-text)] border-[var(--border-panel)]' : 
                        'bg-[var(--tag-danger-bg)] text-[var(--tag-danger-text)] border-[var(--border-panel)]'
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
              <div className="bg-[var(--bg-panel)] rounded-3xl border border-[var(--border-panel)] p-6 sm:p-8 shadow-sm transition-colors duration-300">
                <h2 className="text-xl font-bold text-[var(--text-main)] border-b border-[var(--border-panel)] pb-4 mb-6">Laporkan Kerusakan Barang</h2>
                
                {isSuccess ? (
                  /* Success Screen inside Form Box */
                  <div className="text-center py-10 space-y-5 animate-fade-in">
                    <div className="w-16 h-16 bg-[var(--tag-success-bg)] text-[var(--tag-success-text)] rounded-full flex items-center justify-center mx-auto border border-[var(--border-panel)] shadow-sm">
                      <svg className="w-9 h-9 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-extrabold text-[var(--text-main)]">Laporan Berhasil Terkirim!</h3>
                      <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto leading-relaxed">
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
                        className="px-5 py-2.5 border border-[var(--border-panel)] hover:bg-[var(--bg-sidebar-hover)] text-[var(--text-main)] rounded-xl text-sm font-semibold transition"
                      >
                        Kirim Laporan Lain
                      </button>
                      <button
                        onClick={() => router.push('/')}
                        className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-sm font-bold shadow-md transition"
                      >
                        Buka Dashboard
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Form */
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-[var(--text-main)]">
                        Nama / Identitas Pelapor <span className="text-[var(--tag-danger-text)]">*</span>
                      </label>
                      <input
                        type="text"
                        value={namaPelapor}
                        onChange={(e) => setNamaPelapor(e.target.value)}
                        required
                        className="mt-2 shadow-sm focus:ring-2 focus:ring-neutral-400 block w-full sm:text-sm border-[var(--border-input,#cccccc)] rounded-xl px-3.5 py-3 border focus:outline-none bg-[var(--bg-input,#ffffff)] text-[var(--text-input,#000000)] placeholder-[var(--text-placeholder,#999999)]"
                        placeholder="Contoh: Budi Santoso (Mahasiswa / PJ Kelas)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[var(--text-main)]">
                        Deskripsi Kerusakan <span className="text-[var(--tag-danger-text)]">*</span>
                      </label>
                      <textarea
                        rows={4}
                        value={deskripsi}
                        onChange={(e) => setDeskripsi(e.target.value)}
                        required
                        className="mt-2 shadow-sm focus:ring-2 focus:ring-neutral-400 block w-full sm:text-sm border-[var(--border-input,#cccccc)] rounded-xl px-3.5 py-3 border focus:outline-none bg-[var(--bg-input,#ffffff)] text-[var(--text-input,#000000)] placeholder-[var(--text-placeholder,#999999)]"
                        placeholder="Jelaskan bagian mana yang rusak dan gejala yang dialami (misal: Monitor bergaris-garis merah horizontal, tidak bisa menyala)."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[var(--text-main)]">
                        Upload Foto Bukti Kerusakan <span className="text-[var(--tag-danger-text)]">*</span>
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        required
                        className="mt-2 block w-full text-sm text-[var(--text-main)]
                          file:mr-4 file:py-2.5 file:px-4
                          file:rounded-xl file:border-0
                          file:text-sm file:font-semibold
                          file:bg-indigo-50 file:text-indigo-700
                          hover:file:bg-indigo-100 transition-colors"
                      />
                    </div>

                    {fotoUrl && (
                      <div className="border border-[var(--border-panel)] rounded-2xl p-2 bg-[var(--bg-app)] inline-block w-full">
                        <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase block mb-1">Pratinjau Foto Bukti</span>
                        <img src={fotoUrl} alt="Preview Bukti Kerusakan" className="h-40 w-auto object-cover rounded-xl" />
                      </div>
                    )}

                    <div className="pt-4 flex justify-end border-t border-[var(--border-panel)]">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex justify-center py-3 px-8 border border-transparent shadow-md text-sm font-bold rounded-xl text-white bg-neutral-800 hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500 disabled:opacity-50 transition duration-150 cursor-pointer"
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
      <footer className="bg-[var(--bg-panel)] border-t border-[var(--border-panel)] py-4 text-center text-xs text-[var(--text-muted)] font-medium transition-colors duration-300">
        SIPRABU &copy; 2026. FT Universitas Sebelas Maret.
      </footer>
    </div>
  );
}
