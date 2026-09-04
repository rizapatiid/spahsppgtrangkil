"use client"

import { useState, useEffect } from "react"
import { uploadFotoLaporan, deleteFotoLaporan, submitFinalLaporan, editFotoLaporan } from "./actions"
import imageCompression from "browser-image-compression"
import ConfirmModal from "@/components/ConfirmModal"

export default function LaporanClient({ role, initialPhotos, initialCatatan }: { role: string, initialPhotos: any[], initialCatatan: string }) {
  const [loadingSection, setLoadingSection] = useState<string | null>(null)
  
  const [uploadedPhotos, setUploadedPhotos] = useState<any[]>(initialPhotos)
  const [selectedFiles, setSelectedFiles] = useState<Record<string, { file: File, preview: string, keterangan?: string }[]>>({})
  const [editModalFoto, setEditModalFoto] = useState<any>(null)
  const [infoModalCat, setInfoModalCat] = useState<any>(null)

  // Confirm Modal state
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

  function handleKeteranganChange(catId: string, index: number, value: string) {
    setSelectedFiles(prev => {
      const updated = [...(prev[catId] || [])]
      updated[index] = { ...updated[index], keterangan: value }
      return { ...prev, [catId]: updated }
    })
  }

  const getCategories = () => {
    if (role === "KEBERSIHAN") return [
      { id: "kegiatan_kebersihan", label: "1. Foto Kegiatan Kebersihan", desc: "(Min: 3, Max: 5)", min: 3, max: 5 },
      { id: "sampah_akhir", label: "2. Foto Sampah Akhir", desc: "(Max: 8)", min: 0, max: 8 }
    ]
    if (role === "SATPAM") return [
      { id: "kegiatan_satpam", label: "1. Foto Kegiatan Satpam", desc: "(Min: 3, Max: 5)", min: 3, max: 5 },
      { id: "sampah_akhir", label: "2. Foto Sampah Akhir", desc: "(Max: 8)", min: 0, max: 8 }
    ]

    const base = [{ id: "kegiatan", label: "1. Foto Kegiatan", desc: `Min: 3, Max: ${role === 'DISTRIBUSI' ? '6' : '5'}`, min: 3, max: role === 'DISTRIBUSI' ? 6 : 5 }]
    
    if (role === "PERSIAPAN") return [...base, 
      { id: "bahan_makanan", label: "2. Foto Bahan Makanan (Bersih)", desc: "(Max: 8)", min: 0, max: 8 },
      { id: "sampah", label: "3. Foto Sampah", desc: "(Max: 8)", min: 0, max: 8 }
    ]
    if (role === "PENGOLAHAN") return [...base, 
      { id: "masakan_matang", label: "2. Foto Masakan Matang", desc: "(Max: 8)", min: 0, max: 8 },
      { id: "sampah", label: "3. Foto Sampah", desc: "(Max: 8)", min: 0, max: 8 }
    ]
    if (role === "PEMORSIAN") return [...base, 
      { id: "makanan_diporsi", label: "2. Foto Makanan yang Diporsi", desc: "(Max: 3)", min: 0, max: 3 },
      { id: "kondisi_sebelum_dikirim", label: "3. Foto Kondisi Makanan Sebelum Dikirim", desc: "(Max: 3)", min: 0, max: 3 },
      { id: "tray_siap", label: "4. Foto Tray Siap Distribusi", desc: "(Max: 3)", min: 0, max: 3 },
      { id: "sisa_pemorsian", label: "5. Foto Sisa Pemorsian", desc: "(Max: 8)", min: 0, max: 8 }
    ]
    if (role === "DISTRIBUSI") return [...base, 
      { id: "lokasi_distribusi", label: "2. Foto Bukti di Lokasi", desc: "(Max: 10)", min: 0, max: 10 },
      { id: "tray_kembali", label: "3. Foto Tray Kembali ke SPPG", desc: "(Min: 4, Max: 8)", min: 4, max: 8 }
    ]
    if (role === "PENCUCIAN") return [...base, 
      { id: "limbah_makanan", label: "2. Foto Limbah Makanan", desc: "(Min: 4, Max: 8)", min: 4, max: 8 },
      { id: "tray_kembali", label: "3. Foto Tray Kembali ke SPPG", desc: "(Min: 4, Max: 8)", min: 4, max: 8 }
    ]
    return base
  }

  const categories = getCategories()

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>, catId: string) {
    if (!e.target.files) return
    const files = Array.from(e.target.files)
    
    const newFiles = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }))

    setSelectedFiles(prev => ({
      ...prev,
      [catId]: [...(prev[catId] || []), ...newFiles]
    }))
    
    e.target.value = ""
  }

  function removeSelectedFile(catId: string, index: number) {
    setSelectedFiles(prev => {
      const updated = [...(prev[catId] || [])]
      URL.revokeObjectURL(updated[index].preview) 
      updated.splice(index, 1)
      return { ...prev, [catId]: updated }
    })
  }

  async function handleCompress(file: File) {
    try {
      return await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true })
    } catch {
      return file
    }
  }

  async function handleUploadFoto(catId: string) {
    const filesToUpload = selectedFiles[catId]
    if (!filesToUpload || filesToUpload.length === 0) return

    setLoadingSection(catId)

    try {
      // Unggah secara paralel dari sisi klien agar tidak terkena limit payload/timeout Vercel
      const uploadPromises = filesToUpload.map(async (item) => {
        const formData = new FormData()
        const compressed = await handleCompress(item.file)
        formData.append("fotos", compressed, item.file.name)
        formData.append("keterangans", item.keterangan || "")
        
        return uploadFotoLaporan(formData, catId)
      })

      const results = await Promise.all(uploadPromises)

      const successfulPhotos: any[] = []
      let lastError: string | null = null

      for (const res of results) {
        if (res.error) {
          lastError = res.error
        } else if (res.photos) {
          successfulPhotos.push(...res.photos)
        }
      }

      if (successfulPhotos.length > 0) {
        setUploadedPhotos(prev => [...prev, ...successfulPhotos])
      }

      if (lastError) {
        alert("Gagal mengunggah sebagian foto: " + lastError)
      } else {
        setSelectedFiles(prev => ({ ...prev, [catId]: [] }))
      }
    } catch (err: any) {
      alert("Terjadi kesalahan sistem: " + err.message)
    }

    setLoadingSection(null)
  }

  function handleDeleteServerPhoto(fotoId: string) {
    setConfirmConfig({
      isOpen: true,
      title: "Hapus Foto",
      message: "Hapus foto ini dari laporan?",
      type: "danger",
      onConfirm: async () => {
        setConfirmConfig(prev => ({ ...prev, isOpen: false }))
        setLoadingSection("delete-" + fotoId)
        const res = await deleteFotoLaporan(fotoId)
        if (res.error) {
          alert(res.error)
        } else {
          setUploadedPhotos(prev => prev.filter(f => f.id !== fotoId))
        }
        setLoadingSection(null)
      }
    })
  }

  async function handleSubmitLaporan(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    
    setLoadingSection("final")
    const form = e.currentTarget
    const catatan = (form.elements.namedItem("catatan") as HTMLTextAreaElement).value
    
    const res = await submitFinalLaporan(catatan)
    setLoadingSection(null)

    if (res.error) {
      alert(res.error)
    } else {
      alert("Catatan harian berhasil disimpan! Anda tetap bisa mengedit atau menambah foto jika diperlukan.")
    }
  }

  async function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!editModalFoto) return

    setLoadingSection("edit")
    const form = e.currentTarget
    const file = (form.elements.namedItem("foto") as HTMLInputElement).files?.[0]
    const keterangan = (form.elements.namedItem("keterangan") as HTMLInputElement).value

    const formData = new FormData()
    if (file) {
      const compressed = await handleCompress(file)
      formData.append("foto", compressed, file.name)
    }
    formData.append("keterangan", keterangan)

    const res = await editFotoLaporan(editModalFoto.id, formData)
    if (res.error) {
      alert(res.error)
    } else if (res.photo) {
      setUploadedPhotos(prev => prev.map(p => p.id === editModalFoto.id ? res.photo : p))
      setEditModalFoto(null)
    }
    setLoadingSection(null)
  }

  return (
    <div className="flex flex-col relative pb-6 px-4 sm:px-5 lg:px-8">
      <div className="max-w-5xl mx-auto w-full space-y-6 pt-6">
        
        {/* Judul Halaman */}
        <div className="flex items-center gap-4 mb-2 pb-6 border-b border-slate-200/80 px-1">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">Dokumentasi Harian</h2>
            <p className="text-[13px] text-slate-500 font-medium">Lengkapi foto laporan sesuai kategori divisi Anda</p>
          </div>
        </div>

        <div className="space-y-8">
          {categories.map((cat, catIndex) => {
            const serverPhotos = uploadedPhotos.filter(f => f.tipe_foto === cat.id)
            const localPhotos = selectedFiles[cat.id] || []
            const totalCount = serverPhotos.length + localPhotos.length
            const isCompleted = serverPhotos.length >= cat.min && cat.min > 0
            
            return (
              <div key={cat.id} className="pb-8 mb-4 border-b border-slate-200/60 last:border-0 last:pb-0">
                <div className="flex flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-5">
                  <div className="flex items-start sm:items-center gap-2.5 sm:gap-3">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border border-slate-200 shadow-sm text-slate-500 flex items-center justify-center text-[11px] sm:text-[12px] font-bold shrink-0 mt-0.5 sm:mt-0">
                      {catIndex + 1}
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-start flex-wrap gap-1.5 sm:gap-2">
                        <h3 className="text-[13px] sm:text-[13px] font-bold text-slate-800 leading-snug">
                          {cat.label.replace(/^\d+\.\s*/, '')}
                        </h3>
                        <button 
                          type="button"
                          onClick={() => setInfoModalCat(cat)}
                          className="shrink-0 text-slate-400 hover:text-blue-500 transition-colors mt-[1px] sm:mt-0.5"
                          title="Detail Ketentuan"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                        </button>
                        {isCompleted && (
                          <span className="shrink-0 text-emerald-600 text-[10px] font-extrabold px-1.5 py-0.5 bg-emerald-50 border border-emerald-100 rounded-full flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> 
                            Siap
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">{cat.desc}</p>
                    </div>
                  </div>
                  
                  {/* Tombol Pilih File */}
                  {totalCount < cat.max && (
                    <label className="shrink-0 flex items-center justify-center gap-1.5 sm:gap-2 bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-700 hover:text-blue-600 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg cursor-pointer transition-all text-[11px] sm:text-[12px] font-bold shadow-sm hover:shadow">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="sm:w-4 sm:h-4"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                      <span className="hidden sm:inline">Pilih Foto Baru</span>
                      <span className="inline sm:hidden">Tambah</span>
                      <input type="file" multiple accept="image/*" onChange={(e) => handleFileSelect(e, cat.id)} className="hidden" />
                    </label>
                  )}
                </div>

                <div>
                  {/* Jika belum ada foto sama sekali */}
                  {serverPhotos.length === 0 && localPhotos.length === 0 && (
                    <div className="py-10 flex flex-col items-center justify-center text-center bg-white border-2 border-dashed border-slate-200 rounded-lg">
                      <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                        <svg className="text-slate-300" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                      </div>
                      <p className="text-[13px] font-medium text-slate-400">Belum ada dokumentasi untuk bagian ini.</p>
                    </div>
                  )}

                  {/* List Foto Server */}
                  {serverPhotos.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {serverPhotos.map(foto => (
                        <div key={foto.id} className="flex flex-row sm:flex-col bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                          <div className="relative w-24 h-24 sm:w-full sm:h-auto sm:aspect-[4/3] bg-slate-100 border-r sm:border-r-0 sm:border-b border-slate-100 overflow-hidden shrink-0">
                             <img src={foto.url_foto} alt="Foto Server" className="w-full h-full object-cover" />
                          </div>
                          <div className="p-3 flex flex-1 flex-row sm:flex-col items-center sm:items-stretch gap-3 sm:gap-0 min-w-0">
                            <div className="flex-1 flex flex-col min-w-0 py-1 sm:py-0">
                              <p className="text-[12px] font-bold text-slate-800 line-clamp-2 leading-snug mb-1">
                                {foto.catatan?.keterangan || <span className="text-slate-400 font-normal italic">Keterangan kosong...</span>}
                              </p>
                              <p className="text-[10px] text-slate-500 font-medium sm:mb-2.5">Diunggah: {new Date(foto.tanggal).toLocaleDateString("id-ID")}</p>
                            </div>
                            <div className="flex flex-col sm:flex-row items-stretch gap-1.5 sm:pt-2.5 sm:border-t border-slate-100/80 w-20 sm:w-auto shrink-0">
                              <button 
                                type="button"
                                onClick={() => setEditModalFoto(foto)}
                                className="flex-1 py-1.5 px-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md text-[11px] sm:text-[12px] font-bold transition-colors text-center"
                              >
                                Edit
                              </button>
                              <button 
                                type="button"
                                onClick={() => handleDeleteServerPhoto(foto.id)}
                                disabled={loadingSection === "delete-" + foto.id}
                                className="flex-1 py-1.5 px-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-md text-[11px] sm:text-[12px] font-bold transition-colors disabled:opacity-50 text-center"
                              >
                                Hapus
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Antrean Unggah (Preview) */}
                  {localPhotos.length > 0 && (
                    <div className="mt-5 pt-5 border-t border-dashed border-slate-200">
                      <p className="text-[12px] font-bold uppercase tracking-wider text-amber-600 mb-4 flex items-center gap-1.5">
                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                         Menunggu Diunggah ({localPhotos.length})
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-5">
                        {localPhotos.map((item, idx) => (
                          <div key={idx} className="flex flex-row sm:flex-col bg-amber-50/40 rounded-lg border border-amber-200/60 relative overflow-hidden shadow-sm">
                            <div className="relative w-24 h-24 sm:w-full sm:h-auto sm:aspect-[4/3] bg-slate-100 border-r sm:border-r-0 sm:border-b border-amber-100/50 shrink-0">
                              <img src={item.preview} alt="Preview" className="w-full h-full object-cover" />
                              <button 
                                type="button"
                                onClick={() => removeSelectedFile(cat.id, idx)}
                                className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-white/90 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-100 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-all shadow-sm backdrop-blur-sm"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                              </button>
                            </div>
                            <div className="p-2 sm:p-3 flex-1 flex flex-col justify-center min-w-0">
                              <textarea 
                                placeholder="Ketikan keterangan foto di sini..."
                                value={item.keterangan || ""}
                                onChange={(e) => handleKeteranganChange(cat.id, idx, e.target.value)}
                                rows={2}
                                className="w-full h-full sm:h-auto bg-white border border-amber-200/60 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 px-2.5 py-2 text-[12px] text-slate-700 rounded-lg outline-none transition-all placeholder:text-slate-400 shadow-sm resize-none"
                              ></textarea>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button 
                        type="button"
                        onClick={() => handleUploadFoto(cat.id)}
                        disabled={loadingSection === cat.id}
                        className="bg-slate-900 text-white px-6 py-2.5 rounded-lg text-[13px] font-bold hover:bg-slate-800 transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-sm w-full sm:w-auto"
                      >
                        {loadingSection === cat.id ? (
                          <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Memproses...</>
                        ) : (
                          "Unggah " + localPhotos.length + " Foto Sekarang"
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        
        {/* Catatan Akhir */}
        <div className="mt-8 pt-6 border-t border-slate-200/60">
          <div className="flex items-center gap-4 mb-5 px-1">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </div>
            <div>
              <h2 className="text-[15px] font-extrabold text-slate-800 leading-tight">Catatan Laporan</h2>
              <p className="text-[12px] text-slate-500 mt-0.5 font-medium">Ringkasan operasional atau kendala hari ini</p>
            </div>
          </div>
          <div>
            <form onSubmit={handleSubmitLaporan}>
              <textarea 
                name="catatan"
                defaultValue={initialCatatan}
                required
                className="w-full border border-slate-200 bg-slate-50/50 p-4 rounded-lg text-[13px] text-slate-700 min-h-[120px] focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none resize-y mb-4" 
                placeholder={role === 'PEMORSIAN' ? 'Cth: Jumlah porsi besar: 150, porsi kecil: 50' : 
                             role === 'DISTRIBUSI' ? 'Cth: Jumlah distribusi ke lokasi A: 100 pax' : 
                             role === 'PENCUCIAN' ? 'Cth: Jumlah ompreng dicuci: 200' : 'Tuliskan catatan harian divisi Anda di sini...'}
              ></textarea>
              
              <div className="flex justify-end">
                <button 
                  type="submit" 
                  disabled={loadingSection === "final"}
                  className="flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-lg text-[13px] font-bold hover:bg-slate-800 w-full sm:w-auto transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  {loadingSection === "final" ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Menyimpan...</>
                  ) : (
                    <>Simpan Catatan Laporan</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* THE EDIT MODAL */}
      {editModalFoto && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-slate-900 p-4 sm:p-5 flex items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </div>
                <h3 className="text-white font-bold text-lg">Edit Foto & Keterangan</h3>
              </div>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
              <div>
                <label className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                  Foto Saat Ini
                </label>
                <div className="rounded-lg overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
                  <img src={editModalFoto.url_foto} className="w-full h-40 object-cover" />
                </div>
              </div>
              
              <div>
                <label className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                  Ganti Foto (Opsional)
                </label>
                <input type="file" accept="image/*" name="foto" className="w-full text-[13px] text-slate-700 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-[12px] file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
              </div>

              <div>
                <label className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="17" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="17" y1="18" x2="3" y2="18"></line></svg>
                  Keterangan / Deskripsi
                </label>
                <input type="text" name="keterangan" defaultValue={editModalFoto.catatan?.keterangan || ""} placeholder="Contoh: Sayur Lodeh 50 Porsi" className="w-full border border-slate-200 bg-slate-50/50 p-3 rounded-lg text-[13px] text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none" />
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setEditModalFoto(null)} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[13px] font-bold transition-colors">Batal</button>
                <button type="submit" disabled={loadingSection === "edit"} className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[13px] font-bold transition-colors disabled:opacity-50 shadow-md hover:shadow-lg">
                  {loadingSection === "edit" ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Menyimpan...</> : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* THE INFO MODAL */}
      {infoModalCat && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 p-4 sm:p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                </div>
                <h3 className="text-white font-bold text-lg">Ketentuan Foto</h3>
              </div>
              <button 
                onClick={() => setInfoModalCat(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <div className="p-4 sm:p-5 text-slate-600 space-y-4 text-[13px] leading-relaxed overflow-y-auto">
              
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 mb-0.5 text-sm">{infoModalCat.label.replace(/^\d+\.\s*/, '')}</h4>
                  <p>
                    {infoModalCat.id === "kegiatan" ? "Lampirkan foto dokumentasi utama kegiatan divisi Anda saat sedang bertugas (misal: pengarahan, sedang bekerja, dsb)." :
                     infoModalCat.id === "bahan_makanan" ? "Lampirkan foto bahan makanan yang telah dicuci, disiapkan, atau siap untuk diolah." :
                     infoModalCat.id === "sampah" ? "Dokumentasikan kondisi pembuangan sampah atau kebersihan area membuang sisa buangan dapur." :
                     infoModalCat.id === "masakan_matang" ? "Lampirkan foto hasil olahan atau masakan yang sudah matang dari dapur." :
                     infoModalCat.id === "makanan_diporsi" ? "Foto saat makanan sedang atau sudah selesai diporsi ke dalam wadah (ompreng/tray/box)." :
                     infoModalCat.id === "kondisi_sebelum_dikirim" ? "Foto kondisi tray atau wadah makanan sebelum diserahkan ke bagian distribusi/kurir." :
                     infoModalCat.id === "tray_siap" ? "Foto tumpukan tray yang sudah selesai diikat dan siap diangkut ke lokasi." :
                     infoModalCat.id === "sisa_pemorsian" ? "Foto sisa makanan yang tidak habis diporsi atau sisa lauk yang berlebih." :
                     infoModalCat.id === "lokasi_distribusi" ? "Foto bukti bahwa makanan telah sampai di titik distribusi/lokasi tujuan (foto penyerahan/di lokasi)." :
                     infoModalCat.id === "tray_kembali" ? "Foto tumpukan tray kosong atau kotor yang kembali dari lokasi ke area pencucian SPPG." :
                     infoModalCat.id === "limbah_makanan" ? "Foto sisa limbah makanan (food waste) dari tray kotor sebelum dicuci." :
                     infoModalCat.id === "sampah_akhir" ? "Foto tumpukan akhir atau area pembuangan sampah yang sudah dikumpulkan." :
                     "Mohon lengkapi dokumentasi foto untuk bagian ini sesuai ketentuan yang berlaku."}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 mb-0.5 text-sm">Batas Jumlah Foto</h4>
                  <p>Anda wajib mengunggah minimal <strong>{infoModalCat.min} foto</strong> dan maksimal <strong>{infoModalCat.max} foto</strong> untuk kategori ini. 
                  Pastikan foto yang diunggah jelas dan sesuai keterangan.</p>
                </div>
              </div>

            </div>

            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 mt-auto">
              <button 
                onClick={() => setInfoModalCat(null)}
                className="w-full py-2.5 bg-slate-900 text-white rounded-lg font-bold text-[13px] hover:bg-slate-800 transition-all shadow-sm"
              >
                Mengerti
              </button>
            </div>

          </div>
        </div>
      )}
      {/* Custom Confirmation Modal */}
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

