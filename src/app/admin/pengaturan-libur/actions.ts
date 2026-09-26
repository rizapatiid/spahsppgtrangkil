"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function getHariLibur() {
  const data = await prisma.hariLibur.findMany({
    orderBy: { tanggal: 'desc' }
  })
  return data
}

export async function addHariLibur(tanggal: string, keterangan: string) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== "ADMIN") return { error: "Akses ditolak" }

  try {
    const parsedDate = new Date(`${tanggal}T00:00:00.000Z`)
    const existing = await prisma.hariLibur.findUnique({
      where: { tanggal: parsedDate }
    })
    
    if (existing) {
      return { error: "Tanggal libur sudah ada" }
    }

    await prisma.hariLibur.create({
      data: {
        tanggal: parsedDate,
        keterangan: keterangan || "Libur"
      }
    })
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
