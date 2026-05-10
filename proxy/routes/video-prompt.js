import { Router } from 'express';
import {
  TIERS,
  CHAT_SYSTEM_PROMPT,
  buildGeneratePrompt,
  extractImageSlots,
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
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: '消息不能为空' });
    }

    const apiMessages = [
      { role: 'system', content: CHAT_SYSTEM_PROMPT },
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ];

    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });

    let fullResponse = '';

    for await (const token of callAIStream(apiMessages)) {
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

    let fullResponse = '';

    for await (const token of callAIStream(apiMessages, { maxTokens: 4096 })) {
      fullResponse += token;
      sendSSE(res, 'delta', { content: token });
    }

    const slots = extractImageSlots(fullResponse);

    if (slots.length > 0) {
      sendSSE(res, 'slots', { slots });
    }

    sendSSE(res, 'done', { slots });
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
