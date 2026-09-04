
import os

with open("src/app/aslap/isi-absensi/actions.ts", "r", encoding="utf-8") as file:
    content = file.read()
content = content.replace("revalidatePath(\"/dashboard/absensi\")", "revalidatePath(\"/aslap/isi-absensi\")")
content = content.replace("../../api/auth", "@/app/api/auth")

with open("src/app/aslap/isi-absensi/actions.ts", "w", encoding="utf-8") as file:
    file.write(content)

