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

path = 'src/app/admin/kordinasi/KordinasiClient.tsx'
insert_after(path, "import { createArahan, updateArahan, deleteArahan } from './actions'", 'import UploadProgressBar from "@/components/UploadProgressBar"\nimport { uploadToCloudinaryClient } from "@/lib/clientUpload"\nimport imageCompression from "browser-image-compression"')
insert_after(path, 'const [isSubmitting, setIsSubmitting] = useState(false)', '  const [isUploading, setIsUploading] = useState(false)\n  const [uploadProgress, setUploadProgress] = useState(0)')

old_save = '''    try {
      const formData = new FormData()
      formData.append('judul', judul)
      formData.append('isi', isi)
      formData.append('divisi_id', divisiId)
      if (image) {
        formData.append('image', image)
      }

      if (isEditing && currentId) {
        await updateArahan(currentId, formData)'''
        
new_save = '''    try {
      const formData = new FormData()
      formData.append('judul', judul)
      formData.append('isi', isi)
      formData.append('divisi_id', divisiId)
      if (image) {
        setIsUploading(true)
        setUploadProgress(0)
        try {
          const compressed = await imageCompression(image, { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true })
          const url = await uploadToCloudinaryClient(compressed, 'sppg_trangkil/arahan', (p) => setUploadProgress(p))
          formData.append('image_url', url)
        } catch(e) {
          console.error(e)
        }
        setIsUploading(false)
      }

      if (isEditing && currentId) {
        await updateArahan(currentId, formData)'''

patch_file(path, old_save, new_save)
insert_after(path, '<div className="space-y-6">', '      <UploadProgressBar progress={uploadProgress} isUploading={isUploading} />')
