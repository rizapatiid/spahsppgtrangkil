"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../api/auth/[...nextauth]/route"
import { unlink } from "fs/promises"
import path from "path"
import { revalidatePath } from "next/cache"
import { deleteFromCloudinary } from "@/lib/cloudinary"

export async function resetAbsensi(absensiId: string, divisiId: number, tanggalString: string) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user.role !== "ADMIN") {
      return { error: "Akses Ditolak: Hanya Admin yang bisa mereset absensi." }
    }

    // Parse the date back to match the DB
    const tanggal = new Date(tanggalString)
    tanggal.setUTCHours(0, 0, 0, 0)

    // Find and delete the associated photo
    const fotos = await prisma.fotoKegiatan.findMany({
      where: {
        divisi_id: divisiId,
        tanggal: tanggal,
        tipe_foto: "absensi_briefing"
      }
    })

    if (fotos.length > 0) {
      for (const foto of fotos) {
        // Hapus file fisik
        try {
          if (foto.url_foto.startsWith("http")) {
            await deleteFromCloudinary(foto.url_foto)
          } else {
            const filepath = path.join(process.cwd(), "public", foto.url_foto)
            await unlink(filepath)
          }
        } catch (e) {
          console.log("File foto fisik tidak ditemukan, mengabaikan...")
        }
        
        // Hapus record foto
        await prisma.fotoKegiatan.delete({ where: { id: foto.id } })
      }
    }

    // Delete the attendance record (AnggotaAbsensi will be cascade deleted)
    await prisma.absensi.delete({
      where: { id: absensiId }
    })

    revalidatePath("/admin/absensi")
    revalidatePath("/dashboard/absensi")

    return { success: true }
  } catch (error: any) {
    console.error(error)
    return { error: error.message || "Gagal mereset absensi" }
  }
}
