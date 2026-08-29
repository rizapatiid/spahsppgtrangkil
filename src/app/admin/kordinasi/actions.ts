'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary"

export async function createArahan(formData: FormData) {
  const judul = formData.get('judul') as string
  const isi = formData.get('isi') as string
  const divisiIdRaw = formData.get('divisi_id') as string
  const file = formData.get('image') as File | null

  if (!judul || !isi) {
    throw new Error("Judul dan isi arahan wajib diisi")
  }

  const divisi_id = divisiIdRaw === 'all' || !divisiIdRaw ? null : parseInt(divisiIdRaw)
  let image_url = null

  if (file && file.size > 0) {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    image_url = await uploadToCloudinary(buffer, 'sppg_trangkil/arahan')
  }

  await prisma.arahan.create({
    data: {
      judul,
      isi,
      divisi_id,
      image_url,
    }
  })

  revalidatePath('/admin/kordinasi')
  revalidatePath('/dashboard')
}

export async function updateArahan(id: number, formData: FormData) {
  const judul = formData.get('judul') as string
  const isi = formData.get('isi') as string
  const divisiIdRaw = formData.get('divisi_id') as string
  const file = formData.get('image') as File | null

  if (!judul || !isi) {
    throw new Error("Judul dan isi arahan wajib diisi")
  }

  const divisi_id = divisiIdRaw === 'all' || !divisiIdRaw ? null : parseInt(divisiIdRaw)
  
  const existing = await prisma.arahan.findUnique({ where: { id } })
  let image_url = existing?.image_url || null

  if (file && file.size > 0) {
    // Delete old image if it exists
    if (image_url && image_url.startsWith('http')) {
      try { await deleteFromCloudinary(image_url) } catch (e) {}
    }
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    image_url = await uploadToCloudinary(buffer, 'sppg_trangkil/arahan')
  }

  await prisma.arahan.update({
    where: { id },
    data: {
      judul,
      isi,
      divisi_id,
      image_url,
    }
  })

  revalidatePath('/admin/kordinasi')
  revalidatePath('/dashboard')
}

export async function deleteArahan(id: number) {
  const existing = await prisma.arahan.findUnique({ where: { id } })
  if (existing?.image_url && existing.image_url.startsWith('http')) {
    try { await deleteFromCloudinary(existing.image_url) } catch (e) {}
  }

  await prisma.arahan.delete({
    where: { id }
  })

  revalidatePath('/admin/kordinasi')
  revalidatePath('/dashboard')
}
