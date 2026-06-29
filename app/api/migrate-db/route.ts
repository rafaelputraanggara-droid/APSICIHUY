import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const query = `ALTER TABLE laporan_kerusakans MODIFY COLUMN status_laporan VARCHAR(100) DEFAULT 'Menunggu'`;
    await pool.query(query);
    return NextResponse.json({ success: true, message: 'Column altered successfully to VARCHAR(100)' });
  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
