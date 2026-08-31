
import re

with open("src/app/admin/inputabsensi/InputAbsensiClient.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. State changes
state_old = """  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const router = useRouter()"""

state_new = """  type PhotoItem = { file: File, preview: string, name: string }
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  
  const router = useRouter()"""

content = content.replace(state_old, state_new)

# 2. Add maxPhotos calculation after selectedDivisi
max_photos_insert_pos = content.find("const selectedDivisiName = divisiList.find(d => d.id === selectedDivisi)?.nama_divisi || \"\"")
if max_photos_insert_pos != -1:
    old_selected_div = "const selectedDivisiName = divisiList.find(d => d.id === selectedDivisi)?.nama_divisi || \"\""
    new_selected_div = old_selected_div + "\n  const isDriver = selectedDivisiName.toLowerCase().includes(\"driver\")\n  const maxPhotos = isDriver ? 2 : 1"
    content = content.replace(old_selected_div, new_selected_div)

# 3. Handle File Change
handle_old = """  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setFilePreview(URL.createObjectURL(file))
    }
  }"""

handle_new = """  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    
    if (photos.length + files.length > maxPhotos) {
      alert(`Maksimal ${maxPhotos} foto diperbolehkan untuk divisi ini!`)
      return
    }

    const newPhotos = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }))
    
    setPhotos(prev => [...prev, ...newPhotos])
    e.target.value = ""
  }

  function removePhoto(index: number) {
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }"""

content = content.replace(handle_old, handle_new)

# 4. Handle form submit
submit_old = """      if (selectedFile) {
        const compressed = await handleCompress(selectedFile)
        formData.set("foto", compressed, selectedFile.name)
      }"""

submit_new = """      formData.delete("foto")
      for (const photo of photos) {
        const compressed = await handleCompress(photo.file)
        formData.append("foto", compressed, photo.name)
      }"""

content = content.replace(submit_old, submit_new)

# 5. Handle success reset
success_old = """      setSelectedFile(null)
      setFilePreview(null)"""

success_new = """      setPhotos([])"""
content = content.replace(success_old, success_new)

with open("src/app/admin/inputabsensi/InputAbsensiClient.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Done")

