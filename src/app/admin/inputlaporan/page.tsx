import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import InputLaporanClient from "./InputLaporanClient"

export const dynamic = "force-dynamic"

export default async function InputLaporanPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  const divisiList = await prisma.divisi.findMany({
    orderBy: { nama_divisi: "asc" }
  })

  return <InputLaporanClient divisiList={divisiList} />
}
