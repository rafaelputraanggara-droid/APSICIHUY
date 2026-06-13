import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Parameter id wajib diisi.' },
        { status: 400 }
      );
    }

    const sessionId = parseInt(id);

    // 1. Fetch session header
    const [sessionRows]: any = await pool.query(
      "SELECT * FROM stok_opnames WHERE id = ? LIMIT 1",
      [sessionId]
    );

    if (sessionRows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Sesi stok opname tidak ditemukan.' },
        { status: 404 }
      );
    }

    // 2. Fetch all details with item details
    const [details]: any = await pool.query(
      `SELECT d.id, d.kode_barang, d.no_urut_pendaft, d.status_keberadaan, d.discan_pada,
              b.nama_barang, b.merk_type, b.th_perolehan, b.kondisi
       FROM stok_opname_details d
       LEFT JOIN barangs b ON d.kode_barang = b.kode_barang AND d.no_urut_pendaft = b.no_urut_pendaft
       WHERE d.stok_opname_id = ?`,
      [sessionId]
    );

    // 3. Calculate stats
    const totalItems = details.length;
    const itemsFound = details.filter((d: any) => d.status_keberadaan === 'Ditemukan').length;
    const itemsMissing = totalItems - itemsFound;
    
    const gapList = details.filter((d: any) => d.status_keberadaan === 'Tidak Ditemukan');
    const foundList = details.filter((d: any) => d.status_keberadaan === 'Ditemukan');

    return NextResponse.json({
      success: true,
      data: {
        sessionId,
        ruangan: sessionRows[0].ruangan,
        dilakukan_oleh: sessionRows[0].dilakukan_oleh,
        tanggal_mulai: sessionRows[0].tanggal_mulai,
        tanggal_selesai: sessionRows[0].tanggal_selesai,
        summary: {
          totalItems,
          itemsFound,
          itemsMissing,
          gapPercentage: totalItems > 0 ? ((itemsMissing / totalItems) * 100).toFixed(1) : '0'
        },
        gapList,
        foundList
      }
    });
  } catch (error: any) {
    console.error('Database query error (GET /api/stock-opname/report):', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan internal server saat mengambil detail laporan.' },
      { status: 500 }
    );
  }
}
