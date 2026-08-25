"use client"

import { useState } from "react"
import { createPortal } from "react-dom"
import { Users, UserPlus, KeyRound, UserMinus, ToggleLeft, ToggleRight, X, Phone, Settings } from "lucide-react"
import { createDivisiAccount, updateDivisiAccount, toggleUserStatus, resetPassword, addAnggota, removeAnggota, updateAnggota } from "./actions"
import ConfirmModal from "@/components/ConfirmModal"

function ModalPortal({ children }: { children: React.ReactNode }) {
  if (typeof document === "undefined") return null
  return createPortal(children, document.body)
}

export default function UsersClient({ users }: { users: any[] }) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [loading, setLoading] = useState(false)

  // Reset pass state
  const [resetId, setResetId] = useState<string | null>(null)
  const [newPass, setNewPass] = useState("")

  // Edit state
  const [editUser, setEditUser] = useState<any>(null)

  // Kelola Anggota state
  const [kelolaDivisi, setKelolaDivisi] = useState<any>(null)
  const [newAnggotaName, setNewAnggotaName] = useState("")
  const [newAnggotaHp, setNewAnggotaHp] = useState("")

  // Edit Anggota state
  const [editAnggota, setEditAnggota] = useState<{ id: number; nama: string; no_hp: string } | null>(null)

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

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const res = await createDivisiAccount(formData)
    setLoading(false)
    if (res.error) {
      alert(res.error)
    } else {
      setShowAddForm(false)
      alert("Akun berhasil dibuat")
    }
  }

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!editUser) return
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    formData.append("divisi_id", editUser.divisi_id)
    
    const res = await updateDivisiAccount(editUser.id, formData)
    setLoading(false)
    if (res.error) {
      alert(res.error)
    } else {
      setEditUser(null)
      alert("Akun berhasil diperbarui")
    }
  }

  function handleToggle(id: string, current: boolean) {
    setConfirmConfig({
      isOpen: true,
      title: `${current ? 'Nonaktifkan' : 'Aktifkan'} Akun`,
      message: `Yakin ingin ${current ? 'menonaktifkan' : 'mengaktifkan'} akun ini?`,
      type: current ? "danger" : "info",
      onConfirm: async () => {
        setConfirmConfig(prev => ({ ...prev, isOpen: false }))
        await toggleUserStatus(id, current)
      }
    })
  }

  async function handleResetSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!resetId) return
    setLoading(true)
    const res = await resetPassword(resetId, newPass)
    setLoading(false)
    if (res?.error) {
      alert(res.error)
    } else {
      setResetId(null)
      setNewPass("")
      alert("Password berhasil direset")
    }
  }

  async function handleAddAnggota(e: React.FormEvent) {
    e.preventDefault()
    if (!kelolaDivisi) return
    setLoading(true)
    const res = await addAnggota(kelolaDivisi.divisi_id, newAnggotaName, newAnggotaHp)
    setLoading(false)
    if (res?.error) {
      alert(res.error)
    } else {
      setNewAnggotaName("")
      setNewAnggotaHp("")
    }
  }

  function handleRemoveAnggota(anggotaId: number) {
    if (!kelolaDivisi) return
    setConfirmConfig({
      isOpen: true,
      title: "Hapus Anggota",
      message: "Hapus anggota ini? Anggota tidak akan terdaftar lagi di divisi.",
      type: "danger",
      onConfirm: async () => {
        setConfirmConfig(prev => ({ ...prev, isOpen: false }))
        setLoading(true)
        await removeAnggota(anggotaId, kelolaDivisi.divisi_id)
        setLoading(false)
      }
    })
  }

  async function handleUpdateAnggota(e: React.FormEvent) {
    e.preventDefault()
    if (!editAnggota) return
    setLoading(true)
    await updateAnggota(editAnggota.id, editAnggota.nama, editAnggota.no_hp)
    setLoading(false)
    setEditAnggota(null)
  }

  // Cari kelola divisi yg terupdate dari props users untuk modal
  const currentDivisiUser = kelolaDivisi ? users.find(u => u.id === kelolaDivisi.id) : null

  return (
    <div className="space-y-6">
      
      {/* Header Halaman */}
      <div className="flex items-center justify-between gap-3 mb-2 pb-4 border-b border-slate-200/80 px-1">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users size={18} strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <h2 className="text-[15px] sm:text-[16px] font-extrabold text-slate-800 tracking-tight truncate">Kelola Akun & Divisi</h2>
            <p className="text-[11px] text-slate-500 font-medium truncate">Manajemen data divisi, anggota, dan akun login</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3 sm:px-4 py-2 rounded-lg text-[12px] font-bold shadow-sm transition-all shrink-0 cursor-pointer"
        >
          <UserPlus size={15} />
          <span className="hidden sm:inline">{showAddForm ? "Tutup Form" : "Tambah Akun Divisi"}</span>
          <span className="sm:hidden">{showAddForm ? "Tutup" : "Tambah"}</span>
        </button>
      </div>

      {/* Form Tambah Akun */}
      {showAddForm && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <UserPlus size={16} className="text-slate-400" />
            <h3 className="text-[13px] font-extrabold text-slate-800 uppercase tracking-wider">Tambah Akun Baru</h3>
          </div>
          
          <form onSubmit={handleCreate} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Nama Divisi</label>
                <input name="nama_divisi" required className="w-full border border-slate-200 bg-slate-50/50 p-2.5 rounded-lg text-[13px] text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none" placeholder="Contoh: Divisi Persiapan" />
              </div>
              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Jumlah Anggota</label>
                <input name="jumlah_anggota" type="number" required defaultValue="0" className="w-full border border-slate-200 bg-slate-50/50 p-2.5 rounded-lg text-[13px] text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Username Login</label>
                <input name="username" required className="w-full border border-slate-200 bg-slate-50/50 p-2.5 rounded-lg text-[13px] text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none" />
              </div>
              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Password</label>
                <input name="password" required type="password" className="w-full border border-slate-200 bg-slate-50/50 p-2.5 rounded-lg text-[13px] text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none" />
              </div>
              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Role / Peran</label>
                <select name="role" required className="w-full border border-slate-200 bg-slate-50/50 p-2.5 rounded-lg text-[13px] text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none">
                  <option value="PERSIAPAN">Persiapan</option>
                  <option value="PENGOLAHAN">Pengolahan</option>
                  <option value="PEMORSIAN">Pemorsian</option>
                  <option value="DISTRIBUSI">Distribusi</option>
                  <option value="PENCUCIAN">Pencucian</option>
                  <option value="KEBERSIHAN">Kebersihan</option>
                  <option value="SATPAM">Satpam</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button disabled={loading} className="bg-slate-900 text-white px-6 py-2.5 rounded-lg text-[13px] font-bold hover:bg-slate-800 transition shadow-md hover:shadow-lg w-full sm:w-auto cursor-pointer">
                {loading ? "Menyimpan..." : "Simpan Akun"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit User Modal */}
      {editUser && (
        <ModalPortal>
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="bg-slate-900 p-4 sm:p-5 flex items-center justify-between text-white shrink-0">
              <h3 className="font-extrabold text-[14px]">Edit Akun / Divisi</h3>
              <button onClick={() => setEditUser(null)} className="text-slate-400 hover:text-white transition"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleEdit} className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Nama Divisi</label>
                <input name="nama_divisi" defaultValue={editUser.divisi?.nama_divisi} required className="w-full border border-slate-200 bg-slate-50/50 p-2.5 rounded-lg text-[13px] text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Username Login</label>
                  <input name="username" defaultValue={editUser.username} required className="w-full border border-slate-200 bg-slate-50/50 p-2.5 rounded-lg text-[13px] text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Role / Peran</label>
                  <select name="role" defaultValue={editUser.role} required className="w-full border border-slate-200 bg-slate-50/50 p-2.5 rounded-lg text-[13px] text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none">
                    <option value="PERSIAPAN">Persiapan</option>
                    <option value="PENGOLAHAN">Pengolahan</option>
                    <option value="PEMORSIAN">Pemorsian</option>
                    <option value="DISTRIBUSI">Distribusi</option>
                    <option value="PENCUCIAN">Pencucian</option>
                    <option value="KEBERSIHAN">Kebersihan</option>
                    <option value="SATPAM">Satpam</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setEditUser(null)} className="px-5 py-2.5 bg-slate-150 hover:bg-slate-200 text-slate-700 rounded-lg text-[13px] font-bold transition">Batal</button>
                <button type="submit" disabled={loading} className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[13px] font-bold transition shadow-md cursor-pointer">Simpan</button>
              </div>
            </form>
          </div>
        </div>
        </ModalPortal>
      )}

      {/* Reset Password Modal */}
      {resetId && (
        <ModalPortal>
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="bg-slate-900 p-4 sm:p-5 flex items-center justify-between text-white shrink-0">
              <h3 className="font-extrabold text-[14px]">Reset Password</h3>
              <button onClick={() => setResetId(null)} className="text-slate-400 hover:text-white transition"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleResetSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Password Baru</label>
                <input 
                  type="password" 
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="Masukkan Password Baru" 
                  required 
                  className="w-full border border-slate-200 bg-slate-50/50 p-2.5 rounded-lg text-[13px] text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setResetId(null)} className="px-5 py-2.5 bg-slate-150 hover:bg-slate-200 text-slate-700 rounded-lg text-[13px] font-bold transition">Batal</button>
                <button type="submit" disabled={loading} className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[13px] font-bold transition shadow-md cursor-pointer">Reset</button>
              </div>
            </form>
          </div>
        </div>
        </ModalPortal>
      )}

      {/* Kelola Anggota Modal */}
      {kelolaDivisi && currentDivisiUser && (
        <ModalPortal>
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 p-4 sm:p-5 flex items-center justify-between text-white shrink-0">
              <div>
                <h3 className="font-extrabold text-[14px]">Anggota: {currentDivisiUser.divisi?.nama_divisi}</h3>
                <p className="text-slate-400 text-[11px] font-medium mt-0.5">Kelola daftar personel tim divisi</p>
              </div>
              <button onClick={() => setKelolaDivisi(null)} className="text-slate-400 hover:text-white transition"><X size={20} /></button>
            </div>
            
            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              
              {/* Form Tambah Anggota */}
              <form onSubmit={handleAddAnggota} className="space-y-2 pb-4 border-b border-slate-100">
                <div className="flex gap-2">
                  <input
                    value={newAnggotaName} onChange={(e) => setNewAnggotaName(e.target.value)}
                    placeholder="Nama Lengkap" required
                    className="flex-1 border border-slate-200 bg-slate-50/50 p-2.5 rounded-lg text-[13px] text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition"
                  />
                  <input
                    value={newAnggotaHp} onChange={(e) => setNewAnggotaHp(e.target.value)}
                    placeholder="No HP (Opsional)"
                    className="w-2/5 border border-slate-200 bg-slate-50/50 p-2.5 rounded-lg text-[13px] text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition"
                  />
                </div>
                <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white hover:bg-slate-800 py-2.5 rounded-lg text-[13px] font-bold transition shadow-sm cursor-pointer">
                  {loading ? "Menyimpan..." : "+ Tambah Anggota"}
                </button>
              </form>

              {/* Daftar Anggota */}
              <div className="max-h-[40vh] overflow-y-auto">
                {currentDivisiUser.divisi?.anggota?.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                      <Users size={20} className="text-slate-300" />
                    </div>
                    <p className="text-slate-400 text-[13px] font-semibold">Belum ada personel terdaftar</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                {currentDivisiUser.divisi?.anggota?.map((ang: any) => {
                  const inisial = ang.nama.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)
                  const isEditing = editAnggota?.id === ang.id
                  return (
                    <div key={ang.id} className={`rounded-xl border transition-all ${isEditing ? "border-blue-200 bg-blue-50/50 col-span-2" : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"}`}>
                      {isEditing ? (
                        /* Mode Edit Inline */
                        <form onSubmit={handleUpdateAnggota} className="p-3 space-y-2">
                          <div className="flex gap-2">
                            <input
                              value={editAnggota?.nama || ""}
                              onChange={e => setEditAnggota(prev => prev ? { ...prev, nama: e.target.value } : prev)}
                              required placeholder="Nama Lengkap"
                              className="flex-1 border border-slate-200 bg-white p-2 rounded-lg text-[13px] font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none"
                            />
                            <input
                              value={editAnggota?.no_hp || ""}
                              onChange={e => setEditAnggota(prev => prev ? { ...prev, no_hp: e.target.value } : prev)}
                              placeholder="No HP"
                              className="w-2/5 border border-slate-200 bg-white p-2 rounded-lg text-[13px] font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button type="submit" disabled={loading} className="flex-1 bg-slate-900 text-white hover:bg-slate-800 py-2 rounded-lg text-[12px] font-bold transition cursor-pointer">
                              {loading ? "Menyimpan..." : "Simpan"}
                            </button>
                            <button type="button" onClick={() => setEditAnggota(null)} className="flex-1 bg-slate-100 text-slate-700 hover:bg-slate-200 py-2 rounded-lg text-[12px] font-bold transition cursor-pointer">
                              Batal
                            </button>
                          </div>
                        </form>
                      ) : (
                        /* Mode Kartu Normal */
                        <div className="p-3 flex flex-col gap-2">
                          {/* Avatar + Info */}
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center text-[12px] font-extrabold shrink-0">
                              {inisial}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-[13px] font-extrabold text-slate-800 leading-tight truncate">{ang.nama}</p>
                              {ang.no_hp
                                ? <p className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold mt-0.5 truncate"><Phone size={9} /> {ang.no_hp}</p>
                                : <p className="text-[10px] text-slate-300 italic mt-0.5">No HP —</p>
                              }
                            </div>
                          </div>
                          {/* Tombol Aksi */}
                          <div className="flex gap-1.5 border-t border-slate-100 pt-2">
                            <button
                              onClick={() => setEditAnggota({ id: ang.id, nama: ang.nama, no_hp: ang.no_hp || "" })}
                              className="flex-1 flex items-center justify-center gap-1 text-[11px] font-bold text-blue-600 hover:bg-blue-50 py-1.5 rounded-lg transition cursor-pointer"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                              Edit
                            </button>
                            <button
                              onClick={() => handleRemoveAnggota(ang.id)}
                              disabled={loading}
                              className="flex-1 flex items-center justify-center gap-1 text-[11px] font-bold text-rose-600 hover:bg-rose-50 py-1.5 rounded-lg transition cursor-pointer"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                              Hapus
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
                </div>
              </div>
            </div>
          </div>
        </div>
        </ModalPortal>
      )}

      {/* Grid Kartu Akun & Divisi */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[13px] font-extrabold text-slate-800 uppercase tracking-wider">Daftar Akun Divisi</h3>
          <span className="text-[11px] text-slate-400 font-semibold">{users.length} akun terdaftar</span>
        </div>

        <div className="flex flex-col gap-1.5">
          {users.map((user) => {
            const initial = (user.divisi?.nama_divisi || user.username || "?").charAt(0).toUpperCase()
            const isAdmin = user.role === "ADMIN"
            return (
              <div key={user.id} className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex items-center gap-2.5 px-3 py-3 sm:px-4">

                {/* Avatar */}
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center text-[14px] sm:text-[15px] font-extrabold shrink-0">
                  {initial}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] sm:text-[13px] font-extrabold text-slate-800 truncate leading-tight">{user.username}</p>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <span className="text-[10px] text-slate-400 font-semibold truncate">{user.divisi?.nama_divisi || "—"}</span>
                    <span className="text-slate-200 hidden sm:inline">·</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider hidden sm:inline">{user.role}</span>
                  </div>
                </div>

                {/* Status badge — hidden di mobile kecil */}
                <span className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                  user.status
                    ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                    : "bg-rose-50 text-rose-600 border-rose-100"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${user.status ? "bg-emerald-500" : "bg-rose-500"}`} />
                  {user.status ? "Aktif" : "Nonaktif"}
                </span>

                {/* Tombol Aksi — ikon saja di mobile, ikon+teks di desktop */}
                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                  {/* Edit */}
                  <button
                    onClick={() => setEditUser(user)}
                    title="Edit"
                    className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[12px] font-bold transition-colors cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    <span className="hidden sm:inline">Edit</span>
                  </button>

                  {/* Anggota */}
                  {!isAdmin && (
                    <button
                      onClick={() => setKelolaDivisi(user)}
                      title="Anggota"
                      className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-600 text-[12px] font-bold transition-colors cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                      <span className="hidden sm:inline">Anggota</span>
                    </button>
                  )}

                  {/* Reset */}
                  <button
                    onClick={() => setResetId(user.id)}
                    title="Reset Password"
                    className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600 text-[12px] font-bold transition-colors cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    <span className="hidden sm:inline">Reset</span>
                  </button>

                  {/* Toggle Status */}
                  {!isAdmin && (
                    <button
                      onClick={() => handleToggle(user.id, user.status)}
                      title={user.status ? "Matikan" : "Aktifkan"}
                      className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-[12px] font-bold transition-colors cursor-pointer ${
                        user.status ? "bg-rose-50 hover:bg-rose-100 text-rose-600" : "bg-emerald-50 hover:bg-emerald-100 text-emerald-600"
                      }`}
                    >
                      {user.status ? <ToggleLeft size={14} /> : <ToggleRight size={14} />}
                      <span className="hidden sm:inline">{user.status ? "Matikan" : "Aktifkan"}</span>
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      
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
