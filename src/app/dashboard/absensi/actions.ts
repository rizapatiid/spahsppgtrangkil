"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"
import { uploadToCloudinary } from "@/lib/cloudinary"

export async function submitAbsensi(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user.divisi_id) {
      return { error: "Sesi tidak valid atau divisi tidak ditemukan" }
    }

    const divisi_id = session.user.divisi_id
    
    // Gunakan tanggal hari ini (set jam ke 00:00:00 UTC berdasarkan WIB)
    const now = new Date()
    const wibDateString = now.toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" })
    const today = new Date(`${wibDateString}T00:00:00.000Z`)

    // Cek apakah sudah absen hari ini
    const existing = await prisma.absensi.findUnique({
      where: {
        divisi_id_tanggal: {
          divisi_id,
          tanggal: today
        }
      }
    })

    if (existing) {
      return { error: "Divisi ini sudah mengisi absensi untuk hari ini." }
    }

    // Ambil file foto
    const foto = formData.get("foto") as File
    if (!foto || foto.size === 0) {
      return { error: "Foto bukti kehadiran wajib diunggah" }
    }

    // Upload to Cloudinary
    const bytes = await foto.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const url_foto = await uploadToCloudinary(buffer, "sppg_trangkil/absensi")

    // Kumpulkan data kehadiran
    const kehadiran: any[] = []
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("absen-")) {
        const anggota_id = parseInt(key.replace("absen-", ""))
        kehadiran.push({ anggota_id, status: value as string })
      }
    }

    // Simpan ke DB
    await prisma.$transaction(async (tx) => {
      const absensi = await tx.absensi.create({
        data: {
          divisi_id,
          tanggal: today,
        }
      })

      // Insert detail
      for (const item of kehadiran) {
        await tx.anggotaAbsensi.create({
          data: {
            absensi_id: absensi.id,
            anggota_id: item.anggota_id,
            status: item.status
          }
        })
      }

      // Insert foto kegiatan khusus absensi ke tabel FotoKegiatan (opsional, tapi baik untuk rekap foto)
      await tx.fotoKegiatan.create({
        data: {
          tanggal: today,
          url_foto,
          tipe_foto: "absensi_briefing",
          divisi_id,
        }
      })
    })

    revalidatePath("/dashboard/absensi")
    return { success: true }
    
  } catch (error: any) {
    console.error(error)
    return { error: error.message || "Terjadi kesalahan saat menyimpan absensi" }
  }
}
