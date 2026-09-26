import sys

path = 'src/components/AdminSidebar.tsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('import { Home, Users, ClipboardList, ShieldCheck, CalendarCheck, FileSpreadsheet, Megaphone } from "lucide-react"',
                          'import { Home, Users, ClipboardList, ShieldCheck, CalendarCheck, FileSpreadsheet, Megaphone, CalendarOff } from "lucide-react"')

content = content.replace('{ name: "Kordinasi", href: "/admin/kordinasi", icon: Megaphone, exact: false },',
                          '{ name: "Kordinasi", href: "/admin/kordinasi", icon: Megaphone, exact: false },\n    { name: "Pengaturan Libur", href: "/admin/pengaturan-libur", icon: CalendarOff, exact: false },')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
