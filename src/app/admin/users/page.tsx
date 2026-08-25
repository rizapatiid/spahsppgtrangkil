import { prisma } from "@/lib/prisma"
import UsersClient from "./UsersClient"

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    include: { 
      divisi: {
        include: { anggota: true }
      } 
    },
    orderBy: { role: 'asc' }
  })

  return <UsersClient users={users} />
}
