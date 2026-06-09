import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request, context: { params: Promise<{ roomName: string }> }) {
  try {
    const params = await context.params;
    const roomName = decodeURIComponent(params.roomName);
    
    const [rows] = await pool.query(
      'SELECT * FROM barangs WHERE lokasi_ruangan = ? ORDER BY created_at DESC',
      [roomName]
    );

    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    console.error('Database query error (GET /api/ruangan/[roomName]):', error);
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan internal server' }, { status: 500 });
  }
}
