import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, FileUp, Loader2 } from 'lucide-react';
import { useRatingStore } from '@/store/ratingStore';

interface UploadScriptModalProps {
  open: boolean;
  onClose: () => void;
}

export function UploadScriptModal({ open, onClose }: UploadScriptModalProps) {
  const navigate = useNavigate();
  const setScriptContent = useRatingStore((s) => s.setScriptContent);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback((f: File) => {
    if (
      f.type === 'text/plain' ||
      f.name.endsWith('.txt') ||
      f.name.endsWith('.md') ||
      f.name.endsWith('.fdx') ||
      f.name.endsWith('.fountain')
    ) {
      setFile(f);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const text = await file.text();
      setScriptContent(text);
      onClose();
      navigate('/create');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setLoading(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center cm-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={handleClose}
        >
          <motion.div
            className="cm-modal-content rounded-3xl w-full max-w-lg mx-4 p-8 relative"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-cm-tertiary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-cm-tertiary/10 flex items-center justify-center border border-cm-tertiary/20">
                <FileText className="w-6 h-6 text-cm-tertiary" />
              </div>
              <div>
                <h2 className="text-xl font-headline font-bold text-cm-on-surface">上传剧本</h2>
                <p className="text-sm text-cm-on-surface-variant font-body">
                  支持 .txt、.md、.fdx、.fountain 格式
                </p>
              </div>
            </div>

            {/* Drop Zone */}
            <div
              className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-500 ${
                dragOver
                  ? 'border-cm-tertiary bg-cm-tertiary/5'
                  : file
                  ? 'border-cm-tertiary/30 bg-cm-tertiary/5'
                  : 'border-cm-outline-variant/30 hover:border-cm-tertiary/30'
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              {file ? (
                <div className="flex flex-col items-center gap-3">
                  <FileText className="w-10 h-10 text-cm-tertiary" />
                  <p className="text-cm-on-surface font-medium">{file.name}</p>
                  <p className="text-xs text-cm-on-surface-variant">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                  <button
                    onClick={() => setFile(null)}
                    className="text-xs text-cm-error hover:underline"
                  >
                    移除文件
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <FileUp className="w-10 h-10 text-slate-500 animate-cm-float" />
                  <p className="text-cm-on-surface-variant font-body">
                    拖拽剧本文件到此处，或{' '}
                    <label className="text-cm-tertiary cursor-pointer hover:underline">
                      点击选择
                      <input
                        type="file"
                        accept=".txt,.md,.fdx,.fountain"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleFile(f);
                        }}
                      />
                    </label>
                  </p>
                  <p className="text-xs text-slate-500">
                    支持 TXT、Markdown、Final Draft、Fountain 格式
                  </p>
                </div>
              )}
            </div>

            {/* Script-specific info */}
            <div className="mt-4 p-3 rounded-xl bg-cm-surface-high/50 border border-cm-outline-variant/10">
              <p className="text-xs text-cm-on-surface-variant font-body leading-relaxed">
                <span className="text-cm-tertiary font-semibold">提示：</span>
                系统将自动识别剧本格式，解析场景、对白、动作描述等结构化信息，为您提供专业的剧本分析报告。
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleClose}
                className="px-5 py-2.5 rounded-full bg-cm-surface-highest border border-cm-outline-variant/30 text-sm text-cm-on-surface hover:bg-cm-surface-bright transition-all duration-500"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={!file || loading}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-cm-tertiary to-cm-tertiary-dim text-[#79006c] text-sm font-bold shadow-cm-neon-tertiary hover:scale-105 transition-all duration-500 disabled:opacity-40 disabled:hover:scale-100"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  '解析剧本'
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
