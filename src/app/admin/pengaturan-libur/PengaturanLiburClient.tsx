"use client"

import { useState } from "react"
import { Calendar, Trash2, Plus, CalendarOff } from "lucide-react"
import { addHariLibur, deleteHariLibur } from "./actions"
import { useModal } from "@/components/ModalContext"
import { useRouter } from "next/navigation"

export default function PengaturanLiburClient({ initialData }: { initialData: any[] }) {
  const [data, setData] = useState(initialData)
  const [tanggal, setTanggal] = useState("")
  const [keterangan, setKeterangan] = useState("")
  const [loading, setLoading] = useState(false)
  const { showConfirm, showAlert } = useModal()
  const router = useRouter()

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tanggal) return showAlert("Pilih tanggal terlebih dahulu", "danger")

    setLoading(true)
    const res = await addHariLibur(tanggal, keterangan)
    setLoading(false)

    if (res.error) {
      showAlert(res.error, "danger")
    } else {
      showAlert("Hari libur berhasil ditambahkan", "success")
      setTanggal("")
      setKeterangan("")
      router.refresh()
    }
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
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-[15px] font-extrabold text-slate-800 mb-4 flex items-center gap-2">
          <CalendarOff size={18} className="text-blue-500" />
          Tambah Hari Libur Baru
        </h2>
        
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-4 items-end">
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
              placeholder="Contoh: Libur Jumat Rutin"
              value={keterangan}
              onChange={e => setKeterangan(e.target.value)}
              className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-xl text-[13px] font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[13px] font-bold transition shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
          >
            <Plus size={16} /> Tambah
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-[15px] font-extrabold text-slate-800">Daftar Hari Libur</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {data.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-[13px] font-medium">Belum ada data hari libur.</div>
          ) : (
            data.map(item => (
              <div key={item.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50/50 transition">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
                    <CalendarOff size={18} />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold text-slate-800">{formatTanggal(item.tanggal)}</h3>
                    <p className="text-[12px] font-medium text-slate-500 mt-0.5">{item.keterangan || "Libur"}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
