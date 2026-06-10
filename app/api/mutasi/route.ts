import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const userEmail = searchParams.get('email');

    let query = `
      SELECT m.*, b.kode_barang, b.no_urut_pendaft, b.nama_barang, 
             COALESCE(m.ruangan_asal, b.lokasi_ruangan) as ruangan_asal 
      FROM mutasi_barang m
      JOIN barangs b ON m.id_barang = b.id
    `;
    let params: any[] = [];

    query += ` ORDER BY m.tanggal_mutasi DESC`;

    const [rows] = await pool.query(query, params);
    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error('API Mutasi GET Error:', error);
    return NextResponse.json({ success: false, error: 'Gagal mengambil data mutasi' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id_barang, id_user_pengaju, id_ruangan_tujuan, alasan_mutasi } = body;

    if (!id_barang || !id_user_pengaju || !id_ruangan_tujuan || !alasan_mutasi) {
      return NextResponse.json({ success: false, error: 'Data mutasi tidak lengkap.' }, { status: 400 });
    }

    // Fetch current room as ruangan_asal
    const [itemRows] = await pool.query('SELECT lokasi_ruangan FROM barangs WHERE id = ?', [id_barang]);
    const ruangan_asal = (itemRows as any[])[0]?.lokasi_ruangan || '';

    const [result] = await pool.query(
      `INSERT INTO mutasi_barang (id_barang, id_user_pengaju, ruangan_asal, id_ruangan_tujuan, alasan_mutasi, status_mutasi) 
       VALUES (?, ?, ?, ?, ?, 'Menunggu')`,
      [id_barang, id_user_pengaju, ruangan_asal, id_ruangan_tujuan, alasan_mutasi]
    );

    return NextResponse.json({ success: true, message: 'Mutasi berhasil diajukan.' });
  } catch (error) {
    console.error('API Mutasi POST Error:', error);
    return NextResponse.json({ success: false, error: 'Gagal mengajukan mutasi' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id_mutasi, status_mutasi, catatan_validasi } = body;

    await pool.query(
      `UPDATE mutasi_barang SET status_mutasi = ?, catatan_validasi = ?, tanggal_validasi = CURRENT_TIMESTAMP WHERE id_mutasi = ?`,
      [status_mutasi, catatan_validasi, id_mutasi]
    );

    // If approved, update the location of the item in barangs table
    if (status_mutasi === 'Disetujui') {
      const [mutasiRows] = await pool.query(`SELECT id_barang, id_ruangan_tujuan FROM mutasi_barang WHERE id_mutasi = ?`, [id_mutasi]);
      if ((mutasiRows as any[]).length > 0) {
        const mutasi = (mutasiRows as any[])[0];
        await pool.query(`UPDATE barangs SET lokasi_ruangan = ? WHERE id = ?`, [mutasi.id_ruangan_tujuan, mutasi.id_barang]);
      }
    }

    return NextResponse.json({ success: true, message: 'Status mutasi berhasil diperbarui.' });
  } catch (error) {
    console.error('API Mutasi PUT Error:', error);
    return NextResponse.json({ success: false, error: 'Gagal memvalidasi mutasi' }, { status: 500 });
  }
}
