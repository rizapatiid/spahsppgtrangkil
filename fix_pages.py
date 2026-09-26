import re

paths = [
    'src/app/dashboard/absensi/page.tsx',
    'src/app/aslap/isi-absensi/page.tsx'
]

for path in paths:
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    old_code = r'const today = getLogicalDate\(\)\s*const existingAbsensi = await prisma\.absensi\.findFirst\(\{'

    new_code = '''const today = getLogicalDate()
  
  const hariLibur = await prisma.hariLibur.findUnique({
    where: { tanggal: today },
    include: { relawan: true }
  });
  const liburIds = hariLibur ? hariLibur.relawan.map(r => r.anggota_id) : [];

  const existingAbsensi = await prisma.absensi.findFirst({'''

    if 'const liburIds' not in content:
        content = re.sub(old_code, new_code, content)
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
