"use server"

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function ubahPassword(passwordLama: string, passwordBaru: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { error: "Tidak terautentikasi." }
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return { error: "User tidak ditemukan." }
    }

    // Verifikasi password lama
    const isPasswordValid = await bcrypt.compare(passwordLama, user.password_hash)
    if (!isPasswordValid) {
      return { error: "Password lama tidak sesuai." }
    }

    // Hash password baru
    const hashedPassword = await bcrypt.hash(passwordBaru, 10)

    await prisma.user.update({
      where: { id: user.id },
      data: { password_hash: hashedPassword }
    })

    return { success: true }

  } catch (error: any) {
    console.error("Gagal mengubah password:", error)
    return { error: "Terjadi kesalahan sistem saat mengubah password." }
  }
}
