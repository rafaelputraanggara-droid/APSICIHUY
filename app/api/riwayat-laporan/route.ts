import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pelapor_id = searchParams.get('pelapor_id');
    const nama_pelapor = searchParams.get('nama_pelapor');

    if (!pelapor_id) {
      return NextResponse.json(
        { success: false, error: 'pelapor_id parameter is required.' },
        { status: 400 }
      );
    }

    const query = `
      SELECT 
        l.id, 
        l.kode_barang, 
        l.no_urut_pendaft, 
        l.dilaporkan_oleh, 
        l.deskripsi_kerusakan, 
        l.foto_url, 
        l.status_laporan, 
        l.catatan_pj,
        l.created_at,
        b.nama_barang
      FROM laporan_kerusakans l
      LEFT JOIN barangs b 
        ON l.kode_barang = b.kode_barang 
        AND l.no_urut_pendaft = b.no_urut_pendaft
      WHERE l.pelapor_id = ? OR (l.pelapor_id IS NULL AND l.dilaporkan_oleh = ?)
      ORDER BY l.created_at DESC
    `;
    
    const [rows] = await pool.query(query, [pelapor_id, nama_pelapor || '']);
    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    console.error('Database query error (GET /api/riwayat-laporan):', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan internal server saat mengambil data riwayat laporan.' },
      { status: 500 }
    );
  }
}
