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
      const token = crypto.randomUUID();
      const query = `UPDATE pendaftaran_akun SET status_pendaftaran = 'Menunggu Verifikasi Email', verification_token = ? WHERE id = ?`;
      await pool.query(query, [token, id]);

      const [rows] = await pool.query(`SELECT * FROM pendaftaran_akun WHERE id = ?`, [id]);
      const pendaftaran = (rows as any[])[0];

      // Kirim Email via Ethereal (Nodemailer otomatis)
      const testAccount = await nodemailer.createTestAccount();
      const transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, 
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      const verificationLink = `http://localhost:3000/verify-email?token=${token}`;
      
      const info = await transporter.sendMail({
        from: '"Admin SIPRABU FT UNS" <admin@siprabu.uns.ac.id>',
        to: pendaftaran.email_sso,
        subject: "Verifikasi Akun SIPRABU FT UNS",
        text: `Halo ${pendaftaran.username},\n\nAkun Anda telah disetujui oleh Admin. Silakan klik link berikut untuk memverifikasi email Anda dan mengaktifkan akun:\n\n${verificationLink}\n\nTerima kasih.`,
        html: `<p>Halo <b>${pendaftaran.username}</b>,</p><p>Akun Anda telah disetujui oleh Admin.</p><p>Silakan klik link berikut untuk memverifikasi email Anda dan mengaktifkan akun:</p><p><a href="${verificationLink}">${verificationLink}</a></p><p>Terima kasih.</p>`,
      });

      console.log("Preview URL Email Verifikasi: %s", nodemailer.getTestMessageUrl(info));

      return NextResponse.json({ success: true, message: 'Pendaftaran berhasil disetujui dan email verifikasi telah dikirim.' });
    }
  } catch (error) {
    console.error('API Verify Account Error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan internal.' },
      { status: 500 }
    );
  }
}
