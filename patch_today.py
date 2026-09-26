import os
import re

files_to_patch = [
    'src/app/aslap/isi-absensi/actions.ts',
    'src/app/dashboard/absensi/actions.ts',
    'src/app/dashboard/laporan/actions.ts',
    'src/app/dashboard/page.tsx',
    'src/app/dashboard/absensi/page.tsx',
    'src/app/dashboard/laporan/page.tsx',
    'src/app/aslap/isi-absensi/page.tsx'
]

old_pattern = r'''\s*const now = new Date\(\)\s*const wibDateString = now\.toLocaleDateString\("en-CA", \{ timeZone: "Asia/Jakarta" \}\)\s*const today = new Date\(`\$\{wibDateString\}T00:00:00\.000Z`\)'''
replacement = r'''
  const { getLogicalDate } = await import("@/lib/dateUtils")
  const today = getLogicalDate()'''

for path in files_to_patch:
    if not os.path.exists(path):
        print(f"Not found {path}")
        continue
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'wibDateString' in content:
        content = re.sub(old_pattern, replacement, content)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Patched {path}")
    else:
        print(f"No match in {path}")
