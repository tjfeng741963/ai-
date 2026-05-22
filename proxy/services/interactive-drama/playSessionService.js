/**
 * 互动剧 — 播放状态机服务
 *
 * 管理 playSession 生命周期：
 *   startSession → getCurrentState → makeChoice → ... → endSession
 */

import * as db from '../../db/interactive-drama-db.js';

// ========== 条件评估引擎 ==========

/**
 * 评估条件表达式
 * 支持操作符: gte, lte, eq, neq, gt, lt
 * 示例: { "affection": { "gte": 60 } } → 检查 currentState.affection >= 60
 */
export function evaluateConditions(conditions, currentState) {
  if (!conditions || Object.keys(conditions).length === 0) return true;

  for (const [variable, condition] of Object.entries(conditions)) {
    const currentValue = currentState[variable];

    // timing 类型：比较节点序号
    if (typeof condition === 'object' && condition !== null) {
      for (const [op, targetValue] of Object.entries(condition)) {
        if (!evaluateOp(op, currentValue, targetValue)) return false;
      }
    } else {
      // 简单相等比较
      if (currentValue !== condition) return false;
    }
  }

  return true;
}

function evaluateOp(op, currentVal, targetVal) {
  // null/undefined 检查
  if (currentVal === null || currentVal === undefined) {
    return op === 'neq';
  }

  switch (op) {
    case 'gte': return currentVal >= targetVal;
    case 'lte': return currentVal <= targetVal;
    case 'eq': return currentVal === targetVal;
    case 'neq': return currentVal !== targetVal;
    case 'gt': return currentVal > targetVal;
    case 'lt': return currentVal < targetVal;
    default: return true;
  }
}

// ========== 状态变更引擎 ==========

/**
 * 应用状态变更
 * 支持操作符: set, add, sub, mul, div
 */
export function applyStateChanges(changes, currentState) {
  const newState = { ...currentState };

  for (const change of changes) {
    const { variable, operator, value } = change;
    const currentVal = newState[variable] ?? 0;

    switch (operator) {
      case 'set':
        newState[variable] = value;
        break;
      case 'add':
        newState[variable] = (typeof currentVal === 'number' ? currentVal : 0) + value;
        break;
      case 'sub':
        newState[variable] = (typeof currentVal === 'number' ? currentVal : 0) - value;
        break;
      case 'mul':
        newState[variable] = (typeof currentVal === 'number' ? currentVal : 0) * value;
        break;
      case 'div':
        newState[variable] = (typeof currentVal === 'number' && value !== 0 ? currentVal : 0) / value;
        break;
      default:
        newState[variable] = value;
    }
  }

  return newState;
}

// ========== 内容变体匹配 ==========

/**
 * 根据当前状态匹配内容变体
 * 返回第一个匹配的变体文本，无匹配则返回 null
 */
export function matchContentVariant(contentVariants, currentState) {
  if (!contentVariants || contentVariants.length === 0) return null;

  for (const variant of contentVariants) {
    if (evaluateConditions(variant.condition, currentState)) {
      return variant.text;
    }
  }

  return null;
}

// ========== 播放会话 API ==========

/**
 * 创建播放会话，从 START 节点开始
 */
export function startSession(sqliteDb, lakeId) {
  const nodes = db.listNodesByLake(sqliteDb, lakeId);
  const startNode = nodes.find((n) => n.type === 'start');

  if (!startNode) {
    throw new Error('故事湖没有起始节点');
  }

  // 初始化状态变量
  const variables = db.listVariables(sqliteDb, lakeId);
  const initialState = {};
  for (const v of variables) {
    if (v.type === 'number') {
      initialState[v.name] = v.initialValue ? Number(v.initialValue) : 0;
    } else if (v.type === 'boolean') {
      initialState[v.name] = v.initialValue === 'true';
    } else {
      // timing 和其他类型
      initialState[v.name] = null;
    }
  }

  const session = db.createPlaySession(sqliteDb, {
    lakeId,
    currentNodeId: startNode.id,
    currentState: initialState,
  });

  return buildPlayerState(sqliteDb, session.id);
}

/**
 * 获取当前播放状态
 */
export function getCurrentPlayerState(sqliteDb, sessionId) {
  return buildPlayerState(sqliteDb, sessionId);
}

/**
 * 做出选择：应用状态变更 → 跳转到目标节点 → 记录事件
 */
export function makeChoice(sqliteDb, sessionId, edgeId) {
  const session = db.getPlaySession(sqliteDb, sessionId);
  if (!session) throw new Error('播放会话不存在');
  if (session.status === 'ended') throw new Error('播放已结束');

  const edge = db.getEdge(sqliteDb, edgeId);
  if (!edge) throw new Error('选项不存在');

  // 验证该边是否从当前节点出发
  if (edge.fromNodeId !== session.currentNodeId) {
    throw new Error('选项不属于当前节点');
  }

  // 应用状态变更
  const newState = applyStateChanges(edge.stateChanges, session.currentState);

  // 更新 visitedNodeIds 和 pathEdges
  const visitedNodeIds = [...session.visitedNodeIds, session.currentNodeId];
  const pathEdges = [...session.pathEdges, edgeId];

  // 检查目标节点
  const targetNode = db.getNode(sqliteDb, edge.toNodeId);
  if (!targetNode) throw new Error('目标节点不存在');

  // 检查 entryConditions
  const canEnter = evaluateConditions(targetNode.entryConditions, newState);
  if (!canEnter) {
    throw new Error('不满足进入目标节点的条件');
  }

  // 判断是否到达结局
  const isEnding = targetNode.type === 'ending';

  // 更新会话
  db.updatePlaySession(sqliteDb, sessionId, {
    currentNodeId: targetNode.id,
    currentState: newState,
    visitedNodeIds,
    pathEdges,
    status: isEnding ? 'ended' : 'playing',
    endedAt: isEnding ? new Date().toISOString() : undefined,
  });

  // 记录事件
  db.addPlayEvent(sqliteDb, {
    sessionId,
    nodeId: targetNode.id,
    edgeId,
    optionChosen: edge.optionText,
    stateSnapshot: newState,
  });

  return buildPlayerState(sqliteDb, sessionId);
}

// ========== 内部辅助 ==========

function buildPlayerState(sqliteDb, sessionId) {
  const session = db.getPlaySession(sqliteDb, sessionId);
  if (!session) return null;

  const currentNode = session.currentNodeId
    ? db.getNode(sqliteDb, session.currentNodeId)
    : null;

  // 获取可用选项（从当前节点出发的边，且满足条件）
  let availableEdges = [];
  if (currentNode && session.status === 'playing') {
    const allEdges = db.listEdgesByLake(sqliteDb, session.lakeId);
    availableEdges = allEdges
      .filter((e) => e.fromNodeId === currentNode.id)
      .filter((e) => evaluateConditions(e.conditions, session.currentState))
      .sort((a, b) => a.priority - b.priority);
  }

  // 匹配内容变体
  let displayContent = currentNode ? currentNode.content : '';
  if (currentNode && currentNode.contentVariants.length > 0) {
    const variant = matchContentVariant(currentNode.contentVariants, session.currentState);
    if (variant) displayContent = variant;
  }

  return {
    sessionId: session.id,
    lakeId: session.lakeId,
    status: session.status,
    currentNode: currentNode ? {
      id: currentNode.id,
      type: currentNode.type,
      title: currentNode.title,
      content: displayContent,
    } : null,
    currentState: session.currentState,
    availableEdges: availableEdges.map((e) => ({
      id: e.id,
      optionText: e.optionText,
      conditions: e.conditions,
    })),
    visitedNodeIds: session.visitedNodeIds,
    pathEdges: session.pathEdges,
    startedAt: session.startedAt,
    updatedAt: session.updatedAt,
    endedAt: session.endedAt,
  };
}
