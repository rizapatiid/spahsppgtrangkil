"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createRelawan(formData: FormData) {
  const nama = formData.get("nama") as string
  const nik = formData.get("nik") as string
  const no_hp = formData.get("no_hp") as string
  const alamat = formData.get("alamat") as string
  const divisi_id = parseInt(formData.get("divisi_id") as string)

  if (!nama || !divisi_id) {
    return { error: "Nama dan Divisi wajib diisi" }
  }

  await prisma.anggotaDivisi.create({
    data: {
      nama,
      nik: nik || null,
      no_hp: no_hp || null,
      alamat: alamat || null,
      divisi_id
    }
  })

  // Update jumlah anggota divisi
  const count = await prisma.anggotaDivisi.count({ where: { divisi_id } })
  await prisma.divisi.update({
    where: { id: divisi_id },
    data: { jumlah_anggota: count }
  })

  revalidatePath("/admin/relawan")
  return { success: true }
}

export async function updateRelawan(id: number, formData: FormData) {
  const nama = formData.get("nama") as string
  const nik = formData.get("nik") as string
  const no_hp = formData.get("no_hp") as string
  const alamat = formData.get("alamat") as string
  const divisi_id = parseInt(formData.get("divisi_id") as string)

  if (!nama || !divisi_id) {
    return { error: "Nama dan Divisi wajib diisi" }
  }

  // Get current divisi to update counts if changed
  const currentRelawan = await prisma.anggotaDivisi.findUnique({ where: { id } })

  await prisma.anggotaDivisi.update({
    where: { id },
    data: {
      nama,
      nik: nik || null,
      no_hp: no_hp || null,
      alamat: alamat || null,
      divisi_id
    }
  })

  if (currentRelawan && currentRelawan.divisi_id !== divisi_id) {
    // Update old divisi count
    const countOld = await prisma.anggotaDivisi.count({ where: { divisi_id: currentRelawan.divisi_id } })
    await prisma.divisi.update({
      where: { id: currentRelawan.divisi_id },
      data: { jumlah_anggota: countOld }
    })
    // Update new divisi count
    const countNew = await prisma.anggotaDivisi.count({ where: { divisi_id } })
    await prisma.divisi.update({
      where: { id: divisi_id },
      data: { jumlah_anggota: countNew }
    })
  }

  revalidatePath("/admin/relawan")
  return { success: true }
}

export async function deleteRelawan(id: number) {
  const relawan = await prisma.anggotaDivisi.findUnique({ where: { id } })
  if (!relawan) return { error: "Relawan tidak ditemukan" }

  await prisma.anggotaDivisi.delete({ where: { id } })

  // Update jumlah anggota divisi
  const count = await prisma.anggotaDivisi.count({ where: { divisi_id: relawan.divisi_id } })
  await prisma.divisi.update({
    where: { id: relawan.divisi_id },
    data: { jumlah_anggota: count }
  })

  revalidatePath("/admin/relawan")
  return { success: true }
}
