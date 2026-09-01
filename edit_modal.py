
with open("src/app/admin/absensi/AbsensiClient.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Unpack fotos instead of foto
content = content.replace("const { foto } = selectedAbsen", "const { fotos } = selectedAbsen")

# 2. Replace the modal thumbnail logic
old_modal_thumb = """                {/* Foto & Ringkasan */}
                <div className="flex items-center gap-4">
                  {foto ? (
                    <div 
                      onClick={() => setPreviewFotoUrl(foto.url_foto)} 
                      className="relative group block w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0 shadow-sm cursor-zoom-in"
                    >
                      <img src={foto.url_foto} alt="Foto Absensi" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
                      </div>
                    </div>
                  ) : (
                    <div className="w-28 h-28 sm:w-32 sm:h-32 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center shrink-0 shadow-sm text-slate-350 font-medium italic text-[11px]">
                      Tidak ada foto bukti absensi.
                    </div>
                  )}"""

new_modal_thumb = """                {/* Foto & Ringkasan */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {fotos && fotos.length > 0 ? (
                    <div className="flex gap-3 shrink-0">
                      {fotos.map((f:any, idx:number) => (
                        <div 
                          key={idx}
                          onClick={() => setPreviewFotoUrl(f.url_foto)} 
                          className="relative group block w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm cursor-zoom-in"
                        >
                          <img src={f.url_foto} alt="Foto Absensi" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="w-28 h-28 sm:w-32 sm:h-32 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center shrink-0 shadow-sm text-slate-350 font-medium italic text-[11px] p-4 text-center">
                      Tidak ada foto bukti absensi.
                    </div>
                  )}"""

if old_modal_thumb in content:
    content = content.replace(old_modal_thumb, new_modal_thumb)
    print("Modal thumbnail replaced!")
else:
    print("Old modal thumb not found!")

with open("src/app/admin/absensi/AbsensiClient.tsx", "w", encoding="utf-8") as f:
    f.write(content)


