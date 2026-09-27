"use client"

import { useState } from "react"
import { createPortal } from "react-dom"
import { Calendar, Trash2, Plus, CalendarOff, Users, CheckSquare, Square, X, Edit2, Eye } from "lucide-react"
import { saveJadwalLibur, deleteHariLibur } from "./actions"
import { useModal } from "@/components/ModalContext"
import { useRouter } from "next/navigation"

function ModalPortal({ children }: { children: React.ReactNode }) {
  if (typeof document === "undefined") return null
  return createPortal(children, document.body)
}

export default function PengaturanLiburClient({ 
  initialData, 
  divisiData 
}: { 
  initialData: any[], 
  divisiData: any[] 
}) {
  const [data, setData] = useState(initialData)
  const [tanggal, setTanggal] = useState("")
  const [keterangan, setKeterangan] = useState("")
  
  // State for which relawan are selected for holiday
  const [selectedRelawan, setSelectedRelawan] = useState<number[]>([])
  const [detailItem, setDetailItem] = useState<any>(null)
  
  const [loading, setLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const { showConfirm, showAlert } = useModal()
  const router = useRouter()

  const handleToggleRelawan = (id: number) => {
    setSelectedRelawan(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleSelectDivisi = (divisiId: number, isSelectAll: boolean) => {
    const anggotaIds = divisiData.find(d => d.id === divisiId)?.anggota.map((a:any) => a.id) || []
    if (isSelectAll) {
      setSelectedRelawan(prev => Array.from(new Set([...prev, ...anggotaIds])))
    } else {
      setSelectedRelawan(prev => prev.filter(id => !anggotaIds.includes(id)))
    }
  }

  const handleSelectAll = (isSelectAll: boolean) => {
    if (isSelectAll) {
      const allIds = divisiData.flatMap(d => d.anggota.map((a:any) => a.id))
      setSelectedRelawan(allIds)
    } else {
      setSelectedRelawan([])
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tanggal) return showAlert("Pilih tanggal terlebih dahulu", "danger")
    if (selectedRelawan.length === 0) return showAlert("Pilih minimal satu relawan yang libur", "danger")

    setLoading(true)
    const res = await saveJadwalLibur(tanggal, keterangan, selectedRelawan)
    setLoading(false)

    if (res.error) {
      showAlert(res.error, "danger")
    } else {
      showAlert("Jadwal libur berhasil disimpan", "success")
      setTanggal("")
      setKeterangan("")
      setSelectedRelawan([])
      router.refresh()
    }
  }

  const handleEdit = (item: any) => {
    try {
      const dateStr = new Date(item.tanggal).toISOString().split('T')[0];
      setTanggal(dateStr);
    } catch(e) {
      if (typeof item.tanggal === 'string') {
        setTanggal(item.tanggal.split('T')[0]);
      }
    }
    setKeterangan(item.keterangan || "");
    const ids = item.relawan?.map((r: any) => r.anggota_id) || [];
    setSelectedRelawan(ids);
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const handleDelete = async (id: number) => {
    const confirmed = await showConfirm("Hapus tanggal libur ini?")
    if (!confirmed) return

    const res = await deleteHariLibur(id)
    if (res.error) {
      showAlert(res.error, "danger")
    } else {
      setData(prev => prev.filter(d => d.id !== id))
    }
  }

  const formatTanggal = (isoStr: string) => {
    return new Date(isoStr).toLocaleDateString("id-ID", {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex items-center justify-between gap-3 mb-2 pb-4 border-b border-slate-200/80 px-1">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <CalendarOff size={18} strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <h2 className="text-[15px] sm:text-[16px] font-extrabold text-slate-800 tracking-tight truncate">Pengaturan Hari Libur</h2>
            <p className="text-[11px] text-slate-500 font-medium truncate">Atur jadwal libur per relawan pada tanggal tertentu.</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3 sm:px-4 py-2 rounded-lg text-[12px] font-bold shadow-sm transition-all shrink-0 cursor-pointer"
        >
          <Plus size={15} className={showAddForm ? "rotate-45 transition-transform" : "transition-transform"} />
          <span className="hidden sm:inline">{showAddForm ? "Tutup Form" : "Buat Jadwal Baru"}</span>
          <span className="sm:hidden">{showAddForm ? "Tutup" : "Buat"}</span>
        </button>
      </div>

      {showAddForm && (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-top-4 duration-300">
        <h2 className="text-[15px] font-extrabold text-slate-800 mb-4 flex items-center gap-2">
          <CalendarOff size={18} className="text-blue-500" />
          Formulir Jadwal Libur Relawan
        </h2>
        
        <form onSubmit={async (e) => { await handleAdd(e); setShowAddForm(false); }} className="space-y-5">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Tanggal Libur</label>
              <input 
                type="date" 
                required
                value={tanggal}
                onChange={e => setTanggal(e.target.value)}
                className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-xl text-[13px] font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
            <div className="flex-1 w-full">
              <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Keterangan (Opsional)</label>
              <input 
                type="text" 
                placeholder="Contoh: Libur Jumat Rutin (Shift Pagi)"
                value={keterangan}
                onChange={e => setKeterangan(e.target.value)}
                className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-xl text-[13px] font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
            <div className="p-3 bg-slate-100 border-b border-slate-200 flex justify-between items-center">
              <span className="text-[12px] font-extrabold text-slate-600">Pilih Relawan yang Libur:</span>
              <button
                type="button"
                onClick={() => handleSelectAll(selectedRelawan.length === 0)}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded"
              >
                {selectedRelawan.length > 0 ? "Batal Pilih Semua" : "Pilih Semua"}
              </button>
            </div>
            
            <div className="p-4 max-h-[300px] overflow-y-auto space-y-4">
              {divisiData.map(divisi => {
                const anggotaIds = divisi.anggota.map((a:any) => a.id)
                const isAllSelected = anggotaIds.length > 0 && anggotaIds.every((id:any) => selectedRelawan.includes(id))
                
                return (
                  <div key={divisi.id} className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <button 
                        type="button" 
                        onClick={() => handleSelectDivisi(divisi.id, !isAllSelected)}
                        className="text-slate-500 hover:text-blue-600 transition"
                      >
                        {isAllSelected ? <CheckSquare size={16} className="text-blue-500" /> : <Square size={16} />}
                      </button>
                      <span className="text-[12px] font-extrabold text-slate-800 uppercase tracking-wider">
                        {divisi.nama_divisi}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pl-6">
                      {divisi.anggota.map((anggota: any) => {
                        const isSelected = selectedRelawan.includes(anggota.id)
                        return (
                          <label key={anggota.id} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition ${isSelected ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                            <input 
                              type="checkbox" 
                              checked={isSelected}
                              onChange={() => handleToggleRelawan(anggota.id)}
                              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <span className={`text-[12px] font-medium truncate ${isSelected ? 'text-blue-700' : 'text-slate-600'}`}>
                              {anggota.nama}
                            </span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setShowAddForm(false)} className="px-5 py-2.5 bg-slate-150 hover:bg-slate-200 text-slate-700 rounded-lg text-[13px] font-bold transition cursor-pointer">Batal</button>
            <button type="submit" disabled={loading} className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[13px] font-bold transition shadow-md cursor-pointer disabled:opacity-50">
              {loading ? "Menyimpan..." : "Simpan Jadwal"}
            </button>
          </div>
        </form>
      </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-[15px] font-extrabold text-slate-800">Daftar Jadwal Libur Aktif</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {data.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-[13px] font-medium">Belum ada jadwal libur yang diatur.</div>
          ) : (
            data.map(item => (
              <div key={item.id} className="p-4 sm:p-5 flex items-start justify-between hover:bg-slate-50/50 transition">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 shrink-0 mt-1">
                    <CalendarOff size={18} />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold text-slate-800">{formatTanggal(item.tanggal)}</h3>
                    <p className="text-[12px] font-medium text-slate-500 mt-0.5">{item.keterangan || "Libur Khusus"}</p>
                    <div className="mt-2 flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md w-fit">
                      <Users size={12} className="text-slate-400" />
                      <span className="text-[11px] font-bold text-slate-600">{item.relawan?.length || 0} Relawan Libur</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 shrink-0 ml-3">
                  <button 
                    onClick={() => setDetailItem(item)}
                    className="inline-flex items-center justify-center gap-1.5 text-[11px] sm:text-[12px] bg-slate-900 text-white hover:bg-slate-800 transition-all px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg font-bold shadow-sm shrink-0 cursor-pointer"
                  >
                    <Eye size={13} strokeWidth={2.5} />
                    <span className="hidden sm:inline">Detail</span>
                  </button>
                  <button 
                    onClick={() => handleEdit(item)}
                    className="inline-flex items-center justify-center gap-1.5 text-[11px] sm:text-[12px] bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 transition-all px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg font-bold shadow-sm shrink-0 cursor-pointer"
                  >
                    <Edit2 size={13} strokeWidth={2.5} />
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="inline-flex items-center justify-center gap-1.5 text-[11px] sm:text-[12px] bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 transition-all px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg font-bold shadow-sm shrink-0 cursor-pointer"
                  >
                    <Trash2 size={13} strokeWidth={2.5} />
                    <span className="hidden sm:inline">Hapus</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {/* DETAIL MODAL */}
      {detailItem && (
        <ModalPortal>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 p-4 sm:p-5 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0">
                  <Users size={16} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-[14px]">Detail Relawan Libur</h3>
                  <p className="text-slate-300 text-[11px] font-medium">{formatTanggal(detailItem.tanggal)}</p>
                </div>
              </div>
              <button onClick={() => setDetailItem(null)} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 max-h-[60vh] overflow-y-auto space-y-4 bg-white">
              {detailItem.relawan?.length === 0 ? (
                <p className="text-center text-slate-500 text-sm py-4 font-medium">Tidak ada relawan yang ditandai libur.</p>
              ) : (
                <div className="space-y-4">
                  {(() => {
                    const grouped = detailItem.relawan?.reduce((acc: any, curr: any) => {
                      const divName = curr.anggota?.divisi?.nama_divisi || "Tanpa Divisi";
                      if (!acc[divName]) acc[divName] = [];
                      acc[divName].push(curr.anggota?.nama || "Tanpa Nama");
                      return acc;
                    }, {});
                    
                    return grouped ? Object.entries(grouped).map(([divName, names]: any) => (
                      <div key={divName}>
                        <h4 className="text-[11px] font-extrabold text-blue-500 uppercase tracking-wider mb-2">{divName}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {names.map((name: string, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 p-2 rounded-lg border border-slate-100 bg-slate-50 hover:border-slate-200 transition">
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                              <span className="font-bold text-[13px] text-slate-700 truncate">{name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )) : null;
                  })()}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 p-4 border-t border-slate-100 bg-slate-50">
              <button 
                onClick={() => setDetailItem(null)}
                className="px-5 py-2.5 bg-slate-150 hover:bg-slate-200 text-slate-700 rounded-lg text-[13px] font-bold transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
        </ModalPortal>
      )}
    </div>
  )
}
