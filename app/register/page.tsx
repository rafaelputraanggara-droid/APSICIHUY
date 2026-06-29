"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState("Mahasiswa");

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirm_password: "",
    email_sso: "",
    nim: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

    if (formData.password !== formData.confirm_password) {
      setErrorMsg("Password dan Konfirmasi Password tidak cocok.");
      setIsSubmitting(false);
      return;
    }

    try {
      const dataToSend = new FormData();
      dataToSend.append("username", formData.username);
      dataToSend.append("password", formData.password);
      dataToSend.append("email_sso", formData.email_sso);
      dataToSend.append("nim", formData.nim);
      let backendRole = "Mahasiswa";
      if (role === "PJ Ruangan") backendRole = "PJ_Ruangan";
      if (role === "Laboran") backendRole = "Laboran";
      if (role === "Sarpras") backendRole = "Sarpras";
      dataToSend.append("peran_pengaju", backendRole);
      dataToSend.append("file_pdf", fileToUpload);

      const res = await fetch("/api/register", {
        method: "POST",
        body: dataToSend,
      });
      const data = await res.json();

      if (data.success) {
        setSuccessMsg(
          "Pendaftaran berhasil! Silakan tunggu sampai akun Anda disetujui oleh admin Fakultas."
        );
        // Alert as requested
        alert("Sistem telah menerima permintaan pendaftaran\n\nTunggu admin menyetujui pedaftaran akun yang kamu ajukan");
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
          <p className="text-sm text-white/70 mt-2">
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
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-350 mb-1">Peran / Jabatan</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              >
                <option value="Mahasiswa" className="text-black">Mahasiswa</option>
                <option value="PJ Ruangan" className="text-black">PJ Ruangan</option>
                <option value="Laboran" className="text-black">Laboran</option>
                <option value="Sarpras" className="text-black">Sarpras</option>
              </select>
            </div>
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
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all pr-12"
                  placeholder="Buat password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-white/50 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-350 mb-1">Konfirmasi Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirm_password"
                  required
                  value={formData.confirm_password}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all pr-12"
                  placeholder="Ketik ulang password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-white/50 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-350 mb-1">
                {role === "Mahasiswa" ? "Alamat Email SSO" : "Email"}
              </label>
              <input
                type="email"
                name="email_sso"
                required
                value={formData.email_sso}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder={role === "Mahasiswa" ? "contoh@student.uns.ac.id" : "contoh@staff.uns.ac.id"}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-350 mb-1">
                {role === "Mahasiswa" ? "NIM" : "NIP / ID Pegawai"}
              </label>
              <input
                type="text"
                name="nim"
                required
                value={formData.nim}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder={role === "Mahasiswa" ? "I032xxxx" : "Masukkan NIP/ID Anda"}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-350 mb-1">
                {role === "Mahasiswa" ? "Berkas Identitas KTM" : "Kartu Tanda Staff"} (PDF, Maks 2MB)
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
              <Link href="/login" className="text-xs text-white/60 hover:text-white underline">
                Sudah punya akun? Kembali ke Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[var(--bg-banner)] text-white font-bold">Memuat Halaman Pendaftaran...</div>}>
      <RegisterContent />
    </React.Suspense>
  );
}
