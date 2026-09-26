import re

paths = [
    'src/app/admin/inputabsensi/InputAbsensiClient.tsx',
    'src/app/aslap/inputabsensi/InputAbsensiClient.tsx',
    'src/app/aslap/isi-absensi/AbsensiClient.tsx'
]

for path in paths:
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Modify function signature
    if 'InputAbsensiClient' in path:
        content = content.replace('export default function InputAbsensiClient({ absensiData, divisiList }: { absensiData: any[], divisiList: any[] }) {', 
                                  'export default function InputAbsensiClient({ absensiData, divisiList, liburIds = [] }: { absensiData: any[], divisiList: any[], liburIds?: number[] }) {')
        # Wait, for Admin inputabsensi, they pick the division and the date! 
        # So `liburIds` is dynamic based on selectedDate and selectedDivisi!
        # Passing `liburIds` statically won't work perfectly if they change the date!
        pass
    
    if 'AbsensiClient' in path and 'isi-absensi' in path:
        content = content.replace('export default function AbsensiClient({ anggotaList, divisiName }: { anggotaList: any[], divisiName: string }) {', 
                                  'export default function AbsensiClient({ anggotaList, divisiName, liburIds = [] }: { anggotaList: any[], divisiName: string, liburIds?: number[] }) {\n  const activeAnggota = anggotaList.filter((a:any) => !liburIds.includes(a.id))\n  const liburAnggota = anggotaList.filter((a:any) => liburIds.includes(a.id))')

        content = content.replace('anggotaList.map((anggota: any, index: number)', 'activeAnggota.map((anggota: any, index: number)')
        content = content.replace('anggotaList.map((anggota: any)', 'activeAnggota.map((anggota: any)')
        
        old_bottom = '''                </div>
              </div>

              {/* Upload Foto Briefing Section */}'''

        new_bottom = '''                </div>
                
                {liburAnggota.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-slate-100">
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
              </div>

              {/* Upload Foto Briefing Section */}'''

        content = content.replace(old_bottom, new_bottom)

        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
