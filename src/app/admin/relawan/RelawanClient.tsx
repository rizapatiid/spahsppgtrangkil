"use client"

import { useState } from "react"
import { createPortal } from "react-dom"
import { Users, UserPlus, Search, X, Edit, Trash2 } from "lucide-react"
import { createRelawan, updateRelawan, deleteRelawan } from "./actions"
import ConfirmModal from "@/components/ConfirmModal"

function ModalPortal({ children }: { children: React.ReactNode }) {
  if (typeof document === "undefined") return null
  return createPortal(children, document.body)
}

export default function RelawanClient({ relawan, divisiList }: { relawan: any[], divisiList: any[] }) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  
  const [editData, setEditData] = useState<any>(null)
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

  // Filter based on search
  const filteredRelawan = relawan.filter(r => 
    r.nama.toLowerCase().includes(search.toLowerCase()) || 
    (r.nik && r.nik.includes(search)) ||
    r.divisi?.nama_divisi.toLowerCase().includes(search.toLowerCase())
  )

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const res = await createRelawan(formData)
    setLoading(false)
    
    if (res.error) {
      alert(res.error)
    } else {
      setShowAddForm(false)
      alert("Relawan berhasil ditambahkan")
    }
  }

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!editData) return
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const res = await updateRelawan(editData.id, formData)
    setLoading(false)
    
    if (res.error) {
      alert(res.error)
    } else {
      setEditData(null)
      alert("Data relawan berhasil diperbarui")
    }
  }

  function handleDelete(id: number) {
    setConfirmConfig({
      isOpen: true,
      title: "Hapus Relawan",
      message: "Yakin ingin menghapus data relawan ini secara permanen?",
      type: "danger",
      onConfirm: async () => {
        setConfirmConfig(prev => ({ ...prev, isOpen: false }))
        setLoading(true)
        await deleteRelawan(id)
        setLoading(false)
      }
    })
  }

  return (
    <div className="space-y-6">
      
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2 pb-4 border-b border-slate-200/80 px-1">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Users size={18} strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <h2 className="text-[15px] sm:text-[16px] font-extrabold text-slate-800 tracking-tight truncate">Data Relawan</h2>
            <p className="text-[11px] text-slate-500 font-medium truncate">Kelola informasi relawan SPPG Trangkil</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg text-[12px] font-bold shadow-sm transition-all shrink-0 cursor-pointer w-full sm:w-auto"
        >
          <UserPlus size={15} />
          {showAddForm ? "Tutup Form" : "Tambah Relawan"}
        </button>
      </div>

      {/* Form Tambah Relawan */}
      {showAddForm && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 sm:p-5 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <UserPlus size={16} className="text-slate-400" />
            <h3 className="text-[13px] font-extrabold text-slate-800 uppercase tracking-wider">Tambah Relawan Baru</h3>
          </div>
          
          <form onSubmit={handleCreate} className="space-y-4 max-w-3xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Nama Lengkap</label>
                <input name="nama" required className="w-full border border-slate-200 bg-slate-50/50 p-2.5 rounded-lg text-[13px] text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none" placeholder="Masukkan nama relawan..." />
              </div>
              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">NIK (Opsional)</label>
                <input name="nik" className="w-full border border-slate-200 bg-slate-50/50 p-2.5 rounded-lg text-[13px] text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none" placeholder="Nomor Induk Kependudukan..." />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Divisi Penugasan</label>
                <select name="divisi_id" required className="w-full border border-slate-200 bg-slate-50/50 p-2.5 rounded-lg text-[13px] text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none">
                  <option value="">-- Pilih Divisi --</option>
                  {divisiList.map(d => (
                    <option key={d.id} value={d.id}>{d.nama_divisi}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Nomor HP / WA (Opsional)</label>
                <input name="no_hp" className="w-full border border-slate-200 bg-slate-50/50 p-2.5 rounded-lg text-[13px] text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none" placeholder="08..." />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Alamat (Opsional)</label>
              <textarea name="alamat" rows={2} className="w-full border border-slate-200 bg-slate-50/50 p-2.5 rounded-lg text-[13px] text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none" placeholder="Alamat lengkap relawan..."></textarea>
            </div>
            
            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button disabled={loading} className="bg-slate-900 text-white px-6 py-2.5 rounded-lg text-[13px] font-bold hover:bg-slate-800 transition shadow-md hover:shadow-lg w-full sm:w-auto cursor-pointer">
                {loading ? "Menyimpan..." : "Simpan Data"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Cari & List */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Cari nama, NIK, atau divisi..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition"
            />
          </div>
          <span className="text-[12px] text-slate-500 font-bold bg-slate-100 px-3 py-1.5 rounded-lg">
            Total: {filteredRelawan.length} Orang
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                <th className="p-4 py-3">Nama Lengkap</th>
                <th className="p-4 py-3 hidden sm:table-cell">NIK</th>
                <th className="p-4 py-3">Divisi</th>
                <th className="p-4 py-3 hidden md:table-cell">Kontak & Alamat</th>
                <th className="p-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRelawan.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 text-[13px] font-medium">
                    Tidak ada data relawan ditemukan.
                  </td>
                </tr>
              ) : (
                filteredRelawan.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-4">
                      <p className="text-[13px] font-extrabold text-slate-800">{r.nama}</p>
                      <p className="text-[11px] text-slate-500 sm:hidden mt-0.5">{r.nik || "Tanpa NIK"}</p>
                    </td>
                    <td className="p-4 hidden sm:table-cell text-[12px] font-medium text-slate-600">
                      {r.nik || "—"}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-[11px] font-bold rounded-md">
                        {r.divisi?.nama_divisi || "—"}
                      </span>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <p className="text-[12px] font-medium text-slate-600">{r.no_hp || "—"}</p>
                      <p className="text-[11px] text-slate-400 truncate max-w-[200px]" title={r.alamat}>{r.alamat || "—"}</p>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button 
                        onClick={() => setEditData(r)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition cursor-pointer"
                      >
                        <Edit size={12} />
                        <span className="hidden xl:inline">Edit</span>
                      </button>
                      <button 
                        onClick={() => handleDelete(r.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-[11px] font-bold transition cursor-pointer"
                      >
                        <Trash2 size={12} />
                        <span className="hidden xl:inline">Hapus</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editData && (
        <ModalPortal>
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col">
            <div className="bg-slate-900 p-4 sm:p-5 flex items-center justify-between text-white shrink-0">
              <h3 className="font-extrabold text-[14px]">Edit Data Relawan</h3>
              <button onClick={() => setEditData(null)} className="text-slate-400 hover:text-white transition"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleEdit} className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Nama Lengkap</label>
                  <input name="nama" defaultValue={editData.nama} required className="w-full border border-slate-200 bg-slate-50/50 p-2.5 rounded-lg text-[13px] text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">NIK</label>
                  <input name="nik" defaultValue={editData.nik || ""} className="w-full border border-slate-200 bg-slate-50/50 p-2.5 rounded-lg text-[13px] text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition outline-none" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Divisi Penugasan</label>
                  <select name="divisi_id" defaultValue={editData.divisi_id} required className="w-full border border-slate-200 bg-slate-50/50 p-2.5 rounded-lg text-[13px] text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition outline-none">
                    {divisiList.map(d => (
                      <option key={d.id} value={d.id}>{d.nama_divisi}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Nomor HP</label>
                  <input name="no_hp" defaultValue={editData.no_hp || ""} className="w-full border border-slate-200 bg-slate-50/50 p-2.5 rounded-lg text-[13px] text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Alamat</label>
                <textarea name="alamat" defaultValue={editData.alamat || ""} rows={2} className="w-full border border-slate-200 bg-slate-50/50 p-2.5 rounded-lg text-[13px] text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition outline-none"></textarea>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setEditData(null)} className="px-5 py-2.5 bg-slate-150 hover:bg-slate-200 text-slate-700 rounded-lg text-[13px] font-bold transition">Batal</button>
                <button type="submit" disabled={loading} className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[13px] font-bold transition shadow-md cursor-pointer">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
        </ModalPortal>
      )}

      {/* Confirm Modal */}
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
