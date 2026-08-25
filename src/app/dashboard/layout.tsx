import { getServerSession } from "next-auth/next"
import { authOptions } from "../api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import Header from "@/components/Header"
import DashboardSidebar from "@/components/DashboardSidebar"

import { SidebarProvider } from "@/components/SidebarContext"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const role = session.user.role

  return (
    <SidebarProvider>
      <div className="flex h-full w-full bg-slate-50 font-sans">
        
        {/* SIDEBAR */}
        <DashboardSidebar role={role} />

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header session={session} />
          <main className="flex-1 overflow-y-auto">
            <div className="p-4 md:p-8 max-w-5xl mx-auto pb-6 md:pb-8">
              {children}
            </div>
          </main>
        </div>

      </div>
    </SidebarProvider>
  )
}
