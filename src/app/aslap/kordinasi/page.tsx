import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import KordinasiClient from "./KordinasiClient"

export const dynamic = 'force-dynamic'

export default async function KordinasiPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  // Fetch semua arahan
  const arahan = await prisma.arahan.findMany({
    include: {
      divisi: true
    },
    orderBy: {
      created_at: 'desc'
    }
  })

  // Fetch daftar divisi untuk form dropdown
  const divisiList = await prisma.divisi.findMany({
    orderBy: {
      nama_divisi: 'asc'
    }
  })

  return <KordinasiClient arahan={arahan} divisiList={divisiList} />
}
