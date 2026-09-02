import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import PrintTrigger from "./PrintTrigger"

export default async function CetakLaporan({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")
  
  const laporan = await prisma.laporanDivisi.findUnique({
    where: { id },
    include: {
      divisi: true,
      foto: true
    }
  })

  if (!laporan) {
    return <div>Laporan tidak ditemukan</div>
  }

  const formatTanggal = new Date(laporan.tanggal).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  })

  // Format photos by category for better grouping
  const groupedPhotos = laporan.foto.reduce((acc: any, foto: any) => {
    if (!acc[foto.tipe_foto]) acc[foto.tipe_foto] = []
    acc[foto.tipe_foto].push(foto)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-slate-500 print:bg-white text-black pb-20 overflow-x-auto" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
      <PrintTrigger backUrl={`/admin/laporan/${laporan.id}`} />
      
      <div className="pt-20 print:pt-0 w-full flex justify-center print:block print:w-auto">
        <div id="cetak-container" className="w-[210mm] min-h-[297mm] print:w-full print:min-h-0 bg-white p-10 sm:p-12 shadow-2xl print:shadow-none print:p-0 print:m-0 shrink-0">
        
        {/* KOP SURAT RESMI */}
        <div className="border-b border-black pb-[1.5px] mb-8">
          <div className="flex items-center justify-between border-b-[3px] border-black pb-2">
            {/* Logo Kiri */}
            <img 
              src="/bgnlogo.png" 
              alt="Logo SPPG" 
              className="w-20 h-20 object-contain shrink-0" 
            />
            
            {/* Teks Tengah */}
            <div className="flex-1 text-center px-1">
              <h1 className="text-[22px] font-bold uppercase tracking-wider text-black leading-snug">SPPG PATI TRANGKIL TRANGKIL</h1>
              <h2 className="text-[16px] font-bold uppercase text-black leading-snug">YAYASAN DHARMA KRIDA MANDIRI SEJAHTERA</h2>
              <p className="text-[13px] mt-1 text-black whitespace-nowrap">Jl. Melati RT. 004 RW. 003 Trangkil, Pati, Jawa Tengah | Telp : +62 813 3727 7475</p>
            </div>

            {/* Spacer Kanan */}
            <div className="w-20 h-20 shrink-0"></div>
          </div>
        </div>

        {/* JUDUL */}
        <div className="text-center mb-8">
          <h3 className="text-[16px] font-bold uppercase underline text-black">LAPORAN HARIAN {laporan.divisi.nama_divisi}</h3>
        </div>

        {/* METADATA */}
        <table className="w-full text-[14px] text-black mb-6 leading-relaxed">
          <tbody>
            <tr>
              <td className="w-40 align-top">Hari, Tanggal</td>
              <td className="w-4 align-top">:</td>
              <td className="align-top">{formatTanggal}</td>
            </tr>
            <tr>
              <td className="w-40 align-top">Koordinator Divisi</td>
              <td className="w-4 align-top">:</td>
              <td className="align-top">{laporan.divisi.koordinator || "-"}</td>
            </tr>
            <tr>
              <td className="w-40 align-top">Dilaporkan Oleh</td>
              <td className="w-4 align-top">:</td>
              <td className="align-top">{laporan.divisi.nama_divisi}</td>
            </tr>
          </tbody>
        </table>

        {/* ISI LAPORAN */}
        <div className="mb-6">
          <h4 className="font-bold text-[14px] mb-2 text-black uppercase">A. Catatan Operasional</h4>
          <div className="pl-6 text-[14px] text-black text-justify whitespace-pre-wrap leading-relaxed">
            {laporan.isi_laporan || <span className="italic">Tidak ada catatan khusus untuk hari ini.</span>}
          </div>
        </div>

        {/* DOKUMENTASI FOTO */}
        <div className="mb-8">
          <h4 className="font-bold text-[14px] mb-4 text-black uppercase">B. Dokumentasi Kegiatan</h4>
          
          <div className="pl-6">
            {Object.entries(groupedPhotos).map(([tipe, fotos]: [string, any], idx) => (
              <div key={tipe} className="mb-6 avoid-break-inside">
                <h5 className="font-bold text-[13px] mb-3 capitalize text-black">{idx + 1}. Foto {tipe.replace(/_/g, " ")}</h5>
                <div className="grid grid-cols-2 gap-6">
                  {fotos.map((f: any) => (
                    <div key={f.id} className="text-center flex flex-col items-center">
                      <div className="w-full h-48 border border-slate-300 p-1 mb-2">
                        <img src={f.url_foto} alt={tipe} className="w-full h-full object-contain" />
                      </div>
                      <p className="text-[13px] text-black italic">{f.catatan?.keterangan || "Tidak ada keterangan"}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            {laporan.foto.length === 0 && (
              <p className="text-[14px] italic text-black">Tidak ada dokumentasi foto yang dilampirkan.</p>
            )}
          </div>
        </div>

        {/* Bagian Tanda Tangan */}
        <div className="mt-16 flex justify-end page-break-inside-avoid">
          <div className="text-center w-64">
            <p className="text-[14px] text-black mb-1">Pati, {new Date(laporan.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
            <p className="text-[14px] font-bold text-black mb-16">Koordinator Divisi</p>
            
            <p className="text-[14px] font-bold underline text-black">{laporan.divisi.koordinator || "........................................"}</p>
          </div>
        </div>

        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media screen and (max-width: 500px) {
          #cetak-container { zoom: 0.45; }
        }
        @media screen and (min-width: 501px) and (max-width: 768px) {
          #cetak-container { zoom: 0.7; }
        }
        @media print {
          @page { size: A4 portrait; margin: 15mm; }
          .avoid-break-inside { break-inside: avoid; }
          #cetak-container { zoom: 1 !important; }
        }
      `}} />
    </div>
  )
}
