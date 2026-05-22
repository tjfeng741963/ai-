/**
 * 互动剧 — 故事湖业务逻辑层
 *
 * 封装 CRUD 操作，处理级联删除、大纲替换等业务逻辑。
 */

import * as db from '../../db/interactive-drama-db.js';

// ========== 故事湖 ==========

export function listLakes(sqliteDb) {
  return db.listStoryLakes(sqliteDb);
}

export function getLake(sqliteDb, lakeId) {
  const lake = db.getStoryLake(sqliteDb, lakeId);
  if (!lake) return null;

  const nodes = db.listNodesByLake(sqliteDb, lakeId);
  const edges = db.listEdgesByLake(sqliteDb, lakeId);
  const variables = db.listVariables(sqliteDb, lakeId);

  return { ...lake, nodes, edges, variables };
}

export function createLake(sqliteDb, data) {
  return db.createStoryLake(sqliteDb, data);
}

export function updateLake(sqliteDb, lakeId, data) {
  return db.updateStoryLake(sqliteDb, lakeId, data);
}

export function deleteLake(sqliteDb, lakeId) {
  db.deleteStoryLake(sqliteDb, lakeId);
}

// ========== 节点 ==========

export function listNodes(sqliteDb, lakeId) {
  return db.listNodesByLake(sqliteDb, lakeId);
}

export function getNode(sqliteDb, nodeId) {
  return db.getNode(sqliteDb, nodeId);
}

export function createNode(sqliteDb, data) {
  return db.createNode(sqliteDb, data);
}

export function updateNode(sqliteDb, nodeId, data) {
  return db.updateNode(sqliteDb, nodeId, data);
}

export function deleteNode(sqliteDb, nodeId) {
  db.deleteNode(sqliteDb, nodeId);
}

// ========== 边 ==========

export function listEdges(sqliteDb, lakeId) {
  return db.listEdgesByLake(sqliteDb, lakeId);
}

export function createEdge(sqliteDb, data) {
  return db.createEdge(sqliteDb, data);
}

export function updateEdge(sqliteDb, edgeId, data) {
  return db.updateEdge(sqliteDb, edgeId, data);
}

export function deleteEdge(sqliteDb, edgeId) {
  db.deleteEdge(sqliteDb, edgeId);
}

// ========== 状态变量 ==========

export function listVariables(sqliteDb, lakeId) {
  return db.listVariables(sqliteDb, lakeId);
}

export function createVariable(sqliteDb, data) {
  return db.createVariable(sqliteDb, data);
}

export function updateVariable(sqliteDb, varId, data) {
  return db.updateVariable(sqliteDb, varId, data);
}

export function deleteVariable(sqliteDb, varId) {
  db.deleteVariable(sqliteDb, varId);
}

// ========== 大纲替换（原子操作） ==========

/**
 * 一次性替换故事湖的所有节点和边。用于 Phase 1 大纲确认后写入。
 * 先删除旧节点（CASCADE 自动删边），再批量插入新节点和边。
 */
export function replaceOutline(sqliteDb, lakeId, nodes, edges) {
  // 直接删除所有现有节点（CASCADE 会自动删除关联的边）
  const existingNodes = db.listNodesByLake(sqliteDb, lakeId);
  for (const node of existingNodes) {
    db.deleteNode(sqliteDb, node.id);
  }

  // 批量插入新节点
  const nodeIdMap = {}; // tempId → realId
  for (const node of nodes) {
    const created = db.createNode(sqliteDb, {
      lakeId,
      type: node.type || 'choice',
      title: node.title || '',
      content: node.content || '',
      entryConditions: node.entryConditions || {},
      contentVariants: node.contentVariants || [],
      positionX: node.positionX || 0,
      positionY: node.positionY || 0,
      sortOrder: node.sortOrder || 0,
      isAiGenerated: true,
      isProtected: false,
    });
    nodeIdMap[node.tempId || node.id] = created.id;
  }

  // 批量插入新边
  for (const edge of edges) {
    db.createEdge(sqliteDb, {
      lakeId,
      fromNodeId: nodeIdMap[edge.fromTempId || edge.fromNodeId] || edge.fromNodeId,
      toNodeId: nodeIdMap[edge.toTempId || edge.toNodeId] || edge.toNodeId,
      optionText: edge.optionText || '',
      priority: edge.priority || 0,
      conditions: edge.conditions || {},
      stateChanges: edge.stateChanges || [],
      timing: edge.timing || {},
    });
  }

  // 更新 story_lakes 状态
  db.updateStoryLake(sqliteDb, lakeId, { status: 'ready' });

  return {
    nodes: db.listNodesByLake(sqliteDb, lakeId),
    edges: db.listEdgesByLake(sqliteDb, lakeId),
  };
}
