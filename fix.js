const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const d = new Date();
  d.setUTCHours(0,0,0,0);
  await prisma.absensi.updateMany({ data: { tanggal: d } });
  await prisma.fotoKegiatan.updateMany({ data: { tanggal: d } });
  console.log('Fixed dates to:', d);
}
main().then(() => process.exit(0));
