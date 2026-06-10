import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, action } = body; // action: 'approve' | 'reject'

    if (!id || !action) {
      return NextResponse.json(
        { success: false, error: 'ID pendaftaran dan aksi wajib diisi!' },
        { status: 400 }
      );
    }

    const statusMap = action === 'approve' ? 'Disetujui' : 'Ditolak';
    const query = `UPDATE pendaftaran_akun SET status_pendaftaran = ? WHERE id = ?`;
    await pool.query(query, [statusMap, id]);

    // Jika disetujui, kita bisa memindahkan data dari pendaftaran_akun ke tabel users.
    // Karena kita saat ini memisahkan role Mahasiswa, kita asumsikan Mahasiswa bisa login pakai tabel pendaftaran_akun yg disetujui,
    // Atau insert ke tabel users jika struktur memungkinkan.
    // Untuk simulasi ini, status_pendaftaran 'Disetujui' sudah cukup untuk login-mahasiswa API.

    return NextResponse.json({ success: true, message: `Pendaftaran berhasil di${action === 'approve' ? 'setujui' : 'tolak'}.` });
  } catch (error) {
    console.error('API Verify Account Error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan internal.' },
      { status: 500 }
    );
  }
}
