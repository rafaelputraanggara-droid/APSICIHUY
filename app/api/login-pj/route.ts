import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username dan password wajib diisi!' },
        { status: 400 }
      );
    }

    // 1. Cek di tabel pendaftaran untuk memberi pesan informatif jika masih 'Menunggu'
    const [pendRows]: any = await pool.query(
      `SELECT status_pendaftaran FROM pendaftaran_akun WHERE username = ? AND peran_pengaju = 'PJ_Ruangan'`,
      [username]
    );

    if (pendRows.length > 0) {
      const pendaftaran = pendRows[0];
      if (pendaftaran.status_pendaftaran === 'Menunggu') {
        return NextResponse.json(
          { success: false, error: 'Akun Anda sedang menunggu verifikasi dari Admin Fakultas.' },
          { status: 403 }
        );
      }
      if (pendaftaran.status_pendaftaran === 'Ditolak') {
        return NextResponse.json(
          { success: false, error: 'Pendaftaran akun PJ Ruangan Anda ditolak.' },
          { status: 403 }
        );
      }
    }

    // 2. Cari user di tabel users berdasarkan username (name)
    const [userRows]: any = await pool.query(
      `SELECT * FROM users WHERE name = ? AND role = 'PJ_Ruangan'`,
      [username]
    );

    const user = userRows[0];

    // Karena password disimulasikan plain text di seed dan bypass
    if (user && user.password === password) {
      return NextResponse.json({
        success: true,
        data: {
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    }

    return NextResponse.json(
      { success: false, error: 'Username atau Password salah!' },
      { status: 401 }
    );
  } catch (error) {
    console.error('API Login PJ Error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan internal peladen.' },
      { status: 500 }
    );
  }
}
