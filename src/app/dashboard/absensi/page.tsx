import { getServerSession } from "next-auth/next"
import { authOptions } from "../../api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users, CheckCircle2, Check, Home, History } from "lucide-react"
import Link from "next/link"
import AbsensiClient from "./AbsensiClient"
import InfoKetentuan from "./InfoKetentuan"

export default async function AbsensiPage() {
  const session = await getServerSession(authOptions)
  const divisi_id = session?.user.divisi_id || -1
  
  // Ambil data anggota divisi ini dari database
  const anggotaList = await prisma.anggotaDivisi.findMany({
    where: { divisi_id }
  })

  // Cek apakah sudah absen hari ini
  const now = new Date()
  const wibDateString = now.toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" })
  const today = new Date(`${wibDateString}T00:00:00.000Z`)

  const existingAbsensi = await prisma.absensi.findFirst({
    where: {
      divisi_id,
      tanggal: { gte: today }
    }
  })
  
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {existingAbsensi ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center mt-4">
          <div className="flex justify-center mb-10 mt-6">
            <style>{`
              .anim-success-svg {
                width: 100px;
                height: 100px;
                border-radius: 50%;
                display: block;
                stroke-width: 4;
                stroke: #fff;
                box-shadow: inset 0px 0px 0px transparent;
                animation: loopSvg 6s infinite;
              }
              .anim-success-circle {
                stroke-dasharray: 166;
                stroke-dashoffset: 166;
                stroke-width: 4;
                stroke: #0A1629;
                fill: none;
                animation: loopCircle 6s infinite;
              }
              .anim-success-check {
                transform-origin: 50% 50%;
                stroke-dasharray: 48;
                stroke-dashoffset: 48;
                animation: loopCheck 6s infinite;
              }
              @keyframes loopSvg {
                0% { box-shadow: inset 0px 0px 0px transparent; transform: scale(0.8); opacity: 0; animation-timing-function: ease-out; }
                5% { opacity: 1; transform: scale(1); box-shadow: inset 0px 0px 0px transparent; animation-timing-function: ease-in-out; }
                12.5% { box-shadow: inset 0px 0px 0px 60px #0A1629; transform: scale(1.15); opacity: 1; animation-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1); }
                15%, 85% { box-shadow: inset 0px 0px 0px 60px #0A1629; transform: scale(1); opacity: 1; animation-timing-function: ease-in; }
                90%, 100% { transform: scale(0.7); opacity: 0; box-shadow: inset 0px 0px 0px 60px #0A1629; }
              }
              @keyframes loopCircle {
                0%, 5% { stroke-dashoffset: 166; animation-timing-function: cubic-bezier(0.65, 0, 0.45, 1); }
                10%, 100% { stroke-dashoffset: 0; }
              }
              @keyframes loopCheck {
                0%, 7.5% { stroke-dashoffset: 48; animation-timing-function: cubic-bezier(0.65, 0, 0.45, 1); }
                12.5%, 100% { stroke-dashoffset: 0; }
              }
            `}</style>
            
            <svg className="anim-success-svg shadow-xl shadow-[#0A1629]/20" viewBox="0 0 52 52">
              <circle className="anim-success-circle" cx="26" cy="26" r="25" strokeLinecap="round" strokeLinejoin="round" />
              <path className="anim-success-check" fill="none" strokeLinecap="round" strokeLinejoin="round" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
            </svg>
          </div>
          
          <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Absensi Selesai!</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-6 leading-relaxed text-[14px]">
            Hebat! Divisi <span className="font-bold text-slate-800">{session?.user.role.toUpperCase()}</span> telah menyelesaikan pengisian absensi dan laporan kehadiran untuk hari ini.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto mt-2">
            <Link href="/dashboard" className="flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-[14px] hover:bg-slate-800 transition-all shadow-sm w-full sm:w-auto active:scale-95">
              <Home size={18} />
              Kembali ke Beranda
            </Link>
            <Link href="/dashboard/riwayat" className="flex items-center justify-center gap-2 bg-white text-slate-700 border border-gray-200 px-6 py-2.5 rounded-xl font-bold text-[14px] hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm w-full sm:w-auto active:scale-95">
              <History size={18} />
              Cek Riwayat
            </Link>
          </div>
        </div>
      ) : (
        <Card className="shadow-sm border-none ring-1 ring-slate-200 overflow-hidden rounded-2xl">
          {/* Premium Header */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-5 sm:px-7 sm:py-4 text-white relative overflow-hidden flex items-center justify-between">
            <div className="absolute -top-4 -right-4 opacity-[0.03] pointer-events-none">
              <Users size={160} />
            </div>
            <div className="relative z-10 flex items-center gap-3 sm:gap-4">
              <div className="w-11 h-11 sm:w-10 sm:h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10 shrink-0">
                <Users className="w-5 h-5 sm:w-4 sm:h-4 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-xl font-bold tracking-tight mb-0.5">Formulir Kehadiran</h1>
                  <InfoKetentuan />
                </div>
                <p className="text-slate-300 font-medium text-[12px] sm:text-[13px] leading-tight">
                  Pilih status kehadiran anggota divisi hari ini dengan akurat.
                </p>
              </div>
            </div>
          </div>
          <CardContent className="p-6 sm:p-7 bg-white">
            <AbsensiClient anggotaList={anggotaList} divisiName={session?.user.role || "UNKNOWN"} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
