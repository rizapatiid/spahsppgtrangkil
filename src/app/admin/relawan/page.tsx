import { prisma } from "@/lib/prisma"
import RelawanClient from "./RelawanClient"

export default async function RelawanPage() {
  const relawan = await prisma.anggotaDivisi.findMany({
    include: {
      divisi: true
    },
    orderBy: {
      divisi_id: 'asc'
    }
  })

  const divisiList = await prisma.divisi.findMany({
    orderBy: { nama_divisi: 'asc' }
  })

  return <RelawanClient relawan={relawan} divisiList={divisiList} />
}
