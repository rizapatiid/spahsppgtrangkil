import { prisma } from "@/lib/prisma"
import PrintTrigger from "@/app/cetak-laporan/[id]/PrintTrigger"
import React from "react"

export default async function CetakRelawanPage({ searchParams }: { searchParams: Promise<any> }) {
  const params = await searchParams;
  const divisiId = params.divisi === "all" || !params.divisi ? undefined : parseInt(params.divisi);
  const ttdName = params.ttdName || "";
  const ttdNip = params.ttdNip || "";

  const relawanData = await prisma.anggotaDivisi.findMany({
    where: divisiId ? { divisi_id: divisiId } : undefined,
    include: { divisi: true },
    orderBy: [
      { divisi_id: "asc" },
      { nama: "asc" }
    ]
  });

  const divisiList = await prisma.divisi.findMany({ orderBy: { id: "asc" } });
  const selectedDivisi = params.divisi || "all";
  const namaDivisi = selectedDivisi === "all" ? "SEMUA DIVISI" : divisiList.find(d => d.id === parseInt(selectedDivisi))?.nama_divisi || "";

  // Helpers
  const formatId = (isoStr: string) => {
    const dateToParse = isoStr.includes("T") ? isoStr : `${isoStr}T00:00:00`;
    const d = new Date(dateToParse);
    const monthsId = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
    return `${d.getDate()} ${monthsId[d.getMonth()]} ${d.getFullYear()}`;
  };

  return (
    <div className="min-h-screen bg-slate-500 print:bg-white text-black pb-20 print:pb-0 overflow-x-auto" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
      <PrintTrigger backUrl="/admin/relawan" />
      
      <div className="pt-20 print:pt-0 w-full flex justify-center items-start print:block">
        {/* Potrait format (A4) */}
        <div id="cetak-container" className="w-[210mm] min-h-[297mm] print:w-auto print:min-h-0 bg-white p-10 sm:p-12 print:p-2 shadow-2xl print:shadow-none shrink-0">
          
          {/* KOP SURAT RESMI */}
          <div className="border-b border-black pb-[1.5px] mb-8 print:mt-4">
            <div className="flex items-center justify-between border-b-[3px] border-black pb-2">
              <img src="/bgnlogo.png" alt="Logo SPPG" className="w-20 h-20 object-contain shrink-0" />
              <div className="flex-1 text-center px-1">
                <h1 className="text-[22px] font-bold uppercase tracking-wider text-black leading-snug">SPPG PATI TRANGKIL TRANGKIL</h1>
                <h2 className="text-[16px] font-bold uppercase text-black leading-snug">YAYASAN DHARMA KRIDA MANDIRI SEJAHTERA</h2>
                <p className="text-[13px] mt-1 text-black whitespace-nowrap">Jl. Melati RT. 004 RW. 003 Trangkil, Pati, Jawa Tengah | Telp : +62 813 3727 7475</p>
              </div>
              <div className="w-20 shrink-0"></div>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-[16px] font-bold uppercase underline underline-offset-4">DATA RELAWAN SPPG TRANGKIL</h2>
          </div>

          <table className="text-[12px] mb-6">
            <tbody>
              <tr>
                <td className="w-36 py-1">Divisi</td>
                <td className="w-4 text-center">:</td>
                <td className="py-1 font-bold uppercase">{namaDivisi}</td>
              </tr>
              <tr>
                <td className="w-36 py-1">Total Relawan</td>
                <td className="w-4 text-center">:</td>
                <td className="py-1">{relawanData.length} Orang</td>
              </tr>
            </tbody>
          </table>

          {/* Tabel Matriks */}
          <table className="w-full text-left border-collapse border border-black text-[11px] mb-6">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border border-black text-center w-[5%]">NO</th>
                <th className="p-2 border border-black text-center w-[25%]">NAMA LENGKAP</th>
                <th className="p-2 border border-black text-center w-[20%]">NIK / IDENTITAS</th>
                <th className="p-2 border border-black text-center w-[20%]">NO. TELEPON</th>
                <th className="p-2 border border-black text-center w-[30%]">ALAMAT</th>
              </tr>
            </thead>
            <tbody>
              {relawanData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-[12px] italic">
                    Belum ada data relawan.
                  </td>
                </tr>
              ) : (
                (() => {
                  const groupedData = selectedDivisi === "all" 
                    ? relawanData.reduce((acc, row) => {
                        const divName = row.divisi.nama_divisi;
                        if (!acc[divName]) acc[divName] = [];
                        acc[divName].push(row);
                        return acc;
                      }, {} as Record<string, typeof relawanData>)
                    : { "": relawanData };

                  let globalIndex = 0;

                  return Object.entries(groupedData).map(([groupName, rows]) => (
                    <React.Fragment key={groupName}>
                      {groupName && (
                        <tr>
                          <td colSpan={5} className="px-2 py-1.5 border border-black font-bold uppercase text-left bg-gray-50">
                            DIVISI {groupName}
                          </td>
                        </tr>
                      )}
                      {rows.map((row) => {
                        globalIndex++;
                        return (
                          <tr key={row.id}>
                            <td className="p-1.5 border border-black text-center align-middle">{globalIndex}</td>
                            <td className="p-1.5 px-2 border border-black align-middle font-semibold">{row.nama}</td>
                            <td className="p-1.5 px-2 border border-black align-middle text-center">{row.nik || "-"}</td>
                            <td className="p-1.5 px-2 border border-black align-middle text-center">{row.no_hp || "-"}</td>
                            <td className="p-1.5 px-2 border border-black align-middle truncate max-w-[200px]">{row.alamat || "-"}</td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  ));
                })()
              )}
            </tbody>
          </table>

          {/* TTD */}
          <div className="mt-10 flex justify-end pr-8 avoid-break-inside text-[12px]">
            <div className="text-center w-56">
              <p className="mb-1">Pati, {formatId(new Date().toISOString())}</p>
              <p className="font-bold mb-16">Mengetahui,<br/>Kepala SPPG Trangkil</p>
              
              {ttdName ? (
                <>
                  <p className="font-bold underline underline-offset-4 decoration-1">{ttdName}</p>
                  {ttdNip && <p className="mt-1">NIP: {ttdNip}</p>}
                </>
              ) : (
                <>
                  <div className="border-b border-black w-48 mx-auto"></div>
                  <p className="mt-1 font-semibold text-[10px]">( .................................................... )</p>
                </>
              )}
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
        }
      `}} />
    </div>
  )
}
