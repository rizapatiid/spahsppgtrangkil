"use server"

import { prisma } from "@/lib/prisma"

export async function fetchAbsensiMatrix(month: number, year: number, divisiId?: number) {
  // Get start and end of the month
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0) // Last day of the month

  // Fetch Anggota
  const anggotaQuery = divisiId 
    ? { divisi_id: divisiId }
    : {}

  const anggotaList = await prisma.anggotaDivisi.findMany({
    where: anggotaQuery,
    include: {
      divisi: true
    },
    orderBy: [
      { divisi_id: 'asc' },
      { nama: 'asc' }
    ]
  })

  // Fetch Absensi within the month
  const absensiList = await prisma.absensi.findMany({
    where: {
      tanggal: {
        gte: startDate,
        lte: endDate
      },
      ...(divisiId ? { divisi_id: divisiId } : {})
    },
    include: {
      detail: true
    }
  })

  // Format data into a matrix
  // Relawan ID -> { ...relawanData, attendance: { [dateString]: status } }
  
  const matrix = anggotaList.map(anggota => {
    const attendanceRecord: Record<number, string> = {}
    
    // Find all attendance details for this anggota in the fetched absensi
    absensiList.forEach(absen => {
      const day = new Date(absen.tanggal).getDate()
      const detail = absen.detail.find(d => d.anggota_id === anggota.id)
      
      if (detail) {
        attendanceRecord[day] = detail.status
      }
    })

    return {
      id: anggota.id,
      nama: anggota.nama,
      divisi: anggota.divisi.nama_divisi,
      attendance: attendanceRecord
    }
  })

  return { matrix, daysInMonth: endDate.getDate() }
}
