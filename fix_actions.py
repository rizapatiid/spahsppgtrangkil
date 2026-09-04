
import os
import glob
import re

def update_role_check(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Ganti check === "ADMIN" jadi !== "ADMIN" && session.user.role !== "ASLAP" atau semacamnya
    # Biasanya: if (!session || session.user.role !== "ADMIN") 
    content = content.replace("session.user.role !== \"ADMIN\"", "(session.user.role !== \"ADMIN\" && session.user.role !== \"ASLAP\")")
    content = content.replace("session?.user.role !== \"ADMIN\"", "(session?.user?.role !== \"ADMIN\" && session?.user?.role !== \"ASLAP\")")
    
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Updated", file_path)

# Update actions in admin
for f in glob.glob("src/app/admin/**/actions.ts", recursive=True):
    update_role_check(f)

# Update actions in dashboard (just in case they check ADMIN)
for f in glob.glob("src/app/dashboard/**/actions.ts", recursive=True):
    update_role_check(f)

