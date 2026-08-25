"use client"

import { useState } from "react"
import { ubahPassword } from "@/app/actions/profil"
import { KeyRound, User, Users, ShieldAlert, BadgeCheck } from "lucide-react"

export default function ProfilClient({ user }: { user: any }) {
  const [passwordLama, setPasswordLama] = useState("")
  const [passwordBaru, setPasswordBaru] = useState("")
  const [konfirmasiPassword, setKonfirmasiPassword] = useState("")
  
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)

    if (passwordBaru !== konfirmasiPassword) {
      setMessage({ type: "error", text: "Konfirmasi password baru tidak cocok!" })
      return
    }

    if (passwordBaru.length < 6) {
      setMessage({ type: "error", text: "Password baru minimal 6 karakter." })
      return
    }

    setLoading(true)
    const res = await ubahPassword(passwordLama, passwordBaru)
    setLoading(false)

    if (res.error) {
      setMessage({ type: "error", text: res.error })
    } else {
      setMessage({ type: "success", text: "Password berhasil diubah!" })
      setPasswordLama("")
      setPasswordBaru("")
      setKonfirmasiPassword("")
    }
  }

  const initial = user.username.charAt(0).toUpperCase()

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex items-center gap-3 mb-2 pb-4 border-b border-slate-200/80 px-1">
        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <User size={18} strokeWidth={2.5} />
        </div>
        <div>
          <h2 className="text-[16px] font-extrabold text-slate-800 tracking-tight">Profil & Pengaturan</h2>
          <p className="text-[11px] sm:text-[12px] text-slate-500 font-medium">Informasi akun dan keamanan</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Kolom Kiri: Avatar & Status Ringkas */}
        <div className="md:col-span-1 flex flex-col items-center text-center p-6 bg-white border border-slate-200 rounded-xl shadow-sm space-y-4">
          <div className="w-20 h-20 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center text-2xl font-black shadow-inner">
            {initial}
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-800 leading-tight">{user.username}</h3>
            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">{user.role}</p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-full text-[11px] font-bold">
            <BadgeCheck size={14} className="shrink-0" />
            <span>Akun Aktif</span>
          </div>
        </div>

        {/* Kolom Tengah/Kanan: Informasi Detail & Form Ubah Password */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Detail Akun */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <Users size={16} className="text-slate-400" />
              <h3 className="text-[13px] font-extrabold text-slate-800 uppercase tracking-wider">Informasi Divisi</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Nama Divisi</span>
                <div className="bg-slate-50/50 border border-slate-200/80 rounded-lg p-2.5 text-[13px] text-slate-700 font-semibold leading-relaxed">
                  {user.divisi?.nama_divisi || "-"}
                </div>
              </div>
              
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Jumlah Anggota</span>
                <div className="bg-slate-50/50 border border-slate-200/80 rounded-lg p-2.5 text-[13px] text-slate-700 font-semibold leading-relaxed">
                  {user.divisi?.jumlah_anggota ? `${user.divisi.jumlah_anggota} Orang` : "-"}
                </div>
              </div>
            </div>

            {/* List Anggota Divisi */}
            {user.divisi?.anggota && user.divisi.anggota.length > 0 && (
              <div className="mt-5 pt-4 border-t border-slate-100">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">Daftar Anggota Tim</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {user.divisi.anggota.map((ang: any) => (
                    <div key={ang.id} className="flex items-center gap-2.5 py-2 px-3 bg-slate-50 border border-slate-100 rounded-lg">
                      <div className="w-5.5 h-5.5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-extrabold shrink-0">
                        {ang.nama.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12.5px] font-bold text-slate-700 truncate leading-none">{ang.nama}</p>
                        {ang.no_hp && <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{ang.no_hp}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Form Ubah Password */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <KeyRound size={16} className="text-slate-400" />
              <h3 className="text-[13px] font-extrabold text-slate-800 uppercase tracking-wider">Keamanan & Ubah Password</h3>
            </div>

            {message && (
              <div className={`p-3 rounded-lg mb-4 text-[12px] sm:text-[13px] font-bold border flex items-center gap-2 ${
                message.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                  : 'bg-rose-50 text-rose-600 border-rose-100'
              }`}>
                <ShieldAlert size={16} className="shrink-0" />
                <span>{message.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:items-center">
                <label className="text-[12px] font-bold text-slate-600 uppercase tracking-wide">Password Lama</label>
                <div className="sm:col-span-2">
                  <input 
                    type="password" 
                    value={passwordLama}
                    onChange={e => setPasswordLama(e.target.value)}
                    required
                    className="w-full border border-slate-200 bg-slate-50/50 p-2.5 rounded-lg text-[13px] text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none shadow-sm" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:items-center">
                <label className="text-[12px] font-bold text-slate-600 uppercase tracking-wide">Password Baru</label>
                <div className="sm:col-span-2">
                  <input 
                    type="password" 
                    value={passwordBaru}
                    onChange={e => setPasswordBaru(e.target.value)}
                    required
                    className="w-full border border-slate-200 bg-slate-50/50 p-2.5 rounded-lg text-[13px] text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none shadow-sm" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:items-center">
                <label className="text-[12px] font-bold text-slate-600 uppercase tracking-wide">Konfirmasi Password</label>
                <div className="sm:col-span-2">
                  <input 
                    type="password" 
                    value={konfirmasiPassword}
                    onChange={e => setKonfirmasiPassword(e.target.value)}
                    required
                    className="w-full border border-slate-200 bg-slate-50/50 p-2.5 rounded-lg text-[13px] text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none shadow-sm" 
                  />
                </div>
              </div>
              
              <div className="flex justify-end pt-2 border-t border-slate-100">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="bg-slate-900 text-white px-6 py-2.5 rounded-lg text-[13px] font-bold hover:bg-slate-800 w-full sm:w-auto transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Menyimpan...</span>
                    </div>
                  ) : "Simpan Sandi Baru"}
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>
    </div>
  )
}
