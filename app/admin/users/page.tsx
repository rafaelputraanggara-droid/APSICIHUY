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
      <div className="relative overflow-hidden bg-gradient-to-r from-neutral-800 to-neutral-900 p-8 rounded-3xl text-white shadow-xl">
        <div className="relative z-10 space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Database Akun
          </h1>
          <p className="text-neutral-400 max-w-2xl text-sm sm:text-base">
            Kelola semua pengguna terdaftar di dalam sistem SIPRABU. Anda dapat meninjau detail dan menghapus akses jika ditemukan data tidak valid.
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-neutral-200 dark:border-neutral-800">
        <nav className="flex space-x-8 overflow-x-auto" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("admin")}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap cursor-pointer transition-all duration-200 ${
              activeTab === "admin"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
            }`}
          >
            Admin Fakultas
          </button>
          <button
            onClick={() => setActiveTab("pj")}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap cursor-pointer transition-all duration-200 ${
              activeTab === "pj"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
            }`}
          >
            PJ Ruangan Terdaftar
          </button>
          <button
            onClick={() => setActiveTab("mahasiswa")}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap cursor-pointer transition-all duration-200 ${
              activeTab === "mahasiswa"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
            }`}
          >
            Mahasiswa Terdaftar
          </button>
        </nav>
      </div>

      {/* Table Content */}
      <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  Nama Pengguna
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  Informasi Email
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  Status / Peran
                </th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-neutral-500 text-sm">
                    Memuat data...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-neutral-500 text-sm">
                    Belum ada akun di kategori ini.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-neutral-900">{user.name}</div>
                          {user.nim && <div className="text-xs text-indigo-600 font-mono mt-0.5">{user.nim}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        activeTab === 'mahasiswa' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {activeTab === 'mahasiswa' ? 'Mahasiswa Aktif' : user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        {activeTab !== 'admin' && (
                          <button
                            onClick={() => setDetailUser(user)}
                            className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Lihat Detail
                          </button>
                        )}
                        {activeTab !== 'admin' && (
                          <button
                            onClick={() => handleDelete(user.id, activeTab === 'mahasiswa' ? 'mahasiswa' : 'staff', user.name)}
                            className="text-rose-600 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors"
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
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative">
            <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
              <h3 className="text-lg font-black text-neutral-900 tracking-tight">Detail Pengguna</h3>
              <button 
                onClick={() => setDetailUser(null)}
                className="text-neutral-400 hover:text-neutral-600 p-1 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Nama Lengkap</p>
                <p className="font-semibold text-neutral-800">{detailUser.name}</p>
              </div>
              
              <div>
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Email</p>
                <p className="font-semibold text-neutral-800">{detailUser.email}</p>
              </div>

              {detailUser.nim && (
                <div>
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">NIM Mahasiswa</p>
                  <p className="font-mono font-bold text-indigo-600 bg-indigo-50 inline-block px-2 py-0.5 rounded-md">{detailUser.nim}</p>
                </div>
              )}

              {detailUser.role && (
                <div>
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Peran</p>
                  <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                    {detailUser.role}
                  </span>
                </div>
              )}

              {activeTab === 'mahasiswa' && (
                <div>
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Dokumen KTM (PDF)</p>
                  {detailUser.foto_ktm ? (
                    <div className="rounded-xl border-2 border-neutral-200 overflow-hidden bg-neutral-100 h-64">
                      <object 
                        data={detailUser.foto_ktm} 
                        type="application/pdf" 
                        className="w-full h-full"
                      >
                        <div className="flex items-center justify-center h-full">
                          <a 
                            href={detailUser.foto_ktm} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="px-4 py-2 bg-indigo-100 text-indigo-700 text-sm font-bold rounded-lg hover:bg-indigo-200 transition-colors"
                          >
                            Buka Dokumen PDF
                          </a>
                        </div>
                      </object>
                    </div>
                  ) : (
                    <div className="p-4 bg-neutral-50 rounded-xl text-center text-sm text-neutral-500 font-medium border border-neutral-200 border-dashed">
                      Foto KTM tidak tersedia
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-neutral-100 bg-neutral-50 flex justify-end">
              <button 
                onClick={() => setDetailUser(null)}
                className="px-6 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
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
