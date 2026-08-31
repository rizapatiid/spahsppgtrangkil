
import re

with open("src/app/dashboard/absensi/AbsensiClient.tsx", "r", encoding="utf-8") as f:
    content = f.read()

ui_old = """                {filePreview ? (
                  <div className="w-full relative group">
                    <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 mb-4 shadow-sm group-hover:ring-2 group-hover:ring-rose-100 transition-all">
                      <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    
                    {/* Actions when preview exists */}
                    <div className="flex gap-2 w-full max-w-xs mx-auto">
                      <label className="flex-1 cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg transition-all shadow-sm text-center font-bold text-xs">
                        Ganti (Kamera)
                        <input type="file" accept="image/*" capture="environment" className="hidden" multiple={maxPhotos > 1} onChange={(e) => handleFileChange(e, true)} />
                      </label>
                      <label className="flex-1 cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg transition-all shadow-sm text-center font-bold text-xs">
                        Ganti (Galeri)
                        <input type="file" accept="image/*" className="hidden" multiple={maxPhotos > 1} onChange={(e) => handleFileChange(e, false)} />
                      </label>
                    </div>
                  </div>
                ) : ("""

ui_new = """                {photos.length > 0 ? (
                  <div className="w-full relative group">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {photos.map((photo, idx) => (
                        <div key={idx} className="relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 shadow-sm transition-all group/photo">
                          <img src={photo.preview} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={() => removePhoto(idx)}
                            className="absolute top-2 right-2 bg-rose-500/90 hover:bg-rose-600 text-white p-1.5 rounded-full opacity-100 md:opacity-0 md:group-hover/photo:opacity-100 transition-opacity shadow-sm"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    {/* Actions when preview exists */}
                    {photos.length < maxPhotos && (
                      <div className="flex gap-2 w-full max-w-xs mx-auto mt-4">
                        <label className="flex-1 cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg transition-all shadow-sm text-center font-bold text-xs">
                          Tambah (Kamera)
                          <input type="file" accept="image/*" capture="environment" className="hidden" multiple={maxPhotos > 1} onChange={(e) => handleFileChange(e, true)} />
                        </label>
                        <label className="flex-1 cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg transition-all shadow-sm text-center font-bold text-xs">
                          Tambah (Galeri)
                          <input type="file" accept="image/*" className="hidden" multiple={maxPhotos > 1} onChange={(e) => handleFileChange(e, false)} />
                        </label>
                      </div>
                    )}
                  </div>
                ) : ("""

if ui_old in content:
    content = content.replace(ui_old, ui_new)
    print("Replaced UI.")
else:
    print("ui_old not found!")

with open("src/app/dashboard/absensi/AbsensiClient.tsx", "w", encoding="utf-8") as f:
    f.write(content)

