import React, { useRef } from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  value: string;
  onChange: (base64: string) => void;
  label?: string;
  className?: string;
}

export default function ImageUpload({ value, onChange, label, className = "" }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Accept up to 10MB since we compress it anyway on client side, which is much better for user experience!
    if (file.size > 10 * 1024 * 1024) {
      setError("Image too large (max 10MB)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Scale down proportionally to a max of 800px
          const MAX_DIMENSION = 800;
          if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
            if (width > height) {
              height = Math.round((height * MAX_DIMENSION) / width);
              width = MAX_DIMENSION;
            } else {
              width = Math.round((width * MAX_DIMENSION) / height);
              height = MAX_DIMENSION;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            // Fallback if canvas context is not supported
            onChange(event.target?.result as string);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          // If PNG, keep PNG format to preserve transparency. If not, compress as JPEG
          const isPng = file.type === 'image/png' || file.name.endsWith('.png');
          const dataUrl = isPng 
            ? canvas.toDataURL('image/png') 
            : canvas.toDataURL('image/jpeg', 0.75); // 0.75 quality is extremely compressed yet highly sharp!

          onChange(dataUrl);
        } catch (err) {
          console.error("Compression error, falling back to raw data URL:", err);
          onChange(event.target?.result as string);
        }
      };

      img.onerror = () => {
        setError("Error loading image file");
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = () => {
      setError("Error reading file");
    };

    reader.readAsDataURL(file);
  };

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="text-[10px] uppercase tracking-widest font-black text-brand-primary/40 px-1">
          {label}
        </label>
      )}
      
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="relative group cursor-pointer border-2 border-dashed border-brand-primary/10 hover:border-brand-accent/40 rounded-2xl transition-all aspect-video overflow-hidden bg-white flex flex-col items-center justify-center p-4"
      >
        <input 
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="absolute inset-0 opacity-0 cursor-pointer -z-10"
        />

        {value ? (
          <>
            <img 
              src={value} 
              alt="Preview" 
              className="absolute inset-0 w-full h-full object-contain p-2"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-brand-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Upload className="text-white" size={24} />
            </div>
            <button 
              onClick={clearImage}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
            >
              <X size={14} />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-brand-primary/30 group-hover:text-brand-accent/60 transition-colors px-4 text-center">
            <ImageIcon size={32} />
            <span className="text-[10px] uppercase tracking-widest font-black">
              {error ? <span className="text-red-500">{error}</span> : "Upload Image"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
