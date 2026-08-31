
import re

with open("src/app/admin/inputabsensi/InputAbsensiClient.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace existingFoto and newFoto states
state_old = """  const [existingFoto, setExistingFoto] = useState<any>(null)
  const [newFoto, setNewFoto] = useState<{file: File, preview: string} | null>(null)"""

state_new = """  const [existingFotos, setExistingFotos] = useState<any[]>([])
  const [newFotos, setNewFotos] = useState<{file: File, preview: string, name: string}[]>([])"""
content = content.replace(state_old, state_new)

# Handle maxPhotos
max_photos_pos = content.find("const selectedDivisiName = divisiList.find(d => d.id === parseInt(selectedDivisi))?.nama_divisi || \"\"")
if max_photos_pos != -1:
    pass # we can add it later, wait `selectedDivisi` is a string!
else:
    # let us add it inside the component body
    content = content.replace(
        "const [isLoading, setIsLoading] = useState(false)",
        "const [isLoading, setIsLoading] = useState(false)\n  const isDriver = divisiList.find(d => d.id.toString() === selectedDivisi)?.nama_divisi?.toLowerCase().includes(\"driver\")\n  const maxPhotos = isDriver ? 2 : 1"
    )

# update setExistingFoto in fetch
fetch_old = """      if (res.fotoBriefing) {
        setExistingFoto(res.fotoBriefing)
      }"""
fetch_new = """      if (res.fotoBriefingList) {
        setExistingFotos(res.fotoBriefingList)
      }"""
content = content.replace(fetch_old, fetch_new)

# handle file change
handle_file_old = """  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    setNewFoto({
      file,
      preview: URL.createObjectURL(file)
    })
    e.target.value = ""
  }

  const removeNewFoto = () => {
    if (newFoto) URL.revokeObjectURL(newFoto.preview)
    setNewFoto(null)
  }"""

handle_file_new = """  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    
    if (existingFotos.length + newFotos.length + files.length > maxPhotos) {
      setMessage({ type: "error", text: `Maksimal ${maxPhotos} foto diperbolehkan untuk divisi ini.` })
      return
    }

    const adding = files.map(f => ({ file: f, preview: URL.createObjectURL(f), name: f.name }))
    setNewFotos(prev => [...prev, ...adding])
    e.target.value = ""
  }

  const removeNewFoto = (idx: number) => {
    setNewFotos(prev => {
      const copy = [...prev]
      URL.revokeObjectURL(copy[idx].preview)
      copy.splice(idx, 1)
      return copy
    })
  }"""
content = content.replace(handle_file_old, handle_file_new)

# handle save form data
save_old = """    if (newFoto) {
      const compressed = await handleCompress(newFoto.file)
      formData.set("foto", compressed, newFoto.file.name)
    }"""
save_new = """    for (const nf of newFotos) {
      const compressed = await handleCompress(nf.file)
      formData.append("foto", compressed, nf.name)
    }"""
content = content.replace(save_old, save_new)

# handle delete existing
del_ext_old = """  const handleDeleteExisting = async () => {
    if (!existingFoto) return
    if (!confirm("Hapus foto yang sudah ada?")) return
    
    try {
      await deleteFotoAbsensiManual(existingFoto.id)
      setExistingFoto(null)
    } catch(e) {
      alert("Gagal menghapus")
    }
  }"""
del_ext_new = """  const handleDeleteExisting = async (id: string) => {
    if (!confirm("Hapus foto yang sudah ada?")) return
    try {
      await deleteFotoAbsensiManual(id)
      setExistingFotos(prev => prev.filter(f => f.id !== id))
    } catch(e) {
      alert("Gagal menghapus")
    }
  }"""
content = content.replace(del_ext_old, del_ext_new)

# handle clear photos on date/div change
clear_old = """    setExistingFoto(null)
    setNewFoto(null)"""
clear_new = """    setExistingFotos([])
    setNewFotos([])"""
content = content.replace(clear_old, clear_new)

# handle successful save
suc_save_old = """      setNewFoto(null)"""
suc_save_new = """      setNewFotos([])"""
content = content.replace(suc_save_old, suc_save_new)

# UI Replace
ui_old_code = """              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {existingFoto && (
                  <div className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-square">
                    <img src={existingFoto.url_foto} alt="Existing" className="w-full h-full object-cover" />
                    <button 
                      onClick={handleDeleteExisting}
                      className="absolute top-2 right-2 p-1.5 bg-white/90 text-red-500 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 shadow-sm"
                    >
                      <Trash2 size={14} />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1.5 text-[10px] text-white text-center">Tersimpan</div>
                  </div>
                )}
                
                {newFoto && (
                  <div className="relative group rounded-lg overflow-hidden border border-blue-200 aspect-square ring-2 ring-blue-100">
                    <img src={newFoto.preview} alt="New" className="w-full h-full object-cover" />
                    <button 
                      onClick={removeNewFoto}
                      className="absolute top-2 right-2 p-1.5 bg-white/90 text-slate-600 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 hover:bg-red-50 shadow-sm"
                    >
                      <X size={14} />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-blue-600/80 p-1.5 text-[10px] font-bold text-white text-center shadow-sm">Baru</div>
                  </div>
                )}
                
                {!newFoto && (
                  <label className="border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50 rounded-lg aspect-square flex flex-col items-center justify-center cursor-pointer transition-colors text-slate-400 hover:text-blue-500">
                    <Camera size={24} className="mb-2" />
                    <span className="text-[11px] font-bold text-center px-2">{existingFoto ? "Ganti Foto" : "Tambah Foto"}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>"""

ui_new_code = """              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {existingFotos.map((ef) => (
                  <div key={ef.id} className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-square">
                    <img src={ef.url_foto} alt="Existing" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => handleDeleteExisting(ef.id)}
                      className="absolute top-2 right-2 p-1.5 bg-white/90 text-red-500 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 shadow-sm"
                    >
                      <Trash2 size={14} />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1.5 text-[10px] text-white text-center">Tersimpan</div>
                  </div>
                ))}
                
                {newFotos.map((nf, idx) => (
                  <div key={idx} className="relative group rounded-lg overflow-hidden border border-blue-200 aspect-square ring-2 ring-blue-100">
                    <img src={nf.preview} alt="New" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => removeNewFoto(idx)}
                      className="absolute top-2 right-2 p-1.5 bg-white/90 text-slate-600 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 hover:bg-red-50 shadow-sm"
                    >
                      <X size={14} />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-blue-600/80 p-1.5 text-[10px] font-bold text-white text-center shadow-sm">Baru</div>
                  </div>
                ))}
                
                {(existingFotos.length + newFotos.length < maxPhotos) && (
                  <label className="border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50 rounded-lg aspect-square flex flex-col items-center justify-center cursor-pointer transition-colors text-slate-400 hover:text-blue-500">
                    <Camera size={24} className="mb-2" />
                    <span className="text-[11px] font-bold text-center px-2">Tambah Foto</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple={maxPhotos > 1}
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>"""
content = content.replace(ui_old_code, ui_new_code)

with open("src/app/admin/inputabsensi/InputAbsensiClient.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("done")

