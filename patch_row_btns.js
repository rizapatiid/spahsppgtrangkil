const fs = require('fs');
const path = 'src/app/admin/pengaturan-libur/PengaturanLiburClient.tsx';
let content = fs.readFileSync(path, 'utf8');

// Ensure Eye icon is imported
if (!content.includes('Eye')) {
    content = content.replace('import { Calendar, Trash2, Plus, CalendarOff, Users, CheckSquare, Square, X, Edit2 }',
                              'import { Calendar, Trash2, Plus, CalendarOff, Users, CheckSquare, Square, X, Edit2, Eye }');
}

// 1. Remove onClick and cursor-pointer from the row
const rowStartRegex = /<div className="flex items-start gap-4 cursor-pointer group" onClick=\{\(\) => setDetailItem\(item\)\}>/g;
content = content.replace(rowStartRegex, '<div className="flex items-start gap-4">');

// 2. Replace the action buttons
const oldBtnsRegex = /<div className="flex items-center gap-1 shrink-0">[\s\S]*?<button[\s\S]*?onClick=\{\(e\) => \{ e\.stopPropagation\(\); handleEdit\(item\); \}\}[\s\S]*?>[\s\S]*?<Edit2 size=\{16\} \/>[\s\S]*?<\/button>[\s\S]*?<button[\s\S]*?onClick=\{\(e\) => \{ e\.stopPropagation\(\); handleDelete\(item\.id\); \}\}[\s\S]*?>[\s\S]*?<Trash2 size=\{16\} \/>[\s\S]*?<\/button>[\s\S]*?<\/div>/;
const newActionButtons = `<div className="flex flex-wrap items-center gap-1.5 shrink-0 ml-3">
                  <button 
                    onClick={() => setDetailItem(item)}
                    className="inline-flex items-center justify-center gap-1.5 text-[11px] sm:text-[12px] bg-slate-900 text-white hover:bg-slate-800 transition-all px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg font-bold shadow-sm shrink-0 cursor-pointer"
                  >
                    <Eye size={13} strokeWidth={2.5} />
                    <span className="hidden sm:inline">Detail</span>
                  </button>
                  <button 
                    onClick={() => handleEdit(item)}
                    className="inline-flex items-center justify-center gap-1.5 text-[11px] sm:text-[12px] bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 transition-all px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg font-bold shadow-sm shrink-0 cursor-pointer"
                  >
                    <Edit2 size={13} strokeWidth={2.5} />
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="inline-flex items-center justify-center gap-1.5 text-[11px] sm:text-[12px] bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 transition-all px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg font-bold shadow-sm shrink-0 cursor-pointer"
                  >
                    <Trash2 size={13} strokeWidth={2.5} />
                    <span className="hidden sm:inline">Hapus</span>
                  </button>
                </div>`;
if (oldBtnsRegex.test(content)) {
    content = content.replace(oldBtnsRegex, newActionButtons);
    console.log("Action buttons replaced");
} else {
    console.log("Action buttons not found");
}

fs.writeFileSync(path, content, 'utf8');
