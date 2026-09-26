import os

path = 'src/app/admin/inputlaporan/InputLaporanClient.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

old_save = '''      // Append fotos
      Object.keys(newFotos).forEach(catId => {
        let counter = 0
        newFotos[catId].forEach(f => {
          formData.append(`foto_${catId}_${counter}`, f.file)
          formData.append(`ket_${catId}_${counter}`, f.keterangan || "")
          counter++
        })
      })
      
      const res = await saveLaporanManual(formData)'''

new_save = '''      // Upload fotos
      setIsUploading(true)
      setUploadProgress(0)
      const allFiles = []
      Object.keys(newFotos).forEach(catId => {
        let counter = 0
        newFotos[catId].forEach(f => {
          allFiles.push({ catId, counter, item: f })
          counter++
        })
      })
      
      let uploadedCount = 0
      for (const fileObj of allFiles) {
        const compressed = await handleCompress(fileObj.item.file)
        const url = await uploadToCloudinaryClient(compressed, `sppg_trangkil/laporan_manual/${fileObj.catId}`, (p) => {
          setUploadProgress(Math.round(((uploadedCount * 100) + p) / allFiles.length))
        })
        formData.append(`foto_url_${fileObj.catId}_${fileObj.counter}`, url)
        formData.append(`ket_${fileObj.catId}_${fileObj.counter}`, fileObj.item.keterangan || "")
        uploadedCount++
      }
      setIsUploading(false)
      
      const res = await saveLaporanManual(formData)'''

if old_save in content:
    content = content.replace(old_save, new_save)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
        print("Patched " + path)
    
if '<div className="max-w-5xl mx-auto space-y-6">' in content and '<UploadProgressBar' not in content:
    content = content.replace('<div className="max-w-5xl mx-auto space-y-6">', '<div className="max-w-5xl mx-auto space-y-6">\n      <UploadProgressBar progress={uploadProgress} isUploading={isUploading} />')
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
        print("Inserted PB")
