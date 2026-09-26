import re

paths = [
    'src/app/admin/inputabsensi/InputAbsensiClient.tsx',
    'src/app/aslap/inputabsensi/InputAbsensiClient.tsx'
]

for path in paths:
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Add state for liburAnggota
    content = content.replace('const [anggota, setAnggota] = useState<any[]>([])', 
                              'const [anggota, setAnggota] = useState<any[]>([])\n  const [liburAnggota, setLiburAnggota] = useState<any[]>([])')
                              
    # 2. Reset it in useEffect
    content = content.replace('setAnggota([])\n      setAbsensiData({})', 
                              'setAnggota([])\n      setLiburAnggota([])\n      setAbsensiData({})')
                              
    # 3. Set it when loading data
    content = content.replace('setAnggota(res.anggota)', 
                              'setAnggota(res.anggota)\n      setLiburAnggota(res.liburAnggota || [])')
                              
    # 4. Render it at the bottom
    old_bottom = '''            </div>
          )}
        </>
      </div>'''

    new_bottom = '''            </div>
            
            {liburAnggota.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-100 p-5 sm:p-6 bg-white rounded-xl shadow-sm border border-slate-200">
                <h4 className="text-[12px] font-extrabold text-slate-400 uppercase tracking-wider mb-3">Anggota Libur Hari Ini</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {liburAnggota.map((anggota: any) => (
                    <div key={anggota.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 opacity-60">
                      <span className="font-extrabold text-sm text-slate-600 truncate">{anggota.nama}</span>
                      <span className="text-[11px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded mt-2 sm:mt-0 w-fit">Libur</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          )}
        </>
      </div>'''

    content = content.replace(old_bottom, new_bottom)
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
