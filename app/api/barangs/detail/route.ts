import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const kode_barang = searchParams.get('kode_barang');
    const no_urut_pendaft = searchParams.get('no_urut_pendaft');

    if (!kode_barang || !no_urut_pendaft) {
      return NextResponse.json(
        { success: false, error: 'Parameter kode_barang dan no_urut_pendaft wajib disertakan.' },
        { status: 400 }
      );
    }

    const nup = parseInt(no_urut_pendaft);
    if (isNaN(nup)) {
      return NextResponse.json(
        { success: false, error: 'Parameter no_urut_pendaft harus berupa angka.' },
        { status: 400 }
      );
    }

    const [rows]: any = await pool.query(
      'SELECT * FROM barangs WHERE kode_barang = ? AND no_urut_pendaft = ? LIMIT 1',
      [kode_barang, nup]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Aset barang tidak ditemukan.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (error: any) {
    console.error('Database query error (GET /api/barangs/detail):', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan internal server saat mengambil data detail barang.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { 
      kode_barang, 
      no_urut_pendaft, 
      nama_barang, 
      merk_type, 
      th_perolehan, 
      kondisi,
      kategori
    } = body;

    if (!kode_barang || no_urut_pendaft === undefined) {
      return NextResponse.json(
        { success: false, error: 'kode_barang dan no_urut_pendaft wajib diisi untuk update' },
        { status: 400 }
      );
    }

    const nup = parseInt(no_urut_pendaft);

    // Build dynamic update query based on provided fields
    const updates: string[] = [];
    const values: any[] = [];

    if (nama_barang) {
      updates.push('nama_barang = ?');
      values.push(nama_barang);
    }
    if (merk_type) {
      updates.push('merk_type = ?');
      values.push(merk_type);
    }
    if (th_perolehan) {
      updates.push('th_perolehan = ?');
      values.push(parseInt(th_perolehan));
    }
    if (kondisi) {
      updates.push('kondisi = ?');
      values.push(kondisi);
    }
    if (kategori) {
      updates.push('kategori = ?');
      values.push(kategori);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Tidak ada data yang diubah.' },
        { status: 400 }
      );
    }

    // Add WHERE clause parameters
    values.push(kode_barang, nup);

    const query = `UPDATE barangs SET ${updates.join(', ')} WHERE kode_barang = ? AND no_urut_pendaft = ?`;
    const [result]: any = await pool.query(query, values);

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Database query error (PUT /api/barangs/detail):', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan internal server saat update data barang.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const kode_barang = searchParams.get('kode_barang');
    const no_urut_pendaft = searchParams.get('no_urut_pendaft');

    if (!kode_barang || !no_urut_pendaft) {
      return NextResponse.json(
        { success: false, error: 'Parameter kode_barang dan no_urut_pendaft wajib disertakan.' },
        { status: 400 }
      );
    }

    const nup = parseInt(no_urut_pendaft);

    const query = `DELETE FROM barangs WHERE kode_barang = ? AND no_urut_pendaft = ?`;
    const [result]: any = await pool.query(query, [kode_barang, nup]);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, error: 'Barang tidak ditemukan atau sudah dihapus.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Barang berhasil dihapus.' });
  } catch (error: any) {
    console.error('Database query error (DELETE /api/barangs/detail):', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan internal server saat menghapus data barang.' },
      { status: 500 }
    );
  }
}
