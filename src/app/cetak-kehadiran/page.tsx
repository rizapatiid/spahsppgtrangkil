import React from "react"
import { prisma } from "@/lib/prisma"
import { fetchAbsensiMatrix } from "@/app/admin/absensi-relawan/actions"
import PrintTrigger from "@/app/cetak-laporan/[id]/PrintTrigger"
import { Check } from "lucide-react"

export default async function CetakKehadiranPage({ searchParams }: { searchParams: Promise<any> }) {
  const params = await searchParams;
  const type = params.type || "monthly";
  const month = parseInt(params.month) || new Date().getMonth() + 1;
  const year = parseInt(params.year) || new Date().getFullYear();
  const startDate = params.startDate;
  const endDate = params.endDate;
  const divisiId = params.divisi === "all" ? undefined : parseInt(params.divisi);
  const ttdName = params.ttdName || "";
  const ttdNip = params.ttdNip || "";

  const divisiList = await prisma.divisi.findMany({ orderBy: { id: "asc" } });

  const res = await fetchAbsensiMatrix({
    type: type as any,
    month,
    year,
    startDate,
    endDate,
    divisiId
  });

  const { matrix: dataMatrix, dateColumns, periodStart: actualStart, periodEnd: actualEnd } = res;
  
  const selectedDivisi = params.divisi || "all";
  const namaDivisi = selectedDivisi === "all" ? "SEMUA DIVISI" : divisiList.find(d => d.id === parseInt(selectedDivisi))?.nama_divisi || "";

  // Helpers
  const formatId = (isoStr: string) => {
    const dateToParse = isoStr.includes("T") ? isoStr : `${isoStr}T00:00:00`;
    const d = new Date(dateToParse);
    const monthsId = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
    return `${d.getDate()} ${monthsId[d.getMonth()]} ${d.getFullYear()}`;
  };

  const renderStatus = (status: string) => {
    switch (status) {
      case "Hadir":
        return <div className="mx-auto flex items-center justify-center font-bold text-[12px]"><Check size={14} strokeWidth={4} className="text-black w-3.5 h-3.5" /></div>;
      case "Sakit":
        return <div className="mx-auto flex items-center justify-center font-bold text-[12px] text-black">S</div>;
      case "Izin":
        return <div className="mx-auto flex items-center justify-center font-bold text-[12px] text-black">I</div>;
      case "Alfa":
        return <div className="mx-auto flex items-center justify-center font-bold text-[12px] text-black">-</div>;
      default:
        return <div className="mx-auto"></div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-500 print:bg-white text-black pb-20 print:pb-0 overflow-x-auto" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
      <PrintTrigger backUrl="/admin/absensi-relawan" />
      
      <div className="pt-20 print:pt-0 w-full flex justify-center items-start print:block">
        <div id="cetak-container" className="w-[297mm] min-h-[210mm] print:w-auto print:min-h-0 bg-white p-10 sm:p-12 print:p-2 shadow-2xl print:shadow-none shrink-0">
          
          {/* KOP SURAT RESMI */}
          <div className="border-b border-black pb-[1.5px] mb-8 print:mt-4">
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
              
              {/* Placeholder Kanan (untuk balance) */}
              <div className="w-20 shrink-0"></div>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-[16px] font-bold uppercase underline underline-offset-4">LAPORAN REKAPITULASI KEHADIRAN RELAWAN</h2>
          </div>

          <table className="text-[12px] mb-6">
            <tbody>
              <tr>
                <td className="w-36 py-1">Periode</td>
                <td className="w-4 text-center">:</td>
                <td className="py-1 font-bold">{actualStart && actualEnd ? `${formatId(actualStart)} - ${formatId(actualEnd)}` : "-"}</td>
              </tr>
              <tr>
                <td className="w-36 py-1">Divisi</td>
                <td className="w-4 text-center">:</td>
                <td className="py-1 font-bold uppercase">{namaDivisi}</td>
              </tr>
            </tbody>
          </table>

          {/* Tabel Matriks */}
          <table className="w-full text-left border-collapse border border-black table-fixed text-[10px]">
            <thead>
              <tr>
                <th className="p-1 border border-black text-center w-[3%]" rowSpan={2}>NO</th>
                <th className="p-1 border border-black text-center w-[15%]" rowSpan={2}>RELAWAN & DIVISI</th>
                <th className="p-1 border border-black text-center" colSpan={dateColumns.length}>TANGGAL</th>
                <th className="p-1 border border-black text-center w-[8%]" rowSpan={2}>TOTAL HADIR</th>
              </tr>
              <tr>
                {dateColumns.map(col => (
                  <th key={col.dateStr} className="p-0.5 border border-black text-center align-middle font-normal w-auto">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataMatrix.length === 0 ? (
                <tr>
                  <td colSpan={dateColumns.length + 3} className="p-4 text-center">
                    Tidak ada relawan yang ditemukan di divisi/periode ini.
                  </td>
                </tr>
              ) : (
                (() => {
                  const groupedData = selectedDivisi === "all" 
                    ? dataMatrix.reduce((acc, row) => {
                        if (!acc[row.divisi]) acc[row.divisi] = [];
                        acc[row.divisi].push(row);
                        return acc;
                      }, {} as Record<string, typeof dataMatrix>)
                    : { "": dataMatrix };

                  let globalIndex = 0;

                  return Object.entries(groupedData).map(([groupName, rows]) => (
                    <React.Fragment key={groupName}>
                      {groupName && (
                        <tr>
                          <td colSpan={dateColumns.length + 3} className="px-2 py-1 border border-black font-bold uppercase text-left bg-gray-100">
                            {groupName}
                          </td>
                        </tr>
                      )}
                      {rows.map((row) => {
                        let totalHadir = 0;
                        globalIndex++;
                        
                        return (
                          <tr key={row.id}>
                            <td className="p-1 border border-black align-middle text-center">
                              {globalIndex}
                            </td>
                            <td className="p-1 px-2 border border-black align-middle truncate font-semibold">
                              {row.nama}
                            </td>
                            {dateColumns.map(col => {
                              const status = row.attendance[col.dateStr];
                              if (status === "Hadir") totalHadir++;
                              return (
                                <td key={col.dateStr} className="p-0.5 border border-black text-center align-middle">
                                  {renderStatus(status)}
                                </td>
                              );
                            })}
                            <td className="p-1 border border-black align-middle text-center font-bold">
                              {totalHadir}
                            </td>
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
          <div className="mt-10 flex justify-end pr-12 avoid-break-inside text-[12px]">
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
          #cetak-container { zoom: 0.35; }
        }
        @media screen and (min-width: 501px) and (max-width: 768px) {
          #cetak-container { zoom: 0.55; }
        }
        @media screen and (min-width: 769px) and (max-width: 1024px) {
          #cetak-container { zoom: 0.75; }
        }
        @media print {
          @page { size: A4 landscape; margin: 15mm; }
          .avoid-break-inside { break-inside: avoid; }
        }
      `}} />
    </div>
  )
}
