/**
 * 互动剧 — AI 创作服务
 *
 * generateFullProfile: 人给一个想法 → AI 一口气生成完整创作设定
 * chatStream: 单步对话（审核阶段用）
 */

import { getProviderConfig, getModelConfig } from '../../config/models.js';

const CONFIG = {
  provider: 'deepseek',
  model: 'deepseek-v4-pro',
  temperature: 0.8,
  maxTokens: 8192,
};

const FULL_PROFILE_SYSTEM = `你是一个专业的互动剧策划师。用户会给你一个故事想法，你需要一次性生成完整的互动剧创作设定。

你需要输出以下全部内容：

1. **核心创意** (coreIdea): 将用户的想法扩展为100-200字的精彩故事梗概
2. **目标受众** (targetAudience): 推断最适合的受众群体
3. **情绪走向** (emotionalArc): 故事的情绪曲线
4. **角色设定** (characters): 2-4个核心角色，每个包含name/identity/personality/motivation/relationship
5. **世界观** (worldSetting): 100-200字的世界观设定
6. **结局** (endings): 3-5个不同结局，每个包含name/type(good|bad|hidden|true)/description
7. **关键转折** (keyEvents): 3-5个关键剧情转折事件，每个包含description/expectedTiming
8. **风格参数** (styleParams): pacingDensity/allowMerge/branchDensity

重要：
- 结局之间必须有明确的条件差异
- 关键转折必须能影响结局走向
- 角色之间要有冲突潜力
- 用中文输出

输出格式：在回复末尾用 <!-- PROFILE:...--> 包含完整的 JSON 对象。JSON 结构：
{
  "coreIdea": "...",
  "targetAudience": "...",
  "emotionalArc": "...",
  "characters": [{"name":"","identity":"","personality":"","motivation":"","relationship":""}],
  "worldSetting": "...",
  "endings": [{"name":"","type":"good|bad|hidden|true","description":""}],
  "keyEvents": [{"description":"","expectedTiming":""}],
  "styleParams": {"pacingDensity":"standard","branchDensity":3,"allowMerge":true}
}`;

// ========== 通用 SSE 流式调用 ==========

export async function* streamAI(systemPrompt, userMessage, maxTokens = 8192) {
  const provider = getProviderConfig(CONFIG.provider);
  const modelCfg = getModelConfig(CONFIG.model);
  const envKey = modelCfg?.envKey || provider.envKey;
  const apiKey = process.env[envKey];
  if (!apiKey) throw new Error(`未配置 ${envKey}`);

  const url = `${provider.baseUrl}${provider.chatPath}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      [provider.authHeader]: `${provider.authPrefix}${apiKey}`,
      ...provider.extraHeaders,
    },
    body: JSON.stringify({
      model: CONFIG.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: CONFIG.temperature,
      max_tokens: maxTokens,
      stream: true,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`AI API错误 ${res.status}: ${errText}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullContent = '';

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
      if (data === '[DONE]') break;
      try {
        const parsed = JSON.parse(data);
        const delta = parsed.choices?.[0]?.delta;
        if (delta?.content) {
          fullContent += delta.content;
          yield { type: 'delta', content: delta.content };
        } else if (delta?.reasoning_content) {
          yield { type: 'reasoning', content: delta.reasoning_content };
        }
      } catch { /* skip */ }
    }
  }

  // 尝试解析 JSON：优先找 <!-- PROFILE:...--> 标记
  const profileMatch = fullContent.match(/<!--\s*PROFILE:\s*([\s\S]*?)-->/);
  if (profileMatch) {
    try {
      const data = JSON.parse(profileMatch[1].trim());
      yield { type: 'profile', data };
    } catch {
      // PROFILE 标记解析失败，尝试找最后一个完整 JSON 对象
    }
  }
  // Fallback: 找最后一个 {...} 对象（非贪婪方式定位到最后一个完整的 JSON 块）
  if (!profileMatch) {
    const matches = [...fullContent.matchAll(/\{(?:[^{}]|(?:\{[^{}]*\}))*\}/g)];
    const lastMatch = matches[matches.length - 1];
    if (lastMatch) {
      try {
        const data = JSON.parse(lastMatch[0]);
        if (data.nodes || data.characters || data.variables) {
          yield { type: 'profile', data };
        }
      } catch { /* */ }
    }
  }

  yield { type: 'done' };
}

// ========== 一键生成完整设定 ==========

export async function* generateFullProfile(userIdea) {
  const provider = getProviderConfig(CONFIG.provider);
  const modelCfg = getModelConfig(CONFIG.model);
  const envKey = modelCfg?.envKey || provider.envKey;
  const apiKey = process.env[envKey];
  if (!apiKey) throw new Error(`未配置 ${envKey}`);

  const messages = [
    { role: 'system', content: FULL_PROFILE_SYSTEM },
    { role: 'user', content: `请根据以下想法，生成完整的互动剧创作设定：\n\n${userIdea}` },
  ];

  const url = `${provider.baseUrl}${provider.chatPath}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      [provider.authHeader]: `${provider.authPrefix}${apiKey}`,
      ...provider.extraHeaders,
    },
    body: JSON.stringify({
      model: CONFIG.model,
      messages,
      temperature: CONFIG.temperature,
      max_tokens: CONFIG.maxTokens,
      stream: true,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`AI API错误 ${res.status}: ${errText}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullContent = '';

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
      if (data === '[DONE]') break;
      try {
        const parsed = JSON.parse(data);
        const delta = parsed.choices?.[0]?.delta;
        if (delta?.content) {
          fullContent += delta.content;
          yield { type: 'delta', content: delta.content };
        } else if (delta?.reasoning_content) {
          yield { type: 'reasoning', content: delta.reasoning_content };
        }
      } catch { /* skip */ }
    }
  }

  // 解析结构化数据
  const profileMatch = fullContent.match(/<!--\s*PROFILE:\s*([\s\S]*?)-->/);
  if (profileMatch) {
    try {
      const profileData = JSON.parse(profileMatch[1].trim());
      yield { type: 'profile', data: profileData };
    } catch { /* JSON parse error */ }
  }

  yield { type: 'done' };
}

// ========== 单步对话（审核阶段用） ==========

const STEP_SYSTEM_PROMPTS = {
  2: `你是互动剧角色策划师。根据当前已有的创作设定，优化角色。输出格式：先给建议，再 <!-- PROFILE:{"characters":[...]}-->`,
  3: `你是互动剧世界观策划师。完善世界观设定。输出格式：先给建议，再 <!-- PROFILE:{"worldSetting":"...","styleParams":{...}}-->`,
  4: `你是互动剧剧情策划师。完善结局和转折。输出格式：先给建议，再 <!-- PROFILE:{"endings":[...],"keyEvents":[...]}-->`,
};

export async function* chatStream(creationProfile, step, userMessage) {
  const systemPrompt = (STEP_SYSTEM_PROMPTS[step] || STEP_SYSTEM_PROMPTS[2])
    + `\n\n当前设定：\n${JSON.stringify(creationProfile, null, 2)}`;

  const provider = getProviderConfig(CONFIG.provider);
  const modelCfg = getModelConfig(CONFIG.model);
  const envKey = modelCfg?.envKey || provider.envKey;
  const apiKey = process.env[envKey];
  if (!apiKey) throw new Error(`未配置 ${envKey}`);

  const url = `${provider.baseUrl}${provider.chatPath}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      [provider.authHeader]: `${provider.authPrefix}${apiKey}`,
      ...provider.extraHeaders,
    },
    body: JSON.stringify({
      model: CONFIG.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: CONFIG.temperature,
      max_tokens: 4096,
      stream: true,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`AI API错误 ${res.status}: ${errText}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullContent = '';

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
      if (data === '[DONE]') break;
      try {
        const parsed = JSON.parse(data);
        const delta = parsed.choices?.[0]?.delta;
        if (delta?.content) {
          fullContent += delta.content;
          yield { type: 'delta', content: delta.content };
        } else if (delta?.reasoning_content) {
          yield { type: 'reasoning', content: delta.reasoning_content };
        }
      } catch { /* skip */ }
    }
  }

  const profileMatch = fullContent.match(/<!--\s*PROFILE:\s*([\s\S]*?)-->/);
  if (profileMatch) {
    try {
      const profileData = JSON.parse(profileMatch[1].trim());
      yield { type: 'profile', data: profileData };
    } catch { /* */ }
  }

  yield { type: 'done' };
}
