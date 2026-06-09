'use client';

import React, { useState, useEffect } from 'react';

interface Barang {
  id: number;
  kode_barang: string;
  no_urut_pendaft: number;
  nama_barang: string;
  merk_type: string;
  th_perolehan: number;
  lokasi_ruangan: string;
  kondisi: string;
  kategori: 'Rendah' | 'Tinggi';
}

interface MutationRecord {
  id: number;
  kode_barang: string;
  no_urut_pendaft: number;
  nama_barang: string;
  merk_type: string;
  kategori: 'Rendah' | 'Tinggi';
  ruangan_asal: string;
  ruangan_tujuan: string;
  alasan: string;
  foto_bukti: string | null;
  status_mutasi: 'Pending_Asal' | 'Pending_Tujuan' | 'Disetujui' | 'Ditolak_Asal' | 'Ditolak_Tujuan';
  diajukan_oleh: string;
  disetujui_asal_oleh: string | null;
  disetujui_tujuan_oleh: string | null;
  created_at: string;
}

const AVAILABLE_ROOMS = ['LAB-RPL', 'LAB-JAS', 'LAB-KOD', 'LAB-SISMED', 'LAB-JARKOM'];

export default function MutasiPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [barangs, setBarangs] = useState<Barang[]>([]);
  const [mutations, setMutations] = useState<MutationRecord[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [approvingId, setApprovingId] = useState<number | null>(null);

  // Form States
  const [selectedBarangId, setSelectedBarangId] = useState<string>('');
  const [destRoom, setDestRoom] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [photoBase64, setPhotoBase64] = useState<string>('');
  const [photoName, setPhotoName] = useState<string>('');

  // UI States
  const [activeTab, setActiveTab] = useState<'request' | 'queue' | 'history'>('request');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showPhotoModal, setShowPhotoModal] = useState<string | null>(null);
  
  // QR Scan Simulation Modal
  const [showScanModal, setShowScanModal] = useState<boolean>(false);
  const [scanFilterQuery, setScanFilterQuery] = useState<string>('');

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const barangsRes = await fetch('/api/barangs');
      const barangsData = await barangsRes.json();
      if (barangsData.success) {
        setBarangs(barangsData.data);
      }

      const mutationsRes = await fetch('/api/mutasi');
      const mutationsData = await mutationsRes.json();
      if (mutationsData.success) {
        setMutations(mutationsData.data);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load current simulated user
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
    };

    checkUser();
    fetchInitialData();

    window.addEventListener('simulated_user_change', checkUser);
    return () => window.removeEventListener('simulated_user_change', checkUser);
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateMutation = async (e: React.FormEvent) => {
    e.preventDefault();
    const barang = barangs.find(b => b.id === parseInt(selectedBarangId));
    if (!barang || !destRoom || !reason) {
      alert('Mohon isi semua data formulir mutasi.');
      return;
    }

    if (barang.kategori === 'Tinggi' && !photoBase64) {
      alert('Foto bukti kondisi barang wajib diunggah untuk barang kategori BMN/Tinggi.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/mutasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kode_barang: barang.kode_barang,
          no_urut_pendaft: barang.no_urut_pendaft,
          ruangan_tujuan: destRoom,
          alasan: reason,
          foto_bukti: barang.kategori === 'Tinggi' ? photoBase64 : null,
          diajukan_oleh: currentUser ? `${currentUser.name} (${currentUser.email})` : 'System Simulated'
        })
      });

      const data = await res.json();
      if (data.success) {
        alert(
          data.direct 
            ? 'Mutasi berhasil! Karena barang kategori Rendah, lokasi barang telah diperbarui secara langsung.' 
            : 'Permohonan mutasi berhasil diajukan! Menunggu persetujuan PJ Ruangan Asal.'
        );
        // Reset form states
        setSelectedBarangId('');
        setDestRoom('');
        setReason('');
        setPhotoBase64('');
        setPhotoName('');
        
        await fetchInitialData();
        setActiveTab(data.direct ? 'history' : 'queue');
      } else {
        alert('Gagal mengajukan mutasi: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan sistem saat memproses pengajuan mutasi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveAction = async (id: number, action: 'approve' | 'reject') => {
    if (!currentUser) return;
    
    setApprovingId(id);
    try {
      const res = await fetch('/api/mutasi/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          action,
          user_name: currentUser.name
        })
      });

      const data = await res.json();
      if (data.success) {
        alert(data.message);
        await fetchInitialData();
      } else {
        alert('Gagal memproses persetujuan: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan sistem saat memproses persetujuan.');
    } finally {
      setApprovingId(null);
    }
  };

  const selectedBarang = barangs.find(b => b.id === parseInt(selectedBarangId));
  const otherRooms = selectedBarang 
    ? AVAILABLE_ROOMS.filter(r => r !== selectedBarang.lokasi_ruangan)
    : AVAILABLE_ROOMS;

  const scannedBarangList = barangs.filter(b => {
    if (!scanFilterQuery) return true;
    return b.nama_barang.toLowerCase().includes(scanFilterQuery.toLowerCase()) ||
           b.kode_barang.toLowerCase().includes(scanFilterQuery.toLowerCase());
  });

  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto">
      {/* Visual Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-violet-700 via-indigo-650 to-blue-650 text-white p-8 rounded-3xl shadow-lg">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Sistem Mutasi Aset
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Mutasi & Pemindahan Barang</h1>
          <p className="text-indigo-100 max-w-2xl text-sm">
            Lakukan pemindahan barang antar ruangan. Barang kategori Rendah dipindah otomatis, sedangkan barang BMN/Tinggi melewati alur verifikasi multi-step.
          </p>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
        <nav className="flex space-x-8 overflow-x-auto" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('request')}
            className={`py-4 px-1 border-b-2 font-bold text-sm whitespace-nowrap cursor-pointer transition-all duration-200 ${
              activeTab === 'request'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300 dark:text-neutral-400 dark:hover:text-neutral-300'
            }`}
          >
            Ajukan Mutasi Baru
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`py-4 px-1 border-b-2 font-bold text-sm whitespace-nowrap cursor-pointer transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'queue'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300 dark:text-neutral-400 dark:hover:text-neutral-300'
            }`}
          >
            Antrean Persetujuan
            {mutations.filter(m => m.status_mutasi === 'Pending_Asal' || m.status_mutasi === 'Pending_Tujuan').length > 0 && (
              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 rounded-full text-xxs font-extrabold animate-pulse">
                {mutations.filter(m => m.status_mutasi === 'Pending_Asal' || m.status_mutasi === 'Pending_Tujuan').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-4 px-1 border-b-2 font-bold text-sm whitespace-nowrap cursor-pointer transition-all duration-200 ${
              activeTab === 'history'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300 dark:text-neutral-400 dark:hover:text-neutral-300'
            }`}
          >
            Riwayat Mutasi
          </button>
        </nav>
      </div>

      {/* Main Tabs Contents */}
      {loading ? (
        <div className="p-16 text-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-3"></div>
          <p className="text-sm text-neutral-500">Memuat data...</p>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* TAB 1: SUBMIT NEW MUTATION */}
          {activeTab === 'request' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Form Card */}
              <div className="lg:col-span-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-3xl shadow-sm space-y-6">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white border-b pb-3">Formulir Pengajuan Mutasi</h3>
                
                <form onSubmit={handleCreateMutation} className="space-y-5">
                  <div className="flex flex-col sm:flex-row items-end gap-3">
                    <div className="flex-1 w-full">
                      <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                        Pilih Barang Milik Negara <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={selectedBarangId}
                        onChange={(e) => setSelectedBarangId(e.target.value)}
                        required
                        className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-250 dark:border-neutral-700 px-3 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none text-neutral-900 dark:text-white font-medium"
                      >
                        <option value="">-- Pilih Barang dari Daftar --</option>
                        {barangs.map(b => (
                          <option key={b.id} value={b.id}>
                            {b.kode_barang} [NUP: {b.no_urut_pendaft}] - {b.nama_barang} ({b.lokasi_ruangan})
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setShowScanModal(true)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 dark:hover:bg-indigo-950/70 border border-indigo-150 rounded-xl text-sm font-bold shadow-sm transition-all cursor-pointer h-10.5"
                    >
                      <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-4v-4m-2 4h-2m-2-4h-2m8 0h2m-2 2h2m-4-6h4M6 6h4v4H6V6zm10 0h4v4h-4V6zM6 16h4v4H6v-4z" />
                      </svg>
                      Simulasi Scan QR
                    </button>
                  </div>

                  {/* Selected Barang Info Box */}
                  {selectedBarang && (
                    <div className="p-4 bg-indigo-50/35 border border-indigo-150 rounded-2xl space-y-3 font-sans">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xxs font-bold uppercase tracking-wider text-indigo-650 dark:text-indigo-400">Barang Terpilih</p>
                          <h4 className="text-sm font-bold text-neutral-900 dark:text-white mt-0.5">{selectedBarang.nama_barang}</h4>
                          <p className="text-xs text-neutral-500 mt-0.5">{selectedBarang.merk_type} ({selectedBarang.th_perolehan})</p>
                        </div>
                        <span className={`px-2.5 py-1 text-xxs font-extrabold rounded-md border ${
                          selectedBarang.kategori === 'Tinggi' 
                            ? 'bg-violet-50 text-violet-700 border-violet-200' 
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          Kategori: {selectedBarang.kategori === 'Tinggi' ? 'BMN/Tinggi' : 'Rendah'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-xs pt-2 border-t border-indigo-150/50">
                        <div>
                          <span className="text-neutral-450">Ruangan Asal (Lokasi Saat Ini):</span>
                          <p className="font-bold text-neutral-800 dark:text-neutral-200 mt-0.5">{selectedBarang.lokasi_ruangan}</p>
                        </div>
                        <div>
                          <span className="text-neutral-450">Kondisi Barang:</span>
                          <p className="font-bold text-neutral-800 dark:text-neutral-200 mt-0.5">{selectedBarang.kondisi}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Ruangan Tujuan */}
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                      Pilih Ruangan Tujuan <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={destRoom}
                      onChange={(e) => setDestRoom(e.target.value)}
                      required
                      className="w-full bg-neutral-55 dark:bg-neutral-800 border border-neutral-250 dark:border-neutral-700 px-3 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none text-neutral-900 dark:text-white font-medium"
                    >
                      <option value="">-- Pilih Ruangan Tujuan --</option>
                      {otherRooms.map(room => (
                        <option key={room} value={room}>{room}</option>
                      ))}
                    </select>
                  </div>

                  {/* Alasan Mutasi */}
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                      Alasan Pemindahan <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      required
                      rows={3}
                      placeholder="Contoh: Pemindahan unit untuk kebutuhan laboratorium baru, penyeimbangan utilitas, dll."
                      className="w-full bg-neutral-55 dark:bg-neutral-800 border border-neutral-250 dark:border-neutral-700 px-3 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none text-neutral-900 dark:text-white placeholder-neutral-450 font-medium"
                    />
                  </div>

                  {/* Upload Foto (For Tinggi Category only) */}
                  {selectedBarang && selectedBarang.kategori === 'Tinggi' && (
                    <div className="space-y-2 animate-fade-in">
                      <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                        Foto Bukti Kondisi Barang <span className="text-red-500">*</span>
                      </label>
                      <p className="text-xxs text-neutral-450">Foto kondisi fisik wajib dilampirkan untuk verifikasi awal PJ Ruangan Asal sebelum disetujui.</p>
                      
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-neutral-50 dark:bg-neutral-900 dark:hover:bg-neutral-850 text-neutral-700 dark:text-neutral-300 border border-neutral-250 dark:border-neutral-700 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer">
                          <svg className="w-4 h-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Unggah Foto Bukti
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handlePhotoChange} 
                            required={!photoBase64}
                            className="hidden" 
                          />
                        </label>
                        <button
                          type="button"
                          id="btn-simulate-upload"
                          onClick={() => {
                            setPhotoName('simulated_photo.jpg');
                            setPhotoBase64('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=');
                          }}
                          className="px-3.5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 dark:hover:bg-indigo-950/70 border border-indigo-150 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
                        >
                          Simulasi Upload
                        </button>
                        {photoName ? (
                          <span className="text-xs text-neutral-500 font-medium truncate max-w-[200px]">{photoName}</span>
                        ) : (
                          <span className="text-xs text-rose-500 font-bold animate-pulse">Belum ada foto terpilih</span>
                        )}
                      </div>

                      {photoBase64 && (
                        <div className="mt-3 relative w-36 h-36 border border-neutral-200 rounded-xl overflow-hidden shadow-inner">
                          <img src={photoBase64} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-4 border-t border-neutral-100 flex justify-end">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex justify-center items-center gap-2 py-2.5 px-6 border border-transparent shadow-md text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-all cursor-pointer"
                    >
                      {submitting ? 'Mengajukan...' : selectedBarang?.kategori === 'Rendah' ? 'Pindah Sekarang' : 'Ajukan Pindah'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Sidebar Info Flow */}
              <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-3xl shadow-sm h-fit space-y-6">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Alur Logika Mutasi</h3>
                
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-450 text-xs font-black flex items-center justify-center">1</span>
                    <div className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
                      <strong className="text-neutral-800 dark:text-neutral-200">Kategori 1: Barang Rendah</strong>
                      <p className="mt-0.5">Pemindahan bersifat langsung dan tercatat instan di sistem tanpa menunggu approval dari siapapun. Lokasi barang berubah real-time.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-450 text-xs font-black flex items-center justify-center">2</span>
                    <div className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
                      <strong className="text-neutral-800 dark:text-neutral-200">Kategori 2: Barang BMN/Tinggi</strong>
                      <p className="mt-0.5">Membutuhkan bukti foto kondisi fisik. Permohonan akan masuk ke antrean persetujuan PJ Ruangan Asal terlebih dahulu.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-450 text-xs font-black flex items-center justify-center">3</span>
                    <div className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
                      <strong className="text-neutral-800 dark:text-neutral-200">Penerimaan Barang</strong>
                      <p className="mt-0.5">Setelah PJ Asal menyetujui, PJ Ruangan Tujuan harus memverifikasi fisik barang masuk sebelum menerima pengajuan secara resmi.</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: APPROVAL QUEUE */}
          {activeTab === 'queue' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-3 mb-4">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Antrean Persetujuan Aktif</h3>
                <span className="text-xs text-neutral-400 dark:text-neutral-500 font-semibold uppercase">Simulasi Role: {currentUser?.role}</span>
              </div>
              
              {mutations.filter(m => m.status_mutasi === 'Pending_Asal' || m.status_mutasi === 'Pending_Tujuan').length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl text-neutral-400">
                  Tidak ada pengajuan mutasi aktif yang menunggu persetujuan saat ini.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {mutations.filter(m => m.status_mutasi === 'Pending_Asal' || m.status_mutasi === 'Pending_Tujuan').map(m => {
                    const isPendingAsal = m.status_mutasi === 'Pending_Asal';
                    const isPendingTujuan = m.status_mutasi === 'Pending_Tujuan';
                    
                    // Simulated authorization: PJ Ruangan or Admin BMN can approve
                    const canAct = currentUser && (currentUser.role === 'PJ_Ruangan' || currentUser.role === 'Admin BMN');

                    return (
                      <div key={m.id} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 rounded-3xl shadow-sm space-y-4 flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-mono text-xxs font-bold text-indigo-650 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md">
                                {m.kode_barang}
                              </span>
                              <span className="font-mono text-xxs font-bold text-neutral-450 ml-2">NUP: {m.no_urut_pendaft}</span>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-xxs font-extrabold flex items-center gap-1.5 ${
                              isPendingAsal 
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400' 
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400'
                            }`}>
                              <span className={`h-1.5 w-1.5 rounded-full animate-ping ${isPendingAsal ? 'bg-amber-500' : 'bg-blue-500'}`}></span>
                              {isPendingAsal ? 'Approval Asal' : 'Penerimaan Tujuan'}
                            </span>
                          </div>

                          <div>
                            <h4 className="text-sm font-bold text-neutral-900 dark:text-white">{m.nama_barang}</h4>
                            <p className="text-xxs text-neutral-450">{m.merk_type}</p>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-xs bg-neutral-50 dark:bg-neutral-850 p-3 rounded-2xl">
                            <div>
                              <span className="text-neutral-400 font-semibold block text-[10px] uppercase">Asal</span>
                              <p className="font-bold text-neutral-800 dark:text-neutral-200 mt-0.5">{m.ruangan_asal}</p>
                            </div>
                            <div>
                              <span className="text-neutral-400 font-semibold block text-[10px] uppercase">Tujuan</span>
                              <p className="font-bold text-indigo-700 dark:text-indigo-400 mt-0.5">{m.ruangan_tujuan}</p>
                            </div>
                          </div>

                          <div className="text-xs">
                            <span className="text-neutral-400 font-semibold">Alasan Pemindahan:</span>
                            <p className="text-neutral-700 dark:text-neutral-350 italic mt-0.5 font-medium">"{m.alasan}"</p>
                          </div>

                          <div className="text-[10px] text-neutral-450 space-y-0.5">
                            <div>Diajukan oleh: <span className="font-bold text-neutral-600 dark:text-neutral-400">{m.diajukan_oleh}</span></div>
                            {m.disetujui_asal_oleh && (
                              <div>Disetujui Asal oleh: <span className="font-bold text-emerald-600">{m.disetujui_asal_oleh}</span></div>
                            )}
                          </div>

                          {m.foto_bukti && (
                            <div className="pt-1">
                              <button
                                onClick={() => setShowPhotoModal(m.foto_bukti)}
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                Lihat Foto Kondisi
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Visual Linear Stepper (Workflow State Tracker) */}
                        <div className="py-4 border-t border-b border-neutral-100 dark:border-neutral-800 my-2">
                          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Tahap Verifikasi:</p>
                          <div className="flex items-center w-full text-center">
                            
                            {/* Step 1: Diajukan */}
                            <div className="flex-1 flex flex-col items-center">
                              <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black shadow-sm">✓</div>
                              <span className="text-[9px] font-bold text-neutral-700 dark:text-neutral-350 mt-1">Diajukan</span>
                            </div>
                            
                            <div className="w-8 border-t-2 border-emerald-500"></div>

                            {/* Step 2: Persetujuan Asal */}
                            <div className="flex-1 flex flex-col items-center">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                                isPendingAsal 
                                  ? 'bg-amber-500 text-white animate-pulse' 
                                  : 'bg-emerald-500 text-white shadow-sm'
                              }`}>
                                {isPendingAsal ? '•' : '✓'}
                              </div>
                              <span className="text-[9px] font-bold text-neutral-750 mt-1">Persetujuan Asal</span>
                            </div>

                            <div className={`w-8 border-t-2 ${isPendingAsal ? 'border-neutral-200' : 'border-emerald-500'}`}></div>

                            {/* Step 3: Konfirmasi Tujuan */}
                            <div className="flex-1 flex flex-col items-center">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                                isPendingTujuan 
                                  ? 'bg-blue-500 text-white animate-pulse' 
                                  : 'bg-neutral-200 text-neutral-400'
                              }`}>
                                {isPendingTujuan ? '•' : ''}
                              </div>
                              <span className="text-[9px] font-semibold text-neutral-450 mt-1">Penerimaan Tujuan</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-2">
                          {canAct ? (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                disabled={approvingId !== null}
                                onClick={() => handleApproveAction(m.id, 'approve')}
                                className="flex-1 inline-flex justify-center items-center py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow transition-all cursor-pointer disabled:opacity-50"
                              >
                                {approvingId === m.id ? 'Memproses...' : isPendingAsal ? 'Setujui Mutasi' : 'Terima Barang'}
                              </button>
                              <button
                                type="button"
                                disabled={approvingId !== null}
                                onClick={() => handleApproveAction(m.id, 'reject')}
                                className="px-4 py-2 border border-rose-200 hover:bg-rose-50 text-rose-600 font-bold rounded-xl text-xs transition-all cursor-pointer disabled:opacity-50"
                              >
                                Tolak
                              </button>
                            </div>
                          ) : (
                            <div className="text-center p-2.5 bg-neutral-50 dark:bg-neutral-850 rounded-xl text-xxs font-bold text-neutral-450">
                              🔒 Hubungkan role PJ Ruangan / Admin BMN untuk melakukan persetujuan.
                            </div>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MUTATION HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 gap-4">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Riwayat Mutasi & Pemindahan</h3>
                
                {/* Search query input */}
                <div className="relative w-full sm:w-64">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Cari kode barang..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 pl-10 pr-3 py-2 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              {mutations.filter(m => m.status_mutasi !== 'Pending_Asal' && m.status_mutasi !== 'Pending_Tujuan').length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl text-neutral-400">
                  Belum ada riwayat mutasi yang diselesaikan.
                </div>
              ) : (
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="bg-neutral-50 dark:bg-neutral-800/40 text-neutral-400 dark:text-neutral-500 text-xs font-bold uppercase tracking-wider border-b border-neutral-150 dark:border-neutral-850">
                          <th className="px-6 py-4">Kode Barang / NUP</th>
                          <th className="px-6 py-4">Nama Barang</th>
                          <th className="px-6 py-4">Asal &rarr; Tujuan</th>
                          <th className="px-6 py-4">Kategori</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4">Pemeriksa Asal/Tujuan</th>
                          <th className="px-6 py-4 text-center">Foto Bukti</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
                        {mutations
                          .filter(m => m.status_mutasi !== 'Pending_Asal' && m.status_mutasi !== 'Pending_Tujuan')
                          .filter(m => !searchQuery || m.kode_barang.includes(searchQuery))
                          .map(m => (
                            <tr key={m.id} className="hover:bg-neutral-55 hover:bg-neutral-50/50 dark:hover:bg-neutral-850/40 transition-colors">
                              <td className="px-6 py-4">
                                <span className="font-mono font-bold text-indigo-650 dark:text-indigo-400">{m.kode_barang}</span>
                                <div className="text-[10px] text-neutral-400 font-semibold mt-0.5">NUP: {m.no_urut_pendaft}</div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="font-bold text-neutral-800 dark:text-neutral-200">{m.nama_barang}</span>
                                <div className="text-[10px] text-neutral-400 truncate max-w-[150px]">{m.merk_type}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-1.5 font-bold">
                                  <span className="text-neutral-500">{m.ruangan_asal}</span>
                                  <span className="text-neutral-400">&rarr;</span>
                                  <span className="text-indigo-750 dark:text-indigo-400">{m.ruangan_tujuan}</span>
                                </div>
                                <div className="text-[10px] text-neutral-400 italic truncate max-w-[150px] mt-0.5">"{m.alasan}"</div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                                  m.kategori === 'Tinggi' 
                                    ? 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400' 
                                    : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                                }`}>
                                  {m.kategori === 'Tinggi' ? 'BMN/Tinggi' : 'Rendah'}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-2.5 py-1 inline-flex text-[10px] leading-5 font-extrabold rounded-full ${
                                  m.status_mutasi === 'Disetujui' ? 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400 border border-green-200 dark:border-green-900/35' : 
                                  'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900/35'
                                }`}>
                                  {m.status_mutasi === 'Disetujui' ? 'Disetujui (Selesai)' : 'Ditolak'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-neutral-500 font-semibold space-y-0.5">
                                <div>Asal: <span className="text-neutral-800 dark:text-neutral-350">{m.disetujui_asal_oleh || '-'}</span></div>
                                <div>Tujuan: <span className="text-neutral-800 dark:text-neutral-350">{m.disetujui_tujuan_oleh || '-'}</span></div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                {m.foto_bukti ? (
                                  <button
                                    onClick={() => setShowPhotoModal(m.foto_bukti)}
                                    className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 rounded-lg text-[10px] font-extrabold shadow-sm transition-all cursor-pointer"
                                  >
                                    Lihat Foto
                                  </button>
                                ) : (
                                  <span className="text-neutral-400 italic">-</span>
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* QR Code Scan Simulation Modal */}
      {showScanModal && (
        <div className="fixed z-50 inset-0 overflow-y-auto animate-fade-in">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={() => setShowScanModal(false)}>
              <div className="absolute inset-0 bg-gray-900/60"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="relative z-10 inline-block align-middle bg-white dark:bg-neutral-900 rounded-3xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full border border-gray-150 dark:border-neutral-800">
              <div className="bg-white dark:bg-neutral-900 px-6 pt-6 pb-4">
                <div className="flex items-center justify-between border-b pb-3 mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span>
                    Simulasi Kamera Scan QR
                  </h3>
                  <button 
                    type="button" 
                    onClick={() => setShowScanModal(false)}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Camera view mockup box */}
                  <div className="relative bg-black h-48 rounded-2xl flex flex-col items-center justify-center text-white overflow-hidden border border-neutral-800">
                    {/* Corner overlay brackets */}
                    <div className="absolute top-4 left-4 w-6 h-6 border-t-4 border-l-4 border-indigo-500"></div>
                    <div className="absolute top-4 right-4 w-6 h-6 border-t-4 border-r-4 border-indigo-500"></div>
                    <div className="absolute bottom-4 left-4 w-6 h-6 border-b-4 border-l-4 border-indigo-500"></div>
                    <div className="absolute bottom-4 right-4 w-6 h-6 border-b-4 border-r-4 border-indigo-500"></div>
                    
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-red-650 px-2 py-0.5 bg-red-600 rounded text-[9px] font-black uppercase tracking-wider animate-pulse">
                      REC
                    </div>

                    <svg className="w-12 h-12 text-indigo-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                    </svg>

                    <p className="text-xxs text-neutral-450 mt-3 font-semibold">Arahkan kamera ke kode QR label barang...</p>
                  </div>

                  {/* Filter Search */}
                  <div>
                    <input
                      type="text"
                      placeholder="Cari barang untuk di-scan..."
                      value={scanFilterQuery}
                      onChange={(e) => setScanFilterQuery(e.target.value)}
                      className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-250 dark:border-neutral-700 px-3 py-2 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none text-neutral-900 dark:text-white"
                    />
                  </div>

                  {/* Scanned List simulation */}
                  <div className="max-h-48 overflow-y-auto space-y-2 border border-neutral-150 p-2 rounded-2xl bg-neutral-50/50">
                    {scannedBarangList.length === 0 ? (
                      <p className="text-xxs text-neutral-400 text-center py-4">Barang tidak ditemukan.</p>
                    ) : (
                      scannedBarangList.map(b => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => {
                            setSelectedBarangId(String(b.id));
                            setShowScanModal(false);
                            setScanFilterQuery('');
                            // Dynamic category feedback
                            alert(`✓ QR Code Pindai Sukses!\nBarang: ${b.nama_barang}\nKategori: ${b.kategori === 'Tinggi' ? 'BMN/Tinggi (Membutuhkan Approval)' : 'Rendah (Pindah Langsung)'}`);
                          }}
                          className="w-full text-left p-2.5 bg-white hover:bg-indigo-50 border border-neutral-200 hover:border-indigo-300 rounded-xl text-xxs flex justify-between items-center transition-all cursor-pointer shadow-sm hover:scale-[1.01]"
                        >
                          <div className="min-w-0">
                            <span className="font-mono text-indigo-700 font-bold block">{b.kode_barang}</span>
                            <span className="font-bold text-neutral-850 truncate block mt-0.5">{b.nama_barang}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black border ${
                            b.kategori === 'Tinggi' 
                              ? 'bg-violet-50 text-violet-700 border-violet-150' 
                              : 'bg-emerald-50 text-emerald-700 border-emerald-150'
                          }`}>
                            {b.kategori === 'Tinggi' ? 'Tinggi' : 'Rendah'}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4 flex justify-end rounded-b-3xl border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => { setShowScanModal(false); setScanFilterQuery(''); }}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image viewer Modal */}
      {showPhotoModal && (
        <div className="fixed z-55 inset-0 overflow-y-auto animate-fade-in flex items-center justify-center">
          <div className="fixed inset-0 transition-opacity" onClick={() => setShowPhotoModal(null)}>
            <div className="absolute inset-0 bg-gray-950/80"></div>
          </div>
          
          <div className="relative z-10 bg-white p-4 rounded-3xl max-w-lg mx-4 border border-neutral-100 shadow-2xl flex flex-col items-center">
            <button
              onClick={() => setShowPhotoModal(null)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-750 bg-gray-50 p-2 rounded-full shadow-sm hover:bg-gray-100 cursor-pointer"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="max-h-[70vh] overflow-hidden rounded-2xl shadow-inner mt-4 border border-neutral-100">
              <img src={showPhotoModal} alt="Kondisi Fisik" className="object-contain max-w-full max-h-[70vh]" />
            </div>
            <p className="text-xs text-neutral-450 mt-3 font-semibold">Bukti Foto Kondisi Fisik Mutasi Barang</p>
          </div>
        </div>
      )}

    </div>
  );
}
