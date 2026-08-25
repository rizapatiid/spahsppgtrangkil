import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import PhotoLightbox from "@/components/PhotoLightbox"
import SinglePhotoLightbox from "@/components/SinglePhotoLightbox"

export default async function RiwayatDetailPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params
  const session = await getServerSession(authOptions)
  
  if (!session?.user.divisi_id) {
    return <div>Akses Ditolak</div>
  }

  const role = session.user.role
  
  // Parse date
  const targetDate = new Date(date)
  if (isNaN(targetDate.getTime())) {
    notFound()
  }

  // Dapatkan shared divisi id untuk laporan (khusus Satpam & Kebersihan)
  const { getSharedDivisiId } = await import("@/app/dashboard/laporan/actions")
  const sharedDivisiId = await getSharedDivisiId(session)

  // Ambil Laporan Utama
  const laporan = await prisma.laporanDivisi.findFirst({
    where: { divisi_id: sharedDivisiId, tanggal: targetDate },
    include: { foto: true }
  })

  // Ambil Upstream Laporan
  let upstreamRoles: string[] = []
  if (role === "PENGOLAHAN") upstreamRoles = ["PERSIAPAN"]
  if (role === "PEMORSIAN") upstreamRoles = ["PENGOLAHAN"]
  if (role === "PENCUCIAN") upstreamRoles = ["DISTRIBUSI", "PEMORSIAN"]

  const upstreamLaporan = await prisma.laporanDivisi.findMany({
    where: {
      divisi: { nama_divisi: { in: upstreamRoles } },
      tanggal: targetDate
    },
    include: {
      foto: true,
      divisi: true
    },
    orderBy: {
      divisi_id: 'asc'
    }
  })

  if (!laporan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300 mb-4"><circle cx="12" cy="12" r="10"></circle><path d="M16 16s-1.5-2-4-2-4 2-4 2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
        <h1 className="text-xl font-bold text-slate-800 mb-2">Data Tidak Ditemukan</h1>
        <p className="text-[13px] text-slate-500 mb-6">Tidak ada catatan laporan pada tanggal ini.</p>
        <Link href="/dashboard/riwayat" className="bg-slate-900 text-white px-6 py-2.5 rounded-lg text-[13px] font-bold hover:bg-slate-800 transition-colors">
          Kembali ke Riwayat
        </Link>
      </div>
    )
  }

  // Kelompokkan foto laporan (mirip di halaman admin)
  const fotoGroup = (laporan?.foto || []).reduce((acc, curr) => {
    if (!acc[curr.tipe_foto]) acc[curr.tipe_foto] = []
    acc[curr.tipe_foto].push(curr)
    return acc
  }, {} as Record<string, any[]>)

  const formatTipeFoto = (tipe: string) => {
    const map: any = {
      kegiatan: "Foto Kegiatan",
      bahan_makanan: "Bahan Makanan (Bersih)",
      sampah: "Sampah & Catatan",
      masakan_matang: "Masakan Matang",
      makanan_diporsi: "Makanan yang Diporsi",
      kondisi_sebelum_dikirim: "Kondisi Sebelum Dikirim",
      tray_siap: "Tray Siap Distribusi di Rak",
      sisa_pemorsian: "Sisa Pemorsian",
      lokasi_distribusi: "Bukti di Lokasi Distribusi",
      tray_kembali: "Tray Kembali ke SPPG",
      limbah_makanan: "Limbah Makanan",
      sampah_akhir: "Sampah Akhir",
      absensi_briefing: "Absensi & Briefing"
    }
    return map[tipe] || tipe
  }

  // Semua kategori berdasarkan role
  const baseCats = [{ id: "kegiatan", label: "Foto Kegiatan", desc: "Minimal 3 foto kegiatan utama" }]
  let allCategories = [...baseCats]
  if (role === "PERSIAPAN") {
    allCategories.push({ id: "bahan_makanan", label: "Bahan Makanan (Bersih)", desc: "Kondisi bahan setelah dibersihkan" })
    allCategories.push({ id: "sampah", label: "Sampah & Catatan", desc: "Foto sampah hasil persiapan" })
  } else if (role === "PENGOLAHAN") {
    allCategories.push({ id: "masakan_matang", label: "Masakan Matang", desc: "Foto masakan yang sudah selesai dimasak" })
    allCategories.push({ id: "sampah", label: "Sampah & Catatan", desc: "Foto sampah hasil pengolahan" })
  } else if (role === "PEMORSIAN") {
    allCategories.push({ id: "makanan_diporsi", label: "Makanan yang Diporsi", desc: "Proses pemorsian makanan" })
    allCategories.push({ id: "kondisi_sebelum_dikirim", label: "Kondisi Sebelum Dikirim", desc: "Kondisi makanan sebelum didistribusikan" })
    allCategories.push({ id: "tray_siap", label: "Tray Siap Distribusi di Rak", desc: "Tray yang sudah tersusun rapi di rak" })
    allCategories.push({ id: "sisa_pemorsian", label: "Sisa Pemorsian", desc: "Foto sisa makanan setelah diporsi" })
  } else if (role === "DISTRIBUSI") {
    allCategories.push({ id: "lokasi_distribusi", label: "Bukti di Lokasi Distribusi", desc: "Foto bukti pengantaran di lokasi" })
    allCategories.push({ id: "tray_kembali", label: "Tray Kembali ke SPPG", desc: "Minimal 4 foto tray yang kembali" })
  } else if (role === "PENCUCIAN") {
    allCategories.push({ id: "limbah_makanan", label: "Limbah Makanan", desc: "Minimal 4 foto limbah makanan" })
    allCategories.push({ id: "tray_kembali", label: "Tray Kembali ke SPPG", desc: "Minimal 4 foto tray yang kembali" })
  } else if (role === "KEBERSIHAN" || role === "SATPAM") {
    allCategories.push({ id: "sampah_akhir", label: "Sampah Akhir", desc: "Foto kondisi sampah di akhir kegiatan" })
  }


  return (
    <div className="space-y-6">
        
        {/* Header Halaman */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2 pb-4 border-b border-slate-200/80 px-1">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/riwayat" className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 flex items-center justify-center shrink-0 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </Link>
            <div>
              <h2 className="text-[16px] font-extrabold text-slate-800 tracking-tight">Detail Laporan</h2>
              <p className="text-[11px] sm:text-[12px] text-slate-500 font-medium">
                {targetDate.toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>

        {/* VIEW LAPORAN DARI DIVISI SEBELUMNYA */}
        {upstreamRoles.length > 0 && upstreamLaporan.length > 0 && (
          <div className="mb-6 bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <div className="bg-slate-900 px-4 py-3 sm:px-5 sm:py-3.5 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M2 15h10"></path><path d="m9 18 3-3-3-3"></path></svg>
                </div>
                <div>
                  <h3 className="text-white font-bold text-[13px] sm:text-[14px]">Referensi Laporan Masuk</h3>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">
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
                          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                          </div>
                          <p className="font-bold text-slate-800 text-[14px] sm:text-[15px] truncate">Laporan {upLap.divisi.nama_divisi}</p>
                        </div>
                        
                        <div className="w-6 h-6 flex items-center justify-center text-slate-400 group-open:rotate-180 transition-transform duration-300 shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </div>
                      </summary>
                      
                      <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0.5 sm:pt-1 pl-[3.25rem] sm:pl-[4.25rem]">
                        <div className="whitespace-pre-wrap text-[13.5px] sm:text-[14px] text-slate-700 leading-[1.6] font-medium mb-3 sm:mb-4">
                          {upLap.isi_laporan || <span className="italic text-slate-400 font-normal">Hanya melampirkan foto.</span>}
                        </div>

                        {upLap.foto.length > 0 && (
                          <PhotoLightbox photos={upLap.foto} />
                        )}
                      </div>
                    </details>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Laporan Divisi Sendiri */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 p-4 sm:p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              </div>
              <h3 className="text-white font-bold text-[14px] sm:text-[15px]">Laporan Divisi Anda</h3>
            </div>
          </div>
          <div className="p-4 sm:p-6 space-y-6">
            
            {/* Catatan Harian */}
            <div className="pb-6 border-b border-slate-200/60">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </div>
                <div>
                  <h3 className="text-[15px] font-extrabold text-slate-800 leading-tight">Catatan Laporan</h3>
                  <p className="text-[12px] text-slate-500 mt-0.5 font-medium">Ringkasan operasional atau kendala hari ini</p>
                </div>
              </div>
              <div className="w-full border border-slate-200 bg-slate-50/50 p-4 rounded-lg text-[13px] text-slate-700 min-h-[100px] whitespace-pre-wrap leading-relaxed">
                {laporan.isi_laporan || <span className="text-slate-400 italic">Tidak ada catatan yang ditulis.</span>}
              </div>
            </div>

            {/* Lampiran Foto */}
            <div>
              <div className="flex items-center gap-4 mb-5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                </div>
                <div>
                  <h3 className="text-[15px] font-extrabold text-slate-800 leading-tight">Dokumentasi Foto</h3>
                  <p className="text-[12px] text-slate-500 mt-0.5 font-medium">Foto bukti kegiatan per kategori</p>
                </div>
              </div>
              
              <div className="space-y-8">
                {allCategories.map((cat, catIndex) => {
                  const fotos = fotoGroup[cat.id] || []
                  return (

                      <div key={cat.id} className="pb-8 border-b border-slate-200/60 last:border-0 last:pb-0">
                        <div className="flex items-start sm:items-center gap-2.5 mb-5">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border border-slate-200 shadow-sm text-slate-500 flex items-center justify-center text-[11px] sm:text-[12px] font-bold shrink-0 mt-0.5 sm:mt-0">
                            {catIndex + 1}
                          </div>
                          <div>
                            <h3 className="text-[13px] font-bold text-slate-800 leading-snug">{cat.label}</h3>
                            <p className="text-[11px] text-slate-500 font-medium mt-0.5">{cat.desc}</p>
                          </div>
                          {fotos.length > 0 && (
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full ml-auto shrink-0">{fotos.length} foto</span>
                          )}
                        </div>

                        {fotos.length === 0 ? (
                          <div className="py-8 flex flex-col items-center justify-center text-center bg-white border-2 border-dashed border-slate-200 rounded-lg">
                            <svg className="text-slate-300 mb-2" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                            <p className="text-[12px] font-medium text-slate-400">Belum ada foto untuk kategori ini.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {fotos.map(f => {
                              const catatan = f.catatan as any
                              const keterangan = catatan?.keterangan || catatan?.text || (typeof catatan === 'string' ? catatan : null)
                              return (
                                <div key={f.id} className="flex flex-row sm:flex-col bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                                <SinglePhotoLightbox
                                  src={f.url_foto}
                                  alt={cat.id}
                                />
                                  <div className="p-3 flex flex-1 flex-col min-w-0 justify-center">
                                    <p className="text-[12px] font-bold text-slate-800 line-clamp-2 leading-snug mb-1">
                                      {keterangan || <span className="text-slate-400 font-normal italic">Keterangan kosong...</span>}
                                    </p>
                                    <p className="text-[10px] text-slate-500 font-medium">{new Date(f.tanggal).toLocaleDateString("id-ID")}</p>
                                  </div>
                                </div>
                              )
                            })}
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
  )
}
