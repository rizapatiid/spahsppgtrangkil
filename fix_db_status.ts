
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  await prisma.anggotaAbsensi.updateMany({
    where: { status: "HADIR" },
    data: { status: "Hadir" }
  })
  await prisma.anggotaAbsensi.updateMany({
    where: { status: "SAKIT" },
    data: { status: "Sakit" }
  })
  await prisma.anggotaAbsensi.updateMany({
    where: { status: "IZIN" },
    data: { status: "Izin" }
  })
  await prisma.anggotaAbsensi.updateMany({
    where: { status: "ALPHA" },
    data: { status: "Alfa" }
  })
  console.log("DB status fixed!")
}

main().catch(console.error).finally(() => prisma.$disconnect())

