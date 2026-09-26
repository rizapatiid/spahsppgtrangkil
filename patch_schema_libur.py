import re

path = 'prisma/schema.prisma'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add relation to HariLibur
content = content.replace('''model HariLibur {
  id          Int      @id @default(autoincrement())
  tanggal     DateTime @db.Date @unique
  keterangan  String?
  created_at  DateTime @default(now())
}''', '''model HariLibur {
  id          Int      @id @default(autoincrement())
  tanggal     DateTime @db.Date @unique
  keterangan  String?
  created_at  DateTime @default(now())
  
  relawan     HariLiburRelawan[]
}

model HariLiburRelawan {
  hari_libur_id Int
  anggota_id    Int
  
  hariLibur     HariLibur     @relation(fields: [hari_libur_id], references: [id], onDelete: Cascade)
  anggota       AnggotaDivisi @relation(fields: [anggota_id], references: [id], onDelete: Cascade)
  
  @@id([hari_libur_id, anggota_id])
}''')

# Add relation to AnggotaDivisi
content = content.replace('// Relasi absensi per anggota\n  absensi_detail AnggotaAbsensi[]', 
                          '// Relasi absensi per anggota\n  absensi_detail AnggotaAbsensi[]\n  jadwal_libur   HariLiburRelawan[]')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
