import os

src_dir = 'd:/sppgtrangkil/src'
for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith(('.ts', '.tsx')):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            if 'authOptions' in content and 'api/auth' in content:
                print(filepath)
                # replace all variants
                new_content = content.replace('"@/app/api/auth/[...nextauth]/route"', '"@/lib/auth"')
                new_content = new_content.replace('"../../api/auth/[...nextauth]/route"', '"@/lib/auth"')
                new_content = new_content.replace('"../../../api/auth/[...nextauth]/route"', '"@/lib/auth"')
                new_content = new_content.replace('"../api/auth/[...nextauth]/route"', '"@/lib/auth"')
                if new_content != content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
