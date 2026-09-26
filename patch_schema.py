import os

with open('prisma/schema.prisma', 'a', encoding='utf-8') as f:
    f.write('''
model HariLibur {
  id          Int      @id @default(autoincrement())
  tanggal     DateTime @db.Date @unique
  keterangan  String?
  created_at  DateTime @default(now())
}
''')
