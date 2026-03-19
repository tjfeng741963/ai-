import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {
  PROVIDER_ENDPOINTS,
  PRESET_MODELS,
  DEFAULT_CONFIG,
  getProviderConfig,
  getModelConfig,
  getAvailableModels,
} from './config/models.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ==================== 工具函数 ====================

/**
 * 将消息格式转换为 Claude API 格式
 */
function convertToClaudeFormat(messages) {
  const systemMessage = messages.find((m) => m.role === 'system');
  const nonSystemMessages = messages.filter((m) => m.role !== 'system');

  return {
    system: systemMessage?.content || '',
    messages: nonSystemMessages.map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    })),
  };
}

/**
 * 将 Claude 响应转换为 OpenAI 兼容格式
 */
function convertClaudeResponse(claudeResponse) {
  return {
    choices: [
      {
        message: {
          role: 'assistant',
          content: claudeResponse.content?.[0]?.text || '',
        },
        finish_reason: claudeResponse.stop_reason || 'stop',
      },
    ],
    usage: {
      prompt_tokens: claudeResponse.usage?.input_tokens || 0,
      completion_tokens: claudeResponse.usage?.output_tokens || 0,
      total_tokens:
        (claudeResponse.usage?.input_tokens || 0) +
        (claudeResponse.usage?.output_tokens || 0),
    },
    model: claudeResponse.model,
  };
}

/**
 * 调用 AI API
 */
async function callAIAPI(provider, modelId, messages, options = {}) {
  const providerConfig = getProviderConfig(provider);
  const apiKey = process.env[providerConfig.envKey];

  if (!apiKey) {
    throw new Error(
      `未配置 ${providerConfig.name} API Key，请在 .env 文件中设置 ${providerConfig.envKey}`
    );
  }

  // 各提供商的 max_tokens 限制
  const PROVIDER_MAX_TOKENS = {
    volcengine: 8000,
    openai: 4096,
    claude: 4096,
    deepseek: 8192,
    moonshot: 4096,
    qwen: 8000,
  };

  const { temperature = 0.3, maxTokens = 8000, forceJson = false } = options;
  // 确保 maxTokens 不超过提供商限制
  const providerMaxTokens = PROVIDER_MAX_TOKENS[provider] || 4096;
  const actualMaxTokens = Math.min(maxTokens, providerMaxTokens);

  const url = `${providerConfig.baseUrl}${providerConfig.chatPath}`;

  // 构建请求头
  const headers = {
    'Content-Type': 'application/json',
    [providerConfig.authHeader]: `${providerConfig.authPrefix}${apiKey}`,
    ...providerConfig.extraHeaders,
  };

  // 构建请求体
  let body;

  if (provider === 'claude') {
    // Claude API 使用不同的格式
    const claudeFormat = convertToClaudeFormat(messages);
    body = {
      model: modelId,
      max_tokens: actualMaxTokens,
      temperature,
      system: claudeFormat.system,
      messages: claudeFormat.messages,
    };
  } else {
    // OpenAI 兼容格式（火山引擎、DeepSeek、Moonshot、通义千问等）
    body = {
      model: modelId,
      messages,
      temperature,
      max_tokens: actualMaxTokens,
    };

    // 为结构化输出启用 JSON 模式（优先用于 DeepSeek 等 OpenAI 兼容提供商）
    const jsonModeProviders = new Set(['deepseek', 'openai', 'moonshot', 'qwen']);
    if (forceJson && jsonModeProviders.has(provider)) {
      body.response_format = { type: 'json_object' };
    }
  }

  if (actualMaxTokens !== maxTokens) {
    console.log(`[${new Date().toISOString()}] max_tokens 已从 ${maxTokens} 调整为 ${actualMaxTokens} (${provider} 限制)`);
  }

  console.log(`[${new Date().toISOString()}] 调用 ${providerConfig.name} API，模型: ${modelId}`);

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[${new Date().toISOString()}] ${providerConfig.name} API 错误:`, errorText);
    throw new Error(`${providerConfig.name} API 调用失败: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  // Claude 响应需要转换
  if (provider === 'claude') {
    return convertClaudeResponse(data);
  }

  return data;
}

// ==================== API 路由 ====================

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 获取可用模型列表
app.get('/api/models', (req, res) => {
  try {
    const models = getAvailableModels(process.env);
    res.json({
      success: true,
      models,
      default: DEFAULT_CONFIG,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// 获取已配置的提供商
app.get('/api/providers', (req, res) => {
  try {
    const providers = [];
    for (const [id, config] of Object.entries(PROVIDER_ENDPOINTS)) {
      providers.push({
        id,
        name: config.name,
        configured: !!process.env[config.envKey],
      });
    }
    res.json({
      success: true,
      providers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// 统一聊天接口（支持多提供商）
app.post('/api/chat', async (req, res) => {
  try {
    const {
      provider = DEFAULT_CONFIG.provider,
      model,
      messages,
      temperature = DEFAULT_CONFIG.temperature,
      max_tokens = DEFAULT_CONFIG.maxTokens,
      force_json = false,
    } = req.body;

    // 确定实际的模型 ID
    let actualModelId = model;
    let actualProvider = provider;

    // 如果提供的是预设模型 ID，获取其配置
    const modelConfig = getModelConfig(model);
    if (modelConfig) {
      actualProvider = modelConfig.provider;
      // 对于火山引擎，model 可能是 endpoint ID，需要直接使用
      actualModelId = model;
    }

    // 调用 AI API
    const data = await callAIAPI(actualProvider, actualModelId, messages, {
      temperature,
      maxTokens: max_tokens,
      forceJson: force_json,
    });

    console.log(`[${new Date().toISOString()}] 请求完成，tokens: ${data.usage?.total_tokens || 'N/A'}`);

    res.json(data);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] 服务器错误:`, error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// 火山引擎聊天接口（兼容旧版）
app.post('/api/volcengine/chat', async (req, res) => {
  try {
    const { model, messages, temperature = 0.3, max_tokens = 8000 } = req.body;

    console.log(`[${new Date().toISOString()}] [旧版] 收到评级请求，模型: ${model}`);

    const data = await callAIAPI('volcengine', model, messages, {
      temperature,
      maxTokens: max_tokens,
    });

    console.log(`[${new Date().toISOString()}] [旧版] 评级完成，tokens: ${data.usage?.total_tokens || 'N/A'}`);

    res.json(data);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] 服务器错误:`, error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.message,
    });
  }
});

// ==================== 启动服务器 ====================

// 检查已配置的 API Key
function getConfiguredProviders() {
  const configured = [];
  for (const [id, config] of Object.entries(PROVIDER_ENDPOINTS)) {
    if (process.env[config.envKey]) {
      configured.push(config.name);
    }
  }
  return configured;
}

app.listen(PORT, () => {
  const configuredProviders = getConfiguredProviders();

  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║              AI漫剧评级系统 - 多模型代理服务器                    ║
╠══════════════════════════════════════════════════════════════════╣
║  服务地址: http://localhost:${PORT}                                 ║
║  健康检查: http://localhost:${PORT}/health                          ║
╠══════════════════════════════════════════════════════════════════╣
║  API 端点:                                                        ║
║    POST /api/chat          - 统一聊天接口（支持多提供商）           ║
║    POST /api/volcengine/chat - 火山引擎接口（兼容旧版）             ║
║    GET  /api/models        - 获取可用模型列表                      ║
║    GET  /api/providers     - 获取已配置的提供商                    ║
╠══════════════════════════════════════════════════════════════════╣
║  已配置提供商: ${configuredProviders.length > 0 ? configuredProviders.join(', ') : '无（请配置 .env）'}
╚══════════════════════════════════════════════════════════════════╝
  `);
});
