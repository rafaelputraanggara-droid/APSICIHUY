import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await pool.query(
      `SELECT m.*, b.nama_barang, b.merk_type, b.kategori 
       FROM mutasis m 
       JOIN barangs b ON m.kode_barang = b.kode_barang AND m.no_urut_pendaft = b.no_urut_pendaft
       ORDER BY m.created_at DESC`
    );
    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    console.error('Database query error (GET /api/mutasi):', error);
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan internal server saat mengambil data mutasi.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { kode_barang, no_urut_pendaft, ruangan_tujuan, alasan, foto_bukti, diajukan_oleh } = body;

    // 1. Check for missing required fields
    if (!kode_barang || no_urut_pendaft === undefined || !ruangan_tujuan || !alasan || !diajukan_oleh) {
      return NextResponse.json({ success: false, error: 'Semua field wajib diisi' }, { status: 400 });
    }

    // Convert NUP to integer
    const nupInt = parseInt(no_urut_pendaft);
    if (isNaN(nupInt)) {
      return NextResponse.json({ success: false, error: 'NUP tidak valid' }, { status: 400 });
    }

    // 2. Fetch the target barang to check existence, current room, and category
    const [barangRows]: any = await pool.query(
      'SELECT lokasi_ruangan, kategori, nama_barang FROM barangs WHERE kode_barang = ? AND no_urut_pendaft = ?',
      [kode_barang, nupInt]
    );

    if (barangRows.length === 0) {
      return NextResponse.json({ success: false, error: 'Barang dengan Kode dan NUP tersebut tidak ditemukan' }, { status: 404 });
    }

    const barang = barangRows[0];
    const ruangan_asal = barang.lokasi_ruangan;
    const kategori = barang.kategori;

    // 3. Prevent mutating to the same room
    if (ruangan_asal.toLowerCase().trim() === ruangan_tujuan.toLowerCase().trim()) {
      return NextResponse.json({ success: false, error: 'Ruangan tujuan tidak boleh sama dengan ruangan asal' }, { status: 400 });
    }

    // 4. Check category and process accordingly
    if (kategori === 'Rendah') {
      // Direct Move: Update database instantly
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();

        // Update barang's location
        await connection.query(
          'UPDATE barangs SET lokasi_ruangan = ? WHERE kode_barang = ? AND no_urut_pendaft = ?',
          [ruangan_tujuan.trim(), kode_barang, nupInt]
        );

        // Insert completed mutation record
        const [result] = await connection.query(
          `INSERT INTO mutasis (kode_barang, no_urut_pendaft, ruangan_asal, ruangan_tujuan, alasan, status_mutasi, diajukan_oleh, disetujui_asal_oleh, disetujui_tujuan_oleh) 
           VALUES (?, ?, ?, ?, ?, 'Disetujui', ?, 'Sistem (Otomatis)', 'Sistem (Otomatis)')`,
          [kode_barang, nupInt, ruangan_asal, ruangan_tujuan.trim(), alasan.trim(), diajukan_oleh.trim()]
        );

        await connection.commit();
        return NextResponse.json({ success: true, direct: true, data: result });
      } catch (err) {
        await connection.rollback();
        throw err;
      } finally {
        connection.release();
      }
    } else {
      // BMN/Tinggi Move: Propose and require approval. Photo proof is mandatory.
      if (!foto_bukti) {
        return NextResponse.json({ success: false, error: 'Foto bukti kondisi barang wajib disertakan untuk barang kategori BMN/Tinggi' }, { status: 400 });
      }

      // Insert pending mutation request
      const [result] = await pool.query(
        `INSERT INTO mutasis (kode_barang, no_urut_pendaft, ruangan_asal, ruangan_tujuan, alasan, foto_bukti, status_mutasi, diajukan_oleh) 
         VALUES (?, ?, ?, ?, ?, ?, 'Pending_Asal', ?)`,
        [kode_barang, nupInt, ruangan_asal, ruangan_tujuan.trim(), alasan.trim(), foto_bukti, diajukan_oleh.trim()]
      );

      return NextResponse.json({ success: true, direct: false, data: result });
    }
  } catch (error: any) {
    console.error('Database query error (POST /api/mutasi):', error);
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan internal server saat memproses mutasi.' }, { status: 500 });
  }
}
