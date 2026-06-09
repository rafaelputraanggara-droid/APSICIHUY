import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ruangan, dilakukan_oleh } = body;

    if (!ruangan || !dilakukan_oleh) {
      return NextResponse.json(
        { success: false, error: 'Parameter ruangan dan dilakukan_oleh wajib diisi.' },
        { status: 400 }
      );
    }

    // 1. Close any existing open sessions for the same room to prevent conflicts
    await pool.query(
      "UPDATE stok_opnames SET status = 'Selesai', tanggal_selesai = CURRENT_TIMESTAMP WHERE ruangan = ? AND status = 'Berjalan'",
      [ruangan]
    );

    // 2. Insert new session header
    const [sessionResult]: any = await pool.query(
      "INSERT INTO stok_opnames (ruangan, dilakukan_oleh, status) VALUES (?, ?, 'Berjalan')",
      [ruangan, dilakukan_oleh.trim()]
    );

    const sessionId = sessionResult.insertId;

    // 3. Get all active items in that room
    const [barangs]: any = await pool.query(
      "SELECT kode_barang, no_urut_pendaft, nama_barang, merk_type, th_perolehan, kondisi FROM barangs WHERE lokasi_ruangan = ? AND status_bmn = 'Aktif'",
      [ruangan]
    );

    if (barangs.length > 0) {
      // 4. Insert each expected item into details with 'Tidak Ditemukan' state by default
      const values = barangs.map((b: any) => [
        sessionId,
        b.kode_barang,
        b.no_urut_pendaft,
        'Tidak Ditemukan'
      ]);

      await pool.query(
        "INSERT INTO stok_opname_details (stok_opname_id, kode_barang, no_urut_pendaft, status_keberadaan) VALUES ?",
        [values]
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        sessionId,
        ruangan,
        dilakukan_oleh,
        status: 'Berjalan',
        items: barangs.map((b: any) => ({
          ...b,
          status_keberadaan: 'Tidak Ditemukan',
          discan_pada: null
        }))
      }
    });
  } catch (error: any) {
    console.error('Database query error (POST /api/stock-opname/start):', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan internal server saat memulai sesi stok opname.' },
      { status: 500 }
    );
  }
}
