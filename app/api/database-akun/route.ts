import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role'); // 'admin', 'pj', or 'mahasiswa'

    if (role === 'mahasiswa') {
      const [rows] = await pool.query(
        "SELECT id, username as name, email_sso as email, nim, dokumen_pdf as foto_ktm, status_pendaftaran as status FROM pendaftaran_akun WHERE status_pendaftaran = 'Disetujui' AND peran_pengaju = 'Mahasiswa'"
      );
      return NextResponse.json({ success: true, data: rows });
    } else if (role === 'pj') {
      const [rows] = await pool.query(
        `SELECT u.id, u.name, u.email, u.role, p.dokumen_pdf as foto_ktm, p.nim 
         FROM users u 
         LEFT JOIN pendaftaran_akun p ON u.email = p.email_sso 
         WHERE u.role = 'PJ_Ruangan'`
      );
      return NextResponse.json({ success: true, data: rows });
    } else {
      const [rows] = await pool.query(
        "SELECT id, name, email, role FROM users WHERE role = 'Admin'"
      );
      return NextResponse.json({ success: true, data: rows });
    }
  } catch (error) {
    console.error('API Database Akun GET Error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan internal pada server.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id, type } = body;

    if (!id || !type) {
      return NextResponse.json(
        { success: false, error: 'ID dan tipe akun diperlukan.' },
        { status: 400 }
      );
    }

    let userEmail = '';

    if (type === 'mahasiswa') {
      // Dapatkan email dari pendaftaran_akun terlebih dahulu
      const [pRows] = await pool.query("SELECT email_sso FROM pendaftaran_akun WHERE id = ?", [id]);
      userEmail = (pRows as any[])[0]?.email_sso;

      // Hapus permanen dari pendaftaran_akun
      await pool.query("DELETE FROM pendaftaran_akun WHERE id = ?", [id]);

      // Hapus juga dari users jika kebetulan ada untuk menghindari ER_DUP_ENTRY
      if (userEmail) {
        await pool.query("DELETE FROM users WHERE email = ?", [userEmail]);
      }
    } else {
      // Dapatkan email dari users terlebih dahulu
      const [userRows] = await pool.query("SELECT email FROM users WHERE id = ?", [id]);
      userEmail = (userRows as any[])[0]?.email;

      // Hapus dari tabel users
      await pool.query("DELETE FROM users WHERE id = ?", [id]);

      // Hapus juga riwayat pendaftaran di pendaftaran_akun agar constraint unik tidak menghalangi pendaftaran ulang
      if (userEmail) {
        await pool.query("DELETE FROM pendaftaran_akun WHERE email_sso = ?", [userEmail]);
      }
    }

    return NextResponse.json({ success: true, message: 'Akun berhasil dihapus.' });
  } catch (error) {
    console.error('API Database Akun DELETE Error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus akun.' },
      { status: 500 }
    );
  }
}
