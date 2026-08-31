
import re

with open("src/app/admin/inputabsensi/InputAbsensiClient.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Fix default status assignment
content = content.replace("status: \"HADIR\"", "status: \"Hadir\"")

# Fix map array
old_map = "[\"HADIR\", \"IZIN\", \"SAKIT\", \"ALPHA\"].map(status => ("
new_map = "[\"Hadir\", \"Izin\", \"Sakit\", \"Alfa\"].map(status => ("
content = content.replace(old_map, new_map)

# Fix conditional rendering logic
old_cond = """                        absensiData[a.id]?.status === status 
                          ? (status === "HADIR" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : 
                             status === "IZIN" ? "bg-blue-50 border-blue-200 text-blue-700" : 
                             status === "SAKIT" ? "bg-amber-50 border-amber-200 text-amber-700" : 
                             "bg-red-50 border-red-200 text-red-700")"""

new_cond = """                        absensiData[a.id]?.status === status 
                          ? (status === "Hadir" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : 
                             status === "Izin" ? "bg-blue-50 border-blue-200 text-blue-700" : 
                             status === "Sakit" ? "bg-amber-50 border-amber-200 text-amber-700" : 
                             "bg-red-50 border-red-200 text-red-700")"""
content = content.replace(old_cond, new_cond)

with open("src/app/admin/inputabsensi/InputAbsensiClient.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("done edit status")

