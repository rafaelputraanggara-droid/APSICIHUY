import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    let query = `
      SELECT l.*, b.nama_barang, b.id as id_barang, b.lokasi_ruangan as ruangan_asal
      FROM laporan_kerusakans l
      LEFT JOIN barangs b ON l.kode_barang = b.kode_barang AND l.no_urut_pendaft = b.no_urut_pendaft
    `;
    const params: any[] = [];
    if (status) {
      query += ` WHERE l.status_laporan = ?`;
      params.push(status);
    }
    query += ` ORDER BY l.created_at DESC`;

    const [rows] = await pool.query(query, params);
    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error('API Maintenance GET Error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan internal pada server.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  let id: any, status: any, nama_teknisi: any, bukti_penyelesaian_pdf: any, bukti_administrasi_pdf: any, catatan: any;
  
  try {
    const body = await request.json();
    id = body.id;
    status = body.status;
    nama_teknisi = body.nama_teknisi;
    bukti_penyelesaian_pdf = body.bukti_penyelesaian_pdf;
    bukti_administrasi_pdf = body.bukti_administrasi_pdf;
    catatan = body.catatan;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'ID laporan dan status wajib diisi.' },
        { status: 400 }
      );
    }

    const validStatuses = [
      'Menunggu', 'Diterima', 'Sedang Diperbaiki', 'Selesai', 'Ditolak',
      'Menunggu Konfirmasi PJ', 'Menunggu Tindakan Admin', 'Menunggu Perbaikan'
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Status tidak valid.' },
        { status: 400 }
      );
    }

    if (status === 'Selesai') {
      await pool.query(
        "UPDATE laporan_kerusakans SET status_laporan = ?, nama_teknisi = ?, bukti_penyelesaian_pdf = ?, bukti_administrasi_pdf = ? WHERE id = ?",
        [status, nama_teknisi, bukti_penyelesaian_pdf, bukti_administrasi_pdf, id]
      );
    } else if (catatan !== undefined) {
      await pool.query(
        "UPDATE laporan_kerusakans SET status_laporan = ?, catatan_pj = ? WHERE id = ?",
        [status, catatan, id]
      );
    } else {
      await pool.query(
        "UPDATE laporan_kerusakans SET status_laporan = ? WHERE id = ?",
        [status, id]
      );
    }
    // Sync kondisi barang di master data
    try {
      const [laporanRows]: any = await pool.query(
        "SELECT kode_barang, no_urut_pendaft FROM laporan_kerusakans WHERE id = ?",
        [id]
      );
      if (laporanRows.length > 0) {
        const laporan = laporanRows[0];
        if (['Menunggu Tindakan Admin', 'Sedang Diperbaiki'].includes(status)) {
          await pool.query(
            "UPDATE barangs SET kondisi = 'Rusak' WHERE kode_barang = ? AND no_urut_pendaft = ?", 
            [laporan.kode_barang, laporan.no_urut_pendaft]
          );
        } else if (status === 'Selesai' || status === 'Ditolak') {
          await pool.query(
            "UPDATE barangs SET kondisi = 'Baik' WHERE kode_barang = ? AND no_urut_pendaft = ?", 
            [laporan.kode_barang, laporan.no_urut_pendaft]
          );
        }
      }
    } catch (syncErr) {
      console.error("Gagal sinkronisasi kondisi barang:", syncErr);
    }

    return NextResponse.json({ success: true, message: 'Status berhasil diperbarui.' });
  } catch (error: any) {
    console.error('API Maintenance PUT Error:', error);

    // AUTO-MIGRATE: Self-healing database schema if columns are missing
    if (error.message && error.message.includes("Unknown column 'catatan_pj'")) {
      try {
        console.log("Auto-migrating: Adding catatan_pj to laporan_kerusakans...");
        await pool.query('ALTER TABLE laporan_kerusakans ADD COLUMN catatan_pj TEXT NULL');
        
        try {
          await pool.query('ALTER TABLE laporan_kerusakans ADD COLUMN pelapor_id INT NULL');
        } catch (e) { /* ignore if already exists */ }

        // Retry the update after migration
        if (catatan !== undefined) {
          await pool.query(
            "UPDATE laporan_kerusakans SET status_laporan = ?, catatan_pj = ? WHERE id = ?",
            [status, catatan, id]
          );
        } else {
          await pool.query(
            "UPDATE laporan_kerusakans SET status_laporan = ? WHERE id = ?",
            [status, id]
          );
        }
        return NextResponse.json({ success: true, message: 'Status berhasil diperbarui setelah auto-migrate kolom.' });
      } catch (retryError: any) {
        return NextResponse.json(
          { success: false, error: 'Gagal auto-migrate kolom: ' + retryError.message },
          { status: 500 }
        );
      }
    }

    // AUTO-MIGRATE: Fix ENUM definition if status is invalid
    if (error.message && (error.message.includes("Data truncated for column 'status_laporan'") || error.message.includes("Data truncated for column '%s'"))) {
      try {
        console.log("Auto-migrating: Updating ENUM for status_laporan...");
        await pool.query("ALTER TABLE laporan_kerusakans MODIFY status_laporan ENUM('Menunggu Konfirmasi PJ', 'Menunggu Tindakan Admin', 'Menunggu Perbaikan', 'Sedang Diperbaiki', 'Selesai', 'Ditolak', 'Menunggu', 'Diproses', 'Diterima') DEFAULT 'Menunggu Konfirmasi PJ'");
        
        // Retry the update after migration
        if (status === 'Selesai') {
          await pool.query(
            "UPDATE laporan_kerusakans SET status_laporan = ?, nama_teknisi = ?, bukti_penyelesaian_pdf = ?, bukti_administrasi_pdf = ? WHERE id = ?",
            [status, nama_teknisi, bukti_penyelesaian_pdf, bukti_administrasi_pdf, id]
          );
        } else if (catatan !== undefined) {
          await pool.query(
            "UPDATE laporan_kerusakans SET status_laporan = ?, catatan_pj = ? WHERE id = ?",
            [status, catatan, id]
          );
        } else {
          await pool.query(
            "UPDATE laporan_kerusakans SET status_laporan = ? WHERE id = ?",
            [status, id]
          );
        }
        return NextResponse.json({ success: true, message: 'Status berhasil diperbarui setelah auto-migrate ENUM.' });
      } catch (retryError: any) {
        return NextResponse.json(
          { success: false, error: 'Gagal auto-migrate ENUM: ' + retryError.message },
          { status: 500 }
        );
      }
    }

    if (error.message && (error.message.includes("Unknown column 'nama_teknisi'") || error.message.includes("Unknown column 'bukti_administrasi_pdf'"))) {
      try {
        console.log("Auto-migrating: Adding columns to laporan_kerusakans...");
        try { await pool.query('ALTER TABLE laporan_kerusakans ADD COLUMN nama_teknisi VARCHAR(255) NULL'); } catch(e){}
        try { await pool.query('ALTER TABLE laporan_kerusakans ADD COLUMN bukti_penyelesaian_pdf LONGTEXT NULL'); } catch (e) {}
        try { await pool.query('ALTER TABLE laporan_kerusakans ADD COLUMN bukti_administrasi_pdf LONGTEXT NULL'); } catch (e) {}

        // Retry the update after migration
        if (status === 'Selesai') {
          await pool.query(
            "UPDATE laporan_kerusakans SET status_laporan = ?, nama_teknisi = ?, bukti_penyelesaian_pdf = ?, bukti_administrasi_pdf = ? WHERE id = ?",
            [status, nama_teknisi, bukti_penyelesaian_pdf, bukti_administrasi_pdf, id]
          );
        } else if (catatan !== undefined) {
          await pool.query(
            "UPDATE laporan_kerusakans SET status_laporan = ?, catatan_pj = ? WHERE id = ?",
            [status, catatan, id]
          );
        } else {
          await pool.query(
            "UPDATE laporan_kerusakans SET status_laporan = ? WHERE id = ?",
            [status, id]
          );
        }
        return NextResponse.json({ success: true, message: 'Status berhasil diperbarui setelah auto-migrate teknisi.' });
      } catch (retryError: any) {
        return NextResponse.json(
          { success: false, error: 'Gagal auto-migrate kolom teknisi: ' + retryError.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui status: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}
