/**
 * 扩图前后对比视图
 *
 * 左右并排对比：
 * - 左侧：原图
 * - 右侧：扩图结果
 */

import { X } from 'lucide-react';

interface ComparisonViewProps {
  sourcePreview: string;
  resultUrl: string;
  targetWidth: number;
  targetHeight: number;
  onClose: () => void;
}

export function ComparisonView({
  sourcePreview,
  resultUrl,
  targetWidth,
  targetHeight,
  onClose,
}: ComparisonViewProps) {
  return (
    <div
      className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-6"
      onClick={onClose}
    >
      {/* 关闭按钮 */}
      <button
        className="absolute top-5 right-5 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
        onClick={onClose}
      >
        <X className="w-5 h-5" />
      </button>

      {/* 左右对比容器 */}
      <div
        className="flex gap-6 items-center max-w-[90vw] max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 左：原图 */}
        <div className="flex flex-col items-center gap-2 min-w-0">
          <span className="text-[11px] text-white/60 font-bold uppercase tracking-wider">原图</span>
          <div className="rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-black/40">
            <img
              src={sourcePreview}
              alt="原图"
              className="max-h-[70vh] max-w-[42vw] object-contain"
              draggable={false}
            />
          </div>
        </div>

        {/* 右：扩图结果 */}
        <div className="flex flex-col items-center gap-2 min-w-0">
          <span className="text-[11px] text-white/60 font-bold uppercase tracking-wider">
            扩图结果 ({targetWidth}×{targetHeight})
          </span>
          <div className="rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-black/40">
            <img
              src={resultUrl}
              alt="扩图结果"
              className="max-h-[70vh] max-w-[42vw] object-contain"
              draggable={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
