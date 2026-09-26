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


path = 'src/app/dashboard/laporan/actions.ts'

old_upload = '''    const files = formData.getAll("fotos") as File[]
    const keterangans = formData.getAll("keterangans") as string[]
    if (files.length === 0) return { error: "Tidak ada file" }

    const savedPhotos = []

    for (let i = 0; i < files.length; i++) {
      const foto = files[i]
      if (foto.size === 0) continue

      const bytes = await foto.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const url_foto = await uploadToCloudinary(buffer, `sppg_trangkil/laporan/${tipe_foto}`)

      const saved = await prisma.fotoKegiatan.create({'''

new_upload = '''    const urls = formData.getAll("foto_urls") as string[]
    const keterangans = formData.getAll("keterangans") as string[]
    if (urls.length === 0) return { error: "Tidak ada file" }

    const savedPhotos = []

    for (let i = 0; i < urls.length; i++) {
      const url_foto = urls[i]
      if (!url_foto) continue

      const saved = await prisma.fotoKegiatan.create({'''
      
old_edit = '''    const file = formData.get("foto") as File | null
    const keterangan = formData.get("keterangan") as string | null

    let newUrl = fotoRecord.url_foto
    let newCatatan = fotoRecord.catatan ? JSON.parse(JSON.stringify(fotoRecord.catatan)) : {}

    if (keterangan !== null) {
      newCatatan.keterangan = keterangan
    }

    if (file && file.size > 0) {
      // Hapus fisik lama jika ada di Cloudinary
      try {
        if (fotoRecord.url_foto.startsWith("http")) {
          await deleteFromCloudinary(fotoRecord.url_foto)
        }
      } catch (e) {}

      // Upload fisik baru ke Cloudinary
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      newUrl = await uploadToCloudinary(buffer, `sppg_trangkil/laporan/${fotoRecord.tipe_foto}`)
    }'''
    
new_edit = '''    const fileUrl = formData.get("foto_url") as string | null
    const keterangan = formData.get("keterangan") as string | null

    let newUrl = fotoRecord.url_foto
    let newCatatan = fotoRecord.catatan ? JSON.parse(JSON.stringify(fotoRecord.catatan)) : {}

    if (keterangan !== null) {
      newCatatan.keterangan = keterangan
    }

    if (fileUrl) {
      // Hapus fisik lama jika ada di Cloudinary
      try {
        if (fotoRecord.url_foto.startsWith("http")) {
          await deleteFromCloudinary(fotoRecord.url_foto)
        }
      } catch (e) {}
      newUrl = fileUrl
    }'''

patch_file(path, old_upload, new_upload)
patch_file(path, old_edit, new_edit)
