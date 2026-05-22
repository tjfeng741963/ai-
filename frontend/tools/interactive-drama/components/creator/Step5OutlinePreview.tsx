import { useCreatorStore } from '../../store/creatorStore';
import { NODE_TYPE_LABELS } from '../../types';
import type { OutlineNode, OutlineEdge } from '../../types';

export default function Step5OutlinePreview() {
  const { isGeneratingOutline, outlineStreamText, outlineData, requestOutline, confirmOutline } = useCreatorStore();

  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-1">Step 5: 大纲预览确认</h2>
      <p className="text-sm text-white/40 mb-6">
        AI 首先生成节点骨架（标题+分支结构），你先确认逻辑正确，再展开正文。
      </p>

      {!outlineData && (
        <div>
          {!isGeneratingOutline && (
            <button
              onClick={requestOutline}
              className="px-6 py-3 bg-[hsl(262,83%,63%)] hover:bg-[hsl(262,83%,58%)] text-white rounded-xl font-medium transition-colors text-sm"
            >
              生成大纲骨架
            </button>
          )}

          {isGeneratingOutline && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[hsl(262,83%,63%)] text-sm">
                <span className="w-4 h-4 border-2 border-[hsl(262,83%,63%)]/30 border-t-[hsl(262,83%,63%)] rounded-full animate-spin" />
                {outlineStreamText ? 'AI 正在生成大纲...' : 'AI 正在深入推理，规划分支结构...'}
              </div>

              {outlineStreamText && (
                <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] max-h-[500px] overflow-y-auto">
                  <pre className="text-white/70 text-sm whitespace-pre-wrap font-mono leading-relaxed">{outlineStreamText}</pre>
                </div>
              )}

              {!outlineStreamText && (
                <p className="text-white/30 text-xs">DeepSeek 正在进行深度推理，可能需要 1-3 分钟，请耐心等待...</p>
              )}
            </div>
          )}
        </div>
      )}

      {outlineData && (
        <div className="space-y-6">
          {/* Nodes list */}
          <div>
            <h3 className="text-sm font-medium text-white/80 mb-3">
              节点骨架 ({outlineData.nodes.length} 个节点)
            </h3>
            <div className="space-y-2">
              {outlineData.nodes.map((node: OutlineNode) => (
                <div key={node.tempId} className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-white/[0.02]">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    node.type === 'start' ? 'bg-emerald-500/15 text-emerald-400' :
                    node.type === 'ending' ? 'bg-red-500/15 text-red-400' :
                    node.type === 'merge' ? 'bg-amber-500/15 text-amber-400' :
                    'bg-blue-500/15 text-blue-400'
                  }`}>
                    {NODE_TYPE_LABELS[node.type] || node.type}
                  </span>
                  <span className="text-white text-sm">{node.title}</span>
                  <span className="text-white/30 text-xs ml-auto">{node.tempId}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Edges summary */}
          <div>
            <h3 className="text-sm font-medium text-white/80 mb-3">
              分支连线 ({outlineData.edges.length} 条)
            </h3>
            <div className="space-y-1 max-h-[300px] overflow-y-auto">
              {outlineData.edges.map((edge: OutlineEdge, i: number) => (
                <div key={i} className="text-xs text-white/50 p-2 rounded bg-white/[0.02]">
                  {edge.fromTempId} → {edge.toTempId}: &ldquo;{edge.optionText}&rdquo;
                </div>
              ))}
            </div>
          </div>

          {/* Variables */}
          {outlineData.variables && outlineData.variables.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-white/80 mb-3">
                状态变量 ({outlineData.variables.length} 个)
              </h3>
              <div className="flex flex-wrap gap-2">
                {outlineData.variables.map((v, i) => (
                  <span key={i} className="px-2 py-1 rounded bg-[hsl(262,83%,63%)]/10 text-[hsl(262,83%,63%)] text-xs">
                    {v.name} ({v.type})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={confirmOutline}
              className="px-6 py-3 bg-[hsl(160,84%,39%)] hover:bg-[hsl(160,84%,36%)] text-white rounded-xl font-medium transition-colors text-sm"
            >
              确认大纲，进入内容生成
            </button>
            <button
              onClick={requestOutline}
              disabled={isGeneratingOutline}
              className="px-4 py-3 bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-white/70 rounded-xl text-sm transition-colors disabled:opacity-40"
            >
              重新生成
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
