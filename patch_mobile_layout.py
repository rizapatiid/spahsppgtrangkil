import re

path = 'src/app/admin/pengaturan-libur/PengaturanLiburClient.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the row container
old_row = '<div key={item.id} className="p-4 sm:p-5 flex items-start justify-between hover:bg-slate-50/50 transition">'
new_row = '<div key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 hover:bg-slate-50/50 transition">'
if old_row in content:
    content = content.replace(old_row, new_row)

# Replace the action buttons container
old_actions = '<div className="flex flex-wrap items-center gap-1.5 shrink-0 ml-3">'
new_actions = '<div className="flex flex-wrap items-center gap-2 shrink-0 sm:ml-3 w-full sm:w-auto">'
if old_actions in content:
    content = content.replace(old_actions, new_actions)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
