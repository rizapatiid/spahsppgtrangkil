import re

path = 'src/app/admin/pengaturan-libur/PengaturanLiburClient.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace <span className="hidden sm:inline">Detail</span> with Detail
content = content.replace('<span className="hidden sm:inline">Detail</span>', 'Detail')
content = content.replace('<span className="hidden sm:inline">Edit</span>', 'Edit')
content = content.replace('<span className="hidden sm:inline">Hapus</span>', 'Hapus')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
