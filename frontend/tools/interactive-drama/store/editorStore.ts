import { create } from 'zustand';
import {
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from '@xyflow/react';
import type { StoryNode, StoryEdge, PropertyTab, EditorMode } from '../types';
import * as api from '../services/api';

interface EditorState {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  propertyTab: PropertyTab;
  editorMode: EditorMode;
  lakeNodes: StoryNode[];
  lakeEdges: StoryEdge[];

  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  selectNode: (id: string | null) => void;
  selectEdge: (id: string | null) => void;
  setPropertyTab: (tab: PropertyTab) => void;
  setEditorMode: (mode: EditorMode) => void;
  loadFromLake: (lakeId: string) => Promise<void>;
  saveNodePosition: (nodeId: string, x: number, y: number) => Promise<void>;
}

function storyNodeToFlowNode(node: StoryNode): Node {
  const typeColors: Record<string, string> = {
    start: '#27c93f',
    choice: '#6c8cff',
    merge: '#ffbd2e',
    ending: '#ff5f57',
  };

  return {
    id: node.id,
    type: 'default',
    position: { x: node.positionX || 0, y: node.positionY || 0 },
    data: {
      label: node.title,
      nodeType: node.type,
      content: node.content,
      isProtected: node.isProtected,
      color: typeColors[node.type] || '#6c8cff',
    },
    style: {
      border: `2px solid ${typeColors[node.type] || '#6c8cff'}`,
      borderRadius: '8px',
      padding: '10px 14px',
      fontSize: '12px',
      background: '#1a1a24',
      color: '#e8e8ed',
      minWidth: '120px',
    },
  };
}

function storyEdgeToFlowEdge(edge: StoryEdge): Edge {
  return {
    id: edge.id,
    source: edge.fromNodeId,
    target: edge.toNodeId,
    label: edge.optionText,
    labelStyle: { fontSize: '10px', fill: '#999' },
    labelBgStyle: { fill: '#1a1a24', fillOpacity: 0.9 },
    style: { stroke: '#2a2a3a', strokeWidth: 2 },
    animated: false,
  };
}

export const useEditorStore = create<EditorState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  selectedEdgeId: null,
  propertyTab: 'content',
  editorMode: 'outline',
  lakeNodes: [],
  lakeEdges: [],

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) });
  },

  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },

  onConnect: (connection) => {
    set({ edges: addEdge(connection, get().edges) });
  },

  selectNode: (id) => set({ selectedNodeId: id, selectedEdgeId: null }),
  selectEdge: (id) => set({ selectedEdgeId: id, selectedNodeId: null }),

  setPropertyTab: (tab) => set({ propertyTab: tab }),
  setEditorMode: (mode) => set({ editorMode: mode }),

  loadFromLake: async (lakeId) => {
    try {
      const lake = await api.getLake(lakeId);
      const nodes = lake.nodes || [];
      const edges = lake.edges || [];

      set({
        lakeNodes: nodes,
        lakeEdges: edges,
        nodes: nodes.map(storyNodeToFlowNode),
        edges: edges.map(storyEdgeToFlowEdge),
      });
    } catch (e) {
      // Load failed
    }
  },

  saveNodePosition: async (nodeId, x, y) => {
    try {
      await api.updateNode(nodeId, { positionX: x, positionY: y });
    } catch (e) {
      // Save failed
    }
  },
}));
