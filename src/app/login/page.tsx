"use client";

import { signIn, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Lock, Eye, EyeOff, AlertCircle, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && session) {
      if (session.user.role === "ADMIN") {
        router.replace("/admin");
      } else if (session.user.role === "ASLAP") {
        router.replace("/aslap");
      } else {
        router.replace("/dashboard");
      }
    }
  }, [status, session, router]);

  if (status === "loading" || status === "authenticated") {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      username,
      password,
    });

    if (res?.error) {
      setError("Username atau password salah");
      setLoading(false);
    } else {
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      
      {/* KIRI: Brand Banner (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Glowing Blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-slate-500/5 rounded-full blur-3xl pointer-events-none" />
        
        {/* Header Logo */}
        <div className="flex items-center gap-3.5 relative z-10">
          <img 
            src="https://res.cloudinary.com/glcpjxnr/image/upload/v1787672024/sppg_trangkil/assets/gcvi4ohrnoapnxb8dfro.png" 
            alt="Logo SPAH" 
            className="h-14 w-auto object-contain shrink-0" 
            style={{
              filter: "drop-shadow(0 0 1.2px rgba(255, 255, 255, 0.95)) drop-shadow(0 0 0.3px rgba(255, 255, 255, 0.7))"
            }}
          />
        </div>

        {/* Brand Slogan */}
        <div className="my-auto max-w-md relative z-10 space-y-4">
          <h2 className="text-4xl font-black leading-tight tracking-tight">
            Sistem Pelaporan Aktivitas Harian.
          </h2>
          <p className="text-slate-300 text-[14px] leading-relaxed font-medium">
            Memantau dan merekapitulasi kehadiran, laporan kerja harian, serta dokumentasi kegiatan seluruh divisi SPPG Trangkil secara praktis dan real-time.
          </p>
        </div>

        {/* Footer Info */}
        <div className="text-[11px] text-slate-500 font-semibold tracking-wider uppercase relative z-10 flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-blue-500" />
          <span>SPAH SPPG TRANGKIL • SECURE LOGIN CLIENT</span>
        </div>
      </div>

      {/* KANAN: Form Login (Tanpa Card Box, Organis di Layar) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-20 relative bg-white">
        
        {/* Glow blob for mobile screen */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none lg:hidden" />
        
        <div className="w-full max-w-sm space-y-8 relative z-10">
          
          {/* Header Mobile & Branding */}
          <div className="space-y-3">
            <div className="flex items-center justify-between lg:justify-start">
              <img src="https://res.cloudinary.com/glcpjxnr/image/upload/v1787672024/sppg_trangkil/assets/gcvi4ohrnoapnxb8dfro.png" alt="Logo SPAH" className="h-14 w-auto object-contain lg:hidden -ml-2" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">Selamat Datang 👋</h1>
              <p className="text-slate-400 text-[12px] font-bold uppercase tracking-wider mt-1.5">
                Masuk ke akun Divisi / Admin Anda
              </p>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-rose-50/50 border border-rose-200/60 rounded-xl p-3 flex items-start gap-3 shadow-[0_1px_3px_rgba(244,63,94,0.05)] select-none">
              <AlertCircle size={16} className="text-rose-500 shrink-0 mt-0.5" strokeWidth={2.5} />
              <div className="space-y-0.5">
                <h4 className="text-[12px] font-extrabold text-rose-800 leading-tight">Gagal Masuk</h4>
                <p className="text-[11px] text-rose-600 font-medium leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <User size={16} strokeWidth={2.2} />
                </span>
                <input
                  type="text"
                  required
                  className="w-full pl-11 pr-4 py-3 border border-slate-200 bg-slate-50/50 rounded-xl text-[13px] text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username Anda"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock size={16} strokeWidth={2.2} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full pl-11 pr-10 py-3 border border-slate-200 bg-slate-50/50 rounded-xl text-[13px] text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff size={16} strokeWidth={2.2} />
                  ) : (
                    <Eye size={16} strokeWidth={2.2} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-950 text-white py-3 rounded-xl font-bold text-[13px] hover:bg-slate-800 disabled:opacity-50 transition-all shadow-md cursor-pointer mt-2"
            >
              {loading ? "Memeriksa..." : "Masuk ke Sistem"}
            </button>
          </form>

          {/* Footer Copyright */}
          <div className="text-[10px] text-slate-400 text-center font-medium lg:text-left pt-4">
            &copy; {new Date().getFullYear()} SPPG Trangkil. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}
