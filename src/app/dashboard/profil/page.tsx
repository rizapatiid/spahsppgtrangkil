import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import ProfilClient from "@/components/ProfilClient"

export default async function ProfilDashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { 
      divisi: {
        include: {
          anggota: true
        }
      }
    }
  })

  if (!user) {
    return <div>User tidak ditemukan.</div>
  }

  return <ProfilClient user={user} />
}
