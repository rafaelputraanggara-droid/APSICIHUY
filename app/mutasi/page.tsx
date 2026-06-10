"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";

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
  const [scanStream, setScanStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("simulated_user");
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
    if (currentUser && (activeTab === "antrean" || activeTab === "riwayat")) {
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
    if (!part1 || !part2 || !part3 || !part4 || !part5 || !nup) return alert("Lengkapi format Kode Barang BMN dan NUP terlebih dahulu.");

    setIsSearching(true);
    try {
      const res = await fetch(`/api/barangs/lookup?kode=${encodeURIComponent(kodeBarang)}`);
      const data = await res.json();
      if (data.success) {
        setFoundItem(data.data);
      } else {
        alert(data.error || "Barang tidak ditemukan.");
        setFoundItem(null);
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem saat mencari barang.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSimulateScan = async () => {
    setIsScannerOpen(true);
    
    // Try to open the actual camera for realism
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      setScanStream(stream);
      // Bind stream to video element in the modal (handled in the modal component)
    } catch (e) {
      console.warn("Camera access not available, proceeding with simulated view");
    }

    // Simulate scanning time
    setTimeout(() => {
      // Stop the camera stream
      if (scanStream) {
        scanStream.getTracks().forEach(track => track.stop());
        setScanStream(null);
      }
      setIsScannerOpen(false);
      
      setPart1("3");
      setPart2("10");
      setPart3("01");
      setPart4("02");
      setPart5("001");
      setNup("1");
      const simulatedCode = "3.10.01.02.001_1";
      setTimeout(() => {
        // Auto trigger search
        fetch(`/api/barangs/lookup?kode=${encodeURIComponent(simulatedCode)}`)
          .then(res => res.json())
          .then(data => {
            if (data.success) setFoundItem(data.data);
            else alert("Barang simulasi tidak ditemukan di database. Pastikan barang ini sudah diinput di Master Barang.");
          });
      }, 300);
    }, 2500); // 2.5 seconds to "scan"
  };

  const closeScanner = () => {
    if (scanStream) {
      scanStream.getTracks().forEach(track => track.stop());
      setScanStream(null);
    }
    setIsScannerOpen(false);
  };

  const handleSubmitPengajuan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foundItem) return alert("Cari dan pilih barang terlebih dahulu.");
    if (!rooms.includes(ruanganTujuan)) {
      return alert("Ruangan tujuan tidak valid. Silakan ketik dan pilih ruangan yang tersedia dari daftar dropdown.");
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
        alert("Pengajuan mutasi berhasil dikirim!");
        setPart1("");
        setPart2("");
        setPart3("");
        setPart4("");
        setPart5("");
        setNup("");
        setFoundItem(null);
        setRuanganTujuan("");
        setAlasanMutasi("");
        setActiveTab("riwayat");
      } else {
        alert(data.error || "Gagal mengajukan mutasi.");
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem.");
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
        alert(`Mutasi berhasil ${status.toLowerCase()}!`);
        setValidateModal(null);
        setCatatanValidasi("");
        fetchMutasiData();
      } else {
        alert(data.error || "Gagal memvalidasi.");
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem.");
    }
  };

  if (!currentUser) return null;

  const isAdmin = currentUser.role === "Admin Fakultas";

  const antreanData = mutasiData.filter(m => m.status_mutasi === "Menunggu");
  const riwayatData = mutasiData.filter(m => m.status_mutasi !== "Menunggu");

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
          <p className="text-emerald-100 max-w-2xl text-sm sm:text-base">
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
                  ? "border-emerald-600 text-emerald-600"
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
                  ? "border-emerald-600 text-emerald-600"
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
          <button
            onClick={() => setActiveTab("riwayat")}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap cursor-pointer transition-all ${
              activeTab === "riwayat"
                ? "border-emerald-600 text-emerald-600"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]"
            }`}
          >
            Riwayat Mutasi
          </button>
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
                      className="w-12 text-center text-sm font-mono font-bold bg-[var(--bg-app)] transition-colors duration-400 border border-[var(--border-panel)] rounded-xl py-3 text-neutral-950 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
                      className="w-14 text-center text-sm font-mono font-bold bg-[var(--bg-app)] transition-colors duration-400 border border-[var(--border-panel)] rounded-xl py-3 text-neutral-950 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
                      className="w-14 text-center text-sm font-mono font-bold bg-[var(--bg-app)] transition-colors duration-400 border border-[var(--border-panel)] rounded-xl py-3 text-neutral-950 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
                      className="w-14 text-center text-sm font-mono font-bold bg-[var(--bg-app)] transition-colors duration-400 border border-[var(--border-panel)] rounded-xl py-3 text-neutral-950 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
                      className="w-16 text-center text-sm font-mono font-bold bg-[var(--bg-app)] transition-colors duration-400 border border-[var(--border-panel)] rounded-xl py-3 text-neutral-950 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
                        className="w-full pl-12 pr-4 text-sm font-mono font-bold bg-[var(--bg-app)] transition-colors duration-400 border border-[var(--border-panel)] rounded-xl py-3 text-neutral-950 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        placeholder="NUP Barang"
                        required
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSimulateScan}
                      className="w-1/2 px-4 py-3 bg-[var(--bg-panel)] transition-colors duration-400 hover:bg-[var(--bg-app)] transition-colors duration-400 text-neutral-800 rounded-xl flex items-center justify-center gap-2 transition-colors border border-emerald-300 hover:border-emerald-500 shadow-sm"
                      title="Buka Kamera untuk Scan QR"
                    >
                      <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0 text-emerald-600">
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
                    <td colSpan={4} className="px-6 py-12 text-center text-[var(--text-muted)] text-sm">Memuat data...</td>
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
                          <span className="font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">{m.ruangan_asal}</span>
                          <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                          <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{m.id_ruangan_tujuan}</span>
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

      {/* TAB CONTENT: RIWAYAT MUTASI */}
      {activeTab === "riwayat" && (
        <div className="bg-[var(--bg-panel)] transition-colors duration-400 border border-[var(--border-panel)] rounded-2xl shadow-sm overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-[var(--bg-app)] transition-colors duration-400">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    Data Barang
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    Pergerakan
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    Pengaju
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    Status Validasi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[var(--bg-panel)] transition-colors duration-400 divide-y divide-neutral-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-[var(--text-muted)] text-sm">Memuat data...</td>
                  </tr>
                ) : riwayatData.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-[var(--text-muted)] text-sm">Belum ada riwayat mutasi.</td>
                  </tr>
                ) : (
                  riwayatData.map((m) => (
                    <tr key={m.id_mutasi} className="hover:bg-[var(--bg-app)] transition-colors duration-400">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-[var(--text-main)]">{m.nama_barang}</p>
                        <p className="text-xs text-[var(--text-muted)] font-mono mt-1">{m.kode_barang}_{m.no_urut_pendaft}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-semibold text-[var(--text-muted)]">{m.ruangan_asal}</span>
                          <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                          <span className="font-semibold text-[var(--text-main)]">{m.id_ruangan_tujuan}</span>
                        </div>
                        <p className="text-xs text-[var(--text-muted)] mt-1">Diajukan: {new Date(m.tanggal_mutasi).toLocaleDateString('id-ID')}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-[var(--text-main)]">{m.id_user_pengaju}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-start gap-1">
                          <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                            m.status_mutasi === 'Disetujui' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {m.status_mutasi}
                          </span>
                          {m.catatan_validasi && (
                            <p className="text-xs text-[var(--text-muted)] italic mt-1 max-w-[200px] truncate">
                              "{m.catatan_validasi}"
                            </p>
                          )}
                        </div>
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
            <div className="relative w-72 h-72 sm:w-96 sm:h-96 z-10">
              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-emerald-500 rounded-tl-xl"></div>
              <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-emerald-500 rounded-tr-xl"></div>
              <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-emerald-500 rounded-bl-xl"></div>
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-emerald-500 rounded-br-xl"></div>
              
              {/* Scanning laser animation */}
              <div className="absolute inset-x-0 top-0 h-1 bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,1)] animate-[scan_2s_ease-in-out_infinite] z-20"></div>

              {/* Fake Video Stream (If real camera isn't available, we show a mock view) */}
              {scanStream ? (
                <video
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover rounded-xl opacity-80"
                  ref={(video) => {
                    if (video && !video.srcObject) video.srcObject = scanStream;
                  }}
                ></video>
              ) : (
                <div className="w-full h-full bg-neutral-900 rounded-xl flex flex-col items-center justify-center border border-white/5 opacity-80">
                  <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                  <p className="text-white/50 text-sm font-semibold tracking-wide">Membuka Kamera...</p>
                </div>
              )}
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
