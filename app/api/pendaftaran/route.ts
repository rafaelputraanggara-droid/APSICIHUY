import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const query = `
      SELECT id, username, email_sso, nim, peran_pengaju, dokumen_pdf, status_pendaftaran, created_at 
      FROM pendaftaran_akun 
      WHERE status_pendaftaran = 'Menunggu'
      ORDER BY created_at DESC
    `;
    const [rows] = await pool.query(query);
    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error('API Pendaftaran Error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan pada database.' },
      { status: 500 }
    );
  }
}
