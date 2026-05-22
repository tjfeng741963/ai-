/**
 * 互动剧 — AI 生成服务
 *
 * 两阶段生成：
 *   Phase 1: generateOutline() — 非流式，forceJson，约 3K tokens
 *   Phase 2: generateContentBatch() — SSE 流式，按故事线分批
 *
 * 复用 server.js 的 callAIAPI 模式和 ad-script-agent.js 的 callAIStream 模式
 */

import { getProviderConfig, getModelConfig } from '../../config/models.js';
import { createAssembler } from '../prompt-assembler.js';

// ========== AI 配置 ==========

const DRAMA_AI_CONFIG = {
  provider: 'deepseek',
  model: 'deepseek-v4-pro',
  temperature: 0.8,
  maxTokens: 4096,
  outlineMaxTokens: 6144,
};

// ========== System Prompt 片段 ==========

const SYSTEM_ROLE = `你是一个互动剧剧本结构专家。你擅长设计分支剧情、伏笔回收、角色弧线，以及确保不同分支路径的叙事一致性。`;

const CORE_RULES = `## 核心规则
1. 每个选项必须对后续剧情产生实质性影响（不能选A选B最终到达同一个节点且内容相同）
2. 汇合节点内容必须根据来路的状态变量动态变化（不能两条路汇合后说同样的话）
3. 结局之间必须有明确的条件门槛（不能所有条件都导向同一个结局）
4. 钩子必须回收：在 keyEvents 中埋下的伏笔，必须在某个节点/结局中被回收
5. 状态变量不能只写不读：每个变量必须至少影响一次选项可见性或内容变体`;

const ANTI_PATTERNS = `## 禁止事项
- 不要所有选项都变成"温和做法 vs 激进做法"的二选一
- 不要让汇合节点无视来路状态说相同的话——不同路径到达应有不同的内容体现
- 不要让所有结局的文本风格雷同（悲剧结局不应该和喜剧结局用同样的语调）
- 不要出现无意义选项——选了等于没选，两个选项导致完全相同的后续
- 不要忘记回收钩子——每个 keyEvent 必须在至少一个节点内容中被明确引用`;

// ========== AI 调用封装 ==========

async function callAI(messages, options = {}) {
  const config = { ...DRAMA_AI_CONFIG, ...options };
  const provider = getProviderConfig(config.provider);
  const modelCfg = getModelConfig(config.model);
  const envKey = modelCfg?.envKey || provider.envKey;
  const apiKey = process.env[envKey];

  if (!apiKey) {
    throw new Error(`未配置 ${envKey} 环境变量`);
  }

  const url = `${provider.baseUrl}${provider.chatPath}`;
  const headers = {
    'Content-Type': 'application/json',
    [provider.authHeader]: `${provider.authPrefix}${apiKey}`,
    ...provider.extraHeaders,
  };

  const body = {
    model: config.model,
    messages,
    temperature: config.temperature,
    max_tokens: config.maxTokens,
  };

  // DeepSeek 不支持 response_format，改用 prompt 指令
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(120000),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI API错误 ${response.status}: ${errorText}`);
  }

  return response.json();
}

async function* callAIStream(messages, options = {}) {
  const config = { ...DRAMA_AI_CONFIG, ...options };
  const provider = getProviderConfig(config.provider);
  const modelCfg = getModelConfig(config.model);
  const envKey = modelCfg?.envKey || provider.envKey;
  const apiKey = process.env[envKey];

  if (!apiKey) {
    throw new Error(`未配置 ${envKey} 环境变量`);
  }

  const url = `${provider.baseUrl}${provider.chatPath}`;
  const headers = {
    'Content-Type': 'application/json',
    [provider.authHeader]: `${provider.authPrefix}${apiKey}`,
    ...provider.extraHeaders,
  };

  const body = {
    model: config.model,
    messages,
    temperature: config.temperature,
    max_tokens: config.maxTokens,
    stream: true,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI API错误 ${response.status}: ${errorText}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data: ')) continue;
      const data = trimmed.slice(6);
      if (data === '[DONE]') return;

      try {
        const parsed = JSON.parse(data);
        const delta = parsed.choices?.[0]?.delta;
        if (delta?.content) yield delta.content;
        else if (delta?.reasoning_content) yield ''; // skip reasoning, keep connection alive
      } catch {
        // 忽略非JSON行
      }
    }
  }
}

// ========== 提示词构建 ==========

function buildOutlinePrompt(creationProfile) {
  // 精简创作配置为简短摘要
  const chars = (creationProfile.characters || []).map((c) => `${c.name}(${c.identity})`).join('、');
  const endings = (creationProfile.endings || []).map((e) => `${e.name}(${e.type})`).join('、');
  const events = (creationProfile.keyEvents || []).map((e) => e.description).join('；');
  const summary = `核心创意: ${creationProfile.coreIdea || '无'}
角色: ${chars || '无'}
世界观: ${creationProfile.worldSetting || '无'}
结局: ${endings || '无'}
关键转折: ${events || '无'}
选项数: ${creationProfile.styleParams?.branchDensity || 3} 允许汇合: ${creationProfile.styleParams?.allowMerge !== false ? '是' : '否'}`;

  const prompt = `你是互动剧剧本结构师。根据以下设定，生成一个分支剧情节点骨架。

${summary}

规则：
1. 起始节点只有一个，结局节点2-4个
2. 路径可以汇合到同一节点
3. 选项需附带条件表达式和状态变化
4. 关键转折事件必须在节点内容中被触发或回收

输出纯 JSON（不要markdown代码块）：
{"nodes":[{"tempId":"n1","type":"start|choice|merge|ending","title":"标题","summary":"20字概要","endingType":"good|bad|hidden|true|null"}],"edges":[{"fromTempId":"n1","toTempId":"n2","optionText":"选项","conditions":{},"stateChanges":[],"timingNote":""}],"variables":[{"name":"变量","type":"boolean|number|timing","initialValue":"0"}],"hookTracking":{"hooksTriggered":[],"hooksResolved":[]}}

生成6-12个节点。`;

  return { systemPrompt: prompt, estimatedTokens: Math.ceil(prompt.length / 1.5) };
}

function buildContentBatchPrompt(creationProfile, batchNodes, fullOutline, styleParams) {
  const assembler = createAssembler();

  const layers = [
    {
      id: 'role',
      priority: 0,
      title: '角色',
      render: () => SYSTEM_ROLE,
    },
    {
      id: 'rules',
      priority: 5,
      title: '核心规则',
      intensity: 'critical',
      render: () => CORE_RULES,
    },
    {
      id: 'anti_patterns',
      priority: 8,
      title: '禁止事项',
      intensity: 'important',
      render: () => ANTI_PATTERNS,
    },
    {
      id: 'world_context',
      priority: 10,
      title: '世界观与故事背景',
      render: () => {
        const p = creationProfile;
        return `核心创意: ${p.coreIdea || '未设定'}
目标受众: ${p.targetAudience || '未设定'}
情绪走向: ${p.emotionalArc || '未设定'}
世界观: ${p.worldSetting || '未设定'}`;
      },
    },
    {
      id: 'writing_style',
      priority: 20,
      title: '写作风格约束',
      render: () => (styleParams ? JSON.stringify(styleParams, null, 2) : '使用默认叙事风格'),
    },
    {
      id: 'full_outline',
      priority: 30,
      title: '完整骨架参考',
      render: () => JSON.stringify(fullOutline, null, 2),
    },
    {
      id: 'batch_nodes',
      priority: 50,
      title: '本批次需要生成内容的节点',
      intensity: 'critical',
      render: () => JSON.stringify(batchNodes, null, 2),
    },
    {
      id: 'output_format',
      priority: 90,
      title: '输出格式',
      intensity: 'critical',
      render: () => `对以上每个节点，生成完整的剧本正文。严格按以下 JSON 格式输出：

{
  "nodes": [
    {
      "nodeId": "节点的tempId或id",
      "title": "节点标题",
      "content": "完整的剧本正文（200-500字），这是玩家在该节点看到的所有文本",
      "contentVariants": [],
      "hooksTriggered": ["本节点触发的钩子"],
      "hooksResolved": ["本节点回收的钩子"]
    }
  ]
}

注意：
1. 正文必须符合前面设定的写作风格约束
2. 正文应该自然流畅，不要像在回答问题
3. 如果该节点是汇合节点，正文应根据来路状态有所变化（通过contentVariants体现）
4. 所有 mention 到的钩子必须在 hooksTriggered 或 hooksResolved 中标记`,
    },
  ];

  const result = assembler.assemble(layers, {});
  return { systemPrompt: result.text, estimatedTokens: result.estimatedTokens };
}

function buildRegeneratePrompt(nodeContext, instructions) {
  const assembler = createAssembler();

  const layers = [
    {
      id: 'role',
      priority: 0,
      title: '角色',
      render: () => '你是一个互动剧剧本编辑专家。你的任务是修改一个节点的剧本内容。',
    },
    {
      id: 'context',
      priority: 10,
      title: '节点上下文',
      render: () => JSON.stringify(nodeContext, null, 2),
    },
    {
      id: 'instructions',
      priority: 50,
      title: '修改要求',
      intensity: 'important',
      render: () => instructions,
    },
    {
      id: 'output',
      priority: 90,
      title: '输出格式',
      render: () => `返回 JSON：
{
  "title": "修改后的标题（如有变化）",
  "content": "修改后的剧本正文"
}

只修改用户要求改的部分，保持其他内容不变。`,
    },
  ];

  const result = assembler.assemble(layers, {});
  return { systemPrompt: result.text, estimatedTokens: result.estimatedTokens };
}

// ========== 公开 API ==========

/**
 * Phase 1: 生成大纲骨架（SSE 流式）
 */
export async function* generateOutlineStream(creationProfile) {
  const { systemPrompt } = buildOutlinePrompt(creationProfile);

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: '请根据创作配置生成完整的互动剧节点骨架。' },
  ];

  let fullContent = '';

  for await (const token of callAIStream(messages, {
    maxTokens: DRAMA_AI_CONFIG.outlineMaxTokens,
  })) {
    fullContent += token;
    yield { type: 'delta', content: token };
  }

  // 尝试解析 JSON
  try {
    const jsonMatch = fullContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      if (result.nodes && Array.isArray(result.nodes) && result.nodes.length > 0) {
        yield { type: 'done', data: result };
        return;
      }
    }
    yield { type: 'error', message: 'AI 返回的数据无法解析为有效大纲' };
  } catch (e) {
    yield { type: 'error', message: `JSON 解析失败: ${e.message}` };
  }
}

/**
 * Phase 2: 批量生成节点内容（SSE 流式）
 * @param {object} creationProfile
 * @param {Array} batchNodes - 本批次要生成的节点（含骨架信息）
 * @param {object} fullOutline - 完整骨架（用于上下文）
 * @param {object} styleParams - 风格参数
 * @returns {AsyncGenerator} SSE 事件流
 */
export async function* generateContentStream(creationProfile, batchNodes, fullOutline, styleParams) {
  const { systemPrompt } = buildContentBatchPrompt(creationProfile, batchNodes, fullOutline, styleParams);

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `请为本批次的 ${batchNodes.length} 个节点生成完整的剧本正文。` },
  ];

  let fullContent = '';

  for await (const token of callAIStream(messages, { maxTokens: DRAMA_AI_CONFIG.maxTokens })) {
    fullContent += token;
    yield { type: 'delta', content: token };
  }

  // 尝试解析完整 JSON
  try {
    const jsonMatch = fullContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      yield { type: 'done', data: parsed };
    } else {
      yield { type: 'error', message: '无法解析 AI 返回的 JSON' };
    }
  } catch (e) {
    yield { type: 'error', message: `JSON 解析失败: ${e.message}` };
  }
}

/**
 * 单节点重新生成
 * @param {object} nodeContext - 节点上下文（前后节点、状态变量等）
 * @param {string} instructions - 用户修改指令
 */
export async function regenerateNode(nodeContext, instructions) {
  const { systemPrompt } = buildRegeneratePrompt(nodeContext, instructions);

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `请按照修改要求重写节点内容。` },
  ];

  const response = await callAI(messages, {
    maxTokens: 2048,
    forceJson: true,
  });

  const content = response.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('AI 未返回内容');
  }

  return JSON.parse(content);
}

/**
 * 创作步骤 AI 即时反馈
 * @param {number} step - 步骤编号 1-4
 * @param {object} creationProfile - 当前已填写的创作配置
 */
export async function getStepFeedback(step, creationProfile) {
  const stepPrompts = {
    1: `请分析以下故事核心创意，指出其作为互动剧的潜力、可能的分支方向和潜在问题：
核心创意: ${creationProfile.coreIdea || '未填写'}
目标受众: ${creationProfile.targetAudience || '未填写'}
情绪走向: ${creationProfile.emotionalArc || '未填写'}`,

    2: `请分析以下角色设定，指出角色间的冲突潜力、缺失的角色类型、以及角色关系可以产生哪些分支：
${JSON.stringify(creationProfile.characters || [], null, 2)}`,

    3: `请检查世界观设定的一致性，以及风格参数是否与核心创意匹配：
世界观: ${creationProfile.worldSetting || '未填写'}
风格参数: ${JSON.stringify(creationProfile.styleParams || {}, null, 2)}`,

    4: `请分析结局的覆盖率，检查是否存在：
1. 所有结局是否都有可能被玩家达成（逻辑上可达）
2. 关键转折事件是否覆盖到了所有结局
3. 是否存在缺失的状态变量
结局: ${JSON.stringify(creationProfile.endings || [], null, 2)}
关键事件: ${JSON.stringify(creationProfile.keyEvents || [], null, 2)}`,
  };

  const userMessage = stepPrompts[step] || '请提供反馈。';

  const messages = [
    { role: 'system', content: '你是一个互动剧创作顾问。请给出具体、可操作的建议。用中文回答，控制在200字以内。' },
    { role: 'user', content: userMessage },
  ];

  const response = await callAI(messages, { maxTokens: 1024 });

  return response.choices?.[0]?.message?.content || '无法获取反馈';
}

export { DRAMA_AI_CONFIG };
