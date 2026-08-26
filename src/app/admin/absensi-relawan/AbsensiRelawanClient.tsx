"use client"

import { useState, useEffect } from "react"
import { CalendarDays, Filter, Check, Info, FileSpreadsheet, Printer, X } from "lucide-react"
import { fetchAbsensiMatrix } from "./actions"

export default function AbsensiRelawanClient({ divisiList }: { divisiList: any[] }) {
  const currentDate = new Date()
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  const [selectedDivisi, setSelectedDivisi] = useState<string>("all")
  
  const [dataMatrix, setDataMatrix] = useState<any[]>([])
  const [daysInMonth, setDaysInMonth] = useState<number>(31)
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
      const res = await fetchAbsensiMatrix(selectedMonth, selectedYear, divisiId)
      setDataMatrix(res.matrix)
      setDaysInMonth(res.daysInMonth)
      setLoading(false)
    }
    loadData()
  }, [selectedMonth, selectedYear, selectedDivisi])

  // Handle Print Queue
  useEffect(() => {
    if (!loading && printRequested) {
      setTimeout(() => window.print(), 300)
      setPrintRequested(false)
    }
  }, [loading, printRequested])

  const handlePrintClick = () => {
    setShowPrintModal(false)
    if (loading) {
      setPrintRequested(true)
    } else {
      setTimeout(() => window.print(), 300)
    }
  }

  const renderStatus = (status: string) => {
    switch (status) {
      case "Hadir":
        return <div className="mx-auto w-5 h-5 rounded-md bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-[12px] print:bg-transparent print:text-black print:border print:border-black"><Check size={14} strokeWidth={3} /></div>
      case "Sakit":
        return <div className="mx-auto w-5 h-5 rounded-md bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-[12px] print:bg-transparent print:text-black print:border print:border-black" title="Sakit">S</div>
      case "Izin":
        return <div className="mx-auto w-5 h-5 rounded-md bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-[12px] print:bg-transparent print:text-black print:border print:border-black" title="Izin">I</div>
      case "Alfa":
        return <div className="mx-auto w-5 h-5 rounded-md bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-[12px] print:bg-transparent print:text-black print:border print:border-black" title="Alfa">A</div>
      default:
        return <span className="text-slate-300 print:text-black">-</span>
    }
  }

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1)

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
            <p className="text-[11px] text-slate-500 font-medium truncate">Rekap kehadiran individu (Matriks Bulanan)</p>
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

      {/* Header Khusus Cetak/Print */}
      <div className="hidden print:block text-center mb-6">
        <h1 className="text-xl font-bold uppercase mb-1">Laporan Kehadiran Relawan</h1>
        <p className="text-sm font-semibold">Bulan: {months.find(m => m.value === selectedMonth)?.label} {selectedYear}</p>
        <p className="text-sm font-semibold">Divisi: {selectedDivisi === 'all' ? 'Semua Divisi' : divisiList.find(d => d.id === parseInt(selectedDivisi))?.nama_divisi}</p>
      </div>

      {/* Filter Section (Sembunyi saat print) */}
      <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 print:hidden">
        <div className="flex items-center gap-2 text-slate-400 shrink-0">
          <Filter size={14} className="sm:w-4 sm:h-4" />
          <span className="text-[11px] sm:text-[12px] font-bold uppercase tracking-wider">Filter:</span>
        </div>
        
        <div className="grid grid-cols-3 gap-2 flex-1 w-full">
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="w-full border border-slate-200 bg-slate-50 rounded-lg text-[11px] sm:text-[13px] font-bold text-slate-700 p-2 sm:p-2.5 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
          >
            {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>

          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="w-full border border-slate-200 bg-slate-50 rounded-lg text-[11px] sm:text-[13px] font-bold text-slate-700 p-2 sm:p-2.5 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>

          <select 
            value={selectedDivisi} 
            onChange={(e) => setSelectedDivisi(e.target.value)}
            className="w-full border border-slate-200 bg-slate-50 rounded-lg text-[11px] sm:text-[13px] font-bold text-slate-700 p-2 sm:p-2.5 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
          >
            <option value="all">Semua Divisi</option>
            {divisiList.map(d => <option key={d.id} value={d.id}>{d.nama_divisi}</option>)}
          </select>
        </div>
      </div>

      {/* Legenda (Tampil di print) */}
      <div className="flex flex-wrap items-center gap-3 px-1">
        <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider print:text-black">Keterangan:</span>
        <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center print:bg-transparent print:border print:border-black print:text-black"><Check size={10} strokeWidth={3}/></div> <span className="text-[11px] font-bold text-slate-600 print:text-black">Hadir</span></div>
        <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-amber-100 text-amber-600 flex items-center justify-center text-[10px] font-bold print:bg-transparent print:border print:border-black print:text-black">S</div> <span className="text-[11px] font-bold text-slate-600 print:text-black">Sakit</span></div>
        <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-purple-100 text-purple-600 flex items-center justify-center text-[10px] font-bold print:bg-transparent print:border print:border-black print:text-black">I</div> <span className="text-[11px] font-bold text-slate-600 print:text-black">Izin</span></div>
        <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-rose-100 text-rose-600 flex items-center justify-center text-[10px] font-bold print:bg-transparent print:border print:border-black print:text-black">A</div> <span className="text-[11px] font-bold text-slate-600 print:text-black">Alfa</span></div>
      </div>

      {/* Tabel Matriks */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden relative print:border-black print:rounded-none print:shadow-none">
        {loading && (
          <div className="absolute inset-0 z-20 bg-white/50 backdrop-blur-sm flex items-center justify-center print:hidden">
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-[12px] font-bold text-slate-600">Memuat Data...</span>
            </div>
          </div>
        )}

        {/* Gunakan print:overflow-visible dan print:max-h-none agar tabel tercetak utuh */}
        <div className="overflow-x-auto max-h-[65vh] print:overflow-visible print:max-h-none">
          <table className="w-full text-left border-collapse min-w-max print:border print:border-black">
            <thead className="sticky top-0 z-10 print:static">
              <tr>
                <th className="p-3 bg-slate-50 border-b border-slate-200 border-r text-[11px] font-extrabold text-slate-500 uppercase tracking-wider sticky left-0 z-20 shadow-[2px_0_5px_rgba(0,0,0,0.05)] min-w-[160px] max-w-[220px] print:static print:bg-transparent print:border-black print:shadow-none print:text-black">
                  Relawan & Divisi
                </th>
                {daysArray.map(day => (
                  <th key={day} className="p-2 bg-slate-50 border-b border-slate-200 border-r text-[11px] font-extrabold text-slate-500 text-center min-w-[32px] w-[32px] print:bg-transparent print:border-black print:text-black">
                    {day}
                  </th>
                ))}
                <th className="p-3 bg-slate-100 border-b border-slate-200 text-[11px] font-extrabold text-slate-700 uppercase tracking-wider text-center w-[60px] sticky right-0 z-20 shadow-[-2px_0_5px_rgba(0,0,0,0.02)] print:static print:bg-transparent print:border-black print:shadow-none print:text-black">
                  Total Hadir
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 print:divide-black">
              {dataMatrix.length === 0 && !loading ? (
                <tr>
                  <td colSpan={daysInMonth + 2} className="p-8 text-center text-slate-400 text-[13px] font-medium print:border-black">
                    Tidak ada relawan yang ditemukan di divisi ini.
                  </td>
                </tr>
              ) : (
                dataMatrix.map((row) => {
                  let totalHadir = 0
                  
                  return (
                    <tr key={row.id} className="hover:bg-slate-50/50 transition-colors group print:break-inside-avoid">
                      <td className="p-3 bg-white group-hover:bg-slate-50/50 border-r border-slate-200 sticky left-0 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.05)] min-w-[160px] max-w-[220px] print:static print:border-black print:shadow-none">
                        <div className="text-[12px] font-extrabold text-slate-800 truncate print:whitespace-normal print:text-black" title={row.nama}>{row.nama}</div>
                        <div className="text-[10px] font-bold text-slate-400 mt-0.5 truncate print:text-black" title={row.divisi}>{row.divisi}</div>
                      </td>
                      
                      {daysArray.map(day => {
                        const status = row.attendance[day]
                        if (status === "Hadir") totalHadir++
                        return (
                          <td key={day} className="p-1 border-r border-slate-100 text-center align-middle print:border-black">
                            {renderStatus(status)}
                          </td>
                        )
                      })}
                      
                      <td className="p-3 bg-slate-50/50 group-hover:bg-slate-100 text-[13px] font-extrabold text-emerald-600 text-center sticky right-0 z-10 shadow-[-2px_0_5px_rgba(0,0,0,0.02)] border-l border-slate-200 print:static print:bg-transparent print:text-black print:border-black print:shadow-none">
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

      {/* Modal Popup Cetak PDF */}
      {showPrintModal && (
        <div className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 p-4 flex items-center justify-between text-white shrink-0">
              <h3 className="font-extrabold text-[14px]">Cetak Laporan (PDF)</h3>
              <button onClick={() => setShowPrintModal(false)} className="text-slate-400 hover:text-white transition"><X size={20} /></button>
            </div>
            
            <div className="p-5 space-y-4">
              <p className="text-[12px] text-slate-500 font-medium">Pilih filter untuk laporan sebelum mencetaknya ke PDF.</p>
              
              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Bulan</label>
                <select 
                  value={selectedMonth} 
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-lg text-[13px] font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100"
                >
                  {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Tahun</label>
                <select 
                  value={selectedYear} 
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-lg text-[13px] font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100"
                >
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Divisi</label>
                <select 
                  value={selectedDivisi} 
                  onChange={(e) => setSelectedDivisi(e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-lg text-[13px] font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option value="all">Semua Divisi</option>
                  {divisiList.map(d => <option key={d.id} value={d.id}>{d.nama_divisi}</option>)}
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setShowPrintModal(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[12px] font-bold transition">Batal</button>
                <button 
                  type="button" 
                  onClick={handlePrintClick} 
                  disabled={loading}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[12px] font-bold transition shadow-md inline-flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Printer size={14} /> Cetak & Simpan PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

