"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { LogOut, User, Settings, ChevronDown, Menu } from "lucide-react"
import { useSidebar } from "./SidebarContext"
import { signOut } from "next-auth/react"

export default function Header({ session }: { session: any }) {
  const [isOpen, setIsOpen] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { toggle, isOpen: isSidebarOpen } = useSidebar()
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const role = session?.user?.role || "USER"
  const isServerAdmin = role === "ADMIN"
  const profilPath = isServerAdmin ? "/admin/profil" : "/dashboard/profil"
  const username = session?.user?.username || "Pengguna"
  
  // Ambil inisial untuk avatar
  const initial = username.charAt(0).toUpperCase()

  return (
    <>
      <header className="bg-white border-b border-gray-200 h-14 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30 shrink-0 shadow-sm print:hidden">
      <div className="flex items-center gap-1">
         <button 
           onClick={toggle}
           className={`p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-md transition ${isSidebarOpen ? 'md:hidden' : ''}`}
           aria-label="Toggle Sidebar"
         >
           <Menu size={20} />
         </button>
         <img 
           src="https://res.cloudinary.com/glcpjxnr/image/upload/v1787672024/sppg_trangkil/assets/gcvi4ohrnoapnxb8dfro.png" 
           alt="Logo SPAH" 
           className={`h-10 object-contain transition-all duration-300 ${isSidebarOpen ? 'hidden md:hidden' : 'block'}`} 
         />
      </div>
      
      <div className="relative" ref={dropdownRef}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 sm:gap-3 hover:bg-gray-50 p-1 sm:p-1.5 sm:pr-2 rounded-full transition border border-transparent hover:border-gray-200 outline-none"
        >
          <div className="text-right hidden sm:block ml-2">
            <p className="text-sm font-bold text-slate-900 leading-none mb-1">{username}</p>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider leading-none">{role}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold shadow-sm shrink-0">
            {initial}
          </div>
          <ChevronDown size={16} className={`text-gray-500 transition-transform hidden sm:block ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-3 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 z-50 transform opacity-100 scale-100 transition-all origin-top-right">
            <div className="px-4 py-2.5 border-b border-gray-100">
              <p className="text-sm font-bold text-slate-800 leading-none mb-1.5">{username}</p>
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider leading-none mt-1">{role}</p>
            </div>
            
            <div className="px-1.5 py-1">
              <Link 
                href={profilPath} 
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-md transition"
              >
                <User size={16} className="text-gray-400" /> Profil Saya
              </Link>
            </div>
            
            <div className="border-t border-gray-100 px-1.5 py-1 mt-1">
              <button 
                onClick={() => { setIsOpen(false); setShowConfirm(true); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition text-left cursor-pointer"
              >
                <LogOut size={16} /> Keluar
              </button>
            </div>
          </div>
        )}
      </div>
    </header>

    {/* Modal Konfirmasi Logout */}
    {showConfirm && (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop blur */}
        <div 
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
          onClick={() => setShowConfirm(false)}
        />
        
        {/* Modal Content */}
        <div className="bg-white border border-slate-100 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex flex-col items-center text-center">
            {/* Icon Circle */}
            <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mb-4 border border-rose-100">
              <LogOut size={22} className="text-rose-600 ml-0.5" />
            </div>
            
            <h3 className="text-[15px] font-black text-slate-800 tracking-tight">Konfirmasi Keluar</h3>
            <p className="text-[12px] text-slate-500 font-medium leading-relaxed mt-2 max-w-[260px]">
              Apakah Anda yakin ingin keluar dari sistem SPAH SPPG Trangkil?
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2.5 mt-6">
            <button
              type="button"
              onClick={() => setShowConfirm(false)}
              className="flex-1 py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[12px] font-bold rounded-xl border border-slate-200 transition active:scale-[0.98] cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white text-[12px] font-bold rounded-xl transition shadow-md shadow-rose-100 active:scale-[0.98] cursor-pointer"
            >
              Ya, Keluar
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}
