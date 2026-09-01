"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, FileText } from "lucide-react"

export default function RiwayatClient({ 
  session, 
  riwayatAbsensi, 
  fotoAbsensi, 
  riwayatLaporan 
}: { 
  session: any, 
  riwayatAbsensi: any[], 
  fotoAbsensi: any[], 
  riwayatLaporan: any[] 
}) {
  const [filterTanggal, setFilterTanggal] = useState<string>("Semua")
  const [absensiModal, setAbsensiModal] = useState<any>(null)
  const [previewFotoUrl, setPreviewFotoUrl] = useState<string | null>(null)

  const formatTime = (dateVal: any) => {
    if (!dateVal) return "--:--"
    const d = new Date(dateVal)
    if (isNaN(d.getTime())) return "--:--"
    return d.toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }) + " WIB"
  }


  // Kumpulkan semua tanggal unik dari Absensi dan Laporan
  const allDates = new Set<string>()
  riwayatAbsensi.forEach(a => allDates.add(new Date(a.tanggal).toLocaleDateString("id-ID")))
  riwayatLaporan.forEach(l => allDates.add(new Date(l.tanggal).toLocaleDateString("id-ID")))
  
  // Sort tanggal
  const uniqueTanggal = Array.from(allDates).sort((a, b) => 0)

  // Filter Data
  const filteredAbsensi = riwayatAbsensi.filter(a => 
    filterTanggal === "Semua" || new Date(a.tanggal).toLocaleDateString("id-ID") === filterTanggal
  )
  
  const filteredLaporan = riwayatLaporan.filter(l => 
    filterTanggal === "Semua" || new Date(l.tanggal).toLocaleDateString("id-ID") === filterTanggal
  )

  return (
    <>
      <div className="space-y-6">
        
        {/* Judul Halaman */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2 pb-6 border-b border-slate-200/80 px-1">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/></svg>
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Riwayat Harian</h2>
              <p className="text-[12px] sm:text-[13px] text-slate-500 font-medium">Rekap absensi & laporan Divisi {session?.user.role}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-[13px] font-medium text-slate-500">Filter:</span>
            <select 
              value={filterTanggal} 
              onChange={(e) => setFilterTanggal(e.target.value)}
              className="border border-slate-200 bg-slate-50 rounded-lg text-[13px] font-medium text-slate-700 shadow-sm py-2 px-3 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none"
            >
              <option value="Semua">Semua Tanggal</option>
              {uniqueTanggal.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-10">
          {/* DAFTAR ABSENSI */}
          <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-[16px] font-extrabold text-slate-800">Riwayat Absensi</h2>
              <span className="text-[11px] sm:text-[12px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">{filteredAbsensi.length} Tersimpan</span>
            </div>
            
            {filteredAbsensi.length === 0 ? (
              <div className="p-8 flex flex-col items-center justify-center text-center bg-white border border-slate-200 rounded-xl shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300 mb-2"><circle cx="12" cy="12" r="10"></circle><path d="M16 16s-1.5-2-4-2-4 2-4 2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
                <p className="text-[13px] font-bold text-slate-700">Belum Ada Absensi</p>
                <p className="text-[11px] text-slate-500 mt-1">Sistem belum mencatat data absensi pada filter ini.</p>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="divide-y divide-slate-100">
                  {filteredAbsensi.map(absen => {
                    const fotos = fotoAbsensi.filter(f => new Date(f.tanggal).toISOString().split('T')[0] === new Date(absen.tanggal).toISOString().split('T')[0])
                    const hadir = absen.detail.filter((d:any) => d.status === "Hadir").length
                    const sakit = absen.detail.filter((d:any) => d.status === "Sakit").length
                    const izin = absen.detail.filter((d:any) => d.status === "Izin").length
                    const alfa = absen.detail.filter((d:any) => d.status === "Alfa").length
                    
                    return (
                      <div 
                        key={absen.id} 
                        onClick={() => setAbsensiModal({ absen, fotos })}
                        className="p-4 sm:p-5 hover:bg-slate-50 transition-all flex items-center gap-4 cursor-pointer"
                      >
                        {/* Thumbnail */}
                        {fotos && fotos.length > 0 ? (
                          <div className="flex gap-2 flex-shrink-0">
                            {fotos.map((f:any, idx:number) => (
                              <div 
                                key={idx}
                                className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm relative group/thumb cursor-zoom-in"
                                onClick={(e) => { e.stopPropagation(); setPreviewFotoUrl(f.url_foto); }}
                              >
                                <img src={f.url_foto} alt="Absensi" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                          </div>
                        )}

                        {/* Tanggal */}
                        <div className="flex-1 min-w-0">
                          <span className="font-bold text-[14px] sm:text-[15px] text-slate-800 block truncate">
                            {new Date(absen.tanggal).toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          </span>
                          <span className="text-[11px] sm:text-[12px] font-medium text-slate-500 block mt-0.5">
                            Dicatat pukul {formatTime(absen.jam_input)}
                          </span>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full">{hadir} Hadir</span>
                            {sakit > 0 && <span className="text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-full">{sakit} Sakit</span>}
                            {izin > 0 && <span className="text-[11px] font-bold text-purple-600 bg-purple-50 border border-purple-100 px-1.5 py-0.5 rounded-full">{izin} Izin</span>}
                            {alfa > 0 && <span className="text-[11px] font-bold text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded-full">{alfa} Alfa</span>}
                          </div>
                        </div>

                        {/* Tombol Detail */}
                        <button
                          type="button"
                          className="inline-flex items-center justify-center gap-1.5 text-[11px] sm:text-[12px] bg-slate-900 text-white hover:bg-slate-800 transition-all px-3 py-2 rounded-lg font-bold shadow-sm shrink-0"
                        >
                          <Eye size={13} strokeWidth={2.5} />
                          Detail
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>

            )}
          </section>

          {/* DAFTAR LAPORAN */}
          <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-[16px] font-extrabold text-slate-800">Riwayat Laporan</h2>
              <span className="text-[11px] sm:text-[12px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">{filteredLaporan.length} Tersimpan</span>
            </div>

            {filteredLaporan.length === 0 ? (
              <div className="p-8 flex flex-col items-center justify-center text-center bg-white border border-slate-200 rounded-xl shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300 mb-2"><circle cx="12" cy="12" r="10"></circle><path d="M16 16s-1.5-2-4-2-4 2-4 2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
                <p className="text-[13px] font-bold text-slate-700">Belum Ada Laporan</p>
                <p className="text-[11px] text-slate-500 mt-1">Sistem belum mencatat laporan harian pada filter ini.</p>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="divide-y divide-slate-100">
                  {filteredLaporan.map(laporan => {
                    const dateString = new Date(laporan.tanggal).toISOString().split('T')[0]
                    
                    // LOGIKA CEK KELENGKAPAN LAPORAN PER ITEM
                    const role = session.user.role
                    const baseCats = [{ id: "kegiatan", label: "Foto Kegiatan", min: 3 }]
                    let allCats = [...baseCats]
                    
                    if (role === "PERSIAPAN") {
                      allCats.push({ id: "bahan_makanan", label: "Bahan Makanan (Bersih)", min: 0 })
                      allCats.push({ id: "sampah", label: "Foto Sampah", min: 0 })
                    } else if (role === "PENGOLAHAN") {
                      allCats.push({ id: "masakan_matang", label: "Masakan Matang", min: 0 })
                      allCats.push({ id: "sampah", label: "Foto Sampah", min: 0 })
                    } else if (role === "PEMORSIAN") {
                      allCats.push({ id: "makanan_diporsi", label: "Makanan Diporsi", min: 0 })
                      allCats.push({ id: "kondisi_sebelum_dikirim", label: "Kondisi Sebelum Dikirim", min: 0 })
                      allCats.push({ id: "tray_siap", label: "Tray Siap Distribusi", min: 0 })
                      allCats.push({ id: "sisa_pemorsian", label: "Sisa Pemorsian", min: 0 })
                    } else if (role === "DISTRIBUSI") {
                      allCats.push({ id: "lokasi_distribusi", label: "Bukti di Lokasi", min: 0 })
                      allCats.push({ id: "tray_kembali", label: "Tray Kembali ke SPPG", min: 4 })
                    } else if (role === "PENCUCIAN") {
                      allCats.push({ id: "limbah_makanan", label: "Limbah Makanan", min: 4 })
                      allCats.push({ id: "tray_kembali", label: "Tray Kembali ke SPPG", min: 4 })
                    } else if (role === "KEBERSIHAN" || role === "SATPAM") {
                      allCats.push({ id: "sampah_akhir", label: "Sampah Akhir", min: 0 })
                    }

                    const hasCatatan = laporan.isi_laporan && laporan.isi_laporan.trim().length > 0

                    return (
                      <div key={laporan.id} className="p-4 sm:p-5 hover:bg-slate-50/50 transition-colors flex flex-col gap-3">
                        
                        {/* Header Laporan - tombol selalu kanan */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <span className="font-bold text-[14px] sm:text-[15px] text-slate-800 block">
                              {new Date(laporan.tanggal).toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
                            <span className="text-[11px] sm:text-[12px] font-medium text-slate-500">
                              Total: {laporan.foto.length} File Terlampir
                            </span>
                          </div>
                          <Link href={`/dashboard/riwayat/${dateString}`} className="inline-flex items-center justify-center gap-1.5 text-[11px] sm:text-[12px] bg-slate-900 text-white hover:bg-slate-800 transition-all px-3 py-2 rounded-lg font-bold shadow-sm shrink-0">
                            <FileText size={13} strokeWidth={2.5} />
                            Detail Laporan
                          </Link>
                        </div>
                        
                        {/* Kelengkapan & Catatan - hide/show, default tertutup */}
                        <details className="group">
                          <summary className="list-none [&::-webkit-details-marker]:hidden cursor-pointer flex items-center gap-2 text-[11px] font-bold text-slate-400 hover:text-slate-600 transition-colors select-none w-fit">
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-open:rotate-180 transition-transform duration-200"><polyline points="6 9 12 15 18 9"></polyline></svg>
                            <span className="group-open:hidden">Lihat Detail</span>
                            <span className="hidden group-open:inline">Sembunyikan</span>
                          </summary>

                          <div className="flex flex-col md:flex-row gap-6 mt-3 pt-3 border-t border-slate-100">
                            
                            {/* Checklist */}
                            <div className="w-full md:w-1/2">
                              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Status Kelengkapan</p>
                              <div className="space-y-2">
                                {/* Ceklist Catatan */}
                                <div className="flex items-center gap-2.5 text-[13px]">
                                  {hasCatatan ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500 shrink-0"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                  ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 shrink-0"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                  )}
                                  <span className={hasCatatan ? "text-slate-700 font-medium" : "text-slate-500"}>Catatan Harian</span>
                                </div>
                                
                                {/* Ceklist Kategori Foto */}
                                {allCats.map(cat => {
                                  const uploadedCount = laporan.foto.filter((f:any) => f.tipe_foto === cat.id).length
                                  const isMet = uploadedCount >= cat.min
                                  const isOptional = cat.min === 0
                                  
                                  if (isOptional && uploadedCount === 0) {
                                    return (
                                      <div key={cat.id} className="flex items-center gap-2.5 text-[13px] text-slate-400">
                                        <div className="w-3.5 flex items-center justify-center shrink-0">
                                          <span className="font-bold text-[14px]">-</span>
                                        </div>
                                        <span>{cat.label} <span className="text-[11px] italic">(Opsional)</span></span>
                                      </div>
                                    )
                                  }

                                  return (
                                    <div key={cat.id} className="flex items-center gap-2.5 text-[13px]">
                                      {isMet ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500 shrink-0"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                      ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 shrink-0"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                      )}
                                      <span className={isMet ? "text-slate-700 font-medium" : "text-slate-500"}>
                                        {cat.label} 
                                        <span className="text-[11px] text-slate-400 font-normal ml-1">
                                          ({uploadedCount}{cat.min > 0 ? `/${cat.min}` : ''})
                                        </span>
                                      </span>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>

                            {/* Catatan Teks */}
                            <div className="w-full md:w-1/2">
                              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Pratinjau Catatan</p>
                              <div className="text-[13px] text-slate-600 line-clamp-4 font-medium bg-slate-50 border border-slate-100 p-3.5 rounded-lg whitespace-pre-wrap leading-[1.6]">
                                {laporan.isi_laporan ? laporan.isi_laporan : <span className="italic text-slate-400 font-normal">Tidak ada catatan tertulis.</span>}
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
          </section>
        </div>
    </div>

    {/* MODAL DETAIL ABSENSI */}
    {absensiModal && (() => {
      const { absen, fotos } = absensiModal
      const hadir = absen.detail.filter((d:any) => d.status === "Hadir").length
      const sakit = absen.detail.filter((d:any) => d.status === "Sakit").length
      const izin = absen.detail.filter((d:any) => d.status === "Izin").length
      const alfa = absen.detail.filter((d:any) => d.status === "Alfa").length
      const statusColor: any = {
        Hadir: "text-emerald-600 bg-emerald-50 border-emerald-100",
        Sakit: "text-amber-600 bg-amber-50 border-amber-100",
        Izin: "text-purple-600 bg-purple-50 border-purple-100",
        Alfa: "text-red-600 bg-red-50 border-red-100",
      }
      return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            {/* Header Modal */}
            <div className="bg-slate-900 p-4 sm:p-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                </div>
                <div>
                  <h3 className="text-white font-bold text-[14px]">Detail Absensi</h3>
                  <p className="text-slate-400 text-[11px] font-medium mt-0.5">
                    {new Date(absen.tanggal).toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setAbsensiModal(null)} 
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            {/* Body Modal */}
            <div className="p-4 sm:p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              
              {/* Foto & Ringkasan */}
              <div className="flex items-center gap-4">
                {fotos && fotos.length > 0 ? (
                  <div className="flex gap-3 shrink-0">
                    {fotos.map((f:any, idx:number) => (
                      <div 
                        key={idx}
                        onClick={() => setPreviewFotoUrl(f.url_foto)} 
                        className="relative group block w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm cursor-zoom-in"
                      >
                        <img src={f.url_foto} alt="Foto Absensi" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="w-28 h-28 sm:w-32 sm:h-32 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2 flex-1">
                  {[{ label: "Hadir", val: hadir, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
                    { label: "Sakit", val: sakit, color: "text-amber-600 bg-amber-50 border-amber-100" },
                    { label: "Izin", val: izin, color: "text-purple-600 bg-purple-50 border-purple-100" },
                    { label: "Alfa", val: alfa, color: "text-red-600 bg-red-50 border-red-100" }
                  ].map(s => (
                    <div key={s.label} className={`flex items-center justify-center gap-1.5 border rounded-lg py-2 px-1 ${s.color}`}>
                      <span className="text-[14px] font-extrabold">{s.val}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider">{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Daftar Anggota */}
              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Status Per Anggota</p>
                <div className="space-y-1.5">
                  {absen.detail.map((d: any, i: number) => (
                    <div key={i} className="flex items-center justify-between gap-3 py-2 px-3 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-[13px] font-semibold text-slate-700 flex-1 min-w-0 truncate">{d.anggota?.nama || "Anggota"}</span>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusColor[d.status] || "text-slate-600 bg-slate-50 border-slate-200"}`}>
                        {d.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Footer Modal */}
            <div className="border-t border-slate-100 p-4">
              <button
                type="button"
                onClick={() => setAbsensiModal(null)}
                className="w-full bg-slate-900 text-white py-2.5 rounded-lg text-[13px] font-bold hover:bg-slate-800 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )
    })()}

      {/* Foto Lightbox Fullscreen */}
      {previewFotoUrl && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewFotoUrl(null)}
        >
          <div
            className="relative max-w-lg w-full bg-white rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Tombol Close X */}
            <button
              onClick={() => setPreviewFotoUrl(null)}
              className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all bg-slate-900 hover:bg-slate-700 text-white shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>

            <div className="bg-slate-900 max-h-[70vh] overflow-hidden flex items-center justify-center">
              <img src={previewFotoUrl} alt="Foto Absensi" className="w-full max-h-[70vh] object-contain" />
            </div>
            <div className="flex gap-2.5 p-4 border-t border-slate-100 bg-white">
              <a
                href={previewFotoUrl}
                download="foto-absensi.jpg"
                target="_blank"
                rel="noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1.5 text-[13px] font-bold bg-slate-900 text-white hover:bg-slate-800 py-2.5 rounded-lg shadow transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Simpan Foto
              </a>
              <a
                href={previewFotoUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1.5 text-[13px] font-bold bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 py-2.5 rounded-lg transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                Buka Tab Baru
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
