import { useEffect, useState } from 'react';
import { useEditorStore } from '../../store/editorStore';
import type { StoryNode, StoryEdge, PropertyTab } from '../../types';

interface NodePropertyPanelProps {
  lakeId: string;
  nodeId: string;
}

export default function NodePropertyPanel({ lakeId, nodeId }: NodePropertyPanelProps) {
  const { propertyTab, setPropertyTab, lakeNodes, lakeEdges } = useEditorStore();
  const [node, setNode] = useState<StoryNode | null>(null);
  const [outgoingEdges, setOutgoingEdges] = useState<StoryEdge[]>([]);
  const [incomingEdges, setIncomingEdges] = useState<StoryEdge[]>([]);

  useEffect(() => {
    const found = lakeNodes.find((n) => n.id === nodeId);
    setNode(found || null);

    const outgoing = lakeEdges.filter((e) => e.fromNodeId === nodeId);
    const incoming = lakeEdges.filter((e) => e.toNodeId === nodeId);
    setOutgoingEdges(outgoing);
    setIncomingEdges(incoming);
  }, [nodeId, lakeNodes, lakeEdges]);

  if (!node) {
    return (
      <div className="w-[300px] shrink-0 border-l border-white/10 p-4 bg-[#0f0f13]">
        <p className="text-white/30 text-sm">节点未找到</p>
      </div>
    );
  }

  const tabs: PropertyTab[] = ['content', 'conditions', 'edges'];

  return (
    <div className="w-[300px] shrink-0 border-l border-white/10 bg-[#0f0f13] flex flex-col min-h-0">
      <div className="p-4 border-b border-white/10">
        <h3 className="text-sm font-medium text-white truncate">{node.title}</h3>
        <p className="text-white/40 text-xs mt-1">{node.type} · {node.isProtected ? '受保护' : '可编辑'}</p>
      </div>

      <div className="flex border-b border-white/10">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setPropertyTab(tab)}
            className={`flex-1 py-2 text-xs transition-colors ${
              propertyTab === tab
                ? 'text-[hsl(262,83%,63%)] border-b-2 border-[hsl(262,83%,63%)]'
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            {tab === 'content' ? '内容' : tab === 'conditions' ? '条件' : '连线'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {propertyTab === 'content' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-white/50">标题</label>
              <p className="text-white/80 text-sm mt-1">{node.title}</p>
            </div>
            <div>
              <label className="text-xs text-white/50">类型</label>
              <p className="text-white/80 text-sm mt-1">{node.type}</p>
            </div>
            <div>
              <label className="text-xs text-white/50">正文</label>
              <p className="text-white/70 text-sm mt-1 whitespace-pre-wrap leading-relaxed max-h-[300px] overflow-y-auto">
                {node.content || '（无内容）'}
              </p>
            </div>
          </div>
        )}

        {propertyTab === 'conditions' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-white/50">进入条件</label>
              <pre className="text-white/60 text-xs mt-1 p-2 rounded bg-white/[0.03] whitespace-pre-wrap">
                {JSON.stringify(node.entryConditions, null, 2) || '{}'}
              </pre>
            </div>
            <div>
              <label className="text-xs text-white/50">内容变体 ({node.contentVariants?.length || 0})</label>
              {node.contentVariants?.map((v, i) => (
                <div key={i} className="mt-2 p-2 rounded bg-white/[0.02] text-xs">
                  <div className="text-white/40">条件: {JSON.stringify(v.condition)}</div>
                  <div className="text-white/60 mt-1 line-clamp-3">{v.text}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {propertyTab === 'edges' && (
          <div className="space-y-3">
            <div>
              <label className="text-xs text-white/50">入边 ({incomingEdges.length})</label>
              {incomingEdges.map((e) => (
                <div key={e.id} className="mt-2 p-2 rounded bg-white/[0.02] text-xs">
                  <div className="text-white/60">← {e.optionText || '(无选项文字)'}</div>
                  <div className="text-white/30">from: {e.fromNodeId}</div>
                </div>
              ))}
            </div>
            <div>
              <label className="text-xs text-white/50">出边 ({outgoingEdges.length})</label>
              {outgoingEdges.map((e) => (
                <div key={e.id} className="mt-2 p-2 rounded bg-white/[0.02] text-xs">
                  <div className="text-white/60">→ {e.optionText || '(无选项文字)'}</div>
                  <div className="text-white/30">to: {e.toNodeId}</div>
                  {e.stateChanges.length > 0 && (
                    <div className="text-[hsl(262,83%,63%)] mt-1">
                      {e.stateChanges.map((sc, j) => (
                        <span key={j} className="mr-2">{sc.variable} {sc.operator} {sc.value}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
