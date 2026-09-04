
import { prisma } from "./src/lib/prisma"

async function main() {
  const divisi = await prisma.divisi.findMany()
  console.log(divisi)
}
main().catch(console.error).finally(() => prisma.$disconnect())

