
import re

with open("src/app/admin/absensi/AbsensiClient.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update foto -> fotos find logic
old_foto_find = "const foto = fotoData.find(f => f.divisi_id === absen.divisi_id && new Date(f.tanggal).getTime() === new Date(absen.tanggal).getTime())"
new_foto_find = "const fotos = fotoData.filter(f => f.divisi_id === absen.divisi_id && new Date(f.tanggal).getTime() === new Date(absen.tanggal).getTime())"
content = content.replace(old_foto_find, new_foto_find)

# 2. Update state setting logic
content = content.replace("setSelectedAbsen({ ...absen, foto })", "setSelectedAbsen({ ...absen, fotos })")

# 3. Update list item thumbnails
old_thumb = """                        {/* Thumbnail */}
                        {foto ? (
                          <div 
                            className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm shrink-0 cursor-zoom-in relative group"
                            onClick={(e) => { e.stopPropagation(); setPreviewFotoUrl(foto.url_foto); }}
                          >
                            <img src={foto.url_foto} alt="Absensi" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
                            </div>
                          </div>
                        ) : ("""

new_thumb = """                        {/* Thumbnail */}
                        {fotos.length > 0 ? (
                          <div className="flex gap-2 shrink-0">
                            {fotos.map((f:any, idx:number) => (
                              <div 
                                key={idx}
                                className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm shrink-0 cursor-zoom-in relative group"
                                onClick={(e) => { e.stopPropagation(); setPreviewFotoUrl(f.url_foto); }}
                              >
                                <img src={f.url_foto} alt="Absensi" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : ("""
content = content.replace(old_thumb, new_thumb)

# 4. Modal Header Unpacking
content = content.replace("const { foto, detail } = selectedAbsen", "const { fotos, detail } = selectedAbsen")

# 5. Modal Body Thumbnail
old_modal_thumb = """                {/* Foto & Info Singkat */}
                <div className="flex items-center gap-4">
                  {foto ? (
                    <div 
                      onClick={() => setPreviewFotoUrl(foto.url_foto)} 
                      className="relative group block w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0 shadow-sm cursor-zoom-in"
                    >
                      <img src={foto.url_foto} alt="Foto Absensi" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
                      </div>
                    </div>
                  ) : ("""

new_modal_thumb = """                {/* Foto & Info Singkat */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {fotos && fotos.length > 0 ? (
                    <div className="flex gap-3 shrink-0">
                      {fotos.map((f:any, idx:number) => (
                        <div 
                          key={idx}
                          onClick={() => setPreviewFotoUrl(f.url_foto)} 
                          className="relative group block w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm cursor-zoom-in"
                        >
                          <img src={f.url_foto} alt="Foto Absensi" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : ("""
content = content.replace(old_modal_thumb, new_modal_thumb)

with open("src/app/admin/absensi/AbsensiClient.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("done edit_admin_absensi.py")

