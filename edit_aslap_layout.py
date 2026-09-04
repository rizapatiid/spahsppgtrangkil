
import re

with open("src/app/aslap/layout.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("import AdminSidebar from \"@/components/AdminSidebar\"", "import AslapSidebar from \"@/components/AslapSidebar\"")
content = content.replace("export default async function AdminLayout", "export default async function AslapLayout")
content = content.replace("session.user.role !== \"ADMIN\"", "session.user.role !== \"ASLAP\"")
content = content.replace("<AdminSidebar />", "<AslapSidebar />")

with open("src/app/aslap/layout.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Fixed layout.tsx")

