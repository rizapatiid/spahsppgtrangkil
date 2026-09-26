import re

path1 = 'src/app/admin/absensi-relawan/AbsensiRelawanClient.tsx'
with open(path1, 'r', encoding='utf-8') as f:
    content1 = f.read()

content1 = content1.replace('const [liburDates, setLiburDates] = useState<string[]>([])', 'const [liburDates, setLiburDates] = useState<Record<string, number[]>>({})')
content1 = content1.replace('setLiburDates(res.liburDates || [])', 'setLiburDates(res.liburDates || {})')
content1 = content1.replace('liburDates.includes(col.dateStr)', '(liburDates[col.dateStr] || []).includes(anggota.id)')

with open(path1, 'w', encoding='utf-8') as f:
    f.write(content1)

path2 = 'src/app/cetak-kehadiran/page.tsx'
with open(path2, 'r', encoding='utf-8') as f:
    content2 = f.read()

content2 = content2.replace('(liburDates || []).includes(col.dateStr)', '(liburDates[col.dateStr] || []).includes(anggota.id)')

with open(path2, 'w', encoding='utf-8') as f:
    f.write(content2)
