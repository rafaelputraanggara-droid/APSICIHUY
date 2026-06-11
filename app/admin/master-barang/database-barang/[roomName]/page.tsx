"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Barang {
  kode_barang: string;
  no_urut_pendaft: number;
  nama_barang: string;
  merk_type: string;
  th_perolehan: number;
  kondisi: string;
  status_bmn: string;
  kategori: string;
}

export default function RoomItemsPage() {
  const params = useParams();
  const roomName = params?.roomName as string;
  const router = useRouter();
  const [items, setItems] = useState<Barang[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Edit Modal State
  const [editingItem, setEditingItem] = useState<Barang | null>(null);
  const [formData, setFormData] = useState<Partial<Barang>>({});

  const decodedRoomName = roomName ? decodeURIComponent(roomName) : "";

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/ruangan/${roomName}`);
      const json = await res.json();
      if (json.success) {
        setItems(json.data);
      }
    } catch (error) {
      console.error("Failed to fetch items:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (roomName) fetchItems();
  }, [roomName]);

  const handleEditClick = (item: Barang) => {
    setEditingItem(item);
    setFormData({
      nama_barang: item.nama_barang,
      merk_type: item.merk_type,
      th_perolehan: item.th_perolehan,
      kondisi: item.kondisi,
      kategori: item.kategori,
    });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      const res = await fetch("/api/barangs/detail", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kode_barang: editingItem.kode_barang,
          no_urut_pendaft: editingItem.no_urut_pendaft,
          ...formData
        }),
      });
      const json = await res.json();
      if (json.success) {
        setEditingItem(null);
        fetchItems();
      } else {
        alert(json.error || "Gagal mengubah data barang");
      }
    } catch (error) {
      console.error("Failed to update item:", error);
      alert("Terjadi kesalahan saat menyimpan perubahan.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 relative">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/admin/master-barang/database-barang")} className="p-2 bg-[var(--bg-panel)] transition-colors duration-400 border border-[var(--border-panel)] rounded-xl hover:bg-[var(--bg-app)] transition-colors duration-400 transition-colors">
            <svg className="w-5 h-5 text-neutral-600 dark:text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-main)] transition-colors duration-400">Data Barang - {decodedRoomName}</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">Daftar seluruh barang yang terdapat di ruangan ini.</p>
          </div>
        </div>
        
        <Link 
          href={`/admin/master-barang/database-barang/${encodeURIComponent(decodedRoomName)}/cetak-label`}
          target="_blank"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow hover:bg-indigo-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Cetak Semua Label
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-10 text-[var(--text-muted)]">Memuat data barang...</div>
      ) : (
        <div className="bg-[var(--bg-panel)] transition-colors duration-400 rounded-2xl border border-[var(--border-panel)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-neutral-50 bg-[var(--bg-app)] border-b border-[var(--border-panel)] text-[var(--text-muted)] transition-colors duration-400">
                <tr>
                  <th className="px-6 py-4 font-semibold">Kode & NUP</th>
                  <th className="px-6 py-4 font-semibold">Nama Barang</th>
                  <th className="px-6 py-4 font-semibold">Merk/Tipe</th>
                  <th className="px-6 py-4 font-semibold">Tahun</th>
                  <th className="px-6 py-4 font-semibold">Kondisi</th>
                  <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-panel)]">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-[var(--text-muted)]">Tidak ada barang di ruangan ini.</td>
                  </tr>
                ) : (
                  items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[var(--bg-app)] transition-colors duration-400 transition-colors">
                      <td className="px-6 py-4 font-medium text-[var(--text-main)] transition-colors duration-400">
                        {item.kode_barang} <span className="text-[var(--text-muted)]">/ {item.no_urut_pendaft}</span>
                      </td>
                      <td className="px-6 py-4 text-neutral-600 dark:text-neutral-300">{item.nama_barang}</td>
                      <td className="px-6 py-4 text-neutral-600 dark:text-neutral-300">{item.merk_type}</td>
                      <td className="px-6 py-4 text-neutral-600 dark:text-neutral-300">{item.th_perolehan}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          item.kondisi === "Baik" ? "bg-emerald-50 text-emerald-700" :
                          item.kondisi === "Rusak Ringan" ? "bg-amber-50 text-amber-700" :
                          "bg-red-50 text-red-700"
                        }`}>
                          {item.kondisi}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <Link
                            href={`/admin/master-barang/database-barang/${encodeURIComponent(decodedRoomName)}/cetak-label?item=${item.kode_barang}_${item.no_urut_pendaft}`}
                            target="_blank"
                            className="text-[var(--text-muted)] hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white font-medium transition-colors"
                            title="Cetak Label Item Ini"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                          </Link>
                          <button
                            onClick={() => handleEditClick(item)}
                            className="text-[var(--tag-info-text)] transition-colors duration-400 hover:text-indigo-900 dark:hover:text-indigo-300 font-medium transition-colors"
                          >
                            Edit
                          </button>
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

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-sm">
          <div className="bg-[var(--bg-panel)] transition-colors duration-400 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-[var(--border-panel)]">
            <div className="px-6 py-4 border-b border-[var(--border-panel)] flex justify-between items-center">
              <h3 className="text-lg font-bold text-[var(--text-main)] transition-colors duration-400">Edit Data Barang</h3>
              <button onClick={() => setEditingItem(null)} className="text-[var(--text-muted)] hover:text-neutral-600 dark:hover:text-neutral-300">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-main)] transition-colors duration-400 mb-1">Kode Barang & NUP</label>
                <input type="text" disabled className="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-[var(--text-muted)] cursor-not-allowed" value={`${editingItem.kode_barang} / ${editingItem.no_urut_pendaft}`} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-main)] transition-colors duration-400 mb-1">Nama Barang</label>
                <input type="text" name="nama_barang" required className="w-full px-4 py-2 bg-white bg-[var(--bg-app)] border border-[var(--border-panel)] rounded-xl text-[var(--text-main)] transition-colors duration-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" value={formData.nama_barang || ""} onChange={handleFormChange} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-main)] transition-colors duration-400 mb-1">Merk / Tipe</label>
                <input type="text" name="merk_type" required className="w-full px-4 py-2 bg-white bg-[var(--bg-app)] border border-[var(--border-panel)] rounded-xl text-[var(--text-main)] transition-colors duration-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" value={formData.merk_type || ""} onChange={handleFormChange} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-main)] transition-colors duration-400 mb-1">Tahun Perolehan</label>
                <input type="number" name="th_perolehan" required min="1900" max="2100" className="w-full px-4 py-2 bg-white bg-[var(--bg-app)] border border-[var(--border-panel)] rounded-xl text-[var(--text-main)] transition-colors duration-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" value={formData.th_perolehan || ""} onChange={handleFormChange} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-main)] transition-colors duration-400 mb-1">Kondisi</label>
                  <select name="kondisi" className="w-full px-4 py-2 bg-white bg-[var(--bg-app)] border border-[var(--border-panel)] rounded-xl text-[var(--text-main)] transition-colors duration-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" value={formData.kondisi || ""} onChange={handleFormChange}>
                    <option value="Baik">Baik</option>
                    <option value="Rusak Ringan">Rusak Ringan</option>
                    <option value="Rusak Berat">Rusak Berat</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-main)] transition-colors duration-400 mb-1">Kategori</label>
                  <select name="kategori" className="w-full px-4 py-2 bg-white bg-[var(--bg-app)] border border-[var(--border-panel)] rounded-xl text-[var(--text-main)] transition-colors duration-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" value={formData.kategori || ""} onChange={handleFormChange}>
                    <option value="Rendah">Rendah</option>
                    <option value="Tinggi">Tinggi</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setEditingItem(null)} className="flex-1 px-4 py-2.5 bg-neutral-100 dark:bg-neutral-800 text-[var(--text-main)] transition-colors duration-400 rounded-xl font-bold hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">Batal</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
