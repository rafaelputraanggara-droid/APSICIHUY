import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const kode = searchParams.get('kode');

    if (!kode) {
      return NextResponse.json({ success: false, error: 'Kode barang diperlukan' }, { status: 400 });
    }

    // Parse format "1.12.34.56.789_1"
    const parts = kode.split('_');
    if (parts.length !== 2) {
      return NextResponse.json({ success: false, error: 'Format tidak valid. Gunakan format KODE_NUP' }, { status: 400 });
    }

    const kode_barang = parts[0];
    const nup = parseInt(parts[1], 10);

    const [rows] = await pool.query(
      `SELECT id, nama_barang, merk_type, lokasi_ruangan FROM barangs WHERE kode_barang = ? AND no_urut_pendaft = ? LIMIT 1`,
      [kode_barang, nup]
    );

    const items = rows as any[];
    if (items.length === 0) {
      return NextResponse.json({ success: false, error: 'Barang tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: items[0] });
  } catch (error) {
    console.error('API Barangs Lookup Error:', error);
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan sistem' }, { status: 500 });
  }
}
