const fs = require('fs');
const path = 'src/app/admin/pengaturan-libur/PengaturanLiburClient.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add edit function and import
if (!content.includes('Edit2')) {
    content = content.replace('Calendar, Trash2, Plus, CalendarOff, Users, CheckSquare, Square, X',
                              'Calendar, Trash2, Plus, CalendarOff, Users, CheckSquare, Square, X, Edit2');
}

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

content = content.replace('  const handleDelete = async (id: number) => {', editFunc);

// Carefully replace the delete button
const oldBtn = `<button 
                    onClick={() => handleDelete(item.id)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>`;

const newBtn = `<div className="flex items-center gap-1 shrink-0">
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

// normalize
const n = str => str.replace(/\\r\\n/g, '\\n').replace(/\\s+/g, ' ').trim();
const oldBtnRegex = new RegExp('<button\\\\s+onClick=\\{\\(\\) => handleDelete\\(item\\.id\\)\\}\\\\s+className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition shrink-0"\\\\s*>\\\\s*<Trash2 size=\\{16\\} />\\\\s*</button>');

let replaced = false;
if (content.includes(oldBtn)) {
    content = content.replace(oldBtn, newBtn);
    replaced = true;
} else if (content.includes(oldBtn.replace(/\\n/g, '\\r\\n'))) {
    content = content.replace(oldBtn.replace(/\\n/g, '\\r\\n'), newBtn);
    replaced = true;
} else if (oldBtnRegex.test(content)) {
    content = content.replace(oldBtnRegex, newBtn);
    replaced = true;
} else {
    // manual search and replace
    const lines = content.split('\\n');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('onClick={() => handleDelete(item.id)}')) {
            lines[i-1] = '<div className="flex items-center gap-1 shrink-0">';
            lines[i] = '  <button onClick={(e) => { e.stopPropagation(); handleEdit(item); }} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-blue-50 hover:text-blue-500 transition" title="Edit"><Edit2 size={16} /></button>';
            lines[i+1] = '  <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition" title="Hapus"><Trash2 size={16} /></button>';
            lines[i+2] = '</div>';
            lines[i+3] = '';
            content = lines.join('\\n');
            replaced = true;
            break;
        }
    }
}

fs.writeFileSync(path, content, 'utf8');
if(replaced) console.log("Success");
else console.log("Failed to replace");
