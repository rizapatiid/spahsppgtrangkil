import os
import re

path = 'src/app/admin/absensi-relawan/AbsensiRelawanClient.tsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()
    
# Remove ttd state
content = re.sub(r'const \[ttdName, setTtdName\] = useState\(""\)\s*const \[ttdNip, setTtdNip\] = useState\(""\)', '', content)

# Remove useEffect logic
content = re.sub(r'setTtdName\(div\.koordinator \|\| ""\)\s*setTtdNip\(div\.nip_koordinator \|\| ""\)', '', content)
content = re.sub(r'setTtdName\(""\)\s*setTtdNip\(""\)', '', content)

# Remove params.set for ttd
content = re.sub(r'if \(ttdName\) params\.set\("ttdName", ttdName\)\s*if \(ttdNip\) params\.set\("ttdNip", ttdNip\)', '', content)

# Replace ttd logic in UI (hidden print block)
old_print_ttd = '''            {ttdName ? (
              <p className="font-bold underline underline-offset-4 decoration-1">{ttdName}</p>
            ) : (
              <>
                <div className="border-b border-black w-48 mx-auto"></div>
                <p className="mt-1 font-semibold text-[10px]">( .................................................... )</p>
              </>
            )}'''
new_print_ttd = '''            <p className="font-bold underline underline-offset-4 decoration-1">Jelya Affa Carely S.Pd</p>'''
content = content.replace(old_print_ttd, new_print_ttd)

# Remove modal inputs
old_modal_inputs = '''                  <div className="pt-4 border-t border-slate-100">
                    <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Penandatangan Laporan</label>
                    <div className="space-y-3">
                      <input 
                        type="text"
                        placeholder="Nama Lengkap"
                        value={ttdName}
                        onChange={e => setTtdName(e.target.value)}
                        className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-lg text-[13px] font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white focus:border-blue-400 transition-all placeholder:font-medium"
                      />
                      <input 
                        type="text"
                        placeholder="NIP (Opsional)"
                        value={ttdNip}
                        onChange={e => setTtdNip(e.target.value)}
                        className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-lg text-[13px] font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white focus:border-blue-400 transition-all placeholder:font-medium"
                      />
                    </div>
                  </div>'''
                  
content = content.replace(old_modal_inputs, '')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
    print("Patched " + path)
