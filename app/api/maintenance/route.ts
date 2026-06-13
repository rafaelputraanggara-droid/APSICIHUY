import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const query = `
      SELECT l.*, b.nama_barang, b.id as id_barang, r.nama_ruangan as ruangan_asal
      FROM laporan_kerusakans l
      LEFT JOIN barangs b ON l.kode_barang = b.kode_barang AND l.no_urut_pendaft = b.no_urut_pendaft
      LEFT JOIN mutasis r ON b.id = r.id_barang AND r.status_mutasi = 'Disetujui'
      ORDER BY l.created_at DESC
    `;
    const [rows] = await pool.query(query);
    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error('API Maintenance GET Error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan internal pada server.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'ID laporan dan status wajib diisi.' },
        { status: 400 }
      );
    }

    const validStatuses = ['Menunggu', 'Diproses', 'Selesai', 'Ditolak'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Status tidak valid.' },
        { status: 400 }
      );
    }

    await pool.query(
      "UPDATE laporan_kerusakans SET status_laporan = ? WHERE id = ?",
      [status, id]
    );

    return NextResponse.json({ success: true, message: 'Status berhasil diperbarui.' });
  } catch (error) {
    console.error('API Maintenance PUT Error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui status.' },
      { status: 500 }
    );
  }
}
