import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token verifikasi tidak valid atau tidak ditemukan.' },
        { status: 400 }
      );
    }

    const [rows] = await pool.query(
      `SELECT * FROM pendaftaran_akun WHERE verification_token = ? AND status_pendaftaran = 'Menunggu Verifikasi Email'`,
      [token]
    );
    const pendaftaran = (rows as any[])[0];

    if (!pendaftaran) {
      return NextResponse.json(
        { success: false, error: 'Token verifikasi tidak valid, sudah kedaluwarsa, atau email sudah diverifikasi.' },
        { status: 400 }
      );
    }

    // Aktifkan akun
    await pool.query(
      `UPDATE pendaftaran_akun SET status_pendaftaran = 'Disetujui', verification_token = NULL WHERE id = ?`,
      [pendaftaran.id]
    );

    // Jika yang mendaftar adalah PJ_Ruangan, pindahkan ke tabel users
    if (pendaftaran.peran_pengaju === 'PJ_Ruangan') {
      await pool.query(
        `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'PJ_Ruangan')`,
        [pendaftaran.username, pendaftaran.email_sso, pendaftaran.password]
      );
    }

    return NextResponse.json({ success: true, message: 'Email berhasil diverifikasi! Anda sekarang dapat login.' });
  } catch (error) {
    console.error('API Verify Email Error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan internal pada server.' },
      { status: 500 }
    );
  }
}
