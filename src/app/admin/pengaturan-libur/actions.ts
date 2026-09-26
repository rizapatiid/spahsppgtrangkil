"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function getHariLibur() {
  const data = await prisma.hariLibur.findMany({
    orderBy: { tanggal: 'desc' },
    include: {
      relawan: true
    }
  })
  return data
}

// Fetch all divisi & anggota for the form
export async function getSemuaRelawan() {
  return await prisma.divisi.findMany({
    include: {
      anggota: {
        orderBy: { nama: 'asc' }
      }
    },
    orderBy: { nama_divisi: 'asc' }
  })
}

export async function saveJadwalLibur(tanggal: string, keterangan: string, anggotaIds: number[]) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== "ADMIN") return { error: "Akses ditolak" }

  try {
    const parsedDate = new Date(`${tanggal}T00:00:00.000Z`)
    
    // Check if exists
    let hariLibur = await prisma.hariLibur.findUnique({
      where: { tanggal: parsedDate }
    })
    
    if (hariLibur) {
      // Update keterangan
      hariLibur = await prisma.hariLibur.update({
        where: { id: hariLibur.id },
        data: { keterangan: keterangan || "Libur" }
      })
      // Clear old relawan
      await prisma.hariLiburRelawan.deleteMany({
        where: { hari_libur_id: hariLibur.id }
      })
    } else {
      hariLibur = await prisma.hariLibur.create({
        data: {
          tanggal: parsedDate,
          keterangan: keterangan || "Libur"
        }
      })
    }

    // Insert new relawan mapping
    if (anggotaIds.length > 0) {
      await prisma.hariLiburRelawan.createMany({
        data: anggotaIds.map(id => ({
          hari_libur_id: hariLibur.id,
          anggota_id: id
        }))
      })
    }

    return { success: true }
  } catch (e: any) {
    return { error: e.message }
  }
}

export async function deleteHariLibur(id: number) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== "ADMIN") return { error: "Akses ditolak" }

  try {
    await prisma.hariLibur.delete({
      where: { id: Number(id) }
    })
    return { success: true }
  } catch (e: any) {
    return { error: e.message }
  }
}
