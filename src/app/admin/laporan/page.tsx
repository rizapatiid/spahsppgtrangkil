import { prisma } from "@/lib/prisma"
import LaporanClient from "./LaporanClient"

export default async function AdminLaporanPage() {
  const laporan = await prisma.laporanDivisi.findMany({
    include: { 
      divisi: {
        include: { users: true }
      },
      foto: true 
    },
    orderBy: { tanggal: 'desc' },
    take: 100
  })

  return <LaporanClient laporanData={laporan} />
}
