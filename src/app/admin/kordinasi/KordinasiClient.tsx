'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Plus, Edit2, Trash2, Megaphone, CheckCircle2, AlertCircle, X, Search, Eye, Clock } from 'lucide-react'
import { createArahan, updateArahan, deleteArahan } from './actions'

type Divisi = {
  id: number
  nama_divisi: string
}

type Arahan = {
  id: number
  judul: string
  isi: string
  image_url: string | null
  divisi_id: number | null
  created_at: Date
  divisi: Divisi | null
}

export default function KordinasiClient({ arahan, divisiList }: { arahan: Arahan[], divisiList: Divisi[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentId, setCurrentId] = useState<number | null>(null)
  
  const [judul, setJudul] = useState('')
  const [isi, setIsi] = useState('')
  const [divisiId, setDivisiId] = useState('all')
  const [image, setImage] = useState<File | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [searchTerm, setSearchTerm] = useState('')
  const [viewItem, setViewItem] = useState<Arahan | null>(null)

  const openAddModal = () => {
    setIsEditing(false)
    setCurrentId(null)
    setJudul('')
    setIsi('')
    setDivisiId('all')
    setImage(null)
    setError('')
    setSuccess('')
    setIsModalOpen(true)
  }

  const openEditModal = (item: Arahan) => {
    setIsEditing(true)
    setCurrentId(item.id)
    setJudul(item.judul)
    setIsi(item.isi)
    setDivisiId(item.divisi_id ? item.divisi_id.toString() : 'all')
    setImage(null) // Optionally show existing image, but file input stays empty
    setError('')
    setSuccess('')
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    
    try {
      const formData = new FormData()
      formData.append('judul', judul)
      formData.append('isi', isi)
      formData.append('divisi_id', divisiId)
      if (image) {
        formData.append('image', image)
      }

      if (isEditing && currentId) {
        await updateArahan(currentId, formData)
        setSuccess('Arahan berhasil diperbarui!')
      } else {
        await createArahan(formData)
        setSuccess('Arahan berhasil ditambahkan!')
      }
      
      setTimeout(() => {
        setIsModalOpen(false)
        setSuccess('')
      }, 1500)
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus arahan ini?')) {
      try {
        await deleteArahan(id)
      } catch (err) {
        alert('Gagal menghapus arahan')
      }
    }
  }

  const filteredArahan = arahan.filter(item => 
    item.judul.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.isi.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex items-center justify-between gap-3 mb-2 pb-4 border-b border-slate-200/80 px-1">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Megaphone size={18} strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <h2 className="text-[15px] sm:text-[16px] font-extrabold text-slate-800 tracking-tight truncate">Kordinasi & Arahan</h2>
            <p className="text-[11px] text-slate-500 font-medium truncate">Kirim instruksi ke divisi terkait</p>
          </div>
        </div>
        
        <button 
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3 sm:px-4 py-2 rounded-lg text-[12px] font-bold shadow-sm transition-all shrink-0 cursor-pointer"
        >
          <Plus size={15} />
          <span className="hidden sm:inline">Buat Arahan</span>
          <span className="sm:hidden">Buat</span>
        </button>
      </div>

      {/* Cari & List */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
          <h3 className="text-[13px] font-extrabold text-slate-800 uppercase tracking-wider hidden sm:block">
            Daftar Arahan
          </h3>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder="Cari arahan..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-[12px] outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition shadow-sm"
              />
            </div>
            <span className="text-[11px] text-slate-400 font-semibold shrink-0">
              {filteredArahan.length} Data
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          {filteredArahan.length === 0 ? (
            <div className="py-12 text-center bg-white rounded-xl border border-slate-200 border-dashed">
              <Megaphone size={32} className="mx-auto text-slate-300 mb-3" />
              <h3 className="text-[14px] text-slate-600 font-bold mb-1">Tidak ada arahan</h3>
              <p className="text-slate-500 text-[12px]">Belum ada instruksi atau arahan yang dibuat.</p>
            </div>
          ) : (
            filteredArahan.map((item) => (
              <div key={item.id} className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col sm:flex-row gap-3 px-3 py-3 sm:px-4 items-start sm:items-center">
                
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {item.image_url ? (
                    <img src={item.image_url} alt="Lampiran" className="w-12 h-12 rounded-lg object-cover border border-slate-100 shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Megaphone size={20} strokeWidth={2.5} />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-[13px] sm:text-[14px] font-extrabold text-slate-800 truncate leading-tight">{item.judul}</h3>
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider shrink-0 ${
                        !item.divisi_id ? 'bg-purple-50 text-purple-600 border border-purple-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                      }`}>
                        {!item.divisi_id ? 'Semua Divisi' : item.divisi?.nama_divisi}
                      </span>
                    </div>
                    <p className="text-[12px] text-slate-500 line-clamp-1 mb-1">{item.isi}</p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {new Date(item.created_at).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'})} WIB
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 mt-2 sm:mt-0 pt-2 sm:pt-0 border-t border-slate-100 sm:border-0 w-full sm:w-auto justify-end">
                  <button onClick={() => setViewItem(item)} className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 text-[12px] font-bold transition-colors cursor-pointer">
                    <Eye size={13} strokeWidth={2.5} />
                    <span className="hidden sm:inline">Detail</span>
                  </button>
                  <button onClick={() => openEditModal(item)} className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-[12px] font-bold transition-colors cursor-pointer">
                    <Edit2 size={13} strokeWidth={2.5} />
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-[12px] font-bold transition-colors cursor-pointer">
                    <Trash2 size={13} strokeWidth={2.5} />
                    <span className="hidden sm:inline">Hapus</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 max-h-[90vh]">
            <div className="bg-slate-900 p-4 sm:p-5 flex items-center justify-between text-white shrink-0 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Megaphone size={18} className="text-blue-400" />
                <h3 className="font-extrabold text-[14px]">
                  {isEditing ? 'Edit Arahan' : 'Buat Arahan Baru'}
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-100">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-600 text-sm font-medium rounded-lg border border-emerald-100">
                  <CheckCircle2 size={16} />
                  <span>{success}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  Pilih Target Divisi
                </label>
                <select 
                  value={divisiId} 
                  onChange={(e) => setDivisiId(e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50/50 p-2.5 rounded-lg text-[13px] text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none"
                >
                  <option value="all">📢 Semua Divisi (Broadcast)</option>
                  {divisiList.map(d => (
                    <option key={d.id} value={d.id}>{d.nama_divisi}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  Judul Arahan
                </label>
                <input 
                  type="text" 
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  placeholder="Contoh: Persiapan Acara Besar"
                  className="w-full border border-slate-200 bg-slate-50/50 p-2.5 rounded-lg text-[13px] text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  Isi Arahan / Instruksi
                </label>
                <textarea 
                  value={isi}
                  onChange={(e) => setIsi(e.target.value)}
                  placeholder="Tuliskan detail instruksi di sini..."
                  rows={4}
                  className="w-full border border-slate-200 bg-slate-50/50 p-2.5 rounded-lg text-[13px] text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none resize-none"
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  Lampiran Gambar (Opsional)
                </label>
                <input 
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setImage(e.target.files[0])
                    } else {
                      setImage(null)
                    }
                  }}
                  className="block w-full text-[13px] text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[12px] file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
                />
                {isEditing && !image && arahan.find(a => a.id === currentId)?.image_url && (
                  <p className="text-[11px] text-slate-500 mt-2">Gambar sudah ada. Upload gambar baru untuk mengganti.</p>
                )}
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg text-[13px] font-bold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Menyimpan...' : (isEditing ? 'Simpan Perubahan' : 'Kirim Arahan')}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Detail Modal */}
      {viewItem && mounted && createPortal(
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 max-h-[90vh]">
            {/* Header Gelap (Konsisten dengan form) */}
            <div className="bg-slate-900 p-4 sm:p-5 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-2">
                <Megaphone size={18} className="text-blue-400" />
                <h3 className="font-extrabold text-[14px]">Detail Arahan</h3>
              </div>
              <button 
                onClick={() => setViewItem(null)}
                className="text-slate-400 hover:text-white transition"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Konten Utama - Bersih tanpa card */}
            <div className="p-5 sm:p-6 overflow-y-auto bg-white">
              <div className="mb-4">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight mb-2">
                  {viewItem.judul}
                </h2>
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    !viewItem.divisi_id ? 'bg-purple-50 text-purple-600 border border-purple-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                  }`}>
                    {!viewItem.divisi_id ? 'Semua Divisi' : viewItem.divisi?.nama_divisi}
                  </span>
                  <span className="flex items-center gap-1.5 text-[12px] text-slate-500 font-medium">
                    <Clock size={13} />
                    {new Date(viewItem.created_at).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'})} WIB
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <p className="text-[14px] sm:text-[15px] text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {viewItem.isi}
                </p>
              </div>

              {viewItem.image_url && (
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Lampiran Gambar:
                  </span>
                  <img 
                    src={viewItem.image_url} 
                    alt="Lampiran Detail" 
                    className="w-full h-auto max-h-[350px] object-cover rounded-xl border border-slate-200" 
                  />
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button 
                onClick={() => setViewItem(null)}
                className="px-5 py-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-lg text-[13px] font-bold shadow-sm transition-all hover:bg-slate-50"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
