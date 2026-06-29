"use client";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
const MySwal = withReactContent(Swal);


import React, { useState, useEffect, useRef } from "react";
import TableSkeleton from '@/components/TableSkeleton';

export default function MutasiPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>("");
  const [mutasiData, setMutasiData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [rooms, setRooms] = useState<string[]>([]);

  // Form State untuk Pengajuan Baru
  const [part1, setPart1] = useState('');
  const [part2, setPart2] = useState('');
  const [part3, setPart3] = useState('');
  const [part4, setPart4] = useState('');
  const [part5, setPart5] = useState('');
  const [nup, setNup] = useState('');
  const [foundItem, setFoundItem] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [ruanganTujuan, setRuanganTujuan] = useState("");
  const [alasanMutasi, setAlasanMutasi] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State untuk Validasi Admin
  const [validateModal, setValidateModal] = useState<any>(null);
  const [catatanValidasi, setCatatanValidasi] = useState("");

  // State untuk Scanner Modal
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const html5QrCodeRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("simulated_user");
      if (saved) {
        const user = JSON.parse(saved);
        setCurrentUser(user);
        if (user.role === "Admin Fakultas") {
          setActiveTab("antrean");
        } else {
          setActiveTab("ajukan");
        }
      }
    }
    
    // Fetch valid rooms for the dropdown
    fetch("/api/ruangan")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setRooms(data.data.map((r: any) => r.room));
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (currentUser && activeTab === "antrean") {
      fetchMutasiData();
    }
  }, [activeTab, currentUser]);

  const fetchMutasiData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/mutasi?role=${currentUser.role}&email=${encodeURIComponent(currentUser.email)}`);
      const data = await res.json();
      if (data.success) {
        setMutasiData(data.data);
      }
    } catch (error) {
      console.error("Gagal mengambil data mutasi", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void,
    maxLength: number,
    nextId: string | null
  ) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val.length <= maxLength) {
      setter(val);
      if (val.length === maxLength && nextId) {
        document.getElementById(nextId)?.focus();
      }
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    prevId: string | null
  ) => {
    if (e.key === 'Backspace' && e.currentTarget.value === '' && prevId) {
      document.getElementById(prevId)?.focus();
    }
  };

  const handleSearchBarang = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const kodeBarang = `${part1}.${part2}.${part3}.${part4}.${part5}_${nup}`;
    if (!part1 || !part2 || !part3 || !part4 || !part5 || !nup) { await MySwal.fire({ title: 'Notifikasi Sistem', text: String("Lengkapi format Kode Barang BMN dan NUP terlebih dahulu."), icon: 'info', confirmButtonColor: '#4f46e5', background: '#1a1a1a', color: '#ffffff' }); return; }

    setIsSearching(true);
    try {
      const res = await fetch(`/api/barangs/lookup?kode=${encodeURIComponent(kodeBarang)}`);
      const data = await res.json();
      if (data.success) {
        setFoundItem(data.data);
      } else {
        MySwal.fire({ title: 'Notifikasi Sistem', text: String(data.error || "Barang tidak ditemukan."), icon: 'info', confirmButtonColor: '#4f46e5', background: '#1a1a1a', color: '#ffffff' });
        setFoundItem(null);
      }
    } catch (error) {
      MySwal.fire({ title: 'Notifikasi Sistem', text: String("Terjadi kesalahan sistem saat mencari barang."), icon: 'info', confirmButtonColor: '#4f46e5', background: '#1a1a1a', color: '#ffffff' });
    } finally {
      setIsSearching(false);
    }
  };

  const startCameraScanner = async () => {
    setIsScannerOpen(true);
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      setTimeout(async () => {
        const container = document.getElementById('mutasi-qr-reader');
        if (!container) return;
        
        const html5QrCode = new Html5Qrcode('mutasi-qr-reader');
        html5QrCodeRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          async (decodedText) => {
            handleQrScanInput(decodedText);
          },
          () => {}
        );
      }, 300);
    } catch (err: any) {
      console.error("Camera access failed:", err);
      MySwal.fire({ title: 'Notifikasi Sistem', text: String('Gagal membuka kamera: ' + err.message), icon: 'info', confirmButtonColor: '#4f46e5', background: '#1a1a1a', color: '#ffffff' });
      closeScanner();
    }
  };

  const closeScanner = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
      } catch (err) {
        console.error(err);
      }
    }
    html5QrCodeRef.current = null;
    setIsScannerOpen(false);
  };

  const handleQrScanInput = async (scannedText: string) => {
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
      MySwal.fire({ title: 'Notifikasi Sistem', text: String('Format QR tidak valid.'), icon: 'info', confirmButtonColor: '#4f46e5', background: '#1a1a1a', color: '#ffffff' });
      return;
    }

    await closeScanner();

    const kodes = kode_barang.split('.');
    if (kodes.length >= 5) {
      setPart1(kodes[0]);
      setPart2(kodes[1]);
      setPart3(kodes[2]);
      setPart4(kodes[3]);
      setPart5(kodes[4]);
      setNup(no_urut_pendaft);
    }
    
    const lookupCode = `${kode_barang}_${no_urut_pendaft}`;
    setIsSearching(true);
    try {
      const res = await fetch(`/api/barangs/lookup?kode=${encodeURIComponent(lookupCode)}`);
      const data = await res.json();
      if (data.success) {
        setFoundItem(data.data);
      } else {
        MySwal.fire({ title: 'Notifikasi Sistem', text: String(data.error || "Barang tidak ditemukan di database."), icon: 'info', confirmButtonColor: '#4f46e5', background: '#1a1a1a', color: '#ffffff' });
        setFoundItem(null);
      }
    } catch (error) {
      MySwal.fire({ title: 'Notifikasi Sistem', text: String("Terjadi kesalahan sistem saat mencari barang."), icon: 'info', confirmButtonColor: '#4f46e5', background: '#1a1a1a', color: '#ffffff' });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmitPengajuan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foundItem) { await MySwal.fire({ title: 'Notifikasi Sistem', text: String("Cari dan pilih barang terlebih dahulu."), icon: 'info', confirmButtonColor: '#4f46e5', background: '#1a1a1a', color: '#ffffff' }); return; }
    if (!rooms.includes(ruanganTujuan)) {
      await MySwal.fire({ title: 'Notifikasi Sistem', text: String("Ruangan tujuan tidak valid. Silakan ketik dan pilih ruangan yang tersedia dari daftar dropdown."), icon: 'info', confirmButtonColor: '#4f46e5', background: '#1a1a1a', color: '#ffffff' }); return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/mutasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_barang: foundItem.id,
          id_user_pengaju: currentUser.email,
          id_ruangan_tujuan: ruanganTujuan,
          alasan_mutasi: alasanMutasi
        })
      });
      const data = await res.json();
      if (data.success) {
        MySwal.fire({ title: 'Notifikasi Sistem', text: String("Pengajuan mutasi berhasil dikirim!"), icon: 'info', confirmButtonColor: '#4f46e5', background: '#1a1a1a', color: '#ffffff' });
        setPart1("");
        setPart2("");
        setPart3("");
        setPart4("");
        setPart5("");
        setNup("");
        setFoundItem(null);
        setRuanganTujuan("");
        setAlasanMutasi("");
        setActiveTab("antrean");
      } else {
        MySwal.fire({ title: 'Notifikasi Sistem', text: String(data.error || "Gagal mengajukan mutasi."), icon: 'info', confirmButtonColor: '#4f46e5', background: '#1a1a1a', color: '#ffffff' });
      }
    } catch (error) {
      MySwal.fire({ title: 'Notifikasi Sistem', text: String("Terjadi kesalahan sistem."), icon: 'info', confirmButtonColor: '#4f46e5', background: '#1a1a1a', color: '#ffffff' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleValidasi = async (status: string) => {
    try {
      const res = await fetch("/api/mutasi", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_mutasi: validateModal.id_mutasi,
          status_mutasi: status,
          catatan_validasi: catatanValidasi
        })
      });
      const data = await res.json();
      if (data.success) {
        MySwal.fire({ title: 'Notifikasi Sistem', text: String(`Mutasi berhasil ${status.toLowerCase()}!`), icon: 'info', confirmButtonColor: '#4f46e5', background: '#1a1a1a', color: '#ffffff' });
        setValidateModal(null);
        setCatatanValidasi("");
        fetchMutasiData();
      } else {
        MySwal.fire({ title: 'Notifikasi Sistem', text: String(data.error || "Gagal memvalidasi."), icon: 'info', confirmButtonColor: '#4f46e5', background: '#1a1a1a', color: '#ffffff' });
      }
    } catch (error) {
      MySwal.fire({ title: 'Notifikasi Sistem', text: String("Terjadi kesalahan sistem."), icon: 'info', confirmButtonColor: '#4f46e5', background: '#1a1a1a', color: '#ffffff' });
    }
  };

  if (!currentUser) return null;

  const isAdmin = currentUser.role === "Admin Fakultas";

  const antreanData = mutasiData.filter(m => m.status_mutasi === "Menunggu");

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div className="relative overflow-hidden bg-[var(--bg-banner)] p-8 rounded-3xl text-white shadow-xl transition-colors duration-400">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--bg-panel)] transition-colors duration-400/20 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
            Mutasi BMN
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Sistem Mutasi Barang
          </h1>
          <p className="text-white/80 max-w-2xl text-sm sm:text-base">
            Kelola perpindahan barang antar ruangan. Semua pemindahan tercatat rapi dan membutuhkan persetujuan Admin Fakultas.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[var(--border-panel)]">
        <nav className="flex space-x-8 overflow-x-auto" aria-label="Tabs">
          {!isAdmin && (
            <button
              onClick={() => setActiveTab("ajukan")}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap cursor-pointer transition-all ${
                activeTab === "ajukan"
                  ? "border-emerald-600 text-[var(--tag-success-text)] transition-colors duration-400"
                  : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]"
              }`}
            >
              Ajukan Mutasi Baru
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => setActiveTab("antrean")}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap cursor-pointer transition-all flex items-center gap-2 ${
                activeTab === "antrean"
                  ? "border-emerald-600 text-[var(--tag-success-text)] transition-colors duration-400"
                  : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]"
              }`}
            >
              Antrean Persetujuan
              {antreanData.length > 0 && (
                <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {antreanData.length}
                </span>
              )}
            </button>
          )}
        </nav>
      </div>

      {/* TAB CONTENT: AJUKAN BARU */}
      {activeTab === "ajukan" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-[var(--bg-panel)] transition-colors duration-400 rounded-3xl p-6 border border-[var(--border-panel)] shadow-sm">
            <h3 className="text-lg font-bold text-[var(--text-main)] mb-4">1. Cari Barang</h3>
            <form onSubmit={handleSearchBarang} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[var(--text-main)] mb-2">
                  Kode Barang & NUP
                </label>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center space-x-1.5 sm:space-x-2">
                    <input
                      id="mutasi_part1"
                      type="text"
                      value={part1}
                      onChange={(e) => handleInputChange(e, setPart1, 1, 'mutasi_part2')}
                      onKeyDown={(e) => handleKeyDown(e, null)}
                      maxLength={1}
                      inputMode="numeric"
                      className="w-12 text-center text-sm font-mono font-bold bg-[var(--bg-app)] transition-colors duration-400 border border-[var(--border-panel)] rounded-xl py-3 text-[var(--text-main)] focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="X"
                      required
                    />
                    <span className="text-[var(--text-muted)] font-bold select-none">.</span>
                    <input
                      id="mutasi_part2"
                      type="text"
                      value={part2}
                      onChange={(e) => handleInputChange(e, setPart2, 2, 'mutasi_part3')}
                      onKeyDown={(e) => handleKeyDown(e, 'mutasi_part1')}
                      maxLength={2}
                      inputMode="numeric"
                      className="w-14 text-center text-sm font-mono font-bold bg-[var(--bg-app)] transition-colors duration-400 border border-[var(--border-panel)] rounded-xl py-3 text-[var(--text-main)] focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="XX"
                      required
                    />
                    <span className="text-[var(--text-muted)] font-bold select-none">.</span>
                    <input
                      id="mutasi_part3"
                      type="text"
                      value={part3}
                      onChange={(e) => handleInputChange(e, setPart3, 2, 'mutasi_part4')}
                      onKeyDown={(e) => handleKeyDown(e, 'mutasi_part2')}
                      maxLength={2}
                      inputMode="numeric"
                      className="w-14 text-center text-sm font-mono font-bold bg-[var(--bg-app)] transition-colors duration-400 border border-[var(--border-panel)] rounded-xl py-3 text-[var(--text-main)] focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="XX"
                      required
                    />
                    <span className="text-[var(--text-muted)] font-bold select-none">.</span>
                    <input
                      id="mutasi_part4"
                      type="text"
                      value={part4}
                      onChange={(e) => handleInputChange(e, setPart4, 2, 'mutasi_part5')}
                      onKeyDown={(e) => handleKeyDown(e, 'mutasi_part3')}
                      maxLength={2}
                      inputMode="numeric"
                      className="w-14 text-center text-sm font-mono font-bold bg-[var(--bg-app)] transition-colors duration-400 border border-[var(--border-panel)] rounded-xl py-3 text-[var(--text-main)] focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="XX"
                      required
                    />
                    <span className="text-[var(--text-muted)] font-bold select-none">.</span>
                    <input
                      id="mutasi_part5"
                      type="text"
                      value={part5}
                      onChange={(e) => handleInputChange(e, setPart5, 3, 'mutasi_nup')}
                      onKeyDown={(e) => handleKeyDown(e, 'mutasi_part4')}
                      maxLength={3}
                      inputMode="numeric"
                      className="w-16 text-center text-sm font-mono font-bold bg-[var(--bg-app)] transition-colors duration-400 border border-[var(--border-panel)] rounded-xl py-3 text-[var(--text-main)] focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="XXX"
                      required
                    />
                  </div>
                  <div className="flex gap-3">
                    <div className="relative w-1/2">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-[var(--text-muted)] font-semibold text-sm">NUP:</span>
                      </div>
                      <input
                        id="mutasi_nup"
                        type="number"
                        value={nup}
                        onChange={(e) => setNup(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, 'mutasi_part5')}
                        min="1"
                        className="w-full pl-12 pr-4 text-sm font-mono font-bold bg-[var(--bg-app)] transition-colors duration-400 border border-[var(--border-panel)] rounded-xl py-3 text-[var(--text-main)] focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        placeholder="NUP Barang"
                        required
                      />
                    </div>
                    <button
                      type="button"
                      onClick={startCameraScanner}
                      className="w-1/2 px-4 py-3 bg-[var(--bg-panel)] transition-colors duration-400 hover:bg-[var(--bg-app)] text-[var(--text-main)] rounded-xl flex items-center justify-center gap-2 border border-emerald-300 hover:border-emerald-500 shadow-sm"
                      title="Buka Kamera untuk Scan QR"
                    >
                      <svg className="w-5 h-5 text-[var(--tag-success-text)] transition-colors duration-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-4v-4m-2 4h-2m-2-4h-2m8 0h2m-2 2h2m-4-6h4M6 6h4v4H6V6zm10 0h4v4h-4V6zM6 16h4v4H6v-4z" />
                      </svg>
                      <span className="font-bold text-sm">Scan QR Code</span>
                    </button>
                  </div>
                </div>
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-sm font-bold transition-colors"
              >
                {isSearching ? "Mencari..." : "Cari Barang"}
              </button>
            </form>

            {foundItem && (
              <div className="mt-6 p-4 border border-emerald-200 bg-emerald-50 rounded-2xl animate-fade-in">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0 text-[var(--tag-success-text)] transition-colors duration-400">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-[var(--text-main)]">{foundItem.nama_barang}</h4>
                    <p className="text-sm text-[var(--text-muted)] mt-1">{foundItem.merk_type}</p>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-[var(--bg-panel)] transition-colors duration-400 rounded-lg border border-emerald-200 text-xs font-semibold text-emerald-700">
                      Lokasi Saat Ini: {foundItem.lokasi_ruangan}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className={`bg-[var(--bg-panel)] transition-colors duration-400 rounded-3xl p-6 border border-[var(--border-panel)] shadow-sm transition-opacity duration-300 ${!foundItem ? 'opacity-50 pointer-events-none' : ''}`}>
            <h3 className="text-lg font-bold text-[var(--text-main)] mb-4">2. Detail Mutasi</h3>
            <form onSubmit={handleSubmitPengajuan} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-[var(--text-main)] mb-2">
                  Ruangan Tujuan Mutasi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  list="ruanganList"
                  value={ruanganTujuan}
                  onChange={(e) => setRuanganTujuan(e.target.value)}
                  placeholder="Ketik untuk mencari ruangan... (Contoh: LAB-RPL-101)"
                  className="w-full bg-[var(--bg-app)] transition-colors duration-400 border border-[var(--border-panel)] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
                <datalist id="ruanganList">
                  {rooms.map((room, idx) => (
                    <option key={idx} value={room} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[var(--text-main)] mb-2">
                  Alasan Mutasi <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={alasanMutasi}
                  onChange={(e) => setAlasanMutasi(e.target.value)}
                  rows={4}
                  placeholder="Jelaskan alasan pemindahan barang secara detail..."
                  className="w-full bg-[var(--bg-app)] transition-colors duration-400 border border-[var(--border-panel)] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md transition-colors"
              >
                {isSubmitting ? "Mengirim Pengajuan..." : "Ajukan Mutasi Sekarang"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB CONTENT: ANTREAN PERSETUJUAN */}
      {activeTab === "antrean" && (
        <div className="bg-[var(--bg-panel)] transition-colors duration-400 border border-[var(--border-panel)] rounded-2xl shadow-sm overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-[var(--bg-app)] transition-colors duration-400">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    Data Barang
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    Detail Mutasi
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    Pengaju
                  </th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[var(--bg-panel)] transition-colors duration-400 divide-y divide-neutral-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8">
                      <TableSkeleton />
                    </td>
                  </tr>
                ) : antreanData.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-[var(--text-muted)] text-sm">Tidak ada antrean mutasi yang menunggu persetujuan.</td>
                  </tr>
                ) : (
                  antreanData.map((m) => (
                    <tr key={m.id_mutasi} className="hover:bg-[var(--bg-app)] transition-colors duration-400">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-[var(--text-main)]">{m.nama_barang}</p>
                        <p className="text-xs text-[var(--text-muted)] font-mono mt-1">{m.kode_barang}_{m.no_urut_pendaft}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-semibold text-[var(--tag-danger-text)] transition-colors duration-400 bg-rose-50 px-2 py-0.5 rounded">{m.ruangan_asal}</span>
                          <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                          <span className="font-semibold text-[var(--tag-success-text)] transition-colors duration-400 bg-emerald-50 px-2 py-0.5 rounded">{m.id_ruangan_tujuan}</span>
                        </div>
                        <p className="text-xs text-[var(--text-muted)] mt-2 italic">"{m.alasan_mutasi}"</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-[var(--text-main)]">{m.id_user_pengaju}</p>
                        <p className="text-xs text-[var(--text-muted)]">{new Date(m.tanggal_mutasi).toLocaleDateString('id-ID')}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setValidateModal(m)}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm"
                        >
                          Validasi
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Validasi Admin */}
      {validateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[var(--bg-panel)] transition-colors duration-400 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative">
            <div className="p-6 border-b border-[var(--border-panel)] bg-[var(--bg-app)] transition-colors duration-400">
              <h3 className="text-lg font-black text-[var(--text-main)] tracking-tight">Validasi Mutasi Barang</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-[var(--bg-app)] transition-colors duration-400 p-4 rounded-xl border border-[var(--border-panel)]">
                <p className="text-sm font-bold text-[var(--text-main)]">{validateModal.nama_barang}</p>
                <div className="mt-2 flex items-center gap-2 text-sm text-[var(--text-main)]">
                  Dari: <strong>{validateModal.ruangan_asal}</strong>
                  <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                  Ke: <strong>{validateModal.id_ruangan_tujuan}</strong>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--text-main)] mb-2">
                  Catatan Tambahan (Opsional)
                </label>
                <textarea
                  value={catatanValidasi}
                  onChange={(e) => setCatatanValidasi(e.target.value)}
                  rows={3}
                  placeholder="Tambahkan pesan, alasan penolakan, atau catatan persetujuan..."
                  className="w-full bg-[var(--bg-app)] transition-colors duration-400 border border-[var(--border-panel)] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                ></textarea>
              </div>
            </div>

            <div className="p-6 border-t border-[var(--border-panel)] flex flex-col sm:flex-row gap-3 justify-end bg-[var(--bg-app)] transition-colors duration-400">
              <button 
                onClick={() => setValidateModal(null)}
                className="px-6 py-2.5 bg-[var(--bg-panel)] transition-colors duration-400 border border-[var(--border-panel)] hover:bg-[var(--bg-app)] transition-colors duration-400 text-[var(--text-main)] text-sm font-bold rounded-xl transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={() => handleValidasi('Ditolak')}
                className="px-6 py-2.5 bg-rose-100 hover:bg-rose-200 text-rose-700 text-sm font-bold rounded-xl transition-colors"
              >
                Tolak Mutasi
              </button>
              <button 
                onClick={() => handleValidasi('Disetujui')}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
              >
                Setujui Mutasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Scanner QR Code */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-black/95 animate-fade-in backdrop-blur-md">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 text-white border-b border-white/10 relative z-10">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-4v-4m-2 4h-2m-2-4h-2m8 0h2m-2 2h2m-4-6h4M6 6h4v4H6V6zm10 0h4v4h-4V6zM6 16h4v4H6v-4z" />
              </svg>
              Scan QR Code BMN
            </h3>
            <button onClick={closeScanner} className="p-2 bg-[var(--bg-panel)] transition-colors duration-400/10 hover:bg-[var(--bg-panel)] transition-colors duration-400/20 rounded-full transition-colors cursor-pointer">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Kamera Area */}
          <div className="flex-1 relative flex items-center justify-center overflow-hidden">
            {/* Animasi Kamera */}
            <div className="relative w-full h-full sm:w-96 sm:h-96 z-10 flex items-center justify-center">
              
              <div id="mutasi-qr-reader" className="w-full max-w-sm rounded-xl overflow-hidden shadow-2xl"></div>

            </div>

            {/* Dark overlay around the scan area */}
            <div className="absolute inset-0 bg-black/40"></div>
          </div>

          <div className="p-8 text-center bg-gradient-to-t from-black to-transparent relative z-10">
            <p className="text-white/80 font-medium">
              Arahkan kamera ke QR Code yang tertempel pada Barang Milik Negara (BMN).
            </p>
          </div>

          {/* Add custom keyframes for the scanner line */}
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes scan {
              0% { top: 0%; opacity: 0; }
              10% { opacity: 1; }
              90% { opacity: 1; }
              100% { top: 100%; opacity: 0; }
            }
          `}} />
        </div>
      )}
    </div>
  );
}
