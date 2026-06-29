import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: Request) {
  let username = '';
  let email_sso = '';
  let nim = '';

  try {
    const formData = await request.formData();
    
    username = formData.get('username') as string;
    const password = formData.get('password') as string;
    email_sso = formData.get('email_sso') as string;
    nim = formData.get('nim') as string;
    const peran_pengaju = formData.get('peran_pengaju') as string;
    const file_pdf = formData.get('file_pdf') as File;

    if (!username || !password || !email_sso || !nim || !peran_pengaju || !file_pdf) {
      return NextResponse.json(
        { success: false, error: 'Semua kolom wajib diisi!' },
        { status: 400 }
      );
    }

    // Convert PDF to Base64 (Vercel serverless functions cannot write to /public)
    const bytes = await file_pdf.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Pdf = buffer.toString('base64');
    const fileUrl = `data:application/pdf;base64,${base64Pdf}`;

    // 1. Cek di tabel users terlebih dahulu
    const [userRows]: any = await pool.query(
      "SELECT username, email, nim FROM users WHERE username = ? OR email = ? OR nim = ?",
      [username, email_sso, nim]
    );
    if (userRows.length > 0) {
      const user = userRows[0];
      if (user.username === username) return NextResponse.json({ success: false, error: 'Maaf, Username ini sudah digunakan.' }, { status: 400 });
      if (user.email === email_sso) return NextResponse.json({ success: false, error: 'Maaf, Email SSO ini sudah terdaftar.' }, { status: 400 });
      if (user.nim === nim) return NextResponse.json({ success: false, error: 'Maaf, NIM / ID ini sudah terdaftar.' }, { status: 400 });
    }

    // 2. Cek pendaftaran_akun yang masih 'Menunggu'
    const [pendingRows]: any = await pool.query(
      "SELECT username, email_sso, nim FROM pendaftaran_akun WHERE status_pendaftaran = 'Menunggu' AND (username = ? OR email_sso = ? OR nim = ?)",
      [username, email_sso, nim]
    );
    if (pendingRows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Pendaftaran Anda sedang diproses (Menunggu persetujuan Admin). Mohon cek secara berkala.' },
        { status: 400 }
      );
    }

    // 3. Hapus rekam pendaftaran_akun lama yang ditolak / sudah tidak ada di users
    await pool.query(
      "DELETE FROM pendaftaran_akun WHERE username = ? OR email_sso = ? OR nim = ?",
      [username, email_sso, nim]
    );

    const query = `
      INSERT INTO pendaftaran_akun (username, password, email_sso, nim, peran_pengaju, dokumen_pdf, status_pendaftaran)
      VALUES (?, ?, ?, ?, ?, ?, 'Menunggu')
    `;

    await pool.query(query, [username, password, email_sso, nim, peran_pengaju, fileUrl]);

    return NextResponse.json({ success: true, message: 'Pendaftaran berhasil disimpan.' });
  } catch (error: any) {
    console.error('API Register Error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan pada database.' },
      { status: 500 }
    );
  }
}
