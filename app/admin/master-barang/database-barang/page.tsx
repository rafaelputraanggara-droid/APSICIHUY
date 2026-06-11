"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface RoomData {
  room: string;
  itemCount: number;
}

export default function DatabaseBarangPage() {
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRoom, setEditingRoom] = useState<string | null>(null);
  const [newRoomName, setNewRoomName] = useState("");
  const router = useRouter();

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/ruangan");
      const json = await res.json();
      if (json.success) {
        setRooms(json.data);
      }
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleEditSubmit = async (oldName: string) => {
    if (!newRoomName || newRoomName.trim() === "" || newRoomName === oldName) {
      setEditingRoom(null);
      return;
    }

    try {
      const res = await fetch("/api/ruangan", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldName, newName: newRoomName }),
      });
      const json = await res.json();
      if (json.success) {
        // Refresh the list after successful edit
        fetchRooms();
        setEditingRoom(null);
      } else {
        alert(json.error || "Gagal mengubah nama ruangan");
      }
    } catch (error) {
      console.error("Failed to update room:", error);
      alert("Terjadi kesalahan saat menyimpan perubahan.");
    }
  };

  const handleDeleteRoom = async (roomName: string, itemCount: number) => {
    let confirmMsg = `Apakah Anda yakin untuk menghapus ruangan "${roomName}"?`;
    if (itemCount > 0) {
      confirmMsg = `PERINGATAN: Masih ada ${itemCount} barang di ruangan "${roomName}".\n\nJika Anda menghapus ruangan ini, barang-barang tersebut akan kehilangan data lokasinya. Apakah Anda tetap yakin ingin menghapusnya?`;
    }

    if (!window.confirm(confirmMsg)) {
      return;
    }

    try {
      const res = await fetch(`/api/ruangan?room=${encodeURIComponent(roomName)}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        fetchRooms();
      } else {
        alert(json.error || "Gagal menghapus ruangan");
      }
    } catch (error) {
      console.error("Failed to delete room:", error);
      alert("Terjadi kesalahan saat menghapus ruangan.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="relative overflow-hidden bg-[var(--bg-banner)] p-8 rounded-3xl text-white shadow-xl transition-colors duration-400">
        <div className="relative z-10 space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Daftar Database Barang
          </h1>
          <p className="text-indigo-100 max-w-2xl text-sm sm:text-base">
            Daftar ruangan dan inventaris barang di dalamnya.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-[var(--text-muted)]">Memuat data ruangan...</div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-10 bg-[var(--bg-panel)] transition-colors duration-400 bg-[var(--bg-panel)] rounded-2xl border border-[var(--border-panel)] border-[var(--border-panel)]">
          <p className="text-[var(--text-muted)] dark:text-[var(--text-muted)]">Belum ada data ruangan.</p>
        </div>
      ) : (
        <div className="bg-[var(--bg-panel)] border border-[var(--border-panel)] rounded-2xl shadow-sm overflow-hidden transition-colors duration-400">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[var(--border-panel)]">
              <thead className="bg-[var(--bg-app)]">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    Nama Ruangan / Lokasi
                  </th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    Total Inventaris
                  </th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[var(--bg-panel)] divide-y divide-[var(--border-panel)] transition-colors duration-400">
                {rooms.map((room, idx) => (
                  <tr key={idx} className="hover:bg-[var(--bg-app)] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingRoom === room.room ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            className="px-3 py-1.5 border border-[var(--border-panel)] rounded-lg text-sm bg-[var(--bg-panel)] transition-colors duration-400 bg-[var(--bg-app)] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={newRoomName}
                            onChange={(e) => setNewRoomName(e.target.value)}
                            autoFocus
                          />
                          <button
                            onClick={() => handleEditSubmit(room.room)}
                            className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors"
                          >
                            Simpan
                          </button>
                          <button
                            onClick={() => setEditingRoom(null)}
                            className="px-3 py-1.5 bg-neutral-200 dark:bg-neutral-800 text-[var(--text-main)] dark:text-neutral-300 rounded-lg text-xs font-bold hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors"
                          >
                            Batal
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                          <div className="ml-4 flex items-center gap-2">
                            <div className="text-sm font-bold text-[var(--text-main)] text-[var(--text-main)] truncate" title={room.room}>
                              {room.room}
                            </div>
                            {room.itemCount === 0 && (
                              <svg className="w-4 h-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} title="Ruangan Kosong">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300">
                        {room.itemCount} Barang
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/master-barang/database-barang/${encodeURIComponent(room.room)}`}
                          className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                        >
                          Lihat
                        </Link>
                        <button
                          onClick={() => {
                            setEditingRoom(room.room);
                            setNewRoomName(room.room);
                          }}
                          className="p-1.5 text-[var(--text-muted)] hover:text-[var(--tag-info-text)] transition-colors duration-400 transition-colors bg-[var(--bg-panel)] transition-colors duration-400 bg-[var(--bg-panel)] hover:bg-[var(--bg-app)] transition-colors duration-400 rounded-lg border border-[var(--border-panel)] dark:border-neutral-700"
                          title="Edit Nama Ruangan"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteRoom(room.room, room.itemCount)}
                          className="p-1.5 text-[var(--text-muted)] hover:text-[var(--tag-danger-text)] transition-colors duration-400 transition-colors bg-[var(--bg-panel)] transition-colors duration-400 bg-[var(--bg-panel)] hover:bg-[var(--bg-app)] transition-colors duration-400 rounded-lg border border-[var(--border-panel)] dark:border-neutral-700"
                          title="Hapus Ruangan"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
