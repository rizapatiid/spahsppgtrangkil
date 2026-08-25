"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, X, MessageSquare, Image as ImageIcon, Trash2, Download } from "lucide-react"
import { resetLaporanAction, deleteFotoAction } from "./actions"
import ConfirmModal from "@/components/ConfirmModal"

export default function LaporanDetailClient({ 
  laporan, 
  allCategories, 
  fotoGroup 
}: { 
  laporan: any, 
  allCategories: any[], 
  fotoGroup: Record<string, any[]> 
}) {
  const [selectedPhoto, setSelectedPhoto] = useState<any | null>(null)
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

  const handleReset = () => {
    setConfirmConfig({
      isOpen: true,
      title: "Reset Laporan",
      message: "Yakin ingin mereset/menghapus seluruh laporan ini? Divisi harus mengirim ulang laporan.",
      type: "danger",
      onConfirm: async () => {
        setConfirmConfig(prev => ({ ...prev, isOpen: false }))
        setIsLoading(true)
        await resetLaporanAction(laporan.id)
        setIsLoading(false)
      }
    })
  }

  const handleDeletePhoto = (e: React.MouseEvent, fotoId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setConfirmConfig({
      isOpen: true,
      title: "Hapus Foto Laporan",
      message: "Hapus foto ini? Divisi harus mengunggah ulang foto.",
      type: "danger",
      onConfirm: async () => {
        setConfirmConfig(prev => ({ ...prev, isOpen: false }))
        setIsLoading(true)
        await deleteFotoAction(fotoId, laporan.id)
        setIsLoading(false)
        window.location.reload()
      }
    })
  }

  const handleDownloadCategory = (fotos: any[], categoryLabel: string) => {
    if (fotos.length === 0) return
    setConfirmConfig({
      isOpen: true,
      title: "Simpan Gambar Kategori",
      message: `Unduh semua (${fotos.length}) gambar dalam kategori "${categoryLabel}"?`,
      type: "info",
      onConfirm: () => {
        setConfirmConfig(prev => ({ ...prev, isOpen: false }))
        fotos.forEach((f: any, idx: number) => {
          setTimeout(() => {
            const link = document.createElement("a")
            link.href = f.url_foto
            link.download = `${categoryLabel.replace(/\s+/g, "_")}-${f.id}.jpg`
            link.target = "_blank"
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
          }, idx * 300)
        })
      }
    })
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header Halaman */}
      <div className="flex flex-row items-center justify-between gap-3 mb-2 pb-4 border-b border-slate-200/80 px-1">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <Link 
            href="/admin/laporan"
            className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 flex items-center justify-center shrink-0 transition-colors"
          >
            <ArrowLeft size={16} strokeWidth={2.5} />
          </Link>
          <div className="min-w-0">
            <h2 className="text-[15px] sm:text-[16px] font-extrabold text-slate-800 tracking-tight truncate">Detail Laporan</h2>
            <p className="text-[10px] sm:text-[12px] text-slate-500 font-medium truncate">
              {laporan.divisi.nama_divisi} — {new Date(laporan.tanggal).toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
        
        {/* Aksi Hapus */}
        <button 
          onClick={handleReset}
          disabled={isLoading}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg hover:bg-rose-100 shadow-sm font-bold text-[11px] sm:text-[12px] transition active:scale-95 cursor-pointer disabled:opacity-50 shrink-0"
        >
          <Trash2 size={13} />
          Reset Laporan
        </button>
      </div>

      {/* Main Single-Column Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </div>
            <h3 className="text-white font-bold text-[14px] sm:text-[15px]">Laporan {laporan.divisi.nama_divisi}</h3>
          </div>
        </div>
        
        <div className="p-4 sm:p-6 space-y-6">
          
          {/* Catatan Laporan */}
          <div className="pb-6 border-b border-slate-200/60">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <MessageSquare size={18} />
              </div>
              <div>
                <h3 className="text-[15px] font-extrabold text-slate-800 leading-tight">Catatan Laporan</h3>
                <p className="text-[12px] text-slate-500 mt-0.5 font-medium">Ringkasan operasional atau kendala hari ini</p>
              </div>
            </div>
            
            <div className="w-full border border-slate-200 bg-slate-50/50 p-4 rounded-lg text-[13px] text-slate-700 min-h-[100px] whitespace-pre-wrap leading-relaxed">
              {laporan.isi_laporan || <span className="text-slate-400 italic">Tidak ada catatan yang ditulis.</span>}
            </div>
            <p className="text-[11px] text-slate-400 font-bold mt-2 text-right">Pengirim: {laporan.created_by}</p>
          </div>
          
          {/* Dokumentasi Foto */}
          <div>
            <div className="flex items-center gap-4 mb-5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <ImageIcon size={18} />
              </div>
              <div>
                <h3 className="text-[15px] font-extrabold text-slate-800 leading-tight">Dokumentasi Foto</h3>
                <p className="text-[12px] text-slate-500 mt-0.5 font-medium">Foto bukti kegiatan per kategori (Klik gambar untuk memperbesar)</p>
              </div>
            </div>
            
            <div className="space-y-8">
              {allCategories.map((cat, catIndex) => {
                const fotos = fotoGroup[cat.id] || []
                return (
                  <div key={cat.id} className="pb-8 border-b border-slate-200/60 last:border-0 last:pb-0">
                    <div className="flex flex-row items-center justify-between gap-3 mb-4 pb-2 border-b border-slate-100/50">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="w-7 h-7 rounded-full bg-white border border-slate-200 shadow-sm text-slate-500 flex items-center justify-center text-[11px] font-bold shrink-0">
                          {catIndex + 1}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-[13px] font-bold text-slate-800 leading-snug truncate">{cat.label}</h3>
                          <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate">{cat.desc}</p>
                        </div>
                      </div>

                      {fotos.length > 0 && (
                        <button
                          onClick={() => handleDownloadCategory(fotos, cat.label)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 rounded-lg shadow-sm font-bold text-[10px] sm:text-[11px] transition active:scale-95 cursor-pointer shrink-0"
                        >
                          <Download size={11} strokeWidth={2.5} />
                          Simpan Semua
                        </button>
                      )}
                    </div>

                    {fotos.length === 0 ? (
                      <div className="py-8 flex flex-col items-center justify-center text-center bg-white border-2 border-dashed border-slate-200 rounded-lg">
                        <ImageIcon className="text-slate-300 mb-2" size={20} />
                        <p className="text-[12px] font-medium text-slate-400">Belum ada foto untuk kategori ini.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {fotos.map(f => {
                          const catatan = f.catatan as any
                          const keterangan = catatan?.keterangan || catatan?.text || (typeof catatan === 'string' ? catatan : null)
                          return (
                            <div key={f.id} className="relative flex flex-row sm:flex-col bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden group">
                              <div 
                                onClick={() => setSelectedPhoto({ ...f, label: cat.label, keterangan })}
                                className="relative block w-24 h-24 sm:w-full sm:h-auto sm:aspect-[4/3] bg-slate-100 border-r sm:border-r-0 sm:border-b border-slate-100 overflow-hidden shrink-0 cursor-pointer"
                              >
                                <img src={f.url_foto} alt={cat.id} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"></path><path d="M9 21H3v-6"></path><path d="M21 3l-7 7"></path><path d="M3 21l7-7"></path></svg>
                                </div>
                              </div>
                              
                              {/* Tombol Hapus (Admin) */}
                              <button 
                                onClick={(e) => handleDeletePhoto(e, f.id)}
                                disabled={isLoading}
                                className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-rose-600 hover:bg-rose-700 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] shadow-md transition cursor-pointer disabled:opacity-50"
                                title="Hapus foto ini (Minta divisi upload ulang)"
                              >
                                <X size={12} strokeWidth={3} />
                              </button>

                              <div className="p-3 flex flex-1 flex-col min-w-0 justify-between gap-3 bg-white">
                                <div>
                                  <p className="text-[12px] font-bold text-slate-800 line-clamp-2 leading-snug mb-1">
                                    {keterangan || <span className="text-slate-400 font-normal italic">Keterangan kosong...</span>}
                                  </p>
                                  <p className="text-[10px] text-slate-500 font-semibold">{new Date(f.tanggal).toLocaleDateString("id-ID")}</p>
                                </div>
                                <a 
                                  href={f.url_foto} 
                                  download={`foto-${f.id}.jpg`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 rounded-lg text-[11px] font-extrabold shadow-sm transition active:scale-[0.97] cursor-pointer"
                                >
                                  <Download size={12} strokeWidth={2.5} />
                                  Simpan Gambar
                                </a>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
          
        </div>
      </div>

      {/* Lightbox / Popup Gambar */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedPhoto(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh] relative animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Popup */}
            <div className="bg-slate-900 px-4 py-3 sm:px-5 sm:py-3.5 flex items-center justify-between text-white shrink-0 border-b border-slate-800">
              <div>
                <h4 className="font-extrabold text-[13.5px] sm:text-[14.5px] leading-tight">{selectedPhoto.label}</h4>
                <p className="text-slate-400 text-[10px] sm:text-[11px] font-medium mt-0.5">
                  Diunggah pada {new Date(selectedPhoto.tanggal).toLocaleDateString("id-ID")}
                </p>
              </div>
              <button 
                onClick={() => setSelectedPhoto(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            {/* Konten Popup */}
            <div className="p-5 flex flex-col items-center gap-4 bg-slate-50 flex-1 overflow-y-auto">
              <div className="relative rounded-xl overflow-hidden max-h-[50vh] flex items-center justify-center w-full">
                <img 
                  src={selectedPhoto.url_foto} 
                  alt="Popup preview" 
                  className="max-w-full max-h-[50vh] object-contain rounded-xl shadow-md"
                />
              </div>
              

              
              {/* Keterangan */}
              <div className="w-full bg-white border border-slate-150 rounded-xl p-3.5 shadow-sm text-center">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Keterangan / Catatan Foto</span>
                <p className="text-[13px] font-bold text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {selectedPhoto.keterangan || <span className="text-slate-400 font-normal italic">Tidak ada keterangan yang ditulis oleh divisi.</span>}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reusable Custom Confirmation Modal */}
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
