import { Copy, Download, Loader2 } from 'lucide-react';
import { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import { useChatStore } from '../store/chatStore';
import type { StoryboardShot } from '../types';

const STEP_LABELS: Record<number, { title: string; emptyHint: string }> = {
  1: { title: '歌曲解析', emptyHint: '对话中输入歌词和音乐信息，AI 将解析情感与节奏' },
  2: { title: '视觉叙事', emptyHint: '描述你想配的故事，AI 帮你细化视觉方向' },
  3: { title: 'MV 分镜脚本', emptyHint: '完成前两步后自动生成分镜表' },
};

function buildStoryboardMarkdown(shots: StoryboardShot[]): string {
  const header = '| 镜号 | 时长 | 歌词片段 | 画面描述 | 运镜方式 | 光影色调 | Seedance 2.0 提示词 |\n|------|------|----------|----------|----------|----------|---------------------|';
  const rows = shots.map((s) =>
    `| ${s.shotNumber} | ${s.duration} | ${s.lyricsRef} | ${s.visualDescription} | ${s.cameraMovement} | ${s.lightingTone} | ${s.seedancePrompt} |`
  );
  return [header, ...rows].join('\n');
}

export default memo(function StoryboardPreview() {
  const viewingStep = useChatStore((s) => s.viewingStep);
  const stepContents = useChatStore((s) => s.stepContents);
  const shots = useChatStore((s) => s.shots);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const currentStep = useChatStore((s) => s.currentStep);

  const hasShots = shots.length > 0;
  const isGenerating = isStreaming && viewingStep === 3;
  const rawContent = stepContents[viewingStep];
  const isStepView = viewingStep <= 2;

  const meta = hasShots && viewingStep === 3
    ? { title: 'MV 分镜脚本', emptyHint: '' }
    : STEP_LABELS[viewingStep] || STEP_LABELS[1];

  const handleCopy = async () => {
    try {
      const text = buildStoryboardMarkdown(shots);
      await navigator.clipboard.writeText(text);
    } catch { /* clipboard write rejected */ }
  };

  const handleDownload = () => {
    const markdown = buildStoryboardMarkdown(shots);
    const blob = new Blob([markdown], { type: 'text/markdown; charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MV分镜脚本-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-white">{meta.title}</h3>
          {isGenerating && (
            <span className="inline-flex items-center gap-1.5 text-xs text-cm-primary">
              <Loader2 className="w-3 h-3 animate-spin" />
              生成中
            </span>
          )}
          {!isGenerating && hasShots && viewingStep === 3 && (
            <span className="text-xs text-green-400">共 {shots.length} 镜</span>
          )}
          {!isGenerating && isStepView && rawContent && viewingStep < currentStep && (
            <span className="text-xs text-green-400">已完成</span>
          )}
        </div>
        {hasShots && !isStreaming && (
          <div className="flex gap-1">
            <button onClick={handleCopy} className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors" title="复制表格">
              <Copy className="w-4 h-4" />
            </button>
            <button onClick={handleDownload} className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors" title="下载 Markdown">
              <Download className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {/* Step 1-2: show markdown content */}
        {isStepView && (
          <div className="p-5">
            {rawContent ? (
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{rawContent}</ReactMarkdown>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <p className="text-white/40 text-sm">{meta.emptyHint}</p>
              </div>
            )}
          </div>
        )}

        {/* Step 3: show storyboard cards */}
        {!isStepView && (
          hasShots ? (
            <div className="p-4 space-y-3">
              {/* Table header - visible on wider screens */}
              <div className="hidden xl:grid xl:grid-cols-7 gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-white/30">
                <span>镜号</span>
                <span>时长</span>
                <span className="col-span-1">歌词片段</span>
                <span className="col-span-1">画面描述</span>
                <span>运镜</span>
                <span>光影色调</span>
                <span>Seedance 2.0 提示词</span>
              </div>

              {shots.map((shot) => (
                <div
                  key={shot.shotNumber}
                  className="rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.14] transition-colors overflow-hidden"
                >
                  {/* Compact header */}
                  <div className="flex items-center gap-3 px-4 py-2.5 bg-white/[0.03] border-b border-white/[0.06]">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-cm-primary/20 text-cm-primary text-xs font-bold">
                      {shot.shotNumber}
                    </span>
                    <span className="text-xs text-white/50">时长 {shot.duration}</span>
                    {shot.lyricsRef && (
                      <span className="text-xs text-white/30 italic truncate max-w-[200px]">
                        {shot.lyricsRef}
                      </span>
                    )}
                  </div>

                  {/* Card body - grid of fields */}
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">画面描述</span>
                        <p className="mt-1 text-sm text-white/80 leading-relaxed">{shot.visualDescription}</p>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">运镜方式</span>
                          <p className="mt-1 text-sm text-white/70">{shot.cameraMovement}</p>
                        </div>
                        <div className="flex-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">光影色调</span>
                          <p className="mt-1 text-sm text-white/70">{shot.lightingTone}</p>
                        </div>
                      </div>
                    </div>

                    {/* Seedance prompt - full width, highlighted */}
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-cm-primary/60">Seedance 2.0 提示词</span>
                      <p className="mt-1 text-sm text-white/90 bg-cm-primary/5 rounded-lg p-3 border border-cm-primary/10 font-mono leading-relaxed">
                        {shot.seedancePrompt}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Download full button */}
              {!isStreaming && (
                <div className="pt-4 pb-2">
                  <button
                    onClick={handleDownload}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-cm-primary text-cm-surface font-medium hover:bg-cm-primary/80 transition-colors"
                  >
                    <Download className="w-5 h-5" />
                    下载分镜脚本（Markdown）
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center p-5">
              <p className="text-white/40 text-sm">{meta.emptyHint}</p>
            </div>
          )
        )}
      </div>
    </div>
  );
});
