"use client"

import { Printer, ArrowLeft, Download } from "lucide-react"

export default function PrintTrigger({ backUrl }: { backUrl: string }) {
  return (
    <div className="fixed top-4 left-4 flex flex-wrap gap-2 print:hidden z-50">
      <button 
        onClick={() => window.location.href = backUrl}
        className="bg-slate-800 text-white px-3 py-2 sm:px-4 rounded-full shadow-lg hover:bg-slate-700 transition flex items-center gap-2 text-sm font-semibold"
        title="Kembali"
      >
        <ArrowLeft size={18} />
        <span className="hidden sm:inline">Kembali</span>
      </button>

      <button 
        onClick={() => window.print()}
        className="bg-blue-600 text-white px-3 py-2 sm:px-4 rounded-full shadow-lg hover:bg-blue-700 transition flex items-center gap-2 text-sm font-semibold"
        title="Download PDF"
      >
        <Download size={18} />
        <span className="hidden sm:inline">Simpan PDF</span>
      </button>
    </div>
  )
}

