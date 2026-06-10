import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password, email_sso, nim, foto_ktm } = body;

    if (!username || !password || !email_sso || !nim || !foto_ktm) {
      return NextResponse.json(
        { success: false, error: 'Semua kolom wajib diisi!' },
        { status: 400 }
      );
    }

    const query = `
      INSERT INTO pendaftaran_akun (username, password, email_sso, nim, foto_ktm, status_pendaftaran)
      VALUES (?, ?, ?, ?, ?, 'Menunggu')
    `;

    await pool.query(query, [username, password, email_sso, nim, foto_ktm]);

    return NextResponse.json({ success: true, message: 'Pendaftaran berhasil disimpan.' });
  } catch (error: any) {
    console.error('API Register Error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { success: false, error: 'Username, Email SSO, atau NIM sudah terdaftar!' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan pada database.' },
      { status: 500 }
    );
  }
}
