"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary"

export async function getSharedDivisiId(session: any) {
  if (session.user.role === "SATPAM" || session.user.role === "KEBERSIHAN") {
    const keb = await prisma.divisi.findFirst({
      where: { users: { some: { role: "KEBERSIHAN" } } }
    })
    return keb?.id || session.user.divisi_id
  }
  return session.user.divisi_id
}

export async function uploadFotoLaporan(formData: FormData, tipe_foto: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user.divisi_id) {
      return { error: "Sesi tidak valid" }
    }

    const divisi_id = await getSharedDivisiId(session)
    const now = new Date()
    const wibDateString = now.toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" })
    const today = new Date(`${wibDateString}T00:00:00.000Z`)

    // Pastikan ada LaporanDivisi untuk hari ini agar admin bisa melacaknya
    let laporan = await prisma.laporanDivisi.findFirst({
      where: { divisi_id, tanggal: { gte: today } }
    })
    
    if (!laporan) {
      laporan = await prisma.laporanDivisi.create({
        data: {
          divisi_id,
          tanggal: today,
          created_by: session.user.username || "Sistem"
        }
      })
    }

    const files = formData.getAll("fotos") as File[]
    const keterangans = formData.getAll("keterangans") as string[]
    if (files.length === 0) return { error: "Tidak ada file" }

    const savedPhotos = []

    for (let i = 0; i < files.length; i++) {
      const foto = files[i]
      if (foto.size === 0) continue

      const bytes = await foto.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const url_foto = await uploadToCloudinary(buffer, `sppg_trangkil/laporan/${tipe_foto}`)

      const saved = await prisma.fotoKegiatan.create({
        data: {
          tanggal: today,
          url_foto,
          tipe_foto,
          divisi_id,
          laporan_id: laporan.id,
          catatan: keterangans[i] ? { keterangan: keterangans[i] } : undefined
        }
      })
      savedPhotos.push(saved)
    }

    revalidatePath("/dashboard/laporan")
    return { success: true, photos: savedPhotos }

  } catch (error: any) {
    console.error(error)
    return { error: error.message || "Gagal mengunggah foto" }
  }
}

export async function deleteFotoLaporan(fotoId: string) {
  try {
    const foto = await prisma.fotoKegiatan.findUnique({ where: { id: fotoId } })
    if (!foto) return { error: "Foto tidak ditemukan" }

    // Hapus file fisik dari Cloudinary jika file cloud
    try {
      if (foto.url_foto.startsWith("http")) {
        await deleteFromCloudinary(foto.url_foto)
      }
    } catch (e) {
      console.log("Gagal menghapus file dari Cloudinary:", e)
    }

    // Hapus dari DB
    await prisma.fotoKegiatan.delete({ where: { id: fotoId } })
    revalidatePath("/dashboard/laporan")
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function getUploadedFotos(divisiId: number) {
  const now = new Date()
  const wibDateString = now.toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" })
  const today = new Date(`${wibDateString}T00:00:00.000Z`)
  
  return await prisma.fotoKegiatan.findMany({
    where: {
      divisi_id: divisiId,
      tanggal: { gte: today },
      tipe_foto: { not: "absensi_briefing" }
    }
  })
}

export async function editFotoLaporan(fotoId: string, formData: FormData) {
  try {
    const fotoRecord = await prisma.fotoKegiatan.findUnique({ where: { id: fotoId } })
    if (!fotoRecord) return { error: "Foto tidak ditemukan" }

    const file = formData.get("foto") as File | null
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
    }

    const updated = await prisma.fotoKegiatan.update({
      where: { id: fotoId },
      data: {
        url_foto: newUrl,
        catatan: newCatatan
      }
    })

    revalidatePath("/dashboard/laporan")
    return { success: true, photo: updated }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function submitFinalLaporan(catatan: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user.divisi_id) return { error: "Sesi tidak valid" }
    
    const divisi_id = await getSharedDivisiId(session)
    const now = new Date()
    const wibDateString = now.toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" })
    const today = new Date(`${wibDateString}T00:00:00.000Z`)

    const existing = await prisma.laporanDivisi.findFirst({
      where: { divisi_id, tanggal: { gte: today } }
    })

    if (existing) {
      await prisma.laporanDivisi.update({
        where: { id: existing.id },
        data: { isi_laporan: catatan }
      })
    } else {
      const laporan = await prisma.laporanDivisi.create({
        data: {
          divisi_id,
          tanggal: today,
          isi_laporan: catatan,
          created_by: session.user.username || "Sistem"
        }
      })

      // Update semua foto hari ini agar terhubung ke laporan ini
      await prisma.fotoKegiatan.updateMany({
        where: { divisi_id, tanggal: today, laporan_id: null },
        data: { laporan_id: laporan.id }
      })
    }

    revalidatePath("/dashboard/laporan")
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}
