import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const query = `
      SELECT 
        k.nama_kategori,
        COUNT(b.id) as total_barang,
        SUM(CASE WHEN b.kondisi = 'Baik' THEN 1 ELSE 0 END) as barang_baik,
        SUM(CASE WHEN b.kondisi != 'Baik' THEN 1 ELSE 0 END) as barang_rusak
      FROM kategori_barang k
      LEFT JOIN barangs b ON k.nama_kategori = b.nama_kategori
      GROUP BY k.id, k.nama_kategori
      ORDER BY k.nama_kategori ASC
    `;
    const [rows] = await pool.query(query);
    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    console.error('API Kategori GET Error:', error);
    return NextResponse.json({ success: false, error: 'Gagal mengambil data kategori.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { nama_kategori } = await request.json();
    if (!nama_kategori || !nama_kategori.trim()) {
      return NextResponse.json({ success: false, error: 'Nama kategori wajib diisi.' }, { status: 400 });
    }

    const [result] = await pool.query(
      `INSERT INTO kategori_barang (nama_kategori) VALUES (?)`,
      [nama_kategori.trim()]
    );
    return NextResponse.json({ success: true, data: { id: (result as any).insertId, nama_kategori: nama_kategori.trim() } });
  } catch (error: any) {
    console.error('API Kategori POST Error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ success: false, error: 'Kategori sudah ada.' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Gagal menambah kategori.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { categories } = await request.json(); // array of nama_kategori strings
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return NextResponse.json({ success: false, error: 'Tidak ada kategori yang dipilih.' }, { status: 400 });
    }

    for (const cat of categories) {
      await pool.query(`UPDATE barangs SET nama_kategori = NULL WHERE nama_kategori = ?`, [cat]);
      await pool.query(`DELETE FROM kategori_barang WHERE nama_kategori = ?`, [cat]);
    }

    return NextResponse.json({ success: true, message: 'Berhasil menghapus kategori.' });
  } catch (error: any) {
    console.error('API Kategori DELETE Error:', error);
    return NextResponse.json({ success: false, error: 'Gagal menghapus kategori.' }, { status: 500 });
  }
}
