"use client";

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
        alert(json.error || "Gagal menambah kategori");
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (categoriesToDelete: string[]) => {
    if (categoriesToDelete.length === 0) return;
    const confirmDelete = window.confirm(`Apakah Anda yakin ingin menghapus ${categoriesToDelete.length} kategori terpilih?\n\nPerhatian: Barang yang berada di kategori ini akan kehilangan data kategorinya.`);
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
        alert(json.error || "Gagal menghapus kategori");
      }
    } catch (error) {
      alert("Terjadi kesalahan saat menghapus");
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
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 dark:from-indigo-950 dark:to-violet-950 p-8 rounded-3xl text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Kategori Barang
            </h1>
            <p className="text-indigo-100 max-w-2xl text-sm sm:text-base">
              Kelola kategori dan klasifikasi inventaris barang untuk memudahkan pencarian dan pelaporan.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 bg-white text-indigo-600 hover:bg-neutral-50 rounded-xl font-bold text-sm transition-colors shadow-sm whitespace-nowrap self-start md:self-auto"
          >
            + Tambah Kategori
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg text-sm font-semibold transition-colors border border-neutral-200 dark:border-neutral-700"
          >
            <svg className="w-4 h-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
            Urutkan: {sortOrder === "asc" ? "A ke Z" : "Z ke A"}
          </button>
        </div>

        {selectedCategories.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              {selectedCategories.length} terpilih
            </span>
            <button
              onClick={() => handleDelete(selectedCategories)}
              disabled={deleting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-lg text-sm font-bold transition-colors border border-transparent disabled:opacity-50"
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
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800">
            <thead className="bg-neutral-50 dark:bg-neutral-950/50">
              <tr>
                <th scope="col" className="px-6 py-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={categories.length > 0 && selectedCategories.length === categories.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-indigo-600 bg-white border-neutral-300 rounded focus:ring-indigo-500 dark:bg-neutral-800 dark:border-neutral-700 cursor-pointer"
                  />
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  Nama Kategori
                </th>
                <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  Total Barang
                </th>
                <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-emerald-500 uppercase tracking-wider">
                  Kondisi Baik
                </th>
                <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-rose-500 uppercase tracking-wider">
                  Kondisi Rusak
                </th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-neutral-900 divide-y divide-neutral-200 dark:divide-neutral-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-neutral-500 text-sm">
                    Memuat data kategori...
                  </td>
                </tr>
              ) : sortedCategories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-neutral-500 text-sm">
                    Belum ada data kategori.
                  </td>
                </tr>
              ) : (
                sortedCategories.map((cat, idx) => (
                  <tr key={idx} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat.nama_kategori)}
                        onChange={() => toggleSelect(cat.nama_kategori)}
                        className="w-4 h-4 text-indigo-600 bg-white border-neutral-300 rounded focus:ring-indigo-500 dark:bg-neutral-800 dark:border-neutral-700 cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                          {cat.nama_kategori.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-neutral-900 dark:text-white">{cat.nama_kategori}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                        {cat.total_barang} item
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                        {cat.barang_baik} item
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400">
                        {cat.barang_rusak} item
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleDelete([cat.nama_kategori])}
                        disabled={deleting}
                        className="p-2 text-neutral-400 hover:text-rose-600 transition-colors bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg border border-transparent hover:border-rose-100 dark:hover:border-rose-900/50"
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
          <div className="bg-white dark:bg-neutral-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative">
            <form onSubmit={handleAddSubmit}>
              <div className="p-6 border-b border-neutral-100 dark:border-neutral-800">
                <h3 className="text-lg font-black text-neutral-900 dark:text-white tracking-tight">Tambah Kategori Baru</h3>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Nama Kategori</label>
                  <input
                    type="text"
                    value={newKategori}
                    onChange={(e) => setNewKategori(e.target.value)}
                    required
                    className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 px-4 py-3 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
                    placeholder="Contoh: Kursi Kerja"
                    autoFocus
                  />
                </div>
              </div>

              <div className="p-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-sm font-bold rounded-xl transition-colors"
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
