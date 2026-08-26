"use server"

import { prisma } from "@/lib/prisma"

export async function fetchAbsensiMatrix(params: {
  divisiId?: number;
  type: 'monthly' | 'range';
  month?: number;
  year?: number;
  startDate?: string;
  endDate?: string;
}) {
  let start: Date;
  let end: Date;

  if (params.type === 'monthly' && params.month && params.year) {
    start = new Date(params.year, params.month - 1, 1);
    end = new Date(params.year, params.month, 0); // Last day of the month
  } else if (params.type === 'range' && params.startDate && params.endDate) {
    start = new Date(params.startDate);
    end = new Date(params.endDate);
  } else {
    // Default fallback to current month
    const now = new Date();
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  }

  // Adjust time to cover full days
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  // Helper to format local date to YYYY-MM-DD
  const formatLocal = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Generate date columns
  const dateColumns: { dateStr: string, label: string }[] = [];
  let current = new Date(start);
  
  // To avoid massive ranges breaking the UI, limit to max 31 days
  let count = 0;
  while (current <= end && count < 35) {
    const localDateStr = formatLocal(current);
    // If range crosses months, label as DD/MM, else just DD
    const label = params.type === 'range' && start.getMonth() !== end.getMonth() 
      ? `${current.getDate()}/${current.getMonth() + 1}`
      : `${current.getDate()}`;
      
    dateColumns.push({ dateStr: localDateStr, label });
    current.setDate(current.getDate() + 1);
    count++;
  }

  // Fetch Anggota
  const anggotaQuery = params.divisiId ? { divisi_id: params.divisiId } : {};

  const anggotaList = await prisma.anggotaDivisi.findMany({
    where: anggotaQuery,
    include: { divisi: true },
    orderBy: [
      { divisi_id: 'asc' },
      { nama: 'asc' }
    ]
  });

  // Fetch Absensi within the range
  const absensiList = await prisma.absensi.findMany({
    where: {
      tanggal: { gte: start, lte: end },
      ...(params.divisiId ? { divisi_id: params.divisiId } : {})
    },
    include: { detail: true }
  });

  // Build matrix: Relawan ID -> { ...relawanData, attendance: { [YYYY-MM-DD]: status } }
  const matrix = anggotaList.map(anggota => {
    const attendanceRecord: Record<string, string> = {};
    
    absensiList.forEach(absen => {
      const dateKey = formatLocal(absen.tanggal);
      const detail = absen.detail.find(d => d.anggota_id === anggota.id);
      if (detail) {
        attendanceRecord[dateKey] = detail.status;
      }
    });

    return {
      id: anggota.id,
      nama: anggota.nama,
      divisi: anggota.divisi.nama_divisi,
      attendance: attendanceRecord
    };
  });

  return { matrix, dateColumns, periodStart: formatLocal(start), periodEnd: formatLocal(end) };
}
