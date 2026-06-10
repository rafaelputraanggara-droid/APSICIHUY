"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState("Mahasiswa");

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "PJ_Ruangan") {
      setRole("PJ Ruangan");
    } else {
      setRole("Mahasiswa");
    }
  }, [searchParams]);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email_sso: "",
    nim: "",
  });
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMsg("Ukuran file PDF maksimal 2MB.");
        return;
      }
      if (file.type !== "application/pdf") {
        setErrorMsg("Harap unggah file dalam format PDF.");
        return;
      }
      setFileToUpload(file);
      setErrorMsg("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    if (!fileToUpload) {
      setErrorMsg("Anda wajib mengunggah Berkas Identitas (PDF).");
      setIsSubmitting(false);
      return;
    }

    try {
      const dataToSend = new FormData();
      dataToSend.append("username", formData.username);
      dataToSend.append("password", formData.password);
      dataToSend.append("email_sso", formData.email_sso);
      dataToSend.append("nim", formData.nim);
      dataToSend.append("peran_pengaju", role === "PJ Ruangan" ? "PJ_Ruangan" : "Mahasiswa");
      dataToSend.append("file_pdf", fileToUpload);

      const res = await fetch("/api/register", {
        method: "POST",
        body: dataToSend,
      });
      const data = await res.json();

      if (data.success) {
        setSuccessMsg(
          "Pendaftaran berhasil! Silakan tunggu sampai akun Anda diverifikasi oleh admin. Sebuah email pemberitahuan telah (disimulasikan) dikirim ke email SSO Anda."
        );
        // Alert to simulate email
        alert(`[SIMULASI EMAIL TERKIRIM KE ${formData.email_sso}]\n\nHalo ${formData.username},\nPendaftaran Anda telah kami terima dan sedang menunggu verifikasi dari Admin Fakultas.\n\nTerima kasih!`);
      } else {
        setErrorMsg(data.error || "Gagal melakukan pendaftaran.");
      }
    } catch (err) {
      setErrorMsg("Terjadi kesalahan sistem. Coba lagi nanti.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-banner)] transition-colors duration-400 p-4">
      <div className="w-full max-w-lg bg-white/10 dark:bg-black/35 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        
        {/* Decorative background lights */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-600/20 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-violet-600/20 rounded-full blur-2xl pointer-events-none"></div>

        <div className="text-center mb-8 relative z-10">
          <h1 className="text-2xl font-black tracking-tight text-white">Buat Akun {role}</h1>
          <p className="text-sm text-[var(--text-muted)] mt-2">
            Isi formulir di bawah ini dengan lengkap untuk mendaftar ke SIPRABU.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-4 bg-rose-950/30 border border-rose-900/40 text-rose-400 rounded-2xl text-xs font-bold text-center">
            {errorMsg}
          </div>
        )}

        {successMsg ? (
          <div className="relative z-10 text-center animate-fade-in space-y-6">
            <div className="p-6 bg-emerald-950/30 border border-emerald-900/40 rounded-2xl">
              <svg className="w-16 h-16 text-emerald-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-lg font-bold text-white mb-2">Pendaftaran Sukses!</h2>
              <p className="text-emerald-200 text-sm">{successMsg}</p>
            </div>
            <Link href="/login" className="inline-block py-3 px-8 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all">
              Kembali ke Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-350 mb-1">Username</label>
              <input
                type="text"
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="Buat username"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-350 mb-1">Password</label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="Buat password"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-350 mb-1">Alamat Email SSO</label>
              <input
                type="email"
                name="email_sso"
                required
                value={formData.email_sso}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="contoh@student.uns.ac.id"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-350 mb-1">
                {role === "PJ Ruangan" ? "NIP / NUP / ID Pegawai" : "NIM"}
              </label>
              <input
                type="text"
                name="nim"
                required
                value={formData.nim}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder={role === "PJ Ruangan" ? "Masukkan ID Pegawai Anda" : "I032xxxx"}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-350 mb-1">
                Berkas Identitas {role === "PJ Ruangan" ? "Pegawai" : "KTM"} (PDF, Maks 2MB)
              </label>
              <input
                type="file"
                accept="application/pdf"
                required
                onChange={handleFileChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 mt-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-bold shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "Memproses..." : "Daftar Akun"}
            </button>

            <div className="text-center mt-4">
              <Link href="/login" className="text-xs text-[var(--text-muted)] hover:text-white underline">
                Sudah punya akun? Kembali ke Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
