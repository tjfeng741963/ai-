import { useEffect, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { getLake } from '../../services/api';

interface RoadmapPanelProps {
  lakeId: string;
  currentNodeId: string | null;
  visitedNodeIds: string[];
}

const TYPE_COLORS: Record<string, string> = {
  start: '#27c93f',
  choice: '#6c8cff',
  merge: '#ffbd2e',
  ending: '#ff5f57',
};

function buildFlowNodes(apiNodes: Array<{ id: string; type: string; title: string; positionX?: number; positionY?: number }>, currentNodeId: string | null, visitedIds: Set<string>): Node[] {
  // Auto-layout: arrange nodes in layers by traversing from START
  const nodeMap = new Map(apiNodes.map((n) => [n.id, n]));
  const startNode = apiNodes.find((n) => n.type === 'start');

  // Simple BFS layout
  const layers: Map<string, number> = new Map();
  if (startNode) {
    const queue = [{ id: startNode.id, depth: 0 }];
    const visited = new Set<string>();
    while (queue.length > 0) {
      const { id, depth } = queue.shift()!;
      if (visited.has(id)) continue;
      visited.add(id);
      layers.set(id, Math.max(layers.get(id) || 0, depth));
      // Children are any node that has an edge FROM this node
    }
  }

  // Actually, use the edges directly
  return apiNodes.map((n, i) => {
    const isCurrent = n.id === currentNodeId;
    const isVisited = visitedIds.has(n.id);
    const color = TYPE_COLORS[n.type] || '#6c8cff';

    // Simple grid layout if no positions saved
    const col = i % 3;
    const row = Math.floor(i / 3);

    return {
      id: n.id,
      type: 'default',
      position: n.positionX ? { x: n.positionX, y: n.positionY } : { x: col * 180 + 20, y: row * 100 + 20 },
      data: {
        label: n.title,
        nodeType: n.type,
        color,
      },
      style: {
        border: `2px solid ${isCurrent ? '#fff' : color}`,
        borderRadius: '8px',
        padding: '8px 12px',
        fontSize: '11px',
        background: isCurrent ? `${color}22` : isVisited ? '#1a1a24' : '#111118',
        color: isCurrent ? '#fff' : isVisited ? '#ccc' : '#666',
        borderWidth: isCurrent ? '3px' : '2px',
        boxShadow: isCurrent ? `0 0 12px ${color}40` : 'none',
        minWidth: '90px',
        textAlign: 'center' as const,
      },
    };
  });
}

function buildFlowEdges(apiEdges: Array<{ id: string; fromNodeId: string; toNodeId: string; optionText: string }>, visitedEdgeIds: string[]): Edge[] {
  return apiEdges.map((e) => {
    const isVisited = visitedEdgeIds.includes(e.id);
    return {
      id: e.id,
      source: e.fromNodeId,
      target: e.toNodeId,
      label: e.optionText,
      labelStyle: { fontSize: '9px', fill: isVisited ? '#ccc' : '#555' },
      labelBgStyle: { fill: '#1a1a24', fillOpacity: 0.85 },
      style: {
        stroke: isVisited ? '#6c8cff' : '#2a2a3a',
        strokeWidth: isVisited ? 2.5 : 1.5,
        strokeDasharray: isVisited ? '' : '5,5',
      },
      animated: isVisited,
    };
  });
}

export default function RoadmapPanel({ lakeId, currentNodeId, visitedNodeIds }: RoadmapPanelProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const visitedSet = useMemo(() => new Set(visitedNodeIds), [visitedNodeIds]);

  useEffect(() => {
    getLake(lakeId).then((lake) => {
      const apiNodes = lake.nodes || [];
      const apiEdges = lake.edges || [];
      const flowNodes = buildFlowNodes(apiNodes, currentNodeId, visitedSet);

      // Re-traverse to find visited edges
      const visitedEdgeIds: string[] = [];
      for (let i = 0; i < visitedNodeIds.length; i++) {
        const fromId = i === 0 ? (apiNodes.find((n) => n.type === 'start')?.id || '') : visitedNodeIds[i - 1];
        const toId = visitedNodeIds[i];
        const edge = apiEdges.find((e) => e.fromNodeId === fromId && e.toNodeId === toId);
        if (edge) visitedEdgeIds.push(edge.id);
      }
      // Also include the edge from last visited to current
      if (currentNodeId && visitedNodeIds.length > 0) {
        const lastVisited = visitedNodeIds[visitedNodeIds.length - 1];
        const edge = apiEdges.find((e) => e.fromNodeId === lastVisited && e.toNodeId === currentNodeId);
        if (edge) visitedEdgeIds.push(edge.id);
      }

      const flowEdges = buildFlowEdges(apiEdges, visitedEdgeIds);
      setNodes(flowNodes);
      setEdges(flowEdges);
    }).catch(() => {});
  }, [lakeId, currentNodeId, visitedSet, setNodes, setEdges]);

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-white/10">
        <h3 className="text-sm font-medium text-white/70">路线图</h3>
        <div className="flex gap-2 mt-2 text-[10px] text-white/40">
          <span>🟢 起始</span>
          <span>🔵 选择</span>
          <span>🟡 汇合</span>
          <span>🔴 结局</span>
        </div>
      </div>
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag
          zoomOnScroll
          preventScrolling={false}
          proOptions={{ hideAttribution: true }}
        >
          <MiniMap style={{ background: '#1a1a24', width: 100, height: 70 }} maskColor="rgba(0,0,0,0.7)" nodeColor={(n) => (n.data as { color?: string })?.color || '#666'} />
          <Controls showInteractive={false} />
          <Background color="#2a2a3a" gap={20} size={0.5} />
        </ReactFlow>
      </div>
    </div>
  );
}
