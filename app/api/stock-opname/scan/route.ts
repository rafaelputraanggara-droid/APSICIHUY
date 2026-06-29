import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { stok_opname_id, kode_barang, no_urut_pendaft } = body;

    if (!stok_opname_id || !kode_barang || no_urut_pendaft === undefined) {
      return NextResponse.json(
        { success: false, error: 'Parameter stok_opname_id, kode_barang, dan no_urut_pendaft wajib diisi.' },
        { status: 400 }
      );
    }

    const nup = parseInt(no_urut_pendaft);
    const sessionId = parseInt(stok_opname_id);

    // 1. Check if the item belongs to this stock opname session
    const [expectedRows]: any = await pool.query(
      "SELECT d.*, b.nama_barang FROM stok_opname_details d JOIN barangs b ON d.kode_barang = b.kode_barang AND d.no_urut_pendaft = b.no_urut_pendaft WHERE d.stok_opname_id = ? AND d.kode_barang = ? AND d.no_urut_pendaft = ? LIMIT 1",
      [sessionId, kode_barang, nup]
    );

    if (expectedRows.length > 0) {
      // It is a valid match! Update status to 'Ditemukan'
      await pool.query(
        "UPDATE stok_opname_details SET status_keberadaan = 'Ditemukan', discan_pada = CURRENT_TIMESTAMP WHERE stok_opname_id = ? AND kode_barang = ? AND no_urut_pendaft = ?",
        [sessionId, kode_barang, nup]
      );

      return NextResponse.json({
        success: true,
        message: 'Aset berhasil diverifikasi (Ditemukan).',
        data: {
          kode_barang,
          no_urut_pendaft: nup,
          nama_barang: expectedRows[0].nama_barang,
          status_keberadaan: 'Ditemukan'
        }
      });
    }

    // 2. Misplaced or Unknown item check
    // Query the master barangs table to see if it exists in the database
    const [masterRows]: any = await pool.query(
      "SELECT nama_barang, lokasi_ruangan FROM barangs WHERE kode_barang = ? AND no_urut_pendaft = ? LIMIT 1",
      [kode_barang, nup]
    );

    if (masterRows.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error_type: 'MISPLACED', 
          error: `Barang ini bukan berada di ruangan ini dan seharusnya di ruang ${masterRows[0].lokasi_ruangan}`,
          data: {
            nama_barang: masterRows[0].nama_barang,
            lokasi_terdaftar: masterRows[0].lokasi_ruangan
          }
        },
        { status: 400 }
      );
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error_type: 'UNKNOWN', 
          error: 'Aset tidak dikenal! QR Code ini tidak terdaftar di database SIPRABU.' 
        },
        { status: 404 }
      );
    }

  } catch (error: any) {
    console.error('Database query error (POST /api/stock-opname/scan):', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan internal server saat memproses scan aset.' },
      { status: 500 }
    );
  }
}
