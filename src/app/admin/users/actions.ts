"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

export async function createDivisiAccount(formData: FormData) {
  const username = formData.get("username") as string
  const nama_divisi = formData.get("nama_divisi") as string
  const role = formData.get("role") as any
  const password = formData.get("password") as string
  const jumlah_anggota = parseInt(formData.get("jumlah_anggota") as string) || 0
  const koordinator = formData.get("koordinator") as string
  const nip_koordinator = formData.get("nip_koordinator") as string

  if (!username || !nama_divisi || !role || !password) {
    return { error: "Semua kolom wajib diisi" }
  }

  const existing = await prisma.user.findUnique({ where: { username } })
  if (existing) return { error: "Username sudah digunakan" }

  const password_hash = await bcrypt.hash(password, 10)

  const divisi = await prisma.divisi.create({
    data: {
      nama_divisi,
      jumlah_anggota,
      koordinator,
      nip_koordinator,
    }
  })

  await prisma.user.create({
    data: {
      username,
      password_hash,
      role,
      status: true,
      divisi_id: divisi.id
    }
  })

  revalidatePath("/admin/users")
  return { success: true }
}

export async function updateDivisiAccount(id: string, formData: FormData) {
  const username = formData.get("username") as string
  const nama_divisi = formData.get("nama_divisi") as string
  const role = formData.get("role") as any
  const divisi_id = parseInt(formData.get("divisi_id") as string)
  const koordinator = formData.get("koordinator") as string
  const nip_koordinator = formData.get("nip_koordinator") as string

  if (!username || !nama_divisi || !role) {
    return { error: "Username, Nama Divisi, dan Role wajib diisi" }
  }

  const existing = await prisma.user.findUnique({ where: { username } })
  if (existing && existing.id !== id) {
    return { error: "Username sudah digunakan oleh akun lain" }
  }

  await prisma.user.update({
    where: { id },
    data: { username, role }
  })

  if (divisi_id) {
    await prisma.divisi.update({
      where: { id: divisi_id },
      data: { nama_divisi, koordinator, nip_koordinator }
    })
  }

  revalidatePath("/admin/users")
  return { success: true }
}

export async function toggleUserStatus(id: string, currentStatus: boolean) {
  await prisma.user.update({
    where: { id },
    data: { status: !currentStatus }
  })
  revalidatePath("/admin/users")
}

export async function resetPassword(id: string, newPassword: string) {
  if (!newPassword) return { error: "Password tidak boleh kosong" }
  
  const password_hash = await bcrypt.hash(newPassword, 10)
  await prisma.user.update({
    where: { id },
    data: { password_hash }
  })
  
  revalidatePath("/admin/users")
  return { success: true }
}


