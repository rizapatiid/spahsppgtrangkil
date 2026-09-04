"use client"

import { useState } from "react"
import { submitAbsensi } from "./actions"
import imageCompression from "browser-image-compression"
import { useRouter } from "next/navigation"
import { Camera, Save, UserCheck, Phone, CheckCircle2, AlertCircle, UploadCloud } from "lucide-react"

export default function AbsensiClient({ anggotaList, divisiName }: { anggotaList: any[], divisiName: string }) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: "", type: "" })
  const [fileName, setFileName] = useState("")
  const router = useRouter()

  type PhotoItem = { file: File, preview: string, isFromCamera: boolean, name: string }
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  
  const isTwoPhotos = ["driver", "distribusi", "pengolahan", "persiapan", "pencucian"].some(d => divisiName.toLowerCase().includes(d))
  const maxPhotos = isTwoPhotos ? 2 : 1

  async function addWatermark(file: File, divisi: string): Promise<File> {
    return new Promise((resolve) => {
      const img = new Image()
      const objectUrl = URL.createObjectURL(file)
      
      img.onload = () => {
        URL.revokeObjectURL(objectUrl)
        const canvas = document.createElement("canvas")
        canvas.width = img.width
        canvas.height = img.height
        
        const ctx = canvas.getContext("2d")
        if (!ctx) return resolve(file)
        
        ctx.drawImage(img, 0, 0)
        
        const fontSize = Math.max(12, Math.min(36, Math.floor(img.width * 0.02)))
        ctx.font = `bold ${fontSize}px sans-serif`
        ctx.fillStyle = "rgba(255, 255, 255, 0.95)"
        ctx.textAlign = "right"
        ctx.textBaseline = "bottom"
        
        ctx.shadowColor = "rgba(0, 0, 0, 0.9)"
        ctx.shadowBlur = 4
        ctx.shadowOffsetX = 1
        ctx.shadowOffsetY = 1
        
        const now = new Date()
        const dateStr = now.toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta', day: 'numeric', month: 'long', year: 'numeric' })
        const timeStr = now.toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit' })
        
        const padding = fontSize * 1.2
        const x = canvas.width - padding
        const y = canvas.height - padding
        
        ctx.fillText(`${dateStr} ${timeStr}`, x, y)
        ctx.fillText(`DIVISI ${divisi.toUpperCase()}`, x, y - fontSize * 1.3)
        
        canvas.toBlob((blob) => {
          if (blob) resolve(new File([blob], file.name, { type: file.type || "image/jpeg" }))
          else resolve(file)
        }, file.type || "image/jpeg", 0.95)
      }
      img.onerror = () => resolve(file)
      img.src = objectUrl
    })
  }

  async function handleCompress(file: File) {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    }
    try {
      return await imageCompression(file, options)
    } catch (error) {
      console.error(error)
      return file // fallback
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>, fromCamera: boolean) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    
    if (photos.length + files.length > maxPhotos) {
      setMessage({ text: `Maksimal ${maxPhotos} foto diperbolehkan!`, type: "error" })
      return
    }

    const newPhotos: PhotoItem[] = []
    for (const file of files) {
      let preview = ""
      let finalFile = file
      if (fromCamera) {
        finalFile = await addWatermark(file, divisiName)
        preview = URL.createObjectURL(finalFile)
      } else {
        preview = URL.createObjectURL(file)
      }
      newPhotos.push({ file: finalFile, preview, isFromCamera: fromCamera, name: file.name })
    }
    
    setPhotos(prev => [...prev, ...newPhotos])
    // clear input so same file can be selected again if needed
    e.target.value = ""
  }
  
  function removePhoto(index: number) {
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (photos.length === 0) {
      setMessage({ text: "Harap lampirkan foto bukti atau foto briefing!", type: "error" })
      return
    }

    setLoading(true)
    setMessage({ text: "", type: "" })

    const form = e.currentTarget
    const formData = new FormData(form)
    
    // Hapus foto default jika ada
    formData.delete("foto")

    // Compress & append each photo
    for (const photo of photos) {
      let processedFile = photo.file
      // If we already watermarked it in handleFileChange, we only need to compress
      const compressedFoto = await handleCompress(processedFile)
      formData.append("foto", compressedFoto, photo.name)
    }

    const res = await submitAbsensi(formData)

    if (res.error) {
      setMessage({ text: res.error, type: "error" })
    } else {
      setMessage({ text: "Absensi berhasil disimpan!", type: "success" })
      setPhotos([])
      form.reset()
      router.refresh()
    }
    setLoading(false)
  }

  if (anggotaList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
        <UserCheck size={48} className="text-gray-300 mb-4" />
        <h3 className="text-lg font-bold text-gray-700 mb-1">Anggota Tim Kosong</h3>
        <p className="text-sm text-gray-500 max-w-sm">
          Belum ada anggota yang terdaftar di divisi ini. Hubungi admin untuk menambahkan anggota melalui menu Kelola Akun & Divisi.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {message.text && (
        <div className={`p-4 rounded-xl text-sm flex items-start gap-3 border ${message.type === "error" ? "bg-rose-50 text-rose-700 border-rose-100" : "bg-emerald-50 text-emerald-700 border-emerald-100"}`}>
          {message.type === "error" ? <AlertCircle size={20} className="shrink-0" /> : <CheckCircle2 size={20} className="shrink-0" />}
          <div className="font-medium pt-0.5">{message.text}</div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        
        {/* Kolom Kiri: Input File */}
        <div className="lg:col-span-5 flex flex-col gap-5 lg:pr-8 lg:border-r lg:border-slate-100 mb-8 lg:mb-0">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Camera size={16} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 leading-tight">Foto Bukti / Briefing</h3>
                <p className="text-[11px] text-slate-500 font-medium">Wajib diunggah setiap hari</p>
              </div>
            </div>
            
            <div className="border-2 border-dashed border-slate-200/80 bg-slate-50/50 rounded-2xl p-6 transition-all">
              <div className="flex flex-col items-center text-center">
                
                {photos.length > 0 ? (
                  <div className="w-full relative group">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {photos.map((photo, idx) => (
                        <div key={idx} className="relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 shadow-sm transition-all group/photo">
                          <img src={photo.preview} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={() => removePhoto(idx)}
                            className="absolute top-2 right-2 bg-rose-500/90 hover:bg-rose-600 text-white p-1.5 rounded-full opacity-100 md:opacity-0 md:group-hover/photo:opacity-100 transition-opacity shadow-sm"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    {photos.length < maxPhotos && (
                      <div className="flex gap-2 w-full max-w-xs mx-auto mt-4">
                        <label className="flex-1 cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg transition-all shadow-sm text-center font-bold text-xs flex justify-center items-center gap-1.5">
                          <Camera size={14} /> Tambah
                          <input type="file" accept="image/*" capture="environment" className="hidden" multiple={maxPhotos > 1} onChange={(e) => handleFileChange(e, true)} />
                        </label>
                        <label className="flex-1 cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg transition-all shadow-sm text-center font-bold text-xs flex justify-center items-center gap-1.5">
                          <UploadCloud size={14} /> Tambah
                          <input type="file" accept="image/*" className="hidden" multiple={maxPhotos > 1} onChange={(e) => handleFileChange(e, false)} />
                        </label>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 w-full max-w-xs mx-auto">
                    <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-1">
                      <UploadCloud size={20} />
                    </div>
                    <span className="text-[13px] font-bold text-slate-700">Pilih sumber foto kehadiran:</span>
                    
                    <div className="flex gap-2">
                      <label className="flex-1 cursor-pointer bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-700 hover:text-blue-600 py-3.5 rounded-xl transition-all shadow-sm flex flex-col items-center justify-center gap-2 group">
                        <Camera size={22} className="group-hover:scale-110 transition-transform" />
                        <span className="text-[12px] font-bold">Kamera</span>
                        <span className="text-[9px] text-slate-400 font-medium">(Watermark)</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          capture="environment" 
                          className="hidden" 
                          multiple={maxPhotos > 1}
                          onChange={(e) => handleFileChange(e, true)}
                        />
                      </label>
                      
                      <label className="flex-1 cursor-pointer bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-700 hover:text-emerald-600 py-3.5 rounded-xl transition-all shadow-sm flex flex-col items-center justify-center gap-2 group">
                        <UploadCloud size={22} className="group-hover:scale-110 transition-transform" />
                        <span className="text-[12px] font-bold">Galeri</span>
                        <span className="text-[9px] text-slate-400 font-medium">(Tanpa WM)</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          multiple={maxPhotos > 1}
                          onChange={(e) => handleFileChange(e, false)}
                        />
                      </label>
                    </div>
                  </div>
                )}
                
              </div>
            </div>
          </div>
        </div>

          {/* Kolom Kanan: Daftar Anggota */}
          <div className="lg:col-span-7 flex flex-col lg:pl-8 pt-8 lg:pt-0 border-t lg:border-t-0 border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <UserCheck size={16} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 leading-tight">Status Kehadiran</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Pilih kehadiran tiap anggota</p>
                </div>
              </div>
              <div className="bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200/60 text-[11px] font-bold text-slate-600">
                {anggotaList.length} Orang
              </div>
            </div>
            
            <div className="space-y-3 lg:max-h-[600px] lg:overflow-y-auto lg:pr-2 lg:pb-4" style={{ scrollbarWidth: 'thin' }}>
              {anggotaList.map((anggota) => (
                <div key={anggota.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 sm:px-5 sm:py-3.5 bg-white border border-slate-200/60 shadow-sm shadow-slate-100 hover:border-slate-300 hover:shadow-md rounded-2xl transition-all gap-3 sm:gap-4 group">
                  <div className="flex items-center gap-3 sm:gap-3.5">
                    <div className="w-10 h-10 sm:w-9 sm:h-9 rounded-full bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm shrink-0 group-hover:bg-white group-hover:border-slate-300 transition-all">
                      {anggota.nama.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 block text-sm sm:text-[13px]">{anggota.nama}</span>
                      <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone size={10} className="text-slate-400" /> {anggota.no_hp || "Kosong"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex bg-slate-50 p-1 rounded-xl w-full md:w-auto self-start md:self-auto overflow-x-auto ring-1 ring-slate-200/50">
                    <label className="cursor-pointer flex-1 md:flex-none">
                      <input type="radio" name={`absen-${anggota.id}`} value="Hadir" defaultChecked className="peer sr-only" />
                      <div className="px-3.5 py-1.5 sm:px-3 sm:py-1.5 text-center rounded-lg text-xs font-bold text-slate-500 peer-checked:bg-white peer-checked:text-emerald-600 peer-checked:shadow-sm peer-checked:ring-1 peer-checked:ring-slate-200/60 transition-all">Hadir</div>
                    </label>
                    <label className="cursor-pointer flex-1 md:flex-none">
                      <input type="radio" name={`absen-${anggota.id}`} value="Sakit" className="peer sr-only" />
                      <div className="px-3.5 py-1.5 sm:px-3 sm:py-1.5 text-center rounded-lg text-xs font-bold text-slate-500 peer-checked:bg-white peer-checked:text-amber-600 peer-checked:shadow-sm peer-checked:ring-1 peer-checked:ring-slate-200/60 transition-all">Sakit</div>
                    </label>
                    <label className="cursor-pointer flex-1 md:flex-none">
                      <input type="radio" name={`absen-${anggota.id}`} value="Izin" className="peer sr-only" />
                      <div className="px-3.5 py-1.5 sm:px-3 sm:py-1.5 text-center rounded-lg text-xs font-bold text-slate-500 peer-checked:bg-white peer-checked:text-blue-600 peer-checked:shadow-sm peer-checked:ring-1 peer-checked:ring-slate-200/60 transition-all">Izin</div>
                    </label>
                    <label className="cursor-pointer flex-1 md:flex-none">
                      <input type="radio" name={`absen-${anggota.id}`} value="Alpha" className="peer sr-only" />
                      <div className="px-3.5 py-1.5 sm:px-3 sm:py-1.5 text-center rounded-lg text-xs font-bold text-slate-500 peer-checked:bg-white peer-checked:text-rose-600 peer-checked:shadow-sm peer-checked:ring-1 peer-checked:ring-slate-200/60 transition-all">Alpha</div>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      <div className="pt-4 border-t border-slate-100 flex justify-end">
        <button 
          type="submit" 
          disabled={loading} 
          className="flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-lg text-[13px] font-bold hover:bg-slate-800 w-full sm:w-auto transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-sm hover:shadow active:scale-95"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Menyimpan...</span>
            </>
          ) : (
            <>
              <Save size={16} />
              <span>Simpan Absensi Tim</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}
