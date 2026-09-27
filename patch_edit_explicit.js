const fs = require('fs');
const path = 'src/app/admin/pengaturan-libur/PengaturanLiburClient.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add Edit icon to imports
if (!content.includes('Edit2')) {
    content = content.replace('Calendar, Trash2, Plus, CalendarOff, Users, CheckSquare, Square, X',
                              'Calendar, Trash2, Plus, CalendarOff, Users, CheckSquare, Square, X, Edit2');
}

// 2. Add handleEdit function
const editFunc = `  const handleEdit = (item: any) => {
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

  const handleDelete = async (id: number) => {`;

if (!content.includes('const handleEdit =')) {
    content = content.replace('  const handleDelete = async (id: number) => {', editFunc);
}

// 3. Replace the delete button
const newButtons = `<div className="flex items-center gap-1 shrink-0">
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
                  </div>`;

const targetRegex = /<button[\s\n\r]*onClick=\{\(\) => handleDelete\(item\.id\)\}[\s\n\r]*className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition shrink-0"[\s\n\r]*>[\s\n\r]*<Trash2 size=\{16\} \/>[\s\n\r]*<\/button>/;

content = content.replace(targetRegex, newButtons);

fs.writeFileSync(path, content, 'utf8');
