import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

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

    if (action === 'reject') {
      await pool.query(`DELETE FROM pendaftaran_akun WHERE id = ?`, [id]);
      return NextResponse.json({ success: true, message: 'Pendaftaran berhasil ditolak dan dihapus dari antrean.' });
    } else {
      const [rows] = await pool.query(`SELECT * FROM pendaftaran_akun WHERE id = ?`, [id]);
      const pendaftaran = (rows as any[])[0];

      if (!pendaftaran) {
        return NextResponse.json({ success: false, error: 'Data pendaftaran tidak ditemukan.' }, { status: 404 });
      }

      // Langsung masukkan ke tabel users
      await pool.query(
        `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
        [pendaftaran.username, pendaftaran.email_sso, pendaftaran.password, pendaftaran.peran_pengaju]
      );

      // Update status pendaftaran menjadi Disetujui
      await pool.query(
        `UPDATE pendaftaran_akun SET status_pendaftaran = 'Disetujui' WHERE id = ?`,
        [id]
      );

      return NextResponse.json({ success: true, message: 'Pendaftaran berhasil disetujui. Akun telah aktif dan bisa digunakan untuk login.' });
    }
  } catch (error) {
    console.error('API Verify Account Error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan internal.' },
      { status: 500 }
    );
  }
}
