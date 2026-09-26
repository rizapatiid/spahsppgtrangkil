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

path = 'src/app/dashboard/laporan/LaporanClient.tsx'
insert_after(path, 'import ConfirmModal from "@/components/ConfirmModal"', 'import UploadProgressBar from "@/components/UploadProgressBar"\nimport { uploadToCloudinaryClient } from "@/lib/clientUpload"')

insert_after(path, 'const [loadingSection, setLoadingSection] = useState<string | null>(null)', '  const [isUploading, setIsUploading] = useState(false)\n  const [uploadProgress, setUploadProgress] = useState(0)')

old_upload = '''      // Unggah secara paralel dari sisi klien agar tidak terkena limit payload/timeout Vercel
      const uploadPromises = filesToUpload.map(async (item) => {
        const formData = new FormData()
        const compressed = await handleCompress(item.file)
        formData.append("fotos", compressed, item.file.name)
        formData.append("keterangans", item.keterangan || "")
        
        return uploadFotoLaporan(formData, catId)
      })'''

new_upload = '''      setIsUploading(true)
      setUploadProgress(0)
      const progressArray = new Array(filesToUpload.length).fill(0)
      
      const uploadPromises = filesToUpload.map(async (item, idx) => {
        const formData = new FormData()
        const compressed = await handleCompress(item.file)
        
        const url = await uploadToCloudinaryClient(compressed, `sppg_trangkil/laporan/${catId}`, (p) => {
           progressArray[idx] = p
           const total = progressArray.reduce((acc, val) => acc + val, 0)
           setUploadProgress(Math.round(total / filesToUpload.length))
        })
        
        formData.append("foto_urls", url)
        formData.append("keterangans", item.keterangan || "")
        
        return uploadFotoLaporan(formData, catId)
      })'''

patch_file(path, old_upload, new_upload)
insert_after(path, '<div className="flex flex-col relative pb-6 px-4 sm:px-5 lg:px-8">', '      <UploadProgressBar progress={uploadProgress} isUploading={isUploading} />')

# edit modal patch
old_edit = '''    if (file) {
      const compressed = await handleCompress(file)
      formData.append("foto", compressed, file.name)
    }
    formData.append("keterangan", keterangan)

    const res = await editFotoLaporan(editModalFoto.id, formData)'''

new_edit = '''    if (file) {
      setIsUploading(true)
      setUploadProgress(0)
      const compressed = await handleCompress(file)
      const url = await uploadToCloudinaryClient(compressed, `sppg_trangkil/laporan`, (p) => {
          setUploadProgress(p)
      })
      formData.append("foto_url", url)
      setIsUploading(false)
    }
    formData.append("keterangan", keterangan)

    const res = await editFotoLaporan(editModalFoto.id, formData)'''
    
patch_file(path, old_edit, new_edit)
patch_file(path, 'setLoadingSection(null)\n      }', 'setLoadingSection(null)\n        setIsUploading(false)\n      }')

