import React, { useState, useEffect } from 'react';
import { FeatureItem, AspectRatio } from '../types';

interface ControlsProps {
  onGenerate: (prompt: string, aspectRatio?: AspectRatio) => void;
  isLoading: boolean;
  disabled: boolean;
  selectedFeature: FeatureItem | null;
  hidePromptInput?: boolean; // New prop to optionally hide input
}

export const Controls: React.FC<ControlsProps> = ({ 
  onGenerate, 
  isLoading, 
  disabled, 
  selectedFeature,
  hidePromptInput = false 
}) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');

  // Determine standard vs ID Photo ratios
  const isPasFoto = selectedFeature?.id === 'pasfoto';

  // Reset prompt and config when feature changes
  useEffect(() => {
    setPrompt('');
    // Default ratio depends on mode
    setAspectRatio(isPasFoto ? '3x4' : '1:1');
  }, [selectedFeature, isPasFoto]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Allow empty prompt if input is hidden (e.g., Face Swap)
    if (hidePromptInput || prompt.trim() || selectedFeature) {
      const finalPrompt = prompt.trim() || "Apply this style to the image.";
      onGenerate(finalPrompt, aspectRatio);
    }
  };

  const handleAutoMagic = () => {
    setPrompt("Analyze all input images and intelligently merge them into a creative, photorealistic masterpiece with perfect lighting and composition.");
  };

  const placeholderText = selectedFeature 
    ? selectedFeature.placeholder 
    : "Contoh : Gabungkan makanan dan model menjadi poster jualan";

  // Check if we allow multi upload (used for the specific Auto Magic button)
  const isMultiUploadFeature = selectedFeature?.allowMultiUpload;

  // Define ratio options based on feature
  const ratioOptions: AspectRatio[] = isPasFoto 
    ? ['2x3', '3x4', '4x6', '4R', '5R', '10R']
    : ['1:1', '16:9', '9:16', '4:3'];

  // Button disabled logic: Disabled if main disabled prop, loading, OR (prompt is empty AND input is visible)
  const isButtonDisabled = disabled || isLoading || (!hidePromptInput && !prompt.trim() && !selectedFeature);

  return (
    <div className="w-full flex flex-col gap-4 animate-fade-in">
      
      {/* Configuration Panel (Always Visible now for Aspect Ratio) */}
      <div className="flex flex-col gap-4 bg-zinc-900 border border-zinc-800 p-4 rounded-xl shadow-sm">
           
           {/* Face DNA Status Indicator */}
           {(selectedFeature?.id === 'prewed' || selectedFeature?.id === 'pasfoto' || selectedFeature?.id === 'faceswap' || selectedFeature?.id === 'retouch') && (
             <div className="flex items-center justify-between bg-teal-500/5 border border-teal-500/20 px-3 py-2 rounded-lg mb-2">
                <div className="flex items-center gap-2">
                   <div className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                   </div>
                   <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest">Face DNA Lock Active</span>
                </div>
                <div className="text-[9px] text-teal-500/60 italic">High-Accuracy Mode</div>
             </div>
           )}

           {/* Aspect Ratio Selector */}
           <div className="flex flex-col gap-2">
              <span className="text-xs text-zinc-400 font-medium">
                {isPasFoto ? "Ukuran Cetak (Pas Foto)" : "Format Keluaran"}
              </span>
              <div className={`grid gap-2 ${isPasFoto ? 'grid-cols-3' : 'grid-cols-4'}`}>
                {ratioOptions.map((ratio) => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => setAspectRatio(ratio)}
                    className={`py-1.5 text-[10px] rounded-md border transition-all font-mono
                      ${aspectRatio === ratio 
                        ? 'bg-teal-600 text-white border-teal-500 shadow-lg shadow-teal-900/20' 
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700'}
                    `}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
           </div>

           {/* Auto Magic Button (Only for Join/Composite features AND if input is NOT hidden) */}
           {isMultiUploadFeature && !disabled && !hidePromptInput && (
             <button 
               type="button"
               onClick={handleAutoMagic}
               className="mt-2 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 hover:from-teal-500/20 hover:to-cyan-500/20 border border-teal-500/20 px-3 py-2 rounded-lg text-xs text-teal-200 transition-all group"
             >
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 group-hover:scale-110 transition-transform">
                 <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813a3.75 3.75 0 002.576-2.576l.813-2.846A.75.75 0 019 4.5zM6.97 11.03a.75.75 0 111.06-1.06l.75.75a.75.75 0 11-1.06 1.06l-.75-.75z" clipRule="evenodd" />
               </svg>
               Prompt Otomatis Ajaib
             </button>
           )}
      </div>

      {/* Quick Prompts (Miniature, Product, etc.) - HIDDEN IF hidePromptInput IS TRUE */}
      {!hidePromptInput && selectedFeature?.quickPrompts && selectedFeature.quickPrompts.length > 0 && (
         <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-zinc-500 uppercase">Pilihan Cepat</span>
            <div className="grid grid-cols-2 gap-2">
              {selectedFeature.quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPrompt(qp)}
                  className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-teal-500/30 rounded-lg text-[11px] text-zinc-300 hover:text-white transition-all text-left flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500/50 group-hover:bg-teal-400"></span>
                  {qp}
                </button>
              ))}
            </div>
         </div>
      )}

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
        {!hidePromptInput && (
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={disabled || isLoading}
              placeholder={disabled ? "Memproses..." : placeholderText}
              rows={4}
              className="w-full bg-zinc-950 rounded-xl p-3 border border-zinc-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/50 outline-none text-sm text-white placeholder-zinc-500 resize-none transition-all"
            />
          </div>
        )}
        
        <button
          type="submit"
          disabled={isButtonDisabled}
          className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg
            ${isButtonDisabled
              ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed border border-zinc-700' 
              : 'bg-white text-black hover:bg-teal-50 hover:text-teal-900 shadow-teal-500/20'
            }`}
        >
          {isLoading ? (
            <>
               <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
               Memproses...
            </>
          ) : (
            <>
              <span>{hidePromptInput ? "Tukar Wajah Sekarang" : "Buat Gambar"}</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813a3.75 3.75 0 002.576-2.576l.813-2.846A.75.75 0 019 4.5zM6.97 11.03a.75.75 0 111.06-1.06l.75.75a.75.75 0 11-1.06 1.06l-.75-.75z" clipRule="evenodd" />
               </svg>
            </>
          )}
        </button>
      </form>
    </div>
  );
};