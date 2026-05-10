import { callAIStream, getAdScriptConfig } from './ad-script-agent.js';

const TIERS = {
  '15s': { label: '15秒极速', shots: '3-5', duration: '15秒', desc: '快节奏产品闪现，每镜2-3秒' },
  '30s': { label: '30秒标准', shots: '5-8', duration: '30秒', desc: '完整功能展示，节奏适中' },
  '60s': { label: '60秒详细', shots: '8-12', duration: '60秒', desc: '场景+功能+种草，内容丰富' },
};

const CHAT_SYSTEM_PROMPT = `# 角色：短视频分镜脚本规划师

你是一个专注于电商短视频的分镜脚本规划师。用户告诉你想拍什么视频，你需要：

1. 快速理解用户需求，用2-3句话总结：这是什么产品、要展示什么卖点、拍摄重点是什么
2. 给出3个风格方向供选择

## 回复格式
先用2-3句话总结你对需求的理解，然后给出3个风格方向。

## 选项输出规则
回复末尾必须包含OPTIONS标记：
<!-- OPTIONS:[{"id":"1","label":"标题","description":"一句话描述"},{"id":"2","label":"标题","description":"一句话描述"},{"id":"3","label":"标题","description":"一句话描述"}] -->

选项就是你推荐的3个风格方向，label 2-6个字，description 一句话。

## 规则
- 不要问多余问题，一轮就够
- 不要提及分镜、镜头等专业术语，用"拍摄风格"来描述
- 用自然亲切的语气
- 你只做这一件事：理解需求+给风格选项`;

function buildGeneratePrompt(style, tier) {
  const tierSpec = TIERS[tier];
  if (!tierSpec) throw new Error(`不支持的档位: ${tier}`);

  return `# 角色：短视频分镜脚本规划师

你根据用户的需求和已确认的风格方向，生成一份完整的拍摄分镜脚本。

## 已确认信息
- 拍摄风格：${style}
- 视频时长：${tierSpec.duration}
- 镜头数量：${tierSpec.shots}个镜头
- 节奏特点：${tierSpec.desc}

## 输出格式（严格遵守）

先输出基本信息，然后输出Markdown表格：

视频主题：{主题}
视频时长：${tierSpec.duration}
视频风格：${style}

| 镜号 | 时长 | 景别 | 画面描述 | 参考图 | 运镜 |
|------|------|------|----------|--------|------|
| 1 | 0-Xs | 景别 | 详细画面描述 | 【插入XX图】 | 运镜方式 |
| 2 | X-Ys | 景别 | 详细画面描述 | 【插入XX图】 | 运镜方式 |
...

背景音乐：{推荐风格}
字幕建议：{字幕策略}

## 规则
- 每个需要用户提供参考图的地方用【插入XX图】标记
- XX要具体描述图片内容，如"产品正面图""产品使用场景图"，不要用泛指的"图片"
- 不是每个镜头都需要参考图，只在需要用户提供素材的地方标记
- 画面描述要详细到可以直接拍摄，包含动作、构图、氛围
- 景别选择：特写/近景/中景/全景/远景
- 运镜选择：固定/缓推/缓拉/跟拍/俯拍/仰拍/环绕/摇镜
- 严格控制在${tierSpec.shots}个镜头内
- 不要输出OPTIONS标记
- 不要问任何问题，直接输出完整分镜脚本`;
}

const SLOT_RE = /【插入(.+?)】/g;

function extractImageSlots(text) {
  const slots = [];
  const seen = new Set();
  let match;
  const re = new RegExp(SLOT_RE.source, SLOT_RE.flags);
  while ((match = re.exec(text)) !== null) {
    const label = match[1];
    if (seen.has(label)) continue;
    seen.add(label);
    slots.push({
      id: `slot-${slots.length + 1}`,
      label,
      placeholder: match[0],
    });
  }
  return slots;
}

const OPTIONS_RE = /<!--\s*OPTIONS:(.*?)\s*-->/s;

function parseOptions(text) {
  const match = text.match(OPTIONS_RE);
  if (!match) return { cleanText: text, options: null };
  const cleanText = text.replace(OPTIONS_RE, '').trim();
  try {
    const options = JSON.parse(match[1].trim());
    return { cleanText, options: Array.isArray(options) ? options : null };
  } catch {
    return { cleanText, options: null };
  }
}

export {
  TIERS,
  CHAT_SYSTEM_PROMPT,
  buildGeneratePrompt,
  extractImageSlots,
  parseOptions,
  callAIStream,
  getAdScriptConfig,
};
