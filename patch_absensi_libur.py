import sys

path = 'src/app/admin/absensi-relawan/actions.ts'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add hariLibur fetch
inject = '''
  // Fetch HariLibur within the range
  const hariLiburList = await prisma.hariLibur.findMany({
    where: {
      tanggal: { gte: start, lte: end }
    }
  });
  const liburDates = new Set(hariLiburList.map(h => formatLocal(h.tanggal)));
'''

content = content.replace('  // Fetch Absensi within the range', inject + '\n  // Fetch Absensi within the range')

# Change return statement
content = content.replace('return { matrix, dateColumns, periodStart: formatLocal(start), periodEnd: formatLocal(end) };',
                          'return { matrix, dateColumns, periodStart: formatLocal(start), periodEnd: formatLocal(end), liburDates: Array.from(liburDates) };')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
