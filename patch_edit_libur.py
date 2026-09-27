import re

path = 'src/app/admin/pengaturan-libur/PengaturanLiburClient.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add Edit icon to imports
content = content.replace('Calendar, Trash2, Plus, CalendarOff, Users, CheckSquare, Square, X',
                          'Calendar, Trash2, Plus, CalendarOff, Users, CheckSquare, Square, X, Edit2')

# 2. Add handleEdit function
handle_edit_code = '''  const handleEdit = (item: any) => {
    try {
      const dateStr = new Date(item.tanggal).toISOString().split('T')[0];
      setTanggal(dateStr);
    } catch(e) {
      if (typeof item.tanggal === 'string') {
        setTanggal(item.tanggal.split('T')[0]);
      }
    }
    setKeterangan(item.keterangan || "");
    const ids = item.relawan?.map((r: any) => r.anggota_id) || [];
    setSelectedRelawan(ids);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  const handleDelete = async (id: number) => {'''

content = content.replace('  const handleDelete = async (id: number) => {', handle_edit_code)

# 3. Add Edit button in the UI
old_buttons = '''                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>'''

# Wait, the previous code was:
old_buttons_2 = '''                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>'''

new_buttons = '''                  <div className="flex items-center gap-1 shrink-0">
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

# normalize line endings for replace
old_buttons_2_crlf = old_buttons_2.replace('\n', '\r\n')

if old_buttons_2 in content:
    content = content.replace(old_buttons_2, new_buttons)
elif old_buttons_2_crlf in content:
    content = content.replace(old_buttons_2_crlf, new_buttons)
else:
    print("WARNING: Could not find delete button to replace.")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
