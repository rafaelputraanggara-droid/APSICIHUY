import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    const query = `
      SELECT id, username, email_sso, status_pendaftaran 
      FROM pendaftaran_akun 
      WHERE username = ? AND password = ?
    `;
    const [rows]: any = await pool.query(query, [username, password]);

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Username atau password salah!' },
        { status: 401 }
      );
    }

    const user = rows[0];

    if (user.status_pendaftaran === 'Menunggu') {
      return NextResponse.json(
        { success: false, error: 'Akun Anda sedang menunggu persetujuan dari Admin.' },
        { status: 403 }
      );
    }

    if (user.status_pendaftaran === 'Menunggu Verifikasi Email') {
      return NextResponse.json(
        { success: false, error: 'Akun disetujui, tetapi email belum diverifikasi. Silakan cek kotak masuk email Anda dan klik link verifikasi.' },
        { status: 403 }
      );
    }

    if (user.status_pendaftaran === 'Ditolak') {
      return NextResponse.json(
        { success: false, error: 'Pendaftaran akun Anda ditolak.' },
        { status: 403 }
      );
    }

    // Login successful
    return NextResponse.json({ 
      success: true, 
      data: {
        id: user.id,
        name: user.username,
        email: user.email_sso
      }
    });

  } catch (error) {
    console.error('API Login Mahasiswa Error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan pada database.' },
      { status: 500 }
    );
  }
}
