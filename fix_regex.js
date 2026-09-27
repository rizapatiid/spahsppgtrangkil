const fs = require('fs');
const path = 'src/app/admin/pengaturan-libur/PengaturanLiburClient.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/className="flex items-start gap-4"/g, 'className="flex items-start gap-4 cursor-pointer group" onClick={() => setDetailItem(item)}');

fs.writeFileSync(path, content, 'utf8');
