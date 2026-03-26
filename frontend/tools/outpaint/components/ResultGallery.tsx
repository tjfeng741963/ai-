import { useState } from 'react';
import { Download, Trash2, RotateCcw, Loader2, AlertCircle, X, ZoomIn, ArrowLeftRight } from 'lucide-react';
import type { OutpaintResult } from '../types';
import { ComparisonView } from './ComparisonView';

interface ResultGalleryProps {
  results: readonly OutpaintResult[];
  onDelete: (id: string) => void;
  onRetry: (result: OutpaintResult) => void;
}

export function ResultGallery({ results, onDelete, onRetry }: ResultGalleryProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [compareResult, setCompareResult] = useState<OutpaintResult | null>(null);

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-cm-on-surface-variant/40">
        <div className="w-12 h-12 rounded-xl bg-cm-surface-high/30 flex items-center justify-center mb-3">
          <ZoomIn className="w-5 h-5" />
        </div>
        <p className="text-xs font-headline">尚无结果</p>
        <p className="text-[10px] mt-1">生成后在此显示</p>
      </div>
    );
  }

  const handleDownload = async (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `outpaint_${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, '_blank');
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
        {results.map((result) => (
          <div
            key={result.id}
            className="group relative rounded-lg overflow-hidden border border-cm-outline-variant/15 bg-cm-surface-high/20 transition-all duration-300 hover:border-cm-outline-variant/30"
          >
            {/* 状态渲染 */}
            {result.status === 'uploading' || result.status === 'processing' ? (
              <div className="flex flex-col items-center justify-center gap-2 bg-cm-surface-high/10 h-[120px]">
                <Loader2 className="w-5 h-5 text-cm-secondary animate-spin" />
                <p className="text-[10px] text-cm-on-surface-variant font-semibold">
                  {result.status === 'uploading' ? '上传中...' : '生成中...'}
                </p>
                {result.progress > 0 && (
                  <div className="w-2/3 h-0.5 rounded-full bg-cm-surface-high/30 overflow-hidden">
                    <div
                      className="h-full bg-cm-secondary rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(5, result.progress)}%` }}
                    />
                  </div>
                )}
              </div>
            ) : result.status === 'failed' ? (
              <div className="flex flex-col items-center justify-center gap-2 bg-red-500/[0.03] h-[120px]">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <p className="text-[10px] text-red-400 text-center px-2 line-clamp-2">
                  {result.error || '生成失败'}
                </p>
                <button
                  onClick={() => onRetry(result)}
                  className="flex items-center gap-1 px-2 py-1 rounded-md bg-cm-surface-high/50 text-[10px] text-cm-on-surface-variant hover:text-cm-on-surface transition-colors"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  重试
                </button>
              </div>
            ) : result.resultUrl ? (
              <div
                className="relative cursor-pointer"
                onClick={() => setPreviewUrl(result.resultUrl!)}
              >
                <img
                  src={result.resultUrl}
                  alt="扩图结果"
                  className="w-full object-cover"
                  style={{ aspectRatio: `${result.params.targetWidth}/${result.params.targetHeight}`, maxHeight: '200px' }}
                />
                {/* hover 操作栏 */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end justify-end p-1.5 opacity-0 group-hover:opacity-100">
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCompareResult(result);
                      }}
                      className="p-1 rounded bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
                      title="对比原图"
                    >
                      <ArrowLeftRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => handleDownload(result.resultUrl!, e)}
                      className="p-1 rounded bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
                      title="下载"
                    >
                      <Download className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(result.id);
                      }}
                      className="p-1 rounded bg-white/20 backdrop-blur-sm text-white hover:bg-red-500/60 transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {/* 底部参数信息 — 紧凑 */}
            <div className="px-2 py-1.5 flex items-center justify-between text-[9px] text-cm-on-surface-variant/50">
              <span>{result.params.targetRatio}</span>
              <span>
                {new Date(result.createdAt).toLocaleTimeString('zh-CN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 全屏预览 */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-8 cursor-pointer"
          onClick={() => setPreviewUrl(null)}
        >
          <button
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            onClick={() => setPreviewUrl(null)}
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={previewUrl}
            alt="预览"
            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* 对比视图 */}
      {compareResult && compareResult.resultUrl && (
        <ComparisonView
          sourcePreview={compareResult.params.sourcePreview}
          resultUrl={compareResult.resultUrl}
          targetWidth={compareResult.params.targetWidth}
          targetHeight={compareResult.params.targetHeight}
          onClose={() => setCompareResult(null)}
        />
      )}
    </>
  );
}
