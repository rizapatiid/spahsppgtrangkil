import re

path = 'src/app/admin/pengaturan-libur/actions.ts'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add import revalidatePath
content = content.replace('import { authOptions } from "@/lib/auth"', 'import { authOptions } from "@/lib/auth"\nimport { revalidatePath } from "next/cache"')

# Add revalidatePath to saveJadwalLibur
old_save = '''    return { success: true }
  } catch (e: any) {'''

new_save = '''    revalidatePath("/")
    revalidatePath("/dashboard/absensi")
    revalidatePath("/admin/absensi-relawan")
    revalidatePath("/cetak-kehadiran")
    return { success: true }
  } catch (e: any) {'''

content = content.replace(old_save, new_save)

# Add revalidatePath to deleteHariLibur
old_delete = '''    return { success: true }
  } catch (e: any) {'''

new_delete = '''    revalidatePath("/")
    revalidatePath("/dashboard/absensi")
    revalidatePath("/admin/absensi-relawan")
    revalidatePath("/cetak-kehadiran")
    return { success: true }
  } catch (e: any) {'''

# Since we want to replace both old_save and old_delete which look exactly the same:
content = content.replace('    return { success: true }\n  } catch (e: any) {', 
                          '    revalidatePath("/")\n    revalidatePath("/dashboard/absensi")\n    revalidatePath("/admin/absensi-relawan")\n    revalidatePath("/cetak-kehadiran")\n    return { success: true }\n  } catch (e: any) {')


with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
