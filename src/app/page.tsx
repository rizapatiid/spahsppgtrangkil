import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (session) {
    if (session.user.role === "ADMIN") {
      redirect("/admin")
    } else if (session.user.role === "ASLAP") {
      redirect("/aslap")
    } else {
      redirect("/dashboard")
    }
  }

  redirect("/login")
}
