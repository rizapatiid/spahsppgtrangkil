const fs = require('fs');

const path = 'src/app/admin/pengaturan-libur/PengaturanLiburClient.tsx';
let content = fs.readFileSync(path, 'utf8');

const oldStr = `<div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 shrink-0 mt-1">
                      <CalendarOff size={18} />
                    </div>
                    <div>
                      <h3 className="text-[14px] font-bold text-slate-800">{formatTanggal(item.tanggal)}</h3>
                      <p className="text-[12px] font-medium text-slate-500 mt-0.5">{item.keterangan || "Libur Khusus"}</p>
                      <div className="mt-2 flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md w-fit">
                        <Users size={12} className="text-slate-400" />
                        <span className="text-[11px] font-bold text-slate-600">{item.relawan?.length || 0} Relawan Libur</span>
                      </div>
                    </div>
                  </div>`;

const newStr = `<div className="flex items-start gap-4 cursor-pointer group" onClick={() => setDetailItem(item)}>
                    <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 shrink-0 mt-1 group-hover:bg-rose-100 transition">
                      <CalendarOff size={18} />
                    </div>
                    <div>
                      <h3 className="text-[14px] font-bold text-slate-800 group-hover:text-blue-600 transition">{formatTanggal(item.tanggal)}</h3>
                      <p className="text-[12px] font-medium text-slate-500 mt-0.5">{item.keterangan || "Libur Khusus"}</p>
                      <div className="mt-2 flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md w-fit group-hover:bg-blue-50 transition">
                        <Users size={12} className="text-slate-400 group-hover:text-blue-500" />
                        <span className="text-[11px] font-bold text-slate-600 group-hover:text-blue-700">Lihat {item.relawan?.length || 0} Relawan Libur</span>
                      </div>
                    </div>
                  </div>`;

content = content.replace(oldStr, newStr);

// To be safe with line endings:
const oldStr2 = oldStr.replace(/\r\n/g, '\n');
const newStr2 = newStr.replace(/\r\n/g, '\n');
content = content.replace(oldStr2, newStr2);

fs.writeFileSync(path, content, 'utf8');
