import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  const connection = await pool.getConnection();
  try {
    const { items } = await request.json();
    
    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { success: false, error: 'Payload tidak valid. Format harus berupa array items.' },
        { status: 450 }
      );
    }

    // Start database transaction
    await connection.beginTransaction();

    let successCount = 0;
    let duplicateCount = 0;
    const skippedItems: string[] = [];

    for (const item of items) {
      const {
        kode_barang,
        no_urut_pendaft,
        nama_barang,
        merk_type,
        th_perolehan,
        kondisi,
        lokasi_ruangan
      } = item;

      // 1. Basic field presence validation
      if (
        !kode_barang ||
        no_urut_pendaft === undefined ||
        !nama_barang ||
        !merk_type ||
        !th_perolehan ||
        !lokasi_ruangan
      ) {
        skippedItems.push(`Kolom kosong pada item: ${nama_barang || 'Tanpa Nama'}`);
        continue;
      }

      // 2. Validate SAKTI pattern (X.XX.XX.XX.XXX)
      if (!kode_barang.match(/^\d\.\d{2}\.\d{2}\.\d{2}\.\d{3}$/)) {
        skippedItems.push(`Format kode salah: ${kode_barang}`);
        continue;
      }

      // 3. Check for duplicates in database
      const [existing]: any = await connection.query(
        'SELECT id FROM barangs WHERE kode_barang = ? AND no_urut_pendaft = ?',
        [kode_barang, no_urut_pendaft]
      );

      if (existing.length > 0) {
        duplicateCount++;
        skippedItems.push(`Duplikat: ${kode_barang} (NUP: ${no_urut_pendaft})`);
        continue;
      }

      // 4. Insert into database
      await connection.query(
        `INSERT INTO barangs (kode_barang, no_urut_pendaft, nama_barang, merk_type, th_perolehan, kondisi, lokasi_ruangan)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          kode_barang,
          parseInt(no_urut_pendaft),
          nama_barang.trim(),
          merk_type.trim(),
          parseInt(th_perolehan),
          kondisi || 'Baik',
          lokasi_ruangan.trim()
        ]
      );
      successCount++;
    }

    // Commit transaction
    await connection.commit();

    return NextResponse.json({
      success: true,
      message: `Proses impor selesai. Berhasil: ${successCount}, Duplikat dilewati: ${duplicateCount}.`,
      summary: {
        success: successCount,
        duplicates: duplicateCount,
        skipped: skippedItems
      }
    });
  } catch (error: any) {
    // Rollback transaction on critical error
    await connection.rollback();
    console.error('Transaction rollback. Error (POST /api/barangs/import):', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan internal server saat memproses transaksi database.' },
      { status: 500 }
    );
  } finally {
    // Release connection back to the pool
    connection.release();
  }
}
