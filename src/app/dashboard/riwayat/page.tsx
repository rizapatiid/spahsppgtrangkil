import { getServerSession } from "next-auth/next"
import { authOptions } from "../../api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import RiwayatClient from "./RiwayatClient"

export default async function RiwayatPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user.divisi_id) {
    return <div>Data divisi tidak ditemukan</div>
  }

  const riwayatAbsensi = await prisma.absensi.findMany({
    where: { divisi_id: session.user.divisi_id },
    include: { detail: { include: { anggota: true } } },
    orderBy: { tanggal: 'desc' }
  })

  // Ambil foto absensi
  const fotoAbsensi = await prisma.fotoKegiatan.findMany({
    where: {
      divisi_id: session.user.divisi_id,
      tipe_foto: 'absensi_briefing'
    }
  })

  // Dapatkan shared divisi id untuk laporan (khusus Satpam & Kebersihan)
  const { getSharedDivisiId } = await import("@/app/dashboard/laporan/actions")
  const sharedDivisiId = await getSharedDivisiId(session)

  // Ambil riwayat laporan menggunakan sharedDivisiId
  const riwayatLaporan = await prisma.laporanDivisi.findMany({
    where: { divisi_id: sharedDivisiId },
    include: { foto: true },
    orderBy: { tanggal: 'desc' }
  })

  return (
    <RiwayatClient 
      session={session}
      riwayatAbsensi={riwayatAbsensi}
      fotoAbsensi={fotoAbsensi}
      riwayatLaporan={riwayatLaporan}
    />
  )
}
