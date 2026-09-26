import os
import re

path = 'src/app/admin/relawan/RelawanClient.tsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()
    
# Remove ttd state
content = re.sub(r'const \[ttdName, setTtdName\] = useState\([^)]*\)\n\s*const \[ttdNip, setTtdNip\] = useState\([^)]*\)\n', '', content)

# Remove params.set for ttd
content = re.sub(r'if \(ttdName\) params\.set\("ttdName", ttdName\)\n\s*if \(ttdNip\) params\.set\("ttdNip", ttdNip\)\n', '', content)

# Regex to remove the two divs for ttdName and ttdNip inputs
pattern = r'<div>\s*<label className="block text-\[11px\] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Nama Penandatangan \(Kiri Bawah\)</label>\s*<input[^>]+/>\s*</div>\s*<div>\s*<label className="block text-\[11px\] font-extrabold text-slate-400 uppercase tracking-wider mb-1">NIP \(Opsional\)</label>\s*<input[^>]+/>\s*</div>'
content = re.sub(pattern, '', content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
    print("Patched " + path)
