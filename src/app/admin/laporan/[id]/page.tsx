import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import LaporanDetailClient from "./LaporanDetailClient"

export default async function LaporanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const laporan = await prisma.laporanDivisi.findUnique({
    where: { id },
    include: {
      divisi: {
        include: { users: true }
      },
      foto: true
    }
  })

  if (!laporan) {
    notFound()
  }

  const getRoleFromDivisi = (divisi: any) => {
    if (divisi.users && divisi.users.length > 0) {
      return divisi.users[0].role
    }
    const nama = divisi.nama_divisi.toUpperCase()
    if (nama.includes("PERSIAPAN")) return "PERSIAPAN"
    if (nama.includes("PENGOLAHAN")) return "PENGOLAHAN"
    if (nama.includes("PEMORSIAN")) return "PEMORSIAN"
    if (nama.includes("DISTRIBUSI")) return "DISTRIBUSI"
    if (nama.includes("PENCUCIAN")) return "PENCUCIAN"
    if (nama.includes("KEBERSIHAN")) return "KEBERSIHAN"
    if (nama.includes("SATPAM")) return "SATPAM"
    return "ADMIN"
  }

  const role = getRoleFromDivisi(laporan.divisi)

  // Kelompokkan foto berdasarkan tipe
  const fotoGroup = laporan.foto.reduce((acc, curr) => {
    if (!acc[curr.tipe_foto]) acc[curr.tipe_foto] = []
    acc[curr.tipe_foto].push(curr)
    return acc
  }, {} as Record<string, any[]>)

  // Semua kategori berdasarkan role
  const baseCats = [{ id: "kegiatan", label: "Foto Kegiatan", desc: "Minimal 3 foto kegiatan utama" }]
  let allCategories = [...baseCats]
  if (role === "PERSIAPAN") {
    allCategories.push({ id: "bahan_makanan", label: "Bahan Makanan (Bersih)", desc: "Kondisi bahan setelah dibersihkan" })
    allCategories.push({ id: "sampah", label: "Sampah & Catatan", desc: "Foto sampah hasil persiapan" })
  } else if (role === "PENGOLAHAN") {
    allCategories.push({ id: "masakan_matang", label: "Masakan Matang", desc: "Foto masakan yang sudah selesai dimasak" })
    allCategories.push({ id: "sampah", label: "Sampah & Catatan", desc: "Foto sampah hasil pengolahan" })
  } else if (role === "PEMORSIAN") {
    allCategories.push({ id: "makanan_diporsi", label: "Makanan yang Diporsi", desc: "Proses pemorsian makanan" })
    allCategories.push({ id: "kondisi_sebelum_dikirim", label: "Kondisi Sebelum Dikirim", desc: "Kondisi makanan sebelum didistribusikan" })
    allCategories.push({ id: "tray_siap", label: "Tray Siap Distribusi di Rak", desc: "Tray yang sudah tersusun rapi di rak" })
    allCategories.push({ id: "sisa_pemorsian", label: "Sisa Pemorsian", desc: "Foto sisa makanan setelah diporsi" })
  } else if (role === "DISTRIBUSI") {
    allCategories.push({ id: "lokasi_distribusi", label: "Bukti di Lokasi Distribusi", desc: "Foto bukti pengantaran di lokasi" })
    allCategories.push({ id: "tray_kembali", label: "Tray Kembali ke SPPG", desc: "Minimal 4 foto tray yang kembali" })
  } else if (role === "PENCUCIAN") {
    allCategories.push({ id: "limbah_makanan", label: "Limbah Makanan", desc: "Minimal 4 foto limbah makanan" })
    allCategories.push({ id: "tray_kembali", label: "Tray Kembali ke SPPG", desc: "Minimal 4 foto tray yang kembali" })
  } else if (role === "KEBERSIHAN" || role === "SATPAM") {
    allCategories.push({ id: "sampah_akhir", label: "Sampah Akhir", desc: "Foto kondisi sampah di akhir kegiatan" })
  }

  return (
    <LaporanDetailClient 
      laporan={laporan} 
      allCategories={allCategories} 
      fotoGroup={fotoGroup} 
    />
  )
}
