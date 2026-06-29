"use client";

import React, { useState, useEffect } from "react";

export default function DatabaseAkunPage() {
  const [activeTab, setActiveTab] = useState<"admin" | "pj" | "mahasiswa">("mahasiswa");
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [detailUser, setDetailUser] = useState<any>(null);

  useEffect(() => {
    fetchUsers(activeTab);
  }, [activeTab]);

  const fetchUsers = async (role: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/database-akun?role=${role}`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error("Gagal mengambil data akun", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number, type: string, name: string) => {
    const confirmDelete = window.confirm(`Apakah Anda yakin ingin menghapus akun ${name}? (Jika mahasiswa dihapus, mereka bisa mendaftar ulang)`);
    if (!confirmDelete) return;

    try {
      const res = await fetch("/api/database-akun", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, type }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Akun ${name} berhasil dihapus.`);
        fetchUsers(activeTab); // Refresh data
        if (detailUser && detailUser.id === id) setDetailUser(null);
      } else {
        alert(data.error || "Gagal menghapus akun.");
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem saat menghapus.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 relative">
      <div className="relative overflow-hidden bg-[var(--bg-banner)] transition-colors duration-400 p-8 rounded-3xl text-white shadow-xl">
        <div className="relative z-10 space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Database Akun
          </h1>
          <p className="text-white/80 max-w-2xl text-sm sm:text-base">
            Kelola semua pengguna terdaftar di dalam sistem SIPRABU. Anda dapat meninjau detail dan menghapus akses jika ditemukan data tidak valid.
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-[var(--border-panel)] border-[var(--border-panel)]">
        <nav className="flex space-x-8 overflow-x-auto" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("admin")}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap cursor-pointer transition-all duration-200 ${
              activeTab === "admin"
                ? "border-indigo-600 text-[var(--tag-info-text)] transition-colors duration-400"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-neutral-300"
            }`}
          >
            Admin Fakultas
          </button>
          <button
            onClick={() => setActiveTab("pj")}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap cursor-pointer transition-all duration-200 ${
              activeTab === "pj"
                ? "border-indigo-600 text-[var(--tag-info-text)] transition-colors duration-400"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-neutral-300"
            }`}
          >
            PJ Ruangan & Teknisi
          </button>
          <button
            onClick={() => setActiveTab("mahasiswa")}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap cursor-pointer transition-all duration-200 ${
              activeTab === "mahasiswa"
                ? "border-indigo-600 text-[var(--tag-info-text)] transition-colors duration-400"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-neutral-300"
            }`}
          >
            Mahasiswa Terdaftar
          </button>
        </nav>
      </div>

      {/* Table Content */}
      <div className="bg-[var(--bg-panel)] transition-colors duration-400 border border-[var(--border-panel)] rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-[var(--bg-app)] transition-colors duration-400">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  Nama Pengguna
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  Informasi Email
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  Status / Peran
                </th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-[var(--bg-panel)] transition-colors duration-400 divide-y divide-neutral-200">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-[var(--text-muted)] text-sm">
                    Memuat data...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-[var(--text-muted)] text-sm">
                    Belum ada akun di kategori ini.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-[var(--bg-app)] transition-colors duration-400 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-[var(--text-main)]">{user.name}</div>
                          {user.nim && <div className="text-xs text-[var(--tag-info-text)] transition-colors duration-400 font-mono mt-0.5">{user.nim}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[var(--text-main)]">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        activeTab === 'mahasiswa' 
                          ? 'bg-[var(--tag-success-bg)] text-[var(--tag-success-text)] transition-colors duration-400' 
                          : 'bg-[var(--tag-info-bg)] text-[var(--tag-info-text)] transition-colors duration-400'
                      }`}>
                        {activeTab === 'mahasiswa' ? 'Mahasiswa Aktif' : user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        {activeTab !== 'admin' && (
                          <button
                            onClick={() => setDetailUser(user)}
                            className="text-[var(--tag-info-text)] transition-colors duration-400 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Lihat Detail
                          </button>
                        )}
                        {activeTab !== 'admin' && (
                          <button
                            onClick={() => handleDelete(user.id, activeTab === 'mahasiswa' ? 'mahasiswa' : 'staff', user.name)}
                            className="text-[var(--tag-danger-text)] transition-colors duration-400 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Hapus Akses
                          </button>
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

      {/* Modal Detail User */}
      {detailUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[var(--bg-panel)] transition-colors duration-400 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-[var(--border-panel)] flex justify-between items-center bg-[var(--bg-app)] transition-colors duration-400/50">
              <h3 className="text-lg font-black text-[var(--text-main)] tracking-tight">Detail Pengguna</h3>
              <button 
                onClick={() => setDetailUser(null)}
                className="text-[var(--text-muted)] hover:text-[var(--text-muted)] p-1 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-4 flex-1 overflow-y-auto">
              <div>
                <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Nama Lengkap</p>
                <p className="font-semibold text-[var(--text-main)]">{detailUser.name}</p>
              </div>
              
              <div>
                <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Email</p>
                <p className="font-semibold text-[var(--text-main)]">{detailUser.email}</p>
              </div>

              {detailUser.nim && (
                <div>
                  <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">NIM / NUP / ID Pegawai</p>
                  <p className="font-mono font-bold text-[var(--tag-info-text)] transition-colors duration-400 bg-indigo-50 inline-block px-2 py-0.5 rounded-md">{detailUser.nim}</p>
                </div>
              )}

              {detailUser.role && (
                <div>
                  <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Peran</p>
                  <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-[var(--tag-info-bg)] text-[var(--tag-info-text)] transition-colors duration-400">
                    {detailUser.role}
                  </span>
                </div>
              )}

              {activeTab !== 'admin' && (
                <div>
                  <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Dokumen Identitas (PDF)</p>
                  {detailUser.foto_ktm ? (
                    <div className="space-y-3">
                      <div className="flex justify-end">
                        <a 
                          href={detailUser.foto_ktm} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                          </svg>
                          Cetak / Buka di Tab Baru
                        </a>
                      </div>
                      <div className="rounded-xl border-2 border-[var(--border-panel)] overflow-hidden bg-neutral-100 h-64">
                        <object 
                          data={detailUser.foto_ktm} 
                          type="application/pdf" 
                          className="w-full h-full"
                        >
                          <div className="flex items-center justify-center h-full">
                            <span className="text-sm text-[var(--text-muted)]">Browser tidak mendukung preview PDF.</span>
                          </div>
                        </object>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-[var(--bg-app)] transition-colors duration-400 rounded-xl text-center text-sm text-[var(--text-muted)] font-medium border border-[var(--border-panel)] border-dashed">
                      Dokumen tidak tersedia
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[var(--border-panel)] bg-[var(--bg-app)] transition-colors duration-400 flex justify-end">
              <button 
                onClick={() => setDetailUser(null)}
                className="px-6 py-2 bg-[var(--bg-banner)] transition-colors duration-400 hover:bg-neutral-800 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
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
