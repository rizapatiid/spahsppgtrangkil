import sys
import re

path = 'src/app/cetak-kehadiran/page.tsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add liburDates to destructuring
content = content.replace('const { matrix: dataMatrix, dateColumns, periodStart: actualStart, periodEnd: actualEnd } = res;',
                          'const { matrix: dataMatrix, dateColumns, periodStart: actualStart, periodEnd: actualEnd, liburDates } = res;')

# Modify renderStatus
old_renderStatus = '''  const renderStatus = (status: string) => {
    switch (status) {
      case "Hadir":
        return <div className="mx-auto flex items-center justify-center font-bold text-[12px]"><Check size={14} strokeWidth={4} className="text-black w-3.5 h-3.5" /></div>;
      case "Sakit":
        return <div className="mx-auto flex items-center justify-center font-bold text-[12px] text-black">S</div>;
      case "Izin":
        return <div className="mx-auto flex items-center justify-center font-bold text-[12px] text-black">I</div>;
      case "Alfa":
        return <div className="mx-auto flex items-center justify-center font-bold text-[12px] text-black">-</div>;
      default:
        return <div className="mx-auto"></div>;
    }
  };'''

new_renderStatus = '''  const renderStatus = (status: string, isLibur: boolean) => {
    if (status === "Hadir") {
      return <div className="mx-auto flex items-center justify-center font-bold text-[12px]"><Check size={14} strokeWidth={4} className="text-black w-3.5 h-3.5" /></div>;
    }
    if (status === "Sakit") {
      return <div className="mx-auto flex items-center justify-center font-bold text-[12px] text-black">S</div>;
    }
    if (status === "Izin") {
      return <div className="mx-auto flex items-center justify-center font-bold text-[12px] text-black">I</div>;
    }
    if (status === "Alfa") {
      return <div className="mx-auto flex items-center justify-center font-bold text-[12px] text-black">-</div>;
    }
    if (isLibur) {
      return <div className="mx-auto flex items-center justify-center font-bold text-[12px] text-black">L</div>;
    }
    return <div className="mx-auto"></div>;
  };'''

content = content.replace(old_renderStatus, new_renderStatus)

# Modify renderStatus call
content = content.replace('{renderStatus(status)}', '{renderStatus(status, (liburDates || []).includes(col.dateStr))}')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
