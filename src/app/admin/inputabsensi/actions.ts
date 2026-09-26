"use server"

import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { uploadToCloudinary } from "@/lib/cloudinary"

export async function getAbsensiByDateAndDivisi(dateStr: string, divisiId: number) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "ASLAP")) throw new Error("Unauthorized")

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
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "ASLAP")) return { error: "Unauthorized" }

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
    const fotoUrls = formData.getAll("foto_urls") as string[]
    
    if (fotoUrls.length > 0) {
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
      for (const url of fotoUrls) {
        await prisma.fotoKegiatan.create({
          data: {
            tanggal: targetDate,
            url_foto: url,
            tipe_foto: "absensi_briefing",
            divisi_id: divisiId
          }
        })
      }
    }

    revalidatePath("/admin/absensi")
      revalidatePath("/admin/inputabsensi")
      revalidatePath("/dashboard/riwayat")
      return { success: true }
    } catch (error: any) {
    return { error: error.message || "Terjadi kesalahan" }
  }
}

export async function deleteFotoAbsensiManual(fotoId: string) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "ASLAP")) return { error: "Unauthorized" }
  try {
    await prisma.fotoKegiatan.delete({ where: { id: fotoId } })
    revalidatePath("/admin/absensi")
    revalidatePath("/admin/inputabsensi")
    revalidatePath("/dashboard/riwayat")
    return { success: true }
  } catch(e:any) {
    return { error: e.message }
  }
}
