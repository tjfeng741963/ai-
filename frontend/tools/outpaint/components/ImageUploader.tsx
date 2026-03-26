import { useState, useRef, useCallback } from 'react';
import { Upload, X, ImagePlus } from 'lucide-react';
import type { SourceImageInfo } from '../types';

interface ImageUploaderProps {
  image: SourceImageInfo | null;
  onImageChange: (img: SourceImageInfo | null) => void;
  disabled?: boolean;
}

/** 读取图片文件并获取尺寸信息 */
function readImageFile(file: File): Promise<SourceImageInfo> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) return reject(new Error('读取文件失败'));

      const img = new Image();
      img.onload = () => {
        resolve({
          file,
          preview: URL.createObjectURL(file),
          dataUrl,
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
      };
      img.onerror = () => reject(new Error('无法解析图片'));
      img.src = dataUrl;
    };
    reader.onerror = () => reject(new Error('读取文件失败'));
    reader.readAsDataURL(file);
  });
}

export function ImageUploader({ image, onImageChange, disabled }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dragCounter = useRef(0);

  const processFile = useCallback(
    async (file: File) => {
      setError(null);
      if (!file.type.startsWith('image/')) {
        setError('请上传图片文件');
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        setError('图片不能超过 20MB');
        return;
      }
      try {
        const info = await readImageFile(file);
        onImageChange(info);
      } catch (err: any) {
        setError(err.message || '图片读取失败');
      }
    },
    [onImageChange],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [processFile],
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) setIsDragOver(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current = 0;
      setIsDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const handleRemove = useCallback(() => {
    if (image?.preview.startsWith('blob:')) {
      URL.revokeObjectURL(image.preview);
    }
    onImageChange(null);
    setError(null);
  }, [image, onImageChange]);

  // 已有图片 → 缩略图预览
  if (image) {
    return (
      <div className="relative group">
        <div className="rounded-xl overflow-hidden border border-cm-outline-variant/20 bg-cm-surface-high">
          <img
            src={image.preview}
            alt="原图预览"
            className="w-full max-h-48 object-contain bg-black/20"
          />
          <div className="px-3 py-2 text-[11px] text-cm-on-surface-variant font-label flex justify-between">
            <span>{image.width} × {image.height} px</span>
            <span>{(image.file.size / 1024).toFixed(0)} KB</span>
          </div>
        </div>
        {!disabled && (
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }

  // 无图片 → 上传区域
  return (
    <div
      className={`relative rounded-xl border-2 border-dashed transition-all duration-300 ${
        isDragOver
          ? 'border-cm-primary/60 bg-cm-primary/5'
          : 'border-cm-outline-variant/20 hover:border-cm-primary/30 hover:bg-cm-primary/[0.02]'
      } ${disabled ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}
      onClick={() => fileInputRef.current?.click()}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center gap-3 py-10 px-4">
        {isDragOver ? (
          <ImagePlus className="w-10 h-10 text-cm-primary animate-pulse" />
        ) : (
          <Upload className="w-10 h-10 text-cm-on-surface-variant/50" />
        )}
        <div className="text-center">
          <p className="text-sm font-semibold text-cm-on-surface">
            {isDragOver ? '松开即可上传' : '点击或拖拽上传图片'}
          </p>
          <p className="text-[11px] text-cm-on-surface-variant mt-1">
            支持 PNG / JPG / WebP，最大 20MB
          </p>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleFileInput}
        className="hidden"
      />
      {error && (
        <div className="absolute bottom-2 left-2 right-2 px-3 py-1.5 rounded-lg bg-red-500/15 text-red-400 text-[11px] text-center">
          {error}
        </div>
      )}
    </div>
  );
}
