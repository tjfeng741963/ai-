import { Router } from 'express';
import { initDB } from '../db/index.js';
import * as lakeService from '../services/interactive-drama/storyLakeService.js';
import * as playService from '../services/interactive-drama/playSessionService.js';
import * as aiService from '../services/interactive-drama/aiGenerationService.js';
import * as chatAgent from '../services/interactive-drama/chatAgent.js';
import { deletePlaySession } from '../db/interactive-drama-db.js';

const router = Router();

function getDb() {
  return initDB();
}

function sendSSE(res, type, data) {
  res.write(`data: ${JSON.stringify({ type, ...data })}\n\n`);
}

// ==================== 故事湖 CRUD ====================

router.get('/lakes', (req, res) => {
  try {
    const db = getDb();
    const lakes = lakeService.listLakes(db);
    res.json({ success: true, data: lakes });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.post('/lakes', (req, res) => {
  try {
    const db = getDb();
    const lake = lakeService.createLake(db, req.body);
    res.json({ success: true, data: lake });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.get('/lakes/:id', (req, res) => {
  try {
    const db = getDb();
    const lake = lakeService.getLake(db, req.params.id);
    if (!lake) return res.status(404).json({ success: false, error: '故事湖不存在' });
    res.json({ success: true, data: lake });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.put('/lakes/:id', (req, res) => {
  try {
    const db = getDb();
    const lake = lakeService.updateLake(db, req.params.id, req.body);
    if (!lake) return res.status(404).json({ success: false, error: '故事湖不存在' });
    res.json({ success: true, data: lake });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.delete('/lakes/:id', (req, res) => {
  try {
    const db = getDb();
    lakeService.deleteLake(db, req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// ==================== 节点 CRUD ====================

router.get('/lakes/:id/nodes', (req, res) => {
  try {
    const db = getDb();
    const nodes = lakeService.listNodes(db, req.params.id);
    res.json({ success: true, data: nodes });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.post('/lakes/:id/nodes', (req, res) => {
  try {
    const db = getDb();
    const node = lakeService.createNode(db, { ...req.body, lakeId: req.params.id });
    res.json({ success: true, data: node });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.put('/nodes/:nodeId', (req, res) => {
  try {
    const db = getDb();
    const node = lakeService.updateNode(db, req.params.nodeId, req.body);
    if (!node) return res.status(404).json({ success: false, error: '节点不存在' });
    res.json({ success: true, data: node });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.delete('/nodes/:nodeId', (req, res) => {
  try {
    const db = getDb();
    lakeService.deleteNode(db, req.params.nodeId);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// ==================== 边 CRUD ====================

router.post('/edges', (req, res) => {
  try {
    const db = getDb();
    const edge = lakeService.createEdge(db, req.body);
    res.json({ success: true, data: edge });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.put('/edges/:edgeId', (req, res) => {
  try {
    const db = getDb();
    const edge = lakeService.updateEdge(db, req.params.edgeId, req.body);
    if (!edge) return res.status(404).json({ success: false, error: '边不存在' });
    res.json({ success: true, data: edge });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.delete('/edges/:edgeId', (req, res) => {
  try {
    const db = getDb();
    lakeService.deleteEdge(db, req.params.edgeId);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// ==================== 状态变量 ====================

router.get('/lakes/:id/variables', (req, res) => {
  try {
    const db = getDb();
    const vars = lakeService.listVariables(db, req.params.id);
    res.json({ success: true, data: vars });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.put('/variables/:varId', (req, res) => {
  try {
    const db = getDb();
    const v = lakeService.updateVariable(db, req.params.varId, req.body);
    if (!v) return res.status(404).json({ success: false, error: '变量不存在' });
    res.json({ success: true, data: v });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// ==================== 一键生成完整设定 ====================

router.post('/lakes/:id/generate-profile', async (req, res) => {
  try {
    const db = getDb();
    const lake = lakeService.getLake(db, req.params.id);
    if (!lake) return res.status(404).json({ success: false, error: '故事湖不存在' });

    const { idea } = req.body;
    if (!idea) return res.status(400).json({ success: false, error: '请提供故事想法' });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = chatAgent.generateFullProfile(idea);

    for await (const event of stream) {
      sendSSE(res, event.type, event);
    }

    res.end();
  } catch (e) {
    console.error('generate-profile error:', e);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: e.message });
    } else {
      sendSSE(res, 'error', { message: e.message });
      res.end();
    }
  }
});

// ==================== 单步对话（审核阶段） ====================

router.post('/lakes/:id/chat', async (req, res) => {
  try {
    const db = getDb();
    const lake = lakeService.getLake(db, req.params.id);
    if (!lake) return res.status(404).json({ success: false, error: '故事湖不存在' });

    const { message, step } = req.body;
    if (!message) return res.status(400).json({ success: false, error: '消息不能为空' });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const creationProfile = lake.creationProfile || {};
    const currentStep = step || 1;

    const stream = chatAgent.chatStream(creationProfile, currentStep, message);

    for await (const event of stream) {
      sendSSE(res, event.type, event);
    }

    res.end();
  } catch (e) {
    console.error('chat error:', e);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: e.message });
    } else {
      sendSSE(res, 'error', { message: e.message });
      res.end();
    }
  }
});

// ==================== AI 生成 ====================

router.post('/lakes/:id/generate-outline', async (req, res) => {
  try {
    const db = getDb();
    const lake = lakeService.getLake(db, req.params.id);
    if (!lake) return res.status(404).json({ success: false, error: '故事湖不存在' });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const profile = lake.creationProfile || {};
    const chars = (profile.characters || []).map(c => `${c.name}(${c.identity})`).join('、');
    const endings = (profile.endings || []).map(e => `${e.name}(${e.type})`).join('、');
    const events = (profile.keyEvents || []).map(e => e.description).join('；');

    const systemPrompt = `你是互动剧剧本结构师。根据用户提供的设定，设计一个分支剧情节点骨架。

先用人话分析和描述你的设计思路：故事从哪里开始、有哪些关键分叉点、每条分支的逻辑、汇合点设计、以及结局的触发条件。让读者能看懂这个故事怎么玩。

描述完之后，在末尾用 <!-- PROFILE:...--> 标记输出结构化 JSON：
{"nodes":[{"tempId":"n1","type":"start|choice|merge|ending","title":"标题","summary":"20字概要","endingType":"good|bad|hidden|true|null"}],"edges":[{"fromTempId":"n1","toTempId":"n2","optionText":"选项","conditions":{},"stateChanges":[],"timingNote":""}],"variables":[{"name":"变量","type":"boolean|number|timing","initialValue":"0"}],"hookTracking":{"hooksTriggered":[],"hooksResolved":[]}}

规则：1个起始节点，2-4个结局，共6-12个节点。路径可汇合，选项带条件和状态变化。不要输出代码块。`;

    const userMsg = `核心创意: ${profile.coreIdea || ''}
角色: ${chars}
世界观: ${profile.worldSetting || ''}
结局: ${endings}
转折: ${events}
选项数: ${profile.styleParams?.branchDensity || 3} 允许汇合: ${profile.styleParams?.allowMerge !== false ? '是' : '否'}`;

    const stream = chatAgent.streamAI(systemPrompt, userMsg);

    for await (const event of stream) {
      sendSSE(res, event.type, event);
    }

    res.end();
  } catch (e) {
    console.error('generate-outline error:', e);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: e.message });
    } else {
      sendSSE(res, 'error', { message: e.message });
      res.end();
    }
  }
});

router.post('/lakes/:id/apply-outline', (req, res) => {
  try {
    const db = getDb();
    const { nodes, edges } = req.body;
    if (!nodes || !Array.isArray(nodes)) {
      return res.status(400).json({ success: false, error: '缺少 nodes 数据' });
    }
    const result = lakeService.replaceOutline(db, req.params.id, nodes, edges);
    res.json({ success: true, data: result });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.post('/lakes/:id/generate-content', async (req, res) => {
  try {
    const db = getDb();
    const lake = lakeService.getLake(db, req.params.id);
    if (!lake) return res.status(404).json({ success: false, error: '故事湖不存在' });

    const allNodes = lake.nodes || [];
    if (allNodes.length === 0) return res.status(400).json({ success: false, error: '请先生成大纲' });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const profile = lake.creationProfile || {};
    const edges = lake.edges || [];

    // 每批处理 3 个节点，避免 token 超限
    const BATCH_SIZE = 3;
    const batches = [];
    for (let i = 0; i < allNodes.length; i += BATCH_SIZE) {
      batches.push(allNodes.slice(i, i + BATCH_SIZE));
    }

    const allResults = [];

    for (let bi = 0; bi < batches.length; bi++) {
      const batch = batches[bi];
      sendSSE(res, 'progress', { batch: bi + 1, total: batches.length, nodeTitle: batch[0]?.title || '' });

      // 精简 prompt
      // 按序号标注，不暴露数据库 ID
      const batchMap = batch.map((n, i) => ({ idx: i + 1, id: n.id, title: n.title, type: n.type }));
      const nodesDesc = batch.map((n, i) => {
        const inEdges = edges.filter((e) => e.toNodeId === n.id);
        const outEdges = edges.filter((e) => e.fromNodeId === n.id);
        const typeLabel = n.type === 'start' ? '起始' : n.type === 'ending' ? '结局' : n.type === 'merge' ? '汇合' : '选择';
        return `[${i + 1}] ${typeLabel}「${n.title}」
  进: ${inEdges.map((e) => e.optionText).join(' / ') || '(起始)'}
  出: ${outEdges.map((e) => e.optionText).join(' / ') || '(结局)'}`;
      }).join('\n\n');

      const systemPrompt = `你是互动剧剧本写手。为每个编号的节点写出200-400字的剧本正文。

规则：
- 第一人称或第三人称沉浸叙事
- 对话和动作穿插，有节奏感
- 起始节点设悬念，结局节点有余韵
- 汇合节点自然衔接不同来路的剧情
- 严格按照节点顺序[1][2][3]输出

输出格式（在回复末尾）：
<!-- PROFILE:{"nodes":[{"idx":1,"content":"正文"},{"idx":2,"content":"正文"}]}-->`;

      const userMsg = `故事背景：${(profile.coreIdea || '').slice(0, 150)}
世界观：${(profile.worldSetting || '').slice(0, 150)}
角色：${(profile.characters || []).map((c) => `${c.name}(${c.identity})`).join('、')}

本批节点：
${nodesDesc}`;

      const stream = chatAgent.streamAI(systemPrompt, userMsg);

      let batchResult = null;
      let fullResponse = '';
      for await (const event of stream) {
        if (event.type === 'delta' || event.type === 'reasoning') {
          const c = event.content || '';
          fullResponse += c;
          sendSSE(res, event.type, { content: c, batch: bi + 1, total: batches.length });
        } else if (event.type === 'profile' && event.data) {
          batchResult = event.data;
        }
      }

      // 解析结果：优先用 profile 事件数据，否则手动从 fullResponse 中提取
      let nodesData = null;
      if (batchResult?.nodes) {
        nodesData = batchResult.nodes;
      } else {
        // fallback: 手动查找 JSON
        const m = fullResponse.match(/\{[\s\S]*"nodes"[\s\S]*\}/);
        if (m) {
          try { const parsed = JSON.parse(m[0]); nodesData = parsed.nodes; } catch { /* */ }
        }
      }

      if (nodesData) {
        for (const n of nodesData) {
          // idx 是序号(1-based)，映射回真实节点
          const idx = n.idx || n.nodeId;
          const matched = batchMap.find((b) => b.idx === idx || b.id === idx);
          if (matched && n.content) {
            lakeService.updateNode(db, matched.id, { content: n.content });
            allResults.push({ id: matched.id, title: matched.title });
            sendSSE(res, 'node_complete', { nodeId: matched.id, title: matched.title });
          }
        }
      }

      sendSSE(res, 'batch_complete', { batch: bi + 1, total: batches.length });
    }

    sendSSE(res, 'done', { nodeCount: allResults.length });
    res.end();
  } catch (e) {
    console.error('generate-content error:', e);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: e.message });
    } else {
      sendSSE(res, 'error', { message: e.message });
      res.end();
    }
  }
});

router.post('/nodes/:nodeId/regenerate', async (req, res) => {
  try {
    const db = getDb();
    const node = lakeService.getNode(db, req.params.nodeId);
    if (!node) return res.status(404).json({ success: false, error: '节点不存在' });

    const { instruction } = req.body;
    if (!instruction) return res.status(400).json({ success: false, error: '缺少修改指令' });

    // 构建节点上下文
    const allEdges = lakeService.listEdges(db, node.lakeId);
    const incomingEdges = allEdges.filter((e) => e.toNodeId === node.id);
    const outgoingEdges = allEdges.filter((e) => e.fromNodeId === node.id);

    const nodeContext = {
      node,
      incomingEdges,
      outgoingEdges,
    };

    const result = await aiService.regenerateNode(nodeContext, instruction);

    // 更新节点内容
    const updated = lakeService.updateNode(db, req.params.nodeId, {
      title: result.title || node.title,
      content: result.content || node.content,
      isAiGenerated: true,
    });

    res.json({ success: true, data: updated });
  } catch (e) {
    console.error('regenerate error:', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

router.post('/lakes/:id/ai-feedback', async (req, res) => {
  try {
    const db = getDb();
    const lake = lakeService.getLake(db, req.params.id);
    if (!lake) return res.status(404).json({ success: false, error: '故事湖不存在' });

    const { step } = req.body;
    const creationProfile = lake.creationProfile || {};

    const feedback = await aiService.getStepFeedback(step || 1, creationProfile);
    res.json({ success: true, data: feedback });
  } catch (e) {
    console.error('ai-feedback error:', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

// ==================== 播放验证 ====================

router.post('/lakes/:id/sessions', (req, res) => {
  try {
    const db = getDb();
    const state = playService.startSession(db, req.params.id);
    res.json({ success: true, data: state });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.get('/sessions/:sessionId', (req, res) => {
  try {
    const db = getDb();
    const state = playService.getCurrentPlayerState(db, req.params.sessionId);
    if (!state) return res.status(404).json({ success: false, error: '会话不存在' });
    res.json({ success: true, data: state });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.post('/sessions/:sessionId/choose', (req, res) => {
  try {
    const db = getDb();
    const { edgeId } = req.body;
    if (!edgeId) return res.status(400).json({ success: false, error: '缺少 edgeId' });

    const state = playService.makeChoice(db, req.params.sessionId, edgeId);
    res.json({ success: true, data: state });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.delete('/sessions/:sessionId', (req, res) => {
  try {
    const db = getDb();
    deletePlaySession(db, req.params.sessionId);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

export default router;
