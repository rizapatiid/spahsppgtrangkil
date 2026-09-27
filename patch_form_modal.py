import re

path = 'src/app/admin/pengaturan-libur/PengaturanLiburClient.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# The current form starts with:
#       {showAddForm && (
#       <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-top-4 duration-300">
#         <h2 className="text-[15px] font-extrabold text-slate-800 mb-4 flex items-center gap-2">
#           <CalendarOff size={18} className="text-blue-500" />
#           Formulir Jadwal Libur Relawan
#         </h2>
#         
#         <form onSubmit={async (e) => { await handleAdd(e); setShowAddForm(false); }} className="space-y-5">

old_form_start = '''      {showAddForm && (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-top-4 duration-300">
        <h2 className="text-[15px] font-extrabold text-slate-800 mb-4 flex items-center gap-2">
          <CalendarOff size={18} className="text-blue-500" />
          Formulir Jadwal Libur Relawan
        </h2>
        
        <form onSubmit={async (e) => { await handleAdd(e); setShowAddForm(false); }} className="space-y-5">'''
old_form_start2 = old_form_start.replace('\n', '\r\n')

new_form_start = '''      {/* Form Tambah/Edit Modal */}
      {showAddForm && (
        <ModalPortal>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-5 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh]">
            <div className="bg-slate-900 p-4 sm:p-5 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0">
                  <CalendarOff size={16} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-[14px]">Formulir Jadwal Libur</h3>
                  <p className="text-slate-300 text-[11px] font-medium">Tambah atau edit jadwal libur relawan</p>
                </div>
              </div>
              <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                <X size={20} />
              </button>
            </div>
            
            <div className="overflow-y-auto bg-slate-50 flex-1">
              <form onSubmit={async (e) => { await handleAdd(e); setShowAddForm(false); }} className="p-5 space-y-5 bg-white m-4 rounded-xl border border-slate-100">'''

if old_form_start in content:
    content = content.replace(old_form_start, new_form_start)
elif old_form_start2 in content:
    content = content.replace(old_form_start2, new_form_start)


# Now fix the end of the form
old_form_end = '''          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setShowAddForm(false)} className="px-5 py-2.5 bg-slate-150 hover:bg-slate-200 text-slate-700 rounded-lg text-[13px] font-bold transition cursor-pointer">Batal</button>
            <button type="submit" disabled={loading} className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[13px] font-bold transition shadow-md cursor-pointer disabled:opacity-50">
              {loading ? "Menyimpan..." : "Simpan Jadwal"}
            </button>
          </div>
        </form>
      </div>
      )}'''
old_form_end2 = old_form_end.replace('\n', '\r\n')

new_form_end = '''              </form>
            </div>
            
            <div className="flex justify-end gap-3 p-4 border-t border-slate-100 bg-white shrink-0">
              <button type="button" onClick={() => setShowAddForm(false)} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[13px] font-bold transition cursor-pointer">Batal</button>
              <button type="button" onClick={(e) => {
                // Since the submit button is outside the form now (or we trigger form submit programmatically)
                // Wait, it's easier to keep the form buttons inside the form.
                // Let's modify new_form_end to keep the buttons inside the form at the bottom of the modal.
              }} className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[13px] font-bold transition shadow-md cursor-pointer disabled:opacity-50">Simpan</button>
            </div>
          </div>
        </div>
        </ModalPortal>
      )}'''
# Actually, I should just move the submit buttons into the sticky footer of the form. Let me rewrite old_form_end logic.

new_form_end_better = '''          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
            <button type="button" onClick={() => setShowAddForm(false)} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[13px] font-bold transition cursor-pointer">Batal</button>
            <button type="submit" disabled={loading} className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[13px] font-bold transition shadow-md cursor-pointer disabled:opacity-50">
              {loading ? "Menyimpan..." : "Simpan Jadwal"}
            </button>
          </div>
        </form>
        </div>
      </div>
      </div>
      </ModalPortal>
      )}'''

if old_form_end in content:
    content = content.replace(old_form_end, new_form_end_better)
elif old_form_end2 in content:
    content = content.replace(old_form_end2, new_form_end_better)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
