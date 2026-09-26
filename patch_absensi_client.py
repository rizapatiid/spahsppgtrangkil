import sys
import re

path = 'src/app/admin/absensi-relawan/AbsensiRelawanClient.tsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add liburDates state
content = content.replace('const [actualEnd, setActualEnd] = useState("")',
                          'const [actualEnd, setActualEnd] = useState("")\n  const [liburDates, setLiburDates] = useState<string[]>([])')

# Set liburDates from res
content = content.replace('setActualEnd(res.periodEnd)',
                          'setActualEnd(res.periodEnd)\n      setLiburDates(res.liburDates || [])')

# Modify renderStatus to accept isLibur
old_renderStatus = '''  const renderStatus = (status: string) => {
    switch (status) {
      case "Hadir":'''
new_renderStatus = '''  const renderStatus = (status: string, isLibur: boolean) => {
    if (status === "Hadir") {
      return <div className="mx-auto flex items-center justify-center font-bold text-[12px] print:w-auto print:h-auto"><Check size={14} strokeWidth={4} className="text-emerald-600 print:text-black print:w-3.5 print:h-3.5" /></div>
    }
    if (status === "Sakit") {
      return <div className="mx-auto flex items-center justify-center font-bold text-[12px] text-amber-600 print:w-auto print:h-auto print:text-black" title="Sakit">S</div>
    }
    if (status === "Izin") {
      return <div className="mx-auto flex items-center justify-center font-bold text-[12px] text-purple-600 print:w-auto print:h-auto print:text-black" title="Izin">I</div>
    }
    if (status === "Alfa") {
      return <div className="mx-auto flex items-center justify-center font-bold text-[12px] text-rose-600 print:w-auto print:h-auto print:text-black" title="Alfa">-</div>
    }
    if (isLibur) {
      return <div className="mx-auto flex items-center justify-center font-bold text-[12px] text-red-500 print:w-auto print:h-auto print:text-black" title="Libur">L</div>
    }
    return <span className="text-slate-300 print:text-transparent print:hidden">-</span>
  }'''

# Since we don't want to mess up the regex matching for renderStatus switch statement, let's just use regex.
content = re.sub(r'const renderStatus = \(status: string\) => \{[\s\S]*?return <span className="text-slate-300 print:text-transparent print:hidden">-</span>\n    \}\n  \}', new_renderStatus, content)

# Change the call to renderStatus
content = content.replace('{renderStatus(status)}', '{renderStatus(status, liburDates.includes(col.dateStr))}')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
