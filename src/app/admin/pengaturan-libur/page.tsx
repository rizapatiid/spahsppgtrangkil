import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import PengaturanLiburClient from "./PengaturanLiburClient"
import { getHariLibur, getSemuaRelawan } from "./actions"

export default async function PengaturanLiburPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  const [data, divisiData] = await Promise.all([
    getHariLibur(),
    getSemuaRelawan()
  ])

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="mb-6">
        <h1 className="text-[22px] font-black text-slate-800 tracking-tight">Pengaturan Hari Libur</h1>
        <p className="text-[13px] text-slate-500 mt-1 font-medium leading-relaxed">
          Atur jadwal libur per relawan pada tanggal tertentu. Anggota yang ditandai libur akan tampil sebagai <span className="text-red-500 font-bold">L (Libur)</span> pada tabel kehadiran jika tidak melakukan absensi.
        </p>
      </div>

      <PengaturanLiburClient initialData={data} divisiData={divisiData} />
    </div>
  )
}
