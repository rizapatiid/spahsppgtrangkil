"use client"

import { X, AlertTriangle, Info, Check } from "lucide-react"

interface AlertModalProps {
  isOpen: boolean
  title?: string
  message: string
  buttonText?: string
  onClose: () => void
  type?: "danger" | "success" | "info"
}

export default function AlertModal({
  isOpen,
  title,
  message,
  buttonText = "Tutup",
  onClose,
  type = "info"
}: AlertModalProps) {
  if (!isOpen) return null

  const colorMap = {
    danger: {
      btn: "bg-red-600 hover:bg-red-700 text-white",
      iconBg: "bg-rose-50 text-rose-600 border-rose-100",
      icon: <AlertTriangle size={22} className="text-rose-600" />,
      defaultTitle: "Perhatian"
    },
    success: {
      btn: "bg-emerald-600 hover:bg-emerald-700 text-white",
      iconBg: "bg-emerald-50 text-emerald-600 border-emerald-100",
      icon: <Check size={22} className="text-emerald-600" />,
      defaultTitle: "Berhasil"
    },
    info: {
      btn: "bg-slate-900 hover:bg-slate-800 text-white",
      iconBg: "bg-blue-50 text-blue-600 border-blue-100",
      icon: <Info size={22} className="text-blue-600" />,
      defaultTitle: "Informasi"
    }
  }

  const colors = colorMap[type] || colorMap.info

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden relative border border-slate-100 animate-scale-up p-5 flex flex-col items-center text-center gap-4.5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Action Icon SVG */}
        <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${colors.iconBg} mt-1.5`}>
          {colors.icon}
        </div>

        {/* Title & Message */}
        <div className="space-y-1 px-1">
          <h3 className="font-extrabold text-[15px] text-slate-850 tracking-tight">{title || colors.defaultTitle}</h3>
          <p className="text-[12.5px] font-semibold text-slate-500 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Actions Buttons with SVG Icons */}
        <div className="flex items-center gap-2.5 w-full mt-1.5">
          <button
            onClick={onClose}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[12px] font-extrabold transition active:scale-[0.98] cursor-pointer ${colors.btn}`}
          >
            <Check size={13} strokeWidth={3} />
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  )
}
