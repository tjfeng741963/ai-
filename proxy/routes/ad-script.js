import { Router } from 'express';
import {
  SessionManager,
  buildSystemPrompt,
  buildGeneratePrompt,
  callAIStream,
  ensureOptions,
  getAdScriptConfig,
} from '../services/ad-script-agent.js';

const router = Router();
const sessionManager = new SessionManager()

// ==================== GET /sessions ====================

router.get('/sessions', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);
  const sessions = sessionManager.listSessions(limit);
  res.json({ sessions });
});

function sendSSE(res, type, data) {
  res.write(`data: ${JSON.stringify({ type, ...data })}\n\n`);
}

// ==================== POST /chat ====================

router.post('/chat', async (req, res) => {
  const ts = () => new Date().toISOString();
  try {
    const { sessionId: inputSessionId, message, images, taobaoLink, confirmStep } = req.body;
    console.log(`[${ts()}] [ad-script] 聊天请求 sessionId=${inputSessionId || '(新)'} msg="${(message || '').slice(0, 50)}" confirm=${!!confirmStep}`);

    if (!message && !images?.length && !taobaoLink) {
      return res.status(400).json({ error: '消息不能为空' });
    }

    const sessionId = inputSessionId || sessionManager.createSession();
    const session = sessionManager.getSession(sessionId);

    let userContent = message || '';
    if (taobaoLink) {
      userContent += `\n\n[淘宝链接]: ${taobaoLink}`;
      session.productProfile.source.taobaoLink = taobaoLink;
      session.productProfile.source.type = session.productProfile.source.type || 'link';
    }
    if (images?.length) {
      session.productProfile.source.uploadedImages.push(...images);
      session.productProfile.source.type = 'image+chat';
    }

    sessionManager.addMessage(sessionId, 'user', userContent);

    const currentStep = session.currentStep;

    if (confirmStep && currentStep <= 5) {
      sessionManager.confirmStep(sessionId, currentStep);
    }

    const systemPrompt = buildSystemPrompt(session);
    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...session.messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Session-Id': sessionId,
    });

    sendSSE(res, 'session', { sessionId });

    if (session.currentStep !== currentStep) {
      sendSSE(res, 'step', {
        step: currentStep,
        currentStep: session.currentStep,
        isReadyToGenerate: sessionManager.isReadyToGenerate(sessionId),
      });
    }

    let fullResponse = '';

    for await (const token of callAIStream(apiMessages)) {
      fullResponse += token;
      sendSSE(res, 'delta', { content: token });
    }

    const { cleanText, options } = ensureOptions(fullResponse);

    sessionManager.addMessage(sessionId, 'assistant', cleanText);

    if (cleanText !== fullResponse) {
      sendSSE(res, 'content_replace', { content: cleanText });
    }

    if (options) {
      sendSSE(res, 'options', { options });
    }

    sendSSE(res, 'done', {
      sessionId,
      currentStep: session.currentStep,
    });
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
  const ts = () => new Date().toISOString();
  try {
    const { sessionId, tier, mode = 'single' } = req.body;
    console.log(`[${ts()}] [ad-script] 生成请求 sessionId=${sessionId} tier=${tier}`);

    if (!sessionId) {
      return res.status(400).json({ error: '缺少sessionId' });
    }
    if (!tier) {
      return res.status(400).json({ error: '缺少时长档位' });
    }

    const validTiers = ['ultra-short', 'short', 'standard', 'story'];
    if (!validTiers.includes(tier)) {
      return res.status(400).json({ error: `不支持的档位: ${tier}，可选: ${validTiers.join('/')}` });
    }

    let session;
    try {
      session = sessionManager.getSession(sessionId);
    } catch (e) {
      console.error(`[${ts()}] [ad-script] 会话不存在 sessionId=${sessionId}`);
      return res.status(404).json({ error: '会话不存在或已过期，请刷新页面重新开始' });
    }

    console.log(`[${ts()}] [ad-script] 构建生成提示词 step=${session.currentStep} confirmed=${JSON.stringify(session.stepConfirmed)}`);

    const generatePrompt = buildGeneratePrompt(session, tier);
    const config = getAdScriptConfig();

    const apiMessages = [
      { role: 'system', content: generatePrompt },
      ...session.messages.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: '请根据以上所有信息，生成完整的广告剧本。' },
    ];

    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    let fullScript = '';

    for await (const token of callAIStream(apiMessages, {
      maxTokens: config.generateMaxTokens,
    })) {
      fullScript += token;
      sendSSE(res, 'delta', { content: token });
    }

    console.log(`[${ts()}] [ad-script] 剧本生成完成 length=${fullScript.length}`);

    sendSSE(res, 'done', {
      sessionId,
      tier,
      script: fullScript,
    });
    res.end();
  } catch (err) {
    console.error(`[${ts()}] [ad-script] 生成失败`, err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    } else {
      sendSSE(res, 'error', { error: err.message });
      res.end();
    }
  }
});

// ==================== GET /session/:id ====================

router.get('/session/:sessionId', (req, res) => {
  try {
    const session = sessionManager.getSession(req.params.sessionId);
    res.json({
      sessionId: session.sessionId,
      title: session.title,
      currentStep: session.currentStep,
      stepConfirmed: session.stepConfirmed,
      productProfile: session.productProfile,
      messageCount: session.messages.length,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// ==================== GET /session/:id/full ====================

router.get('/session/:sessionId/full', (req, res) => {
  try {
    const session = sessionManager.getSession(req.params.sessionId);
    res.json({
      sessionId: session.sessionId,
      title: session.title,
      currentStep: session.currentStep,
      stepConfirmed: session.stepConfirmed,
      productProfile: session.productProfile,
      messages: session.messages.map((m) => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
      })),
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// ==================== DELETE /session/:id ====================

router.delete('/session/:sessionId', (req, res) => {
  sessionManager.deleteSession(req.params.sessionId);
  res.json({ success: true });
});

export default router;
