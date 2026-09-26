import os
import re

files_to_patch = [
    'src/app/admin/absensi/AbsensiClient.tsx',
    'src/app/admin/inputabsensi/InputAbsensiClient.tsx',
    'src/app/admin/inputlaporan/InputLaporanClient.tsx',
    'src/app/admin/kordinasi/KordinasiClient.tsx',
    'src/app/admin/relawan/RelawanClient.tsx',
    'src/app/admin/users/UsersClient.tsx',
    'src/app/aslap/absensi/AbsensiClient.tsx',
    'src/app/aslap/inputabsensi/InputAbsensiClient.tsx',
    'src/app/aslap/inputlaporan/InputLaporanClient.tsx',
    'src/app/aslap/kordinasi/KordinasiClient.tsx',
    'src/app/dashboard/laporan/LaporanClient.tsx'
]

def patch_file(path):
    if not os.path.exists(path):
        print(f"Not found {path}")
        return
        
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Skip if already patched
    if 'useModal' in content:
        print(f"Already patched {path}")
        return

    if 'alert(' not in content and 'confirm(' not in content:
        print(f"No alert/confirm in {path}")
        return
        
    # 1. Add import
    # Find last import
    last_import = 0
    for match in re.finditer(r'^import.*$', content, re.MULTILINE):
        last_import = match.end()
    
    if last_import > 0:
        content = content[:last_import] + '\nimport { useModal } from "@/components/ModalContext"' + content[last_import:]
    else:
        content = 'import { useModal } from "@/components/ModalContext"\n' + content

    # 2. Inject hook
    # Find component declaration: export default function X(...) {
    comp_match = re.search(r'export default (async )?function \w+\([^)]*\)\s*{', content)
    if comp_match:
        pos = comp_match.end()
        content = content[:pos] + '\n  const { showAlert, showConfirm } = useModal()\n' + content[pos:]

    # 3. Replace alert
    # alert("something") -> showAlert("something")
    content = re.sub(r'\balert\(', 'showAlert(', content)
    
    # 4. Replace confirm
    # Pattern A: if (confirm(...)) {
    content = re.sub(r'if \(\s*confirm\(', 'if (await showConfirm(', content)
    
    # Pattern B: if (!confirm(...)) return
    # This is trickier. Let's do it manually for known patterns.
    # We want to replace `if (!confirm("Hapus foto briefing ini?")) return` 
    # with `const confirmed = await showConfirm("Hapus foto briefing ini?"); if (!confirmed) return`
    
    def repl_b(m):
        msg = m.group(1)
        return f'const confirmed = await showConfirm({msg});\n    if (!confirmed) return'
    
    content = re.sub(r'if\s*\(!confirm\((.*?)\)\)\s*return', repl_b, content)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
        print(f"Patched {path}")

for f in files_to_patch:
    patch_file(f)
