import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // 1. Cek tabel users
    const userQuery = `
      SELECT id, name, email, role 
      FROM users 
      WHERE (email = ? OR name = ?) AND password = ?
    `;
    const [userRows]: any = await pool.query(userQuery, [username, username, password]);

    if (userRows.length > 0) {
      const user = userRows[0];
      return NextResponse.json({ 
        success: true, 
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      });
    }

    // 2. Jika tidak ada di users, cek tabel pendaftaran_akun
    const pendingQuery = `
      SELECT id, username, email_sso, status_pendaftaran 
      FROM pendaftaran_akun 
      WHERE (email_sso = ? OR username = ?) AND password = ?
    `;
    const [pendingRows]: any = await pool.query(pendingQuery, [username, username, password]);

    if (pendingRows.length > 0) {
      const user = pendingRows[0];
      if (user.status_pendaftaran === 'Menunggu') {
        return NextResponse.json(
          { success: false, error: 'Akun Anda sedang menunggu persetujuan dari Admin.' },
          { status: 403 }
        );
      }
      if (user.status_pendaftaran === 'Ditolak') {
        return NextResponse.json(
          { success: false, error: 'Pendaftaran akun Anda ditolak oleh Admin.' },
          { status: 403 }
        );
      }
      // Should not be 'Disetujui' because they should be in users table.
      // But if somehow they are:
      if (user.status_pendaftaran === 'Disetujui') {
         return NextResponse.json(
          { success: false, error: 'Akun Anda telah disetujui namun belum diproses ke sistem utama. Lapor Admin.' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: 'Username/Email atau Password salah!' },
      { status: 401 }
    );
  } catch (error) {
    console.error('API Auth Login Error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan sistem internal.' },
      { status: 500 }
    );
  }
}
