import { prisma } from "@/lib/prisma"
import AbsensiClient from "./AbsensiClient"

export default async function AdminAbsensiPage() {
  // Ambil semua absensi (semua tanggal)
  const absensiData = await prisma.absensi.findMany({
    include: {
      divisi: true,
      detail: { include: { anggota: true } }
    },
    orderBy: { jam_input: 'desc' }
  })

  // Cari semua foto briefing absensi
  const fotoData = await prisma.fotoKegiatan.findMany({
    where: {
      tipe_foto: "absensi_briefing"
    }
  })

  return <AbsensiClient absensiData={absensiData} fotoData={fotoData} />
}
