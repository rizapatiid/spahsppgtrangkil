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
insert_after(path, 'import ConfirmModal from "@/components/ConfirmModal"', 'import UploadProgressBar from "@/components/UploadProgressBar"\nimport { uploadToCloudinaryClient } from "@/lib/clientUpload"')
insert_after(path, 'const [formLoading, setFormLoading] = useState(false)', '  const [isUploading, setIsUploading] = useState(false)\n  const [uploadProgress, setUploadProgress] = useState(0)')

old_save = '''    const form = e.currentTarget
    const formData = new FormData(form)

    if (editingId) {
      const res = await updateArahan(editingId, formData)'''
      
new_save = '''    const form = e.currentTarget
    const formData = new FormData(form)
    
    const file = formData.get("image")
    if (file && file.size > 0) {
      setIsUploading(true)
      setUploadProgress(0)
      const compressed = await handleCompress(file)
      const url = await uploadToCloudinaryClient(compressed, "sppg_trangkil/arahan", (p) => {
          setUploadProgress(p)
      })
      formData.delete("image")
      formData.append("image_url", url)
      setIsUploading(false)
    }

    if (editingId) {
      const res = await updateArahan(editingId, formData)'''

patch_file(path, old_save, new_save)
insert_after(path, '<div className="max-w-5xl mx-auto space-y-6">', '      <UploadProgressBar progress={uploadProgress} isUploading={isUploading} />')
