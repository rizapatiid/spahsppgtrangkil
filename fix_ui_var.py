import re

path1 = 'src/app/admin/absensi-relawan/AbsensiRelawanClient.tsx'
with open(path1, 'r', encoding='utf-8') as f:
    content1 = f.read()
content1 = content1.replace('includes(anggota.id)', 'includes(row.id)')
with open(path1, 'w', encoding='utf-8') as f:
    f.write(content1)

path2 = 'src/app/cetak-kehadiran/page.tsx'
with open(path2, 'r', encoding='utf-8') as f:
    content2 = f.read()
content2 = content2.replace('includes(anggota.id)', 'includes(row.id)')
with open(path2, 'w', encoding='utf-8') as f:
    f.write(content2)
