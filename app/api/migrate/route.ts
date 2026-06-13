import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const results = [];
    
    try {
      await pool.query('ALTER TABLE laporan_kerusakans ADD COLUMN catatan_pj TEXT NULL');
      results.push('Added catatan_pj to laporan_kerusakans');
    } catch (e: any) {
      results.push('catatan_pj error or already exists: ' + e.message);
    }

    try {
      await pool.query('ALTER TABLE laporan_kerusakans ADD COLUMN pelapor_id INT NULL');
      results.push('Added pelapor_id to laporan_kerusakans');
    } catch (e: any) {
      results.push('pelapor_id error or already exists: ' + e.message);
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
