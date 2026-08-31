import { getServerSession } from "next-auth/next"
import { authOptions } from "../../api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import LaporanClient from "./LaporanClient"
import { getUploadedFotos, getSharedDivisiId } from "./actions"

export default async function LaporanPage() {
  const session = await getServerSession(authOptions)
  const role = session?.user.role || ""
  const divisiId = session ? await getSharedDivisiId(session) : 0

  const initialPhotos = divisiId ? await getUploadedFotos(divisiId) : []

  // Ambil laporan existing hari ini
  const now = new Date()
  const wibDateString = now.toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" })
  const today = new Date(`${wibDateString}T00:00:00.000Z`)
  const existingLaporan = divisiId ? await prisma.laporanDivisi.findFirst({
    where: { divisi_id: divisiId, tanggal: { gte: today } }
  }) : null

  // Logic untuk Laporan Masuk (Divisi Sebelumnya)
  let upstreamRoles: string[] = []
  if (role === "PENGOLAHAN") upstreamRoles = ["PERSIAPAN"]
  if (role === "PEMORSIAN") upstreamRoles = ["PENGOLAHAN"]
  if (role === "PENCUCIAN") upstreamRoles = ["DISTRIBUSI", "PEMORSIAN"]

  const upstreamLaporan = await prisma.laporanDivisi.findMany({
    where: {
      tanggal: { gte: today },
      divisi: { users: { some: { role: { in: upstreamRoles as any } } } }
    },
    include: {
      divisi: true,
      foto: true
    }
  })

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* VIEW LAPORAN DARI DIVISI SEBELUMNYA */}
      {upstreamRoles.length > 0 && (
        <div className="mb-6 bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          <div className="bg-slate-900 px-4 py-3 sm:px-5 sm:py-3.5 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M2 15h10"></path><path d="m9 18 3-3-3-3"></path></svg>
              </div>
              <div>
                <h3 className="text-white font-bold text-sm sm:text-[13px]">Referensi Laporan Masuk</h3>
                <p className="text-[11px] sm:text-[12px] text-slate-400 font-medium mt-0.5">
                  Dari Divisi {upstreamRoles.map(r => r).join(" & ")}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white">
            {upstreamLaporan.length === 0 ? (
              <div className="p-8 flex flex-col items-center justify-center text-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300 mb-2"><circle cx="12" cy="12" r="10"></circle><path d="M16 16s-1.5-2-4-2-4 2-4 2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
                <p className="text-[13px] font-bold text-slate-700">Belum Ada Laporan</p>
                <p className="text-[11px] text-slate-500 mt-1">Divisi sebelumnya belum mengirimkan laporan hari ini.</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {upstreamLaporan.map(upLap => (
                  <details key={upLap.id} className="group border-b border-slate-100 last:border-0" open>
                    <summary className="px-4 py-3 sm:px-5 sm:py-3.5 hover:bg-slate-50/50 transition-colors cursor-pointer list-none [&::-webkit-details-marker]:hidden flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        </div>
                        <p className="font-bold text-slate-800 text-[14px] sm:text-[15px] truncate">Laporan {upLap.divisi.nama_divisi}</p>
                      </div>
                      
                      <div className="w-6 h-6 flex items-center justify-center text-slate-400 group-open:rotate-180 transition-transform duration-300 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                      </div>
                    </summary>
                    
                    <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0.5 sm:pt-1 pl-[3.25rem] sm:pl-[4.25rem]">
                      {/* Teks Isi Laporan */}
                      <div className="whitespace-pre-wrap text-[13.5px] sm:text-[13px] text-slate-700 leading-[1.6] font-medium">
                        {upLap.isi_laporan || <span className="italic text-slate-400 font-normal">Tidak ada catatan tertulis.</span>}
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* FORM UPLOAD FOTO & CATATAN */}
      <Card className="shadow-sm border-none ring-1 ring-slate-200 overflow-hidden rounded-xl">
        {/* Premium Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-5 sm:px-7 sm:py-3.5 text-white relative overflow-hidden flex items-center justify-between">
          <div className="absolute -top-4 -right-4 opacity-[0.03] pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>
          </div>
          <div className="relative z-10 flex items-center gap-3 sm:gap-4">
            <div className="w-11 h-11 sm:w-10 sm:h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10 shrink-0">
              <svg className="w-5 h-5 sm:w-4 sm:h-4 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-xl font-bold tracking-tight mb-0.5">Form Laporan Harian</h1>
              </div>
              <p className="text-slate-300 font-medium text-[12px] sm:text-[13px] leading-tight">
                Lengkapi foto kegiatan dan catatan divisi <span className="font-bold text-white">{role}</span> hari ini.
              </p>
            </div>
          </div>
        </div>
        <CardContent className="p-0 sm:p-0 bg-white">
          <LaporanClient role={role} initialPhotos={initialPhotos} initialCatatan={existingLaporan?.isi_laporan || ""} />
        </CardContent>
      </Card>
    </div>
  )
}

