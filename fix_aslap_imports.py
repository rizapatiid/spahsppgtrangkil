
import os
import glob

# Remove actions.ts in aslap
for f in glob.glob("src/app/aslap/**/actions.ts", recursive=True):
    os.remove(f)

# Update imports in aslap
for root, dirs, files in os.walk("src/app/aslap"):
    for file in files:
        if file.endswith(".tsx") or file.endswith(".ts"):
            path = os.path.join(root, file)
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
            
            # Change role === "ADMIN" to role === "ASLAP"
            content = content.replace("session.user.role !== \"ADMIN\"", "session.user.role !== \"ASLAP\"")
            content = content.replace("session?.user?.role !== \"ADMIN\"", "session?.user?.role !== \"ASLAP\"")
            content = content.replace("session?.user.role !== \"ADMIN\"", "session?.user?.role !== \"ASLAP\"")
            content = content.replace("role = \"ADMIN\"", "role = \"ASLAP\"")
            content = content.replace("return \"ADMIN\"", "return \"ASLAP\"")
            
            # Change all /admin paths to /aslap
            content = content.replace("href=\"/admin", "href=\"/aslap")
            content = content.replace("router.push(\"/admin", "router.push(\"/aslap")
            content = content.replace("backUrl={`/admin", "backUrl={`/aslap")
            content = content.replace("redirect(\"/admin", "redirect(\"/aslap")
            
            # Change import from "./actions" to the correct admin action
            # The current folder name is os.path.basename(root)
            folder_name = os.path.basename(root)
            if folder_name in ["absensi", "absensi-relawan", "inputabsensi", "inputlaporan", "kordinasi", "profil", "laporan"]:
                content = content.replace("from \"./actions\"", f"from \"@/app/admin/{folder_name}/actions\"")
            elif folder_name == "[id]" and "laporan" in root:
                content = content.replace("from \"./actions\"", "from \"@/app/admin/laporan/[id]/actions\"")
                
            with open(path, "w", encoding="utf-8") as f:
                f.write(content)

