import { useState } from 'react';
import { useCreatorStore } from '../../store/creatorStore';
import { RefreshCw } from 'lucide-react';

export default function Step6GenerateContent() {
  const {
    isGeneratingContent, contentStreamText, generationProgress,
    generatedNodes, startContentGeneration, regenerateNode,
  } = useCreatorStore();
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [instruction, setInstruction] = useState('');

  const handleRegenerate = async (nodeId: string) => {
    if (!instruction.trim()) return;
    setRegeneratingId(nodeId);
    await regenerateNode(nodeId, instruction);
    setRegeneratingId(null);
    setInstruction('');
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-1">Step 6: 生成完整内容</h2>
      <p className="text-sm text-white/40 mb-6">
        AI 基于确认的骨架，按故事线分批生成每个节点的完整剧本正文。
      </p>

      {generatedNodes.length === 0 && !isGeneratingContent && (
        <button
          onClick={startContentGeneration}
          className="px-6 py-3 bg-[hsl(262,83%,63%)] hover:bg-[hsl(262,83%,58%)] text-white rounded-xl font-medium transition-colors text-sm"
        >
          开始生成所有内容
        </button>
      )}

      {isGeneratingContent && (
        <div className="mb-6 space-y-4">
          {/* Progress */}
          {generationProgress && (
            <div className="p-4 rounded-xl border border-[hsl(262,83%,63%)]/20 bg-[hsl(262,83%,63%)]/5">
              <div className="flex items-center gap-3 mb-3">
                <RefreshCw size={16} className="animate-spin text-[hsl(262,83%,63%)]" />
                <span className="text-white/80 text-sm">
                  第 {generationProgress.currentBatch}/{generationProgress.totalBatches} 批
                  {generationProgress.currentNodeTitle && ` · ${generationProgress.currentNodeTitle}`}
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[hsl(262,83%,63%)] transition-all duration-500"
                  style={{ width: `${(generationProgress.currentBatch / generationProgress.totalBatches) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Streaming text */}
          {contentStreamText && (
            <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] max-h-[400px] overflow-y-auto">
              <pre className="text-white/70 text-sm whitespace-pre-wrap font-sans leading-relaxed">{contentStreamText}</pre>
            </div>
          )}

          {/* Completed nodes loading */}
          {generatedNodes.length > 0 && (
            <p className="text-white/30 text-xs">已完成 {generatedNodes.length} 个节点...</p>
          )}
        </div>
      )}

      {generatedNodes.length > 0 && !isGeneratingContent && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-white/80">生成的节点 ({generatedNodes.length})</h3>
          {generatedNodes.map((node) => (
            <div key={node.id} className="p-4 rounded-xl border border-white/10 bg-white/[0.02]">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-medium text-sm">{node.title}</h4>
                <span className="text-white/30 text-xs">{node.type}</span>
              </div>
              <p className="text-white/60 text-sm whitespace-pre-wrap">{node.content}</p>
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  placeholder="修改指令，如「写得更紧张一些」"
                  className="flex-1 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-1.5 text-white placeholder-white/25 text-xs focus:outline-none focus:border-[hsl(262,83%,63%)]"
                />
                <button
                  onClick={() => handleRegenerate(node.id)}
                  disabled={regeneratingId === node.id || !instruction.trim()}
                  className="px-3 py-1.5 bg-[hsl(262,83%,63%)]/15 hover:bg-[hsl(262,83%,63%)]/25 text-[hsl(262,83%,63%)] rounded-lg text-xs transition-colors disabled:opacity-40"
                >
                  {regeneratingId === node.id ? '生成中...' : 'AI重写'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
