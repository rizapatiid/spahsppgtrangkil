'use client'

import { useState } from 'react'
import { Megaphone, Clock, X, ChevronRight } from 'lucide-react'
import { Arahan } from '@prisma/client'

type DivisiOption = { id: number; nama_divisi: string }
type ArahanWithDivisi = Arahan & { divisi?: DivisiOption | null }

export default function ArahanDashboardClient({ arahanList, divisiName }: { arahanList: ArahanWithDivisi[], divisiName?: string }) {
  const [viewItem, setViewItem] = useState<ArahanWithDivisi | null>(null)

  if (arahanList.length === 0) return null

  return (
    <>
      <div className="bg-white rounded-2xl border border-blue-100 shadow-sm shadow-blue-50/50 p-4 sm:p-5 relative overflow-hidden mb-5 transition-all hover:shadow-md">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-10 -mt-10 opacity-60"></div>
        <div className="relative z-10 flex items-start gap-3 sm:gap-4 mb-4">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <Megaphone size={20} strokeWidth={2.5} />
          </div>
          <div className="flex-1 w-full pt-0.5">
            <h3 className="font-extrabold text-slate-800 text-[15px] sm:text-[16px] mb-0.5 flex flex-wrap items-center gap-2">
              Pengumuman & Arahan 
            </h3>
            <p className="text-[12px] sm:text-[13px] text-slate-500">Pesan dan instruksi terbaru untuk divisi Anda</p>
          </div>
        </div>
        
        <div className="relative z-10 space-y-3 w-full">
          {arahanList.slice(0, 2).map((arahan, index) => (
            <div 
              key={arahan.id} 
              onClick={() => setViewItem(arahan)}
              className="relative bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-3.5 sm:p-4 cursor-pointer transition-all flex items-center gap-3 sm:gap-4 group shadow-sm hover:shadow w-full overflow-hidden"
            >
              {((new Date().getTime() - new Date(arahan.created_at).getTime()) < 24 * 60 * 60 * 1000) && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl tracking-widest shadow-sm z-10">
                  BARU
                </div>
              )}

              {arahan.image_url && (
                <div className="shrink-0 relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                  <img src={arahan.image_url} alt="Lampiran" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="flex-1 min-w-0 z-10">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <h4 className="font-extrabold text-slate-800 text-[13px] sm:text-[14px] truncate group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                    {arahan.judul}
                  </h4>
                  {arahan.divisi_id === null ? (
                    <span className="shrink-0 bg-purple-50 text-purple-600 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border border-purple-100">
                      Semua Divisi
                    </span>
                  ) : (
                    <span className="shrink-0 bg-blue-50 text-blue-600 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border border-blue-100">
                      {divisiName || 'Divisi Anda'}
                    </span>
                  )}
                </div>
                <p className="text-slate-500 text-[12px] truncate">{arahan.isi}</p>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium mt-2">
                  <Clock size={11} />
                  {new Date(arahan.created_at).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'})} WIB
                </div>
              </div>

              <div className="shrink-0 text-slate-300 group-hover:text-blue-500 transition-colors ml-1 z-10">
                <ChevronRight size={18} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      {viewItem && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 max-h-[90vh]">
            <div className="bg-slate-900 p-4 sm:p-5 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-2">
                <Megaphone size={18} className="text-blue-400" />
                <h3 className="font-extrabold text-[14px]">Detail Arahan</h3>
              </div>
              <button 
                onClick={() => setViewItem(null)}
                className="text-slate-400 hover:text-white transition"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-5 sm:p-6 overflow-y-auto bg-white">
              <div className="mb-4">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight mb-2">
                  {viewItem.judul}
                </h2>
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    !viewItem.divisi_id ? 'bg-purple-50 text-purple-600 border border-purple-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                  }`}>
                    {!viewItem.divisi_id ? 'Semua Divisi' : (divisiName || 'Divisi Anda')}
                  </span>
                  <span className="flex items-center gap-1.5 text-[12px] text-slate-500 font-medium">
                    <Clock size={13} />
                    {new Date(viewItem.created_at).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'})} WIB
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <p className="text-[14px] sm:text-[15px] text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {viewItem.isi}
                </p>
              </div>

              {viewItem.image_url && (
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Lampiran Gambar:
                  </span>
                  <img 
                    src={viewItem.image_url} 
                    alt="Lampiran Detail" 
                    className="w-full h-auto max-h-[350px] object-cover rounded-xl border border-slate-200" 
                  />
                </div>
              )}
            </div>
            
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button 
                onClick={() => setViewItem(null)}
                className="px-5 py-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-lg text-[13px] font-bold shadow-sm transition-all hover:bg-slate-50"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
