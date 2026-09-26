import os

path = 'src/app/admin/relawan/RelawanClient.tsx'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip = False
for line in lines:
    if 'const [ttdName, setTtdName] = useState(' in line:
        continue
    if 'const [ttdNip, setTtdNip] = useState(' in line:
        continue
    if 'if (ttdName) params.set("ttdName", ttdName)' in line:
        continue
    if 'if (ttdNip) params.set("ttdNip", ttdNip)' in line:
        continue
        
    if 'Nama Penandatangan' in line:
        skip = True
        if new_lines[-1].strip() == '<div>':
            new_lines.pop()
    
    if skip:
        if '</div>' in line:
            # We want to skip 2 divs. Let's just wait until we see <div className="flex justify-end gap-3
            pass
        if '<div className="flex justify-end gap-3' in line:
            skip = False
            # pop the closing tag of the wrapper div that might have been skipped? No, wait.
            # It's inside <div className="p-5 space-y-4">
            # The next element is <div className="flex justify-end gap-3 ...
            # Wait, the structure is:
            # <div className="p-5 space-y-4">
            #   <div><select.../></div>
            #   <div><input ttdName/></div>
            #   <div><input ttdNip/></div>
            # </div>
            # <div className="flex justify-end gap-3 ...
            new_lines.append('                </div>\n')
            new_lines.append(line)
            continue
            
    if not skip:
        new_lines.append(line)

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
