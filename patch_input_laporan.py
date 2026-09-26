import os

def patch_file(path, old_str, new_str):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    if old_str in content:
        content = content.replace(old_str, new_str)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
            print(f"Patched {path}")
    else:
        print(f"Could not find old_str in {path}")

def insert_after(path, search, insert):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    if insert not in content and search in content:
        content = content.replace(search, search + "\n" + insert)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
            print(f"Inserted into {path}")

# Client patch
path = 'src/app/admin/inputlaporan/InputLaporanClient.tsx'
insert_after(path, 'import imageCompression from "browser-image-compression"', 'import UploadProgressBar from "@/components/UploadProgressBar"\nimport { uploadToCloudinaryClient } from "@/lib/clientUpload"')
insert_after(path, 'const [isSaving, setIsSaving] = useState(false)', '  const [isUploading, setIsUploading] = useState(false)\n  const [uploadProgress, setUploadProgress] = useState(0)')

old_save = '''      // Append fotos
      Object.keys(newFotos).forEach(catId => {
        newFotos[catId].forEach((item, idx) => {
          formData.append(`foto_${catId}_${idx}`, item.file)
          formData.append(`ket_${catId}_${idx}`, item.keterangan || "")
        })
      })
      
      const res = await saveLaporanManual(formData)'''

new_save = '''      // Upload fotos
      setIsUploading(true)
      setUploadProgress(0)
      const allFiles = []
      Object.keys(newFotos).forEach(catId => {
        newFotos[catId].forEach((item, idx) => {
          allFiles.push({ catId, idx, item })
        })
      })
      
      let uploadedCount = 0
      for (const fileObj of allFiles) {
        const compressed = await handleCompress(fileObj.item.file)
        const url = await uploadToCloudinaryClient(compressed, `sppg_trangkil/laporan_manual/${fileObj.catId}`, (p) => {
          setUploadProgress(Math.round(((uploadedCount * 100) + p) / allFiles.length))
        })
        formData.append(`foto_url_${fileObj.catId}_${fileObj.idx}`, url)
        formData.append(`ket_${fileObj.catId}_${fileObj.idx}`, fileObj.item.keterangan || "")
        uploadedCount++
      }
      setIsUploading(false)
      
      const res = await saveLaporanManual(formData)'''

patch_file(path, old_save, new_save)
insert_after(path, '<div className="max-w-5xl mx-auto space-y-6">', '      <UploadProgressBar progress={uploadProgress} isUploading={isUploading} />')

# Actions patch
path2 = 'src/app/admin/inputlaporan/actions.ts'

old_action = '''    // Process new photos
    const keys = Array.from(formData.keys())
    for (const key of keys) {
      if (key.startsWith("foto_")) {
        const file = formData.get(key) as File
        if (file && file.size > 0) {
          const suffix = key.replace("foto_", "") // e.g. "kegiatan_0"
          const parts = suffix.split("_")
          const counter = parts.pop() // "0"
          const tipe_foto = parts.join("_") // "kegiatan"
          
          const ketKey = `ket_${tipe_foto}_${counter}`
          const keterangan = (formData.get(ketKey) as string) || ""

          const bytes = await file.arrayBuffer()
          const buffer = Buffer.from(bytes)
          const url_foto = await uploadToCloudinary(buffer, `sppg_trangkil/laporan_manual/${tipe_foto}`)
          
          await prisma.fotoKegiatan.create({
            data: {
              tanggal: targetDate,
              url_foto,
              tipe_foto,
              catatan: keterangan ? { keterangan } : undefined,
              divisi_id: divisiId,
              laporan_id: laporan.id
            }
          })
        }
      }
    }'''
    
new_action = '''    // Process new photos
    const keys = Array.from(formData.keys())
    for (const key of keys) {
      if (key.startsWith("foto_url_")) {
        const url_foto = formData.get(key) as string
        if (url_foto) {
          const suffix = key.replace("foto_url_", "") // e.g. "kegiatan_0"
          const parts = suffix.split("_")
          const counter = parts.pop() // "0"
          const tipe_foto = parts.join("_") // "kegiatan"
          
          const ketKey = `ket_${tipe_foto}_${counter}`
          const keterangan = (formData.get(ketKey) as string) || ""
          
          await prisma.fotoKegiatan.create({
            data: {
              tanggal: targetDate,
              url_foto,
              tipe_foto,
              catatan: keterangan ? { keterangan } : undefined,
              divisi_id: divisiId,
              laporan_id: laporan.id
            }
          })
        }
      }
    }'''

patch_file(path2, old_action, new_action)
