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

path = 'src/app/admin/inputabsensi/InputAbsensiClient.tsx'
insert_after(path, 'import imageCompression from "browser-image-compression"', 'import UploadProgressBar from "@/components/UploadProgressBar"\nimport { uploadToCloudinaryClient } from "@/lib/clientUpload"')

insert_after(path, 'const [isSaving, setIsSaving] = useState(false)', '  const [isUploading, setIsUploading] = useState(false)\n  const [uploadProgress, setUploadProgress] = useState(0)')

old_save = '''      for (const nf of newFotos) {
        formData.append("foto", nf.file)
      }
      
      const res = await saveAbsensiManual(formData)'''

new_save = '''      setIsUploading(true)
      setUploadProgress(0)
      let uploadedCount = 0
      for (const nf of newFotos) {
        const compressedFoto = await handleCompress(nf.file)
        const url = await uploadToCloudinaryClient(compressedFoto, "sppg_trangkil/absensi", (p) => {
          setUploadProgress(Math.round(((uploadedCount * 100) + p) / newFotos.length))
        })
        formData.append("foto_urls", url)
        uploadedCount++
      }
      setIsUploading(false)
      
      const res = await saveAbsensiManual(formData)'''

patch_file(path, old_save, new_save)
insert_after(path, '<div className="max-w-4xl mx-auto space-y-6">', '      <UploadProgressBar progress={uploadProgress} isUploading={isUploading} />')
