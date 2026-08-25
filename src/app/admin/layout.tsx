import { getServerSession } from "next-auth/next"
import { authOptions } from "../api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import Header from "@/components/Header"
import AdminSidebar from "@/components/AdminSidebar"

import { SidebarProvider } from "@/components/SidebarContext"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50/50 font-sans">
        
        {/* SIDEBAR ADMIN */}
        <AdminSidebar />

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col min-w-0">
          <Header session={session} />
          <main className="flex-1">
            <div className="p-4 md:p-8 max-w-6xl mx-auto pb-6 md:pb-10">
              {children}
            </div>
          </main>
        </div>

      </div>
    </SidebarProvider>
  )
}
