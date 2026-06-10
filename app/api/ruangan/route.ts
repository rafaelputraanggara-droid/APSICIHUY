import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT room, SUM(itemCount) as itemCount
      FROM (
        SELECT lokasi_ruangan as room, COUNT(*) as itemCount 
        FROM barangs 
        GROUP BY lokasi_ruangan
        
        UNION ALL
        
        SELECT id_ruangan_tujuan as room, 0 as itemCount 
        FROM mutasi_barang
        
        UNION ALL
        
        SELECT ruangan_asal as room, 0 as itemCount 
        FROM mutasi_barang
      ) as combined
      WHERE room IS NOT NULL AND room != ''
      GROUP BY room
      ORDER BY room ASC
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

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const roomName = searchParams.get('room');

    if (!roomName) {
      return NextResponse.json({ success: false, error: 'Nama ruangan wajib diisi' }, { status: 400 });
    }

    const trimmedRoom = roomName.trim();

    // To completely "delete" a room, we remove its references from barangs and mutasi_barang
    // by setting them to an empty string. The GET query ignores empty strings.
    await pool.query('UPDATE barangs SET lokasi_ruangan = ? WHERE lokasi_ruangan = ?', ['', trimmedRoom]);
    await pool.query('UPDATE mutasi_barang SET id_ruangan_tujuan = ? WHERE id_ruangan_tujuan = ?', ['', trimmedRoom]);
    await pool.query('UPDATE mutasi_barang SET ruangan_asal = ? WHERE ruangan_asal = ?', ['', trimmedRoom]);

    return NextResponse.json({ success: true, message: 'Ruangan berhasil dihapus' });
  } catch (error: any) {
    console.error('Database query error (DELETE /api/ruangan):', error);
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan internal server' }, { status: 500 });
  }
}
