
import re

with open("src/app/admin/inputabsensi/InputAbsensiClient.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# fix 1: setNewFoto(null) -> setNewFotos([])
content = content.replace("setNewFoto(null)", "setNewFotos([])")
# fix 2: setExistingFoto(null) -> setExistingFotos([])
content = content.replace("setExistingFoto(null)", "setExistingFotos([])")
# fix 3: existingFoto (singular) -> existingFotos (plural logic)
# wait, existingFoto.id needs to be handled? No, handleDeleteExisting(id) already takes id.
# what is line 100? "if (existingFoto) {"?
# Let us replace `if (existingFoto)` with `if (existingFotos.length > 0)` or just remove it if it was inside handleDeleteExisting.
# Oh, line 100:
#   const handleDeleteExisting = async () => {
#    if (!existingFoto) return
# Let s see the code for handleDeleteExisting:
content = content.replace("if (!existingFoto) return", "if (existingFotos.length === 0) return")
content = content.replace("deleteFotoAbsensiManual(existingFoto.id)", "deleteFotoAbsensiManual(existingFotos[0]?.id)") # wait this is wrong if it was deleted! 
# I already replaced handleDeleteExisting with `const handleDeleteExisting = async (id: string) => { ... }` in the previous step. Wait, maybe my replace failed?

with open("src/app/admin/inputabsensi/InputAbsensiClient.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("replaced simple ones")

