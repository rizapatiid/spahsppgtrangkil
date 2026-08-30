"use client"

import { useState, useEffect } from "react"
import { Calendar, Users, Save, CheckCircle2, AlertCircle, Trash2, X, Image as ImageIcon, Camera } from "lucide-react"
import { getLaporanByDateAndDivisi, saveLaporanManual, deleteFotoManual } from "./actions"

export default function InputLaporanClient({ divisiList }: { divisiList: any[] }) {
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date()
    return d.toISOString().split("T")[0]
  })
  const [selectedDivisi, setSelectedDivisi] = useState("")
  
  const [isiLaporan, setIsiLaporan] = useState("")
  const [role, setRole] = useState("")
  const [existingPhotos, setExistingPhotos] = useState<any[]>([])
  
  const [selectedFiles, setSelectedFiles] = useState<Record<string, { file: File, preview: string, keterangan?: string }[]>>({})
  
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })

  const getCategories = (r: string) => {
    const base = [{ id: "kegiatan", label: "1. Foto Kegiatan" }]
    if (r === "PERSIAPAN") return [...base, { id: "bahan_makanan", label: "2. Foto Bahan Makanan (Bersih)" }, { id: "sampah", label: "3. Foto Sampah" }]
    if (r === "PENGOLAHAN") return [...base, { id: "masakan_matang", label: "2. Foto Masakan Matang" }, { id: "sampah", label: "3. Foto Sampah" }]
    if (r === "PEMORSIAN") return [...base, { id: "makanan_diporsi", label: "2. Foto Makanan yang Diporsi" }, { id: "kondisi_sebelum_dikirim", label: "3. Foto Kondisi Makanan Sebelum Dikirim" }, { id: "tray_siap", label: "4. Foto Tray Siap Distribusi" }, { id: "sisa_pemorsian", label: "5. Foto Sisa Pemorsian" }]
    if (r === "DISTRIBUSI") return [...base, { id: "lokasi_distribusi", label: "2. Foto Bukti di Lokasi" }, { id: "tray_kembali", label: "3. Foto Tray Kembali ke SPPG" }]
    if (r === "PENCUCIAN") return [...base, { id: "limbah_makanan", label: "2. Foto Limbah Makanan" }, { id: "tray_kembali", label: "3. Foto Tray Kembali ke SPPG" }]
    if (r === "KEBERSIHAN" || r === "SATPAM") return [...base, { id: "sampah_akhir", label: "2. Foto Sampah Akhir" }]
    return base
  }

  const categories = getCategories(role)

  useEffect(() => {
    if (selectedDate && selectedDivisi) {
      loadData()
    } else {
      resetForm()
    }
  }, [selectedDate, selectedDivisi])

  const resetForm = () => {
    setIsiLaporan("")
    setRole("")
    setExistingPhotos([])
    setSelectedFiles({})
    setMessage({ type: "", text: "" })
  }

  const loadData = async () => {
    setIsLoading(true)
    resetForm()
    try {
      const res = await getLaporanByDateAndDivisi(selectedDate, parseInt(selectedDivisi))
      setRole(res.role)
      if (res.laporan) {
        setIsiLaporan(res.laporan.isi_laporan || "")
        setExistingPhotos(res.laporan.foto || [])
      }
    } catch (e: any) {
      setMessage({ type: "error", text: "Gagal memuat data laporan" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, catId: string) => {
    if (!e.target.files) return
    const files = Array.from(e.target.files)
    const newFiles = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      keterangan: ""
    }))

    setSelectedFiles(prev => ({
      ...prev,
      [catId]: [...(prev[catId] || []), ...newFiles]
    }))
    
    e.target.value = ""
  }

  const removeSelectedFile = (catId: string, idx: number) => {
    setSelectedFiles(prev => {
      const copy = [...(prev[catId] || [])]
      URL.revokeObjectURL(copy[idx].preview)
      copy.splice(idx, 1)
      return { ...prev, [catId]: copy }
    })
  }

  const handleKeteranganChange = (catId: string, idx: number, val: string) => {
    setSelectedFiles(prev => {
      const copy = [...(prev[catId] || [])]
      copy[idx] = { ...copy[idx], keterangan: val }
      return { ...prev, [catId]: copy }
    })
  }

  const handleEditExistingKeterangan = async (id: string, currentText: string) => {
    const newKet = prompt("Edit Keterangan Foto:", currentText || "")
    if (newKet === null) return
    try {
      const { updateFotoKeteranganManual } = await import("./actions")
      const res = await updateFotoKeteranganManual(id, newKet)
      if (res.error) throw new Error(res.error)
      setExistingPhotos(prev => prev.map(p => p.id === id ? { ...p, catatan: { keterangan: newKet } } : p))
    } catch(e:any) {
      alert(e.message)
    }
  }

  const handleDeleteExisting = async (id: string) => {
    if (!confirm("Hapus foto ini?")) return
    try {
      const res = await deleteFotoManual(id)
      if (res.error) throw new Error(res.error)
      setExistingPhotos(prev => prev.filter(p => p.id !== id))
    } catch(e:any) {
      alert(e.message)
    }
  }

  const handleSave = async () => {
    if (!selectedDate || !selectedDivisi) return
    setIsSaving(true)
    setMessage({ type: "", text: "" })
    
    try {
      const formData = new FormData()
      formData.append("tanggal", selectedDate)
      formData.append("divisiId", selectedDivisi)
      formData.append("isi_laporan", isiLaporan)
      
      let counter = 0
      categories.forEach(cat => {
        const files = selectedFiles[cat.id] || []
        files.forEach(f => {
          formData.append(`foto_${cat.id}_${counter}`, f.file)
          formData.append(`ket_${cat.id}_${counter}`, f.keterangan || "")
          counter++
        })
      })
      
      const res = await saveLaporanManual(formData)
      if (res.error) throw new Error(res.error)
      
      setMessage({ type: "success", text: "Laporan manual berhasil disimpan!" })
      loadData()
    } catch (e: any) {
      setMessage({ type: "error", text: e.message || "Gagal menyimpan laporan" })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-1">Input Laporan Manual</h2>
          <p className="text-sm text-slate-500">Pilih tanggal dan divisi untuk mengisi atau mengubah laporan harian.</p>
        </div>
        
        <div className="p-5 sm:p-6 bg-slate-50/50 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Tanggal</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
          </div>
          
          <div className="flex-1">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Divisi</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <select
                value={selectedDivisi}
                onChange={e => setSelectedDivisi(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-100 outline-none bg-white appearance-none"
              >
                <option value="" disabled>Pilih Divisi...</option>
                {divisiList.map(d => (
                  <option key={d.id} value={d.id}>{d.nama_divisi}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === "error" ? "bg-red-50 text-red-600 border border-red-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"}`}>
          {message.type === "error" ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <p className="text-sm font-semibold">{message.text}</p>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-10 text-slate-400 text-sm font-medium">Memuat data...</div>
      ) : (
        selectedDivisi && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            
            <div className="p-5 sm:p-6 space-y-8">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Catatan Laporan</label>
                <textarea
                  rows={4}
                  value={isiLaporan}
                  onChange={e => setIsiLaporan(e.target.value)}
                  placeholder="Tulis kegiatan hari ini..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-100 outline-none resize-none"
                />
              </div>

              <div className="space-y-8">
                {categories.map((cat) => {
                  const serverPhotos = existingPhotos.filter(f => f.tipe_foto === cat.id)
                  const localPhotos = selectedFiles[cat.id] || []
                  
                  return (
                    <div key={cat.id} className="pb-8 border-b border-slate-100 last:border-0 last:pb-0">
                      <div className="flex flex-row items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm sm:text-base">
                          <ImageIcon size={18} className="text-blue-500" />
                          {cat.label}
                        </h3>
                        
                        <label className="flex items-center gap-2 cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg transition-colors text-[12px] font-bold">
                          <Camera size={14} /> Tambah Foto
                          <input 
                            type="file" 
                            accept="image/*" 
                            multiple 
                            onChange={e => handleFileChange(e, cat.id)}
                            className="hidden"
                          />
                        </label>
                      </div>
                      
                      {(serverPhotos.length > 0 || localPhotos.length > 0) ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                          
                          {/* FOTO DARI DATABASE */}
                          {serverPhotos.map(p => (
                            <div key={p.id} className="flex flex-row sm:flex-col bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                              <div className="relative w-24 h-24 sm:w-full sm:h-auto sm:aspect-[4/3] bg-slate-100 border-r sm:border-r-0 sm:border-b border-slate-100 shrink-0">
                                 <img src={p.url_foto} alt={cat.label} className="w-full h-full object-cover" />
                                 <div className="absolute top-2 left-2 bg-black/60 px-2 py-0.5 rounded-md text-[10px] text-white font-bold backdrop-blur-sm">Tersimpan</div>
                              </div>
                              <div className="p-3 flex flex-1 flex-row sm:flex-col items-center sm:items-stretch gap-3 sm:gap-0 min-w-0">
                                <div className="flex-1 flex flex-col min-w-0 py-1 sm:py-0">
                                  <p className="text-[12px] font-bold text-slate-800 line-clamp-2 leading-snug mb-1">
                                    {p.catatan?.keterangan || <span className="text-slate-400 font-normal italic">Keterangan kosong...</span>}
                                  </p>
                                </div>
                                <div className="flex flex-col sm:flex-row items-stretch gap-1.5 sm:pt-2.5 sm:border-t border-slate-100/80 w-20 sm:w-auto shrink-0">
                                  <button 
                                    type="button"
                                    onClick={() => handleEditExistingKeterangan(p.id, p.catatan?.keterangan || "")}
                                    className="flex-1 py-1.5 px-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md text-[11px] sm:text-[12px] font-bold transition-colors text-center"
                                  >
                                    Edit
                                  </button>
                                  <button 
                                    type="button"
                                    onClick={() => handleDeleteExisting(p.id)}
                                    className="flex-1 py-1.5 px-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-md text-[11px] sm:text-[12px] font-bold transition-colors text-center"
                                  >
                                    Hapus
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          {/* FOTO BARU YG AKAN DIUPLOAD */}
                          {localPhotos.map((p, idx) => (
                            <div key={idx} className="flex flex-row sm:flex-col bg-amber-50/40 rounded-lg border border-amber-200/60 relative overflow-hidden shadow-sm">
                              <div className="relative w-24 h-24 sm:w-full sm:h-auto sm:aspect-[4/3] bg-slate-100 border-r sm:border-r-0 sm:border-b border-amber-100/50 shrink-0">
                                <img src={p.preview} alt="New" className="w-full h-full object-cover" />
                                <button 
                                  type="button"
                                  onClick={() => removeSelectedFile(cat.id, idx)}
                                  className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-white/90 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-100 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-all shadow-sm backdrop-blur-sm"
                                >
                                  <X size={14} />
                                </button>
                                <div className="absolute top-2 left-2 bg-blue-600/80 px-2 py-0.5 rounded-md text-[10px] text-white font-bold backdrop-blur-sm">Baru</div>
                              </div>
                              <div className="p-2 sm:p-3 flex-1 flex flex-col justify-center min-w-0">
                                <textarea 
                                  placeholder="Ketikan keterangan foto..."
                                  value={p.keterangan || ""}
                                  onChange={(e) => handleKeteranganChange(cat.id, idx, e.target.value)}
                                  rows={2}
                                  className="w-full h-full sm:h-auto bg-white border border-amber-200/60 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 px-2.5 py-2 text-[12px] text-slate-700 rounded-lg outline-none transition-all placeholder:text-slate-400 shadow-sm resize-none"
                                ></textarea>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center text-slate-400 bg-slate-50/50">
                          <ImageIcon size={32} className="mx-auto mb-2 opacity-50" />
                          <p className="text-sm font-medium">Belum ada foto</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
            
            <div className="p-5 sm:p-6 border-t border-slate-100 flex justify-end bg-slate-50/50">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-all disabled:opacity-50"
              >
                {isSaving ? "Menyimpan..." : <><Save size={16} /> Simpan Laporan</>}
              </button>
            </div>
          </div>
        )
      )}
    </div>
  )
}
