import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import PengaturanLiburClient from "./PengaturanLiburClient"
import { getHariLibur, getSemuaRelawan } from "./actions"

export default async function PengaturanLiburPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  const [data, divisiData] = await Promise.all([
    getHariLibur(),
    getSemuaRelawan()
  ])

  return <PengaturanLiburClient initialData={data} divisiData={divisiData} />
}
