'use client';

import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface Barang {
  id: number;
  kode_barang: string;
  no_urut_pendaft: number;
  nama_barang: string;
  merk_type: string;
  th_perolehan: number;
  kondisi: string;
  lokasi_ruangan: string;
  status_bmn: string;
}

export default function MasterBarang() {
  const [barangs, setBarangs] = useState<Barang[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State for SAKTI BMN code
  const [kodePart1, setKodePart1] = useState('');
  const [kodePart2, setKodePart2] = useState('');
  const [kodePart3, setKodePart3] = useState('');
  const [kodePart4, setKodePart4] = useState('');
  const [kodePart5, setKodePart5] = useState('');
  
  const [nup, setNup] = useState('');
  const [namaBarang, setNamaBarang] = useState('');
  const [merkType, setMerkType] = useState('');
  const [thPerolehan, setThPerolehan] = useState(new Date().getFullYear().toString());
  const [kondisi, setKondisi] = useState('Baik');
  const [lokasiRuangan, setLokasiRuangan] = useState('');

  // Modal State
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedBarang, setSelectedBarang] = useState<Barang | null>(null);
  const [origin, setOrigin] = useState('http://localhost:3000');
  const [zoom, setZoom] = useState(100);

  const handleDownloadQR = () => {
    if (!selectedBarang) return;
    const svgElement = document.querySelector('#qr-print-area svg') as SVGElement;
    if (!svgElement) return;

    try {
      const svgString = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const URL = window.URL || window.webkitURL || window as any;
      const blobURL = URL.createObjectURL(svgBlob);
      
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const context = canvas.getContext('2d');
        if (context) {
          context.fillStyle = '#FFFFFF';
          context.fillRect(0, 0, 512, 512);
          context.drawImage(image, 0, 0, 512, 512);
          
          const png = canvas.toDataURL('image/png');
          const downloadLink = document.createElement('a');
          downloadLink.href = png;
          downloadLink.download = `QR_${selectedBarang.nama_barang.replace(/\s+/g, '_')}_${selectedBarang.kode_barang}.png`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        }
        URL.revokeObjectURL(blobURL);
      };
      image.src = blobURL;
    } catch (error) {
      console.error('Failed to download QR code image:', error);
      alert('Gagal mengunduh gambar QR Code.');
    }
  };

  const fetchBarangs = async () => {
    try {
      const res = await fetch('/api/barangs');
      const data = await res.json();
      if (data.success) {
        setBarangs(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch barangs:', error);
    }
  };

  useEffect(() => {
    fetchBarangs();
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  const handleNextInput = (e: React.ChangeEvent<HTMLInputElement>, maxLength: number, nextId: string | null) => {
    const value = e.target.value.replace(/\D/g, ''); // Allow only digits
    if (value.length <= maxLength) {
      switch (e.target.name) {
        case 'part1': setKodePart1(value); break;
        case 'part2': setKodePart2(value); break;
        case 'part3': setKodePart3(value); break;
        case 'part4': setKodePart4(value); break;
        case 'part5': setKodePart5(value); break;
      }
      
      // Auto-focus next box if maximum length is met
      if (value.length === maxLength && nextId) {
        const nextElement = document.getElementById(nextId);
        nextElement?.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, prevId: string | null) => {
    // Navigate backwards on Backspace if current box is empty
    if (e.key === 'Backspace' && e.currentTarget.value === '' && prevId) {
      const prevElement = document.getElementById(prevId);
      prevElement?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const kode_barang = `${kodePart1}.${kodePart2}.${kodePart3}.${kodePart4}.${kodePart5}`;
    
    // Strict SAKTI pattern validation
    if (!kode_barang.match(/^\d\.\d{2}\.\d{2}\.\d{2}\.\d{3}$/)) {
      alert("Format Kode Barang belum lengkap (X.XX.XX.XX.XXX)");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/barangs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kode_barang,
          no_urut_pendaft: parseInt(nup),
          nama_barang: namaBarang,
          merk_type: merkType,
          th_perolehan: parseInt(thPerolehan),
          kondisi,
          lokasi_ruangan: lokasiRuangan
        })
      });

      const data = await res.json();
      if (data.success) {
        alert('Data barang berhasil didaftarkan!');
        // Reset form
        setKodePart1(''); 
        setKodePart2(''); 
        setKodePart3(''); 
        setKodePart4(''); 
        setKodePart5('');
        setNup(''); 
        setNamaBarang(''); 
        setMerkType(''); 
        setLokasiRuangan('');
        setKondisi('Baik');
        setThPerolehan(new Date().getFullYear().toString());
        
        fetchBarangs();
      } else {
        alert('Gagal menyimpan: ' + data.error);
      }
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan sistem');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintQR = () => {
    if (!selectedBarang) return;
    window.print();
  };

  const handleCetakLabel = () => {
    if (!selectedBarang) return;
    window.print();
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Title Header with Modern Layout */}
      <div className="relative overflow-hidden bg-[var(--bg-banner)] transition-colors duration-400 text-white p-8 rounded-3xl shadow-lg">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Admin Fakultas Role
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Master Barang</h1>
          <p className="text-white/80 max-w-2xl text-sm sm:text-base">
            Kelola data barang milik negara, registrasi barang baru, dan cetak label QR Code secara langsung.
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="bg-[var(--bg-panel)] transition-colors duration-400 rounded-3xl border border-gray-200/80 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 border-b pb-3 mb-5">Registrasi Barang Baru</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            
            {/* Split Kode Barang Input */}
            <div className="sm:col-span-3">
              <label className="block text-sm font-semibold text-gray-700">
                Kode Barang (SAKTI Format) <span className="text-red-500">*</span>
              </label>
              <div className="mt-1.5 flex items-center space-x-1 sm:space-x-2">
                <input
                  id="part1"
                  name="part1"
                  type="text"
                  value={kodePart1}
                  onChange={(e) => handleNextInput(e, 1, 'part2')}
                  onKeyDown={(e) => handleKeyDown(e, null)}
                  maxLength={1}
                  pattern="[0-9]{1}"
                  inputMode="numeric"
                  className="w-12 text-center shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-xl py-2.5 border font-mono font-bold focus:outline-none"
                  placeholder="X"
                  required
                />
                <span className="text-gray-400 font-bold text-lg select-none">.</span>
                <input
                  id="part2"
                  name="part2"
                  type="text"
                  value={kodePart2}
                  onChange={(e) => handleNextInput(e, 2, 'part3')}
                  onKeyDown={(e) => handleKeyDown(e, 'part1')}
                  maxLength={2}
                  pattern="[0-9]{2}"
                  inputMode="numeric"
                  className="w-16 text-center shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-xl py-2.5 border font-mono font-bold focus:outline-none"
                  placeholder="XX"
                  required
                />
                <span className="text-gray-400 font-bold text-lg select-none">.</span>
                <input
                  id="part3"
                  name="part3"
                  type="text"
                  value={kodePart3}
                  onChange={(e) => handleNextInput(e, 2, 'part4')}
                  onKeyDown={(e) => handleKeyDown(e, 'part2')}
                  maxLength={2}
                  pattern="[0-9]{2}"
                  inputMode="numeric"
                  className="w-16 text-center shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-xl py-2.5 border font-mono font-bold focus:outline-none"
                  placeholder="XX"
                  required
                />
                <span className="text-gray-400 font-bold text-lg select-none">.</span>
                <input
                  id="part4"
                  name="part4"
                  type="text"
                  value={kodePart4}
                  onChange={(e) => handleNextInput(e, 2, 'part5')}
                  onKeyDown={(e) => handleKeyDown(e, 'part3')}
                  maxLength={2}
                  pattern="[0-9]{2}"
                  inputMode="numeric"
                  className="w-16 text-center shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-xl py-2.5 border font-mono font-bold focus:outline-none"
                  placeholder="XX"
                  required
                />
                <span className="text-gray-400 font-bold text-lg select-none">.</span>
                <input
                  id="part5"
                  name="part5"
                  type="text"
                  value={kodePart5}
                  onChange={(e) => handleNextInput(e, 3, 'nup_input')}
                  onKeyDown={(e) => handleKeyDown(e, 'part4')}
                  maxLength={3}
                  pattern="[0-9]{3}"
                  inputMode="numeric"
                  className="w-20 text-center shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-xl py-2.5 border font-mono font-bold focus:outline-none"
                  placeholder="XXX"
                  required
                />
              </div>
              <p className="mt-1 text-xs text-gray-400">Golongan.Bidang.Kelompok.SubKelompok.SubSubKelompok</p>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="nup_input" className="block text-sm font-semibold text-gray-700">
                No Urut Pendaftaran (NUP) <span className="text-red-500">*</span>
              </label>
              <div className="mt-1.5">
                <input
                  type="number"
                  id="nup_input"
                  value={nup}
                  onChange={(e) => setNup(e.target.value)}
                  required
                  min="1"
                  className="shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-xl px-3 py-2.5 border focus:outline-none"
                  placeholder="Contoh: 1"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-sm font-semibold text-gray-700">
                Nama Barang <span className="text-red-500">*</span>
              </label>
              <div className="mt-1.5">
                <input
                  type="text"
                  value={namaBarang}
                  onChange={(e) => setNamaBarang(e.target.value)}
                  required
                  className="shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-xl px-3 py-2.5 border focus:outline-none"
                  placeholder="Contoh: Laptop Asus Vivobook"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-sm font-semibold text-gray-700">
                Merk / Type <span className="text-red-500">*</span>
              </label>
              <div className="mt-1.5">
                <input
                  type="text"
                  value={merkType}
                  onChange={(e) => setMerkType(e.target.value)}
                  required
                  className="shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-xl px-3 py-2.5 border focus:outline-none"
                  placeholder="Contoh: Intel Core i7 / 16GB"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700">
                Tahun Perolehan <span className="text-red-500">*</span>
              </label>
              <div className="mt-1.5">
                <input
                  type="number"
                  value={thPerolehan}
                  onChange={(e) => setThPerolehan(e.target.value)}
                  required
                  min="1900"
                  max="2100"
                  className="shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-xl px-3 py-2.5 border focus:outline-none"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700">
                Lokasi Ruangan <span className="text-red-500">*</span>
              </label>
              <div className="mt-1.5">
                <input
                  type="text"
                  value={lokasiRuangan}
                  onChange={(e) => setLokasiRuangan(e.target.value)}
                  required
                  className="shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-xl px-3 py-2.5 border focus:outline-none"
                  placeholder="Contoh: Lab RPL"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700">
                Kondisi <span className="text-red-500">*</span>
              </label>
              <div className="mt-1.5">
                <select
                  value={kondisi}
                  onChange={(e) => setKondisi(e.target.value)}
                  className="shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-xl px-3 py-2.5 border bg-[var(--bg-panel)] transition-colors duration-400 focus:outline-none"
                >
                  <option value="Baik">Baik</option>
                  <option value="Rusak Ringan">Rusak Ringan</option>
                  <option value="Rusak Berat">Rusak Berat</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end border-t border-gray-150">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center py-2.5 px-6 border border-transparent shadow-sm text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200 cursor-pointer"
            >
              {loading ? 'Menyimpan...' : 'Simpan Barang'}
            </button>
          </div>
        </form>
      </div>

      {/* Data Table Section */}
      <div className="bg-[var(--bg-panel)] transition-colors duration-400 rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-150/80 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Daftar Barang BMN</h2>
          <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
            {barangs.length} Item
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Kode Barang / NUP</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Barang (Merk)</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Lokasi</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Kondisi</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-[var(--bg-panel)] transition-colors duration-400 divide-y divide-gray-200">
              {barangs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500 text-sm">
                    Belum ada data barang terdaftar.
                  </td>
                </tr>
              ) : (
                barangs.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold font-mono text-gray-900">{item.kode_barang}</div>
                      <div className="text-xs text-gray-500 font-semibold mt-0.5">NUP: {item.no_urut_pendaft}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">{item.nama_barang}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{item.merk_type} &bull; {item.th_perolehan}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">{item.lokasi_ruangan}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.kondisi === 'Baik' ? 'bg-green-50 text-green-700 border border-green-200' : 
                        item.kondisi === 'Rusak Ringan' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' : 
                        'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {item.kondisi}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => { setSelectedBarang(item); setZoom(100); setShowQRModal(true); }}
                        className="text-white hover:text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition-all inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-4v-4m-2 4h-2m-2-4h-2m8 0h2m-2 2h2m-4-6h4M6 6h4v4H6V6zm10 0h4v4h-4V6zM6 16h4v4H6v-4z" />
                        </svg>
                        Generate QR
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRModal && selectedBarang && (
        <div className="fixed z-50 inset-0 overflow-y-auto animate-fade-in">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={() => setShowQRModal(false)}>
              <div className="absolute inset-0 bg-gray-900/60"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className={`relative z-10 inline-block align-middle bg-[var(--bg-panel)] transition-colors duration-400 rounded-3xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle border border-gray-150 w-full transition-all duration-150 ${
              zoom > 180 ? 'sm:max-w-2xl' : 
              zoom > 150 ? 'sm:max-w-xl' : 
              zoom > 125 ? 'sm:max-w-lg' : 
              zoom > 100 ? 'sm:max-w-md' : 
              'sm:max-w-sm'
            }`}>
              <div className="bg-[var(--bg-panel)] transition-colors duration-400 px-6 pt-6 pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="text-center sm:text-left w-full">
                    <div className="flex items-center justify-between border-b pb-3 mb-4">
                      <h3 className="text-lg font-bold text-gray-900" id="modal-title">
                        QR Code Label BMN
                      </h3>
                      <button 
                        type="button" 
                        onClick={() => setShowQRModal(false)}
                        className="text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="mt-4 flex flex-col items-center justify-center">
                      {/* Container to prevent overlap and allocate correct height */}
                      <div 
                        className="w-full flex items-center justify-center overflow-hidden transition-all duration-150 mb-4"
                        style={{ 
                          height: `${Math.round(330 * (zoom / 100))}px`,
                          width: '100%'
                        }}
                      >
                        {/* Area to be printed */}
                        <div 
                          id="qr-print-area" 
                          className="bg-[var(--bg-panel)] transition-colors duration-400 p-6 text-center border border-gray-200 rounded-2xl flex flex-col items-center justify-center shadow-inner origin-center"
                          style={{
                            width: '280px',
                            height: '330px',
                            transform: `scale(${zoom / 100})`,
                            flexShrink: 0,
                          }}
                        >
                          <div className="border-b border-gray-300 pb-2 mb-4 text-xs font-bold uppercase text-gray-700 tracking-wide w-full">
                            SIPRABU FT UNS
                          </div>
                          <div className="bg-[var(--bg-panel)] transition-colors duration-400 p-2 border border-gray-100 rounded-xl shadow-sm mb-4 w-full flex items-center justify-center h-[170px] flex-shrink-0">
                            <QRCodeSVG 
                              value={`${origin}/lapor/${selectedBarang.kode_barang}/${selectedBarang.no_urut_pendaft}`} 
                              size={150} 
                              level={"H"}
                            />
                          </div>
                          <div className="text-sm font-bold text-gray-900 leading-tight mb-1 truncate w-full">
                            {selectedBarang.nama_barang}
                          </div>
                          <div className="text-xxs text-gray-500 font-mono mt-0.5 truncate w-full">
                            KODE: {selectedBarang.kode_barang}
                          </div>
                          <div className="text-xxs text-gray-500 font-mono truncate w-full">
                            NUP: {selectedBarang.no_urut_pendaft}
                          </div>
                        </div>
                      </div>
                      
                      {/* Zoom Controls Slider */}
                      <div className="mt-2 w-full max-w-[280px] bg-gray-50 border border-gray-200/60 rounded-2xl p-4 space-y-3">
                        <div className="flex justify-between items-center text-xs font-bold text-gray-700">
                          <span>Zoom QR Preview:</span>
                          <span className="bg-indigo-50 text-indigo-700 font-black px-2 py-0.5 rounded-md text-[10px] border border-indigo-150">{zoom}%</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-gray-400 select-none">-</span>
                          <input 
                            type="range" 
                            min="50" 
                            max="200" 
                            value={zoom} 
                            onChange={(e) => setZoom(parseInt(e.target.value))}
                            className="flex-1 accent-indigo-600 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                          <span className="text-xs font-bold text-gray-400 select-none">+</span>
                        </div>
                      </div>

                      <div className="mt-4 text-center">
                        <p className="text-xs text-gray-500 mb-2">Pindai QR dengan HP di Wi-Fi yang sama, atau uji langsung:</p>
                        <a 
                          href={`/lapor/${selectedBarang.kode_barang}/${selectedBarang.no_urut_pendaft}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-750 border border-indigo-200 rounded-xl text-xs font-bold transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Buka Halaman Lapor (Test PC)
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse rounded-b-3xl border-t border-gray-100 gap-2 sm:gap-0">
                <button type="button" onClick={handlePrintQR}
                  className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2.5 bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto cursor-pointer">
                  Cetak Label
                </button>
                <button type="button" onClick={handleDownloadQR}
                  className="w-full sm:w-auto mt-3 sm:mt-0 inline-flex justify-center rounded-xl border border-indigo-200 shadow-sm px-4 py-2.5 bg-indigo-50 text-sm font-bold text-indigo-700 hover:bg-indigo-100 focus:outline-none sm:ml-3 cursor-pointer">
                  Unduh PNG
                </button>
                <button type="button" onClick={() => setShowQRModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-4 py-2.5 bg-[var(--bg-panel)] transition-colors duration-400 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto cursor-pointer">
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
