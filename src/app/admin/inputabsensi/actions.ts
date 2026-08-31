"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { uploadToCloudinary } from "@/lib/cloudinary"

export async function getAbsensiByDateAndDivisi(dateStr: string, divisiId: number) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") throw new Error("Unauthorized")

  const targetDate = new Date(`${dateStr}T00:00:00.000Z`)

  const absensi = await prisma.absensi.findFirst({
    where: {
      divisi_id: divisiId,
      tanggal: {
        gte: targetDate,
        lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000)
      }
    },
    include: { detail: true }
  })
  
  const fotoBriefingList = await prisma.fotoKegiatan.findMany({
    where: {
      divisi_id: divisiId,
      tanggal: {
        gte: targetDate,
        lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000)
      },
      tipe_foto: "absensi_briefing"
    }
  })

  const divisi = await prisma.divisi.findUnique({
    where: { id: divisiId },
    include: { anggota: true }
  })

  return { absensi, anggota: divisi?.anggota || [], fotoBriefingList }
}

export async function saveAbsensiManual(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") return { error: "Unauthorized" }

  const dateStr = formData.get("tanggal") as string
  const divisiId = parseInt(formData.get("divisiId") as string)
  const absensiDataStr = formData.get("absensiData") as string
  const absensiData = JSON.parse(absensiDataStr)
  
  if (!dateStr || isNaN(divisiId)) return { error: "Data tidak lengkap" }

  try {
    const targetDate = new Date(`${dateStr}T00:00:00.000Z`)

    let absensi = await prisma.absensi.findFirst({
      where: {
        divisi_id: divisiId,
        tanggal: {
          gte: targetDate,
          lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000)
        }
      }
    })

    if (!absensi) {
      absensi = await prisma.absensi.create({
        data: {
          divisi_id: divisiId,
          tanggal: targetDate
        }
      })
    }

    // Process attendance detail
    for (const item of absensiData) {
      const existingDetail = await prisma.anggotaAbsensi.findFirst({
        where: {
          absensi_id: absensi.id,
          anggota_id: item.anggota_id
        }
      })

      if (existingDetail) {
        await prisma.anggotaAbsensi.update({
          where: { id: existingDetail.id },
          data: { status: item.status }
        })
      } else {
        await prisma.anggotaAbsensi.create({
          data: {
            absensi_id: absensi.id,
            anggota_id: item.anggota_id,
            status: item.status
          }
        })
      }
    }
    
    // Process Photo
    const fotoFiles = formData.getAll("foto") as File[]
    const validFotos = fotoFiles.filter(f => f.size > 0)
    
    if (validFotos.length > 0) {
      // Hapus foto lama untuk tanggal & divisi ini
      await prisma.fotoKegiatan.deleteMany({
        where: {
          divisi_id: divisiId,
          tanggal: {
            gte: targetDate,
            lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000)
          },
          tipe_foto: "absensi_briefing"
        }
      })

      // Upload dan simpan foto baru
      for (const foto of validFotos) {
        const bytes = await foto.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const url_foto = await uploadToCloudinary(buffer, "sppg_trangkil/absensi_manual")
        
        await prisma.fotoKegiatan.create({
          data: {
            tanggal: targetDate,
            url_foto,
            tipe_foto: "absensi_briefing",
            divisi_id: divisiId
          }
        })
      }
    }

    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Terjadi kesalahan" }
  }
}

export async function deleteFotoAbsensiManual(fotoId: string) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") return { error: "Unauthorized" }
  try {
    await prisma.fotoKegiatan.delete({ where: { id: fotoId } })
    return { success: true }
  } catch(e:any) {
    return { error: e.message }
  }
}
