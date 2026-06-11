'use client';

import React, { useState, useEffect, useRef } from 'react';

interface ParsedBarang {
  kode_barang: string;
  no_urut_pendaft: number;
  nama_barang: string;
  merk_type: string;
  th_perolehan: number;
  kondisi: string;
  lokasi_ruangan: string;
}

export default function ImportBarang() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedBarang[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simulated User Auth Guard
  useEffect(() => {
    const checkUser = () => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('simulated_user');
        if (saved) {
          try {
            setCurrentUser(JSON.parse(saved));
          } catch (e) {}
        } else {
          setCurrentUser({
            name: "PJ Ruangan (Laboran)",
            email: "laboran@ft.uns.ac.id",
            role: "PJ_Ruangan",
          });
        }
      }
      setLoadingUser(false);
    };

    checkUser();
    window.addEventListener('simulated_user_change', checkUser);
    return () => window.removeEventListener('simulated_user_change', checkUser);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    setImportResult(null);
    setParsedData([]);
    setHeaders([]);

    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'csv') {
      setErrorMessage('Tipe file tidak valid. Silakan unggah file dengan format .csv');
      setCsvFile(null);
      return;
    }

    setCsvFile(file);

    // Read and parse CSV
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) {
        setErrorMessage('File CSV kosong atau tidak dapat dibaca.');
        return;
      }

      parseCSV(text);
    };
    reader.readAsText(file);
  };

  // Custom smart CSV parser supporting comma or semicolon separators
  const parseCSV = (text: string) => {
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length < 2) {
      setErrorMessage('File CSV harus berisi baris header dan minimal satu baris data.');
      return;
    }

    const firstLine = lines[0];
    // Detect separator (semi-colon vs comma)
    const semicolonCount = (firstLine.match(/;/g) || []).length;
    const commaCount = (firstLine.match(/,/g) || []).length;
    const separator = semicolonCount >= commaCount ? ';' : ',';

    // Parse header columns
    const rawHeaders = splitCSVLine(firstLine, separator).map(h => h.trim().replace(/^["']|["']$/g, ''));
    setHeaders(rawHeaders);

    // Dynamic header mapping to expected schema keys
    // Schema: kode_barang, no_urut_pendaft, nama_barang, merk_type, th_perolehan, kondisi, lokasi_ruangan
    const headerIndices: { [key: string]: number } = {
      kode_barang: -1,
      no_urut_pendaft: -1,
      nama_barang: -1,
      merk_type: -1,
      th_perolehan: -1,
      kondisi: -1,
      lokasi_ruangan: -1,
    };

    rawHeaders.forEach((header, index) => {
      const name = header.toLowerCase();
      if (name.includes('kode') || name.includes('sakti')) headerIndices.kode_barang = index;
      else if (name.includes('nup') || name.includes('urut') || name.includes('pendaft')) headerIndices.no_urut_pendaft = index;
      else if (name.includes('nama') || name.includes('barang')) headerIndices.nama_barang = index;
      else if (name.includes('merk') || name.includes('tipe') || name.includes('type')) headerIndices.merk_type = index;
      else if (name.includes('tahun') || name.includes('perolehan') || name.includes('th')) headerIndices.th_perolehan = index;
      else if (name.includes('kondisi') || name.includes('status')) headerIndices.kondisi = index;
      else if (name.includes('ruangan') || name.includes('lokasi') || name.includes('ruang')) headerIndices.lokasi_ruangan = index;
    });

    // Validate essential columns existence
    const missing: string[] = [];
    if (headerIndices.kode_barang === -1) missing.push('Kode Barang');
    if (headerIndices.no_urut_pendaft === -1) missing.push('NUP');
    if (headerIndices.nama_barang === -1) missing.push('Nama Barang');
    if (headerIndices.lokasi_ruangan === -1) missing.push('Lokasi/Ruangan');

    if (missing.length > 0) {
      setErrorMessage(`Format CSV tidak sesuai template. Kolom penting berikut tidak terdeteksi: ${missing.join(', ')}`);
      return;
    }

    const items: ParsedBarang[] = [];

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const cols = splitCSVLine(lines[i], separator).map(c => c.trim().replace(/^["']|["']$/g, ''));
      if (cols.length < Math.max(...Object.values(headerIndices)) + 1) {
        continue; // Skip lines with insufficient columns
      }

      const getColVal = (index: number, fallback: string = '') => {
        return index !== -1 && index < cols.length ? cols[index] : fallback;
      };

      const rawKode = getColVal(headerIndices.kode_barang);
      const rawNup = getColVal(headerIndices.no_urut_pendaft);
      const rawNama = getColVal(headerIndices.nama_barang);
      const rawMerk = getColVal(headerIndices.merk_type, 'N/A');
      const rawTahun = getColVal(headerIndices.th_perolehan, new Date().getFullYear().toString());
      const rawKondisi = getColVal(headerIndices.kondisi, 'Baik');
      const rawRuangan = getColVal(headerIndices.lokasi_ruangan);

      items.push({
        kode_barang: rawKode,
        no_urut_pendaft: parseInt(rawNup) || 0,
        nama_barang: rawNama,
        merk_type: rawMerk,
        th_perolehan: parseInt(rawTahun) || new Date().getFullYear(),
        kondisi: rawKondisi,
        lokasi_ruangan: rawRuangan,
      });
    }

    setParsedData(items);
  };

  // Split helper respecting quoted values containing commas
  const splitCSVLine = (line: string, separator: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === separator && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  };

  const handleImportSubmit = async () => {
    if (parsedData.length === 0) return;

    setIsImporting(true);
    setErrorMessage(null);
    setImportResult(null);

    try {
      const res = await fetch('/api/barangs/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: parsedData }),
      });

      const data = await res.json();
      if (data.success) {
        setImportResult(data);
        // Clear file input
        if (fileInputRef.current) fileInputRef.current.value = '';
        setCsvFile(null);
        setParsedData([]);
      } else {
        setErrorMessage('Proses impor gagal: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Terjadi kesalahan koneksi sistem saat memproses transaksi impor.');
    } finally {
      setIsImporting(false);
    }
  };

  // Download a demo template helper
  const handleDownloadTemplate = () => {
    const csvContent =
      "Kode Barang;NUP;Nama Barang;Merk Type;Tahun Perolehan;Kondisi;Lokasi Ruangan\n" +
      "1.02.01.01.004;4;Monitor LG IPS 24 Inch;24MP400 Full HD;2024;Baik;LAB-RPL-301\n" +
      "1.02.01.01.005;5;Printer Epson L3210;L3210 EcoTank;2023;Baik;LAB-JAS-302\n" +
      "1.02.01.01.006;6;Switch Cisco 16 Port;SG95-16 Compact;2022;Rusak Ringan;LAB-KOD-303";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_sakti_bmn.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isAdminBMN =
    currentUser &&
    currentUser.role === 'Admin Fakultas' &&
    currentUser.email.endsWith('@staff.uns.ac.id');

  if (loadingUser) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAdminBMN) {
    return (
      <div className="max-w-md mx-auto mt-12 bg-[var(--bg-panel)] transition-colors duration-400 p-8 border border-red-200 dark:border-red-900/40 rounded-3xl text-center shadow-md">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-950/40 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-[var(--text-main)] transition-colors duration-400 mb-2">Akses Ditolak</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-450 leading-relaxed mb-6">
          Halaman ini dibatasi hanya untuk <strong>Admin Fakultas</strong> dengan email resmi <strong>@staff.uns.ac.id</strong>. Silakan ubah simulasi role di sidebar untuk mengakses halaman ini.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Title Header */}
      <div className="relative overflow-hidden bg-[var(--bg-banner)] transition-colors duration-400 text-white p-8 rounded-3xl shadow-lg">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Admin Fakultas Area
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Import SAKTI CSV</h1>
          <p className="text-indigo-100 max-w-xl text-sm">
            Lakukan registrasi aset secara massal menggunakan file CSV hasil ekspor data SAKTI BMN. Sistem akan memvalidasi data dan menggunakan transaksi database terenkripsi.
          </p>
        </div>
      </div>

      {/* Main Action Card */}
      <div className="bg-[var(--bg-panel)] transition-colors duration-400 rounded-3xl border border-[var(--border-panel)] shadow-sm p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-neutral-100 border-[var(--border-panel)] pb-5 mb-6 gap-4">
          <div>
            <h2 className="text-lg font-bold text-[var(--text-main)] transition-colors duration-400">Impor Massal Aset</h2>
            <p className="text-xs text-[var(--text-muted)] mt-1">Unggah file .csv dan periksa datanya sebelum disimpan ke server database.</p>
          </div>
          <button
            onClick={handleDownloadTemplate}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-bold text-neutral-600 dark:text-neutral-300 hover:bg-[var(--bg-app)] transition-colors duration-400 transition-all cursor-pointer"
          >
            <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Unduh Template CSV
          </button>
        </div>

        {/* Upload Zone */}
        <div className="border-2 border-dashed border-[var(--border-panel)] rounded-3xl p-8 text-center bg-[var(--bg-app)] transition-colors duration-400/40 bg-[var(--bg-app)]/20 hover:bg-neutral-55 dark:hover:bg-neutral-950/40 transition-all">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl flex items-center justify-center mx-auto text-indigo-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-neutral-800 text-[var(--text-main)]">
                {csvFile ? `File Terpilih: ${csvFile.name}` : 'Pilih file SAKTI CSV Anda'}
              </p>
              <p className="text-xs text-neutral-450 mt-1">Hanya format dokumen .csv yang didukung</p>
            </div>
            <div>
              <input
                type="file"
                accept=".csv"
                id="csv-file-upload"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-350 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cari File
              </button>
            </div>
          </div>
        </div>

        {/* Feedback Messages */}
        {errorMessage && (
          <div className="mt-6 p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-700 rounded-2xl text-xs font-semibold flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {errorMessage}
          </div>
        )}

        {importResult && (
          <div className="mt-6 p-5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-250 dark:border-emerald-900/40 text-emerald-800 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {importResult.message}
            </div>
            <div className="text-xs space-y-1 pl-7">
              <p>&bull; Berhasil di-insert: <strong>{importResult.summary.success} item</strong></p>
              <p>&bull; Duplikat dilewati: <strong>{importResult.summary.duplicates} item</strong></p>
              {importResult.summary.skipped.length > 0 && (
                <div className="mt-2.5">
                  <p className="font-bold mb-1">Catatan/Data Dilewati:</p>
                  <ul className="list-disc pl-4 space-y-0.5 text-xxs text-[var(--text-muted)] font-mono">
                    {importResult.summary.skipped.slice(0, 10).map((skip: string, sIdx: number) => (
                      <li key={sIdx}>{skip}</li>
                    ))}
                    {importResult.summary.skipped.length > 10 && (
                      <li>...dan {importResult.summary.skipped.length - 10} data lainnya</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Data Preview Area */}
        {parsedData.length > 0 && (
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-800 text-[var(--text-main)] uppercase tracking-wider">
                Pratinjau Data (Menampilkan {Math.min(parsedData.length, 5)} dari {parsedData.length} baris)
              </h3>
            </div>
            
            <div className="border border-neutral-150 border-[var(--border-panel)] rounded-2xl overflow-hidden shadow-inner bg-white bg-[var(--bg-app)]">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-neutral-50 bg-[var(--bg-panel)] border-b border-[var(--border-panel)] text-neutral-450 dark:text-[var(--text-muted)] font-bold uppercase tracking-wider">
                      <th className="px-4 py-3">Kode Barang</th>
                      <th className="px-4 py-3">NUP</th>
                      <th className="px-4 py-3">Nama Barang</th>
                      <th className="px-4 py-3">Merk Type</th>
                      <th className="px-4 py-3">Tahun</th>
                      <th className="px-4 py-3">Kondisi</th>
                      <th className="px-4 py-3">Lokasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 font-medium">
                    {parsedData.slice(0, 5).map((row, index) => (
                      <tr key={index} className="hover:bg-[var(--bg-app)] transition-colors duration-400/50 dark:hover:bg-neutral-900/30">
                        <td className="px-4 py-3 font-mono font-bold text-indigo-600">{row.kode_barang}</td>
                        <td className="px-4 py-3 font-mono">{row.no_urut_pendaft}</td>
                        <td className="px-4 py-3 text-[var(--text-main)] transition-colors duration-400">{row.nama_barang}</td>
                        <td className="px-4 py-3 text-[var(--text-muted)] transition-colors duration-400">{row.merk_type}</td>
                        <td className="px-4 py-3">{row.th_perolehan}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xxs font-bold ${
                            row.kondisi === 'Baik' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/20'
                          }`}>
                            {row.kondisi}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[var(--text-muted)] transition-colors duration-400 font-mono">{row.lokasi_ruangan}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={handleImportSubmit}
                disabled={isImporting}
                className="inline-flex justify-center items-center py-2.5 px-6 border border-transparent shadow-sm text-sm font-bold rounded-xl text-white bg-indigo-650 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition-all cursor-pointer shadow-indigo-100 hover:shadow"
              >
                {isImporting ? 'Mengimpor data...' : `Konfirmasi Impor ${parsedData.length} Aset`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
