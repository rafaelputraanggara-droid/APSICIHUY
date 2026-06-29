"use client";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
const MySwal = withReactContent(Swal);


import React, { useState, useEffect, useRef } from "react";
import LoadingDots from "@/components/LoadingDots";

export default function MaintenancePage() {
  const [activeTab, setActiveTab] = useState("daftar");
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // States for 'konfirmasi' tab modal
  const [showModal, setShowModal] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [namaTeknisi, setNamaTeknisi] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfAdminFile, setPdfAdminFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const adminFileInputRef = useRef<HTMLInputElement>(null);

  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserRole(user.role);
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (userRole !== null) {
      fetchReports();
    }
  }, [activeTab, userRole]);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const status = activeTab === "daftar" ? "Menunggu Perbaikan" : "Sedang Diperbaiki";
      const res = await fetch(`/api/maintenance?status=${encodeURIComponent(status)}`);
      const data = await res.json();
      if (data.success) {
        let filteredData = data.data;
        if (userRole === "Laboran") {
          filteredData = filteredData.filter((r: any) => r.ruangan_asal && (r.ruangan_asal.startsWith("6") || r.ruangan_asal.toLowerCase().includes("laboratorium")));
        } else if (userRole === "Sarpras") {
          filteredData = filteredData.filter((r: any) => !r.ruangan_asal || (!r.ruangan_asal.startsWith("6") && !r.ruangan_asal.toLowerCase().includes("laboratorium")));
        }
        setReports(filteredData);
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
        MySwal.fire({ title: 'Notifikasi Sistem', text: String(data.error || "Gagal memperbarui status."), icon: 'info', confirmButtonColor: '#4f46e5', background: '#1a1a1a', color: '#ffffff' });
      }
    } catch (error) {
      MySwal.fire({ title: 'Notifikasi Sistem', text: String("Terjadi kesalahan sistem."), icon: 'info', confirmButtonColor: '#4f46e5', background: '#1a1a1a', color: '#ffffff' });
    }
  };

  const handleOpenModal = (id: number) => {
    setSelectedReportId(id);
    setNamaTeknisi("");
    setPdfFile(null);
    setPdfAdminFile(null);
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
    if (!selectedReportId || !namaTeknisi || !pdfFile || !pdfAdminFile) {
      MySwal.fire({ title: 'Notifikasi Sistem', text: String("Harap lengkapi semua data dan unggah kedua file PDF."), icon: 'info', confirmButtonColor: '#4f46e5', background: '#1a1a1a', color: '#ffffff' });
      return;
    }

    if (pdfFile.type !== "application/pdf" || pdfAdminFile.type !== "application/pdf") {
      MySwal.fire({ title: 'Notifikasi Sistem', text: String("Hanya file berformat PDF yang diperbolehkan."), icon: 'info', confirmButtonColor: '#4f46e5', background: '#1a1a1a', color: '#ffffff' });
      return;
    }

    if (pdfFile.size > 2 * 1024 * 1024 || pdfAdminFile.size > 2 * 1024 * 1024) {
      MySwal.fire({ title: 'Notifikasi Sistem', text: String("Ukuran masing-masing file PDF tidak boleh lebih dari 2MB."), icon: 'info', confirmButtonColor: '#4f46e5', background: '#1a1a1a', color: '#ffffff' });
      return;
    }

    setIsSubmitting(true);
    try {
      const base64Pdf = await convertToBase64(pdfFile);
      const base64AdminPdf = await convertToBase64(pdfAdminFile);

      const res = await fetch("/api/maintenance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedReportId,
          status: "Selesai",
          nama_teknisi: namaTeknisi,
          bukti_penyelesaian_pdf: base64Pdf,
          bukti_administrasi_pdf: base64AdminPdf,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        fetchReports();
      } else {
        MySwal.fire({ title: 'Notifikasi Sistem', text: String(data.error || "Gagal memperbarui status."), icon: 'info', confirmButtonColor: '#4f46e5', background: '#1a1a1a', color: '#ffffff' });
      }
    } catch (error) {
      MySwal.fire({ title: 'Notifikasi Sistem', text: String("Terjadi kesalahan sistem saat menyimpan penyelesaian."), icon: 'info', confirmButtonColor: '#4f46e5', background: '#1a1a1a', color: '#ffffff' });
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
          <LoadingDots text="Memuat data..." />
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
                    {activeTab === "daftar" ? "Menunggu Perbaikan" : "Sedang Diperbaiki"}
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
                    <div className="pt-2 mt-2 border-t border-[var(--border-panel)]">
                      <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold mb-2 mt-2">Bukti Kerusakan (PDF)</p>
                      <a href={report.foto_url} target="_blank" rel="noopener noreferrer" className="inline-flex w-full justify-center items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-[var(--text-main)] font-bold rounded-xl text-xs transition-all shadow-sm">
                        <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Buka / Unduh Dokumen
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
                    Bukti Perbaikan di Lokasi (PDF)
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

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                    Bukti Administrasi / Nota (PDF)
                  </label>
                  <div 
                    onClick={() => adminFileInputRef.current?.click()}
                    className={`w-full border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
                      pdfAdminFile 
                        ? 'border-indigo-500 bg-indigo-50/5 dark:bg-indigo-900/10' 
                        : 'border-[var(--border-panel)] hover:border-indigo-400 bg-[var(--bg-app)]'
                    }`}
                  >
                    <input 
                      type="file" 
                      accept="application/pdf" 
                      className="hidden" 
                      ref={adminFileInputRef}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setPdfAdminFile(e.target.files[0]);
                        }
                      }}
                    />
                    {pdfAdminFile ? (
                      <>
                        <svg className="w-10 h-10 text-indigo-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-sm font-bold text-[var(--text-main)]">{pdfAdminFile.name}</p>
                        <p className="text-xs text-indigo-600 mt-1">Berhasil dipilih</p>
                      </>
                    ) : (
                      <>
                        <svg className="w-10 h-10 text-[var(--text-muted)] mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-sm font-bold text-[var(--text-main)]">Klik untuk unggah Bukti Administrasi</p>
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
