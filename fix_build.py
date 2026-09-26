import sys

path1 = 'src/app/admin/pengaturan-libur/actions.ts'
with open(path1, 'r', encoding='utf-8') as f:
    content1 = f.read()
content1 = content1.replace('@/app/api/auth/[...nextauth]/route', '@/lib/auth')
with open(path1, 'w', encoding='utf-8') as f:
    f.write(content1)

path2 = 'src/app/admin/pengaturan-libur/page.tsx'
with open(path2, 'r', encoding='utf-8') as f:
    content2 = f.read()
content2 = content2.replace('@/app/api/auth/[...nextauth]/route', '@/lib/auth')
with open(path2, 'w', encoding='utf-8') as f:
    f.write(content2)

path3 = 'src/components/AdminSidebar.tsx'
with open(path3, 'r', encoding='utf-8') as f:
    content3 = f.read()
# Replace CalendarOff missing import if it was not added correctly
# Wait, my previous script did:
# content = content.replace('import { Home, Users, ClipboardList, ShieldCheck, CalendarCheck, FileSpreadsheet, Megaphone } from "lucide-react"',
# 'import { Home, Users, ClipboardList, ShieldCheck, CalendarCheck, FileSpreadsheet, Megaphone, CalendarOff } from "lucide-react"')
# Let's just blindly add it
import re
if 'CalendarOff' not in re.search(r'import {[^}]+} from "lucide-react"', content3).group():
    content3 = re.sub(r'import {([^}]+)} from "lucide-react"', r'import {\1, CalendarOff} from "lucide-react"', content3)
    with open(path3, 'w', encoding='utf-8') as f:
        f.write(content3)

