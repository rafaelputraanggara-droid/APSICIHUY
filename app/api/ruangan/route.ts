import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT lokasi_ruangan as room, COUNT(*) as itemCount 
      FROM barangs 
      GROUP BY lokasi_ruangan 
      ORDER BY lokasi_ruangan ASC
    `);
    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    console.error('Database query error (GET /api/ruangan):', error);
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan internal server' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { oldName, newName } = body;

    if (!oldName || !newName) {
      return NextResponse.json({ success: false, error: 'oldName dan newName wajib diisi' }, { status: 400 });
    }

    const [result]: any = await pool.query(
      'UPDATE barangs SET lokasi_ruangan = ? WHERE lokasi_ruangan = ?',
      [newName.trim(), oldName.trim()]
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Database query error (PUT /api/ruangan):', error);
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan internal server' }, { status: 500 });
  }
}
