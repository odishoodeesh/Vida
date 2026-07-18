import React, { useRef, useState } from 'react';
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react';
import { supabase, supabaseBucket } from '../lib/supabase';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
}

export default function ImageUpload({ value, onChange, label, className = "" }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Accept up to 15MB since we compress it on the client side
    if (file.size > 15 * 1024 * 1024) {
      setError("Image too large (max 15MB)");
      return;
    }

    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Scale down proportionally to a max of 1200px for sharper display images
          const MAX_DIMENSION = 1200;
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
            throw new Error("Could not get 2D canvas context");
          }

          ctx.drawImage(img, 0, 0, width, height);

          const isPng = file.type === 'image/png' || file.name.endsWith('.png');
          const mimeType = isPng ? 'image/png' : 'image/jpeg';
          const quality = isPng ? undefined : 0.85;

          // If Supabase is available, upload as a binary Blob
          if (supabase) {
            canvas.toBlob(async (blob) => {
              if (!blob) {
                setError("Error processing image file");
                setIsUploading(false);
                return;
              }

              try {
                const ext = isPng ? 'png' : 'jpg';
                const fileName = `images/${Date.now()}-${Math.random().toString(36).substring(2, 11)}.${ext}`;

                // Upload to Supabase bucket
                const { data, error: uploadError } = await supabase.storage
                  .from(supabaseBucket)
                  .upload(fileName, blob, {
                    contentType: mimeType,
                    cacheControl: '3600',
                    upsert: true
                  });

                if (uploadError) {
                  throw uploadError;
                }

                // Get public URL
                const { data: { publicUrl } } = supabase.storage
                  .from(supabaseBucket)
                  .getPublicUrl(fileName);

                onChange(publicUrl);
              } catch (uploadErr: any) {
                console.error("Supabase Storage upload failed, falling back to base64:", uploadErr);
                // Fallback to base64 if upload fails
                const dataUrl = isPng 
                  ? canvas.toDataURL('image/png') 
                  : canvas.toDataURL('image/jpeg', 0.75);
                onChange(dataUrl);
              } finally {
                setIsUploading(false);
              }
            }, mimeType, quality);
          } else {
            // Fallback to base64 if Supabase is not initialized
            const dataUrl = isPng 
              ? canvas.toDataURL('image/png') 
              : canvas.toDataURL('image/jpeg', 0.75);
            onChange(dataUrl);
            setIsUploading(false);
          }
        } catch (err) {
          console.error("Compression/Upload error:", err);
          setError("Error optimizing image");
          setIsUploading(false);
        }
      };

      img.onerror = () => {
        setError("Error loading image file");
        setIsUploading(false);
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = () => {
      setError("Error reading file");
      setIsUploading(false);
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
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`relative group cursor-pointer border-2 border-dashed border-brand-primary/10 hover:border-brand-accent/40 rounded-2xl transition-all aspect-video overflow-hidden bg-white flex flex-col items-center justify-center p-4 ${isUploading ? 'opacity-80' : ''}`}
      >
        <input 
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="absolute inset-0 opacity-0 cursor-pointer -z-10"
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-2 text-brand-accent">
            <Loader2 className="animate-spin" size={32} />
            <span className="text-[10px] uppercase tracking-widest font-black">
              Uploading to Storage...
            </span>
          </div>
        ) : value ? (
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
