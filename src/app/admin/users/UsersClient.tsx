"use client"

import { useState } from "react"
import { createPortal } from "react-dom"
import { Users, UserPlus, ToggleLeft, ToggleRight, X } from "lucide-react"
import { createDivisiAccount, updateDivisiAccount, toggleUserStatus, resetPassword } from "./actions"
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
            <p className="text-[11px] text-slate-500 font-medium truncate">Manajemen data divisi dan akun login</p>
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
                <input type="text" name="nama_divisi" placeholder="Contoh: Pencucian" required className="w-full border border-slate-200 bg-slate-50/50 p-2.5 rounded-lg text-[13px] text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none" />
              </div>
              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Target Jumlah Anggota</label>
                <input type="number" name="jumlah_anggota" placeholder="Contoh: 10" required className="w-full border border-slate-200 bg-slate-50/50 p-2.5 rounded-lg text-[13px] text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Nama Koordinator</label>
                <input type="text" name="koordinator" placeholder="Opsional" className="w-full border border-slate-200 bg-slate-50/50 p-2.5 rounded-lg text-[13px] text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none" />
              </div>
              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">NIP Koordinator</label>
                <input type="text" name="nip_koordinator" placeholder="Opsional" className="w-full border border-slate-200 bg-slate-50/50 p-2.5 rounded-lg text-[13px] text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none" />
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
                <input type="text" name="nama_divisi" defaultValue={editUser.divisi?.nama_divisi || ""} required className="w-full border border-slate-200 bg-slate-50/50 p-2.5 rounded-lg text-[13px] text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Koordinator Divisi</label>
                  <select 
                    name="koordinator" 
                    defaultValue={editUser.divisi?.koordinator || ""} 
                    onChange={(e) => {
                      const selectedAnggota = editUser.divisi?.anggota?.find((a: any) => a.nama === e.target.value);
                      if (selectedAnggota && selectedAnggota.nik) {
                        const nipInput = document.querySelector('input[name="nip_koordinator"]') as HTMLInputElement;
                        if (nipInput) nipInput.value = selectedAnggota.nik;
                      }
                    }}
                    className="w-full border border-slate-200 bg-slate-50/50 p-2.5 rounded-lg text-[13px] text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none"
                  >
                    <option value="">-- Pilih Anggota --</option>
                    {editUser.divisi?.anggota?.map((a: any) => (
                      <option key={a.id} value={a.nama}>{a.nama}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">NIP Koordinator</label>
                  <input type="text" name="nip_koordinator" defaultValue={editUser.divisi?.nip_koordinator || ""} placeholder="Opsional" className="w-full border border-slate-200 bg-slate-50/50 p-2.5 rounded-lg text-[13px] text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Username Login</label>
                  <input type="text" name="username" defaultValue={editUser.username} required className="w-full border border-slate-200 bg-slate-50/50 p-2.5 rounded-lg text-[13px] text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none" />
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
