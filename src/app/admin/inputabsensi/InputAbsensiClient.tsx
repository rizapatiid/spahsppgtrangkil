"use client"

import { useState, useEffect } from "react"
import { Calendar, Users, Save, CheckCircle2, AlertCircle, Trash2, Camera, X, ImageIcon } from "lucide-react"
import { getAbsensiByDateAndDivisi, saveAbsensiManual, deleteFotoAbsensiManual } from "./actions"

export default function InputAbsensiClient({ divisiList }: { divisiList: any[] }) {
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date()
    return d.toISOString().split("T")[0]
  })
  const [selectedDivisi, setSelectedDivisi] = useState("")
  
  const [anggota, setAnggota] = useState<any[]>([])
  const [absensiData, setAbsensiData] = useState<any>({})
  const [existingFotos, setExistingFotos] = useState<any[]>([])
  type PhotoItem = { file: File, preview: string, name: string }
  const [newFotos, setNewFotos] = useState<PhotoItem[]>([])
  
  const [isLoading, setIsLoading] = useState(false)
  const activeDivName = divisiList.find(d => d.id.toString() === selectedDivisi)?.nama_divisi?.toLowerCase() || ""
  const isTwoPhotos = ["driver", "distribusi", "pengolahan", "persiapan", "pencucian"].some(d => activeDivName.includes(d))
  const maxPhotos = isTwoPhotos ? 2 : 1
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })

  useEffect(() => {
    if (selectedDate && selectedDivisi) {
      loadData()
    } else {
      setAnggota([])
      setAbsensiData({})
      setExistingFotos([])
      setNewFotos([])
    }
  }, [selectedDate, selectedDivisi])

  const loadData = async () => {
    setIsLoading(true)
    setMessage({ type: "", text: "" })
    setNewFotos([])
    setExistingFotos([])
    try {
      const res = await getAbsensiByDateAndDivisi(selectedDate, parseInt(selectedDivisi))
      setAnggota(res.anggota)
      
      const newAbsData: any = {}
      res.anggota.forEach((a: any) => {
        newAbsData[a.id] = { status: "Hadir" }
      })

      if (res.absensi) {
        res.absensi.detail.forEach((d: any) => {
          if (newAbsData[d.anggota_id]) {
            newAbsData[d.anggota_id] = { status: d.status }
          }
        })
      }
      setAbsensiData(newAbsData)
      if (res.fotoBriefingList) {
        setExistingFotos(res.fotoBriefingList)
      }
    } catch (e: any) {
      setMessage({ type: "error", text: "Gagal memuat data" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = (anggotaId: number, status: string) => {
    setAbsensiData((prev: any) => ({
      ...prev,
      [anggotaId]: { status }
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    
    if (existingFotos.length + newFotos.length + files.length > maxPhotos) {
      setMessage({ type: "error", text: `Maksimal ${maxPhotos} foto diperbolehkan untuk divisi ini.` })
      return
    }

    const adding = files.map(f => ({ file: f, preview: URL.createObjectURL(f), name: f.name }))
    setNewFotos(prev => [...prev, ...adding])
    e.target.value = ""
  }

  const removeNewFoto = (idx: number) => {
    setNewFotos(prev => {
      const copy = [...prev]
      URL.revokeObjectURL(copy[idx].preview)
      copy.splice(idx, 1)
      return copy
    })
  }

  const handleDeleteExisting = async (id: string) => {
    if (!confirm("Hapus foto briefing ini?")) return
    try {
      const res = await deleteFotoAbsensiManual(id)
      if (res.error) throw new Error(res.error)
      setExistingFotos(prev => prev.filter((f: any) => f.id !== id))
    } catch(e:any) {
      alert(e.message)
    }
  }

  const handleSave = async () => {
    if (!selectedDate || !selectedDivisi) return
    setIsSaving(true)
    setMessage({ type: "", text: "" })
    
    try {
      const payload = anggota.map(a => ({
        anggota_id: a.id,
        status: absensiData[a.id].status
      }))
      
      const formData = new FormData()
      formData.append("tanggal", selectedDate)
      formData.append("divisiId", selectedDivisi)
      formData.append("absensiData", JSON.stringify(payload))
      
      for (const nf of newFotos) {
        formData.append("foto", nf.file)
      }
      
      const res = await saveAbsensiManual(formData)
      if (res.error) throw new Error(res.error)
      
      setMessage({ type: "success", text: "Data absensi berhasil disimpan!" })
      loadData()
    } catch (e: any) {
      setMessage({ type: "error", text: e.message || "Gagal menyimpan absensi" })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-1">Input Absensi Manual</h2>
          <p className="text-sm text-slate-500">Pilih tanggal dan divisi untuk mengisi atau mengubah absen beserta foto bukti.</p>
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
        selectedDivisi && anggota.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            
            {/* FOTO ABSENSI SECTION */}
            <div className="p-5 sm:p-6 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Camera size={18} className="text-blue-500" />
                Foto Bukti / Briefing
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {existingFotos.map((ef) => (
                  <div key={ef.id} className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-square">
                    <img src={ef.url_foto} alt="Existing" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => handleDeleteExisting(ef.id)}
                      className="absolute top-2 right-2 p-1.5 bg-white/90 text-red-500 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 shadow-sm"
                    >
                      <Trash2 size={14} />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1.5 text-[10px] text-white text-center">Tersimpan</div>
                  </div>
                ))}
                
                {newFotos.map((nf, idx) => (
                  <div key={idx} className="relative group rounded-lg overflow-hidden border border-blue-200 aspect-square ring-2 ring-blue-100">
                    <img src={nf.preview} alt="New" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => removeNewFoto(idx)}
                      className="absolute top-2 right-2 p-1.5 bg-white/90 text-slate-600 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 hover:bg-red-50 shadow-sm"
                    >
                      <X size={14} />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-blue-600/80 p-1.5 text-[10px] font-bold text-white text-center shadow-sm">Baru</div>
                  </div>
                ))}
                
                {(existingFotos.length + newFotos.length < maxPhotos) && (
                  <label className="border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50 rounded-lg aspect-square flex flex-col items-center justify-center cursor-pointer transition-colors text-slate-400 hover:text-blue-500">
                    <Camera size={24} className="mb-2" />
                    <span className="text-[11px] font-bold text-center px-2">Tambah Foto</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple={maxPhotos > 1}
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-800">Daftar Anggota</h3>
              <span className="text-xs font-semibold px-2.5 py-1 bg-white border border-slate-200 text-slate-600 rounded-lg shadow-sm">{anggota.length} orang</span>
            </div>
            
            <div className="divide-y divide-slate-100">
              {anggota.map((a, idx) => (
                <div key={a.id} className="p-4 sm:p-5 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-slate-800 mb-0.5 truncate">{idx + 1}. {a.nama}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    {["Hadir", "Izin", "Sakit", "Alfa"].map(status => (
                      <label key={status} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border cursor-pointer transition-colors text-xs font-bold ${
                        absensiData[a.id]?.status === status 
                          ? (status === "Hadir" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : 
                             status === "Izin" ? "bg-blue-50 border-blue-200 text-blue-700" : 
                             status === "Sakit" ? "bg-amber-50 border-amber-200 text-amber-700" : 
                             "bg-red-50 border-red-200 text-red-700")
                          : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                      }`}>
                        <input
                          type="radio"
                          name={`status-${a.id}`}
                          value={status}
                          checked={absensiData[a.id]?.status === status}
                          onChange={() => handleStatusChange(a.id, status)}
                          className="sr-only"
                        />
                        {status}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-5 border-t border-slate-100 flex justify-end bg-slate-50/50">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-all disabled:opacity-50"
              >
                {isSaving ? "Menyimpan..." : <><Save size={16} /> Simpan Data</>}
              </button>
            </div>
          </div>
        )
      )}
    </div>
  )
}
