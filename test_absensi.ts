
import { prisma } from "./src/lib/prisma"

async function main() {
  const absensi = await prisma.absensi.findMany({
    orderBy: { jam_input: "desc" },
    take: 3
  })
  
  const foto = await prisma.fotoKegiatan.findMany({
    where: { tipe_foto: "absensi_briefing" },
    orderBy: { created_at: "desc" },
    take: 3
  })

  console.log("Absensi:", absensi.map(a => ({
    id: a.id,
    divisi: a.divisi_id,
    tanggal: a.tanggal
  })))

  console.log("Foto:", foto.map(f => ({
    id: f.id,
    divisi: f.divisi_id,
    tanggal: f.tanggal
  })))
}
main().catch(console.error).finally(() => prisma.$disconnect())

