import re

path = 'src/app/admin/pengaturan-libur/PengaturanLiburClient.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Let's fix the layout of PengaturanLiburClient list items
# Make the button container use `justify-end` on mobile so they look neat,
# and also add top margin on mobile if needed.

old_actions = '<div className="flex flex-wrap items-center gap-2 shrink-0 sm:ml-3 w-full sm:w-auto">'
new_actions = '<div className="flex flex-wrap items-center justify-end gap-2 shrink-0 sm:ml-3 w-full sm:w-auto mt-1 sm:mt-0">'

if old_actions in content:
    content = content.replace(old_actions, new_actions)
else:
    print("Could not find actions container to patch")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
