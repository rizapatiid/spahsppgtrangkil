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

# 1. AbsensiClient
path = 'src/app/dashboard/absensi/AbsensiClient.tsx'
insert_after(path, 'import { Camera', 'import UploadProgressBar from "@/components/UploadProgressBar"\nimport { uploadToCloudinaryClient } from "@/lib/clientUpload"')
insert_after(path, 'const [fileName, setFileName] = useState("")', '  const [isUploading, setIsUploading] = useState(false)\n  const [uploadProgress, setUploadProgress] = useState(0)')

old_submit = '''    // Compress & append each photo
    for (const photo of photos) {
      let processedFile = photo.file
      // If we already watermarked it in handleFileChange, we only need to compress
      const compressedFoto = await handleCompress(processedFile)
      formData.append("foto", compressedFoto, photo.name)
    }

    const res = await submitAbsensi(formData)'''

new_submit = '''    // Compress & upload each photo
    setIsUploading(true)
    setUploadProgress(0)
    let uploadedCount = 0
    try {
      for (const photo of photos) {
        let processedFile = photo.file
        const compressedFoto = await handleCompress(processedFile)
        
        const url = await uploadToCloudinaryClient(compressedFoto, "sppg_trangkil/absensi", (p) => {
          setUploadProgress(Math.round(((uploadedCount * 100) + p) / photos.length))
        })
        formData.append("foto_urls", url)
        uploadedCount++
      }
    } catch (err: any) {
      setMessage({ text: err.message || "Gagal mengunggah gambar", type: "error" })
      setLoading(false)
      setIsUploading(false)
      return
    }

    const res = await submitAbsensi(formData)
    setIsUploading(false)'''

patch_file(path, old_submit, new_submit)
insert_after(path, '<form onSubmit={onSubmit} className="space-y-6">', '      <UploadProgressBar progress={uploadProgress} isUploading={isUploading} />')
