import React from 'react';

interface ComparisonViewProps {
  originalImage: string; // Base64 full string
  resultImage: string | null; // Base64 raw (needs prefix)
  isLoading: boolean;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({ originalImage, resultImage, isLoading }) => {
  // Logic: Show Result if available, otherwise show Original (as the "workspace" canvas)
  const showResult = !!resultImage && !isLoading;
  const currentImage = showResult ? `data:image/png;base64,${resultImage}` : originalImage;
  const label = showResult ? "Hasil Akhir" : "Area Kerja";
  
  return (
    <div className="w-full animate-fade-in flex justify-center">
      <div className="flex flex-col gap-2 w-full max-w-4xl">
         <div className="flex items-center justify-between px-2">
            <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">{label}</span>
            {showResult && (
               <span className="text-[9px] bg-green-900/40 text-green-400 px-2 py-0.5 rounded border border-green-700/50">
                 SELESAI
               </span>
            )}
            {!showResult && !isLoading && originalImage && (
               <span className="text-[9px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded border border-zinc-700">
                 ASLI
               </span>
            )}
         </div>
         
         <div className="relative rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 h-[400px] md:h-[600px] shadow-2xl ring-1 ring-white/5">
            {isLoading ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950/90 text-zinc-400 backdrop-blur-sm z-20">
                <div className="relative w-16 h-16 mb-6">
                  <div className="absolute inset-0 border-2 border-teal-500/20 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 border-2 border-t-teal-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-sm font-semibold text-white tracking-wide animate-pulse">Memproses...</p>
                <p className="text-[10px] text-zinc-500 mt-2">Menerapkan pencahayaan & tekstur studio</p>
              </div>
            ) : currentImage ? (
              <div className="w-full h-full relative group/image">
                 <img 
                  src={currentImage} 
                  alt="Workspace" 
                  className="w-full h-full object-contain bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-zinc-950"
                />
                
                {/* Download Overlay - Only if result */}
                {showResult && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                    <a 
                      href={currentImage}
                      download={`studio-export-${Date.now()}.png`}
                      className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold text-sm shadow-xl hover:scale-105 transition-transform"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M12 12v8.25m0-8.25l-3 3m3-3l3 3m-6-6h6m-6 0v6" />
                      </svg>
                      Unduh
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 bg-zinc-950/40 border-2 border-dashed border-zinc-800/50">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 opacity-20 mb-2">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                 </svg>
                 <span className="text-xs">Area Pratinjau</span>
              </div>
            )}
         </div>
      </div>
    </div>
  );
};