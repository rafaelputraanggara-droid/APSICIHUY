"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";

interface Barang {
  kode_barang: string;
  no_urut_pendaft: number;
  nama_barang: string;
  merk_type: string;
  th_perolehan: number;
  kondisi: string;
  status_bmn: string;
  kategori: string;
  lokasi_ruangan: string;
}

export default function CetakLabelPage({ params }: { params: Promise<{ roomName: string }> }) {
  const unwrappedParams = use(params);
  const roomName = unwrappedParams.roomName;
  const decodedRoomName = decodeURIComponent(roomName);

  const [items, setItems] = useState<Barang[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Target single item if specified in URL query "?item=KODE_NUP"
  const [targetItem, setTargetItem] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      setTargetItem(urlParams.get("item"));
    }

    const fetchItems = async () => {
      try {
        const res = await fetch(`/api/ruangan/${roomName}`);
        const json = await res.json();
        if (json.success) {
          setItems(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch items for printing:", error);
      } finally {
        setLoading(false);
        // Automatically open print dialog after rendering completes
        setTimeout(() => {
          window.print();
        }, 1200);
      }
    };
    fetchItems();
  }, [roomName]);

  const filteredItems = targetItem 
    ? items.filter(i => `${i.kode_barang}_${i.no_urut_pendaft}` === targetItem)
    : items;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-[var(--text-muted)] bg-[var(--bg-panel)] transition-colors duration-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
          <p className="font-semibold text-sm">Mempersiapkan dokumen cetak...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-100 min-h-screen font-sans text-black print:bg-[var(--bg-panel)] transition-colors duration-400">
      {/* Print Controls (Hidden when actually printing) */}
      <div className="print:hidden p-4 bg-[var(--bg-panel)] transition-colors duration-400 shadow-sm border-b border-[var(--border-panel)] flex justify-between items-center fixed top-0 w-full z-50">
        <div>
          <h1 className="text-lg font-bold">Cetak Label - {decodedRoomName}</h1>
          <p className="text-sm text-[var(--text-muted)]">Total {filteredItems.length} label siap dicetak.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => router.back()} 
            className="px-4 py-2 bg-[var(--bg-panel)] transition-colors duration-400 border border-neutral-300 rounded-lg text-sm font-medium hover:bg-[var(--bg-app)] transition-colors duration-400 cursor-pointer"
          >
            Tutup
          </button>
          <button 
            onClick={() => window.print()} 
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm flex items-center gap-2 cursor-pointer transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Cetak Ulang (Ctrl+P)
          </button>
        </div>
      </div>

      {/* Printable Area */}
      <div className="print:pt-0 pt-24 p-8 max-w-[210mm] mx-auto bg-[var(--bg-panel)] transition-colors duration-400 shadow-xl print:shadow-none min-h-[297mm]">
        {filteredItems.length === 0 ? (
          <div className="text-center py-20 text-[var(--text-muted)] print:hidden">
            Aset tidak ditemukan.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 print:gap-2">
            {filteredItems.map((item, idx) => {
              // Define the destination URL for scanning
              const host = typeof window !== "undefined" ? window.location.origin : "http://siprabu.ft.uns.ac.id";
              const scanUrl = `${host}/lapor/${item.kode_barang}/${item.no_urut_pendaft}`;

              return (
                <div 
                  key={idx} 
                  className="border-[1.5px] border-black rounded-lg p-3 flex flex-row items-center gap-3 bg-[var(--bg-panel)] transition-colors duration-400 print:break-inside-avoid relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600 print:bg-black"></div>
                  
                  <div className="flex-1 min-w-0 space-y-1.5 pl-2">
                    <div className="border-b-[1.5px] border-black pb-1 mb-1">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-black">Univ. Sebelas Maret</p>
                      <p className="text-[8px] font-semibold text-neutral-800">Fakultas Teknik - SIPRABU</p>
                    </div>
                    <h3 className="font-extrabold text-[12px] text-black leading-tight uppercase truncate" title={item.nama_barang}>{item.nama_barang}</h3>
                    <div className="bg-black text-white px-1.5 py-0.5 inline-block rounded-sm">
                      <p className="text-[10px] font-mono font-bold tracking-wider">{item.kode_barang} <span className="text-neutral-300">| NUP {item.no_urut_pendaft}</span></p>
                    </div>
                    <div className="flex items-center gap-1 text-[9px] text-black pt-1">
                      <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="font-bold truncate uppercase">{decodedRoomName}</span>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 flex flex-col items-center gap-1 justify-center border-l-[1.5px] border-dashed border-neutral-300 pl-3">
                    <div className="p-1 bg-[var(--bg-panel)] transition-colors duration-400">
                      <QRCodeSVG 
                        value={scanUrl} 
                        size={64}
                        level={"Q"}
                        includeMargin={false}
                      />
                    </div>
                    <span className="text-[8px] font-mono bg-black text-white px-1.5 rounded-sm font-bold tracking-widest uppercase">SCAN ASET</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Print Styles to hide Next.js injected dev indicators if any */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { size: A4; margin: 10mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          #__next-build-watcher, #nextjs-toast { display: none !important; }
        }
      `}} />
    </div>
  );
}
