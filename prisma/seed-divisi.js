const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('Spahsppgtrangkil1', 10)
  
  const roles = [
    { role: 'PERSIAPAN', nama: 'Divisi Persiapan', username: 'divisi_persiapan' },
    { role: 'PENGOLAHAN', nama: 'Divisi Pengolahan', username: 'divisi_pengolahan' },
    { role: 'PEMORSIAN', nama: 'Divisi Pemorsian', username: 'divisi_pemorsian' },
    { role: 'DISTRIBUSI', nama: 'Divisi Distribusi', username: 'divisi_distribusi' },
    { role: 'PENCUCIAN', nama: 'Divisi Pencucian', username: 'divisi_pencucian' },
    { role: 'KEBERSIHAN', nama: 'Divisi Kebersihan', username: 'divisi_kebersihan' },
    { role: 'SATPAM', nama: 'Divisi Satpam', username: 'divisi_satpam' }
  ]

  for (const item of roles) {
    const divisi = await prisma.divisi.create({
      data: {
        nama_divisi: item.nama,
        jumlah_anggota: 0,
      }
    })

    await prisma.user.upsert({
      where: { username: item.username },
      update: {},
      create: {
        username: item.username,
        password_hash: passwordHash,
        role: item.role,
        status: true,
        divisi_id: divisi.id
      },
    })
  }

  console.log('Seeded all division users')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
