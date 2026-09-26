import os
import re

path = 'src/app/admin/relawan/RelawanClient.tsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()
    
# Remove ttd state
content = re.sub(r'const \[ttdName, setTtdName\] = useState\([^)]*\)\s*const \[ttdNip, setTtdNip\] = useState\([^)]*\)', '', content)

# Remove params.set for ttd
content = re.sub(r'if \(ttdName\) params\.set\("ttdName", ttdName\)\s*if \(ttdNip\) params\.set\("ttdNip", ttdNip\)', '', content)

# Remove modal inputs
old_modal_inputs = '''                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Nama Penandatangan (Kiri Bawah)</label>
                    <input 
                      type="text" 
                      value={ttdName} 
                      onChange={(e) => setTtdName(e.target.value)}
                      placeholder="Kosongkan jika ingin garis bawah saja"
                      className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-lg text-[13px] text-slate-800 font-medium outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">NIP Penandatangan (Opsional)</label>
                    <input 
                      type="text" 
                      value={ttdNip} 
                      onChange={(e) => setTtdNip(e.target.value)}
                      placeholder="Contoh: 19800101 200501 1 001"
                      className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-lg text-[13px] text-slate-800 font-medium outline-none" 
                    />
                  </div>
                </div>'''
                  
content = content.replace(old_modal_inputs, '')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
    print("Patched " + path)
