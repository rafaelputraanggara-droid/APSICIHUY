import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import DashboardLayout from "@/components/DashboardLayout";
import NextTopLoader from 'nextjs-toploader';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SIPRABU FT UNS",
  description: "Sistem Informasi Pengelolaan Barang Milik Negara Berbasis QR Code - FT UNS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900 transition-colors duration-300">
        <NextTopLoader color="#4f46e5" showSpinner={false} speed={300} zIndex={1600} />
        <DashboardLayout>
          {children}
        </DashboardLayout>
      </body>
    </html>
  );
}

