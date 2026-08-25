"use client"

import { useState } from "react"

interface SinglePhotoLightboxProps {
  src: string
  alt?: string
  /** Kelas wrapper div, default sesuai tampilan grid laporan */
  className?: string
  /** Kelas img */
  imgClassName?: string
  children?: React.ReactNode
}

/**
 * Single foto dengan lightbox fullscreen.
 * Bungkus foto tunggal di grid agar bisa diklik untuk preview besar.
 */
export default function SinglePhotoLightbox({
  src,
  alt = "Foto",
  className = "relative group block w-24 h-24 sm:w-full sm:h-auto sm:aspect-[4/3] bg-slate-100 border-r sm:border-r-0 sm:border-b border-slate-100 overflow-hidden shrink-0 cursor-zoom-in",
  imgClassName = "w-full h-full object-cover",
  children,
}: SinglePhotoLightboxProps) {
  const [preview, setPreview] = useState(false)

  return (
    <>
      <div className={className} onClick={() => setPreview(true)}>
        <img src={src} alt={alt} className={imgClassName} />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
          </svg>
        </div>
        {children}
      </div>

      {preview && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setPreview(false)}
        >
          <div
            className="relative max-w-lg w-full bg-white rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Tombol Close X */}
            <button
              onClick={() => setPreview(false)}
              className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all bg-slate-900 hover:bg-slate-700 text-white shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            {/* Foto */}
            <div className="bg-slate-900 max-h-[70vh] overflow-hidden flex items-center justify-center">
              <img src={src} alt={alt} className="w-full max-h-[70vh] object-contain" />
            </div>

            {/* Footer Aksi */}
            <div className="flex gap-2.5 p-4 border-t border-slate-100 bg-white">
              <a
                href={src}
                download="foto.jpg"
                target="_blank"
                rel="noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1.5 text-[13px] font-bold bg-slate-900 text-white hover:bg-slate-800 py-2.5 rounded-lg shadow transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Simpan Foto
              </a>
              <a
                href={src}
                target="_blank"
                rel="noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1.5 text-[13px] font-bold bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 py-2.5 rounded-lg transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
                Buka Tab Baru
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
