import re

paths = [
    'src/app/dashboard/absensi/AbsensiClient.tsx',
    'src/app/aslap/isi-absensi/AbsensiClient.tsx'
]

for path in paths:
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace anggotaList.map with activeAnggota.map
    content = content.replace('anggotaList.map((anggota) => (', 'activeAnggota.map((anggota: any) => (')
    content = content.replace('anggotaList.map((anggota: any) => (', 'activeAnggota.map((anggota: any) => (')
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
