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
      <div className="flex items-center justify-between gap-3 mb-2 pb-4 border-b border-slate-200/80 px-1">
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
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3 sm:px-4 py-2 rounded-lg text-[12px] font-bold shadow-sm transition-all shrink-0 cursor-pointer"
        >
          <UserPlus size={15} />
          <span className="hidden sm:inline">Tambah Relawan</span>
          <span className="sm:hidden">Tambah</span>
        </button>
      </div>

      {/* Form Tambah Relawan Modal */}
      {showAddForm && (
        <ModalPortal>
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 p-4 sm:p-5 flex items-center justify-between text-white shrink-0 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <UserPlus size={18} className="text-emerald-400" />
                <h3 className="font-extrabold text-[14px]">Tambah Relawan Baru</h3>
              </div>
              <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-white transition"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleCreate} className="p-5 space-y-4">
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
              
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowAddForm(false)} className="px-5 py-2.5 bg-slate-150 hover:bg-slate-200 text-slate-700 rounded-lg text-[13px] font-bold transition">Batal</button>
                <button type="submit" disabled={loading} className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[13px] font-bold transition shadow-md cursor-pointer">
                  {loading ? "Menyimpan..." : "Simpan Data"}
                </button>
              </div>
            </form>
          </div>
        </div>
        </ModalPortal>
      )}

      {/* Cari & List */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
          <h3 className="text-[13px] font-extrabold text-slate-800 uppercase tracking-wider hidden sm:block">
            Daftar Relawan
          </h3>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder="Cari relawan, NIK..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-[12px] outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition shadow-sm"
              />
            </div>
            <span className="text-[11px] text-slate-400 font-semibold shrink-0">
              {filteredRelawan.length} Data
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          {filteredRelawan.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center shadow-sm">
              <p className="text-[13px] font-medium text-slate-400">Tidak ada data relawan ditemukan.</p>
            </div>
          ) : (
            filteredRelawan.map((r) => {
              const initial = r.nama.charAt(0).toUpperCase()
              return (
                <div key={r.id} className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center gap-3 px-3 py-3 sm:px-4">
                  
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    {/* Avatar */}
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-[14px] sm:text-[15px] font-extrabold shrink-0">
                      {initial}
                    </div>

                    {/* Info (Nama, Divisi, NIK) */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[12px] sm:text-[13px] font-extrabold text-slate-800 truncate leading-tight">{r.nama}</p>
                        {r.divisi?.koordinator === r.nama && (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded text-[9px] font-bold border border-amber-100 uppercase tracking-wider shrink-0">
                            Koordinator
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span className="text-[10px] text-emerald-600 font-bold tracking-wide truncate">{r.divisi?.nama_divisi || "Tanpa Divisi"}</span>
                        <span className="text-slate-200 hidden sm:inline">•</span>
                        <span className="text-[10px] text-slate-400 font-semibold truncate">NIK: {r.nik || "-"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                    {/* Kontak Info untuk HP & Desktop */}
                    <div className="flex flex-col text-left sm:text-right flex-1 sm:flex-none">
                      <span className="text-[11px] font-bold text-slate-600 truncate">{r.no_hp || "Tanpa HP"}</span>
                      <span className="text-[9px] text-slate-400 truncate max-w-[150px]">{r.alamat || "Tanpa Alamat"}</span>
                    </div>

                    {/* Tombol Aksi */}
                    <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 ml-3">
                      <button 
                        onClick={() => setEditData(r)}
                        title="Edit"
                        className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[12px] font-bold transition-colors cursor-pointer"
                      >
                        <Edit size={13} strokeWidth={2.5} />
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                      <button 
                        onClick={() => handleDelete(r.id)}
                        disabled={loading}
                        title="Hapus"
                        className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-[12px] font-bold transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Trash2 size={13} strokeWidth={2.5} />
                        <span className="hidden sm:inline">Hapus</span>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
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
