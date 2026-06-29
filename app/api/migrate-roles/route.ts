import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    await pool.query("ALTER TABLE pendaftaran_akun MODIFY COLUMN peran_pengaju ENUM('Mahasiswa', 'PJ_Ruangan', 'Laboran', 'Sarpras') DEFAULT 'Mahasiswa'");
    return NextResponse.json({ success: true, message: 'Migration successful' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
