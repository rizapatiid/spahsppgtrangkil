
import os

for root, dirs, files in os.walk("src/app/aslap"):
    for file in files:
        if file.endswith(".tsx") or file.endswith(".ts"):
            path = os.path.join(root, file)
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
            
            content = content.replace("`/admin", "`/aslap")
            
            with open(path, "w", encoding="utf-8") as f:
                f.write(content)

