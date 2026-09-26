import re

path = 'src/app/admin/absensi-relawan/actions.ts'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

old_hari_libur = '''  // Fetch HariLibur within the range
  const hariLiburList = await prisma.hariLibur.findMany({
    where: {
      tanggal: { gte: start, lte: end }
    }
  });
  const liburDates = new Set(hariLiburList.map(h => formatLocal(h.tanggal)));'''

new_hari_libur = '''  // Fetch HariLibur and related Relawan within the range
  const hariLiburList = await prisma.hariLibur.findMany({
    where: {
      tanggal: { gte: start, lte: end }
    },
    include: {
      relawan: true
    }
  });
  
  // Format: { "2026-09-15": [1, 2, 3] }
  const liburMap: Record<string, number[]> = {};
  hariLiburList.forEach(h => {
    const dStr = formatLocal(h.tanggal);
    liburMap[dStr] = h.relawan.map(r => r.anggota_id);
  });'''

content = content.replace(old_hari_libur, new_hari_libur)

content = content.replace('liburDates: Array.from(liburDates)', 'liburDates: liburMap')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
