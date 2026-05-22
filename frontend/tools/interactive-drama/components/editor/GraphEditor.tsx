import { useCallback, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useReactFlow,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useEditorStore } from '../../store/editorStore';
import NodePropertyPanel from './NodePropertyPanel';

interface GraphEditorProps {
  lakeId: string;
  mode?: 'outline' | 'content';
}

export default function GraphEditor({ lakeId, mode = 'outline' }: GraphEditorProps) {
  const {
    nodes,
    edges,
    selectedNodeId,
    onNodesChange,
    onEdgesChange,
    onConnect,
    selectNode,
    loadFromLake,
    saveNodePosition,
    setEditorMode,
  } = useEditorStore();

  useEffect(() => {
    loadFromLake(lakeId);
  }, [lakeId, loadFromLake]);

  useEffect(() => {
    setEditorMode(mode);
  }, [mode, setEditorMode]);

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      selectNode(node.id);
    },
    [selectNode],
  );

  const onPaneClick = useCallback(() => {
    selectNode(null);
  }, [selectNode]);

  const onNodeDragStop = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      saveNodePosition(node.id, node.position.x, node.position.y);
    },
    [saveNodePosition],
  );

  return (
    <div className="h-full flex">
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onNodeDragStop={onNodeDragStop}
          fitView
          attributionPosition="bottom-left"
        >
          <MiniMap
            style={{ background: '#1a1a24' }}
            maskColor="rgba(0,0,0,0.7)"
            nodeColor={(n) => (n.data as { color?: string })?.color || '#6c8cff'}
          />
          <Controls />
          <Background color="#2a2a3a" gap={20} />
        </ReactFlow>
      </div>
      {selectedNodeId && (
        <NodePropertyPanel lakeId={lakeId} nodeId={selectedNodeId} />
      )}
    </div>
  );
}
