"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Info, X, Camera, MapPin, Clock, FileText, ShieldCheck } from "lucide-react"

export default function InfoKetentuan() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all backdrop-blur-sm"
        title="Ketentuan Absensi"
      >
        <Info size={16} />
      </button>

      {isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 p-4 sm:p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
                  <Info size={18} />
                </div>
                <h3 className="text-white font-bold text-lg">Ketentuan Absensi</h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-4 sm:p-5 text-slate-600 space-y-4 text-[13px] leading-relaxed overflow-y-auto">
              
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Clock size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 mb-0.5 text-sm">Batas Waktu</h4>
                  <p>Absensi wajib dilakukan setiap hari kerja. Sistem mencatat jam secara otomatis berdasarkan Waktu Indonesia Barat (WIB).</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Camera size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 mb-0.5 text-sm">Foto Bukti (Wajib)</h4>
                  <p>Unggah 1 foto jelas yang menampilkan tim yang hadir pada briefing. Foto akan diberi <span className="italic">watermark</span> jam dan nama divisi secara otomatis oleh sistem.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <FileText size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 mb-0.5 text-sm">Status Kehadiran</h4>
                  <p>Pastikan mengisi status setiap anggota dengan benar (Hadir, Sakit, Izin, atau Alpha). Status yang sudah disimpan tidak dapat diubah kembali pada hari yang sama.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <MapPin size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 mb-0.5 text-sm">Lokasi Absensi</h4>
                  <p>Pastikan melakukan absensi (pengambilan foto) di tempat atau area divisi masing-masing.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 mb-0.5 text-sm">Kelengkapan APD</h4>
                  <p>Pastikan seluruh anggota menggunakan APD (Alat Pelindung Diri) lengkap sesuai dengan ketentuan perusahaan.</p>
                </div>
              </div>

            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
              <button 
                onClick={() => setIsOpen(false)}
                className="px-6 py-2 bg-slate-900 text-white rounded-lg font-bold text-sm hover:bg-slate-800 transition-colors"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      , document.body)}
    </>
  )
}
