import { prisma } from "@/lib/prisma"
import AbsensiRelawanClient from "./AbsensiRelawanClient"

export default async function AbsensiRelawanPage() {
  const divisiList = await prisma.divisi.findMany({
    orderBy: { nama_divisi: 'asc' }
  })

  return <AbsensiRelawanClient divisiList={divisiList} />
}
