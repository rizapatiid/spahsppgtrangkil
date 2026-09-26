export default function UploadProgressBar({ progress, isUploading }: { progress: number, isUploading: boolean }) {
  if (!isUploading) return null;
  
  return (
    <div className="fixed top-0 left-0 w-full h-1.5 bg-slate-200 z-[9999] shadow-sm">
      <div 
        className="h-full bg-blue-600 transition-all duration-300 ease-out flex items-center justify-end relative"
        style={{ width: `${progress}%` }}
      >
        <div className="absolute top-2 right-0 text-[10px] font-bold text-blue-600 bg-white px-1.5 py-0.5 rounded shadow-sm border border-blue-100">
          {progress}%
        </div>
      </div>
    </div>
  );
}
