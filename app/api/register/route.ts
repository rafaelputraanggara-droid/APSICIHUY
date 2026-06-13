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

    const query = `
      INSERT INTO pendaftaran_akun (username, password, email_sso, nim, peran_pengaju, dokumen_pdf, status_pendaftaran)
      VALUES (?, ?, ?, ?, ?, ?, 'Menunggu')
    `;

    await pool.query(query, [username, password, email_sso, nim, peran_pengaju, fileUrl]);

    return NextResponse.json({ success: true, message: 'Pendaftaran berhasil disimpan.' });
  } catch (error: any) {
    console.error('API Register Error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      // DEBUG LOGIC: Cari tahu bentroknya di mana
      try {
        const [conflictRows] = await pool.query(
          "SELECT id, status_pendaftaran, peran_pengaju, username, email_sso, nim FROM pendaftaran_akun WHERE username = ? OR email_sso = ? OR nim = ?",
          [username, email_sso, nim]
        );
        const conflict = (conflictRows as any[])[0];
        
        if (conflict) {
          if (conflict.status_pendaftaran === 'Menunggu') {
            return NextResponse.json(
              { success: false, error: `Pendaftaran Anda sedang diproses (Menunggu persetujuan Admin). Mohon cek secara berkala.` },
              { status: 400 }
            );
          } else if (conflict.status_pendaftaran === 'Disetujui') {
            // Ini adalah "ghost" record jika mereka tidak muncul di UI!
            return NextResponse.json(
              { success: false, error: `Akun sudah terdaftar aktif sebagai ${conflict.peran_pengaju}. Jika Anda merasa ini kesalahan sistem (ghost record), lapor ke Admin.` },
              { status: 400 }
            );
          }
        }
      } catch (e) {}

      return NextResponse.json(
        { success: false, error: 'Username, Email SSO, atau NIM/NIP sudah terdaftar!' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan pada database.' },
      { status: 500 }
    );
  }
}
