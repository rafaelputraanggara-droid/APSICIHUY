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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Daftar Database Barang</h1>
          <p className="text-sm text-neutral-500 mt-1">Daftar ruangan dan inventaris barang di dalamnya.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-neutral-500">Memuat data ruangan...</div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-10 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <p className="text-neutral-500 dark:text-neutral-400">Belum ada data ruangan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room, idx) => (
            <div key={idx} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <button
                  onClick={() => {
                    setEditingRoom(room.room);
                    setNewRoomName(room.room);
                  }}
                  className="text-neutral-400 hover:text-indigo-600 transition-colors"
                  title="Edit Nama Ruangan"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>

              {editingRoom === room.room ? (
                <div className="mb-4">
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg text-sm bg-white dark:bg-neutral-950 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    autoFocus
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleEditSubmit(room.room)}
                      className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors"
                    >
                      Simpan
                    </button>
                    <button
                      onClick={() => setEditingRoom(null)}
                      className="px-3 py-1.5 bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg text-xs font-medium hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white truncate" title={room.room}>
                    {room.room}
                  </h3>
                  <p className="text-sm text-neutral-500 mt-1">{room.itemCount} Barang Terdaftar</p>
                </div>
              )}

              <Link
                href={`/admin/master-barang/database-barang/${encodeURIComponent(room.room)}`}
                className="inline-flex items-center justify-center w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg text-sm font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              >
                Lihat Barang
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
