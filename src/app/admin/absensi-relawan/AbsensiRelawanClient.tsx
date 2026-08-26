"use client"

import { useState, useEffect } from "react"
import { CalendarDays, Filter, Check, FileSpreadsheet, Printer, X, CalendarIcon } from "lucide-react"
import { fetchAbsensiMatrix } from "./actions"

export default function AbsensiRelawanClient({ divisiList }: { divisiList: any[] }) {
  const currentDate = new Date()
  
  // Helpers
  const formatLocal = (d: Date) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  const formatId = (isoStr: string) => {
    // If it's just YYYY-MM-DD, add time so it parses as local time
    const dateToParse = isoStr.includes('T') ? isoStr : `${isoStr}T00:00:00`
    const d = new Date(dateToParse)
    const monthsId = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"]
    return `${d.getDate()} ${monthsId[d.getMonth()]} ${d.getFullYear()}`
  }

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

  // Filters State
  const [periodType, setPeriodType] = useState<'monthly' | 'range'>('monthly')
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  const [startDate, setStartDate] = useState(formatLocal(startOfMonth))
  const [endDate, setEndDate] = useState(formatLocal(endOfMonth))
  const [selectedDivisi, setSelectedDivisi] = useState<string>("all")
  
  const [dataMatrix, setDataMatrix] = useState<any[]>([])
  const [dateColumns, setDateColumns] = useState<{dateStr: string, label: string}[]>([])
  const [actualStart, setActualStart] = useState("")
  const [actualEnd, setActualEnd] = useState("")
  const [loading, setLoading] = useState(true)

  const [showPrintModal, setShowPrintModal] = useState(false)
  const [printRequested, setPrintRequested] = useState(false)

  const months = [
    { value: 1, label: "Januari" }, { value: 2, label: "Februari" }, { value: 3, label: "Maret" },
    { value: 4, label: "April" }, { value: 5, label: "Mei" }, { value: 6, label: "Juni" },
    { value: 7, label: "Juli" }, { value: 8, label: "Agustus" }, { value: 9, label: "September" },
    { value: 10, label: "Oktober" }, { value: 11, label: "November" }, { value: 12, label: "Desember" }
  ]
  const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - 2 + i)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const divisiId = selectedDivisi === "all" ? undefined : parseInt(selectedDivisi)
      const res = await fetchAbsensiMatrix({
        type: periodType,
        month: selectedMonth,
        year: selectedYear,
        startDate: startDate,
        endDate: endDate,
        divisiId
      })
      setDataMatrix(res.matrix)
      setDateColumns(res.dateColumns)
      setActualStart(res.periodStart)
      setActualEnd(res.periodEnd)
      setLoading(false)
    }
    loadData()
  }, [periodType, selectedMonth, selectedYear, startDate, endDate, selectedDivisi])

  // Handle Print Queue
  useEffect(() => {
    if (!loading && printRequested) {
      setTimeout(() => window.print(), 500)
      setPrintRequested(false)
    }
  }, [loading, printRequested])

  const handlePrintClick = () => {
    setShowPrintModal(false)
    if (loading) {
      setPrintRequested(true)
    } else {
      setTimeout(() => window.print(), 500)
    }
  }

  const renderStatus = (status: string) => {
    switch (status) {
      case "Hadir":
        return <div className="mx-auto flex items-center justify-center font-bold text-[12px] print:w-auto print:h-auto"><Check size={14} strokeWidth={4} className="text-emerald-600 print:text-black print:w-3.5 print:h-3.5" /></div>
      case "Sakit":
        return <div className="mx-auto flex items-center justify-center font-bold text-[12px] text-amber-600 print:w-auto print:h-auto print:text-black" title="Sakit">S</div>
      case "Izin":
        return <div className="mx-auto flex items-center justify-center font-bold text-[12px] text-purple-600 print:w-auto print:h-auto print:text-black" title="Izin">I</div>
      case "Alfa":
        return <div className="mx-auto flex items-center justify-center font-bold text-[12px] text-rose-600 print:w-auto print:h-auto print:text-black" title="Alfa">A</div>
      default:
        // Empty string is cleaner for PDF reports
        return <span className="text-slate-300 print:text-transparent print:hidden">-</span>
    }
  }

  // Komponen pemilih periode yang bisa di-reuse di main UI dan Modal
  const renderPeriodSelectors = () => (
    <>
      <div className="flex gap-2 mb-2 sm:mb-0 sm:mr-2">
        <button 
          type="button"
          onClick={() => setPeriodType('monthly')}
          className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-[11px] font-bold border transition ${periodType === 'monthly' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
        >
          Bulanan
        </button>
        <button 
          type="button"
          onClick={() => setPeriodType('range')}
          className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-[11px] font-bold border transition ${periodType === 'range' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
        >
          Rentang Tanggal
        </button>
      </div>

      {periodType === 'monthly' ? (
        <div className="grid grid-cols-2 gap-2 flex-1">
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="w-full border border-slate-200 bg-slate-50 rounded-lg text-[12px] font-bold text-slate-700 p-2 outline-none focus:ring-2 focus:ring-blue-100"
          >
            {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="w-full border border-slate-200 bg-slate-50 rounded-lg text-[12px] font-bold text-slate-700 p-2 outline-none focus:ring-2 focus:ring-blue-100"
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 flex-1">
          <input 
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full border border-slate-200 bg-slate-50 rounded-lg text-[12px] font-bold text-slate-700 p-2 outline-none focus:ring-2 focus:ring-blue-100"
          />
          <input 
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full border border-slate-200 bg-slate-50 rounded-lg text-[12px] font-bold text-slate-700 p-2 outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
      )}
    </>
  )

  return (
    <div className="space-y-6">
      
      {/* Header Halaman (Sembunyi saat print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2 pb-4 border-b border-slate-200/80 px-1 print:hidden">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <FileSpreadsheet size={18} strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <h2 className="text-[15px] sm:text-[16px] font-extrabold text-slate-800 tracking-tight truncate">Laporan Kehadiran Relawan</h2>
            <p className="text-[11px] text-slate-500 font-medium truncate">Rekap kehadiran individu (Matriks Bulanan & Periode)</p>
          </div>
        </div>

        <button
          onClick={() => setShowPrintModal(true)}
          className="inline-flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3 sm:px-4 py-2 rounded-lg text-[12px] font-bold shadow-sm transition-all shrink-0 cursor-pointer w-full sm:w-auto"
        >
          <Printer size={15} />
          <span className="hidden sm:inline">Simpan Laporan (PDF)</span>
          <span className="sm:hidden">Simpan PDF</span>
        </button>
      </div>

      {/* Kop Surat Khusus Cetak/Print - DESAIN RESMI (CENTERED, CORPORATE) */}
      <div className="hidden print:block mb-5 w-full">
        {/* Header Kop Surat */}
        <div className="flex flex-col items-center justify-center pb-2 text-center relative">
          <img src="https://res.cloudinary.com/glcpjxnr/image/upload/v1787672024/sppg_trangkil/assets/gcvi4ohrnoapnxb8dfro.png" alt="Logo SPPG" className="h-24 object-contain mb-2" />
          <h2 className="text-[17px] font-bold uppercase text-black tracking-widest mt-1">Laporan Rekapitulasi Kehadiran Relawan</h2>
        </div>
        
        {/* Garis Ganda Kop Surat Klasik */}
        <div className="border-b-[4px] border-double border-black mb-4 w-full"></div>
        
        {/* Informasi Laporan & Legenda */}
        <div className="flex justify-between items-end mb-2 px-1">
          {/* Legenda di Print */}
          <div className="flex flex-col gap-1 pb-0.5">
            <span className="text-[9px] font-bold text-black uppercase tracking-wider mb-1">Keterangan:</span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded flex items-center justify-center border border-black"><Check size={10} strokeWidth={4} className="text-black" /></div> <span className="text-[9px] font-semibold text-black">Hadir</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded flex items-center justify-center border border-black text-[9px] font-bold text-black">S</div> <span className="text-[9px] font-semibold text-black">Sakit</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded flex items-center justify-center border border-black text-[9px] font-bold text-black">I</div> <span className="text-[9px] font-semibold text-black">Izin</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded flex items-center justify-center border border-black text-[9px] font-bold text-black">A</div> <span className="text-[9px] font-semibold text-black">Alfa</span></div>
            </div>
          </div>

          {/* Info Periode */}
          <table className="text-[10px] text-black">
            <tbody>
              <tr>
                <td className="font-bold text-right pr-3 py-0.5 uppercase tracking-wider">Periode:</td>
                <td className="text-left py-0.5 font-bold">{actualStart && actualEnd ? `${formatId(actualStart)} - ${formatId(actualEnd)}` : '-'}</td>
              </tr>
              <tr>
                <td className="font-bold text-right pr-3 py-0.5 uppercase tracking-wider">Divisi:</td>
                <td className="text-left py-0.5 uppercase font-bold">{selectedDivisi === 'all' ? 'SEMUA DIVISI' : divisiList.find(d => d.id === parseInt(selectedDivisi))?.nama_divisi}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Filter Section (Sembunyi saat print) */}
      <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col xl:flex-row xl:items-center gap-3 sm:gap-4 print:hidden">
        <div className="flex items-center gap-2 text-slate-400 shrink-0">
          <Filter size={14} className="sm:w-4 sm:h-4" />
          <span className="text-[11px] sm:text-[12px] font-bold uppercase tracking-wider">Filter:</span>
        </div>
        
        <div className="flex flex-col sm:flex-row flex-1 w-full gap-2">
          {renderPeriodSelectors()}
          
          <div className="sm:ml-2 sm:pl-4 sm:border-l border-slate-100 flex-1">
            <select 
              value={selectedDivisi} 
              onChange={(e) => setSelectedDivisi(e.target.value)}
              className="w-full border border-slate-200 bg-slate-50 rounded-lg text-[12px] font-bold text-slate-700 p-2 outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">Semua Divisi</option>
              {divisiList.map(d => <option key={d.id} value={d.id}>{d.nama_divisi}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Legenda Main UI (Sembunyi saat print karena sudah dipindah ke atas tabel) */}
      <div className="flex flex-wrap items-center gap-3 px-1 print:hidden">
        <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Keterangan:</span>
        <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center"><Check size={10} strokeWidth={3}/></div> <span className="text-[11px] font-bold text-slate-600">Hadir</span></div>
        <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-amber-100 text-amber-600 flex items-center justify-center text-[10px] font-bold">S</div> <span className="text-[11px] font-bold text-slate-600">Sakit</span></div>
        <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-purple-100 text-purple-600 flex items-center justify-center text-[10px] font-bold">I</div> <span className="text-[11px] font-bold text-slate-600">Izin</span></div>
        <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-rose-100 text-rose-600 flex items-center justify-center text-[10px] font-bold">A</div> <span className="text-[11px] font-bold text-slate-600">Alfa</span></div>
      </div>

      {/* Tabel Matriks */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden relative print:border-none print:rounded-none print:shadow-none mt-2">
        {loading && (
          <div className="absolute inset-0 z-20 bg-white/50 backdrop-blur-sm flex items-center justify-center print:hidden">
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-[12px] font-bold text-slate-600">Memuat Data...</span>
            </div>
          </div>
        )}

        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            @page { size: landscape; margin: 10mm 15mm; }
          }
        `}} />

        {/* Gunakan print:overflow-visible dan print:max-h-none agar tabel tercetak utuh */}
        <div className="overflow-x-auto max-h-[65vh] print:overflow-visible print:max-h-none">
          <table className="w-full text-left border-collapse min-w-max print:border print:border-black">
            <thead className="sticky top-0 z-10 print:static">
              <tr style={{ backgroundColor: '#f1f5f9', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' } as any}>
                <th className="p-3 bg-slate-50 border-b border-slate-200 border-r text-[11px] font-extrabold text-slate-500 uppercase tracking-wider sticky left-0 z-20 min-w-[160px] max-w-[220px] print:static print:bg-transparent print:border print:border-black print:shadow-none print:text-black print:text-[10px] print:p-2 align-middle">
                  Relawan & Divisi
                </th>
                {dateColumns.map(col => (
                  <th key={col.dateStr} className="p-1 bg-slate-50 border-b border-slate-200 border-r text-[11px] font-extrabold text-slate-500 text-center min-w-[28px] w-[28px] print:bg-transparent print:border print:border-black print:text-black print:text-[9px] align-middle">
                    {col.label}
                  </th>
                ))}
                <th className="p-3 bg-slate-100 border-b border-slate-200 text-[11px] font-extrabold text-slate-700 uppercase tracking-wider text-center w-[60px] sticky right-0 z-20 print:static print:bg-transparent print:border print:border-black print:shadow-none print:text-black print:text-[10px] print:p-2 align-middle">
                  Total<br/>Hadir
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 print:divide-none">
              {dataMatrix.length === 0 && !loading ? (
                <tr>
                  <td colSpan={dateColumns.length + 2} className="p-8 text-center text-slate-400 text-[13px] font-medium print:border print:border-black print:text-black">
                    Tidak ada relawan yang ditemukan di divisi/periode ini.
                  </td>
                </tr>
              ) : (
                dataMatrix.map((row) => {
                  let totalHadir = 0
                  
                  return (
                    <tr key={row.id} className="hover:bg-slate-50/50 transition-colors group print:break-inside-avoid">
                      <td className="p-3 bg-white border-r border-slate-200 sticky left-0 z-10 min-w-[160px] max-w-[220px] print:static print:border print:border-black print:shadow-none print:p-2 align-middle print:bg-transparent">
                        <div className="text-[12px] font-extrabold text-slate-800 truncate print:whitespace-normal print:text-black print:text-[11px]" title={row.nama}>{row.nama}</div>
                        <div className="text-[10px] font-bold text-slate-400 mt-0.5 truncate print:text-gray-600 print:text-[9px]" title={row.divisi}>{row.divisi}</div>
                      </td>
                      
                      {dateColumns.map(col => {
                        const status = row.attendance[col.dateStr]
                        if (status === "Hadir") totalHadir++
                        return (
                          <td key={col.dateStr} className="p-0.5 border-r border-slate-100 text-center align-middle print:border print:border-black print:bg-transparent">
                            {renderStatus(status)}
                          </td>
                        )
                      })}
                      
                      <td className="p-3 bg-slate-50/50 text-[13px] font-extrabold text-emerald-600 text-center sticky right-0 z-10 border-l border-slate-200 print:static print:bg-transparent print:text-black print:border print:border-black print:shadow-none print:text-[11px] align-middle">
                        {totalHadir}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bagian Tanda Tangan Khusus Print (Format Resmi) */}
      <div className="hidden print:block mt-10 text-[11px] text-black page-break-inside-avoid">
        <div className="flex justify-end pr-12">
          <div className="text-center w-52">
            <p className="mb-1">Trangkil, {formatId(new Date().toISOString())}</p>
            <p className="font-bold mb-16">Mengetahui,<br/>Admin SPPG Trangkil</p>
            <div className="border-b border-black w-48 mx-auto"></div>
            <p className="mt-1 font-semibold text-[10px]">( .................................................... )</p>
          </div>
        </div>
      </div>

      {/* Modal Popup Cetak PDF */}
      {showPrintModal && (
        <div className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 p-4 flex items-center justify-between text-white shrink-0">
              <h3 className="font-extrabold text-[14px]">Pengaturan Cetak Laporan</h3>
              <button onClick={() => setShowPrintModal(false)} className="text-slate-400 hover:text-white transition"><X size={20} /></button>
            </div>
            
            <div className="p-5 space-y-4">
              <p className="text-[12px] text-slate-500 font-medium leading-relaxed">
                Sesuaikan periode dan divisi di bawah ini, laporan yang dicetak akan mengikuti pilihan Anda.
              </p>
              
              <div className="space-y-3">
                <div className="flex flex-col">
                  <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Periode Cetak</label>
                  {renderPeriodSelectors()}
                </div>
                
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1 mt-2">Pilih Divisi</label>
                  <select 
                    value={selectedDivisi} 
                    onChange={(e) => setSelectedDivisi(e.target.value)}
                    className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-lg text-[12px] font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="all">Semua Divisi</option>
                    {divisiList.map(d => <option key={d.id} value={d.id}>{d.nama_divisi}</option>)}
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setShowPrintModal(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[12px] font-bold transition">Tutup</button>
                <button 
                  type="button" 
                  onClick={handlePrintClick} 
                  disabled={loading}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[12px] font-bold transition shadow-md inline-flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Printer size={14} /> Buka & Cetak PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
