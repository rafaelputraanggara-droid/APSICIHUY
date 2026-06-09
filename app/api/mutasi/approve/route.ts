import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, action, user_name } = body;

    // 1. Validate input fields
    if (!id || !action || !user_name) {
      return NextResponse.json({ success: false, error: 'ID, aksi (approve/reject), dan nama user wajib diisi' }, { status: 400 });
    }

    const mutationId = parseInt(id);
    if (isNaN(mutationId)) {
      return NextResponse.json({ success: false, error: 'ID mutasi tidak valid' }, { status: 400 });
    }

    // 2. Fetch the current mutation record
    const [mutationRows]: any = await pool.query(
      'SELECT * FROM mutasis WHERE id = ?',
      [mutationId]
    );

    if (mutationRows.length === 0) {
      return NextResponse.json({ success: false, error: 'Pengajuan mutasi tidak ditemukan' }, { status: 404 });
    }

    const mutation = mutationRows[0];
    const { status_mutasi, kode_barang, no_urut_pendaft, ruangan_tujuan } = mutation;

    // 3. Process according to current step/status
    if (status_mutasi === 'Pending_Asal') {
      const nextStatus = action === 'approve' ? 'Pending_Tujuan' : 'Ditolak_Asal';
      
      await pool.query(
        'UPDATE mutasis SET status_mutasi = ?, disetujui_asal_oleh = ? WHERE id = ?',
        [nextStatus, user_name.trim(), mutationId]
      );

      return NextResponse.json({ 
        success: true, 
        message: action === 'approve' 
          ? 'Persetujuan ruangan asal berhasil diberikan. Sekarang menunggu penerimaan ruangan tujuan.' 
          : 'Pengajuan mutasi berhasil ditolak oleh PJ Ruangan Asal.' 
      });
    } 
    
    else if (status_mutasi === 'Pending_Tujuan') {
      if (action === 'approve') {
        // Final approval: Transaction is required to update mutation status and item location
        const connection = await pool.getConnection();
        try {
          await connection.beginTransaction();

          // A. Update mutation record status to Disetujui
          await connection.query(
            'UPDATE mutasis SET status_mutasi = \'Disetujui\', disetujui_tujuan_oleh = ? WHERE id = ?',
            [user_name.trim(), mutationId]
          );

          // B. Update barang location officially in barangs table
          await connection.query(
            'UPDATE barangs SET lokasi_ruangan = ? WHERE kode_barang = ? AND no_urut_pendaft = ?',
            [ruangan_tujuan, kode_barang, no_urut_pendaft]
          );

          await connection.commit();
          return NextResponse.json({ 
            success: true, 
            message: 'Barang berhasil diterima di ruangan tujuan! Lokasi barang resmi telah diperbarui.' 
          });
        } catch (err) {
          await connection.rollback();
          throw err;
        } finally {
          connection.release();
        }
      } else {
        // Rejected at destination
        await pool.query(
          'UPDATE mutasis SET status_mutasi = \'Ditolak_Tujuan\', disetujui_tujuan_oleh = ? WHERE id = ?',
          [user_name.trim(), mutationId]
        );

        return NextResponse.json({ 
          success: true, 
          message: 'Penerimaan barang berhasil ditolak oleh PJ Ruangan Tujuan.' 
        });
      }
    } 
    
    else {
      return NextResponse.json({ success: false, error: 'Pengajuan mutasi ini sudah selesai diproses sebelumnya.' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Database query error (POST /api/mutasi/approve):', error);
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan internal server saat memproses persetujuan mutasi.' }, { status: 500 });
  }
}
