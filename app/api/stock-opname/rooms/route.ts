import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const [rows]: any = await pool.query(`
      SELECT 
        b.lokasi_ruangan as room, 
        (SELECT MAX(s.tanggal_selesai) 
         FROM stok_opnames s 
         WHERE s.ruangan = b.lokasi_ruangan AND s.status = 'Selesai') as last_opname
      FROM (SELECT DISTINCT lokasi_ruangan FROM barangs WHERE status_bmn = 'Aktif' AND lokasi_ruangan != '') b
      ORDER BY b.lokasi_ruangan ASC
    `);
    
    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    console.error('Database query error (GET /api/stock-opname/rooms):', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan internal server saat mengambil data ruangan.' },
      { status: 500 }
    );
  }
}
