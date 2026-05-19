import { Router } from 'express';
import {
  TIERS,
  CHAT_SYSTEM_PROMPT,
  buildGeneratePrompt,
  parseOptions,
  callAIStream,
} from '../services/video-prompt-agent.js';

const router = Router();

function sendSSE(res, type, data) {
  res.write(`data: ${JSON.stringify({ type, ...data })}\n\n`);
}

// ==================== POST /chat ====================

router.post('/chat', async (req, res) => {
  try {
    const { message, history = [], images = [], productUrl = '' } = req.body;

    if (!message && images.length === 0) {
      return res.status(400).json({ error: '消息不能为空' });
    }

    // 构建用户消息内容
    let userContent;
    let streamOptions = {};

    if (images.length > 0) {
      // 有图片：用豆包视觉模型，content 为多模态数组
      const parts = images.slice(0, 5).map((img) => ({
        type: 'image_url',
        image_url: { url: img },
      }));
      let textPart = message || '请分析这些产品图片，帮我规划拍摄风格';
      if (productUrl) textPart += `\n\n商品链接：${productUrl}`;
      parts.push({ type: 'text', text: textPart });
      userContent = parts;
      // 切换到豆包，支持 image_url 多模态
      streamOptions = { provider: 'volcengine', model: 'ep-20260317144814-4pqbx' };
    } else {
      userContent = productUrl ? `${message}\n\n商品链接：${productUrl}` : message;
    }

    const apiMessages = [
      { role: 'system', content: CHAT_SYSTEM_PROMPT },
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: userContent },
    ];

    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });

    let fullResponse = '';

    for await (const token of callAIStream(apiMessages, streamOptions)) {
      fullResponse += token;
      sendSSE(res, 'delta', { content: token });
    }

    const { cleanText, options } = parseOptions(fullResponse);

    if (cleanText !== fullResponse) {
      sendSSE(res, 'content_replace', { content: cleanText });
    }

    if (options) {
      sendSSE(res, 'options', { options });
    }

    sendSSE(res, 'done', {});
    res.end();
  } catch (err) {
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    } else {
      sendSSE(res, 'error', { error: err.message });
      res.end();
    }
  }
});

// ==================== POST /generate ====================

router.post('/generate', async (req, res) => {
  try {
    const { style, tier, history = [] } = req.body;

    if (!style) {
      return res.status(400).json({ error: '缺少风格' });
    }
    if (!tier || !TIERS[tier]) {
      return res.status(400).json({ error: `不支持的档位: ${tier}，可选: ${Object.keys(TIERS).join('/')}` });
    }

    const generatePrompt = buildGeneratePrompt(style, tier);

    const apiMessages = [
      { role: 'system', content: generatePrompt },
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: '请根据以上对话中确认的需求，生成完整的分镜脚本。' },
    ];

    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });

    for await (const token of callAIStream(apiMessages, { maxTokens: 4096 })) {
      sendSSE(res, 'delta', { content: token });
    }

    sendSSE(res, 'done', {});
    res.end();
  } catch (err) {
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    } else {
      sendSSE(res, 'error', { error: err.message });
      res.end();
    }
  }
});

// ==================== GET /tiers ====================

router.get('/tiers', (_req, res) => {
  res.json({ tiers: TIERS });
});

export default router;
