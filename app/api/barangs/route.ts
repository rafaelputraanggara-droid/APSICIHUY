import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await pool.query('SELECT * FROM barangs ORDER BY created_at DESC');
    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    console.error('Database query error (GET /api/barangs):', error);
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan internal server saat mengambil data.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { kode_barang, no_urut_pendaft, nama_barang, merk_type, th_perolehan, kondisi, lokasi_ruangan, nama_kategori } = body;

    // 1. Check for missing required fields
    if (!kode_barang || no_urut_pendaft === undefined || !nama_barang || !merk_type || !th_perolehan || !lokasi_ruangan || !nama_kategori) {
      return NextResponse.json({ success: false, error: 'Semua field wajib diisi' }, { status: 400 });
    }

    // 2. Validate SAKTI BMN Code Format (X.XX.XX.XX.XXX)
    if (!kode_barang.match(/^\d\.\d{2}\.\d{2}\.\d{2}\.\d{3}$/)) {
      return NextResponse.json({ success: false, error: 'Format Kode Barang salah (harus X.XX.XX.XX.XXX)' }, { status: 400 });
    }

    // 3. Validate NUP (Positive Integer)
    const nupInt = parseInt(no_urut_pendaft);
    if (isNaN(nupInt) || nupInt <= 0) {
      return NextResponse.json({ success: false, error: 'NUP harus berupa angka bulat positif' }, { status: 400 });
    }

    // 4. Validate Year of Acquisition (between 1900 and 2100)
    const yearInt = parseInt(th_perolehan);
    if (isNaN(yearInt) || yearInt < 1900 || yearInt > 2100) {
      return NextResponse.json({ success: false, error: 'Tahun perolehan tidak valid' }, { status: 400 });
    }

    // 5. Validate Condition ENUM
    const validConditions = ['Baik', 'Rusak Ringan', 'Rusak Berat'];
    const itemCondition = kondisi || 'Baik';
    if (!validConditions.includes(itemCondition)) {
      return NextResponse.json({ success: false, error: 'Kondisi barang tidak valid' }, { status: 400 });
    }

    // 6. Insert data into MySQL database
    const [result] = await pool.query(
      `INSERT INTO barangs (kode_barang, no_urut_pendaft, nama_barang, merk_type, th_perolehan, kondisi, lokasi_ruangan, nama_kategori) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [kode_barang, nupInt, nama_barang.trim(), merk_type.trim(), yearInt, itemCondition, lokasi_ruangan.trim(), nama_kategori.trim()]
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Database query error (POST /api/barangs):', error);

    // Handle duplicate unique constraint error (kode_barang + no_urut_pendaft)
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ success: false, error: 'Kombinasi Kode Barang dan NUP sudah terdaftar' }, { status: 400 });
    }
    
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan internal server saat menyimpan data.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const kode_barang = searchParams.get('kode_barang');
    const no_urut_pendaft = searchParams.get('no_urut_pendaft');

    if (!kode_barang || !no_urut_pendaft) {
      return NextResponse.json({ success: false, error: 'Kode Barang dan NUP diperlukan.' }, { status: 400 });
    }

    const nupInt = parseInt(no_urut_pendaft);
    if (isNaN(nupInt)) {
      return NextResponse.json({ success: false, error: 'NUP tidak valid.' }, { status: 400 });
    }

    const [result]: any = await pool.query(
      "DELETE FROM barangs WHERE kode_barang = ? AND no_urut_pendaft = ?",
      [kode_barang, nupInt]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, error: 'Barang tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Barang berhasil dihapus.' });
  } catch (error: any) {
    console.error('Database query error (DELETE /api/barangs):', error);
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan internal server saat menghapus data.' }, { status: 500 });
  }
}

