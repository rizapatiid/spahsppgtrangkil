"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ClipboardList, FileText, CheckCircle2, AlertCircle, X, Eye } from "lucide-react"

export default function LaporanClient({ laporanData }: { laporanData: any[] }) {
  const [filterDivisi, setFilterDivisi] = useState<string>("Semua")
  const [filterTanggal, setFilterTanggal] = useState<string>("Semua")

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const qDivisi = params.get("divisi")
    const qTanggal = params.get("tanggal")
    if (qDivisi) setFilterDivisi(qDivisi)
    if (qTanggal) setFilterTanggal(qTanggal)
  }, [])

  const uniqueDivisi = Array.from(new Set(laporanData.map(a => 
    a.divisi.nama_divisi.includes("Kebersihan") ? "Divisi Kebersihan & Satpam" : a.divisi.nama_divisi
  )))
  const uniqueTanggal = Array.from(new Set(laporanData.map(a => new Date(a.tanggal).toLocaleDateString("id-ID"))))

  const filteredData = laporanData.filter(item => {
    const namaDivisi = item.divisi.nama_divisi.includes("Kebersihan") ? "Divisi Kebersihan & Satpam" : item.divisi.nama_divisi
    const matchDivisi = filterDivisi === "Semua" || namaDivisi === filterDivisi
    const matchTanggal = filterTanggal === "Semua" || new Date(item.tanggal).toLocaleDateString("id-ID") === filterTanggal
    return matchDivisi && matchTanggal
  })

  const getRoleFromDivisi = (divisi: any) => {
    if (divisi.users && divisi.users.length > 0) {
      return divisi.users[0].role
    }
    const nama = divisi.nama_divisi.toUpperCase()
    if (nama.includes("PERSIAPAN")) return "PERSIAPAN"
    if (nama.includes("PENGOLAHAN")) return "PENGOLAHAN"
    if (nama.includes("PEMORSIAN")) return "PEMORSIAN"
    if (nama.includes("DISTRIBUSI")) return "DISTRIBUSI"
    if (nama.includes("PENCUCIAN")) return "PENCUCIAN"
    if (nama.includes("KEBERSIHAN")) return "KEBERSIHAN"
    if (nama.includes("SATPAM")) return "SATPAM"
    return "ASLAP"
  }

  return (
    <div className="space-y-6">
      
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2 pb-4 border-b border-slate-200/80 px-1">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ClipboardList size={18} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-[16px] font-extrabold text-slate-800 tracking-tight">Laporan Divisi</h2>
            <p className="text-[11px] sm:text-[12px] text-slate-500 font-medium">Rekap laporan aktivitas harian seluruh divisi</p>
          </div>
        </div>

        {/* Filter select */}
        <div className="flex flex-row items-center gap-2 w-full sm:w-auto">
          <select 
            value={filterDivisi} 
            onChange={(e) => setFilterDivisi(e.target.value)}
            className="flex-1 sm:flex-none border border-slate-200 bg-slate-50 rounded-lg text-[12px] font-bold text-slate-700 shadow-sm py-2 px-2.5 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none min-w-0"
          >
            <option value="Semua">Semua Divisi</option>
            {uniqueDivisi.map(d => <option key={d as string} value={d as string}>{d as string}</option>)}
          </select>
          
          <select 
            value={filterTanggal} 
            onChange={(e) => setFilterTanggal(e.target.value)}
            className="flex-1 sm:flex-none border border-slate-200 bg-slate-50 rounded-lg text-[12px] font-bold text-slate-700 shadow-sm py-2 px-2.5 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none min-w-0"
          >
            <option value="Semua">Semua Tanggal</option>
            {uniqueTanggal.map(t => <option key={t as string} value={t as string}>{t}</option>)}
          </select>
        </div>
      </div>
      
      {/* List Laporan Section (Styled like Division Riwayat Page) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[13px] font-extrabold text-slate-800 uppercase tracking-wider">Daftar Laporan Masuk</h3>
          <span className="text-[11px] sm:text-[12px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">{filteredData.length} Laporan</span>
        </div>
        
        {filteredData.length === 0 ? (
          <div className="p-8 flex flex-col items-center justify-center text-center bg-white border border-slate-200 rounded-2xl shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300 mb-2"><circle cx="12" cy="12" r="10"></circle><path d="M16 16s-1.5-2-4-2-4 2-4 2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
            <p className="text-[13px] font-bold text-slate-700">Belum Ada Laporan</p>
            <p className="text-[11px] text-slate-500 mt-1">Sistem belum mencatat laporan harian pada filter ini.</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-100">
              {filteredData.map((laporan) => {
                const role = getRoleFromDivisi(laporan.divisi)
                let allCats: any[] = []
                if (role === "KEBERSIHAN") allCats = [{ id: "kegiatan_kebersihan", label: "Foto Kegiatan Kebersihan", min: 3 }]
                else if (role === "SATPAM") allCats = [{ id: "kegiatan_satpam", label: "Foto Kegiatan Satpam", min: 3 }]
                else allCats = [{ id: "kegiatan", label: "Foto Kegiatan", min: 3 }]
                
                if (role === "PERSIAPAN") {
                  allCats.push({ id: "bahan_makanan", label: "Bahan Makanan (Bersih)", min: 1 })
                  allCats.push({ id: "sampah", label: "Foto Sampah", min: 1 })
                } else if (role === "PENGOLAHAN") {
                  allCats.push({ id: "masakan_matang", label: "Masakan Matang", min: 1 })
                  allCats.push({ id: "sampah", label: "Foto Sampah", min: 1 })
                } else if (role === "PEMORSIAN") {
                  allCats.push({ id: "makanan_diporsi", label: "Makanan Diporsi", min: 1 })
                  allCats.push({ id: "kondisi_sebelum_dikirim", label: "Kondisi Sebelum Dikirim", min: 1 })
                  allCats.push({ id: "tray_siap", label: "Tray Siap Distribusi", min: 1 })
                  allCats.push({ id: "sisa_pemorsian", label: "Sisa Pemorsian", min: 1 })
                } else if (role === "DISTRIBUSI") {
                  allCats.push({ id: "lokasi_distribusi", label: "Bukti di Lokasi", min: 1 })
                  allCats.push({ id: "tray_kembali", label: "Tray Kembali ke SPPG", min: 4 })
                } else if (role === "PENGOLAHAN") {
                  allCats.push({ id: "limbah_makanan", label: "Limbah Makanan", min: 4 })
                  allCats.push({ id: "tray_kembali", label: "Tray Kembali ke SPPG", min: 4 })
                } else if (role === "KEBERSIHAN" || role === "SATPAM") {
                  allCats.push({ id: "sampah_akhir", label: "Sampah Akhir", min: 1 })
                }

                const hasCatatan = laporan.isi_laporan && laporan.isi_laporan.trim().length > 0
                const isOptional = false

                return (
                  <div key={laporan.id} className="p-4 sm:p-5 hover:bg-slate-50/50 transition-colors flex flex-col gap-3">
                    
                    {/* Header Laporan */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <span className="font-extrabold text-[14.5px] sm:text-[15.5px] text-slate-800 block leading-tight">
                          {new Date(laporan.tanggal).toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                        <span className="text-[11px] sm:text-[12px] font-bold text-slate-500 mt-1 block">
                          Divisi: <span className="text-slate-700 font-extrabold">{laporan.divisi.nama_divisi}</span> • Total: {laporan.foto.length} File Terlampir
                        </span>
                      </div>
                      
                      <Link 
                        href={`/aslap/laporan/${laporan.id}`} 
                        className="inline-flex items-center justify-center gap-1.5 text-[11px] sm:text-[12px] bg-slate-900 text-white hover:bg-slate-800 transition-all px-3 py-2 rounded-lg font-bold shadow-sm shrink-0"
                      >
                        <Eye size={13} strokeWidth={2.5} />
                        Detail Laporan
                      </Link>
                    </div>
                    
                    {/* Collapsible Details */}
                    <details className="group">
                      <summary className="list-none [&::-webkit-details-marker]:hidden cursor-pointer flex items-center gap-1.5 text-[11px] font-extrabold text-slate-400 hover:text-slate-600 transition-colors select-none w-fit">
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-open:rotate-180 transition-transform duration-200"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        <span className="group-open:hidden">Lihat Kelengkapan</span>
                        <span className="hidden group-open:inline">Sembunyikan Kelengkapan</span>
                      </summary>

                      <div className="flex flex-col md:flex-row gap-6 mt-3.5 pt-3.5 border-t border-slate-100">
                        
                        {/* Checklist Kelengkapan */}
                        <div className="w-full md:w-1/2">
                          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2.5">Status Kelengkapan</p>
                          <div className="space-y-2">
                            {/* Catatan Checklist */}
                            <div className="flex items-center gap-2.5 text-[13px] font-semibold">
                              {hasCatatan ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500 shrink-0"><polyline points="20 6 9 17 4 12"></polyline></svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-rose-500 shrink-0"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                              )}
                              <span className={hasCatatan ? "text-slate-700" : "text-slate-400"}>Catatan Harian</span>
                            </div>
                            
                            {/* Kategori Foto Checklist */}
                            {allCats.map(cat => {
                              const uploadedCount = laporan.foto.filter((f:any) => f.tipe_foto === cat.id).length
                              const isMet = uploadedCount >= cat.min
                              
                              return (
                                <div key={cat.id} className="flex items-center gap-2.5 text-[13px] font-semibold">
                                  {isMet ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500 shrink-0"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                  ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-rose-500 shrink-0"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                  )}
                                  <span className={isMet ? "text-slate-700" : "text-slate-400"}>
                                    {cat.label} <span className="text-[11px] font-bold text-slate-400 ml-0.5">({uploadedCount}/{cat.min})</span>
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                        
                        {/* Keterangan Catatan Tertulis */}
                        <div className="w-full md:w-1/2 flex flex-col">
                          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Catatan Kegiatan</p>
                          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-[12.5px] font-semibold text-slate-600 flex-1 leading-relaxed whitespace-pre-wrap min-h-[70px]">
                            {laporan.isi_laporan || <span className="text-slate-400 italic font-medium">Tidak ada catatan tertulis.</span>}
                          </div>
                        </div>

                      </div>
                    </details>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
      
    </div>
  )
}
