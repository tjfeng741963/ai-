import { memo, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Download, Loader2 } from 'lucide-react';
import { usePromptStore } from '../store/promptStore';
import ImageSlotCard from './ImageSlotCard';

export default memo(function StoryboardView() {
  const storyboardText = usePromptStore((s) => s.storyboardText);
  const imageSlots = usePromptStore((s) => s.imageSlots);
  const slotImages = usePromptStore((s) => s.slotImages);
  const isStreaming = usePromptStore((s) => s.isStreaming);
  const chatPhase = usePromptStore((s) => s.chatPhase);
  const setSlotImage = usePromptStore((s) => s.setSlotImage);
  const removeSlotImage = usePromptStore((s) => s.removeSlotImage);
  const getFullScript = usePromptStore((s) => s.getFullScript);

  const handleCopy = useCallback(async () => {
    const text = getFullScript();
    if (!text) return;
    await navigator.clipboard.writeText(text);
  }, [getFullScript]);

  const handleDownload = useCallback(() => {
    const text = getFullScript();
    if (!text) return;
    const blob = new Blob([text], { type: 'text/plain; charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `分镜脚本-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [getFullScript]);

  const isGenerating = chatPhase === 'generating';

  if (!storyboardText && !isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-8">
        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
          <span className="text-2xl">🎬</span>
        </div>
        <p className="text-white/40 text-sm">描述你的产品，AI 帮你规划分镜</p>
        <p className="text-white/25 text-xs mt-2">
          在左侧输入你的需求，选择风格和时长后生成
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-white">分镜脚本</h3>
          {isGenerating && (
            <span className="inline-flex items-center gap-1.5 text-xs text-cm-primary">
              <Loader2 className="w-3 h-3 animate-spin" />
              生成中
            </span>
          )}
          {chatPhase === 'done' && (
            <span className="inline-flex items-center gap-1 text-xs text-green-400">✓ 已完成</span>
          )}
        </div>
        {storyboardText && !isStreaming && (
          <div className="flex gap-1">
            <button
              onClick={handleCopy}
              className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              title="复制完整脚本"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              title="下载TXT"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 min-h-0 space-y-6">
        {/* Markdown table */}
        {storyboardText && (
          <div className="prose prose-invert prose-sm max-w-none prose-table:border-collapse prose-th:border prose-th:border-white/20 prose-th:px-3 prose-th:py-2 prose-th:bg-white/5 prose-td:border prose-td:border-white/10 prose-td:px-3 prose-td:py-2">
            <ReactMarkdown>{storyboardText}</ReactMarkdown>
          </div>
        )}

        {/* Image upload area */}
        {imageSlots.length > 0 && !isStreaming && (
          <div className="border-t border-white/10 pt-5">
            <h4 className="text-sm font-medium text-white/70 mb-3">
              📷 上传参考图片
              <span className="text-white/30 text-xs ml-2">
                {Object.keys(slotImages).length}/{imageSlots.length} 已上传
              </span>
            </h4>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {imageSlots.map((slot, i) => (
                <ImageSlotCard
                  key={slot.id}
                  slotId={slot.id}
                  label={slot.label}
                  index={i}
                  imageBase64={slotImages[slot.id] || null}
                  onUpload={setSlotImage}
                  onRemove={removeSlotImage}
                />
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        {chatPhase === 'done' && !isStreaming && storyboardText && (
          <div className="border-t border-white/10 pt-5 flex flex-col gap-3">
            <button
              onClick={handleCopy}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-cm-primary text-cm-surface font-medium hover:bg-cm-primary/80 transition-colors"
            >
              <Copy className="w-4 h-4" />
              复制完整脚本
            </button>
            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Download className="w-4 h-4" />
              下载 TXT 文件
            </button>
          </div>
        )}
      </div>
    </div>
  );
});
