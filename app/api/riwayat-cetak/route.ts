import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "kerusakan" | "mutasi" | "stock-opname"
    const startDateStr = searchParams.get("startDate");
    const endDateStr = searchParams.get("endDate");

    if (!type || !startDateStr || !endDateStr) {
      return NextResponse.json({ success: false, error: "Missing parameters" }, { status: 400 });
    }

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    endDate.setHours(23, 59, 59, 999);

    const dbPath = path.join(process.cwd(), 'database', 'dummy_db.json');
    const fileContents = await fs.readFile(dbPath, 'utf8');
    const data = JSON.parse(fileContents);

    let filteredData: any[] = [];

    if (type === "kerusakan") {
      filteredData = data.maintenance.filter((m: any) => {
        const d = new Date(m.tanggal_dilaporkan);
        return m.status === "Selesai" && d >= startDate && d <= endDate;
      });
    } else if (type === "mutasi") {
      filteredData = data.mutasi_barang.filter((m: any) => {
        const d = new Date(m.tanggal_mutasi);
        return d >= startDate && d <= endDate;
      });
    } else if (type === "stock-opname") {
      filteredData = data.stock_opname_sessions.filter((m: any) => {
        if (!m.tanggal_selesai) return false;
        const d = new Date(m.tanggal_selesai);
        return m.status === "Selesai" && d >= startDate && d <= endDate;
      });
    }

    return NextResponse.json({ success: true, data: filteredData });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Gagal mengambil data laporan" }, { status: 500 });
  }
}
