import type { RatingResult } from '@/types/rating.ts';
import type {
  AdvancedRatingResult,
  AnalysisPhase,
  StructureAnalysis,
  CharacterAnalysis,
  EmotionAnalysis,
  MarketSuggestion,
  RiskAssessment,
  ProductionFeasibility,
  ExecutiveSummary,
  DetailedAnalysis,
  ActionableRecommendation,
  PlatformRecommendationSummary,
  BusinessClosedLoopPlan,
  MarketResonanceAnalysis,
  NarrativeDNAAnalysis,
  CommercialPotentialAnalysis,
  ComplianceAssessmentAnalysis,
} from '@/types/rating-advanced.ts';
import type {
  ModelInfo,
  Provider,
  GetModelsResponse,
  GetProvidersResponse,
  ModelSelection,
  ProviderId,
} from '@/types/models.ts';
import {
  SYSTEM_PROMPT,
  STRUCTURE_ANALYSIS_PROMPT,
  CHARACTER_ANALYSIS_PROMPT,
  EMOTION_ANALYSIS_PROMPT,
  MARKET_ANALYSIS_PROMPT,
  COMPLIANCE_ANALYSIS_PROMPT,
  COMPREHENSIVE_RATING_PROMPT,
  fillPrompt,
  ANALYSIS_PHASES_CONFIG,
} from './prompts.ts';
import {
  EXECUTIVE_SUMMARY_PROMPT,
  MARKET_RESONANCE_DETAILED_PROMPT,
  NARRATIVE_DNA_DETAILED_PROMPT,
  COMMERCIAL_COMPLIANCE_DETAILED_PROMPT,
  ACTIONABLE_RECOMMENDATIONS_PROMPT,
  PRODUCTION_ANALYSIS_PROMPT,
  STRUCTURE_DETAILED_PROMPT,
  CHARACTER_DETAILED_PROMPT,
  EMOTION_DETAILED_PROMPT,
  MARKET_DETAILED_PROMPT,
  RISK_DETAILED_PROMPT,
  fillDetailedPrompt,
  DETAILED_ANALYSIS_PHASES,
} from './prompts-detailed.ts';

// API 配置
const API_BASE = '/api';

// 默认模型配置
// 火山引擎豆包 endpoint: doubao-1-5-pro-32k-250115
const DEFAULT_MODEL_ID = 'ep-20260317144814-4pqbx';
const DEFAULT_PROVIDER: ProviderId = 'volcengine';

// 当前模型选择（可由用户更改）
let currentModelSelection: ModelSelection = {
  provider: DEFAULT_PROVIDER,
  modelId: DEFAULT_MODEL_ID,
  temperature: 0.3,
  maxTokens: 8000,
};

// ==================== 模型管理 ====================

/**
 * 获取可用模型列表
 */
export async function getAvailableModels(): Promise<ModelInfo[]> {
  try {
    const response = await fetch(`${API_BASE}/models`);
    if (!response.ok) {
      throw new Error('获取模型列表失败');
    }
    const data: GetModelsResponse = await response.json();
    return data.models.filter((m) => m.available);
  } catch (error) {
    console.warn('获取模型列表失败，使用默认配置:', error);
    return [];
  }
}

/**
 * 获取已配置的提供商列表
 */
export async function getConfiguredProviders(): Promise<Provider[]> {
  try {
    const response = await fetch(`${API_BASE}/providers`);
    if (!response.ok) {
      throw new Error('获取提供商列表失败');
    }
    const data: GetProvidersResponse = await response.json();
    return data.providers.filter((p) => p.configured);
  } catch (error) {
    console.warn('获取提供商列表失败:', error);
    return [];
  }
}

/**
 * 设置当前模型
 */
export function setCurrentModel(selection: ModelSelection): void {
  currentModelSelection = { ...currentModelSelection, ...selection };
}

/**
 * 获取当前模型配置
 */
export function getCurrentModel(): ModelSelection {
  return { ...currentModelSelection };
}

// ==================== 基础 API 调用 ====================

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
  provider?: ProviderId;
  model?: string;
  forceJson?: boolean;
  enableFallback?: boolean;
}

interface ModelCandidate {
  provider: ProviderId;
  model: string;
}

const MODEL_FALLBACK_PRIORITY = [
  DEFAULT_MODEL_ID,
  'qwen-max',
  'moonshot-v1-32k',
  'gpt-4o',
  'claude-3-sonnet',
  'deepseek-chat',
];
const MAX_MODEL_CANDIDATES = 4;
const MODEL_CACHE_TTL_MS = 60_000;
let availableModelsCache: { models: ModelInfo[]; ts: number } | null = null;

async function getAvailableModelsCached(): Promise<ModelInfo[]> {
  const now = Date.now();
  if (availableModelsCache && now - availableModelsCache.ts < MODEL_CACHE_TTL_MS) {
    return availableModelsCache.models;
  }

  const models = await getAvailableModels();
  availableModelsCache = { models, ts: now };
  return models;
}

function candidateKey(candidate: ModelCandidate): string {
  return `${candidate.provider}:${candidate.model}`;
}

function upsertCandidate(
  candidates: ModelCandidate[],
  candidate: ModelCandidate,
  seen: Set<string>
): void {
  const key = candidateKey(candidate);
  if (seen.has(key)) return;
  seen.add(key);
  candidates.push(candidate);
}

function formatError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function buildModelCandidates(options: ChatOptions = {}): Promise<ModelCandidate[]> {
  const primary: ModelCandidate = {
    provider: options.provider ?? currentModelSelection.provider,
    model: options.model ?? currentModelSelection.modelId,
  };

  if (options.enableFallback === false) {
    return [primary];
  }

  const candidates: ModelCandidate[] = [];
  const seen = new Set<string>();
  upsertCandidate(candidates, primary, seen);

  let availableModels: ModelInfo[] = [];
  try {
    availableModels = await getAvailableModelsCached();
  } catch (error) {
    console.warn('[model-routing] 获取可用模型失败，使用主模型:', error);
  }

  const availableById = new Map(availableModels.map((model) => [model.id, model]));

  for (const modelId of MODEL_FALLBACK_PRIORITY) {
    const model = availableById.get(modelId);
    if (!model) continue;
    upsertCandidate(
      candidates,
      { provider: model.provider, model: model.id },
      seen
    );
  }

  for (const model of availableModels) {
    if (candidates.length >= MAX_MODEL_CANDIDATES) break;
    upsertCandidate(
      candidates,
      { provider: model.provider, model: model.id },
      seen
    );
  }

  return candidates.slice(0, MAX_MODEL_CANDIDATES);
}

/**
 * 调用 Chat API（支持多提供商）
 */
async function callChatAPI(
  messages: ChatMessage[],
  options: ChatOptions = {}
): Promise<string> {
  const {
    temperature = currentModelSelection.temperature ?? 0.3,
    maxTokens = currentModelSelection.maxTokens ?? 8000,
    provider = currentModelSelection.provider,
    model = currentModelSelection.modelId,
    forceJson = true,
  } = options;

  // 统一使用新接口，便于透传更多控制参数（如 force_json）
  const endpoint = `${API_BASE}/chat`;

  // Debug: 打印使用的模型
  console.log(`[API] 调用模型: provider=${provider}, model=${model}`);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      provider,
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      force_json: forceJson,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API 调用失败: ${error}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('AI 返回内容为空');
  }

  return content;
}

/** 从 AI 响应中提取 JSON */
function extractJSON<T>(content: string): T {
  // ===== 第零阶段：提取 JSON 字符串 =====
  let jsonStr = '';

  // 方式1: 尝试匹配 ```json ... ``` 代码块
  const codeBlockMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1];
  } else {
    // 方式2: 尝试匹配完整的 JSON 对象 {...}
    const jsonObjectMatch = content.match(/\{[\s\S]*\}/);
    if (jsonObjectMatch) {
      jsonStr = jsonObjectMatch[0];
    } else {
      // 方式3: DeepSeek 可能返回不完整的 JSON（缺少外��� {}）
      // 例如: "executiveSummary": { ... }
      const partialMatch = content.match(/"[\w]+"\s*:\s*\{[\s\S]*\}?/);
      if (partialMatch) {
        jsonStr = '{' + partialMatch[0] + '}';
        console.log('[extractJSON] 修复缺少外层 {}');
      }
    }
  }

  if (!jsonStr) {
    throw new Error('无法解析 AI 返回的 JSON');
  }

  // ===== 第一阶段：确保 JSON 以 { 开头 =====
  jsonStr = jsonStr.trim();
  if (!jsonStr.startsWith('{')) {
    if (/^"[\w]+"\s*:/.test(jsonStr)) {
      jsonStr = '{' + jsonStr + '}';
      console.log('[extractJSON] 修复缺少外层 {}');
    }
  }

  // ===== 第二阶段：修复引号相关问题 =====
  // 所有后续函数（removeJsonComments, escapeControlCharsInJsonStrings）都依赖正确的引号边界
  // 如果引号边界不正确，状态机会混乱，导致后续处理全部出错
  //
  // ⚠️ 重要：执行顺序不能改变！
  // 1. fixConsecutiveQuotes - 先处理连续引号（添加逗号）
  // 2. fixUnescapedQuotesInStrings - 先修复引号边界
  // 3. removeJsonComments - 移除注释（此时引号边界已正确）
  // 4. escapeControlCharsInJsonStrings - 转义控制字符

  // 修复0: 处理数组元素之间连续引号无逗号的情况（DeepSeek 常见错误）
  // 例如: ["a""b"] -> ["a", "b"]
  // 使用循环持续修复，因为一次替换可能产生新的连续引号
  // 例如: ["a""b""c"] -> ["a""b", "c"] -> ["a", "b", "c"]
  {
    let prevLength = 0;
    while (prevLength !== jsonStr.length) {
      prevLength = jsonStr.length;
      jsonStr = jsonStr.replace(/""/g, '", "');
    }
  }

  // 修复1: 处理缺少开头引号的字符串值 (如: "key": value", -> "key": "value",)
  jsonStr = jsonStr.replace(
    /:\s*([^"\[\]{}\s:,\d][^"]*)"(\s*[,\}\]"\n])/g,
    (match, value, suffix) => {
      const trimmed = value.trim();
      if (trimmed === 'true' || trimmed === 'false' || trimmed === 'null') {
        return match;
      }
      console.log('[extractJSON] 修复缺少开头引号:', trimmed.slice(0, 30) + '...');
      return `: "${trimmed}"${suffix}`;
    }
  );

  // 修复2: 处理字符串中未转义的引号（必须最先执行！）
  // 例如: "能力觉醒"与"责任确认" -> "能力觉醒\"与\"责任确认"
  jsonStr = fixUnescapedQuotesInStrings(jsonStr);

  // 修复2: 移除 JSON 中的注释（现在引号边界正确，状态机不会混乱）
  // 例如: ["战场逆袭", # 红果推荐标签\n "古代职场求生记"]
  jsonStr = removeJsonComments(jsonStr);

  // 修复3: 转义控制字符（引号边界和注释都已处理）
  jsonStr = escapeControlCharsInJsonStrings(jsonStr);

  // 修复4: 处理数组元素之间缺少逗号（DeepSeek 常见错误）
  // 例如: ["a" "b", "c"] -> ["a", "b", "c"]
  // 例如: ["a"\n"b"] -> ["a", "b"]
  jsonStr = jsonStr.replace(/"\s+"/g, '", "');

  // 修复5: 确保 {} 配对（处理被截断的 JSON）
  // 必须在所有字符串修复之后执行，否则 inString 判断会出错
  {
    let braceCount = 0;
    let inString = false;
    let escaped = false;
    for (const char of jsonStr) {
      if (escaped) { escaped = false; continue; }
      if (char === '\\') { escaped = true; continue; }
      if (char === '"') { inString = !inString; continue; }
      if (!inString) {
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
      }
    }
    if (braceCount > 0) {
      jsonStr += '}'.repeat(braceCount);
      console.log('[extractJSON] 修复缺少结尾 }，补全', braceCount, '个');
    }
  }

  // 尝试解析
  try {
    return JSON.parse(jsonStr) as T;
  } catch (firstError) {
    console.warn('[extractJSON] 首次解析失败，尝试修复 JSON...', firstError);

    // ===== 第二阶段：其他修复（首次解析失败时才执行） =====

    // 修复5: 处理数组中缺少引号的值 (如: ["a", #b, "c"] -> ["a", "#b", "c"])
    jsonStr = jsonStr.replace(/,\s*([#@][^",\[\]{}]+)(\s*[,\]\}])/g, ',"$1"$2');

    // 修复6: 处理数组开头缺少引号的值
    jsonStr = jsonStr.replace(/\[\s*([#@][^",\[\]{}]+)(\s*[,\]])/g, '["$1"$2');

    // 修复7: 处理尾随逗号
    jsonStr = jsonStr.replace(/,(\s*[\]\}])/g, '$1');

    // 修复8: 处理属性名缺少引号
    jsonStr = jsonStr.replace(/\{\s*([a-zA-Z_][\w]*)\s*:/g, '{"$1":');
    jsonStr = jsonStr.replace(/,\s*([a-zA-Z_][\w]*)\s*:/g, ',"$1":');

    try {
      return JSON.parse(jsonStr) as T;
    } catch (secondError) {
      console.error('[extractJSON] 修复后仍然失败:', secondError);

      // 提取错误位置信息
      const errorMsg = secondError instanceof Error ? secondError.message : String(secondError);
      const posMatch = errorMsg.match(/position (\d+)/);
      const position = posMatch ? parseInt(posMatch[1]) : 0;

      // 显示错误位置周围的内容
      const start = Math.max(0, position - 200);
      const end = Math.min(jsonStr.length, position + 200);
      console.error('[extractJSON] ========== 错误详情 ==========');
      console.error('[extractJSON] 错误消息:', errorMsg);
      console.error('[extractJSON] 错误位置:', position);
      console.error('[extractJSON] 错误位置前200字符:\n', jsonStr.slice(start, position));
      console.error('[extractJSON] >>> 错误位置字符:', JSON.stringify(jsonStr.slice(position, position + 20)));
      console.error('[extractJSON] 错误位置后200字符:\n', jsonStr.slice(position, end));
      console.error('[extractJSON] ========== JSON 全文 (分段) ==========');
      // 分段打印完整JSON便于调试
      for (let i = 0; i < jsonStr.length; i += 3000) {
        console.error(`[extractJSON] JSON [${i}-${Math.min(i + 3000, jsonStr.length)}]:`, jsonStr.slice(i, i + 3000));
      }
      console.error('[extractJSON] JSON 总长度:', jsonStr.length);
      console.error('[extractJSON] ================================');

      throw new Error(`JSON 解析失败: ${errorMsg}`);
    }
  }
}

/** 转义 JSON 字符串值中的控制字符 */
function escapeControlCharsInJsonStrings(jsonStr: string): string {
  // 使用状态机处理字符串，只在双引号内转义控制字符
  let result = '';
  let inString = false;
  let escaped = false;

  for (let i = 0; i < jsonStr.length; i++) {
    const char = jsonStr[i];

    if (escaped) {
      result += char;
      escaped = false;
      continue;
    }

    if (char === '\\') {
      result += char;
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      result += char;
      continue;
    }

    if (inString) {
      // 转义字符串内的控制字符
      const code = char.charCodeAt(0);
      if (code < 32) {
        if (char === '\n') {
          result += '\\n';
        } else if (char === '\r') {
          result += '\\r';
        } else if (char === '\t') {
          result += '\\t';
        } else {
          // 其他控制字符用 unicode 转义
          result += '\\u' + code.toString(16).padStart(4, '0');
        }
      } else {
        result += char;
      }
    } else {
      result += char;
    }
  }

  return result;
}

/** 修复损坏的 JSON - 更激进的修复策略 */
function repairBrokenJSON(jsonStr: string): string {
  let result = jsonStr;

  // 修复1: 处理字符串值中未转义的双引号 (常见于 DeepSeek)
  // 例如: "description": "他说"你好"然后走了" -> "description": "他说\"你好\"然后走了"
  // 策略：在引号开始后，找到下一个有效的JSON结构符号（,}]）前的引号才是真正的结束引号
  result = fixUnescapedQuotesInStrings(result);

  // 修复2: 处理被截断的字符串 - 添加缺失的结束引号
  // 检测模式: "key": "value 后面没有闭合引号直接是 , 或 }
  result = result.replace(
    /("[\w\u4e00-\u9fa5]+"\s*:\s*"[^"]*?)(\n\s*[,\}\]])/g,
    '$1"$2'
  );

  // 修复3: 处理属性名缺少引号
  // 例如: {name: "value"} -> {"name": "value"}
  result = result.replace(
    /\{\s*([a-zA-Z_][\w]*)\s*:/g,
    '{"$1":'
  );
  result = result.replace(
    /,\s*([a-zA-Z_][\w]*)\s*:/g,
    ',"$1":'
  );

  return result;
}

/** 移除 JSON 中的注释（# 风格和 // 风格）*/
function removeJsonComments(jsonStr: string): string {
  const result: string[] = [];
  let i = 0;
  let inString = false;
  let escaped = false;

  while (i < jsonStr.length) {
    const char = jsonStr[i];
    const nextChar = jsonStr[i + 1];

    // 处理转义字符
    if (escaped) {
      result.push(char);
      escaped = false;
      i++;
      continue;
    }

    if (char === '\\' && inString) {
      result.push(char);
      escaped = true;
      i++;
      continue;
    }

    // 跟踪字符串状态
    if (char === '"') {
      inString = !inString;
      result.push(char);
      i++;
      continue;
    }

    // 在字符串外部时，检测并跳过注释
    if (!inString) {
      // # 风格注释（Python）- 跳过到行尾
      if (char === '#') {
        // 跳过整行注释
        while (i < jsonStr.length && jsonStr[i] !== '\n') {
          i++;
        }
        continue;
      }

      // // 风格注释（JavaScript）- 跳过到行尾
      if (char === '/' && nextChar === '/') {
        while (i < jsonStr.length && jsonStr[i] !== '\n') {
          i++;
        }
        continue;
      }

      // /* */ 风格注释（多行）
      if (char === '/' && nextChar === '*') {
        i += 2; // 跳过 /*
        while (i < jsonStr.length - 1) {
          if (jsonStr[i] === '*' && jsonStr[i + 1] === '/') {
            i += 2; // 跳过 */
            break;
          }
          i++;
        }
        continue;
      }
    }

    result.push(char);
    i++;
  }

  return result.join('');
}

/** 修复字符串值中未转义的双引号 */
function fixUnescapedQuotesInStrings(jsonStr: string): string {
  const result: string[] = [];
  let i = 0;

  while (i < jsonStr.length) {
    const char = jsonStr[i];

    // 不在字符串中时，直接输出
    if (char !== '"') {
      result.push(char);
      i++;
      continue;
    }

    // 找到一个引号，开始处理字符串
    result.push(char); // 输出开头引号
    i++;

    // 收集字符串内容直到找到真正的结束引号
    let stringContent = '';
    let foundEnd = false;

    while (i < jsonStr.length && !foundEnd) {
      const c = jsonStr[i];

      if (c === '\\' && i + 1 < jsonStr.length) {
        // 已转义的字符，直接保留
        stringContent += c + jsonStr[i + 1];
        i += 2;
        continue;
      }

      if (c === '"') {
        // 检查这个引号后面是不是有效的 JSON 结构
        const afterQuoteRaw = jsonStr.slice(i + 1);
        const afterQuote = afterQuoteRaw.trimStart();
        const nextChar = afterQuote[0];
        const nextTwoChars = afterQuote.slice(0, 2);
        // 检查引号后面是否有空白然后是另一个引号（缺少逗号的情况）
        const hasWhitespaceThenQuote = /^\s+\"/.test(afterQuoteRaw);

        // 如果引号后面是 , } ] : 或字符串结束，这是真正的结束引号
        // 也包括注释标记 # 或 //（这些会在后续被移除）
        // 也包括 空白+"（表示两个字符串之间缺少逗号，后续会修复）
        if (!nextChar || nextChar === ',' || nextChar === '}' || nextChar === ']' || nextChar === ':' || nextChar === '#' || hasWhitespaceThenQuote || nextTwoChars === '//') {
          foundEnd = true;
          result.push(stringContent);
          result.push('"'); // 输出结束引号
          i++;
          continue;
        }

        // 否则这是字符串中间的引号，需要转义
        stringContent += '\\"';
        i++;
        continue;
      }

      stringContent += c;
      i++;
    }

    // 如果��找到结束引号，把剩余内容都加上
    if (!foundEnd) {
      result.push(stringContent);
    }
  }

  return result.join('');
}

async function tryRepairJSONWithModel<T>(
  rawContent: string,
  options: ChatOptions,
  taskName: string
): Promise<T | null> {
  const repairPrompt = [
    '你是 JSON 修复器。',
    '请将下面文本修复为一个可被 JSON.parse 解析的合法 JSON 对象。',
    '要求：',
    '1) 只输出 JSON 对象，不要 markdown 代码块，不要解释文字。',
    '2) 保留原有字段语义，缺失括号/引号请自动补齐。',
    '3) 删除注释、尾随逗号、无关文本。',
    '',
    '待修复文本：',
    rawContent.slice(0, 16000),
  ].join('\n');

  try {
    const repairedContent = await callChatAPI(
      [
        { role: 'system', content: '你是严格的 JSON 修复器。' },
        { role: 'user', content: repairPrompt },
      ],
      {
        ...options,
        temperature: 0,
        maxTokens: Math.min(options.maxTokens ?? 4000, 4000),
        enableFallback: false,
        forceJson: true,
      }
    );

    return extractJSON<T>(repairedContent);
  } catch (error) {
    console.warn(`[${taskName}] JSON 修复调用失败:`, error);
    return null;
  }
}

async function callAndExtractJSON<T>(
  messages: ChatMessage[],
  options: ChatOptions = {},
  taskName = '分析任务'
): Promise<T> {
  const candidates = await buildModelCandidates(options);
  const errors: string[] = [];

  for (const candidate of candidates) {
    const candidateOptions: ChatOptions = {
      ...options,
      provider: candidate.provider,
      model: candidate.model,
      enableFallback: false,
      forceJson: options.forceJson ?? true,
    };

    const modelTag = `${candidate.provider}/${candidate.model}`;
    try {
      const content = await callChatAPI(messages, candidateOptions);
      try {
        return extractJSON<T>(content);
      } catch (parseError) {
        console.warn(`[${taskName}] ${modelTag} JSON 解析失败，尝试自动修复...`, parseError);

        const repaired = await tryRepairJSONWithModel<T>(content, candidateOptions, taskName);
        if (repaired) {
          console.log(`[${taskName}] ${modelTag} JSON 修复成功`);
          return repaired;
        }

        errors.push(`${modelTag} 解析失败: ${formatError(parseError)}`);
      }
    } catch (error) {
      errors.push(`${modelTag} 调用失败: ${formatError(error)}`);
    }
  }

  throw new Error(`[${taskName}] 所有候选模型均调用或解析失败：\n${errors.join('\n')}`);
}

// ==================== 分阶段分析 ====================

/** 进度回调类型 */
export type ProgressCallback = (
  progress: number,
  phase: string,
  step: string,
  phaseIndex: number
) => void;

/** 分析单个阶段 */
async function analyzePhase<T>(
  scriptContent: string,
  promptTemplate: string,
  phaseName: string,
  onProgress?: ProgressCallback,
  phaseIndex = 0,
  options?: ChatOptions
): Promise<T> {
  onProgress?.(0, phaseName, '准备分析...', phaseIndex);

  const prompt = fillPrompt(promptTemplate, { SCRIPT_CONTENT: scriptContent });

  onProgress?.(30, phaseName, '调用 AI 模型...', phaseIndex);

  const result = await callAndExtractJSON<T>(
    [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
    {
      ...options,
      forceJson: options?.forceJson ?? true,
    },
    phaseName
  );

  onProgress?.(80, phaseName, '结果解析完成...', phaseIndex);

  onProgress?.(100, phaseName, '完成', phaseIndex);

  return result;
}

/** 高级分析 - 分阶段执行 */
export async function analyzeScriptAdvanced(
  scriptContent: string,
  onProgress?: ProgressCallback,
  onPhaseComplete?: (phase: AnalysisPhase) => void,
  modelOptions?: ChatOptions
): Promise<AdvancedRatingResult> {
  const startTime = Date.now();
  const phases: AnalysisPhase[] = ANALYSIS_PHASES_CONFIG.map((config) => ({
    id: config.id,
    name: config.name,
    status: 'pending' as const,
    progress: 0,
  }));

  // 更新阶段状态
  const updatePhase = (index: number, updates: Partial<AnalysisPhase>) => {
    phases[index] = { ...phases[index], ...updates };
    onPhaseComplete?.({ ...phases[index] });
  };

  // 计算总体进度
  const calcTotalProgress = () => {
    const completed = phases.filter((p) => p.status === 'completed').length;
    const inProgress = phases.find((p) => p.status === 'in_progress');
    const inProgressValue = inProgress ? (inProgress.progress / 100) * 0.2 : 0;
    return Math.round((completed / phases.length + inProgressValue) * 100);
  };

  // 创建阶段进度回调
  const createPhaseProgress = (index: number) => {
    return (progress: number, phase: string, step: string) => {
      updatePhase(index, {
        progress,
        status: progress < 100 ? 'in_progress' : 'completed',
      });
      onProgress?.(calcTotalProgress(), phase, step, index);
    };
  };

  // 使用的模型 ID
  const usedModelId = modelOptions?.model ?? currentModelSelection.modelId;

  try {
    // Round 1: 结构分析
    updatePhase(0, { status: 'in_progress', startTime: Date.now() });
    const structureResult = await analyzePhase<
      { structureAnalysis: StructureAnalysis } & Record<string, unknown>
    >(
      scriptContent,
      STRUCTURE_ANALYSIS_PROMPT,
      '结构与世界观分析',
      createPhaseProgress(0),
      0,
      modelOptions
    );
    updatePhase(0, { status: 'completed', endTime: Date.now() });

    // Round 2: 人物分析
    updatePhase(1, { status: 'in_progress', startTime: Date.now() });
    const characterResult = await analyzePhase<
      { characterAnalysis: CharacterAnalysis } & Record<string, unknown>
    >(
      scriptContent,
      CHARACTER_ANALYSIS_PROMPT,
      '人物分析',
      createPhaseProgress(1),
      1,
      modelOptions
    );
    updatePhase(1, { status: 'completed', endTime: Date.now() });

    // Round 3: 情感分析
    updatePhase(2, { status: 'in_progress', startTime: Date.now() });
    const emotionResult = await analyzePhase<
      { emotionAnalysis: EmotionAnalysis } & Record<string, unknown>
    >(
      scriptContent,
      EMOTION_ANALYSIS_PROMPT,
      '情感与爽点分析',
      createPhaseProgress(2),
      2,
      modelOptions
    );
    updatePhase(2, { status: 'completed', endTime: Date.now() });

    // Round 4: 市场分析
    updatePhase(3, { status: 'in_progress', startTime: Date.now() });
    const marketResult = await analyzePhase<
      {
        marketSuggestion: MarketSuggestion;
        productionFeasibility: ProductionFeasibility;
      } & Record<string, unknown>
    >(
      scriptContent,
      MARKET_ANALYSIS_PROMPT,
      'AI漫剧市场分析',
      createPhaseProgress(3),
      3,
      modelOptions
    );
    updatePhase(3, { status: 'completed', endTime: Date.now() });

    // Round 5: 合规审查
    updatePhase(4, { status: 'in_progress', startTime: Date.now() });
    const complianceResult = await analyzePhase<
      { riskAssessment: RiskAssessment } & Record<string, unknown>
    >(
      scriptContent,
      COMPLIANCE_ANALYSIS_PROMPT,
      'AI内容合规审查',
      createPhaseProgress(4),
      4,
      modelOptions
    );
    updatePhase(4, { status: 'completed', endTime: Date.now() });

    // Final: 综合评级
    onProgress?.(90, '综合评级', '生成最终报告...', 5);

    const comprehensivePrompt = fillPrompt(COMPREHENSIVE_RATING_PROMPT, {
      STRUCTURE_DATA: JSON.stringify(structureResult),
      CHARACTER_DATA: JSON.stringify(characterResult),
      EMOTION_DATA: JSON.stringify(emotionResult),
      MARKET_DATA: JSON.stringify(marketResult),
      COMPLIANCE_DATA: JSON.stringify(complianceResult),
    });

    const ratingResult = await callAndExtractJSON<RatingResult>(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: comprehensivePrompt },
      ],
      {
        ...modelOptions,
        forceJson: modelOptions?.forceJson ?? true,
      },
      '综合评级'
    );

    onProgress?.(100, '完成', '分析完成', 5);

    // 组装完整结果
    const advancedResult: AdvancedRatingResult = {
      ...ratingResult,
      structureAnalysis: structureResult as unknown as StructureAnalysis,
      characterAnalysis: characterResult as unknown as CharacterAnalysis,
      emotionAnalysis: emotionResult as unknown as EmotionAnalysis,
      marketSuggestion: marketResult.marketSuggestion,
      riskAssessment: complianceResult.riskAssessment,
      productionFeasibility: marketResult.productionFeasibility,
      analysisTimestamp: new Date().toISOString(),
      analysisPhases: phases.map((p) => ({
        ...p,
        duration: p.endTime && p.startTime ? p.endTime - p.startTime : undefined,
      })),
      totalDuration: Date.now() - startTime,
      aiModel: usedModelId,
    };

    return advancedResult;
  } catch (error) {
    // 标记失败的阶段
    const failedPhase = phases.find((p) => p.status === 'in_progress');
    if (failedPhase) {
      const index = phases.indexOf(failedPhase);
      updatePhase(index, {
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
      });
    }
    throw error;
  }
}

// ==================== 简单分析（兼容旧版） ====================

/** 简单评级提示词 */
const SIMPLE_RATING_PROMPT = `请对以下剧本进行全面评级分析，按照16个维度进行评分（1-10分）。

## 评分维度及权重
1. 钩子强度 (hookPower) - 8%: 开篇前5分钟的吸引力
2. 爽点设计 (pleasurePoints) - 8%: 情绪高潮点的设计和分布
3. 节奏与结构 (pacingStructure) - 8%: 整体叙事节奏和三幕结构
4. 悬念有效性 (suspenseEffect) - 8%: 悬念设置和解答的质量
5. 冲突设计 (conflictDesign) - 8%: 矛盾冲突的层次和张力
6. 人物塑造 (characterization) - 10%: 角色的立体度和成长弧线
7. 对白质量 (dialogueQuality) - 8%: 台词的生动性、功能性
8. 主线连贯性 (plotCoherence) - 7%: 剧情逻辑和因果链完整性
9. 目标受众定位 (targetAudience) - 5%: 受众画像清晰度
10. 热播契合度 (trendAlignment) - 5%: 与当前市场热点的匹配程度
11. 传播潜力 (viralPotential) - 5%: 社交媒体传播和二创可能性
12. 商业价值 (commercialValue) - 5%: IP衍生和变现潜力
13. 内容合规性 (compliance) - 5%: 是否符合广电政策
14. 价值观导向 (valueOrientation) - 5%: 传递的价值观是否正向
15. 原创性 (originality) - 2.5%: 创新程度和独特性
16. 用户粘性 (userStickiness) - 2.5%: 观众追剧意愿预测

## 等级划分
- S级 (90-100): 爆款潜力
- A级 (80-89): 优质剧本
- B级 (70-79): 良好剧本
- C级 (60-69): 待完善
- D级 (<60): 需要大幅修改

## 剧本内容
{SCRIPT_CONTENT}

## 输出格式
请严格按照以下JSON格式输出：
\`\`\`json
{
  "overallScore": 85.5,
  "overallGrade": "A",
  "gradeLabel": "优质剧本",
  "dimensions": {
    "hookPower": { "score": 9.0, "weight": 0.08, "weighted": 0.72, "analysis": "开场分析...", "strengths": ["亮点1"], "weaknesses": ["不足1"], "suggestions": ["建议1"] },
    "pleasurePoints": { "score": 8.5, "weight": 0.08, "weighted": 0.68, "analysis": "爽点分析..." },
    "pacingStructure": { "score": 8.0, "weight": 0.08, "weighted": 0.64, "analysis": "节奏分析..." },
    "suspenseEffect": { "score": 8.0, "weight": 0.08, "weighted": 0.64, "analysis": "悬念分析..." },
    "conflictDesign": { "score": 8.5, "weight": 0.08, "weighted": 0.68, "analysis": "冲突分析..." },
    "characterization": { "score": 8.0, "weight": 0.10, "weighted": 0.80, "analysis": "人物分析..." },
    "dialogueQuality": { "score": 7.5, "weight": 0.08, "weighted": 0.60, "analysis": "对白分析..." },
    "plotCoherence": { "score": 7.0, "weight": 0.07, "weighted": 0.49, "analysis": "逻辑分析..." },
    "targetAudience": { "score": 8.0, "weight": 0.05, "weighted": 0.40, "analysis": "受众分析..." },
    "trendAlignment": { "score": 7.5, "weight": 0.05, "weighted": 0.375, "analysis": "热点分析..." },
    "viralPotential": { "score": 8.5, "weight": 0.05, "weighted": 0.425, "analysis": "传播分析..." },
    "commercialValue": { "score": 7.0, "weight": 0.05, "weighted": 0.35, "analysis": "商业分析..." },
    "compliance": { "score": 9.0, "weight": 0.05, "weighted": 0.45, "analysis": "合规分析..." },
    "valueOrientation": { "score": 8.5, "weight": 0.05, "weighted": 0.425, "analysis": "价值观分析..." },
    "originality": { "score": 7.5, "weight": 0.025, "weighted": 0.1875, "analysis": "原创性分析..." },
    "userStickiness": { "score": 8.0, "weight": 0.025, "weighted": 0.20, "analysis": "粘性分析..." }
  },
  "summary": {
    "oneSentence": "一句话总评",
    "paragraph": "详细段落总评（100字左右）"
  },
  "highlights": {
    "top3Strengths": ["亮点1", "亮点2", "亮点3"],
    "uniqueSellingPoints": ["卖点1", "卖点2"],
    "bestScenes": ["第X场：场景描述"]
  },
  "improvements": {
    "critical": ["必须修改项"],
    "important": ["建议修改项"],
    "optional": ["可选优化项"]
  },
  "risks": {
    "compliance": ["合规风险"],
    "market": ["市场风险"],
    "production": ["制作风险"]
  }
}
\`\`\``;

/** 简单分析（单次调用，兼容旧版） */
export async function analyzeScript(
  scriptContent: string,
  onProgress?: (progress: number, step: string) => void,
  modelOptions?: ChatOptions
): Promise<RatingResult> {
  onProgress?.(10, '准备分析请求...');

  const prompt = fillPrompt(SIMPLE_RATING_PROMPT, {
    SCRIPT_CONTENT: scriptContent,
  });

  onProgress?.(20, '正在调用 AI 模型...');

  const result = await callAndExtractJSON<RatingResult>(
    [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
    {
      ...modelOptions,
      forceJson: modelOptions?.forceJson ?? true,
    },
    '快速分析'
  );

  onProgress?.(70, '正在解析评级结果...');

  onProgress?.(100, '分析完成');

  return result;
}

// ==================== 详细分析（渐进式输出） ====================

/** 详细分析进度回调 */
export type DetailedProgressCallback = (
  progress: number,
  phase: string,
  step: string,
  phaseIndex: number,
  phaseData?: unknown
) => void;

/** 详细分析结果类型 */
export interface DetailedAnalysisResult {
  productionAnalysis?: {
    aiGenerationProbability: {
      percentage: number;
      assessment: string;
      warning: string;
    };
    formatCompliance: {
      level: string;
      description: string;
    };
    productionDifficulty: {
      level: string;
      description: string;
    };
    budgetTier?: 'S' | 'A' | 'B' | 'C';
    resourceTable: {
      characters: string[];
      scenes: string[];
      effects: string[];
    };
    estimatedCost?: {
      perEpisode: string;
      fullSeason: string;
      breakdown?: Record<string, string>;
    };
    technicalChallenges: string[];
    recommendedTools: string[];
  };
  executiveSummary?: ExecutiveSummary & {
    quickAssessment?: {
      overallPotential: string;
      aiComicFit: string;
      productionDifficulty: string;
      expectedRevenue: string;
    };
  };
  // 详细分析轮次输出
  structureAnalysis?: StructureAnalysis;
  characterAnalysis?: CharacterAnalysis;
  emotionAnalysis?: EmotionAnalysis;
  marketSuggestion?: MarketSuggestion;
  riskAssessment?: RiskAssessment;
  marketResonance?: MarketResonanceAnalysis;
  narrativeDNA?: NarrativeDNAAnalysis;
  commercialPotential?: CommercialPotentialAnalysis;
  complianceAssessment?: ComplianceAssessmentAnalysis;
  actionableRecommendations?: ActionableRecommendation[];
  finalSummary?: {
    overallScore: number;
    overallGrade: string;
    gradeLabel: string;
    oneSentence: string;
    paragraph: string;
    highlights: {
      top3Strengths: string[];
      uniqueSellingPoints: string[];
      viralMoments: string[];
    };
    platformRecommendation: PlatformRecommendationSummary;
    businessClosedLoop?: BusinessClosedLoopPlan;
  };
}

/**
 * 详细分析 - 渐进式多轮输出
 * 每轮专注于一个维度，输出更详细的分析内容
 */
export async function analyzeScriptDetailed(
  scriptContent: string,
  onProgress?: DetailedProgressCallback,
  onPhaseComplete?: (phase: AnalysisPhase, phaseData: unknown) => void,
  modelOptions?: ChatOptions
): Promise<AdvancedRatingResult & DetailedAnalysisResult> {
  const startTime = Date.now();

  // 使用更高的 maxTokens 以获取更详细的输出
  const detailedOptions: ChatOptions = {
    ...modelOptions,
    maxTokens: modelOptions?.maxTokens ?? 16000, // 增加到 16000
    temperature: modelOptions?.temperature ?? 0.3,
    forceJson: modelOptions?.forceJson ?? true,
    enableFallback: modelOptions?.enableFallback ?? true,
  };

  // 定义分析阶段
  const phases: AnalysisPhase[] = DETAILED_ANALYSIS_PHASES.map((config) => ({
    id: config.id,
    name: config.name,
    status: 'pending' as const,
    progress: 0,
  }));

  // 更新阶段状态
  const updatePhase = (index: number, updates: Partial<AnalysisPhase>) => {
    phases[index] = { ...phases[index], ...updates };
  };

  // 计算总体进度
  const calcTotalProgress = (currentPhase: number, phaseProgress: number) => {
    const phaseWeight = 100 / phases.length;
    return Math.round(currentPhase * phaseWeight + (phaseProgress / 100) * phaseWeight);
  };

  // 使用的模型 ID
  const usedModelId = detailedOptions.model ?? currentModelSelection.modelId;

  // 结果收集
  const result: DetailedAnalysisResult = {};

  console.log('[详细分析] 开始渐进式分析，共', phases.length, '个阶段');

  try {
    // Round 1: AI漫剧制作分析
    updatePhase(0, { status: 'in_progress', startTime: Date.now() });
    onProgress?.(calcTotalProgress(0, 0), '制作分析', '分析AI生成概率和制作难度...', 0);

    const productionPrompt = fillDetailedPrompt(PRODUCTION_ANALYSIS_PROMPT, {
      SCRIPT_CONTENT: scriptContent,
    });

    const productionResult = await callAndExtractJSON<{ productionAnalysis: DetailedAnalysisResult['productionAnalysis'] }>(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: productionPrompt },
      ],
      detailedOptions,
      '制作分析'
    );
    result.productionAnalysis = productionResult.productionAnalysis;

    updatePhase(0, { status: 'completed', endTime: Date.now() });
    onPhaseComplete?.(phases[0], result.productionAnalysis);
    onProgress?.(calcTotalProgress(1, 0), '制作分析', '完成', 0, result.productionAnalysis);
    console.log('[详细分析] Round 1 完成: 制作分析');

    // Round 2: 执行摘要
    updatePhase(1, { status: 'in_progress', startTime: Date.now() });
    onProgress?.(calcTotalProgress(1, 0), '执行摘要', '生成执行摘要...', 1);

    const executivePrompt = fillDetailedPrompt(EXECUTIVE_SUMMARY_PROMPT, {
      SCRIPT_CONTENT: scriptContent,
      PRODUCTION_DATA: JSON.stringify(result.productionAnalysis, null, 2),
    });

    const executiveResult = await callAndExtractJSON<{ executiveSummary: DetailedAnalysisResult['executiveSummary']; quickAssessment?: unknown }>(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: executivePrompt },
      ],
      detailedOptions,
      '执行摘要'
    );
    result.executiveSummary = executiveResult.executiveSummary;

    updatePhase(1, { status: 'completed', endTime: Date.now() });
    onPhaseComplete?.(phases[1], result.executiveSummary);
    onProgress?.(calcTotalProgress(2, 0), '执行摘要', '完成', 1, result.executiveSummary);
    console.log('[详细分析] Round 2 完成: 执行摘要');

    // Round 3: 结构分析（为"结构"Tab提供数据）
    updatePhase(2, { status: 'in_progress', startTime: Date.now() });
    onProgress?.(calcTotalProgress(2, 0), '结构分析', '分析世界观、三幕结构、转折点...', 2);

    const structurePrompt = fillDetailedPrompt(STRUCTURE_DETAILED_PROMPT, {
      SCRIPT_CONTENT: scriptContent,
    });

    const structureResult = await callAndExtractJSON<{ structureAnalysis: StructureAnalysis }>(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: structurePrompt },
      ],
      detailedOptions,
      '结构分析'
    );
    result.structureAnalysis = structureResult.structureAnalysis;

    updatePhase(2, { status: 'completed', endTime: Date.now() });
    onPhaseComplete?.(phases[2], result.structureAnalysis);
    onProgress?.(calcTotalProgress(3, 0), '结构分析', '完成', 2, result.structureAnalysis);
    console.log('[详细分析] Round 3 完成: 结构分析');

    // Round 4: 人物分析（为"人物"Tab提供数据）
    updatePhase(3, { status: 'in_progress', startTime: Date.now() });
    onProgress?.(calcTotalProgress(3, 0), '人物分析', '分析角色塑造、人物关系、金句...', 3);

    const characterPrompt = fillDetailedPrompt(CHARACTER_DETAILED_PROMPT, {
      SCRIPT_CONTENT: scriptContent,
    });

    const characterResult = await callAndExtractJSON<{ characterAnalysis: CharacterAnalysis }>(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: characterPrompt },
      ],
      detailedOptions,
      '人物分析'
    );
    result.characterAnalysis = characterResult.characterAnalysis;

    updatePhase(3, { status: 'completed', endTime: Date.now() });
    onPhaseComplete?.(phases[3], result.characterAnalysis);
    onProgress?.(calcTotalProgress(4, 0), '人物分析', '完成', 3, result.characterAnalysis);
    console.log('[详细分析] Round 4 完成: 人物分析');

    // Round 5: 情感分析（为"情感"Tab提供数据）
    updatePhase(4, { status: 'in_progress', startTime: Date.now() });
    onProgress?.(calcTotalProgress(4, 0), '情感分析', '分析情绪曲线、爽点分布...', 4);

    const emotionPrompt = fillDetailedPrompt(EMOTION_DETAILED_PROMPT, {
      SCRIPT_CONTENT: scriptContent,
    });

    const emotionResult = await callAndExtractJSON<{ emotionAnalysis: EmotionAnalysis }>(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: emotionPrompt },
      ],
      detailedOptions,
      '情感分析'
    );
    result.emotionAnalysis = emotionResult.emotionAnalysis;

    updatePhase(4, { status: 'completed', endTime: Date.now() });
    onPhaseComplete?.(phases[4], result.emotionAnalysis);
    onProgress?.(calcTotalProgress(5, 0), '情感分析', '完成', 4, result.emotionAnalysis);
    console.log('[详细分析] Round 5 完成: 情感分析');

    // Round 6: 市场共鸣详细分析
    updatePhase(5, { status: 'in_progress', startTime: Date.now() });
    onProgress?.(calcTotalProgress(5, 0), '市场共鸣', '分析目标受众、原创性、热播契合度...', 5);

    const marketResonancePrompt = fillDetailedPrompt(MARKET_RESONANCE_DETAILED_PROMPT, {
      SCRIPT_CONTENT: scriptContent,
    });

    const marketResonanceResult = await callAndExtractJSON<{ marketResonance: MarketResonanceAnalysis }>(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: marketResonancePrompt },
      ],
      detailedOptions,
      '市场共鸣'
    );
    result.marketResonance = marketResonanceResult.marketResonance;

    updatePhase(5, { status: 'completed', endTime: Date.now() });
    onPhaseComplete?.(phases[5], result.marketResonance);
    onProgress?.(calcTotalProgress(6, 0), '市场共鸣', '完成', 5, result.marketResonance);
    console.log('[详细分析] Round 6 完成: 市场共鸣分析');

    // Round 7: 市场定价分析（为"市场"Tab提供完整数据）
    updatePhase(6, { status: 'in_progress', startTime: Date.now() });
    onProgress?.(calcTotalProgress(6, 0), '市场定价', '分析定价建议、平台推荐、收益预测...', 6);

    const marketPrompt = fillDetailedPrompt(MARKET_DETAILED_PROMPT, {
      SCRIPT_CONTENT: scriptContent,
    });

    const marketResult = await callAndExtractJSON<{ marketSuggestion: MarketSuggestion }>(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: marketPrompt },
      ],
      detailedOptions,
      '市场定价'
    );
    result.marketSuggestion = marketResult.marketSuggestion;

    updatePhase(6, { status: 'completed', endTime: Date.now() });
    onPhaseComplete?.(phases[6], result.marketSuggestion);
    onProgress?.(calcTotalProgress(7, 0), '市场定价', '完成', 6, result.marketSuggestion);
    console.log('[详细分析] Round 7 完成: 市场定价分析');

    // Round 8: 叙事基因详细分析
    updatePhase(7, { status: 'in_progress', startTime: Date.now() });
    onProgress?.(calcTotalProgress(7, 0), '叙事基因', '分析叙事逻辑、钩子、爽点、节奏、人物、对白、悬念...', 7);

    const narrativePrompt = fillDetailedPrompt(NARRATIVE_DNA_DETAILED_PROMPT, {
      SCRIPT_CONTENT: scriptContent,
    });

    const narrativeResult = await callAndExtractJSON<{ narrativeDNA: NarrativeDNAAnalysis }>(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: narrativePrompt },
      ],
      detailedOptions,
      '叙事基因'
    );
    result.narrativeDNA = narrativeResult.narrativeDNA;

    updatePhase(7, { status: 'completed', endTime: Date.now() });
    onPhaseComplete?.(phases[7], result.narrativeDNA);
    onProgress?.(calcTotalProgress(8, 0), '叙事基因', '完成', 7, result.narrativeDNA);
    console.log('[详细分析] Round 8 完成: 叙事基因分析');

    // Round 9: 风险评估（为"风险"Tab提供数据）
    updatePhase(8, { status: 'in_progress', startTime: Date.now() });
    onProgress?.(calcTotalProgress(8, 0), '风险评估', '评估合规风险、市场风险、制作风险...', 8);

    const riskPrompt = fillDetailedPrompt(RISK_DETAILED_PROMPT, {
      SCRIPT_CONTENT: scriptContent,
      PRODUCTION_DATA: JSON.stringify(result.productionAnalysis, null, 2),
      COMMERCIAL_DATA: '商业合规分析将在后续阶段完成后提供',
    });

    const riskResult = await callAndExtractJSON<{ riskAssessment: RiskAssessment }>(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: riskPrompt },
      ],
      detailedOptions,
      '风险评估'
    );
    result.riskAssessment = riskResult.riskAssessment;

    updatePhase(8, { status: 'completed', endTime: Date.now() });
    onPhaseComplete?.(phases[8], result.riskAssessment);
    onProgress?.(calcTotalProgress(9, 0), '风险评估', '完成', 8, result.riskAssessment);
    console.log('[详细分析] Round 9 完成: 风险评估');

    // Round 10: 商业化与合规详细分析
    updatePhase(9, { status: 'in_progress', startTime: Date.now() });
    onProgress?.(calcTotalProgress(9, 0), '商业合规', '分析用户粘性、传播潜力、内容合规、价值导向...', 9);

    const commercialPrompt = fillDetailedPrompt(COMMERCIAL_COMPLIANCE_DETAILED_PROMPT, {
      SCRIPT_CONTENT: scriptContent,
    });

    const commercialResult = await callAndExtractJSON<{
      commercialPotential: CommercialPotentialAnalysis;
      complianceAssessment: ComplianceAssessmentAnalysis;
    }>(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: commercialPrompt },
      ],
      detailedOptions,
      '商业合规'
    );
    result.commercialPotential = commercialResult.commercialPotential;
    result.complianceAssessment = commercialResult.complianceAssessment;

    updatePhase(9, { status: 'completed', endTime: Date.now() });
    onPhaseComplete?.(phases[9], { commercialPotential: result.commercialPotential, complianceAssessment: result.complianceAssessment });
    onProgress?.(calcTotalProgress(10, 0), '商业合规', '完成', 9, result.commercialPotential);
    console.log('[详细分析] Round 10 完成: 商业合规分析');

    // Round 11: 综合建议
    updatePhase(10, { status: 'in_progress', startTime: Date.now() });
    onProgress?.(calcTotalProgress(10, 0), '综合建议', '生成可操作建议和最终总评...', 10);

    const recommendationsPrompt = fillDetailedPrompt(ACTIONABLE_RECOMMENDATIONS_PROMPT, {
      PRODUCTION_DATA: JSON.stringify(result.productionAnalysis, null, 2),
      MARKET_RESONANCE_DATA: JSON.stringify(result.marketResonance),
      NARRATIVE_DNA_DATA: JSON.stringify(result.narrativeDNA),
      COMMERCIAL_COMPLIANCE_DATA: JSON.stringify({
        commercialPotential: result.commercialPotential,
        complianceAssessment: result.complianceAssessment,
      }),
    });

    const recommendationsResult = await callAndExtractJSON<{
      actionableRecommendations: ActionableRecommendation[];
      finalSummary: DetailedAnalysisResult['finalSummary'];
    }>(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: recommendationsPrompt },
      ],
      detailedOptions,
      '综合建议'
    );
    result.actionableRecommendations = recommendationsResult.actionableRecommendations;
    result.finalSummary = recommendationsResult.finalSummary;

    updatePhase(10, { status: 'completed', endTime: Date.now() });
    onPhaseComplete?.(phases[10], { recommendations: result.actionableRecommendations, summary: result.finalSummary });
    onProgress?.(100, '综合建议', '完成', 10, result.finalSummary);
    console.log('[详细分析] Round 11 完成: 综合建议');

    // 组装最终结果
    const finalScore = result.finalSummary?.overallScore ?? 75;
    const finalGrade = result.finalSummary?.overallGrade ?? 'B';

    // 构建 dimensions 对象
    const dimensions = buildDimensionsFromDetailedAnalysis(result);

    const advancedResult: AdvancedRatingResult & DetailedAnalysisResult = {
      // 基础评级结果
      overallScore: finalScore,
      overallGrade: finalGrade as 'S' | 'A' | 'B' | 'C' | 'D',
      gradeLabel: result.finalSummary?.gradeLabel ?? '剧本分析完成',
      dimensions,
      summary: {
        oneSentence: result.finalSummary?.oneSentence ?? result.executiveSummary?.oneSentence ?? '',
        paragraph: result.finalSummary?.paragraph ?? result.executiveSummary?.coreConclusion ?? '',
      },
      highlights: {
        top3Strengths: result.finalSummary?.highlights?.top3Strengths ?? [],
        uniqueSellingPoints: result.finalSummary?.highlights?.uniqueSellingPoints ?? [],
        bestScenes: result.finalSummary?.highlights?.viralMoments ?? [],
      },
      improvements: {
        critical: result.actionableRecommendations?.filter(r => r.priority === 1).map(r => r.description) ?? [],
        important: result.actionableRecommendations?.filter(r => r.priority === 2 || r.priority === 3).map(r => r.description) ?? [],
        optional: result.actionableRecommendations?.filter(r => r.priority >= 4).map(r => r.description) ?? [],
      },
      risks: {
        compliance: [],
        market: [],
        production: result.productionAnalysis?.technicalChallenges ?? [],
      },

      // 高级分析结果（使用详细分析的数据）
      structureAnalysis: result.structureAnalysis!,
      characterAnalysis: result.characterAnalysis!,
      emotionAnalysis: result.emotionAnalysis!,
      marketSuggestion: result.marketSuggestion!,
      riskAssessment: result.riskAssessment!,
      productionFeasibility: {
        budgetTier: (result.productionAnalysis?.budgetTier as 'S' | 'A' | 'B' | 'C') ?? 'B',
        budgetDescription: result.productionAnalysis?.productionDifficulty?.description ?? '',
        sceneComplexity: result.productionAnalysis?.productionDifficulty?.level === '高' ? 8 :
                         result.productionAnalysis?.productionDifficulty?.level === '中' ? 5 : 3,
        estimatedDays: result.productionAnalysis?.budgetTier === 'S' ? 45 :
                       result.productionAnalysis?.budgetTier === 'A' ? 30 :
                       result.productionAnalysis?.budgetTier === 'B' ? 20 : 14,
        technicalChallenges: result.productionAnalysis?.technicalChallenges ?? [],
      },

      // 详细分析结果
      executiveSummary: result.executiveSummary as ExecutiveSummary,
      detailedAnalysis: {
        marketResonance: result.marketResonance!,
        narrativeDNA: result.narrativeDNA!,
        commercialPotential: result.commercialPotential!,
        complianceAssessment: result.complianceAssessment!,
      },
      actionableRecommendations: result.actionableRecommendations,
      platformRecommendation: result.finalSummary?.platformRecommendation,

      // 详细分析特有字段
      productionAnalysis: result.productionAnalysis,
      marketResonance: result.marketResonance,
      narrativeDNA: result.narrativeDNA,
      commercialPotential: result.commercialPotential,
      complianceAssessment: result.complianceAssessment,
      finalSummary: result.finalSummary,

      // 元信息
      analysisTimestamp: new Date().toISOString(),
      analysisPhases: phases.map((p) => ({
        ...p,
        duration: p.endTime && p.startTime ? p.endTime - p.startTime : undefined,
      })),
      totalDuration: Date.now() - startTime,
      aiModel: usedModelId,
    };

    console.log('[详细分析] 全部完成，总耗时:', Math.round((Date.now() - startTime) / 1000), '秒');

    return advancedResult;
  } catch (error) {
    // 标记失败的阶段
    const failedPhase = phases.find((p) => p.status === 'in_progress');
    if (failedPhase) {
      const index = phases.indexOf(failedPhase);
      updatePhase(index, {
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
      });
    }
    console.error('[详细分析] 分析失败:', error);
    throw error;
  }
}

/**
 * 智能归一化分数到 0-10 范围
 * - 如果分数 > 10，认为是百分制，除以 10
 * - 如果分数 <= 10，认为已经是 0-10 制
 */
function normalizeScore(score: number): number {
  if (score > 10) {
    return score / 10;
  }
  return score;
}

/** 从详细分析结果构建 dimensions 对象 */
function buildDimensionsFromDetailedAnalysis(result: DetailedAnalysisResult): Record<string, {
  score: number;
  weight: number;
  weighted: number;
  analysis: string;
  strengths?: string[];
  weaknesses?: string[];
  suggestions?: string[];
}> {
  const dimensions: Record<string, {
    score: number;
    weight: number;
    weighted: number;
    analysis: string;
    strengths?: string[];
    weaknesses?: string[];
    suggestions?: string[];
  }> = {};

  // 从 narrativeDNA 提取
  if (result.narrativeDNA) {
    const nd = result.narrativeDNA;
    if (nd.hookStrength) {
      const score = normalizeScore(nd.hookStrength.score);
      dimensions.hookPower = {
        score,
        weight: 0.10,
        weighted: score * 0.10,
        analysis: nd.hookStrength.analysis,
        suggestions: nd.hookStrength.improvements,
      };
    }
    if (nd.pleasureDesign) {
      const score = normalizeScore(nd.pleasureDesign.score);
      dimensions.pleasurePoints = {
        score,
        weight: 0.12,
        weighted: score * 0.12,
        analysis: nd.pleasureDesign.analysis,
        suggestions: nd.pleasureDesign.improvements,
      };
    }
    if (nd.pacingStructure) {
      const score = normalizeScore(nd.pacingStructure.score);
      dimensions.pacingStructure = {
        score,
        weight: 0.08,
        weighted: score * 0.08,
        analysis: nd.pacingStructure.analysis,
        suggestions: nd.pacingStructure.improvements,
      };
    }
    if (nd.suspenseEffectiveness) {
      const score = normalizeScore(nd.suspenseEffectiveness.score);
      dimensions.suspenseEffect = {
        score,
        weight: 0.06,
        weighted: score * 0.06,
        analysis: nd.suspenseEffectiveness.analysis,
        suggestions: nd.suspenseEffectiveness.improvements,
      };
    }
    if (nd.characterization) {
      const score = normalizeScore(nd.characterization.score);
      dimensions.characterization = {
        score,
        weight: 0.08,
        weighted: score * 0.08,
        analysis: nd.characterization.analysis,
        suggestions: nd.characterization.improvements,
      };
    }
    if (nd.dialogueQuality) {
      const score = normalizeScore(nd.dialogueQuality.score);
      dimensions.dialogueQuality = {
        score,
        weight: 0.06,
        weighted: score * 0.06,
        analysis: nd.dialogueQuality.analysis,
        suggestions: nd.dialogueQuality.improvements,
      };
    }
    if (nd.plotCoherence) {
      const score = normalizeScore(nd.plotCoherence.score);
      dimensions.plotCoherence = {
        score,
        weight: 0.06,
        weighted: score * 0.06,
        analysis: nd.plotCoherence.analysis,
        suggestions: nd.plotCoherence.improvements,
      };
    }
    if (nd.narrativeLogic) {
      const score = normalizeScore(nd.narrativeLogic.score);
      dimensions.conflictDesign = {
        score,
        weight: 0.08,
        weighted: score * 0.08,
        analysis: nd.narrativeLogic.analysis,
        suggestions: nd.narrativeLogic.improvements,
      };
    }
  }

  // 从 marketResonance 提取
  if (result.marketResonance) {
    const mr = result.marketResonance;
    if (mr.targetAudience) {
      const score = normalizeScore(mr.targetAudience.score);
      dimensions.targetAudience = {
        score,
        weight: 0.05,
        weighted: score * 0.05,
        analysis: mr.targetAudience.analysis,
        suggestions: mr.targetAudience.improvements,
      };
    }
    if (mr.originality) {
      const score = normalizeScore(mr.originality.score);
      dimensions.originality = {
        score,
        weight: 0.025,
        weighted: score * 0.025,
        analysis: mr.originality.analysis,
        suggestions: mr.originality.improvements,
      };
    }
    if (mr.trendAlignment) {
      const score = normalizeScore(mr.trendAlignment.score);
      dimensions.trendAlignment = {
        score,
        weight: 0.05,
        weighted: score * 0.05,
        analysis: mr.trendAlignment.analysis,
        suggestions: mr.trendAlignment.improvements,
      };
    }
  }

  // 从 commercialPotential 提取
  if (result.commercialPotential) {
    const cp = result.commercialPotential;
    if (cp.userStickiness) {
      const score = normalizeScore(cp.userStickiness.score);
      dimensions.userStickiness = {
        score,
        weight: 0.025,
        weighted: score * 0.025,
        analysis: cp.userStickiness.analysis,
        suggestions: cp.userStickiness.improvements,
      };
    }
    if (cp.viralPotential) {
      const score = normalizeScore(cp.viralPotential.score);
      dimensions.viralPotential = {
        score,
        weight: 0.05,
        weighted: score * 0.05,
        analysis: cp.viralPotential.analysis,
        suggestions: cp.viralPotential.improvements,
      };
    }
  }

  // 从 complianceAssessment 提取
  if (result.complianceAssessment) {
    const ca = result.complianceAssessment;
    if (ca.contentCompliance) {
      const score = normalizeScore(ca.contentCompliance.score);
      dimensions.compliance = {
        score,
        weight: 0.04,
        weighted: score * 0.04,
        analysis: ca.contentCompliance.analysis,
        suggestions: ca.contentCompliance.improvements,
      };
    }
    if (ca.valueOrientation) {
      const score = normalizeScore(ca.valueOrientation.score);
      dimensions.valueOrientation = {
        score,
        weight: 0.02,
        weighted: score * 0.02,
        analysis: ca.valueOrientation.analysis,
        suggestions: ca.valueOrientation.improvements,
      };
    }
  }

  // 补充商业价值
  dimensions.commercialValue = {
    score: 8.0,
    weight: 0.05,
    weighted: 0.40,
    analysis: result.executiveSummary?.coreConclusion ?? '商业价值评估',
  };

  return dimensions;
}
