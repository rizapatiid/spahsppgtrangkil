
import re

with open("src/app/dashboard/absensi/AbsensiClient.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Replace state
state_old = """  const [fileName, setFileName] = useState("")
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const router = useRouter()

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isFromCamera, setIsFromCamera] = useState(false)"""

state_new = """  const [fileName, setFileName] = useState("")
  const router = useRouter()

  type PhotoItem = { file: File, preview: string, isFromCamera: boolean, name: string }
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  
  const isDriver = divisiName.toLowerCase().includes("driver")
  const maxPhotos = isDriver ? 2 : 1"""

content = content.replace(state_old, state_new)

# 2. Replace handleFileChange
handle_old = """  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>, fromCamera: boolean) {
    const file = e.target.files?.[0]
    if (file) {
      setIsFromCamera(fromCamera)
      setSelectedFile(file)
      if (fromCamera) {
        const watermarked = await addWatermark(file, divisiName)
        setFilePreview(URL.createObjectURL(watermarked))
      } else {
        setFilePreview(URL.createObjectURL(file))
      }
    }
  }"""

handle_new = """  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>, fromCamera: boolean) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    
    if (photos.length + files.length > maxPhotos) {
      setMessage({ text: `Maksimal ${maxPhotos} foto diperbolehkan!`, type: "error" })
      return
    }

    const newPhotos = []
    for (const file of files) {
      let preview = ""
      let finalFile = file
      if (fromCamera) {
        finalFile = await addWatermark(file, divisiName)
        preview = URL.createObjectURL(finalFile)
      } else {
        preview = URL.createObjectURL(file)
      }
      newPhotos.push({ file: finalFile, preview, isFromCamera: fromCamera, name: file.name })
    }
    
    setPhotos(prev => [...prev, ...newPhotos])
    // clear input so same file can be selected again if needed
    e.target.value = ""
  }
  
  function removePhoto(index: number) {
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }"""

content = content.replace(handle_old, handle_new)

# 3. Replace onSubmit
submit_old = """  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!selectedFile) {
      setMessage({ text: "Harap lampirkan foto bukti atau foto briefing!", type: "error" })
      return
    }

    setLoading(true)
    setMessage({ text: "", type: "" })

    const form = e.currentTarget
    const formData = new FormData(form)

    // Kompresi & Watermark foto (HANYA jika dari kamera)
    let processedFile = selectedFile
    if (isFromCamera) {
      processedFile = await addWatermark(processedFile, divisiName)
    }
    const compressedFoto = await handleCompress(processedFile)
    
    // Set file ke form data
    formData.set("foto", compressedFoto, selectedFile.name)

    const res = await submitAbsensi(formData)

    if (res.error) {
      setMessage({ text: res.error, type: "error" })
    } else {
      setMessage({ text: "Absensi berhasil disimpan!", type: "success" })
      setSelectedFile(null)
      setFilePreview(null)
      form.reset()
      router.refresh()
    }
    setLoading(false)
  }"""

submit_new = """  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (photos.length === 0) {
      setMessage({ text: "Harap lampirkan foto bukti atau foto briefing!", type: "error" })
      return
    }

    setLoading(true)
    setMessage({ text: "", type: "" })

    const form = e.currentTarget
    const formData = new FormData(form)
    
    // Hapus foto default jika ada
    formData.delete("foto")

    // Compress & append each photo
    for (const photo of photos) {
      let processedFile = photo.file
      // If we already watermarked it in handleFileChange, we only need to compress
      const compressedFoto = await handleCompress(processedFile)
      formData.append("foto", compressedFoto, photo.name)
    }

    const res = await submitAbsensi(formData)

    if (res.error) {
      setMessage({ text: res.error, type: "error" })
    } else {
      setMessage({ text: "Absensi berhasil disimpan!", type: "success" })
      setPhotos([])
      form.reset()
      router.refresh()
    }
    setLoading(false)
  }"""

content = content.replace(submit_old, submit_new)

# 4. Update the UI for photos
ui_old = """              <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5 w-full flex flex-col items-center justify-center text-center">
                {filePreview ? (
                  <div className="w-full relative group">
                    <img 
                      src={filePreview} 
                      alt="Preview" 
                      className="w-full max-w-sm mx-auto h-auto rounded-xl shadow-sm border border-slate-200"
                    />
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all rounded-xl flex flex-col items-center justify-center max-w-sm mx-auto gap-3">
                      <p className="text-white text-sm font-bold">Ganti Foto?</p>
                      <div className="flex gap-2">
                        <label className="cursor-pointer bg-white text-slate-800 hover:bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm">
                          Kamera
                          <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleFileChange(e, true)} />
                        </label>
                        <label className="cursor-pointer bg-white text-slate-800 hover:bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm">
                          Galeri
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, false)} />
                        </label>
                      </div>
                    </div>
                  </div>
                ) : ("""

ui_new = """              <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5 w-full flex flex-col items-center justify-center text-center">
                {photos.length > 0 ? (
                  <div className="w-full flex flex-col items-center gap-4">
                    <div className="flex flex-wrap gap-4 justify-center">
                      {photos.map((photo, idx) => (
                        <div key={idx} className="relative group max-w-[200px]">
                          <img 
                            src={photo.preview} 
                            alt={`Preview ${idx}`} 
                            className="w-full h-auto rounded-xl shadow-sm border border-slate-200"
                          />
                          <button 
                            type="button"
                            onClick={() => removePhoto(idx)}
                            className="absolute -top-2 -right-2 bg-rose-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-rose-600"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                          </button>
                        </div>
                      ))}
                    </div>
                    {photos.length < maxPhotos && (
                      <div className="flex gap-2 mt-2">
                        <label className="cursor-pointer bg-white text-slate-800 hover:bg-slate-100 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm border border-slate-200 flex items-center gap-1.5">
                          <Camera size={14} /> Tambah via Kamera
                          <input type="file" accept="image/*" capture="environment" className="hidden" multiple={maxPhotos > 1} onChange={(e) => handleFileChange(e, true)} />
                        </label>
                        <label className="cursor-pointer bg-white text-slate-800 hover:bg-slate-100 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm border border-slate-200 flex items-center gap-1.5">
                          <UploadCloud size={14} /> Tambah via Galeri
                          <input type="file" accept="image/*" className="hidden" multiple={maxPhotos > 1} onChange={(e) => handleFileChange(e, false)} />
                        </label>
                      </div>
                    )}
                  </div>
                ) : ("""

content = content.replace(ui_old, ui_new)

# Add `multiple={maxPhotos > 1}` to empty state file inputs
empty_input_cam_old = """<input 
                          type="file" 
                          accept="image/*" 
                          capture="environment" 
                          className="hidden" 
                          onChange={(e) => handleFileChange(e, true)}
                        />"""

empty_input_cam_new = """<input 
                          type="file" 
                          accept="image/*" 
                          capture="environment" 
                          className="hidden" 
                          multiple={maxPhotos > 1}
                          onChange={(e) => handleFileChange(e, true)}
                        />"""

content = content.replace(empty_input_cam_old, empty_input_cam_new)

empty_input_gal_old = """<input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => handleFileChange(e, false)}
                        />"""

empty_input_gal_new = """<input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          multiple={maxPhotos > 1}
                          onChange={(e) => handleFileChange(e, false)}
                        />"""

content = content.replace(empty_input_gal_old, empty_input_gal_new)

with open("src/app/dashboard/absensi/AbsensiClient.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("done")

