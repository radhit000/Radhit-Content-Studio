import React, { useRef } from 'react';

interface ImageUploaderProps {
  onImageSelected: (base64: string, mimeType: string) => void;
  currentImage?: string | null;
  label?: string;
  compact?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onImageSelected, 
  currentImage, 
  label = "Unggah Foto",
  compact = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Extract base64 and mime type
      const mimeType = result.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)?.[1] || 'image/png';
      const base64 = result.split(',')[1];
      onImageSelected(base64, mimeType);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processFile(file);
    }
  };

  if (currentImage) {
    return (
      <div className={`relative w-full ${compact ? 'aspect-square' : 'aspect-[4/5]'} rounded-xl overflow-hidden border border-zinc-800 group`}>
        <img src={currentImage} className="w-full h-full object-cover" />
        <div 
          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <span className="text-white text-xs font-bold bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-sm">Ganti Foto</span>
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/png, image/jpeg, image/webp" 
          className="hidden" 
        />
      </div>
    );
  }

  return (
    <div 
      className={`w-full mx-auto ${compact ? 'h-32' : 'h-64'} border-2 border-dashed border-zinc-700 rounded-2xl bg-zinc-900/50 hover:bg-zinc-800/50 hover:border-teal-500/50 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer group relative overflow-hidden`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className={`${compact ? 'w-8 h-8 mb-2' : 'w-16 h-16 mb-4'} rounded-full bg-zinc-800 group-hover:bg-zinc-700 flex items-center justify-center transition-colors z-10 shadow-xl`}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`${compact ? 'w-4 h-4' : 'w-8 h-8'} text-zinc-400 group-hover:text-teal-400 transition-colors`}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
      </div>
      
      <h3 className={`${compact ? 'text-[10px]' : 'text-lg'} font-semibold text-zinc-300 group-hover:text-white z-10`}>{label}</h3>
      {!compact && (
        <>
          <p className="text-zinc-500 text-sm mt-1 z-10">Geser & lepas atau klik untuk cari</p>
          <p className="text-zinc-600 text-xs mt-4 uppercase tracking-wider font-medium z-10">Mendukung JPG, PNG, WEBP</p>
        </>
      )}

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/png, image/jpeg, image/webp" 
        className="hidden" 
      />
    </div>
  );
};