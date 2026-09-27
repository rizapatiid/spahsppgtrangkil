const fs = require('fs');
const path = 'src/app/admin/pengaturan-libur/PengaturanLiburClient.tsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /<div className="pt-2">[\s\S]*?<button[\s\S]*?type="submit"[\s\S]*?>[\s\S]*?<Plus size=\{16\} \/> Simpan Jadwal Libur[\s\S]*?<\/button>[\s\S]*?<\/div>/;

const newBtns = `<div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setShowAddForm(false)} className="px-5 py-2.5 bg-slate-150 hover:bg-slate-200 text-slate-700 rounded-lg text-[13px] font-bold transition cursor-pointer">Batal</button>
            <button type="submit" disabled={loading} className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[13px] font-bold transition shadow-md cursor-pointer disabled:opacity-50">
              {loading ? "Menyimpan..." : "Simpan Jadwal"}
            </button>
          </div>`;

if (regex.test(content)) {
    content = content.replace(regex, newBtns);
    fs.writeFileSync(path, content, 'utf8');
    console.log("Success");
} else {
    console.log("Not found");
}
