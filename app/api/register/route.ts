import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    const email_sso = formData.get('email_sso') as string;
    const nim = formData.get('nim') as string;
    const peran_pengaju = formData.get('peran_pengaju') as string;
    const file_pdf = formData.get('file_pdf') as File;

    if (!username || !password || !email_sso || !nim || !peran_pengaju || !file_pdf) {
      return NextResponse.json(
        { success: false, error: 'Semua kolom wajib diisi!' },
        { status: 400 }
      );
    }

    // Save the PDF file
    const bytes = await file_pdf.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = join(process.cwd(), 'public/uploads/pdf');
    await mkdir(uploadDir, { recursive: true });

    // Generate safe filename
    const safeNim = nim.replace(/[^a-zA-Z0-9]/g, '');
    const filename = `${Date.now()}_${safeNim}.pdf`;
    const filepath = join(uploadDir, filename);

    await writeFile(filepath, buffer);
    const fileUrl = `/uploads/pdf/${filename}`;

    const query = `
      INSERT INTO pendaftaran_akun (username, password, email_sso, nim, peran_pengaju, dokumen_pdf, status_pendaftaran)
      VALUES (?, ?, ?, ?, ?, ?, 'Menunggu')
    `;

    await pool.query(query, [username, password, email_sso, nim, peran_pengaju, fileUrl]);

    return NextResponse.json({ success: true, message: 'Pendaftaran berhasil disimpan.' });
  } catch (error: any) {
    console.error('API Register Error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
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
