import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const query = `
      SELECT 
        l.id, 
        l.kode_barang, 
        l.no_urut_pendaft, 
        l.dilaporkan_oleh, 
        l.deskripsi_kerusakan, 
        l.foto_url, 
        l.status_laporan, 
        l.created_at,
        b.nama_barang
      FROM laporan_kerusakans l
      LEFT JOIN barangs b 
        ON l.kode_barang = b.kode_barang 
        AND l.no_urut_pendaft = b.no_urut_pendaft
      ORDER BY l.created_at DESC
    `;
    
    const [rows] = await pool.query(query);
    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    console.error('Database query error (GET /api/laporan-masuk):', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan internal server saat mengambil data laporan.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { kode_barang, no_urut_pendaft, dilaporkan_oleh, deskripsi_kerusakan, foto_url, pelapor_id } = body;

    if (!kode_barang || no_urut_pendaft === undefined || !dilaporkan_oleh || !deskripsi_kerusakan) {
      return NextResponse.json(
        { success: false, error: 'Field kode_barang, no_urut_pendaft, dilaporkan_oleh, dan deskripsi_kerusakan wajib diisi.' },
        { status: 400 }
      );
    }

    const nup = parseInt(no_urut_pendaft);
    if (isNaN(nup)) {
      return NextResponse.json(
        { success: false, error: 'no_urut_pendaft harus berupa angka.' },
        { status: 400 }
      );
    }

    // Insert to database
    const [result]: any = await pool.query(
      `INSERT INTO laporan_kerusakans (kode_barang, no_urut_pendaft, dilaporkan_oleh, deskripsi_kerusakan, foto_url, status_laporan, pelapor_id) 
       VALUES (?, ?, ?, ?, ?, 'Menunggu', ?)`,
      [kode_barang, nup, dilaporkan_oleh.trim(), deskripsi_kerusakan.trim(), (foto_url || '').trim(), pelapor_id || null]
    );

    const insertId = result.insertId;

    // Log the initial stage in sla_logs
    try {
      await pool.query(
        `INSERT INTO sla_logs (laporan_id, tahap) VALUES (?, 'Pelaporan')`,
        [insertId]
      );
    } catch (slaErr) {
      console.error('Failed to log SLA stage:', slaErr);
    }

    return NextResponse.json({ success: true, data: { id: insertId } });
  } catch (error: any) {
    console.error('Database query error (POST /api/laporan-masuk):', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan internal server: ' + (error?.message || 'Unknown error') },
      { status: 500 }
    );
  }
}
