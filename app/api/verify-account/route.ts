import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, action } = body; // action: 'approve' | 'reject'

    if (!id || !action) {
      return NextResponse.json(
        { success: false, error: 'ID pendaftaran dan aksi wajib diisi!' },
        { status: 400 }
      );
    }

    if (action === 'reject') {
      await pool.query(`DELETE FROM pendaftaran_akun WHERE id = ?`, [id]);
      return NextResponse.json({ success: true, message: 'Pendaftaran berhasil ditolak dan dihapus dari antrean.' });
    } else {
      const query = `UPDATE pendaftaran_akun SET status_pendaftaran = 'Disetujui' WHERE id = ?`;
      await pool.query(query, [id]);

      const [rows] = await pool.query(`SELECT * FROM pendaftaran_akun WHERE id = ?`, [id]);
      const pendaftaran = (rows as any[])[0];

      if (pendaftaran && pendaftaran.peran_pengaju === 'PJ_Ruangan') {
        await pool.query(
          `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'PJ_Ruangan')`,
          [pendaftaran.username, pendaftaran.email_sso, pendaftaran.password]
        );
      }
      return NextResponse.json({ success: true, message: 'Pendaftaran berhasil disetujui.' });
    }
  } catch (error) {
    console.error('API Verify Account Error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan internal.' },
      { status: 500 }
    );
  }
}
