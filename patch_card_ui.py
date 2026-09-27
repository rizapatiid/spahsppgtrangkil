import re

path = 'src/app/admin/pengaturan-libur/PengaturanLiburClient.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Change the wrapper from divide-y to space-y
old_wrapper = '<div className="divide-y divide-slate-100">'
new_wrapper = '<div className="space-y-3 sm:space-y-4">'
if old_wrapper in content:
    content = content.replace(old_wrapper, new_wrapper)

# 2. Add card styles to the list item
old_item = '<div key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 hover:bg-slate-50/50 transition">'
new_item = '<div key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer">'
if old_item in content:
    content = content.replace(old_item, new_item)
else:
    print("Item wrapper not found")

# 3. Change the actions container to use self-end
old_actions = '<div className="flex flex-wrap items-center justify-end gap-2 shrink-0 sm:ml-3 w-full sm:w-auto mt-1 sm:mt-0">'
new_actions = '<div className="flex flex-wrap items-center gap-2 shrink-0 self-end sm:self-auto">'
if old_actions in content:
    content = content.replace(old_actions, new_actions)
else:
    print("Actions wrapper not found")
    # try another variation if previous patch failed
    old_actions2 = '<div className="flex flex-wrap items-center gap-2 shrink-0 sm:ml-3 w-full sm:w-auto">'
    if old_actions2 in content:
        content = content.replace(old_actions2, new_actions)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
