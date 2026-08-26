"use client"

import { useState, useEffect } from "react"
import { CalendarDays, Filter, Check, Info, FileSpreadsheet } from "lucide-react"
import { fetchAbsensiMatrix } from "./actions"

export default function AbsensiRelawanClient({ divisiList }: { divisiList: any[] }) {
  const currentDate = new Date()
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  const [selectedDivisi, setSelectedDivisi] = useState<string>("all")
  
  const [dataMatrix, setDataMatrix] = useState<any[]>([])
  const [daysInMonth, setDaysInMonth] = useState<number>(31)
  const [loading, setLoading] = useState(true)

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

  const renderStatus = (status: string) => {
    switch (status) {
      case "Hadir":
        return <div className="mx-auto w-5 h-5 rounded-md bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-[12px]"><Check size={14} strokeWidth={3} /></div>
      case "Sakit":
        return <div className="mx-auto w-5 h-5 rounded-md bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-[12px]" title="Sakit">S</div>
      case "Izin":
        return <div className="mx-auto w-5 h-5 rounded-md bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-[12px]" title="Izin">I</div>
      case "Alfa":
        return <div className="mx-auto w-5 h-5 rounded-md bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-[12px]" title="Alfa">A</div>
      default:
        return <span className="text-slate-300">-</span>
    }
  }

  // Create array of days [1, 2, ..., daysInMonth]
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2 pb-4 border-b border-slate-200/80 px-1">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <FileSpreadsheet size={18} strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <h2 className="text-[15px] sm:text-[16px] font-extrabold text-slate-800 tracking-tight truncate">Laporan Kehadiran Relawan</h2>
            <p className="text-[11px] text-slate-500 font-medium truncate">Rekap kehadiran individu (Matriks Bulanan)</p>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
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

      {/* Legenda */}
      <div className="flex flex-wrap items-center gap-3 px-1">
        <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Keterangan:</span>
        <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center"><Check size={10} strokeWidth={3}/></div> <span className="text-[11px] font-bold text-slate-600">Hadir</span></div>
        <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-amber-100 text-amber-600 flex items-center justify-center text-[10px] font-bold">S</div> <span className="text-[11px] font-bold text-slate-600">Sakit</span></div>
        <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-purple-100 text-purple-600 flex items-center justify-center text-[10px] font-bold">I</div> <span className="text-[11px] font-bold text-slate-600">Izin</span></div>
        <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-rose-100 text-rose-600 flex items-center justify-center text-[10px] font-bold">A</div> <span className="text-[11px] font-bold text-slate-600">Alfa</span></div>
      </div>

      {/* Tabel Matriks */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 z-20 bg-white/50 backdrop-blur-sm flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-[12px] font-bold text-slate-600">Memuat Data...</span>
            </div>
          </div>
        )}

        <div className="overflow-x-auto max-h-[65vh]">
          <table className="w-full text-left border-collapse min-w-max">
            <thead className="sticky top-0 z-10">
              <tr>
                <th className="p-3 bg-slate-50 border-b border-slate-200 border-r text-[11px] font-extrabold text-slate-500 uppercase tracking-wider sticky left-0 z-20 shadow-[2px_0_5px_rgba(0,0,0,0.05)] min-w-[160px] max-w-[220px]">
                  Relawan & Divisi
                </th>
                {daysArray.map(day => (
                  <th key={day} className="p-2 bg-slate-50 border-b border-slate-200 border-r text-[11px] font-extrabold text-slate-500 text-center min-w-[32px] w-[32px]">
                    {day}
                  </th>
                ))}
                <th className="p-3 bg-slate-100 border-b border-slate-200 text-[11px] font-extrabold text-slate-700 uppercase tracking-wider text-center w-[60px] sticky right-0 z-20 shadow-[-2px_0_5px_rgba(0,0,0,0.02)]">
                  Total Hadir
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dataMatrix.length === 0 && !loading ? (
                <tr>
                  <td colSpan={daysInMonth + 2} className="p-8 text-center text-slate-400 text-[13px] font-medium">
                    Tidak ada relawan yang ditemukan di divisi ini.
                  </td>
                </tr>
              ) : (
                dataMatrix.map((row) => {
                  let totalHadir = 0
                  
                  return (
                    <tr key={row.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="p-3 bg-white group-hover:bg-slate-50/50 border-r border-slate-200 sticky left-0 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.05)] min-w-[160px] max-w-[220px]">
                        <div className="text-[12px] font-extrabold text-slate-800 truncate" title={row.nama}>{row.nama}</div>
                        <div className="text-[10px] font-bold text-slate-400 mt-0.5 truncate" title={row.divisi}>{row.divisi}</div>
                      </td>
                      
                      {daysArray.map(day => {
                        const status = row.attendance[day]
                        if (status === "Hadir") totalHadir++
                        return (
                          <td key={day} className="p-1 border-r border-slate-100 text-center align-middle">
                            {renderStatus(status)}
                          </td>
                        )
                      })}
                      
                      <td className="p-3 bg-slate-50/50 group-hover:bg-slate-100 text-[13px] font-extrabold text-emerald-600 text-center sticky right-0 z-10 shadow-[-2px_0_5px_rgba(0,0,0,0.02)] border-l border-slate-200">
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
    </div>
  )
}
