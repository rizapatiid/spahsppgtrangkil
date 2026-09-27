import re

path = 'src/app/admin/pengaturan-libur/PengaturanLiburClient.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add detailItem state
content = content.replace('const [selectedRelawan, setSelectedRelawan] = useState<number[]>([])',
                          'const [selectedRelawan, setSelectedRelawan] = useState<number[]>([])\n  const [detailItem, setDetailItem] = useState<any>(null)')

# Add X icon to imports
content = content.replace('Calendar, Trash2, Plus, CalendarOff, Users, CheckSquare, Square',
                          'Calendar, Trash2, Plus, CalendarOff, Users, CheckSquare, Square, X')

# Make the list item clickable
old_item = '''                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 shrink-0 mt-1">
                      <CalendarOff size={18} />
                    </div>
                    <div>
                      <h3 className="text-[14px] font-bold text-slate-800">{formatTanggal(item.tanggal)}</h3>
                      <p className="text-[12px] font-medium text-slate-500 mt-0.5">{item.keterangan || "Libur Khusus"}</p>
                      <div className="mt-2 flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md w-fit">
                        <Users size={12} className="text-slate-400" />
                        <span className="text-[11px] font-bold text-slate-600">{item.relawan?.length || 0} Relawan Libur</span>
                      </div>
                    </div>
                  </div>'''

new_item = '''                  <div className="flex items-start gap-4 cursor-pointer group" onClick={() => setDetailItem(item)}>
                    <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 shrink-0 mt-1 group-hover:bg-rose-100 transition">
                      <CalendarOff size={18} />
                    </div>
                    <div>
                      <h3 className="text-[14px] font-bold text-slate-800 group-hover:text-blue-600 transition">{formatTanggal(item.tanggal)}</h3>
                      <p className="text-[12px] font-medium text-slate-500 mt-0.5">{item.keterangan || "Libur Khusus"}</p>
                      <div className="mt-2 flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md w-fit group-hover:bg-blue-50 transition">
                        <Users size={12} className="text-slate-400 group-hover:text-blue-500" />
                        <span className="text-[11px] font-bold text-slate-600 group-hover:text-blue-700">Lihat {item.relawan?.length || 0} Relawan Libur</span>
                      </div>
                    </div>
                  </div>'''

content = content.replace(old_item, new_item)

# Add Modal
modal_code = '''      {/* DETAIL MODAL */}
      {detailItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="font-extrabold text-slate-800 text-[15px]">Detail Relawan Libur</h3>
                <p className="text-xs font-medium text-slate-500 mt-0.5">{formatTanggal(detailItem.tanggal)}</p>
              </div>
              <button onClick={() => setDetailItem(null)} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 max-h-[60vh] overflow-y-auto space-y-4">
              {detailItem.relawan?.length === 0 ? (
                <p className="text-center text-slate-500 text-sm py-4 font-medium">Tidak ada relawan yang ditandai libur.</p>
              ) : (
                <div className="space-y-1">
                  {detailItem.relawan?.map((r: any, idx: number) => (
                    <div key={idx} className="flex flex-col p-2.5 rounded-lg border border-slate-100 bg-slate-50">
                      <span className="font-bold text-[13px] text-slate-700">{r.anggota?.nama || "Unknown"}</span>
                      <span className="font-medium text-[11px] text-slate-500">{r.anggota?.divisi?.nama_divisi || "-"}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50">
              <button 
                onClick={() => setDetailItem(null)}
                className="w-full py-2.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl text-[13px] font-bold text-slate-700 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}'''

content = content.replace('    </div>\n  )\n}', modal_code)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
