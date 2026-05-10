import { useRef, useCallback } from 'react';
import { Plus, X, Image } from 'lucide-react';

interface ImageSlotCardProps {
  slotId: string;
  label: string;
  index: number;
  imageBase64: string | null;
  onUpload: (slotId: string, base64: string) => void;
  onRemove: (slotId: string) => void;
}

export default function ImageSlotCard({ slotId, label, index, imageBase64, onUpload, onRemove }: ImageSlotCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onUpload(slotId, reader.result);
        }
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    },
    [slotId, onUpload]
  );

  return (
    <div className="relative group">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {imageBase64 ? (
        <div
          className="relative aspect-square rounded-xl overflow-hidden border border-white/10 cursor-pointer"
          onClick={() => inputRef.current?.click()}
        >
          <img src={imageBase64} alt={label} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white text-xs">点击替换</span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(slotId); }}
            className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white/80 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-3 h-3" />
          </button>
          <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-black/60 text-white text-[10px] truncate">
            图{index + 1}·{label}
          </div>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full aspect-square rounded-xl border-2 border-dashed border-white/15 hover:border-cm-primary/40 bg-white/[0.02] hover:bg-white/[0.04] transition-colors flex flex-col items-center justify-center gap-2"
        >
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
            <Plus className="w-4 h-4 text-white/30" />
          </div>
          <div className="text-center px-2">
            <div className="text-[10px] text-white/50 font-medium">图{index + 1}</div>
            <div className="text-[10px] text-white/30 mt-0.5 line-clamp-2">{label}</div>
          </div>
        </button>
      )}
    </div>
  );
}
