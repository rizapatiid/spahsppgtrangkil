
import os
import glob

for f in glob.glob("src/app/aslap/isi-absensi/**/*.tsx", recursive=True):
    with open(f, "r", encoding="utf-8") as file:
        content = file.read()
    content = content.replace("href=\"/dashboard\"", "href=\"/aslap\"")
    content = content.replace("href=\"/dashboard/riwayat\"", "href=\"/aslap/absensi\"")
    content = content.replace("router.push(\"/dashboard\")", "router.push(\"/aslap\")")
    content = content.replace("../../api/auth", "@/app/api/auth")
    with open(f, "w", encoding="utf-8") as file:
        file.write(content)
        
print("Fixed isi-absensi")

