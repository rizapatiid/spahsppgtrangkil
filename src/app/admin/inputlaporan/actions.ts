"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { uploadToCloudinary } from "@/lib/cloudinary"

export async function getLaporanByDateAndDivisi(dateStr: string, divisiId: number) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") throw new Error("Unauthorized")

  const targetDate = new Date(`${dateStr}T00:00:00.000Z`)
  
  const laporan = await prisma.laporanDivisi.findFirst({
    where: {
      divisi_id: divisiId,
      tanggal: {
        gte: targetDate,
        lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000)
      }
    },
    include: { foto: true }
  })
  
  const divisi = await prisma.divisi.findUnique({
    where: { id: divisiId },
    include: { users: true }
  })
  
  let role = "UMUM"
  if (divisi?.users && divisi.users.length > 0) {
    role = divisi.users[0].role
  }

  return { laporan, role }
}

export async function saveLaporanManual(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") return { error: "Unauthorized" }
  
  const dateStr = formData.get("tanggal") as string
  const divisiId = parseInt(formData.get("divisiId") as string)
  const isiLaporan = formData.get("isi_laporan") as string
  
  if (!dateStr || isNaN(divisiId)) return { error: "Data tidak lengkap" }
  
  try {
    const targetDate = new Date(`${dateStr}T00:00:00.000Z`)
    
    let laporan = await prisma.laporanDivisi.findFirst({
      where: {
        divisi_id: divisiId,
        tanggal: {
          gte: targetDate,
          lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000)
        }
      }
    })
    
    if (!laporan) {
      laporan = await prisma.laporanDivisi.create({
        data: {
          divisi_id: divisiId,
          tanggal: targetDate,
          isi_laporan: isiLaporan,
          created_by: session.user.username || "admin"
        }
      })
    } else {
      laporan = await prisma.laporanDivisi.update({
        where: { id: laporan.id },
        data: { isi_laporan: isiLaporan }
      })
    }
    
    // Process new photos
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
    }
    
    return { success: true }
  } catch (e: any) {
    console.error(e)
    return { error: e.message || "Terjadi kesalahan" }
  }
}

export async function deleteFotoManual(fotoId: string) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") return { error: "Unauthorized" }
  try {
    await prisma.fotoKegiatan.delete({ where: { id: fotoId } })
    return { success: true }
  } catch(e:any) {
    return { error: e.message }
  }
}

export async function updateFotoKeteranganManual(fotoId: string, keterangan: string) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") return { error: "Unauthorized" }
  try {
    await prisma.fotoKegiatan.update({
      where: { id: fotoId },
      data: { catatan: keterangan ? { keterangan } : undefined }
    })
    return { success: true }
  } catch(e:any) {
    return { error: e.message }
  }
}
