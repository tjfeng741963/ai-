/**
 * AI漫剧评级系统 - 多模型配置
 *
 * 支持的 AI 提供商：
 * - volcengine: 火山引擎豆包（默认）
 * - openai: OpenAI GPT-4/GPT-4o
 * - claude: Anthropic Claude
 * - deepseek: DeepSeek
 * - moonshot: Moonshot Kimi
 * - qwen: 通义千问
 */

// 提供商 API 端点配置
export const PROVIDER_ENDPOINTS = {
  volcengine: {
    name: '火山引擎豆包',
    baseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
    chatPath: '/chat/completions',
    authHeader: 'Authorization',
    authPrefix: 'Bearer ',
    envKey: 'VOLCENGINE_API_KEY',
  },
  openai: {
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    chatPath: '/chat/completions',
    authHeader: 'Authorization',
    authPrefix: 'Bearer ',
    envKey: 'OPENAI_API_KEY',
  },
  claude: {
    name: 'Anthropic Claude',
    baseUrl: 'https://api.anthropic.com/v1',
    chatPath: '/messages',
    authHeader: 'x-api-key',
    authPrefix: '',
    envKey: 'ANTHROPIC_API_KEY',
    extraHeaders: {
      'anthropic-version': '2023-06-01',
    },
  },
  deepseek: {
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com/v1',
    chatPath: '/chat/completions',
    authHeader: 'Authorization',
    authPrefix: 'Bearer ',
    envKey: 'DEEPSEEK_API_KEY',
  },
  moonshot: {
    name: 'Moonshot Kimi',
    baseUrl: 'https://api.moonshot.cn/v1',
    chatPath: '/chat/completions',
    authHeader: 'Authorization',
    authPrefix: 'Bearer ',
    envKey: 'MOONSHOT_API_KEY',
  },
  qwen: {
    name: '通义千问',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    chatPath: '/chat/completions',
    authHeader: 'Authorization',
    authPrefix: 'Bearer ',
    envKey: 'QWEN_API_KEY',
  },
};

// 预设模型配置
// 火山引擎支持 endpoint ID 和 Model ID 两种调用方式
export const PRESET_MODELS = {
  // 火山引擎豆包 - endpoint ID 调用
  'ep-20260317144814-4pqbx': {
    provider: 'volcengine',
    name: '豆包1.5 Pro 32K',
    description: 'doubao-1-5-pro-32k-250115，适合中文剧本深度分析',
    maxTokens: 8000,
    contextLength: 32000,
  },

  // 火山引擎豆包 Seed - Model ID 直接调用（使用独立 API Key）
  'doubao-seed-2-0-lite-260215': {
    provider: 'volcengine',
    name: '豆包 Seed 2.0 Lite',
    description: '豆包Seed最新模型，深度剧本评测首选',
    maxTokens: 8000,
    contextLength: 32000,
    envKey: 'VOLCENGINE_API_KEY_SEED',
  },

  // OpenAI
  'gpt-4o': {
    provider: 'openai',
    name: 'GPT-4o',
    description: 'OpenAI最新多模态模型，推理能力强',
    maxTokens: 4096,
    contextLength: 128000,
  },
  'gpt-4-turbo': {
    provider: 'openai',
    name: 'GPT-4 Turbo',
    description: 'GPT-4增强版，性价比高',
    maxTokens: 4096,
    contextLength: 128000,
  },
  'gpt-3.5-turbo': {
    provider: 'openai',
    name: 'GPT-3.5 Turbo',
    description: '速度快，成本低',
    maxTokens: 4096,
    contextLength: 16385,
  },

  // Claude
  'claude-3-opus': {
    provider: 'claude',
    name: 'Claude 3 Opus',
    description: 'Anthropic最强模型，深度���析能力出色',
    maxTokens: 4096,
    contextLength: 200000,
  },
  'claude-3-sonnet': {
    provider: 'claude',
    name: 'Claude 3 Sonnet',
    description: '平衡性能与成本',
    maxTokens: 4096,
    contextLength: 200000,
  },
  'claude-3-haiku': {
    provider: 'claude',
    name: 'Claude 3 Haiku',
    description: '快速响应，成本最低',
    maxTokens: 4096,
    contextLength: 200000,
  },

  // DeepSeek
  'deepseek-chat': {
    provider: 'deepseek',
    name: 'DeepSeek Chat',
    description: '国产大模型，中文理解强',
    maxTokens: 4096,
    contextLength: 32000,
  },
  'deepseek-coder': {
    provider: 'deepseek',
    name: 'DeepSeek Coder',
    description: '代码专用，结构化输出好',
    maxTokens: 4096,
    contextLength: 32000,
  },

  // Moonshot
  'moonshot-v1-8k': {
    provider: 'moonshot',
    name: 'Kimi 8K',
    description: 'Moonshot Kimi，长文本理解强',
    maxTokens: 4096,
    contextLength: 8000,
  },
  'moonshot-v1-32k': {
    provider: 'moonshot',
    name: 'Kimi 32K',
    description: '支持32K长文本',
    maxTokens: 4096,
    contextLength: 32000,
  },
  'moonshot-v1-128k': {
    provider: 'moonshot',
    name: 'Kimi 128K',
    description: '超长上下文，适合完整剧本分析',
    maxTokens: 4096,
    contextLength: 128000,
  },

  // 通义千问
  'qwen-max': {
    provider: 'qwen',
    name: '通义千问Max',
    description: '阿里最强模型',
    maxTokens: 8000,
    contextLength: 32000,
  },
  'qwen-plus': {
    provider: 'qwen',
    name: '通义千问Plus',
    description: '性价比高',
    maxTokens: 8000,
    contextLength: 32000,
  },
  'qwen-turbo': {
    provider: 'qwen',
    name: '通义千问Turbo',
    description: '速度最快',
    maxTokens: 8000,
    contextLength: 8000,
  },
};

// 默认配置
export const DEFAULT_CONFIG = {
  provider: 'volcengine',
  model: 'doubao-pro',
  temperature: 0.3,
  maxTokens: 8000,
};

/**
 * 获取提供商��置
 * @param {string} provider 提供商ID
 * @returns {object} 提供商配置
 */
export function getProviderConfig(provider) {
  const config = PROVIDER_ENDPOINTS[provider];
  if (!config) {
    throw new Error(`不支持的 AI 提供商: ${provider}`);
  }
  return config;
}

/**
 * 获取模型配置
 * @param {string} modelId 模型ID
 * @returns {object} 模型配置
 */
export function getModelConfig(modelId) {
  const config = PRESET_MODELS[modelId];
  if (!config) {
    // 如果不是预设模型，返回null，允许使用自定义模型ID
    return null;
  }
  return config;
}

/**
 * 获取所有可用模型列表
 * @param {object} env 环境变量对象
 * @returns {Array} 可用模型列表
 */
export function getAvailableModels(env = process.env) {
  const available = [];

  for (const [modelId, config] of Object.entries(PRESET_MODELS)) {
    const provider = PROVIDER_ENDPOINTS[config.provider];
    // 模型级别 envKey 优先，否则用 provider 级别
    const envKeyToCheck = config.envKey || provider.envKey;
    const hasKey = !!env[envKeyToCheck];

    available.push({
      id: modelId,
      ...config,
      providerName: provider.name,
      available: hasKey,
    });
  }

  return available;
}
