import re

paths = [
    'src/app/dashboard/absensi/page.tsx',
    'src/app/aslap/isi-absensi/page.tsx'
]

for path in paths:
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    old_code = '''  const today = getLogicalDate()
  
  const existingAbsensi = await prisma.absensi.findFirst({'''

    new_code = '''  const today = getLogicalDate()
  
  const hariLibur = await prisma.hariLibur.findUnique({
    where: { tanggal: today },
    include: { relawan: true }
  });
  const liburIds = hariLibur ? hariLibur.relawan.map(r => r.anggota_id) : [];

  const existingAbsensi = await prisma.absensi.findFirst({'''

    content = content.replace(old_code, new_code)
    
    # Pass to AbsensiClient
    content = content.replace('anggotaList={anggotaList} divisiName={session?.user.role || "UNKNOWN"}', 
                              'anggotaList={anggotaList} divisiName={session?.user.role || "UNKNOWN"} liburIds={liburIds}')
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
