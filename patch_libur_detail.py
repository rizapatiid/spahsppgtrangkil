import re

path = 'src/app/admin/pengaturan-libur/actions.ts'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

old_query = '''    include: {
      relawan: true
    }'''

new_query = '''    include: {
      relawan: {
        include: {
          anggota: {
            select: { nama: true, divisi: { select: { nama_divisi: true } } }
          }
        }
      }
    }'''

content = content.replace(old_query, new_query)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
