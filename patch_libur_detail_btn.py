import re

path = 'src/app/admin/pengaturan-libur/PengaturanLiburClient.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Ensure Eye icon is imported
if 'Eye' not in content:
    content = content.replace('import { Calendar, Trash2, Plus, CalendarOff, Users, CheckSquare, Square, X, Edit2 }',
                              'import { Calendar, Trash2, Plus, CalendarOff, Users, CheckSquare, Square, X, Edit2, Eye }')

# 2. Patch list items to not be clickable on the row, and replace action buttons
old_row_start = '''<div className="flex items-start gap-4 cursor-pointer group" onClick={() => setDetailItem(item)}>
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
old_row_start2 = old_row_start.replace('\n', '\r\n')

new_row_start = '''<div className="flex items-start gap-4">
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

if old_row_start in content:
    content = content.replace(old_row_start, new_row_start)
elif old_row_start2 in content:
    content = content.replace(old_row_start2, new_row_start)


old_action_buttons = '''                  <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 ml-3">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleEdit(item); }}
                      title="Edit"
                      className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[12px] font-bold transition-colors cursor-pointer"
                    >
                      <Edit2 size={13} strokeWidth={2.5} />
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                      title="Hapus"
                      className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-[12px] font-bold transition-colors cursor-pointer"
                    >
                      <Trash2 size={13} strokeWidth={2.5} />
                      <span className="hidden sm:inline">Hapus</span>
                    </button>
                  </div>'''
old_action_buttons2 = old_action_buttons.replace('\n', '\r\n')

new_action_buttons = '''                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <button 
                      onClick={() => setDetailItem(item)}
                      className="inline-flex items-center justify-center gap-1.5 text-[11px] sm:text-[12px] bg-slate-900 text-white hover:bg-slate-800 transition-all px-3.5 py-2 rounded-lg font-bold shadow-sm shrink-0 cursor-pointer"
                    >
                      <Eye size={13} strokeWidth={2.5} />
                      Detail
                    </button>
                    <button 
                      onClick={() => handleEdit(item)}
                      className="inline-flex items-center justify-center gap-1.5 text-[11px] sm:text-[12px] bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 transition-all px-3.5 py-2 rounded-lg font-bold shadow-sm shrink-0 cursor-pointer"
                    >
                      <Edit2 size={13} strokeWidth={2.5} />
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="inline-flex items-center justify-center gap-1.5 text-[11px] sm:text-[12px] bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 transition-all px-3.5 py-2 rounded-lg font-bold shadow-sm shrink-0 cursor-pointer"
                    >
                      <Trash2 size={13} strokeWidth={2.5} />
                      Hapus
                    </button>
                  </div>'''

if old_action_buttons in content:
    content = content.replace(old_action_buttons, new_action_buttons)
elif old_action_buttons2 in content:
    content = content.replace(old_action_buttons2, new_action_buttons)


# 3. Patch Modal Header
old_modal_header = '''            <div className="bg-slate-900 p-4 sm:p-5 flex items-center justify-between text-white shrink-0">
              <div>
                <h3 className="font-extrabold text-[14px]">Detail Relawan Libur</h3>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">{formatTanggal(detailItem.tanggal)}</p>
              </div>
              <button onClick={() => setDetailItem(null)} className="text-slate-400 hover:text-white transition"><X size={20} /></button>
            </div>'''
old_modal_header2 = old_modal_header.replace('\n', '\r\n')

new_modal_header = '''            <div className="bg-slate-900 p-4 sm:p-5 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0">
                  <Users size={16} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-[14px]">Detail Relawan Libur</h3>
                  <p className="text-slate-300 text-[11px] font-medium">{formatTanggal(detailItem.tanggal)}</p>
                </div>
              </div>
              <button onClick={() => setDetailItem(null)} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                <X size={20} />
              </button>
            </div>'''

if old_modal_header in content:
    content = content.replace(old_modal_header, new_modal_header)
elif old_modal_header2 in content:
    content = content.replace(old_modal_header2, new_modal_header)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
