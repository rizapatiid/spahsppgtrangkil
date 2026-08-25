"use server"

import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { deleteFotoLaporan } from "@/app/dashboard/laporan/actions"
import { deleteFromCloudinary } from "@/lib/cloudinary"
import { unlink } from "fs/promises"
import path from "path"

export async function resetLaporanAction(laporanId: string) {
  // Ambil semua foto laporan ini
  const fotos = await prisma.fotoKegiatan.findMany({ where: { laporan_id: laporanId } })
  
  // Hapus foto fisik
  for (const foto of fotos) {
    try {
      if (foto.url_foto.startsWith("http")) {
        await deleteFromCloudinary(foto.url_foto)
      } else {
        const filepath = path.join(process.cwd(), "public", foto.url_foto)
        await unlink(filepath)
      }
    } catch (e) {
      console.log("Gagal hapus foto fisik:", e)
    }
  }

  // Hapus foto-foto dari database terlebih dahulu
  await prisma.fotoKegiatan.deleteMany({ where: { laporan_id: laporanId } })
  // Hapus laporan
  await prisma.laporanDivisi.delete({ where: { id: laporanId } })
  
  redirect("/admin/laporan")
}

export async function deleteFotoAction(fotoId: string, laporanId: string) {
  await deleteFotoLaporan(fotoId)
  revalidatePath(`/admin/laporan/${laporanId}`)
}
