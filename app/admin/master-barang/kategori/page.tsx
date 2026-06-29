"use client";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
const MySwal = withReactContent(Swal);


import React, { useState, useEffect } from "react";

interface KategoriData {
  nama_kategori: string;
  total_barang: number;
  barang_baik: number;
  barang_rusak: number;
}

export default function KategoriBarangPage() {
  const [categories, setCategories] = useState<KategoriData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newKategori, setNewKategori] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/kategori");
      const json = await res.json();
      if (json.success) {
        setCategories(json.data);
      }
    } catch (error) {
      console.error("Gagal mengambil data kategori", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKategori.trim()) return;

    setSaving(true);
    try {
      const res = await fetch("/api/kategori", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama_kategori: newKategori }),
      });
      const json = await res.json();
      if (json.success) {
        setNewKategori("");
        setShowAddModal(false);
        fetchCategories();
      } else {
        MySwal.fire({ title: 'Notifikasi Sistem', text: String(json.error || "Gagal menambah kategori"), icon: 'info', confirmButtonColor: '#4f46e5', background: '#1a1a1a', color: '#ffffff' });
      }
    } catch (error) {
      MySwal.fire({ title: 'Notifikasi Sistem', text: String("Terjadi kesalahan sistem"), icon: 'info', confirmButtonColor: '#4f46e5', background: '#1a1a1a', color: '#ffffff' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (categoriesToDelete: string[]) => {
    if (categoriesToDelete.length === 0) return;
    const confirmDelete = (await MySwal.fire({ title: 'Konfirmasi', text: String(`Apakah Anda yakin ingin menghapus ${categoriesToDelete.length} kategori terpilih?\n\nPerhatian: Barang yang berada di kategori ini akan kehilangan data kategorinya.`), icon: 'warning', showCancelButton: true, confirmButtonColor: '#4f46e5', cancelButtonColor: '#d33', confirmButtonText: 'Ya', cancelButtonText: 'Batal', background: '#1a1a1a', color: '#ffffff' })).isConfirmed
    if (!confirmDelete) return;

    setDeleting(true);
    try {
      const res = await fetch("/api/kategori", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories: categoriesToDelete }),
      });
      const json = await res.json();
      if (json.success) {
        setSelectedCategories([]);
        fetchCategories();
      } else {
        MySwal.fire({ title: 'Notifikasi Sistem', text: String(json.error || "Gagal menghapus kategori"), icon: 'info', confirmButtonColor: '#4f46e5', background: '#1a1a1a', color: '#ffffff' });
      }
    } catch (error) {
      MySwal.fire({ title: 'Notifikasi Sistem', text: String("Terjadi kesalahan saat menghapus"), icon: 'info', confirmButtonColor: '#4f46e5', background: '#1a1a1a', color: '#ffffff' });
    } finally {
      setDeleting(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedCategories.length === categories.length && categories.length > 0) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(categories.map(c => c.nama_kategori));
    }
  };

  const toggleSelect = (nama_kategori: string) => {
    if (selectedCategories.includes(nama_kategori)) {
      setSelectedCategories(prev => prev.filter(c => c !== nama_kategori));
    } else {
      setSelectedCategories(prev => [...prev, nama_kategori]);
    }
  };

  const sortedCategories = [...categories].sort((a, b) => {
    const nameA = a.nama_kategori.toLowerCase();
    const nameB = b.nama_kategori.toLowerCase();
    if (sortOrder === "asc") return nameA.localeCompare(nameB);
    return nameB.localeCompare(nameA);
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 relative">
      <div className="relative overflow-hidden bg-[var(--bg-banner)] transition-colors duration-400 p-8 rounded-3xl text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Kategori Barang
            </h1>
            <p className="text-white/80 max-w-2xl text-sm sm:text-base">
              Kelola kategori dan klasifikasi inventaris barang untuk memudahkan pencarian dan pelaporan.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 bg-[var(--bg-panel)] transition-colors duration-400 text-[var(--tag-info-text)] transition-colors duration-400 hover:bg-[var(--bg-app)] transition-colors duration-400 rounded-xl font-bold text-sm transition-colors shadow-sm whitespace-nowrap self-start md:self-auto"
          >
            + Tambah Kategori
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[var(--bg-panel)] transition-colors duration-400 p-4 rounded-2xl border border-[var(--border-panel)] shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--bg-app)] transition-colors duration-400 hover:bg-[var(--bg-app)] transition-colors duration-400 text-[var(--text-main)] transition-colors duration-400 rounded-lg text-sm font-semibold transition-colors border border-neutral-200 dark:border-neutral-700"
          >
            <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
            Urutkan: {sortOrder === "asc" ? "A ke Z" : "Z ke A"}
          </button>
        </div>

        {selectedCategories.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-[var(--text-muted)] transition-colors duration-400">
              {selectedCategories.length} terpilih
            </span>
            <button
              onClick={() => handleDelete(selectedCategories)}
              disabled={deleting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-lg text-sm font-bold transition-colors border border-transparent disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Hapus Terpilih
            </button>
          </div>
        )}
      </div>

      {/* Table Content */}
      <div className="bg-[var(--bg-panel)] transition-colors duration-400 border border-[var(--border-panel)] rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[var(--border-panel)]">
            <thead className="bg-[var(--bg-app)] transition-colors duration-400">
              <tr>
                <th scope="col" className="px-6 py-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={categories.length > 0 && selectedCategories.length === categories.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-[var(--tag-info-text)] transition-colors duration-400 bg-[var(--bg-panel)] transition-colors duration-400 border-neutral-300 rounded focus:ring-indigo-500 dark:bg-neutral-800 dark:border-neutral-700 cursor-pointer"
                  />
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  Nama Kategori
                </th>
                <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  Total Barang
                </th>
                <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-emerald-500 uppercase tracking-wider">
                  Kondisi Baik
                </th>
                <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-rose-500 uppercase tracking-wider">
                  Kondisi Rusak
                </th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-[var(--bg-panel)] transition-colors duration-400 divide-y divide-[var(--border-panel)]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[var(--text-muted)] text-sm">
                    Memuat data kategori...
                  </td>
                </tr>
              ) : sortedCategories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[var(--text-muted)] text-sm">
                    Belum ada data kategori.
                  </td>
                </tr>
              ) : (
                sortedCategories.map((cat, idx) => (
                  <tr key={idx} className="hover:bg-[var(--bg-app)] transition-colors duration-400 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat.nama_kategori)}
                        onChange={() => toggleSelect(cat.nama_kategori)}
                        className="w-4 h-4 text-[var(--tag-info-text)] transition-colors duration-400 bg-[var(--bg-panel)] transition-colors duration-400 border-neutral-300 rounded focus:ring-indigo-500 dark:bg-neutral-800 dark:border-neutral-700 cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                          {cat.nama_kategori.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-[var(--text-main)] transition-colors duration-400">{cat.nama_kategori}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm font-semibold text-[var(--text-main)] transition-colors duration-400">
                        {cat.total_barang} item
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-[var(--tag-success-bg)] text-[var(--tag-success-text)] transition-colors duration-400">
                        {cat.barang_baik} item
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-[var(--tag-danger-bg)] text-[var(--tag-danger-text)] transition-colors duration-400">
                        {cat.barang_rusak} item
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleDelete([cat.nama_kategori])}
                        disabled={deleting}
                        className="p-2 text-[var(--text-muted)] hover:text-[var(--tag-danger-text)] transition-colors duration-400 transition-colors bg-[var(--bg-panel)] transition-colors duration-400 hover:bg-[var(--bg-app)] transition-colors duration-400 rounded-lg border border-transparent hover:border-rose-100 dark:hover:border-rose-900/50"
                        title="Hapus Kategori"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[var(--bg-panel)] transition-colors duration-400 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative">
            <form onSubmit={handleAddSubmit}>
              <div className="p-6 border-b border-neutral-100 border-[var(--border-panel)]">
                <h3 className="text-lg font-black text-[var(--text-main)] transition-colors duration-400 tracking-tight">Tambah Kategori Baru</h3>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Nama Kategori</label>
                  <input
                    type="text"
                    value={newKategori}
                    onChange={(e) => setNewKategori(e.target.value)}
                    required
                    className="w-full bg-neutral-50 bg-[var(--bg-app)] border border-[var(--border-panel)] px-4 py-3 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none text-[var(--text-main)]"
                    placeholder="Contoh: Kursi Kerja"
                    autoFocus
                  />
                </div>
              </div>

              <div className="p-4 border-t border-neutral-100 border-[var(--border-panel)] bg-neutral-50 bg-[var(--bg-app)] flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-[var(--text-main)] transition-colors duration-400 text-sm font-bold rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  disabled={saving || !newKategori.trim()}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
                >
                  {saving ? "Menyimpan..." : "Simpan Kategori"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
