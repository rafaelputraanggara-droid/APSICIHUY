import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ruangan = searchParams.get('ruangan');

    if (!ruangan) {
      return NextResponse.json(
        { success: false, error: 'Parameter ruangan wajib diisi.' },
        { status: 400 }
      );
    }

    const [rows]: any = await pool.query(
      "SELECT * FROM stok_opnames WHERE ruangan = ? AND status = 'Selesai' ORDER BY tanggal_selesai DESC",
      [ruangan]
    );

    return NextResponse.json({
      success: true,
      data: rows
    });
  } catch (error: any) {
    console.error('Database query error (GET /api/stock-opname/history):', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil riwayat stock opname.' },
      { status: 500 }
    );
  }
}
