import { prisma } from "@/lib/prisma"
import { 
  Users, 
  CalendarCheck, 
  ClipboardList, 
  Clock, 
  ArrowRight, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  ChefHat,
  CookingPot,
  UtensilsCrossed,
  Truck,
  Droplets,
  Sparkles,
  ShieldCheck
} from "lucide-react"
import Link from "next/link"

function getDivisiIcon(namaDivisi: string) {
  const name = namaDivisi.toLowerCase()
  if (name.includes("persiapan")) return <ChefHat size={18} strokeWidth={2.2} />
  if (name.includes("pengolahan")) return <CookingPot size={18} strokeWidth={2.2} />
  if (name.includes("pemorsian")) return <UtensilsCrossed size={18} strokeWidth={2.2} />
  if (name.includes("distribusi")) return <Truck size={18} strokeWidth={2.2} />
  if (name.includes("pencucian")) return <Droplets size={18} strokeWidth={2.2} />
  if (name.includes("kebersihan")) return <Sparkles size={18} strokeWidth={2.2} />
  if (name.includes("satpam")) return <ShieldCheck size={18} strokeWidth={2.2} />
  return <Users size={18} strokeWidth={2.2} />
}

function getLaporanStatus(laporanToday: any, namaDivisi: string) {
  if (!laporanToday) return "EMPTY"
  
  if (!laporanToday.isi_laporan || laporanToday.isi_laporan.trim().length === 0) {
    return "PARTIAL"
  }

  const name = namaDivisi.toUpperCase()
  let role = "ASLAP"
  if (name.includes("PERSIAPAN")) role = "PERSIAPAN"
  else if (name.includes("PENGOLAHAN")) role = "PENGOLAHAN"
  else if (name.includes("PEMORSIAN")) role = "PEMORSIAN"
  else if (name.includes("DISTRIBUSI")) role = "DISTRIBUSI"
  else if (name.includes("PENCUCIAN")) role = "PENCUCIAN"
  else if (name.includes("KEBERSIHAN")) role = "KEBERSIHAN"
  else if (name.includes("SATPAM")) role = "SATPAM"

  let laporanCats: any[] = []
  if (role === "KEBERSIHAN") laporanCats = [{ id: "kegiatan_kebersihan", min: 3 }]
  else if (role === "SATPAM") laporanCats = [{ id: "kegiatan_satpam", min: 3 }]
  else laporanCats = [{ id: "kegiatan", min: 3 }]
  
  if (role === "DISTRIBUSI") {
    laporanCats.push({ id: "tray_kembali", min: 4 })
  } else if (role === "PENCUCIAN") {
    laporanCats.push({ id: "limbah_makanan", min: 4 })
    laporanCats.push({ id: "tray_kembali", min: 4 })
  }

  // Count photos per category
  for (const cat of laporanCats) {
    const uploadedCount = (laporanToday.foto || []).filter((f: any) => f.tipe_foto === cat.id).length
    if (uploadedCount < cat.min) {
      return "PARTIAL"
    }
  }

  return "COMPLETE"
}


export default async function AdminDashboardPage() {
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  const divisiList = await prisma.divisi.findMany()
  
  const laporanHariIni = await prisma.laporanDivisi.findMany({
    where: {
      tanggal: {
        gte: today
      }
    },
    include: {
      foto: true
    }
  })

  const absensiHariIni = await prisma.absensi.findMany({
    where: {
      tanggal: {
        gte: today
      }
    }
  })

  const totalLaporan = laporanHariIni.length
  const totalAbsensi = absensiHariIni.length
  const divisiBelumLapor = divisiList.length - totalLaporan
  const divisiBelumAbsen = divisiList.length - totalAbsensi

  const formattedDate = new Date().toLocaleDateString("id-ID", { timeZone: 'Asia/Jakarta', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const formattedTime = new Date().toLocaleTimeString("id-ID", { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit' }) + ' WIB'

  return (
    <div className="space-y-4 max-w-5xl mx-auto px-1 sm:px-0">
      
      {/* Welcome Header - Navy Gradient Banner (More Compact on Desktop) */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 rounded-2xl p-5 sm:p-6 lg:p-4.5 text-white shadow-xl shadow-slate-100 relative overflow-hidden border border-slate-800">
        <div className="absolute -right-6 -bottom-10 sm:-right-8 sm:-bottom-12 opacity-[0.06] pointer-events-none rotate-[-10deg]">
          <Users className="w-48 h-48 sm:w-[220px] sm:h-[220px]" />
        </div>
        <div className="absolute top-0 right-1/4 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col gap-3 lg:gap-2">
          <div className="flex flex-col gap-1.5">
            <span className="bg-blue-500/15 text-blue-300 border border-blue-400/20 text-[9px] uppercase font-extrabold tracking-widest px-2.5 py-0.5 rounded-full w-fit">
              Halaman Administrator
            </span>
            <h1 className="text-xl sm:text-2xl lg:text-lg font-black tracking-tight text-white mt-0.5">Selamat Datang, Admin! 👋</h1>
            
            {/* Glassmorphism Date Pill */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 px-3 py-1 lg:py-0.5 rounded-full inline-flex items-center gap-1.5 w-fit text-[11px] sm:text-[12px] lg:text-[11px] text-slate-200 font-bold mt-0.5">
              <Clock size={13} className="text-blue-400 shrink-0" />
              <span>{formattedDate} • Pukul {formattedTime}</span>
            </div>
          </div>
          <div className="border-t border-white/10 pt-2 mt-0.5">
            <p className="text-[12px] lg:text-[11.5px] text-slate-300 font-semibold leading-relaxed">
              Sistem Pemantauan Absensi & Harian (SPAH) SPPG Trangkil. Silakan tinjau rekap data masuk hari ini dari seluruh divisi di bawah ini.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid - Two Premium Cards (Scaled Down / Compact on Desktop, Width Remains) */}
      <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
        
        {/* Premium Absensi Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col p-4 sm:p-5 lg:p-4 transition-all duration-300 hover:shadow-md hover:border-slate-300 group relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-slate-900 rounded-t-2xl" />
          
          <div className="flex items-center gap-3.5 mb-4 lg:mb-3">
            <div className="w-12 h-12 lg:w-9 lg:h-9 rounded-xl lg:rounded-lg flex items-center justify-center shrink-0 bg-slate-50 border border-slate-100 text-[#0A1629] shadow-inner transition-transform duration-300 group-hover:scale-105">
              <CalendarCheck className="w-6 h-6 lg:w-4.5 lg:h-4.5" strokeWidth={2.2} />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-base sm:text-lg lg:text-[14px] tracking-tight mb-0.5">Rekap Kehadiran</h3>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-50 border border-slate-200/60 rounded-full text-[10px] font-extrabold text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                <span>{totalAbsensi} / {divisiList.length} Divisi Mengisi</span>
              </div>
            </div>
          </div>
          
          {/* Premium Metric Blocks */}
          <div className="grid grid-cols-2 gap-3 mb-4 lg:mb-3.5">
            {/* Sudah Absen */}
            <div className="bg-[#F4FBF7]/85 border border-emerald-100/80 rounded-xl p-3 lg:p-2.5 flex items-center justify-between transition-all hover:bg-[#F4FBF7]">
              <div className="space-y-0.5">
                <span className="text-[9px] font-extrabold text-emerald-700/80 uppercase tracking-wider block">Sudah Absen</span>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-xl lg:text-lg font-black text-emerald-600 tracking-tight leading-none">{totalAbsensi}</span>
                  <span className="text-[10px] font-bold text-emerald-500/70">Divisi</span>
                </div>
              </div>
              <div className="w-7 h-7 rounded-full bg-emerald-100/40 border border-emerald-200/40 flex items-center justify-center text-emerald-600 shrink-0">
                <CheckCircle2 size={14} strokeWidth={2.5} />
              </div>
            </div>

            {/* Belum Absen */}
            <div className="bg-[#FFF5F5]/85 border border-rose-100/80 rounded-xl p-3 lg:p-2.5 flex items-center justify-between transition-all hover:bg-[#FFF5F5]">
              <div className="space-y-0.5">
                <span className="text-[9px] font-extrabold text-rose-700/80 uppercase tracking-wider block">Belum Absen</span>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-xl lg:text-lg font-black text-rose-600 tracking-tight leading-none">{divisiBelumAbsen}</span>
                  <span className="text-[10px] font-bold text-rose-500/70">Divisi</span>
                </div>
              </div>
              <div className="w-7 h-7 rounded-full bg-rose-100/40 border border-rose-200/40 flex items-center justify-center text-rose-600 shrink-0">
                <AlertCircle size={14} strokeWidth={2.5} />
              </div>
            </div>
          </div>

          <div className="mt-auto">
            <Link 
              href="/aslap/absensi" 
              className="group/btn flex items-center justify-center gap-2 w-full py-2.5 lg:py-2 rounded-xl lg:rounded-lg text-[13px] lg:text-[11.5px] font-bold transition-all bg-[#0A1629] hover:bg-slate-800 text-white shadow-md shadow-slate-200 hover:shadow-lg cursor-pointer"
            >
              <span>Lihat Detail Absensi</span>
              <ArrowRight size={14} className="transition-transform group-hover/btn:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Premium Laporan Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col p-4 sm:p-5 lg:p-4 transition-all duration-300 hover:shadow-md hover:border-slate-300 group relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-slate-900 rounded-t-2xl" />
          
          <div className="flex items-center gap-3.5 mb-4 lg:mb-3">
            <div className="w-12 h-12 lg:w-9 lg:h-9 rounded-xl lg:rounded-lg flex items-center justify-center shrink-0 bg-slate-50 border border-slate-100 text-[#0A1629] shadow-inner transition-transform duration-300 group-hover:scale-105">
              <ClipboardList className="w-6 h-6 lg:w-4.5 lg:h-4.5" strokeWidth={2.2} />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-base sm:text-lg lg:text-[14px] tracking-tight mb-0.5">Rekap Laporan</h3>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-50 border border-slate-200/60 rounded-full text-[10px] font-extrabold text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                <span>{totalLaporan} / {divisiList.length} Divisi Lapor</span>
              </div>
            </div>
          </div>
          
          {/* Premium Metric Blocks */}
          <div className="grid grid-cols-2 gap-3 mb-4 lg:mb-3.5">
            {/* Sudah Lapor */}
            <div className="bg-[#F4FBF7]/85 border border-emerald-100/80 rounded-xl p-3 lg:p-2.5 flex items-center justify-between transition-all hover:bg-[#F4FBF7]">
              <div className="space-y-0.5">
                <span className="text-[9px] font-extrabold text-emerald-700/80 uppercase tracking-wider block">Sudah Lapor</span>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-xl lg:text-lg font-black text-emerald-600 tracking-tight leading-none">{totalLaporan}</span>
                  <span className="text-[10px] font-bold text-emerald-500/70">Divisi</span>
                </div>
              </div>
              <div className="w-7 h-7 rounded-full bg-emerald-100/40 border border-emerald-200/40 flex items-center justify-center text-emerald-600 shrink-0">
                <CheckCircle2 size={14} strokeWidth={2.5} />
              </div>
            </div>

            {/* Belum Lapor */}
            <div className="bg-[#FFF5F5]/85 border border-rose-100/80 rounded-xl p-3 lg:p-2.5 flex items-center justify-between transition-all hover:bg-[#FFF5F5]">
              <div className="space-y-0.5">
                <span className="text-[9px] font-extrabold text-rose-700/80 uppercase tracking-wider block">Belum Lapor</span>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-xl lg:text-lg font-black text-rose-600 tracking-tight leading-none">{divisiBelumLapor}</span>
                  <span className="text-[10px] font-bold text-rose-500/70">Divisi</span>
                </div>
              </div>
              <div className="w-7 h-7 rounded-full bg-rose-100/40 border border-rose-200/40 flex items-center justify-center text-rose-600 shrink-0">
                <AlertCircle size={14} strokeWidth={2.5} />
              </div>
            </div>
          </div>

          <div className="mt-auto">
            <Link 
              href="/aslap/laporan" 
              className="group/btn flex items-center justify-center gap-2 w-full py-2.5 lg:py-2 rounded-xl lg:rounded-lg text-[13px] lg:text-[11.5px] font-bold transition-all bg-[#0A1629] hover:bg-slate-800 text-white shadow-md shadow-slate-200 hover:shadow-lg cursor-pointer"
            >
              <span>Lihat Detail Laporan</span>
              <ArrowRight size={14} className="transition-transform group-hover/btn:translate-x-1" />
            </Link>
          </div>
        </div>

      </div>

      {/* Tabel & List Status Divisi */}
      <div className="space-y-2 pt-1.5">
        <div className="flex items-center gap-2 px-1">
          <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ClipboardList size={14} strokeWidth={2.5} />
          </div>
          <h3 className="text-[12px] font-extrabold text-slate-800 uppercase tracking-wider">Status Divisi Hari Ini</h3>
        </div>
        
        {/* Mobile View: Horizontal Single-Row Layout */}
        <div className="flex flex-col gap-1.5 md:hidden">
          {divisiList.map((div) => {
            const matchedAbsen = absensiHariIni.find(a => a.divisi_id === div.id)
            const matchedLapor = laporanHariIni.find(l => l.divisi_id === div.id)
            const hasAbsen = !!matchedAbsen
            
            const laporanStatus = getLaporanStatus(matchedLapor, div.nama_divisi)
            const hasLapor = laporanStatus === "COMPLETE"
            const isPartial = laporanStatus === "PARTIAL"

            const absensiHref = hasAbsen
              ? `/aslap/absensi?divisi=${encodeURIComponent(div.nama_divisi)}&tanggal=${encodeURIComponent(today.toLocaleDateString("id-ID"))}&openDetail=true`
              : `/aslap/absensi?divisi=${encodeURIComponent(div.nama_divisi)}&tanggal=${encodeURIComponent(today.toLocaleDateString("id-ID"))}`

            const laporanHref = (hasLapor || isPartial) && matchedLapor
              ? `/aslap/laporan/${matchedLapor.id}`
              : `/aslap/laporan?divisi=${encodeURIComponent(div.nama_divisi.includes("Kebersihan") ? "Divisi Kebersihan & Satpam" : div.nama_divisi)}&tanggal=${encodeURIComponent(today.toLocaleDateString("id-ID"))}`

            return (
              <div
                key={div.id}
                className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-sm active:scale-[0.99] transition-all flex items-center justify-between gap-3"
              >
                {/* Header (Avatar + Nama Divisi) */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8.5 h-8.5 rounded-lg bg-slate-950 text-white flex items-center justify-center shrink-0">
                    {getDivisiIcon(div.nama_divisi)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-slate-800 text-[13px] leading-tight truncate">
                      {div.nama_divisi}
                    </h4>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                      SPPG TRANGKIL
                    </span>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <Link
                    href={absensiHref}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[9.5px] font-extrabold border transition hover:opacity-80 ${
                      hasAbsen
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100/50"
                        : "bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100/50"
                    }`}
                  >
                    {hasAbsen ? (
                      <CheckCircle2 size={11} strokeWidth={2.5} className="text-emerald-600" />
                    ) : (
                      <AlertCircle size={11} strokeWidth={2.5} className="text-rose-600" />
                    )}
                    <span>{hasAbsen ? "Absen" : "Belum"}</span>
                  </Link>

                  <Link
                    href={laporanHref}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[9.5px] font-extrabold border transition hover:opacity-80 ${
                      hasLapor
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100/50"
                        : isPartial
                        ? "bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100/50"
                        : "bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100/50"
                    }`}
                  >
                    {hasLapor ? (
                      <CheckCircle2 size={11} strokeWidth={2.5} className="text-emerald-600" />
                    ) : (
                      <AlertCircle size={11} strokeWidth={2.5} className={isPartial ? "text-amber-600" : "text-rose-600"} />
                    )}
                    <span>{hasLapor ? "Lapor" : isPartial ? "Partial" : "Belum"}</span>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        {/* Desktop View: Card Grid Layout with Vertical Details */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4">
          {divisiList.map((div) => {
            const matchedAbsen = absensiHariIni.find(a => a.divisi_id === div.id)
            const matchedLapor = laporanHariIni.find(l => l.divisi_id === div.id)
            const hasAbsen = !!matchedAbsen
            
            const laporanStatus = getLaporanStatus(matchedLapor, div.nama_divisi)
            const hasLapor = laporanStatus === "COMPLETE"
            const isPartial = laporanStatus === "PARTIAL"

            const absensiHref = hasAbsen
              ? `/aslap/absensi?divisi=${encodeURIComponent(div.nama_divisi)}&tanggal=${encodeURIComponent(today.toLocaleDateString("id-ID"))}&openDetail=true`
              : `/aslap/absensi?divisi=${encodeURIComponent(div.nama_divisi)}&tanggal=${encodeURIComponent(today.toLocaleDateString("id-ID"))}`

            const laporanHref = (hasLapor || isPartial) && matchedLapor
              ? `/aslap/laporan/${matchedLapor.id}`
              : `/aslap/laporan?divisi=${encodeURIComponent(div.nama_divisi.includes("Kebersihan") ? "Divisi Kebersihan & Satpam" : div.nama_divisi)}&tanggal=${encodeURIComponent(today.toLocaleDateString("id-ID"))}`

            return (
              <div
                key={div.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between gap-3.5"
              >
                {/* Header Kartu */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-950 text-white flex items-center justify-center shrink-0">
                    {getDivisiIcon(div.nama_divisi)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-slate-800 text-[13.5px] leading-tight truncate">
                      {div.nama_divisi}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      SPPG TRANGKIL
                    </span>
                  </div>
                </div>

                {/* Status List */}
                <div className="space-y-1.5 mt-0.5">
                  {/* Status Absensi */}
                  <Link
                    href={absensiHref}
                    className={`flex items-center justify-between px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all hover:bg-slate-50 cursor-pointer ${
                      hasAbsen
                        ? "bg-emerald-50/60 text-emerald-700 border-emerald-100/70 hover:border-emerald-250"
                        : "bg-rose-50/60 text-rose-700 border-rose-100/70 hover:border-rose-250"
                    }`}
                  >
                    <span className="text-slate-500 font-semibold">Absensi</span>
                    <span className="flex items-center gap-1">
                      {hasAbsen ? (
                        <CheckCircle2 size={12} className="text-emerald-600" />
                      ) : (
                        <AlertCircle size={12} className="text-rose-600" />
                      )}
                      {hasAbsen ? "Sudah Absen" : "Belum Absen"}
                    </span>
                  </Link>

                  {/* Status Laporan */}
                  <Link
                    href={laporanHref}
                    className={`flex items-center justify-between px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all hover:bg-slate-50 cursor-pointer ${
                      hasLapor
                        ? "bg-emerald-50/60 text-emerald-700 border-emerald-100/70 hover:border-emerald-250"
                        : isPartial
                        ? "bg-amber-50/60 text-amber-700 border-amber-100/70 hover:border-amber-250"
                        : "bg-rose-50/60 text-rose-700 border-rose-100/70 hover:border-rose-250"
                    }`}
                  >
                    <span className="text-slate-500 font-semibold">Laporan</span>
                    <span className="flex items-center gap-1">
                      {hasLapor ? (
                        <CheckCircle2 size={12} className="text-emerald-600" />
                      ) : (
                        <AlertCircle size={12} className={isPartial ? "text-amber-600" : "text-rose-600"} />
                      )}
                      {hasLapor ? "Sudah Lapor" : isPartial ? "Belum Lengkap" : "Belum Lapor"}
                    </span>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
