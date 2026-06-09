import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const [rows]: any = await pool.query(
      "SELECT DISTINCT lokasi_ruangan FROM barangs WHERE status_bmn = 'Aktif' AND lokasi_ruangan != '' ORDER BY lokasi_ruangan ASC"
    );
    
    const rooms = rows.map((r: any) => r.lokasi_ruangan);
    return NextResponse.json({ success: true, data: rooms });
  } catch (error: any) {
    console.error('Database query error (GET /api/stock-opname/rooms):', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan internal server saat mengambil data ruangan.' },
      { status: 500 }
    );
  }
}
