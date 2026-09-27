import re

path = 'src/app/admin/pengaturan-libur/PengaturanLiburClient.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add showAddForm state
content = content.replace('const [loading, setLoading] = useState(false)',
                          'const [loading, setLoading] = useState(false)\n  const [showAddForm, setShowAddForm] = useState(false)')

# In handleEdit, set showAddForm to true so the form appears
handle_edit_old = '''    const ids = item.relawan?.map((r: any) => r.anggota_id) || [];
    setSelectedRelawan(ids);
    window.scrollTo({ top: 0, behavior: 'smooth' });'''
handle_edit_new = '''    const ids = item.relawan?.map((r: any) => r.anggota_id) || [];
    setSelectedRelawan(ids);
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });'''
content = content.replace(handle_edit_old, handle_edit_new)

# Modify the return statement
old_return = '''  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-[15px] font-extrabold text-slate-800 mb-4 flex items-center gap-2">
          <CalendarOff size={18} className="text-blue-500" />
          Atur Jadwal Libur Relawan
        </h2>
        
        <form onSubmit={handleAdd} className="space-y-5">'''

new_return = '''  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex items-center justify-between gap-3 mb-2 pb-4 border-b border-slate-200/80 px-1">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <CalendarOff size={18} strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <h2 className="text-[15px] sm:text-[16px] font-extrabold text-slate-800 tracking-tight truncate">Pengaturan Hari Libur</h2>
            <p className="text-[11px] text-slate-500 font-medium truncate">Atur jadwal libur per relawan pada tanggal tertentu.</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3 sm:px-4 py-2 rounded-lg text-[12px] font-bold shadow-sm transition-all shrink-0 cursor-pointer"
        >
          <Plus size={15} className={showAddForm ? "rotate-45 transition-transform" : "transition-transform"} />
          <span className="hidden sm:inline">{showAddForm ? "Tutup Form" : "Buat Jadwal Baru"}</span>
          <span className="sm:hidden">{showAddForm ? "Tutup" : "Buat"}</span>
        </button>
      </div>

      {showAddForm && (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-top-4 duration-300">
        <h2 className="text-[15px] font-extrabold text-slate-800 mb-4 flex items-center gap-2">
          <CalendarOff size={18} className="text-blue-500" />
          Formulir Jadwal Libur Relawan
        </h2>
        
        <form onSubmit={async (e) => { await handleAdd(e); setShowAddForm(false); }} className="space-y-5">'''

# Ensure line endings
old_return2 = old_return.replace('\n', '\r\n')
if old_return in content:
    content = content.replace(old_return, new_return)
elif old_return2 in content:
    content = content.replace(old_return2, new_return)
else:
    print("Warning: could not find return statement to patch")

# Ensure the form div is closed correctly
# The old form closed with `</form>\n      </div>`
# Wait, I need to add an extra `}` for the `{showAddForm && (` 
old_form_end = '''            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">'''

new_form_end = '''            </button>
          </div>
        </form>
      </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">'''

old_form_end2 = old_form_end.replace('\n', '\r\n')
if old_form_end in content:
    content = content.replace(old_form_end, new_form_end)
elif old_form_end2 in content:
    content = content.replace(old_form_end2, new_form_end)
else:
    print("Warning: could not find form end to patch")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
