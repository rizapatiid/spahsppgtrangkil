import re

path = 'src/app/admin/inputabsensi/actions.ts'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

old_code = '''  const divisi = await prisma.divisi.findUnique({
    where: { id: divisiId },
    include: { anggota: true }
  })

  return { absensi, anggota: divisi?.anggota || [], fotoBriefingList }'''

new_code = '''  const divisi = await prisma.divisi.findUnique({
    where: { id: divisiId },
    include: { anggota: true }
  })

  const hariLibur = await prisma.hariLibur.findUnique({
    where: { tanggal: targetDate },
    include: { relawan: true }
  })
  
  const liburIds = hariLibur ? hariLibur.relawan.map(r => r.anggota_id) : []
  
  const activeAnggota = (divisi?.anggota || []).filter(a => !liburIds.includes(a.id))
  const liburAnggota = (divisi?.anggota || []).filter(a => liburIds.includes(a.id))

  return { absensi, anggota: activeAnggota, liburAnggota, fotoBriefingList }'''

content = content.replace(old_code, new_code)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
