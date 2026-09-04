
import re

with open("src/app/login/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_auth = """    useEffect(() => {
      if (status === "authenticated" && session) {
        if (session.user.role === "ADMIN") {
          router.replace("/admin");
        } else {
          router.replace("/dashboard");
        }
      }
    }, [status, session, router]);"""

new_auth = """    useEffect(() => {
      if (status === "authenticated" && session) {
        if (session.user.role === "ADMIN") {
          router.replace("/admin");
        } else if (session.user.role === "ASLAP") {
          router.replace("/aslap");
        } else {
          router.replace("/dashboard");
        }
      }
    }, [status, session, router]);"""

old_push = """        router.push("/dashboard");
        router.refresh();"""

new_push = """        // Tunggu useEffect yang akan menangani redirect berdasarkan role
        router.refresh();"""

if old_auth in content:
    content = content.replace(old_auth, new_auth)
    content = content.replace(old_push, new_push)
    with open("src/app/login/page.tsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Fixed login/page.tsx")
else:
    print("Could not find block in login/page.tsx")

