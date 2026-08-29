import { getServerSession } from "next-auth/next"
import { authOptions } from "../api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle, Clock, Users, Image as ImageIcon, FileText, ClipboardCheck, Phone, AlertCircle, Eye, PlusCircle, Edit3, Megaphone } from "lucide-react"
import Link from "next/link"
import ArahanDashboardClient from "./ArahanDashboardClient"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user.divisi_id) {
    return (
      <div className="p-4 bg-orange-100 text-orange-800 rounded-md">
        Akun ini belum memiliki data divisi yang diikat. Hubungi Admin.
      </div>
    )
  }

  const divisi_id = session.user.divisi_id
  const divisi = await prisma.divisi.findUnique({
    where: { id: divisi_id },
    include: {
      anggota: true
    }
  })

  // Cek status hari ini
  const now = new Date()
  const wibDateString = now.toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" })
  const today = new Date(`${wibDateString}T00:00:00.000Z`)
  
  const absensiToday = await prisma.absensi.findFirst({
    where: { divisi_id, tanggal: { gte: today } },
    include: { detail: true }
  })
  
  const laporanToday = await prisma.laporanDivisi.findFirst({
    where: { divisi_id, tanggal: { gte: today } },
    include: { foto: true }
  })

  // Statistik Keseluruhan
  const totalFoto = await prisma.fotoKegiatan.count({ where: { divisi_id } })

  // Pengumuman / Arahan terbaru (Global atau khusus divisi ini)
  const arahanList = await prisma.arahan.findMany({
    where: {
      OR: [
        { divisi_id: null },
        { divisi_id: divisi_id }
      ]
    },
    orderBy: {
      created_at: 'desc'
    },
    take: 5
  })

  const formattedDate = new Date().toLocaleDateString("id-ID", { timeZone: 'Asia/Jakarta', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  const formattedTime = new Date().toLocaleTimeString("id-ID", { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit' }) + ' WIB'


  // Calculate Laporan Status
  let laporanStatus = "EMPTY"; // EMPTY, PARTIAL, COMPLETE
  let laporanCats: any[] = [];
  
  if (laporanToday) {
    laporanStatus = "COMPLETE";
    if (!laporanToday.isi_laporan || laporanToday.isi_laporan.trim().length === 0) {
      laporanStatus = "PARTIAL";
    }

    const baseCats = [{ id: "kegiatan", label: "Foto Kegiatan", min: 3 }]
    laporanCats = [...baseCats]
    
    if (session.user.role === "PERSIAPAN") {
      laporanCats.push({ id: "bahan_makanan", label: "Bahan Makanan (Bersih)", min: 0 })
      laporanCats.push({ id: "sampah", label: "Foto Sampah", min: 0 })
    } else if (session.user.role === "PENGOLAHAN") {
      laporanCats.push({ id: "masakan_matang", label: "Masakan Matang", min: 0 })
      laporanCats.push({ id: "sampah", label: "Foto Sampah", min: 0 })
    } else if (session.user.role === "PEMORSIAN") {
      laporanCats.push({ id: "makanan_diporsi", label: "Makanan Diporsi", min: 0 })
      laporanCats.push({ id: "kondisi_sebelum_dikirim", label: "Kondisi Sebelum Dikirim", min: 0 })
      laporanCats.push({ id: "tray_siap", label: "Tray Siap Distribusi", min: 0 })
      laporanCats.push({ id: "sisa_pemorsian", label: "Sisa Pemorsian", min: 0 })
    } else if (session.user.role === "DISTRIBUSI") {
      laporanCats.push({ id: "lokasi_distribusi", label: "Bukti di Lokasi", min: 0 })
      laporanCats.push({ id: "tray_kembali", label: "Tray Kembali ke SPPG", min: 4 })
    } else if (session.user.role === "PENCUCIAN") {
      laporanCats.push({ id: "limbah_makanan", label: "Limbah Makanan", min: 4 })
      laporanCats.push({ id: "tray_kembali", label: "Tray Kembali ke SPPG", min: 4 })
    } else if (session.user.role === "KEBERSIHAN" || session.user.role === "SATPAM") {
      laporanCats.push({ id: "sampah_akhir", label: "Sampah Akhir", min: 0 })
    }

    for (const cat of laporanCats) {
      const uploadedCount = laporanToday.foto.filter((f:any) => f.tipe_foto === cat.id).length;
      if (uploadedCount < cat.min) {
        laporanStatus = "PARTIAL";
        break;
      }
    }
  }

  // Daily Quote (Berubah setiap hari, bukan setiap refresh)
  const quotes = [
    "Kerja keras hari ini adalah kesuksesan hari esok. Semangat!",
    "Bekerja bersama adalah awal dari sebuah keberhasilan yang besar.",
    "Jangan pernah meremehkan kekuatan sebuah tim yang kompak dan solid.",
    "Setiap tugas kecil yang diselesaikan dengan baik akan membawa hasil luar biasa.",
    "Kualitas bukanlah sebuah kebetulan, melainkan hasil dari kebiasaan baik.",
    "Semangat pagi! Mari berikan kontribusi terbaik kita untuk hari ini.",
    "Fokus, kedisiplinan, dan kerja sama adalah kunci utama divisi kita.",
    "Kesuksesan sejati datang dari apa yang kita lakukan secara konsisten setiap hari."
  ]
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24)
  const dailyQuote = quotes[dayOfYear % quotes.length]

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 sm:px-6 sm:py-4 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -right-2 -bottom-6 sm:-right-8 sm:-bottom-16 opacity-[0.06] pointer-events-none rotate-[-10deg]">
          <Users className="w-36 h-36 sm:w-[200px] sm:h-[200px]" />
        </div>
        <div className="relative z-10 flex flex-col gap-4 sm:gap-2.5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight mb-2 sm:mb-1">Selamat Datang, {divisi?.nama_divisi}! 👋</h1>
            <p className="text-slate-300 font-medium text-sm flex items-center gap-2 sm:gap-1.5">
              <Clock size={16} className="text-blue-400 shrink-0 sm:w-3.5 sm:h-3.5" />
              <span className="sm:text-[13px]">{formattedDate} • Pukul {formattedTime}</span>
            </p>
          </div>
          <div className="border-t border-white/10 pt-4 sm:pt-2.5">
            <p className="text-sm text-slate-300 italic font-medium leading-relaxed sm:text-[13px]">
              "{dailyQuote}"
            </p>
          </div>
        </div>
      </div>
        
      <ArahanDashboardClient arahanList={arahanList} divisiName={divisi?.nama_divisi} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Status Hari Ini (Soft Modern UI) */}
        {/* Absensi Card - Soft */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm shadow-slate-100 md:col-span-1 lg:col-span-1 flex flex-col p-4 sm:p-5 relative overflow-hidden transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 ${absensiToday ? 'bg-slate-50 text-[#0A1629]' : 'bg-slate-100 text-slate-400'}`}>
              {absensiToday ? <CheckCircle2 size={24} strokeWidth={2} /> : <Users size={24} strokeWidth={2} />}
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-xl tracking-tight mb-1">Absensi</h3>
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                absensiToday ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50' : 'bg-slate-100 text-slate-600 border border-slate-200/50'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${absensiToday ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                {absensiToday ? 'Selesai Dilaporkan' : 'Menunggu Pengisian'}
              </div>
            </div>
          </div>
          
          {absensiToday ? (
             <div className="grid grid-cols-2 gap-3 mb-6">
               <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100 flex flex-col justify-center">
                 <span className="text-xs text-slate-400 font-medium mb-1">Waktu Kirim</span>
                 <span className="text-lg font-black text-slate-800 tracking-tight whitespace-nowrap">{new Date(absensiToday.jam_input).toLocaleTimeString("id-ID", { timeZone: 'Asia/Jakarta', hour: '2-digit', minute:'2-digit' })} WIB</span>
               </div>
               <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100 flex flex-col justify-center">
                 <span className="text-xs text-slate-400 font-medium mb-1">Kehadiran</span>
                 <span className="text-lg font-black text-slate-800 tracking-tight whitespace-nowrap">{absensiToday.detail.filter((d:any) => d.status === "Hadir").length} <span className="text-sm font-medium text-slate-400">/ {divisi?.jumlah_anggota} org</span></span>
               </div>
             </div>
          ) : (
             <div className="flex-1 flex flex-col justify-center mb-6">
               <div className="bg-slate-50/80 p-3.5 sm:p-4 rounded-xl border border-slate-100 flex items-center gap-3">
                 <div className="w-8 h-8 shrink-0 bg-white rounded-full shadow-sm border border-slate-100 flex items-center justify-center text-slate-400">
                   <Users size={14} />
                 </div>
                 <p className="text-[13px] sm:text-sm text-slate-500 font-medium leading-snug">
                   Tim Anda belum melaporkan absensi hari ini.
                 </p>
               </div>
             </div>
          )}

          <div className="mt-auto">
            <Link 
              href="/dashboard/absensi" 
              className={`flex items-center justify-center gap-2 w-full py-3 rounded-lg text-sm font-bold transition-all ${
                absensiToday 
                  ? 'bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-100 hover:border-slate-200' 
                  : 'bg-[#0A1629] hover:bg-slate-800 text-white shadow-md shadow-slate-200'
              }`}
            >
              {absensiToday ? (
                <><Eye size={16} /> Lihat Detail Absensi</>
              ) : (
                <><PlusCircle size={16} /> Isi Absensi Sekarang</>
              )}
            </Link>
          </div>
        </div>
        
        {/* Laporan Card - Soft */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm shadow-slate-100 md:col-span-1 lg:col-span-2 flex flex-col p-4 sm:p-5 relative overflow-hidden transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 ${
              laporanStatus === "COMPLETE" ? 'bg-slate-50 text-[#0A1629]' : 
              laporanStatus === "PARTIAL" ? 'bg-amber-50 text-amber-500' : 'bg-slate-100 text-slate-400'
            }`}>
              {laporanStatus === "COMPLETE" ? <CheckCircle2 size={24} strokeWidth={2} /> : 
               laporanStatus === "PARTIAL" ? <AlertCircle size={24} strokeWidth={2} /> : <FileText size={24} strokeWidth={2} />}
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-xl tracking-tight mb-1">Laporan Harian</h3>
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                laporanStatus === "COMPLETE" ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50' : 
                laporanStatus === "PARTIAL" ? 'bg-amber-50 text-amber-600 border border-amber-100/50' : 
                'bg-slate-100 text-slate-600 border border-slate-200/50'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  laporanStatus === "COMPLETE" ? 'bg-emerald-500' : 
                  laporanStatus === "PARTIAL" ? 'bg-amber-500 animate-pulse' : 'bg-slate-400'
                }`}></span>
                {laporanStatus === "COMPLETE" ? 'Selesai Dilaporkan' : 
                 laporanStatus === "PARTIAL" ? 'Belum Lengkap' : 'Menunggu Pengisian'}
              </div>
            </div>
          </div>
          
          {laporanStatus !== "EMPTY" && laporanToday ? (
            <div className="flex-1 mb-6">
              <div className="bg-slate-50/50 rounded-xl p-5 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Rincian Kelengkapan</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 gap-x-6">
                  {/* Ceklist Catatan */}
                  <div className="flex items-center justify-between text-sm">
                    <span className={laporanToday.isi_laporan && laporanToday.isi_laporan.trim().length > 0 ? "text-slate-700 font-semibold" : "text-slate-400 font-medium"}>Catatan Harian</span>
                    {laporanToday.isi_laporan && laporanToday.isi_laporan.trim().length > 0 ? (
                      <CheckCircle2 size={18} className="text-emerald-500" />
                    ) : (
                      <XCircle size={18} className="text-rose-400" />
                    )}
                  </div>
                  
                  {/* Ceklist Kategori Foto */}
                  {laporanCats.map((cat: any) => {
                    const uploadedCount = laporanToday.foto.filter((f:any) => f.tipe_foto === cat.id).length
                    const isMet = uploadedCount >= cat.min
                    const isOptional = cat.min === 0
                    
                    if (isOptional && uploadedCount === 0) {
                      return (
                        <div key={cat.id} className="flex items-center justify-between text-sm">
                          <span className="text-slate-400 font-medium">{cat.label} <span className="text-[10px] italic">(Opsional)</span></span>
                          <span className="text-slate-300 font-bold">-</span>
                        </div>
                      )
                    }

                    return (
                      <div key={cat.id} className="flex items-center justify-between text-sm">
                        <span className={isMet ? "text-slate-700 font-semibold" : "text-slate-400 font-medium"}>
                          {cat.label} 
                          <span className="text-xs text-slate-400 ml-1.5 font-normal">
                            {uploadedCount}{cat.min > 0 ? `/${cat.min}` : ''}
                          </span>
                        </span>
                        {isMet ? (
                          <CheckCircle2 size={18} className="text-emerald-500" />
                        ) : (
                          <XCircle size={18} className="text-rose-400" />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : (
             <div className="flex-1 flex flex-col justify-center mb-6">
               <div className="bg-slate-50/80 p-3.5 sm:p-4 rounded-xl border border-slate-100 flex items-center gap-3">
                 <div className="w-8 h-8 shrink-0 bg-white rounded-full shadow-sm border border-slate-100 flex items-center justify-center text-slate-400">
                   <FileText size={14} />
                 </div>
                 <p className="text-[13px] sm:text-sm text-slate-500 font-medium leading-snug">
                   Laporan divisi Anda belum dikirim hari ini.
                 </p>
               </div>
             </div>
          )}
          
          <div className="mt-auto pt-2">
            <Link 
              href="/dashboard/laporan" 
              className={`flex items-center justify-center gap-2 w-full py-3 rounded-lg text-sm font-bold transition-all ${
                laporanStatus === "COMPLETE" 
                  ? 'bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-100 hover:border-slate-200' 
                  : 'bg-[#0A1629] hover:bg-slate-800 text-white shadow-md shadow-slate-200'
              }`}
            >
              {laporanStatus === "COMPLETE" ? (
                <><Eye size={16} /> Lihat Laporan</>
              ) : laporanStatus === "PARTIAL" ? (
                <><Edit3 size={16} /> Lanjutkan Laporan</>
              ) : (
                <><PlusCircle size={16} /> Buat Laporan</>
              )}
            </Link>
          </div>
        </div>

        {/* Daftar Anggota */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm shadow-slate-100 overflow-hidden relative mt-2 md:col-span-2 lg:col-span-3">
          <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 sm:gap-3.5">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-50 text-[#0A1629] border border-slate-100 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 sm:w-[22px] sm:h-[22px]" strokeWidth={2} />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 text-[15px] sm:text-lg tracking-tight mb-0.5 leading-tight">Daftar Anggota Tim</h3>
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium leading-tight">Informasi kontak divisi Anda</p>
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 bg-slate-50 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-slate-200/60 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
              <span className="text-[11px] sm:text-xs font-bold text-slate-600">{divisi?.anggota.length} Orang</span>
            </div>
          </div>
          
          {divisi?.anggota.length === 0 ? (
             <div className="flex flex-col items-center justify-center p-10 text-center">
               <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                 <Users className="text-slate-400" size={32} />
               </div>
               <p className="text-slate-500 font-medium">Belum ada data anggota.</p>
               <p className="text-sm text-slate-400">Hubungi admin untuk menambahkan anggota divisi.</p>
             </div>
          ) : (
            <div className="divide-y divide-slate-100/80 max-h-[350px] overflow-y-auto">
              {divisi?.anggota.map((anggota) => (
                <div key={anggota.id} className="p-4 sm:px-6 sm:py-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors group gap-2">
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className="w-11 h-11 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm shrink-0 border border-slate-200 group-hover:bg-white group-hover:shadow-sm group-hover:border-slate-300 transition-all">
                        {anggota.nama.substring(0, 1).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-nowrap">
                          <p className="font-bold text-sm text-slate-800 truncate">{anggota.nama}</p>
                        </div>
                        <p className="text-[12px] sm:text-[13px] text-slate-500 mt-0.5 truncate">
                          {divisi?.koordinator === anggota.nama ? 'Koordinator Divisi' : 'Anggota'}
                        </p>
                      </div>
                    </div>
                  {anggota.no_hp ? (
                    <a href={`https://wa.me/${anggota.no_hp.replace(/^0/, '62')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-2 sm:px-3.5 rounded-lg transition-all border border-emerald-100 hover:shadow-sm shrink-0">
                      <Phone size={14} className="text-emerald-500" />
                      <span className="hidden sm:inline">{anggota.no_hp}</span>
                      <span className="sm:hidden">Hubungi</span>
                    </a>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400 bg-slate-50 px-3.5 py-2 rounded-lg border border-slate-100">
                      <Phone size={14} className="text-slate-300 opacity-50" />
                      <span className="hidden sm:inline">Tidak ada nomor</span>
                      <span className="sm:hidden">Kosong</span>
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
