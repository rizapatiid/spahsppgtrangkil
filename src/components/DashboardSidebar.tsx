"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, FilePlus, CheckSquare, Settings, ChevronRight, History, X } from "lucide-react"
import { useSidebar } from "./SidebarContext"

export default function DashboardSidebar({ role }: { role: string }) {
  const pathname = usePathname()
  const { isOpen, close } = useSidebar()

  const handleLinkClick = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      close()
    }
  }

  const navItems = [
    { name: "Beranda", href: "/dashboard", icon: Home, exact: true },
    { name: "Absensi", href: "/dashboard/absensi", icon: CheckSquare, exact: false },
    { name: "Laporan Baru", href: "/dashboard/laporan", icon: FilePlus, exact: false },
    { name: "Riwayat", href: "/dashboard/riwayat", icon: History, exact: false },
  ]

  if (role === "ADMIN") {
    navItems.push({ name: "Manajemen", href: "/admin", icon: Settings, exact: false })
  }

  return (
    <>
      {/* Overlay untuk mobile */}
      <div 
        className={`md:hidden fixed inset-0 z-40 bg-gray-900/20 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`} 
        onClick={close} 
      />
      
      <aside 
        className={`fixed md:relative inset-y-0 left-0 bg-white flex flex-col z-50 shrink-0 overflow-hidden transition-all duration-300 ease-in-out shadow-2xl md:shadow-none ${
          isOpen 
            ? "translate-x-0 w-64 border-r border-gray-200" 
            : "-translate-x-full w-64 md:w-0 border-r-0 md:border-transparent opacity-0 md:opacity-100"
        }`}
      >
        {/* Kontainer fix 64 (256px) agar konten tidak melipat saat width mengecil */}
        <div className="w-64 flex flex-col h-full overflow-hidden">
          {/* Header Sidebar */}
          <div className="h-14 flex items-center justify-between px-6 border-b border-gray-200 shrink-0">
            <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-90 transition">
              <img 
                src="https://res.cloudinary.com/glcpjxnr/image/upload/v1787672024/sppg_trangkil/assets/gcvi4ohrnoapnxb8dfro.png" 
                alt="Logo SPAH" 
                className="h-10 w-auto object-contain" 
              />
            </Link>
            <button 
              onClick={close}
              className="p-1.5 -mr-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors md:block hidden active:scale-95"
              aria-label="Tutup Sidebar"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Menu Navigasi */}
          <div className="px-4 py-6 flex-1 overflow-y-auto">
            <nav className="space-y-2">
              {navItems.map((item) => {
                const isActive = item.exact 
                  ? pathname === item.href 
                  : pathname.startsWith(item.href)

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={handleLinkClick}
                    className={`group flex items-center justify-between px-3.5 py-2.5 text-[14.5px] font-medium rounded-lg transition-all duration-200 ${
                      isActive 
                        ? "text-slate-900 bg-slate-100 border border-slate-200 font-bold shadow-[0_1px_2px_rgba(0,0,0,0.05)]" 
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center space-x-3.5 whitespace-nowrap">
                      <item.icon 
                        className={`h-[18px] w-[18px] shrink-0 ${
                          isActive ? "text-slate-800" : "text-gray-500 group-hover:text-gray-700"
                        }`} 
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                      <span>{item.name}</span>
                    </div>
                    {isActive && <ChevronRight className="h-[16px] w-[16px] text-slate-700 shrink-0" strokeWidth={2.5} />}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </aside>
    </>
  )
}
