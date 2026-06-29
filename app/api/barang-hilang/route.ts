import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    const query = `
      SELECT 
        d.kode_barang, 
        d.no_urut_pendaft, 
        b.nama_barang, 
        b.lokasi_ruangan, 
        s.tanggal_selesai
      FROM stok_opnames s
      JOIN stok_opname_details d ON s.id = d.stok_opname_id
      JOIN barangs b ON d.kode_barang = b.kode_barang AND d.no_urut_pendaft = b.no_urut_pendaft
      WHERE s.id IN (
        SELECT MAX(id)
        FROM stok_opnames
        WHERE status = 'Selesai'
        GROUP BY ruangan
      )
      AND d.status_keberadaan = 'Tidak Ditemukan'
    `;
    const [rows]: any = await pool.query(query);

    return NextResponse.json({
      success: true,
      data: rows
    });
  } catch (error: any) {
    console.error('Database query error (GET /api/barang-hilang):', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data barang hilang.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { kode_barang, no_urut_pendaft, bukti_ditemukan_pdf } = body;

    if (!kode_barang || no_urut_pendaft === undefined || !bukti_ditemukan_pdf) {
      return NextResponse.json(
        { success: false, error: 'Parameter kode_barang, no_urut_pendaft, dan bukti_ditemukan_pdf wajib diisi.' },
        { status: 400 }
      );
    }

    // Auto-migrate: Pastikan kolom bukti_ditemukan_pdf ada di stok_opname_details
    try {
      await pool.query("ALTER TABLE stok_opname_details ADD COLUMN bukti_ditemukan_pdf LONGTEXT NULL");
    } catch (e: any) {
      // Abaikan jika kolom sudah ada
    }

    // Update status to 'Ditemukan' for the most recent missing record of this item
    const [result]: any = await pool.query(
      `UPDATE stok_opname_details 
       SET status_keberadaan = 'Ditemukan', bukti_ditemukan_pdf = ? 
       WHERE kode_barang = ? AND no_urut_pendaft = ? AND status_keberadaan = 'Tidak Ditemukan'`,
      [bukti_ditemukan_pdf, kode_barang, no_urut_pendaft]
    );

    if (result.affectedRows === 0) {
       return NextResponse.json(
        { success: false, error: 'Data barang hilang tidak ditemukan atau sudah diselesaikan.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Status barang berhasil diubah menjadi Ditemukan.'
    });

  } catch (error: any) {
    console.error('Database query error (PUT /api/barang-hilang):', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan internal server saat menyimpan bukti penemuan.' },
      { status: 500 }
    );
  }
}
