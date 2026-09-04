
import re

with open("src/components/AslapSidebar.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("export default function AdminSidebar", "export default function AslapSidebar")

# Hapus item Users dan Relawan, dan ubah href dari /admin/ ke /aslap/
old_nav = """  const navItems = [
    { name: "Dashboard", href: "/admin", icon: Home, exact: true },
    { name: "Akun & Divisi", href: "/admin/users", icon: ShieldCheck, exact: false },
    { name: "Data Relawan", href: "/admin/relawan", icon: Users, exact: false },
    { name: "Rekap Absensi", href: "/admin/absensi", icon: CalendarCheck, exact: false },
    { name: "Laporan Kehadiran", href: "/admin/absensi-relawan", icon: FileSpreadsheet, exact: false },
    { name: "Laporan Divisi", href: "/admin/laporan", icon: ClipboardList, exact: false },
    { name: "Kordinasi", href: "/admin/kordinasi", icon: Megaphone, exact: false },
  ]"""

new_nav = """  const navItems = [
    { name: "Dashboard", href: "/aslap", icon: Home, exact: true },
    { name: "Rekap Absensi", href: "/aslap/absensi", icon: CalendarCheck, exact: false },
    { name: "Laporan Kehadiran", href: "/aslap/absensi-relawan", icon: FileSpreadsheet, exact: false },
    { name: "Laporan Divisi", href: "/aslap/laporan", icon: ClipboardList, exact: false },
    { name: "Kordinasi", href: "/aslap/kordinasi", icon: Megaphone, exact: false },
  ]"""

if old_nav in content:
    content = content.replace(old_nav, new_nav)
    with open("src/components/AslapSidebar.tsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Fixed AslapSidebar")
else:
    print("Could not find navItems in AslapSidebar")

