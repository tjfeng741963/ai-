import { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Download, RefreshCw, Loader2 } from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import { FLOW_STEPS } from '../types';
import { stripOptionsMarker } from '../utils';

const STEP_LABELS: Record<number, { title: string; emptyHint: string }> = {
  1: { title: '产品解析', emptyHint: '对话中发送产品信息，AI 将分析产品特征' },
  2: { title: '人群痛点', emptyHint: '分析目标人群和痛点场景' },
  3: { title: '广告策略', emptyHint: '制定广告创意策略和情感基调' },
  4: { title: '创意构思', emptyHint: '构思广告创意概念、角色和场景' },
  5: { title: '植入设计', emptyHint: '设计产品在剧情中的植入方式' },
  6: { title: '生成剧本', emptyHint: '基于前5步分析，生成完整广告剧本' },
  7: { title: '完整剧本', emptyHint: '选择时长档位后生成完整广告剧本' },
};

function buildFullDocument(stepContents: Record<number, string>, script: string | null): string {
  const sections: string[] = [];

  for (let step = 1; step <= 5; step++) {
    const raw = stepContents[step];
    if (!raw) continue;
    const label = STEP_LABELS[step]?.title || `步骤${step}`;
    sections.push(`【${label}】\n${stripOptionsMarker(raw).trim()}`);
  }

  if (script) {
    sections.push(`【完整剧本】\n${stripOptionsMarker(script).trim()}`);
  }

  return sections.join('\n\n' + '─'.repeat(40) + '\n\n');
}

export default memo(function ScriptPreview() {
  const viewingStep = useChatStore((s) => s.viewingStep);
  const stepContents = useChatStore((s) => s.stepContents);
  const script = useChatStore((s) => s.script);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const currentStep = useChatStore((s) => s.currentStep);
  const setShowTierModal = useChatStore((s) => s.setShowTierModal);

  const hasScript = !!script;
  const isScriptGenerating = isStreaming && currentStep >= 6;
  const rawContent = hasScript ? script : stepContents[viewingStep];
  const content = rawContent ? stripOptionsMarker(rawContent) : rawContent;
  const meta = hasScript
    ? { title: '剧本输出', emptyHint: '请通过档位弹窗生成剧本' }
    : (STEP_LABELS[viewingStep] || STEP_LABELS[1]);
  const isCurrentStepStreaming = isScriptGenerating;

  const handleCopy = async () => {
    if (!content) return;
    await navigator.clipboard.writeText(content);
  };

  const handleDownload = () => {
    if (!content) return;
    const blob = new Blob([content], { type: 'text/plain; charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `广告剧本-${meta.title}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadFull = () => {
    const fullDoc = buildFullDocument(stepContents, script);
    if (!fullDoc) return;
    const blob = new Blob([fullDoc], { type: 'text/plain; charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `广告剧本-完整文稿-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const hasFullContent = script || Object.keys(stepContents).length > 0;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-white">{meta.title}</h3>
          {isCurrentStepStreaming && (
            <span className="inline-flex items-center gap-1.5 text-xs text-cm-primary">
              <Loader2 className="w-3 h-3 animate-spin" />
              生成中
            </span>
          )}
          {!isCurrentStepStreaming && viewingStep < currentStep && content && (
            <span className="inline-flex items-center gap-1 text-xs text-green-400">
              ✓ 已完成
            </span>
          )}
        </div>
        {content && (
          <div className="flex gap-1">
            <button onClick={handleCopy} className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors" title="复制">
              <Copy className="w-4 h-4" />
            </button>
            <button onClick={handleDownload} className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors" title="下载当前步骤">
              <Download className="w-4 h-4" />
            </button>
            {hasScript && (
              <button onClick={() => setShowTierModal(true)} disabled={isStreaming} className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30" title="重新生成">
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-5 min-h-0">
        {content ? (
          <>
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>

            {hasScript && !isStreaming && (
              <div className="mt-8 pt-6 border-t border-white/10 flex flex-col gap-3">
                <button
                  onClick={handleDownloadFull}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-cm-primary text-cm-surface font-medium hover:bg-cm-primary/80 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  下载完整文稿（TXT）
                </button>
                <button
                  onClick={() => setShowTierModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  换档位重新生成
                </button>
              </div>
            )}

            {!hasScript && !isStreaming && hasFullContent && currentStep >= 6 && (
              <div className="mt-6 pt-4 border-t border-white/10">
                <button
                  onClick={handleDownloadFull}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-white/50 hover:text-white hover:bg-white/5 transition-colors text-sm"
                >
                  <Download className="w-4 h-4" />
                  下载完整文稿
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-white/40 text-sm">{meta.emptyHint}</div>
            {hasScript && currentStep >= 6 && (
              <button
                onClick={() => setShowTierModal(true)}
                className="mt-4 px-6 py-2.5 rounded-xl bg-cm-primary text-cm-surface font-medium hover:bg-cm-primary/80 transition-colors"
              >
                选择档位，生成剧本
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
});
