import re

path = 'src/app/admin/pengaturan-libur/PengaturanLiburClient.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

old_wrapper = '''      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-[15px] font-extrabold text-slate-800">Daftar Jadwal Libur Aktif</h2>
        </div>
        <div className="space-y-3 sm:space-y-4">'''
old_wrapper2 = old_wrapper.replace('\n', '\r\n')

new_wrapper = '''      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[13px] font-extrabold text-slate-800 uppercase tracking-wider">Daftar Jadwal Libur Aktif</h2>
        </div>
        <div className="space-y-3 sm:space-y-4">'''

if old_wrapper in content:
    content = content.replace(old_wrapper, new_wrapper)
elif old_wrapper2 in content:
    content = content.replace(old_wrapper2, new_wrapper)
else:
    print("Wrapper not found")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
