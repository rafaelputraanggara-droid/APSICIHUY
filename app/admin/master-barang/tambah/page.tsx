'use client';

import React, { useState, useEffect } from 'react';

export default function TambahBarang() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [saving, setSaving] = useState(false);

  // Split SAKTI BMN code parts
  const [part1, setPart1] = useState('');
  const [part2, setPart2] = useState('');
  const [part3, setPart3] = useState('');
  const [part4, setPart4] = useState('');
  const [part5, setPart5] = useState('');

  // Other form fields
  const [nup, setNup] = useState('');
  const [namaBarang, setNamaBarang] = useState('');
  const [merkType, setMerkType] = useState('');
  const [thPerolehan, setThPerolehan] = useState(new Date().getFullYear().toString());
  const [kondisi, setKondisi] = useState('Baik');
  const [lokasiRuangan, setLokasiRuangan] = useState('');
  const [kategori, setKategori] = useState('');
  const [kategoriList, setKategoriList] = useState<string[]>([]);

  // Simulated User Auth Guard
  useEffect(() => {
    const checkUser = () => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('simulated_user');
        if (saved) {
          try {
            setCurrentUser(JSON.parse(saved));
          } catch (e) {}
        } else {
          setCurrentUser({
            name: "PJ Ruangan (Laboran)",
            email: "laboran@ft.uns.ac.id",
            role: "PJ_Ruangan",
          });
        }
      }
      setLoadingUser(false);
    };

    checkUser();
    window.addEventListener('simulated_user_change', checkUser);

    const fetchKategori = async () => {
      try {
        const res = await fetch('/api/kategori');
        const json = await res.json();
        if (json.success) {
          setKategoriList(json.data.map((item: any) => item.nama_kategori));
        }
      } catch (err) {}
    };
    fetchKategori();

    return () => window.removeEventListener('simulated_user_change', checkUser);
  }, []);

  const [successItem, setSuccessItem] = useState<{ kode: string; nup: string; ruangan: string } | null>(null);

  // Autofocus forward cursor navigation
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void,
    maxLength: number,
    nextId: string | null
  ) => {
    const val = e.target.value.replace(/\D/g, ''); // Digits only
    if (val.length <= maxLength) {
      setter(val);
      if (val.length === maxLength && nextId) {
        document.getElementById(nextId)?.focus();
      }
    }
  };

  // Autofocus backward cursor navigation
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    prevId: string | null
  ) => {
    if (e.key === 'Backspace' && e.currentTarget.value === '' && prevId) {
      document.getElementById(prevId)?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const kode_barang = `${part1}.${part2}.${part3}.${part4}.${part5}`;

    // Validate Kode Barang format X.XX.XX.XX.XXX
    if (!kode_barang.match(/^\d\.\d{2}\.\d{2}\.\d{2}\.\d{3}$/)) {
      alert('Format Kode Barang BMN SAKTI belum lengkap (harus X.XX.XX.XX.XXX)');
      return;
    }

    if (!kategori.trim()) {
      alert('Kategori wajib diisi!');
      return;
    }

    const kategoriLower = kategori.trim().toLowerCase();
    const existingKategori = kategoriList.find(k => k.toLowerCase() === kategoriLower);
    let finalKategori = existingKategori || kategori.trim();

    if (!existingKategori) {
      const confirmAdd = window.confirm(`Kategori "${finalKategori}" belum ditemukan di sistem. Apakah Anda ingin membuat kategori baru ini?`);
      if (!confirmAdd) return;

      setSaving(true);
      try {
        const resCat = await fetch('/api/kategori', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nama_kategori: finalKategori }),
        });
        const catData = await resCat.json();
        if (!catData.success) {
          alert('Gagal menambahkan kategori baru: ' + catData.error);
          setSaving(false);
          return;
        }
        setKategoriList([...kategoriList, finalKategori]);
      } catch (err) {
        alert('Terjadi kesalahan saat menambahkan kategori.');
        setSaving(false);
        return;
      }
      setSaving(false);
    }

    setSaving(true);
    try {
      const res = await fetch('/api/barangs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kode_barang,
          no_urut_pendaft: parseInt(nup),
          nama_barang: namaBarang,
          merk_type: merkType,
          th_perolehan: parseInt(thPerolehan),
          kondisi,
          lokasi_ruangan: lokasiRuangan,
          nama_kategori: finalKategori,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessItem({ kode: kode_barang, nup, ruangan: lokasiRuangan });
        // Reset form
        setPart1('');
        setPart2('');
        setPart3('');
        setPart4('');
        setPart5('');
        setNup('');
        setNamaBarang('');
        setMerkType('');
        setLokasiRuangan('');
        setKategori('');
        setKondisi('Baik');
        setThPerolehan(new Date().getFullYear().toString());
      } else {
        alert('Gagal menyimpan barang: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan koneksi sistem.');
    } finally {
      setSaving(false);
    }
  };

  const isAdminBMN =
    currentUser &&
    currentUser.role === 'Admin Fakultas' &&
    currentUser.email.endsWith('@staff.uns.ac.id');

  if (loadingUser) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAdminBMN) {
    return (
      <div className="max-w-md mx-auto mt-12 bg-[var(--bg-panel)] transition-colors duration-400 p-8 border border-red-200 dark:border-red-900/40 rounded-3xl text-center shadow-md">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-950/40 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-[var(--text-main)] transition-colors duration-400 mb-2">Akses Ditolak</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-450 leading-relaxed mb-6">
          Halaman ini dibatasi hanya untuk <strong>Admin Fakultas</strong> dengan email resmi <strong>@staff.uns.ac.id</strong>. Silakan ubah simulasi role di sidebar untuk mengakses halaman ini.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      {/* Title */}
      <div className="relative overflow-hidden bg-[var(--bg-banner)] text-white p-8 rounded-3xl shadow-lg transition-colors duration-400">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Admin Fakultas Area
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Tambah Data Barang</h1>
          <p className="text-indigo-100 max-w-xl text-sm">
            Daftarkan aset fisik milik negara secara manual ke database. Format kode barang akan divalidasi sesuai standar SAKTI BMN.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-[var(--bg-panel)] rounded-3xl border border-[var(--border-panel)] shadow-sm p-8 transition-colors duration-400">
        <h2 className="text-lg font-bold text-[var(--text-main)] border-b border-[var(--border-panel)] pb-4 mb-6 transition-colors duration-400">
          Registrasi Barang Baru
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-6">
            
            {/* Split Kode Barang Input */}
            <div className="sm:col-span-3">
              <label className="block text-sm font-semibold text-[var(--text-main)] transition-colors duration-400">
                Kode Barang (Format SAKTI) <span className="text-rose-500">*</span>
              </label>
              <div className="mt-2 flex items-center space-x-1.5 sm:space-x-2">
                <input
                  id="part1"
                  type="text"
                  value={part1}
                  onChange={(e) => handleInputChange(e, setPart1, 1, 'part2')}
                  onKeyDown={(e) => handleKeyDown(e, null)}
                  maxLength={1}
                  inputMode="numeric"
                  className="w-12 text-center text-sm font-mono font-bold bg-[var(--bg-app)] border border-[var(--border-panel)] rounded-xl py-3 text-[var(--text-main)] focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors duration-400"
                  placeholder="G"
                  required
                />
                <span className="text-[var(--text-muted)] font-bold select-none">.</span>
                <input
                  id="part2"
                  type="text"
                  value={part2}
                  onChange={(e) => handleInputChange(e, setPart2, 2, 'part3')}
                  onKeyDown={(e) => handleKeyDown(e, 'part1')}
                  maxLength={2}
                  inputMode="numeric"
                  className="w-14 text-center text-sm font-mono font-bold bg-[var(--bg-app)] transition-colors duration-400 border border-neutral-200 dark:border-neutral-700 rounded-xl py-3 text-[var(--text-main)] transition-colors duration-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="Bi"
                  required
                />
                <span className="text-[var(--text-muted)] font-bold select-none">.</span>
                <input
                  id="part3"
                  type="text"
                  value={part3}
                  onChange={(e) => handleInputChange(e, setPart3, 2, 'part4')}
                  onKeyDown={(e) => handleKeyDown(e, 'part2')}
                  maxLength={2}
                  inputMode="numeric"
                  className="w-14 text-center text-sm font-mono font-bold bg-[var(--bg-app)] transition-colors duration-400 border border-neutral-200 dark:border-neutral-700 rounded-xl py-3 text-[var(--text-main)] transition-colors duration-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="Ke"
                  required
                />
                <span className="text-[var(--text-muted)] font-bold select-none">.</span>
                <input
                  id="part4"
                  type="text"
                  value={part4}
                  onChange={(e) => handleInputChange(e, setPart4, 2, 'part5')}
                  onKeyDown={(e) => handleKeyDown(e, 'part3')}
                  maxLength={2}
                  inputMode="numeric"
                  className="w-14 text-center text-sm font-mono font-bold bg-[var(--bg-app)] border border-[var(--border-panel)] rounded-xl py-3 text-[var(--text-main)] focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors duration-400"
                  placeholder="SK"
                  required
                />
                <span className="text-[var(--text-muted)] font-bold select-none">.</span>
                <input
                  id="part5"
                  type="text"
                  value={part5}
                  onChange={(e) => handleInputChange(e, setPart5, 3, 'nup')}
                  onKeyDown={(e) => handleKeyDown(e, 'part4')}
                  maxLength={3}
                  inputMode="numeric"
                  className="w-18 text-center text-sm font-mono font-bold bg-[var(--bg-app)] border border-[var(--border-panel)] rounded-xl py-3 text-[var(--text-main)] focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors duration-400"
                  placeholder="SSK"
                  required
                />
              </div>
              <p className="mt-2 text-xxs text-neutral-400 dark:text-[var(--text-muted)] uppercase tracking-wide">
                Golongan . Bidang . Kelompok . Sub-Kelompok . Sub-Sub Kelompok
              </p>
            </div>

            {/* NUP */}
            <div className="sm:col-span-3">
              <label htmlFor="nup" className="block text-sm font-semibold text-[var(--text-main)] transition-colors duration-400">
                No Urut Pendaftaran (NUP) <span className="text-rose-500">*</span>
              </label>
              <div className="mt-2">
                <input
                  type="number"
                  id="nup"
                  value={nup}
                  onChange={(e) => setNup(e.target.value)}
                  required
                  min="1"
                  className="w-full bg-[var(--bg-app)] border border-[var(--border-panel)] px-4 py-3 rounded-xl text-sm text-[var(--text-main)] focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors duration-400"
                  placeholder="Masukkan nomor urut (misal: 1)"
                />
              </div>
            </div>

            {/* Nama Barang */}
            <div className="sm:col-span-3">
              <label className="block text-sm font-semibold text-[var(--text-main)] transition-colors duration-400">
                Nama Barang BMN <span className="text-rose-500">*</span>
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  value={namaBarang}
                  onChange={(e) => setNamaBarang(e.target.value)}
                  required
                  className="w-full bg-[var(--bg-app)] transition-colors duration-400 border border-neutral-200 dark:border-neutral-700 px-4 py-3 rounded-xl text-sm text-[var(--text-main)] transition-colors duration-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="Contoh: PC Desktop Lenovo ThinkCentre"
                />
              </div>
            </div>

            {/* Merk / Type */}
            <div className="sm:col-span-3">
              <label className="block text-sm font-semibold text-[var(--text-main)] transition-colors duration-400">
                Merk / Type / Spesifikasi <span className="text-rose-500">*</span>
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  value={merkType}
                  onChange={(e) => setMerkType(e.target.value)}
                  required
                  className="w-full bg-[var(--bg-app)] transition-colors duration-400 border border-neutral-200 dark:border-neutral-700 px-4 py-3 rounded-xl text-sm text-[var(--text-main)] transition-colors duration-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="Contoh: Core i5 / RAM 16GB / SSD 512GB"
                />
              </div>
            </div>

            {/* Tahun Perolehan */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-[var(--text-main)] transition-colors duration-400">
                Tahun Perolehan <span className="text-rose-500">*</span>
              </label>
              <div className="mt-2">
                <input
                  type="number"
                  value={thPerolehan}
                  onChange={(e) => setThPerolehan(e.target.value)}
                  required
                  min="1900"
                  max="2100"
                  className="w-full bg-[var(--bg-app)] transition-colors duration-400 border border-neutral-200 dark:border-neutral-700 px-4 py-3 rounded-xl text-sm text-[var(--text-main)] transition-colors duration-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Lokasi Ruangan */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-[var(--text-main)] transition-colors duration-400">
                Kode Ruangan / Lokasi <span className="text-rose-500">*</span>
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  value={lokasiRuangan}
                  onChange={(e) => setLokasiRuangan(e.target.value)}
                  required
                  className="w-full bg-[var(--bg-app)] transition-colors duration-400 border border-neutral-200 dark:border-neutral-700 px-4 py-3 rounded-xl text-sm text-[var(--text-main)] transition-colors duration-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="Contoh: LAB-RPL-301"
                />
              </div>
            </div>

            {/* Kondisi */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-[var(--text-main)] transition-colors duration-400">
                Kondisi Aset <span className="text-rose-500">*</span>
              </label>
              <div className="mt-2">
                <select
                  value={kondisi}
                  onChange={(e) => setKondisi(e.target.value)}
                  className="w-full bg-[var(--bg-app)] border border-[var(--border-panel)] px-4 py-3 rounded-xl text-sm text-[var(--text-main)] focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors duration-400"
                >
                  <option value="Baik">Baik</option>
                  <option value="Rusak Ringan">Rusak Ringan</option>
                  <option value="Rusak Berat">Rusak Berat</option>
                </select>
              </div>
            </div>

            {/* Kategori */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-[var(--text-main)] transition-colors duration-400">
                Kategori Barang <span className="text-rose-500">*</span>
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  list="kategori-list"
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                  required
                  className="w-full bg-[var(--bg-app)] border border-[var(--border-panel)] px-4 py-3 rounded-xl text-sm text-[var(--text-main)] focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors duration-400"
                  placeholder="Ketik/Pilih Kategori"
                />
                <datalist id="kategori-list">
                  {kategoriList.map((cat, idx) => (
                    <option key={idx} value={cat} />
                  ))}
                </datalist>
              </div>
            </div>

          </div>

          <div className="pt-6 border-t border-neutral-100 border-[var(--border-panel)] flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex justify-center items-center py-2.5 px-6 border border-transparent shadow-sm text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition-all cursor-pointer shadow-indigo-100 hover:shadow"
            >
              {saving ? 'Menyimpan...' : 'Simpan Data Barang'}
            </button>
          </div>
        </form>
      </div>

      {/* Success Modal for Printing Label */}
      {successItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-sm">
          <div className="bg-[var(--bg-panel)] transition-colors duration-400 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden border border-[var(--border-panel)] text-center p-6 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[var(--text-main)] transition-colors duration-400">Data Tersimpan!</h3>
            <p className="text-sm text-[var(--text-muted)] transition-colors duration-400">
              Barang berhasil diregistrasi ke ruangan <span className="font-bold text-[var(--text-main)] transition-colors duration-400">{successItem.ruangan}</span>. Apakah Anda ingin langsung mencetak label QR untuk barang ini?
            </p>
            <div className="pt-4 flex flex-col gap-3">
              <a 
                href={`/admin/master-barang/database-barang/${encodeURIComponent(successItem.ruangan)}/cetak-label?item=${successItem.kode}_${successItem.nup}`}
                target="_blank"
                onClick={() => setSuccessItem(null)}
                className="w-full inline-flex justify-center items-center py-2.5 px-4 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors"
              >
                Cetak Label QR
              </a>
              <button 
                onClick={() => setSuccessItem(null)}
                className="w-full inline-flex justify-center items-center py-2.5 px-4 bg-neutral-100 dark:bg-neutral-800 text-[var(--text-main)] transition-colors duration-400 rounded-xl text-sm font-bold hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
