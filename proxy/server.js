import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import {
  PROVIDER_ENDPOINTS,
  PRESET_MODELS,
  DEFAULT_CONFIG,
  getProviderConfig,
  getModelConfig,
  getAvailableModels,
} from './config/models.js';
import {
  OUTPAINT_PROVIDERS,
  OUTPAINT_MODEL_PARAMS,
  getProviderModels as getOutpaintProviderModels,
  getDefaultProviderId,
  isValidProviderModel,
} from './config/outpaint-models.js';
import { OfficialStableProvider } from './providers/official-stable.js';
import { initDB, getConfig } from './db/index.js';
import { seedAll } from './db/seed.js';
import adminRouter from './routes/admin.js';
import promptsRouter, { configsHandler } from './routes/prompts.js';

/**
 * 从数据库 global_configs 表读取配置（带 fallback）
 * 每次调用实时读取，确保 Admin 修改立即生效
 */
function getDbConfig(key, fallback) {
  try {
    const row = getConfig(key);
    return row ? row.value : fallback;
  } catch {
    return fallback;
  }
}

dotenv.config();

// 初始化官方稳定渠道 Provider（直接调用腾讯云，无需 scwh 认证）
const officialStableProvider = new OfficialStableProvider();

const app = express();
const PORT = process.env.PORT || 3003;
// 山海万象后端 & OSS CDN 配置
const SCWH_API_URL = process.env.SCWH_API_URL || 'http://120.26.32.17';
const SCWH_API_TOKEN = process.env.SCWH_API_TOKEN || '';
const OSS_CDN_URL = process.env.OSS_CDN_URL || 'https://cdn.shwxai.com';
const OUTPAINT_PROVIDER = process.env.OUTPAINT_PROVIDER || 'ai147';
const OUTPAINT_MODEL = process.env.OUTPAINT_MODEL || 'nanobanana-pro';

// Multer 配置（内存存储，用于接收前端上传后转发到 scwh 后端）
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 30 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('只支持图片文件'));
  },
});

// 初始化数据库（seedAll 编译 TS 源文件获取真实提示词，使用 upsert 幂等写入）
initDB();
await seedAll();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// 挂载提示词管理路由
app.use('/api/admin', adminRouter);
app.use('/api/prompts', promptsRouter);
app.get('/api/configs', configsHandler);

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
  // 模型级别 envKey 优先，否则使用 provider 级别
  const modelCfg = getModelConfig(modelId);
  const envKey = modelCfg?.envKey || providerConfig.envKey;
  const apiKey = process.env[envKey];

  if (!apiKey) {
    throw new Error(
      `未配置 ${providerConfig.name} API Key，请在 .env 文件中设置 ${envKey}`
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

  // 从 DB 读取默认值（Admin 后台修改即时生效）
  const dbMaxTokens = parseInt(getDbConfig('max_tokens', '8000'), 10);
  const dbTemperature = parseFloat(getDbConfig('temperature', '0.3'));
  const { temperature = dbTemperature, maxTokens = dbMaxTokens, forceJson = false } = options;
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
    // 从 DB 读取默认 provider/model（Admin 后台可调整）
    const dbProvider = getDbConfig('default_ai_provider', DEFAULT_CONFIG.provider);
    const dbModel = getDbConfig('default_ai_model', DEFAULT_CONFIG.model);
    const dbTemp = parseFloat(getDbConfig('temperature', String(DEFAULT_CONFIG.temperature)));
    const dbMaxTk = parseInt(getDbConfig('max_tokens', String(DEFAULT_CONFIG.maxTokens)), 10);

    const {
      provider = dbProvider,
      model = dbModel,
      messages,
      temperature = dbTemp,
      max_tokens = dbMaxTk,
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

// ==================== 扩图配置 API ====================

// 获取扩图可用的 Provider 列表
app.get('/api/outpaint/providers', (_req, res) => {
  try {
    const providers = OUTPAINT_PROVIDERS.map(({ id, name, description, models }) => ({
      id,
      name,
      description,
      modelCount: models.length,
      default: !!OUTPAINT_PROVIDERS.find((p) => p.default && p.id === id),
    }));
    res.json({ success: true, data: providers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取指定 Provider 下的模型列表及参数定义
app.get('/api/outpaint/models/:provider', (req, res) => {
  try {
    const models = getOutpaintProviderModels(req.params.provider);
    if (models.length === 0) {
      return res.status(404).json({ success: false, error: `未找到 provider: ${req.params.provider}` });
    }
    res.json({ success: true, data: models });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== 扩图 API（代理到 scwh 后端） ====================

/** 将 OSS 相对路径转为 CDN 完整 URL */
function toOssUrl(p) {
  if (!p) return '';
  if (p.startsWith('data:') || p.startsWith('http://') || p.startsWith('https://')) return p;
  return p.startsWith('/') ? `${OSS_CDN_URL}${p}` : `${OSS_CDN_URL}/${p}`;
}

/** 从 CDN URL 提取 OSS 相对路径（用于传给 scwh 后端） */
function toRelativePath(url) {
  if (!url) return '';
  if (url.includes('cdn.shwxai.com')) {
    const match = url.match(/https?:\/\/cdn\.shwxai\.com(\/.*)/);
    return match ? match[1] : url;
  }
  return url;
}

/**
 * 获取转发到 scwh 后端的请求头
 * 优先使用 .env 中配置的 SCWH_API_TOKEN，否则回退到前端传入的 Authorization
 */
function getForwardHeaders(req) {
  const headers = { 'Content-Type': 'application/json', Accept: '*/*' };
  if (SCWH_API_TOKEN) {
    headers['Authorization'] = `Bearer ${SCWH_API_TOKEN}`;
  } else if (req.headers.authorization) {
    headers['Authorization'] = req.headers.authorization;
  }
  return headers;
}

/** 获取转发到 scwh 后端的 FormData 请求头（不设 Content-Type） */
function getForwardHeadersForUpload(req) {
  const headers = {};
  if (SCWH_API_TOKEN) {
    headers['Authorization'] = `Bearer ${SCWH_API_TOKEN}`;
  } else if (req.headers.authorization) {
    headers['Authorization'] = req.headers.authorization;
  }
  return headers;
}

/** 根据目标宽高匹配最接近的标准宽高比 */
function computeAspectRatio(w, h) {
  const ratio = w / h;
  const common = [
    ['1:1', 1], ['16:9', 16 / 9], ['9:16', 9 / 16],
    ['4:3', 4 / 3], ['3:4', 3 / 4], ['3:2', 3 / 2],
    ['2:3', 2 / 3], ['4:5', 4 / 5], ['5:4', 5 / 4], ['21:9', 21 / 9],
  ];
  let closest = '16:9';
  let minDiff = Infinity;
  for (const [name, val] of common) {
    const diff = Math.abs(val - ratio);
    if (diff < minDiff) { minDiff = diff; closest = name; }
  }
  return closest;
}

/**
 * 根据原图位置(positionX, positionY)生成扩展方向描述
 * positionX/positionY: 0.0-1.0 表示原图在画布中的位置
 * - (0, 0) = 原图在左上角 → 向右、向下扩展
 * - (0.5, 0.5) = 原图居中 → 向四周扩展
 * - (1, 0) = 原图在右上角 → 向左、向下扩展
 */
function buildOutpaintPrompt({ targetWidth, targetHeight, aspectRatio, positionX, positionY, userPrompt }) {
  // 判断扩展方向
  const directions = [];
  if (positionX <= 0.25) directions.push('right');
  else if (positionX >= 0.75) directions.push('left');
  else { directions.push('left'); directions.push('right'); }

  if (positionY <= 0.25) directions.push('downward');
  else if (positionY >= 0.75) directions.push('upward');
  else { directions.push('upward'); directions.push('downward'); }

  // 位置描述
  const posMap = {
    '0,0': 'top-left corner',
    '0.5,0': 'top center',
    '1,0': 'top-right corner',
    '0,0.5': 'left center',
    '0.5,0.5': 'center',
    '1,0.5': 'right center',
    '0,1': 'bottom-left corner',
    '0.5,1': 'bottom center',
    '1,1': 'bottom-right corner',
  };
  const posKey = `${positionX},${positionY}`;
  const posDesc = posMap[posKey] || `position (${positionX}, ${positionY})`;
  const dirDesc = directions.join(' and ');

  const lines = [
    `The original image is placed at the ${posDesc} of a ${aspectRatio} canvas (${targetWidth}x${targetHeight}).`,
    `Expand and extend the scene ${dirDesc} to fill the entire canvas.`,
    'Seamlessly continue the scene beyond the original borders, maintaining consistent style, lighting, perspective and content.',
    'The expanded areas should look natural and blend perfectly with the original image.',
  ];

  if (userPrompt) {
    lines.push(`Additional context for the expanded areas: ${userPrompt}`);
  }

  return lines.join(' ');
}

// 1) 图片上传
// 优先使用腾讯云 VOD 直接上传（不需要 scwh 认证），否则回退到 scwh 后端
app.post('/api/upload/image', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: '未上传文件' });
  }

  const fileInfo = `${req.file.originalname} (${(req.file.size / 1024).toFixed(1)}KB)`;

  // 路径 A: 官方稳定渠道已配置 → 直接上传到腾讯云 VOD 存储
  if (officialStableProvider.isConfigured()) {
    try {
      console.log(`[${new Date().toISOString()}] [扩图] 直接上传到腾讯云 VOD: ${fileInfo}`);
      const url = await officialStableProvider.uploadImage(
        req.file.buffer,
        req.file.mimetype,
        req.file.originalname,
      );
      return res.json({ success: true, data: { url } });
    } catch (error) {
      console.error(`[${new Date().toISOString()}] [扩图] 腾讯云上传失败:`, error.message);
      // 不回退到 scwh，直接返回错误（用户要求不依赖 scwh 认证）
      return res.status(500).json({ success: false, error: `腾讯云上传失败: ${error.message}` });
    }
  }

  // 路径 B: 转发到 scwh 后端 OSS（需要认证）
  try {
    const formData = new FormData();
    formData.append(
      'image',
      new Blob([req.file.buffer], { type: req.file.mimetype }),
      req.file.originalname,
    );
    formData.append('category', 'generated');

    const fwdHeaders = getForwardHeadersForUpload(req);

    console.log(`[${new Date().toISOString()}] [扩图] 转发上传到 scwh: ${fileInfo}`);

    const uploadRes = await fetch(`${SCWH_API_URL}/api/oss/upload/image`, {
      method: 'POST',
      headers: fwdHeaders,
      body: formData,
    });

    const data = await uploadRes.json();
    if (!data.success) {
      console.error(`[${new Date().toISOString()}] [扩图] scwh 上传失败:`, data.error || data.message);
      return res.status(uploadRes.status || 500).json({ success: false, error: data.error || data.message || '上传失败' });
    }

    const ossRelativePath = data.data.url || data.data.original;
    const cdnUrl = toOssUrl(ossRelativePath);
    console.log(`[${new Date().toISOString()}] [扩图] 上传成功: ${ossRelativePath} → ${cdnUrl}`);

    res.json({ success: true, data: { url: cdnUrl } });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] [扩图] 上传代理异常:`, error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2) 提交扩图任务
// official-stable → 直接调用腾讯云 API
// 其他 provider → 转发到 scwh 后端
app.post('/api/standalone/outpaint', async (req, res) => {
  try {
    const {
      image,
      targetWidth,
      targetHeight,
      positionX = 0.5,
      positionY = 0.5,
      prompt,
      provider: reqProvider,
      model: reqModel,
      quality: reqQuality,
      numResults = 1,
    } = req.body;

    if (!image || !targetWidth || !targetHeight) {
      return res.status(400).json({ success: false, error: '缺少必要参数: image, targetWidth, targetHeight' });
    }

    const provider = reqProvider || OUTPAINT_PROVIDER;
    const model = reqModel || OUTPAINT_MODEL;

    if (reqProvider && reqModel && !isValidProviderModel(provider, model)) {
      return res.status(400).json({
        success: false,
        error: `不支持的 provider/model 组合: ${provider}/${model}`,
      });
    }

    const modelConfig = OUTPAINT_MODEL_PARAMS[model];
    const quality = reqQuality || modelConfig?.params?.quality?.default || '4K';
    const aspectRatio = computeAspectRatio(targetWidth, targetHeight);

    // 构建扩图 prompt（包含位置和方向信息）
    const outpaintPrompt = buildOutpaintPrompt({
      targetWidth,
      targetHeight,
      aspectRatio,
      positionX,
      positionY,
      userPrompt: prompt,
    });

    console.log(`[${new Date().toISOString()}] [扩图] 提交生成任务: ${provider}/${model}, quality=${quality}, ratio=${aspectRatio}, pos=(${positionX},${positionY}), numResults=${numResults}`);
    console.log(`[${new Date().toISOString()}] [扩图] Prompt: ${outpaintPrompt}`);

    // ========== 路径 A: official-stable → 直接调用腾讯云 ==========
    if (provider === 'official-stable' && officialStableProvider.isConfigured()) {
      const generateParams = {
        model,
        prompt: outpaintPrompt,
        referenceImages: [image], // 已经是公网 URL（腾讯云 VOD）
        aspectRatio,
        quality,
      };

      const taskPromises = Array.from({ length: Math.min(numResults, 4) }, () =>
        officialStableProvider.generateImage(generateParams),
      );

      const taskResults = await Promise.allSettled(taskPromises);

      const tasks = taskResults
        .filter((r) => r.status === 'fulfilled' && r.value.taskId)
        .map((r) => ({ taskId: r.value.taskId, status: r.value.status }));

      const errors = taskResults
        .filter((r) => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.taskId))
        .map((r) => r.status === 'rejected' ? r.reason?.message : r.value?.error);

      if (tasks.length === 0) {
        const errorMsg = errors[0] || '所有任务均提交失败';
        console.error(`[${new Date().toISOString()}] [扩图] 腾讯云生成失败:`, errorMsg);
        return res.status(500).json({ success: false, error: errorMsg });
      }

      console.log(`[${new Date().toISOString()}] [扩图] 腾讯云任务已创建: ${tasks.length}/${numResults} 个`);

      if (numResults === 1) {
        return res.json({ success: true, data: tasks[0] });
      }
      return res.json({ success: true, data: { tasks, errors: errors.length > 0 ? errors : undefined } });
    }

    // ========== 路径 B: 其他 provider → 转发到 scwh ==========
    const imageRelative = toRelativePath(image);
    const generateParams = {
      provider,
      model,
      prompt: outpaintPrompt,
      referenceImages: [imageRelative],
      aspectRatio,
      quality,
    };

    const taskPromises = Array.from({ length: Math.min(numResults, 4) }, () =>
      fetch(`${SCWH_API_URL}/api/standalone/generate-image`, {
        method: 'POST',
        headers: getForwardHeaders(req),
        body: JSON.stringify(generateParams),
      }).then((r) => r.json()),
    );

    const taskResults = await Promise.allSettled(taskPromises);

    const tasks = taskResults
      .filter((r) => r.status === 'fulfilled' && r.value.success)
      .map((r) => {
        const result = r.value.data;
        const taskData = { taskId: result.taskId, status: result.status };
        if (result.imageUrl) taskData.imageUrl = toOssUrl(result.imageUrl);
        return taskData;
      });

    const errors = taskResults
      .filter((r) => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success))
      .map((r) => r.status === 'rejected' ? r.reason?.message : r.value?.error);

    if (tasks.length === 0) {
      const errorMsg = errors[0] || '所有任务均提交失败';
      console.error(`[${new Date().toISOString()}] [扩图] scwh 生成失败:`, errorMsg);
      return res.status(500).json({ success: false, error: errorMsg });
    }

    console.log(`[${new Date().toISOString()}] [扩图] scwh 任务已创建: ${tasks.length}/${numResults} 个`);

    if (numResults === 1) {
      res.json({ success: true, data: tasks[0] });
    } else {
      res.json({ success: true, data: { tasks, errors: errors.length > 0 ? errors : undefined } });
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] [扩图] 提交异常:`, error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3) 查询任务状态
// official-stable:image:* → 直接查询腾讯云
// 其他 → 转发到 scwh 后端
app.get('/api/standalone/task/:taskId', async (req, res) => {
  const { taskId } = req.params;

  try {
    // 路径 A: official-stable 任务 → 直接查询腾讯云
    if (taskId.startsWith('official-stable:image:') && officialStableProvider.isConfigured()) {
      const result = await officialStableProvider.queryImageTask(taskId);
      return res.json({
        success: true,
        data: {
          taskId,
          status: result.status,
          progress: result.progress || 0,
          resultUrl: result.imageUrl || null,
          error: result.error || null,
        },
      });
    }

    // 路径 B: 转发到 scwh 后端
    const taskRes = await fetch(`${SCWH_API_URL}/api/standalone/task/${taskId}`, {
      headers: getForwardHeaders(req),
    });

    const data = await taskRes.json();
    if (!data.success) {
      return res.status(taskRes.status || 500).json(data);
    }

    const task = data.data;
    if (task.resultUrl) {
      task.resultUrl = toOssUrl(task.resultUrl);
    }

    res.json({ success: true, data: task });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] [扩图] 任务查询异常:`, error);
    res.status(500).json({ success: false, error: error.message });
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
║            AI 工具平台 - 多模型代理服务器                         ║
╠══════════════════════════════════════════════════════════════════╣
║  服务地址: http://localhost:${PORT}                                 ║
║  健康检查: http://localhost:${PORT}/health                          ║
╠══════════════════════════════════════════════════════════════════╣
║  API 端点:                                                        ║
║    POST /api/chat             - 统一聊天接口（支持多提供商）        ║
║    POST /api/volcengine/chat  - 火山引擎接口（兼容旧版）           ║
║    GET  /api/models           - 获取可用模型列表                   ║
║    GET  /api/providers        - 获取已配置的提供商                 ║
║    POST /api/upload/image     - 图片上传 → scwh OSS               ║
║    POST /api/standalone/outpaint - 扩图 → scwh generate-image     ║
║    GET  /api/standalone/task/:id - 任务状态 → scwh task            ║
║  提示词管理:                                                       ║
║    GET  /api/admin/prompts     - 提示词模板 CRUD                   ║
║    GET  /api/admin/configs     - 全局配置 CRUD                     ║
║    GET  /api/admin/history     - 修改历史                          ║
║    GET  /api/prompts/:tool     - 公开只读提示词                    ║
║    GET  /api/configs           - 公开只读配置                      ║
╠══════════════════════════════════════════════════════════════════╣
║  scwh 后端: ${SCWH_API_URL || '未配置'}
║  官方稳定渠道: ${officialStableProvider.isConfigured() ? '已配置 ✓ (直连腾讯云，无需 scwh 认证)' : '⚠ 未配置'}
║  扩图默认: ${OUTPAINT_PROVIDER}/${OUTPAINT_MODEL}
║  已配置提供商: ${configuredProviders.length > 0 ? configuredProviders.join(', ') : '无（请配置 .env）'}
╚══════════════════════════════════════════════════════════════════╝
  `);
});
