/**
 * 公开只读提示词路由
 *
 * 前端工具页面通过这些端点获取最新提示词。
 */

import { Router } from 'express';
import { listPrompts, getPromptByToolAndKey, listConfigs } from '../db/index.js';

const router = Router();

/** GET /api/prompts/:toolId — 获取某工具的所有提示词 */
router.get('/:toolId', (req, res) => {
  try {
    const prompts = listPrompts(req.params.toolId);
    // 返回精简格式（只含 id, name, content, variables, is_dynamic, variants）
    const data = prompts.map((p) => ({
      id: p.id,
      name: p.name,
      content: p.content,
      variables: p.variables,
      is_dynamic: p.is_dynamic,
      variants: p.variants,
    }));
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/** GET /api/prompts/:toolId/:promptKey — 获取单个提示词 */
router.get('/:toolId/:promptKey', (req, res) => {
  try {
    const prompt = getPromptByToolAndKey(req.params.toolId, req.params.promptKey);
    if (!prompt) {
      return res.status(404).json({ success: false, error: '未找到该提示词' });
    }
    res.json({
      success: true,
      data: {
        id: prompt.id,
        name: prompt.name,
        content: prompt.content,
        variables: prompt.variables,
        is_dynamic: prompt.is_dynamic,
        variants: prompt.variants,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/** GET /api/configs — 获取所有全局配置（公开只读） */
router.get('/', (req, res) => {
  // 这个路由挂在 /api/configs 上
  try {
    const configs = listConfigs();
    const data = {};
    for (const c of configs) {
      data[c.key] = c.value;
    }
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export { router as promptsRouter, router as default };

// 单独导出 configs 路由处理函数
export function configsHandler(_req, res) {
  try {
    const configs = listConfigs();
    const data = {};
    for (const c of configs) {
      data[c.key] = c.value;
    }
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
