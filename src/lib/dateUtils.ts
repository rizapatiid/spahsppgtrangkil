/**
 * Mengambil tanggal logis berdasarkan aturan shift SPPG Trangkil.
 * Aturan:
 * - Jam 17:00 ke atas dihitung masuk ke tanggal keesokan harinya.
 * - Sebelum jam 17:00 dihitung tanggal hari ini.
 * 
 * @param inputDate Objek Date opsional, default adalah saat ini (now)
 * @returns Objek Date yang mewakili tanggal (dengan waktu 00:00:00 UTC) 
 *          yang sesuai dengan shift yang berlaku.
 */
export function getLogicalDate(inputDate: Date = new Date()): Date {
  // Ambil waktu spesifik di zona WIB
  const wibTimeStr = inputDate.toLocaleString("en-US", { timeZone: "Asia/Jakarta" });
  const wibTime = new Date(wibTimeStr);
  
  const hours = wibTime.getHours();
  
  // Jika sudah jam 17:00 atau lebih, masuk ke hari besok
  if (hours >= 17) {
    wibTime.setDate(wibTime.getDate() + 1);
  }
  
  // Format menjadi YYYY-MM-DD
  const yyyy = wibTime.getFullYear();
  const mm = String(wibTime.getMonth() + 1).padStart(2, '0');
  const dd = String(wibTime.getDate()).padStart(2, '0');
  
  // Kembalikan sebagai UTC Midnight
  return new Date(`${yyyy}-${mm}-${dd}T00:00:00.000Z`);
}

/**
 * Mendapatkan string YYYY-MM-DD dari tanggal logis untuk keperluan form/UI.
 */
export function getLogicalDateString(inputDate: Date = new Date()): string {
  const d = getLogicalDate(inputDate);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
