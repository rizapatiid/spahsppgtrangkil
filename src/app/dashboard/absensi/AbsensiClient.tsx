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
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const router = useRouter()

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

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMessage({ text: "", type: "" })

    const form = e.currentTarget
    const formData = new FormData(form)

    // Kompresi & Watermark foto
    const foto = formData.get("foto") as File
    if (foto && foto.size > 0) {
      const watermarkedFoto = await addWatermark(foto, divisiName)
      const compressedFoto = await handleCompress(watermarkedFoto)
      formData.set("foto", compressedFoto, foto.name)
    }

    const res = await submitAbsensi(formData)

    if (res.error) {
      setMessage({ text: res.error, type: "error" })
    } else {
      setMessage({ text: "Absensi berhasil disimpan!", type: "success" })
      setFileName("")
      setFilePreview(null)
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
            <div className="border-2 border-dashed border-slate-200/80 bg-slate-50/50 rounded-2xl p-6 hover:bg-slate-50 hover:border-blue-200 transition-all group">
              <div className="flex flex-col items-center text-center">
                <label className="cursor-pointer flex flex-col items-center w-full">
                  {filePreview ? (
                    <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 mb-3 shadow-sm group-hover:ring-2 group-hover:ring-blue-100 transition-all">
                      <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-slate-900/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                         <UploadCloud size={24} className="text-white mb-2" />
                         <span className="text-white text-xs font-bold">Ganti Foto</span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 mb-3 group-hover:scale-110 group-hover:text-blue-500 group-hover:border-blue-100 transition-all">
                      <UploadCloud size={20} />
                    </div>
                  )}
                  
                  {!filePreview && (
                    <>
                      <span className="text-[13px] font-bold text-slate-700 mb-1">Klik untuk memilih foto</span>
                      <span className="text-[11px] text-slate-500 max-w-[200px] leading-relaxed">
                        Sistem akan otomatis memberikan watermark waktu & lokasi.
                      </span>
                    </>
                  )}
                  <input 
                    type="file" 
                    name="foto" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setFileName(file.name)
                        // Buat watermark untuk preview sekalian
                        const watermarked = await addWatermark(file, divisiName)
                        setFilePreview(URL.createObjectURL(watermarked))
                      } else {
                        setFileName("")
                        setFilePreview(null)
                      }
                    }}
                    required 
                  />
                </label>
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
