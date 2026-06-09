"use client";

import React, { useState } from "react";

// Mock Database Structure aligned with Laravel Schemas
interface Room {
  id: number;
  kode_ruangan: string;
  nama_ruangan: string;
}

interface Item {
  id: number;
  kode_barang: string;
  nama_barang: string;
  room_id: number;
  kategori: string;
  status: "Baik" | "Rusak Ringan" | "Rusak Berat" | "Hilang";
  spesifikasi: string;
  tanggal_perolehan: string;
  terakhir_opname?: string;
}

interface DamageReport {
  id: number;
  kode_laporan: string;
  kode_barang: string;
  nama_barang: string;
  room_id: number;
  deskripsi_kerusakan: string;
  pelapor_nama: string;
  pelapor_kontak: string;
  status: "Pending" | "Validated" | "Rejected" | "In_Progress" | "Resolved";
  created_at: string;
  catatan_pj?: string;
}

interface Mutation {
  id: number;
  kode_barang: string;
  nama_barang: string;
  room_asal_id: number;
  room_tujuan_id: number;
  status: "Pending" | "Approved" | "Completed" | "Rejected";
  alasan: string;
  created_at: string;
}

export default function LaboranDashboard() {
  // --- Active Tab State ---
  const [activeTab, setActiveTab] = useState<"overview" | "rooms" | "opname" | "reports" | "mutations">("overview");

  // --- Mock Database States ---
  const [rooms] = useState<Room[]>([
    { id: 1, kode_ruangan: 'LAB-RPL-301', nama_ruangan: 'Laboratorium Rekayasa Perangkat Lunak' },
    { id: 2, kode_ruangan: 'LAB-JAS-302', nama_ruangan: 'Laboratorium Jaringan & Keamanan Siber' },
    { id: 3, kode_ruangan: 'LAB-KOD-303', nama_ruangan: 'Laboratorium Komputer Dasar' }
  ]);

  const [items, setItems] = useState<Item[]>([
    { id: 1, kode_barang: 'BRG-100231', nama_barang: 'PC Client Asus ExpertCenter D7', room_id: 1, kategori: 'Komputer/Elektronik', status: 'Baik', spesifikasi: 'Intel Core i7-12700, 16GB DDR4 RAM, 512GB NVMe SSD, Monitor 24"', tanggal_perolehan: '2024-03-12', terakhir_opname: '2026-05-15' },
    { id: 2, kode_barang: 'BRG-100232', nama_barang: 'PC Client Asus ExpertCenter D7', room_id: 1, kategori: 'Komputer/Elektronik', status: 'Baik', spesifikasi: 'Intel Core i7-12700, 16GB DDR4 RAM, 512GB NVMe SSD, Monitor 24"', tanggal_perolehan: '2024-03-12', terakhir_opname: '2026-05-15' },
    { id: 3, kode_barang: 'BRG-100233', nama_barang: 'PC Client Asus ExpertCenter D7', room_id: 1, kategori: 'Komputer/Elektronik', status: 'Rusak Ringan', spesifikasi: 'Intel Core i7-12700, 16GB DDR4 RAM, 512GB NVMe SSD, Monitor 24"', tanggal_perolehan: '2024-03-12', terakhir_opname: '2026-05-15' },
    { id: 4, kode_barang: 'BRG-200541', nama_barang: 'Projector Epson EB-FH52 Full HD', room_id: 1, kategori: 'Media Presentasi', status: 'Baik', spesifikasi: '4000 lumens, Full HD resolution, HDMI/VGA inputs', tanggal_perolehan: '2023-08-20', terakhir_opname: '2026-05-15' },
    { id: 5, kode_barang: 'BRG-300122', nama_barang: 'Air Conditioner Daikin 2 PK', room_id: 1, kategori: 'Utilitas/Pendingin', status: 'Baik', spesifikasi: 'Split AC, Inverter technology, Eco-friendly R32', tanggal_perolehan: '2023-01-15', terakhir_opname: '2026-05-15' },
    { id: 6, kode_barang: 'BRG-100411', nama_barang: 'Server Rack HP ProLiant DL360 Gen10', room_id: 2, kategori: 'Server/Keamanan', status: 'Baik', spesifikasi: 'Intel Xeon-Silver 4208, 32GB RAM, 2x 1.2TB SAS HDD', tanggal_perolehan: '2022-11-04', terakhir_opname: '2026-05-10' },
    { id: 7, kode_barang: 'BRG-100412', nama_barang: 'Cisco Catalyst Switch 2960-X', room_id: 2, kategori: 'Jaringan/Network', status: 'Baik', spesifikasi: '24 Port GigE, 4 x 1G SFP uplinks, LAN Base', tanggal_perolehan: '2022-11-04', terakhir_opname: '2026-05-10' },
    { id: 8, kode_barang: 'BRG-100413', nama_barang: 'Router Mikrotik CCR1009-7G-1C-1S+', room_id: 2, kategori: 'Jaringan/Network', status: 'Rusak Berat', spesifikasi: '9 cores CPU, 2GB RAM, 7x Gigabit Ethernet ports', tanggal_perolehan: '2023-05-09', terakhir_opname: '2026-05-10' },
    { id: 9, kode_barang: 'BRG-100501', nama_barang: 'PC Client Acer Veriton X2690G', room_id: 3, kategori: 'Komputer/Elektronik', status: 'Baik', spesifikasi: 'Intel Core i5, 8GB RAM, 256GB SSD', tanggal_perolehan: '2025-02-18', terakhir_opname: '2026-05-01' }
  ]);

  const [reports, setReports] = useState<DamageReport[]>([
    { id: 1, kode_laporan: 'LPR-20260608-001', kode_barang: 'BRG-100233', nama_barang: 'PC Client Asus ExpertCenter D7', room_id: 1, deskripsi_kerusakan: 'Keyboard tidak merespon beberapa tombol huruf (Q, W, E, R), mouse macet-macet.', pelapor_nama: 'Gita Amalia (Mahasiswa)', pelapor_kontak: '085812345678', status: 'Pending', created_at: '2026-06-08 08:30' },
    { id: 2, kode_laporan: 'LPR-20260608-002', kode_barang: 'BRG-100413', nama_barang: 'Router Mikrotik CCR1009-7G-1C-1S+', room_id: 2, deskripsi_kerusakan: 'Lampu indikator menyala merah secara konstan dan unit tidak merespon reset factory.', pelapor_nama: 'Dr. Slamet Santoso (Dosen)', pelapor_kontak: '081287654321', status: 'Pending', created_at: '2026-06-08 09:15' },
    { id: 3, kode_laporan: 'LPR-20260605-001', kode_barang: 'BRG-200541', nama_barang: 'Projector Epson EB-FH52 Full HD', room_id: 1, deskripsi_kerusakan: 'Tampilan buram dan ada bercak kuning di pojok kanan bawah.', pelapor_nama: 'Farhan Kurnia (PJ Shift)', pelapor_kontak: '082133445566', status: 'Validated', created_at: '2026-06-05 14:00', catatan_pj: 'Disetujui untuk maintenance oleh laboran.' }
  ]);

  const [mutations, setMutations] = useState<Mutation[]>([
    { id: 1, kode_barang: 'BRG-300122', nama_barang: 'Air Conditioner Daikin 2 PK', room_asal_id: 1, room_tujuan_id: 2, status: 'Pending', alasan: 'Pemindahan pendingin untuk menyeimbangkan temperatur di ruang server.', created_at: '2026-06-06' }
  ]);

  // --- Interaction States ---
  const [selectedRoomId, setSelectedRoomId] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCondition, setFilterCondition] = useState<string>("All");

  // QR Code Details Modal
  const [viewingItem, setViewingItem] = useState<Item | null>(null);

  // Stock Opname Form States
  const [opnameRoomId, setOpnameRoomId] = useState<number>(1);
  const [opnameStatusList, setOpnameStatusList] = useState<{ [key: string]: { status: Item["status"]; catatan: string; verified: boolean } }>({});
  const [isOpnameStarted, setIsOpnameStarted] = useState(false);

  // Validation Actions
  const [rejectingReportId, setRejectingReportId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Mutation Creation Form
  const [mutationItemCode, setMutationItemCode] = useState("");
  const [mutationDestRoomId, setMutationDestRoomId] = useState<number>(2);
  const [mutationReason, setMutationReason] = useState("");
  const [mutationSuccessMsg, setMutationSuccessMsg] = useState("");

  // --- Core Calculations ---
  const totalRoomsManaged = rooms.length;
  const totalAssetsManaged = items.length;
  const pendingReportsCount = reports.filter(r => r.status === "Pending").length;
  const activeMutationsCount = mutations.filter(m => m.status === "Pending").length;

  const currentRoomName = rooms.find(r => r.id === selectedRoomId)?.nama_ruangan || "";
  const currentRoomCode = rooms.find(r => r.id === selectedRoomId)?.kode_ruangan || "";

  // Filtered Assets list
  const filteredItems = items.filter(item => {
    if (item.room_id !== selectedRoomId) return false;
    const matchesSearch = item.nama_barang.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.kode_barang.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterCondition === "All" || item.status === filterCondition;
    return matchesSearch && matchesFilter;
  });

  // --- HANDLERS ---

  // Handle validating (approving) reports
  const handleValidateReport = (reportId: number) => {
    setReports(prev => prev.map(report => {
      if (report.id === reportId) {
        // Update item condition if report is validated as damaged
        const itemCode = report.kode_barang;
        setItems(prevItems => prevItems.map(item => {
          if (item.kode_barang === itemCode) {
            return { ...item, status: "Rusak Ringan" }; // Default to Rusak Ringan upon validation
          }
          return item;
        }));
        return { ...report, status: "Validated", catatan_pj: "Validasi disetujui. Diteruskan ke Koordinator Prodi untuk perbaikan." };
      }
      return report;
    }));
  };

  // Handle rejecting reports
  const handleRejectReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rejectingReportId === null) return;

    setReports(prev => prev.map(report => {
      if (report.id === rejectingReportId) {
        return { ...report, status: "Rejected", catatan_pj: `Ditolak: ${rejectReason}` };
      }
      return report;
    }));

    setRejectingReportId(null);
    setRejectReason("");
  };

  // Handle starting a Stock Opname session
  const startStockOpname = (roomId: number) => {
    const roomItems = items.filter(item => item.room_id === roomId);
    const initialOpnameState: typeof opnameStatusList = {};
    roomItems.forEach(item => {
      initialOpnameState[item.kode_barang] = {
        status: item.status,
        catatan: "",
        verified: false
      };
    });
    setOpnameStatusList(initialOpnameState);
    setOpnameRoomId(roomId);
    setIsOpnameStarted(true);
  };

  // Update item in Stock Opname
  const handleOpnameItemChange = (kode: string, field: "status" | "catatan" | "verified", value: any) => {
    setOpnameStatusList(prev => ({
      ...prev,
      [kode]: {
        ...prev[kode],
        [field]: value
      }
    }));
  };

  // Submit Stock Opname session
  const submitStockOpname = () => {
    const today = new Date().toISOString().split("T")[0];
    
    // Update items condition and last_opname date
    setItems(prevItems => prevItems.map(item => {
      if (item.room_id === opnameRoomId && opnameStatusList[item.kode_barang]) {
        const updateData = opnameStatusList[item.kode_barang];
        return {
          ...item,
          status: updateData.status,
          terakhir_opname: today
        };
      }
      return item;
    }));

    setIsOpnameStarted(false);
    alert("Berhasil menyimpan Stock Opname! Status seluruh aset ruangan telah diperbarui di database.");
  };

  // Handle initiating mutations
  const handleCreateMutation = (e: React.FormEvent) => {
    e.preventDefault();
    const itemToMutate = items.find(i => i.kode_barang === mutationItemCode);
    if (!itemToMutate) {
      alert("Error: Kode barang tidak ditemukan di sistem!");
      return;
    }

    if (itemToMutate.room_id === mutationDestRoomId) {
      alert("Error: Ruangan asal dan ruangan tujuan tidak boleh sama!");
      return;
    }

    const newMutation: Mutation = {
      id: mutations.length + 1,
      kode_barang: mutationItemCode,
      nama_barang: itemToMutate.nama_barang,
      room_asal_id: itemToMutate.room_id,
      room_tujuan_id: Number(mutationDestRoomId),
      status: "Pending",
      alasan: mutationReason,
      created_at: new Date().toISOString().split("T")[0]
    };

    setMutations(prev => [newMutation, ...prev]);
    setMutationItemCode("");
    setMutationReason("");
    setMutationSuccessMsg("Permohonan mutasi barang berhasil diajukan ke Koordinator Program Studi.");
    setTimeout(() => setMutationSuccessMsg(""), 5000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Title Header with Modern Glassmorphism layout */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 dark:from-indigo-950 dark:to-violet-950 p-8 rounded-3xl text-white shadow-xl">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            PJ Ruangan / Laboran
          </div>
          <h1 id="dashboard-title" className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Sistem Kelola Inventaris & Aset
          </h1>
          <p className="text-indigo-100 max-w-2xl text-sm sm:text-base">
            SIPRABU FT UNS — Monitor status ruangan, verifikasi stock opname berkala, dan validasi laporan kerusakan barang secara real-time.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-white via-indigo-400 to-indigo-900 pointer-events-none"></div>
      </div>

      {/* Metric Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1: Ruangan Diampu */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md flex items-center gap-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl text-indigo-600 dark:text-indigo-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Ruangan Dikelola</p>
            <p id="metric-rooms" className="text-2xl font-bold text-neutral-950 dark:text-white mt-1">{totalRoomsManaged}</p>
          </div>
        </div>

        {/* KPI 2: Total Aset */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md flex items-center gap-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl text-emerald-600 dark:text-emerald-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Aset di-Monitor</p>
            <p id="metric-assets" className="text-2xl font-bold text-neutral-950 dark:text-white mt-1">{totalAssetsManaged}</p>
          </div>
        </div>

        {/* KPI 3: Laporan Kerusakan Pending */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md flex items-center gap-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/50 rounded-xl text-amber-600 dark:text-amber-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Laporan Pending</p>
            <div className="flex items-center gap-2 mt-1">
              <span id="metric-reports" className="text-2xl font-bold text-neutral-950 dark:text-white">{pendingReportsCount}</span>
              {pendingReportsCount > 0 && (
                <span className="inline-flex px-1.5 py-0.5 bg-rose-100 text-rose-700 text-xxs font-bold rounded-md animate-bounce">Perlu Tindakan</span>
              )}
            </div>
          </div>
        </div>

        {/* KPI 4: Mutasi Pending */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md flex items-center gap-4">
          <div className="p-3 bg-violet-50 dark:bg-violet-950/50 rounded-xl text-violet-600 dark:text-violet-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Mutasi Pending</p>
            <p id="metric-mutations" className="text-2xl font-bold text-neutral-950 dark:text-white mt-1">{activeMutationsCount}</p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="border-b border-neutral-200 dark:border-neutral-800">
        <nav className="flex space-x-8 overflow-x-auto" aria-label="Tabs">
          <button
            id="tab-overview"
            onClick={() => setActiveTab("overview")}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap cursor-pointer transition-all duration-200 ${
              activeTab === "overview"
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300 dark:text-neutral-400 dark:hover:text-neutral-300"
            }`}
          >
            Ringkasan
          </button>
          <button
            id="tab-rooms"
            onClick={() => setActiveTab("rooms")}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap cursor-pointer transition-all duration-200 ${
              activeTab === "rooms"
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300 dark:text-neutral-400 dark:hover:text-neutral-300"
            }`}
          >
            Kelola Ruangan & Aset
          </button>
          <button
            id="tab-opname"
            onClick={() => setActiveTab("opname")}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap cursor-pointer transition-all duration-200 ${
              activeTab === "opname"
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300 dark:text-neutral-400 dark:hover:text-neutral-300"
            }`}
          >
            Stock Opname
          </button>
          <button
            id="tab-reports"
            onClick={() => setActiveTab("reports")}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap cursor-pointer transition-all duration-200 ${
              activeTab === "reports"
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300 dark:text-neutral-400 dark:hover:text-neutral-300"
            }`}
          >
            Validasi Laporan Kerusakan
          </button>
          <button
            id="tab-mutations"
            onClick={() => setActiveTab("mutations")}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap cursor-pointer transition-all duration-200 ${
              activeTab === "mutations"
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300 dark:text-neutral-400 dark:hover:text-neutral-300"
            }`}
          >
            Mutasi Barang
          </button>
        </nav>
      </div>

      {/* --- TAB CONTENT AREA --- */}
      <div className="transition-all duration-300">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Welcome/Information Card */}
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">Tugas Utama PJ Ruangan</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed mb-4">
                  Sebagai PJ Ruangan (Laboran), Anda bertanggung jawab atas keberadaan dan kondisi aset fisik di ruang laboratorium yang Anda kelola. Lakukan stock opname secara periodik dan pastikan laporan kerusakan dari mahasiswa/dosen divalidasi dengan benar sebelum masuk ke tahap perbaikan.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center">1</span>
                    <div>
                      <h4 className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">Lakukan Stock Opname</h4>
                      <p className="text-xxs text-neutral-500">Secara berkala sebulan sekali atau menjelang UTS/UAS.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center">2</span>
                    <div>
                      <h4 className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">Verifikasi Pengaduan</h4>
                      <p className="text-xxs text-neutral-500">Cek fisik aset yang dilaporkan mahasiswa sebelum disetujui.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pending Laporan Kerusakan Preview */}
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Laporan Kerusakan Terbaru</h3>
                  <button onClick={() => setActiveTab("reports")} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">Semua Laporan &rarr;</button>
                </div>
                <div className="space-y-4">
                  {reports.slice(0, 2).map((report) => (
                    <div key={report.id} className="p-4 border border-neutral-100 dark:border-neutral-800 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-all flex justify-between items-start gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">{report.kode_barang}</span>
                          <span className="text-xxs text-neutral-400">&bull;</span>
                          <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">{report.nama_barang}</span>
                        </div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">{report.deskripsi_kerusakan}</p>
                        <div className="mt-2.5 flex items-center gap-3 text-xxs text-neutral-400">
                          <span>Pelapor: {report.pelapor_nama}</span>
                          <span>&bull;</span>
                          <span>Tanggal: {report.created_at}</span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 text-xxs font-semibold rounded-full ${
                        report.status === "Pending" ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400" :
                        report.status === "Validated" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400" : "bg-neutral-100 text-neutral-700"
                      }`}>
                        {report.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Room Overview Sidebar */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">Kondisi Aset per Ruangan</h3>
                <div className="space-y-4">
                  {rooms.map(room => {
                    const roomItems = items.filter(i => i.room_id === room.id);
                    const baikCount = roomItems.filter(i => i.status === "Baik").length;
                    const rusakCount = roomItems.filter(i => i.status === "Rusak Ringan" || i.status === "Rusak Berat").length;
                    const hilangCount = roomItems.filter(i => i.status === "Hilang").length;
                    
                    return (
                      <div key={room.id} className="space-y-2">
                        <div className="flex justify-between items-center text-xs font-semibold">
                          <span className="text-neutral-800 dark:text-neutral-200 truncate max-w-[180px]">{room.nama_ruangan}</span>
                          <span className="text-neutral-400">{roomItems.length} Aset</span>
                        </div>
                        <div className="h-2 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden flex">
                          <div className="h-full bg-emerald-500" style={{ width: `${(baikCount/roomItems.length)*100}%` }} title={`Baik: ${baikCount}`}></div>
                          <div className="h-full bg-amber-500" style={{ width: `${(rusakCount/roomItems.length)*100}%` }} title={`Rusak: ${rusakCount}`}></div>
                          <div className="h-full bg-rose-500" style={{ width: `${(hilangCount/roomItems.length)*100}%` }} title={`Hilang: ${hilangCount}`}></div>
                        </div>
                        <div className="flex items-center gap-3 text-xxs text-neutral-400">
                          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> {baikCount} Baik</span>
                          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span> {rusakCount} Rusak</span>
                          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span> {hilangCount} Hilang</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MANAGE ROOMS & ASSETS */}
        {activeTab === "rooms" && (
          <div className="space-y-6">
            {/* Filter controls panel */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                <div className="w-full sm:w-64">
                  <label className="block text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-2">Pilih Ruangan</label>
                  <select
                    id="select-room"
                    value={selectedRoomId}
                    onChange={(e) => setSelectedRoomId(Number(e.target.value))}
                    className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-neutral-950 dark:text-white"
                  >
                    {rooms.map(room => (
                      <option key={room.id} value={room.id}>
                        {room.kode_ruangan} - {room.nama_ruangan}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="w-full sm:w-48">
                  <label className="block text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-2">Filter Kondisi</label>
                  <select
                    id="select-condition"
                    value={filterCondition}
                    onChange={(e) => setFilterCondition(e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-neutral-950 dark:text-white"
                  >
                    <option value="All">Semua Kondisi</option>
                    <option value="Baik">Baik</option>
                    <option value="Rusak Ringan">Rusak Ringan</option>
                    <option value="Rusak Berat">Rusak Berat</option>
                    <option value="Hilang">Hilang</option>
                  </select>
                </div>
              </div>

              {/* Search input */}
              <div className="w-full md:w-80">
                <label className="block text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-2">Cari Barang</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <input
                    id="search-asset"
                    type="text"
                    placeholder="Nama barang atau kode..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 pl-10 pr-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-neutral-950 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Room asset list table */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-neutral-150 dark:border-neutral-800 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-neutral-900 dark:text-white">{currentRoomName}</h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Kode Ruangan: <span className="font-mono text-indigo-600 dark:text-indigo-400">{currentRoomCode}</span></p>
                </div>
                <button
                  onClick={() => startStockOpname(selectedRoomId)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Mulai Stock Opname
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-neutral-50 dark:bg-neutral-800/40 text-neutral-400 dark:text-neutral-500 text-xs font-semibold uppercase tracking-wider border-b border-neutral-200 dark:border-neutral-800">
                      <th className="px-6 py-4">Kode Barang</th>
                      <th className="px-6 py-4">Nama Barang</th>
                      <th className="px-6 py-4">Kategori</th>
                      <th className="px-6 py-4">Kondisi</th>
                      <th className="px-6 py-4">Terakhir Diperiksa</th>
                      <th className="px-6 py-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-sm">
                    {filteredItems.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-neutral-400 dark:text-neutral-500">
                          Tidak ada aset terdaftar yang cocok dengan kriteria filter.
                        </td>
                      </tr>
                    ) : (
                      filteredItems.map((item) => (
                        <tr key={item.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/20 transition-all">
                          <td className="px-6 py-4 font-mono font-bold text-indigo-600 dark:text-indigo-400 text-xs">{item.kode_barang}</td>
                          <td className="px-6 py-4 text-neutral-900 dark:text-white font-medium">{item.nama_barang}</td>
                          <td className="px-6 py-4 text-neutral-500 dark:text-neutral-400">{item.kategori}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                              item.status === "Baik" ? "bg-emerald-55 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400" :
                              item.status === "Rusak Ringan" ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400" :
                              item.status === "Rusak Berat" ? "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-450 dark:text-rose-400" :
                              "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-400"
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-neutral-500 dark:text-neutral-400">{item.terakhir_opname || "Belum Pernah"}</td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => setViewingItem(item)}
                              className="px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded transition-all cursor-pointer"
                            >
                              Lihat QR & Detail
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: STOCK OPNAME SESSION */}
        {activeTab === "opname" && (
          <div className="space-y-6">
            {!isOpnameStarted ? (
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 shadow-sm text-center max-w-xl mx-auto space-y-6">
                <div className="mx-auto w-12 h-12 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Mulai Sesi Stock Opname</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                    Sesi stock opname digunakan untuk melakukan verifikasi fisik secara menyeluruh atas aset-aset yang ada di suatu ruangan. Silakan pilih ruangan untuk memulai verifikasi.
                  </p>
                </div>
                <div>
                  <select
                    id="opname-room-select"
                    value={opnameRoomId}
                    onChange={(e) => setOpnameRoomId(Number(e.target.value))}
                    className="w-full max-w-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-neutral-950 dark:text-white"
                  >
                    {rooms.map(room => (
                      <option key={room.id} value={room.id}>
                        {room.kode_ruangan} - {room.nama_ruangan}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <button
                    id="btn-start-opname"
                    onClick={() => startStockOpname(opnameRoomId)}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold shadow-md transition-all cursor-pointer"
                  >
                    Mulai Verifikasi Ruangan
                  </button>
                </div>
              </div>
            ) : (
              // Active Opname Sheet Layout
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4 gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-400 text-xxs font-semibold rounded-full mb-1">
                      Sesi Stock Opname Aktif
                    </div>
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                      {rooms.find(r => r.id === opnameRoomId)?.nama_ruangan}
                    </h3>
                    <p className="text-xs text-neutral-450 dark:text-neutral-500">Kode Ruangan: {rooms.find(r => r.id === opnameRoomId)?.kode_ruangan}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsOpnameStarted(false)}
                      className="px-4 py-2 border border-neutral-200 dark:border-neutral-850 hover:bg-neutral-55 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-300 transition-all cursor-pointer"
                    >
                      Batalkan
                    </button>
                    <button
                      id="btn-submit-opname"
                      onClick={submitStockOpname}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-550 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
                    >
                      Simpan & Selesaikan
                    </button>
                  </div>
                </div>

                {/* Checklist Grid */}
                <div className="space-y-4">
                  {items.filter(item => item.room_id === opnameRoomId).map(item => {
                    const localData = opnameStatusList[item.kode_barang] || { status: item.status, catatan: "", verified: false };
                    return (
                      <div
                        key={item.id}
                        className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                          localData.verified
                            ? "bg-indigo-50/20 border-indigo-200 dark:bg-indigo-950/10 dark:border-indigo-900/60"
                            : "bg-white border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800"
                        }`}
                      >
                        {/* Left: Asset Identifier and verification check */}
                        <div className="flex items-start gap-4">
                          <input
                            type="checkbox"
                            checked={localData.verified}
                            onChange={(e) => handleOpnameItemChange(item.kode_barang, "verified", e.target.checked)}
                            className="mt-1 h-4.5 w-4.5 text-indigo-600 border-neutral-300 rounded focus:ring-indigo-500"
                          />
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">{item.kode_barang}</span>
                              <span className="text-sm font-semibold text-neutral-900 dark:text-white">{item.nama_barang}</span>
                            </div>
                            <p className="text-xs text-neutral-450 dark:text-neutral-550">{item.spesifikasi}</p>
                            <div className="mt-2 text-xxs text-neutral-400">
                              Kondisi awal di sistem: <span className="font-semibold text-neutral-500 dark:text-neutral-400">{item.status}</span>
                            </div>
                          </div>
                        </div>

                        {/* Right: State update fields */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-shrink-0">
                          <div>
                            <label className="block text-xxs font-bold text-neutral-400 uppercase tracking-wider mb-1">Kondisi Aktual</label>
                            <select
                              value={localData.status}
                              onChange={(e) => handleOpnameItemChange(item.kode_barang, "status", e.target.value as Item["status"])}
                              className="bg-neutral-55 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-2.5 py-1.5 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 text-neutral-950 dark:text-white"
                            >
                              <option value="Baik">Baik</option>
                              <option value="Rusak Ringan">Rusak Ringan</option>
                              <option value="Rusak Berat">Rusak Berat</option>
                              <option value="Hilang">Hilang</option>
                            </select>
                          </div>
                          
                          <div className="w-full sm:w-64">
                            <label className="block text-xxs font-bold text-neutral-400 uppercase tracking-wider mb-1">Catatan Tambahan</label>
                            <input
                              type="text"
                              value={localData.catatan}
                              onChange={(e) => handleOpnameItemChange(item.kode_barang, "catatan", e.target.value)}
                              placeholder="Kerusakan kecil, debu, dll..."
                              className="w-full bg-neutral-55 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-2.5 py-1.5 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 text-neutral-950 dark:text-white"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: VALIDATE DAMAGE REPORTS */}
        {activeTab === "reports" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">Validasi Laporan Kerusakan Barang</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-6">
                Daftar laporan kerusakan aset yang di-submit oleh Mahasiswa atau Dosen melalui scanning QR Code. Sebagai PJ Ruangan, lakukan pengecekan fisik barang lalu klik <strong>Validasi</strong> untuk meneruskan laporan ke program studi, atau <strong>Tolak</strong> jika laporan tidak valid.
              </p>

              <div className="space-y-6">
                {reports.filter(r => r.status === "Pending").length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl text-neutral-400 dark:text-neutral-500">
                    Tidak ada laporan kerusakan baru yang perlu divalidasi.
                  </div>
                ) : (
                  reports.filter(r => r.status === "Pending").map((report) => (
                    <div
                      key={report.id}
                      className="p-5 border border-neutral-200 dark:border-neutral-800 rounded-2xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-neutral-50/30 dark:bg-neutral-900/40 hover:border-neutral-350 transition-all"
                    >
                      <div className="space-y-3 max-w-3xl">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2 py-0.5 bg-indigo-55 dark:bg-indigo-950/60 text-indigo-750 dark:text-indigo-400 text-xxs font-bold rounded font-mono uppercase">
                            {report.kode_laporan}
                          </span>
                          <span className="text-xxs text-neutral-400">&bull;</span>
                          <span className="text-xs font-mono font-bold text-neutral-700 dark:text-neutral-300">{report.kode_barang}</span>
                          <span className="text-xxs text-neutral-400">&bull;</span>
                          <span className="text-xs font-semibold text-neutral-850 dark:text-neutral-200">{report.nama_barang}</span>
                        </div>
                        
                        <p className="text-sm text-neutral-700 dark:text-neutral-350 leading-relaxed font-medium">
                          &ldquo;{report.deskripsi_kerusakan}&rdquo;
                        </p>

                        <div className="flex flex-wrap gap-4 text-xxs text-neutral-400 dark:text-neutral-500 font-semibold uppercase tracking-wider">
                          <span>Pelapor: <span className="text-neutral-600 dark:text-neutral-400">{report.pelapor_nama} ({report.pelapor_kontak})</span></span>
                          <span>&bull;</span>
                          <span>Ruangan: <span className="text-neutral-600 dark:text-neutral-400">{rooms.find(r => r.id === report.room_id)?.nama_ruangan}</span></span>
                          <span>&bull;</span>
                          <span>Tanggal Masuk: <span className="text-neutral-600 dark:text-neutral-400">{report.created_at}</span></span>
                        </div>
                      </div>

                      {/* Call-to-action buttons */}
                      <div className="flex gap-2.5 w-full lg:w-auto flex-shrink-0">
                        <button
                          onClick={() => setRejectingReportId(report.id)}
                          className="w-full lg:w-auto px-4 py-2 border border-rose-250 dark:border-rose-900/60 text-rose-650 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-955/20 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          Tolak
                        </button>
                        <button
                          onClick={() => handleValidateReport(report.id)}
                          className="w-full lg:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-550 text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow-emerald-500/10 cursor-pointer"
                        >
                          Validasi & Teruskan
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Validation History Logs */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider mb-4">Riwayat Validasi Laporan</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-neutral-50 dark:bg-neutral-800/40 text-neutral-400 font-semibold border-b border-neutral-100 dark:border-neutral-800">
                      <th className="px-4 py-3">Kode Laporan</th>
                      <th className="px-4 py-3">Kode Barang</th>
                      <th className="px-4 py-3">Nama Barang</th>
                      <th className="px-4 py-3">Pelapor</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Catatan PJ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {reports.filter(r => r.status !== "Pending").map((report) => (
                      <tr key={report.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/20 text-neutral-500 dark:text-neutral-450">
                        <td className="px-4 py-3 font-mono font-bold text-neutral-700 dark:text-neutral-300">{report.kode_laporan}</td>
                        <td className="px-4 py-3 font-mono">{report.kode_barang}</td>
                        <td className="px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">{report.nama_barang}</td>
                        <td className="px-4 py-3">{report.pelapor_nama}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded font-semibold ${
                            report.status === "Validated" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400" :
                            report.status === "Rejected" ? "bg-rose-50 text-rose-700 dark:bg-rose-955/20 dark:text-rose-400" : "bg-neutral-50 text-neutral-600"
                          }`}>
                            {report.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 italic">{report.catatan_pj}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: MUTATIONS */}
        {activeTab === "mutations" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Create mutation request form */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Ajukan Mutasi Aset</h3>
                <p className="text-xs text-neutral-550 mt-1">Buat usulan pemindahan barang antar ruangan laboratorium.</p>
              </div>

              {mutationSuccessMsg && (
                <div className="p-3 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 text-xs font-semibold rounded-xl border border-emerald-200 dark:border-emerald-900">
                  {mutationSuccessMsg}
                </div>
              )}

              <form onSubmit={handleCreateMutation} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-wider mb-2">Kode Barang</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: BRG-100233"
                    value={mutationItemCode}
                    onChange={(e) => setMutationItemCode(e.target.value)}
                    className="w-full bg-neutral-55 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-neutral-950 dark:text-white"
                  />
                  <p className="text-xxs text-neutral-450 dark:text-neutral-500 mt-1">Masukkan kode unik aset yang terdaftar di ruangan asal Anda.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-wider mb-2">Ruangan Tujuan</label>
                  <select
                    value={mutationDestRoomId}
                    onChange={(e) => setMutationDestRoomId(Number(e.target.value))}
                    className="w-full bg-neutral-55 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-neutral-950 dark:text-white"
                  >
                    {rooms.map(room => (
                      <option key={room.id} value={room.id}>
                        {room.kode_ruangan} - {room.nama_ruangan}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-wider mb-2">Alasan Pemindahan</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Tuliskan justifikasi detail pemindahan aset..."
                    value={mutationReason}
                    onChange={(e) => setMutationReason(e.target.value)}
                    className="w-full bg-neutral-55 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-neutral-950 dark:text-white"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-550 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  Ajukan Mutasi
                </button>
              </form>
            </div>

            {/* Mutation status table list */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm lg:col-span-2 space-y-4">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Daftar Usulan Mutasi</h3>
              <p className="text-xs text-neutral-400">Usulan mutasi memerlukan persetujuan dari Koordinator Program Studi sebelum dapat dieksekusi.</p>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-neutral-50 dark:bg-neutral-800/40 text-neutral-455 font-semibold border-b border-neutral-100 dark:border-neutral-800">
                      <th className="px-4 py-3">Barang</th>
                      <th className="px-4 py-3">Asal &rarr; Tujuan</th>
                      <th className="px-4 py-3">Alasan</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Diajukan Pada</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {mutations.map((mut) => {
                      const fromCode = rooms.find(r => r.id === mut.room_asal_id)?.kode_ruangan || "";
                      const toCode = rooms.find(r => r.id === mut.room_tujuan_id)?.kode_ruangan || "";
                      return (
                        <tr key={mut.id} className="hover:bg-neutral-55/20 text-neutral-500 dark:text-neutral-450">
                          <td className="px-4 py-3">
                            <p className="font-semibold text-neutral-700 dark:text-neutral-300">{mut.nama_barang}</p>
                            <p className="font-mono text-xxs text-indigo-500 font-bold">{mut.kode_barang}</p>
                          </td>
                          <td className="px-4 py-3 font-mono font-medium">
                            <span className="text-rose-500">{fromCode}</span>
                            <span className="mx-1">&rarr;</span>
                            <span className="text-emerald-550">{toCode}</span>
                          </td>
                          <td className="px-4 py-3 truncate max-w-[150px]" title={mut.alasan}>{mut.alasan}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded font-semibold ${
                              mut.status === "Pending" ? "bg-amber-50 text-amber-700 dark:bg-amber-955/20 dark:text-amber-400" :
                              mut.status === "Approved" ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400" :
                              mut.status === "Completed" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400" :
                              "bg-rose-50 text-rose-700 dark:bg-rose-955/20 dark:text-rose-450"
                            }`}>
                              {mut.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">{mut.created_at}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* --- MODAL 1: QR CODE & ASSET DETAILS --- */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-2xl max-w-lg w-full transition-all transform scale-100 flex flex-col">
            
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white flex justify-between items-center">
              <div>
                <h4 className="font-bold text-sm">QR Code & Informasi Aset</h4>
                <p className="text-xs text-indigo-100 font-mono">{viewingItem.kode_barang}</p>
              </div>
              <button
                onClick={() => setViewingItem(null)}
                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-lg cursor-pointer transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 overflow-y-auto">
              
              {/* Simulated physical asset QR Card for printing */}
              <div className="bg-white border-2 border-dashed border-neutral-300 p-6 rounded-2xl flex flex-col items-center justify-center text-center space-y-4 max-w-[260px] mx-auto shadow-sm">
                <div className="relative p-2.5 bg-white border border-neutral-200 rounded-lg">
                  {/* Generated simulated dynamic QR Code block */}
                  <div className="w-36 h-36 bg-neutral-950 flex flex-col items-center justify-center p-1 rounded">
                    {/* SVG mockup of QR code pattern */}
                    <svg className="w-full h-full text-white" viewBox="0 0 100 100" fill="currentColor">
                      <rect x="0" y="0" width="20" height="20" fill="black" />
                      <rect x="5" y="5" width="10" height="10" fill="white" />
                      <rect x="80" y="0" width="20" height="20" fill="black" />
                      <rect x="85" y="5" width="10" height="10" fill="white" />
                      <rect x="0" y="80" width="20" height="20" fill="black" />
                      <rect x="5" y="85" width="10" height="10" fill="white" />
                      <rect x="30" y="10" width="8" height="8" fill="black" />
                      <rect x="45" y="30" width="10" height="10" fill="black" />
                      <rect x="65" y="25" width="6" height="6" fill="black" />
                      <rect x="35" y="60" width="12" height="12" fill="black" />
                      <rect x="50" y="70" width="8" height="8" fill="black" />
                      <rect x="70" y="65" width="14" height="14" fill="black" />
                      <rect x="80" y="45" width="10" height="10" fill="black" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h5 className="text-xs font-extrabold text-neutral-900 uppercase tracking-tight">SIPRABU FT UNS</h5>
                  <p className="text-[10px] font-mono text-neutral-500 font-semibold">{viewingItem.kode_barang}</p>
                  <p className="text-[9px] text-neutral-400 mt-1 max-w-[200px] break-all">
                    http://localhost/programmed-inventarist/public/lapor/{viewingItem.kode_barang}
                  </p>
                </div>
              </div>

              {/* Asset Technical Specifications */}
              <div className="space-y-4">
                <h5 className="font-bold text-neutral-900 dark:text-white text-xs uppercase tracking-wider">Spesifikasi Teknis</h5>
                
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-neutral-400 block mb-0.5">Nama Aset</span>
                    <span className="text-neutral-800 dark:text-neutral-200 font-medium">{viewingItem.nama_barang}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block mb-0.5">Kategori</span>
                    <span className="text-neutral-800 dark:text-neutral-200 font-medium">{viewingItem.kategori}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block mb-0.5">Kondisi</span>
                    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full mt-0.5 ${
                      viewingItem.status === "Baik" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400" :
                      viewingItem.status === "Rusak Ringan" ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400" :
                      "bg-rose-100 text-rose-800 dark:bg-rose-955/40 dark:text-rose-400"
                    }`}>
                      {viewingItem.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block mb-0.5">Tanggal Pengadaan</span>
                    <span className="text-neutral-800 dark:text-neutral-200 font-medium">{viewingItem.tanggal_perolehan}</span>
                  </div>
                </div>

                <div className="bg-neutral-50 dark:bg-neutral-800/40 p-4 rounded-xl text-xs space-y-1">
                  <span className="text-neutral-400 font-semibold block uppercase tracking-wider text-[10px]">Spesifikasi Detail</span>
                  <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed font-mono">{viewingItem.spesifikasi}</p>
                </div>
              </div>

            </div>

            {/* Footer buttons */}
            <div className="px-6 py-4 bg-neutral-50 dark:bg-neutral-800/20 border-t border-neutral-100 dark:border-neutral-800 flex justify-end gap-2">
              <button
                onClick={() => {
                  alert(`Memulai cetak label QR Code untuk barang: ${viewingItem.kode_barang}`);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-550 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cetak Label QR
              </button>
              <button
                onClick={() => setViewingItem(null)}
                className="px-4 py-2 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Tutup
              </button>
            </div>
            
          </div>
        </div>
      )}

      {/* --- MODAL 2: REJECT REASON FORM --- */}
      {rejectingReportId !== null && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-2xl max-w-md w-full transition-all transform scale-100 flex flex-col">
            
            <div className="px-6 py-4 bg-rose-600 text-white flex justify-between items-center">
              <h4 className="font-bold text-sm">Tolak Laporan Pengaduan</h4>
              <button
                onClick={() => setRejectingReportId(null)}
                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-lg cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleRejectReportSubmit}>
              <div className="p-6 space-y-4">
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Tuliskan alasan penolakan secara jelas. Pelapor akan dapat melihat alasan penolakan di riwayat laporan mereka.
                </p>
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Alasan Penolakan</label>
                  <textarea
                    required
                    rows={4}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Contoh: Barang sudah dicek fisik dan dalam kondisi baik, kerusakan dikarenakan kesalahan software/user..."
                    className="w-full bg-neutral-55 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-3 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 text-neutral-950 dark:text-white"
                  ></textarea>
                </div>
              </div>

              <div className="px-6 py-4 bg-neutral-50 dark:bg-neutral-800/20 border-t border-neutral-100 dark:border-neutral-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectingReportId(null)}
                  className="px-4 py-2 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-650 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Tolak Laporan
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
