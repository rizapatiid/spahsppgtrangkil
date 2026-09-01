
import re

with open("src/app/admin/inputabsensi/actions.ts", "r", encoding="utf-8") as f:
    content = f.read()

# Make sure revalidatePath is imported
if "revalidatePath" not in content:
    content = content.replace("import { getServerSession } from \"next-auth\"", "import { getServerSession } from \"next-auth\"\nimport { revalidatePath } from \"next/cache\"")

# Add revalidatePath to saveAbsensiManual
content = content.replace(
    "return { success: true }\n  } catch (error: any) {",
    "revalidatePath(\"/admin/absensi\")\n      revalidatePath(\"/admin/inputabsensi\")\n      revalidatePath(\"/dashboard/riwayat\")\n      return { success: true }\n    } catch (error: any) {"
)

# Add revalidatePath to deleteFotoAbsensiManual
content = content.replace(
    "await prisma.fotoKegiatan.delete({ where: { id: fotoId } })\n    return { success: true }",
    "await prisma.fotoKegiatan.delete({ where: { id: fotoId } })\n    revalidatePath(\"/admin/absensi\")\n    revalidatePath(\"/admin/inputabsensi\")\n    revalidatePath(\"/dashboard/riwayat\")\n    return { success: true }"
)

with open("src/app/admin/inputabsensi/actions.ts", "w", encoding="utf-8") as f:
    f.write(content)
print("done fix_revalidate")

