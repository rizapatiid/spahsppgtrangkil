import sys

path = 'src/app/admin/relawan/RelawanClient.tsx'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip = False
for line in lines:
    if 'const [ttdName, setTtdName]' in line:
        continue
    if 'const [ttdNip, setTtdNip]' in line:
        continue
    if 'if (ttdName) params.set("ttdName", ttdName)' in line:
        continue
    if 'if (ttdNip) params.set("ttdNip", ttdNip)' in line:
        continue
        
    if '<label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Nama Penandatangan (Kiri Bawah)</label>' in line:
        skip = True
        # remove the preceding <div>
        if new_lines[-1].strip() == '<div>':
            new_lines.pop()
    
    if skip:
        if '</div>' in line:
            # We need to skip this line and also check if we are out of the inputs.
            # There are two inputs. Nama Penandatangan and NIP.
            pass
            
    if not skip:
        new_lines.append(line)

# Let's just use string replace for the whole chunk.
