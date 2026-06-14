import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    const query = `
      SELECT 
        d.kode_barang, 
        d.no_urut_pendaft, 
        b.nama_barang, 
        b.lokasi_ruangan, 
        s.tanggal_selesai
      FROM stok_opnames s
      JOIN stok_opname_details d ON s.id = d.stok_opname_id
      JOIN barangs b ON d.kode_barang = b.kode_barang AND d.no_urut_pendaft = b.no_urut_pendaft
      WHERE s.id IN (
        SELECT MAX(id)
        FROM stok_opnames
        WHERE status = 'Selesai'
        GROUP BY ruangan
      )
      AND d.status_keberadaan = 'Tidak Ditemukan'
    `;
    const [rows]: any = await pool.query(query);

    return NextResponse.json({
      success: true,
      data: rows
    });
  } catch (error: any) {
    console.error('Database query error (GET /api/barang-hilang):', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data barang hilang.' },
      { status: 500 }
    );
  }
}
