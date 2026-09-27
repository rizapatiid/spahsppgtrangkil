import re

path = 'src/app/admin/pengaturan-libur/PengaturanLiburClient.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add createPortal and ModalPortal
if 'createPortal' not in content:
    content = content.replace('import { useState } from "react"',
                              'import { useState } from "react"\nimport { createPortal } from "react-dom"')

if 'ModalPortal' not in content:
    content = content.replace('export default function PengaturanLiburClient',
'''function ModalPortal({ children }: { children: React.ReactNode }) {
  if (typeof document === "undefined") return null
  return createPortal(children, document.body)
}

export default function PengaturanLiburClient''')

# 2. Patch Form Buttons
old_form_buttons = '''          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setTanggal("")
                setKeterangan("")
                setSelectedRelawan([])
              }}
              className="px-5 py-2.5 rounded-xl font-bold text-[13px] text-slate-500 hover:bg-slate-100 transition"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl font-bold text-[13px] bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition"
            >
              {loading ? "Menyimpan..." : "Simpan Jadwal Libur"}
            </button>
          </div>'''
old_form_buttons2 = old_form_buttons.replace('\n', '\r\n')

new_form_buttons = '''          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setTanggal("")
                setKeterangan("")
                setSelectedRelawan([])
                setShowAddForm(false)
              }}
              className="px-5 py-2.5 bg-slate-150 hover:bg-slate-200 text-slate-700 rounded-lg text-[13px] font-bold transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[13px] font-bold transition shadow-md cursor-pointer disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Simpan Jadwal Libur"}
            </button>
          </div>'''

if old_form_buttons in content:
    content = content.replace(old_form_buttons, new_form_buttons)
elif old_form_buttons2 in content:
    content = content.replace(old_form_buttons2, new_form_buttons)

# 3. Patch Edit and Trash buttons
old_action_buttons = '''                  <div className="flex items-center gap-1 shrink-0">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleEdit(item); }}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-blue-50 hover:text-blue-500 transition"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition"
                      title="Hapus"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>'''
old_action_buttons2 = old_action_buttons.replace('\n', '\r\n')

new_action_buttons = '''                  <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 ml-3">
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

if old_action_buttons in content:
    content = content.replace(old_action_buttons, new_action_buttons)
elif old_action_buttons2 in content:
    content = content.replace(old_action_buttons2, new_action_buttons)

# 4. Patch Modal
old_modal = '''      {/* DETAIL MODAL */}
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
            <div className="p-5 max-h-[60vh] overflow-y-auto space-y-4">'''
old_modal2 = old_modal.replace('\n', '\r\n')

new_modal = '''      {/* DETAIL MODAL */}
      {detailItem && (
        <ModalPortal>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 p-4 sm:p-5 flex items-center justify-between text-white shrink-0">
              <div>
                <h3 className="font-extrabold text-[14px]">Detail Relawan Libur</h3>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">{formatTanggal(detailItem.tanggal)}</p>
              </div>
              <button onClick={() => setDetailItem(null)} className="text-slate-400 hover:text-white transition"><X size={20} /></button>
            </div>
            <div className="p-5 max-h-[60vh] overflow-y-auto space-y-4 bg-white">'''

if old_modal in content:
    content = content.replace(old_modal, new_modal)
elif old_modal2 in content:
    content = content.replace(old_modal2, new_modal)

old_modal_end = '''            <div className="p-4 border-t border-slate-100 bg-slate-50">
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
old_modal_end2 = old_modal_end.replace('\n', '\r\n')

new_modal_end = '''            <div className="flex justify-end gap-3 p-4 border-t border-slate-100 bg-slate-50">
              <button 
                onClick={() => setDetailItem(null)}
                className="px-5 py-2.5 bg-slate-150 hover:bg-slate-200 text-slate-700 rounded-lg text-[13px] font-bold transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
        </ModalPortal>
      )}
    </div>
  )
}'''

if old_modal_end in content:
    content = content.replace(old_modal_end, new_modal_end)
elif old_modal_end2 in content:
    content = content.replace(old_modal_end2, new_modal_end)

# Also fix the background color of bg-slate-150 if it doesn't exist in tailwind, but it's used in RelawanClient! 
# Actually, tailwind doesn't have bg-slate-150. But RelawanClient uses it and it probably falls back or is defined in tailwind.config.ts. 
# Either way, let's keep it consistent.

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
