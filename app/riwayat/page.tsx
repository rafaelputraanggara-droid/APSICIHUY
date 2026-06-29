"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getMappedRole, riwayatSubMenus } from "@/components/navigationData";

export default function RiwayatRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // 1. Dapatkan role dari session storage
    const savedUser = sessionStorage.getItem("simulated_user");
    let activeRole = "Mahasiswa"; // Default fallback
    
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        activeRole = getMappedRole(parsed.role);
      } catch (e) {
        console.error("Gagal membaca session:", e);
      }
    }

    // 2. Cari rute riwayat pertama yang diizinkan untuk role tersebut
    const allowedMenus = riwayatSubMenus.filter(
      (sub) => !sub.roles || sub.roles.includes(activeRole)
    );

    // 3. Redirect
    if (allowedMenus.length > 0) {
      router.replace(allowedMenus[0].href);
    } else {
      router.replace("/"); // Fallback ke home
    }
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-[var(--text-muted)] font-medium">Membuka Riwayat...</p>
    </div>
  );
}
