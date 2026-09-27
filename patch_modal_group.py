import re

path = 'src/app/admin/pengaturan-libur/PengaturanLiburClient.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

old_modal = '''                <div className="space-y-1">
                  {detailItem.relawan?.map((r: any, idx: number) => (
                    <div key={idx} className="flex flex-col p-2.5 rounded-lg border border-slate-100 bg-slate-50">
                      <span className="font-bold text-[13px] text-slate-700">{r.anggota?.nama || "Unknown"}</span>
                      <span className="font-medium text-[11px] text-slate-500">{r.anggota?.divisi?.nama_divisi || "-"}</span>
                    </div>
                  ))}
                </div>'''

new_modal = '''                <div className="space-y-4">
                  {(() => {
                    const grouped = detailItem.relawan?.reduce((acc: any, curr: any) => {
                      const divName = curr.anggota?.divisi?.nama_divisi || "Tanpa Divisi";
                      if (!acc[divName]) acc[divName] = [];
                      acc[divName].push(curr.anggota?.nama || "Tanpa Nama");
                      return acc;
                    }, {});
                    
                    return grouped ? Object.entries(grouped).map(([divName, names]: any) => (
                      <div key={divName}>
                        <h4 className="text-[11px] font-extrabold text-blue-500 uppercase tracking-wider mb-2">{divName}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {names.map((name: string, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 p-2 rounded-lg border border-slate-100 bg-slate-50 hover:border-slate-200 transition">
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                              <span className="font-bold text-[13px] text-slate-700 truncate">{name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )) : null;
                  })()}
                </div>'''

# normalize line endings
old_modal2 = old_modal.replace('\n', '\r\n')
if old_modal in content:
    content = content.replace(old_modal, new_modal)
elif old_modal2 in content:
    content = content.replace(old_modal2, new_modal)
else:
    print("Could not find the target string")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
