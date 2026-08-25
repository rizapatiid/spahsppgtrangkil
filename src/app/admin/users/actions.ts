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
      data: { nama_divisi }
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

export async function addAnggota(divisiId: number, nama: string, no_hp: string) {
  if (!nama) return { error: "Nama wajib diisi" }
  
  await prisma.anggotaDivisi.create({
    data: {
      nama,
      no_hp,
      divisi_id: divisiId
    }
  })

  // Update jumlah anggota
  const count = await prisma.anggotaDivisi.count({ where: { divisi_id: divisiId } })
  await prisma.divisi.update({
    where: { id: divisiId },
    data: { jumlah_anggota: count }
  })

  revalidatePath("/admin/users")
  return { success: true }
}

export async function removeAnggota(anggotaId: number, divisiId: number) {
  await prisma.anggotaDivisi.delete({
    where: { id: anggotaId }
  })

  // Update jumlah anggota
  const count = await prisma.anggotaDivisi.count({ where: { divisi_id: divisiId } })
  await prisma.divisi.update({
    where: { id: divisiId },
    data: { jumlah_anggota: count }
  })

  revalidatePath("/admin/users")
  return { success: true }
}

export async function updateAnggota(anggotaId: number, nama: string, no_hp: string) {
  await prisma.anggotaDivisi.update({
    where: { id: anggotaId },
    data: { nama: nama.trim(), no_hp: no_hp.trim() || null }
  })

  revalidatePath("/admin/users")
  return { success: true }
}
