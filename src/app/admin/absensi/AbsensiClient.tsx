"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { CalendarCheck, RotateCcw, X, Image as ImageIcon, Eye } from "lucide-react"
import { resetAbsensi } from "./actions"
import ConfirmModal from "@/components/ConfirmModal"

export default function AbsensiClient({ absensiData, fotoData }: { absensiData: any[], fotoData: any[] }) {
  const [selectedAbsen, setSelectedAbsen] = useState<any | null>(null)
  const [previewFotoUrl, setPreviewFotoUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean
    title?: string
    message: string
    onConfirm: () => void
    type?: "danger" | "warning" | "info"
  }>({
    isOpen: false,
    message: "",
    onConfirm: () => {}
  })
  
  // States for filter
  const [filterDivisi, setFilterDivisi] = useState<string>("Semua")
  const [filterTanggal, setFilterTanggal] = useState<string>("Semua")

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const qDivisi = params.get("divisi")
    const qTanggal = params.get("tanggal")
    const qOpenDetail = params.get("openDetail")
    
    if (qDivisi) setFilterDivisi(qDivisi)
    if (qTanggal) setFilterTanggal(qTanggal)

    if (qOpenDetail === "true" && qDivisi && qTanggal) {
      const matched = absensiData.find(
        a => 
          a.divisi.nama_divisi === qDivisi && 
          new Date(a.tanggal).toLocaleDateString("id-ID") === qTanggal
      )
      if (matched) {
        setSelectedAbsen(matched)
      }
    }
  }, [absensiData])

  // Extract unique filter options
  const uniqueDivisi = Array.from(new Set(absensiData.map(a => a.divisi.nama_divisi)))
  const uniqueTanggal = Array.from(new Set(absensiData.map(a => new Date(a.tanggal).toLocaleDateString("id-ID"))))

  // Apply filters
  const filteredData = absensiData.filter(absen => {
    const matchDivisi = filterDivisi === "Semua" || absen.divisi.nama_divisi === filterDivisi
    const matchTanggal = filterTanggal === "Semua" || new Date(absen.tanggal).toLocaleDateString("id-ID") === filterTanggal
    return matchDivisi && matchTanggal
  })

  const formatTime = (dateVal: any) => {
    if (!dateVal) return "--:--"
    const d = new Date(dateVal)
    if (isNaN(d.getTime())) return "--:--"
    return d.toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }) + " WIB"
  }

  const handleDownload = async (e: React.MouseEvent, url: string, filename: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(objectUrl);
    } catch (err) {
      window.open(url, "_blank");
    }
  };

  const handleReset = (absen: any) => {
    setConfirmConfig({
      isOpen: true,
      title: "Reset Absensi",
      message: `Yakin ingin mereset/menghapus absensi ${absen.divisi.nama_divisi} pada ${new Date(absen.tanggal).toLocaleDateString("id-ID")}? Divisi harus absen ulang.`,
      type: "danger",
      onConfirm: async () => {
        setConfirmConfig(prev => ({ ...prev, isOpen: false }))
        setIsLoading(true)
        const res = await resetAbsensi(absen.id, absen.divisi_id, absen.tanggal)
        setIsLoading(false)

        if (res.error) {
          alert(res.error)
        } else {
          alert("Absensi berhasil direset!")
          window.location.reload()
        }
      }
    })
  }

  return (
    <div className="space-y-6">
      
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2 pb-4 border-b border-slate-200/80 px-1">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <CalendarCheck size={18} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-[16px] font-extrabold text-slate-800 tracking-tight">Rekap Absensi</h2>
            <p className="text-[11px] sm:text-[12px] text-slate-500 font-medium">Rekap kehadiran harian seluruh divisi</p>
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
      
      {/* Timeline Card List (Styled like Division Riwayat Page) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[13px] font-extrabold text-slate-800 uppercase tracking-wider">Daftar Absensi Masuk</h3>
          <span className="text-[11px] sm:text-[12px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">{filteredData.length} Data</span>
        </div>

        {filteredData.length === 0 ? (
          <div className="p-8 flex flex-col items-center justify-center text-center bg-white border border-slate-200 rounded-2xl shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300 mb-2"><circle cx="12" cy="12" r="10"></circle><path d="M16 16s-1.5-2-4-2-4 2-4 2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
            <p className="text-[13px] font-bold text-slate-700">Belum Ada Absensi</p>
            <p className="text-[11px] text-slate-500 mt-1">Sistem belum mencatat data absensi pada filter ini.</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-100">
              {filteredData.map((absen) => {
                const fotos = fotoData.filter(f => f.divisi_id === absen.divisi_id && new Date(f.tanggal).toISOString().split('T')[0] === new Date(absen.tanggal).toISOString().split('T')[0])
                
                const hadir = absen.detail.filter((d: any) => d.status === "Hadir").length
                const sakit = absen.detail.filter((d: any) => d.status === "Sakit").length
                const izin = absen.detail.filter((d: any) => d.status === "Izin").length
                const alfa = absen.detail.filter((d: any) => d.status === "Alfa").length

                return (
                  <div 
                    key={absen.id} 
                    onClick={() => setSelectedAbsen({ ...absen, fotos })}
                    className="p-4 sm:p-5 hover:bg-slate-50/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                  >
                    
                    {/* Sisi Kiri: Thumbnail & Keterangan */}
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      {/* Thumbnail */}
                      {fotos && fotos.length > 0 ? (
                        <div className="flex gap-3 shrink-0">
                          {fotos.map((f:any, idx:number) => (
                            <div 
                              key={idx}
                              className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm relative group cursor-zoom-in"
                              onClick={(e) => { e.stopPropagation(); setPreviewFotoUrl(f.url_foto); }}
                            >
                              <img src={f.url_foto} alt="Absensi" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center shadow-sm shrink-0 text-slate-300">
                          <ImageIcon size={20} />
                        </div>
                      )}

                      {/* Detail Informasi */}
                      <div className="min-w-0 flex-1">
                        <span className="font-extrabold text-[14.5px] sm:text-[15.5px] text-slate-800 block leading-tight">
                          {new Date(absen.tanggal).toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                        <span className="text-[11px] sm:text-[12px] font-bold text-slate-500 mt-1 block">
                          Divisi: <span className="text-slate-700 font-extrabold">{absen.divisi.nama_divisi}</span> • Dicatat pukul {formatTime(absen.jam_input)}
                        </span>
                        
                        {/* Status Badges */}
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full">{hadir} Hadir</span>
                          {sakit > 0 && <span className="text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-full">{sakit} Sakit</span>}
                          {izin > 0 && <span className="text-[11px] font-bold text-purple-600 bg-purple-50 border border-purple-100 px-1.5 py-0.5 rounded-full">{izin} Izin</span>}
                          {alfa > 0 && <span className="text-[11px] font-bold text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded-full">{alfa} Alfa</span>}
                        </div>
                      </div>
                    </div>

                    {/* Sisi Kanan: Tombol Aksi */}
                    <div 
                      className="flex items-center gap-2 self-end sm:self-auto shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button 
                        onClick={() => setSelectedAbsen({ ...absen, fotos })}
                        className="inline-flex items-center justify-center gap-1.5 text-[11px] sm:text-[12px] bg-slate-900 text-white hover:bg-slate-800 transition-all px-3.5 py-2 rounded-lg font-bold shadow-sm shrink-0 cursor-pointer"
                      >
                        <Eye size={13} strokeWidth={2.5} />
                        Detail
                      </button>
                      {fotos && fotos.length > 0 && (
                        <button
                          onClick={(e) => handleDownload(e, fotos[0].url_foto, `absensi-${absen.divisi.nama_divisi.replace(/\s+/g, "_")}-${new Date(absen.tanggal).toLocaleDateString("id-ID").replace(/\//g, "-")}.jpg`)}
                          className="inline-flex items-center justify-center gap-1.5 text-[11px] sm:text-[12px] bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 transition-all px-3.5 py-2 rounded-lg font-bold shadow-sm shrink-0"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                          Simpan
                        </button>
                      )}
                      <button 
                        onClick={() => handleReset(absen)}
                        disabled={isLoading}
                        className="inline-flex items-center justify-center gap-1.5 text-[11px] sm:text-[12px] bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-105 transition-all px-3.5 py-2 rounded-lg font-bold shadow-sm shrink-0 cursor-pointer disabled:opacity-50"
                      >
                        <RotateCcw size={13} strokeWidth={2.5} />
                        Reset
                      </button>
                    </div>

                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>      {/* Modal Popup Detail Absensi (Styled like Division Riwayat Modal) */}
      {selectedAbsen && (() => {
        const { fotos } = selectedAbsen
        const hadir = selectedAbsen.detail.filter((d: any) => d.status === "Hadir").length
        const sakit = selectedAbsen.detail.filter((d: any) => d.status === "Sakit").length
        const izin = selectedAbsen.detail.filter((d: any) => d.status === "Izin").length
        const alfa = selectedAbsen.detail.filter((d: any) => d.status === "Alfa").length
        
        const statusColor: any = {
          Hadir: "text-emerald-600 bg-emerald-50 border-emerald-100",
          Sakit: "text-amber-600 bg-amber-50 border-amber-100",
          Izin: "text-purple-600 bg-purple-50 border-purple-100",
          Alfa: "text-red-600 bg-red-50 border-red-100",
        }
        return (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
              
              {/* Header Modal */}
              <div className="bg-slate-900 p-4 sm:p-5 flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-[14px]">{selectedAbsen.divisi.nama_divisi}</h3>
                    <p className="text-slate-400 text-[11px] font-medium mt-0.5">
                      {new Date(selectedAbsen.tanggal).toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedAbsen(null)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              {/* Modal Body */}
              <div className="p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[60vh] flex-1">
                
                {/* Foto & Ringkasan */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
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
                    <div className="w-28 h-28 sm:w-32 sm:h-32 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center shrink-0 shadow-sm text-slate-350 font-medium italic text-[11px] p-4 text-center">
                      Tidak ada foto bukti absensi.
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

                {/* Daftar Kehadiran Anggota */}
                <div>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Status Per Anggota</p>
                  <div className="space-y-1.5">
                    {selectedAbsen.detail.map((det: any, i: number) => (
                      <div key={i} className="flex justify-between items-center text-sm p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-[13px] font-semibold text-slate-700 truncate flex-1 min-w-0 pr-2">{det.anggota?.nama || "Anggota"}</span>
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusColor[det.status] || "text-slate-600 bg-slate-50 border-slate-200"}`}>{det.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Footer Modal */}
              <div className="border-t border-slate-100 p-4 bg-slate-50/50 flex gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedAbsen(null)}
                  className="flex-1 bg-slate-100 text-slate-700 hover:bg-slate-200 py-2.5 rounded-lg text-[13px] font-bold transition-colors cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleReset(selectedAbsen)
                    setSelectedAbsen(null)
                  }}
                  disabled={isLoading}
                  className="flex-1 bg-rose-600 text-white hover:bg-rose-700 py-2.5 rounded-lg text-[13px] font-extrabold transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RotateCcw size={15} />
                  Reset Absensi
                </button>
              </div>

            </div>
          </div>
        )
      })()}

      {/* Custom Confirmation Modal */}
      {/* Foto Lightbox / Preview Fullscreen */}
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

            {/* Foto */}
            <div className="bg-slate-900 max-h-[70vh] overflow-hidden flex items-center justify-center">
              <img 
                src={previewFotoUrl} 
                alt="Foto Absensi" 
                className="w-full max-h-[70vh] object-contain"
              />
            </div>

            {/* Footer aksi */}
            <div className="flex gap-2.5 p-4 border-t border-slate-100 bg-white">
              <button
                onClick={(e) => handleDownload(e, previewFotoUrl, "foto-absensi.jpg")}
                className="flex-1 inline-flex items-center justify-center gap-1.5 text-[13px] font-bold bg-slate-900 text-white hover:bg-slate-800 py-2.5 rounded-lg shadow transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Simpan Foto
              </button>
              <a
                href={previewFotoUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1.5 text-[13px] font-bold bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 py-2.5 rounded-lg transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Eye size={13} strokeWidth={2.5} />
                Buka Tab Baru
              </a>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        type={confirmConfig.type}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  )
}
