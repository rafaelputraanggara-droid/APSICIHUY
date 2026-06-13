"use client";

import React, { useState, useEffect, useRef } from "react";

export default function MaintenancePage() {
  const [activeTab, setActiveTab] = useState("daftar");
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // States for 'konfirmasi' tab modal
  const [showModal, setShowModal] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [namaTeknisi, setNamaTeknisi] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchReports();
  }, [activeTab]);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const status = activeTab === "daftar" ? "Diterima" : "Sedang Diperbaiki";
      const res = await fetch(`/api/maintenance?status=${encodeURIComponent(status)}`);
      const data = await res.json();
      if (data.success) {
        setReports(data.data);
      }
    } catch (error) {
      console.error("Gagal mengambil data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMulaiPerbaiki = async (id: number) => {
    try {
      const res = await fetch("/api/maintenance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "Sedang Diperbaiki" }),
      });
      const data = await res.json();
      if (data.success) {
        fetchReports();
      } else {
        alert(data.error || "Gagal memperbarui status.");
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem.");
    }
  };

  const handleOpenModal = (id: number) => {
    setSelectedReportId(id);
    setNamaTeknisi("");
    setPdfFile(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedReportId(null);
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmitKonfirmasi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReportId || !namaTeknisi || !pdfFile) {
      alert("Harap lengkapi semua data dan unggah file PDF.");
      return;
    }

    if (pdfFile.type !== "application/pdf") {
      alert("Hanya file berformat PDF yang diperbolehkan.");
      return;
    }

    if (pdfFile.size > 2 * 1024 * 1024) {
      alert("Ukuran file PDF tidak boleh lebih dari 2MB.");
      return;
    }

    setIsSubmitting(true);
    try {
      const base64Pdf = await convertToBase64(pdfFile);

      const res = await fetch("/api/maintenance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedReportId,
          status: "Selesai",
          nama_teknisi: namaTeknisi,
          bukti_penyelesaian_pdf: base64Pdf,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        fetchReports();
      } else {
        alert(data.error || "Gagal memperbarui status.");
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem saat menyimpan penyelesaian.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-fade-in relative">
      <div className="relative overflow-hidden bg-[var(--bg-banner)] p-8 rounded-3xl text-white shadow-xl transition-colors duration-400">
        <div className="relative z-10 space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Maintenance Barang
          </h1>
          <p className="text-white/80 max-w-2xl text-sm sm:text-base font-medium">
            Kelola perbaikan barang dari laporan kerusakan yang telah disetujui, dan konfirmasi penyelesaian.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[var(--border-panel)] flex gap-8">
        <button
          onClick={() => setActiveTab("daftar")}
          className={`pb-4 text-sm font-bold transition-colors ${
            activeTab === "daftar"
              ? "border-b-2 border-indigo-600 text-indigo-600"
              : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
          }`}
        >
          Daftar Barang Rusak
        </button>
        <button
          onClick={() => setActiveTab("konfirmasi")}
          className={`pb-4 text-sm font-bold transition-colors ${
            activeTab === "konfirmasi"
              ? "border-b-2 border-emerald-600 text-emerald-600"
              : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
          }`}
        >
          Konfirmasi Penyelesaian
        </button>
      </div>

      <div className="bg-[var(--bg-panel)] border border-[var(--border-panel)] rounded-2xl shadow-sm overflow-hidden p-6 transition-colors duration-400">
        {isLoading ? (
          <p className="text-center py-8 text-[var(--text-muted)]">Memuat data...</p>
        ) : reports.length === 0 ? (
          <p className="text-center py-8 text-[var(--text-muted)]">
            {activeTab === "daftar" 
              ? "Belum ada barang rusak yang harus diperbaiki saat ini."
              : "Tidak ada barang yang sedang diperbaiki."}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reports.map((report) => (
              <div key={report.id} className="border border-[var(--border-panel)] rounded-xl p-5 bg-[var(--bg-app)] relative">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-[var(--text-main)] text-lg">{report.nama_barang || "Barang Tidak Diketahui"}</h4>
                    <p className="text-xs text-indigo-600 font-semibold mt-1">{report.kode_barang} - {report.no_urut_pendaft}</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                    activeTab === "daftar" 
                      ? "bg-indigo-100 text-indigo-700" 
                      : "bg-[var(--tag-info-bg)] text-[var(--tag-info-text)]"
                  }`}>
                    {activeTab === "daftar" ? "Diterima" : "Sedang Diperbaiki"}
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                  <div>
                    <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold">Ruangan Asal</p>
                    <p className="text-sm font-medium text-[var(--text-main)] mt-0.5">{report.ruangan_asal || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold">Deskripsi Kendala</p>
                    <p className="text-sm font-medium text-[var(--text-main)] mt-0.5">{report.deskripsi_kerusakan}</p>
                  </div>
                  {report.foto_url && (
                    <div className="pt-2">
                      <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold mb-2">Bukti Kerusakan</p>
                      <a href={report.foto_url} target="_blank" rel="noopener noreferrer" className="inline-block w-full border border-[var(--border-panel)] rounded-xl overflow-hidden shadow-sm hover:opacity-80 transition-opacity">
                        <img src={report.foto_url} alt="Foto Kerusakan" className="w-full h-40 object-cover bg-black/5" onError={(e) => (e.currentTarget.style.display = 'none')} />
                      </a>
                    </div>
                  )}
                </div>

                {activeTab === "daftar" ? (
                  <button
                    onClick={() => handleMulaiPerbaiki(report.id)}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Mulai Perbaiki Barang
                  </button>
                ) : (
                  <button
                    onClick={() => handleOpenModal(report.id)}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Konfirmasi Penyelesaian
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Konfirmasi Penyelesaian */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[var(--bg-panel)] transition-colors duration-400 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative border border-[var(--border-panel)]">
            <div className="p-6 border-b border-[var(--border-panel)] flex justify-between items-center bg-[var(--bg-app)]">
              <h3 className="font-bold text-[var(--text-main)] text-xl flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Form Penyelesaian
              </h3>
              <button 
                onClick={handleCloseModal}
                className="p-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-rose-100 dark:hover:bg-rose-900/30 text-[var(--text-muted)] hover:text-rose-600 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmitKonfirmasi} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                    Nama Laboran / Teknisi
                  </label>
                  <input
                    type="text"
                    required
                    value={namaTeknisi}
                    onChange={(e) => setNamaTeknisi(e.target.value)}
                    placeholder="Masukkan nama Anda..."
                    className="w-full bg-[var(--bg-app)] border border-[var(--border-panel)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                    Bukti Penyelesaian (PDF)
                  </label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
                      pdfFile 
                        ? 'border-emerald-500 bg-emerald-50/5 dark:bg-emerald-900/10' 
                        : 'border-[var(--border-panel)] hover:border-emerald-400 bg-[var(--bg-app)]'
                    }`}
                  >
                    <input 
                      type="file" 
                      accept="application/pdf" 
                      className="hidden" 
                      ref={fileInputRef}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setPdfFile(e.target.files[0]);
                        }
                      }}
                    />
                    {pdfFile ? (
                      <>
                        <svg className="w-10 h-10 text-emerald-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-sm font-bold text-[var(--text-main)]">{pdfFile.name}</p>
                        <p className="text-xs text-emerald-600 mt-1">Berhasil dipilih</p>
                      </>
                    ) : (
                      <>
                        <svg className="w-10 h-10 text-[var(--text-muted)] mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-sm font-bold text-[var(--text-main)]">Klik untuk unggah file PDF</p>
                        <p className="text-xs text-[var(--text-muted)] mt-1">Maks. 2MB</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--border-panel)] flex gap-3">
                  <button 
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 py-3 bg-[var(--bg-app)] hover:bg-[var(--border-panel)] border border-[var(--border-panel)] text-[var(--text-main)] font-bold rounded-xl text-sm transition-all"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Menyimpan..." : "Kirim Konfirmasi"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
