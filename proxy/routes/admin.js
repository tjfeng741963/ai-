/**
 * Admin CRUD 路由
 *
 * 提供提示词模板、全局配置的增删改查，以及修改历史查看和回滚。
 */

import { Router } from 'express';
import {
  listPrompts,
  getPrompt,
  updatePrompt,
  listConfigs,
  getConfig,
  updateConfig,
  listHistory,
  getHistory,
  rollbackToHistory,
} from '../db/index.js';

const router = Router();

// ==================== 提示词模板 ====================

/** GET /api/admin/prompts?tool_id=xxx */
router.get('/prompts', (req, res) => {
  try {
    const prompts = listPrompts(req.query.tool_id);
    res.json({ success: true, data: prompts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/** GET /api/admin/prompts/:id */
router.get('/prompts/:id', (req, res) => {
  try {
    const prompt = getPrompt(req.params.id);
    if (!prompt) {
      return res.status(404).json({ success: false, error: '未找到该提示词模板' });
    }
    res.json({ success: true, data: prompt });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/** PUT /api/admin/prompts/:id */
router.put('/prompts/:id', (req, res) => {
  try {
    const { name, description, content, variables, is_dynamic, variants, sort_order } = req.body;

    const updated = updatePrompt(req.params.id, {
      name,
      description,
      content,
      variables,
      is_dynamic,
      variants,
      sort_order,
    });

    if (!updated) {
      return res.status(404).json({ success: false, error: '未找到该提示词模板' });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== 全局配置 ====================

/** GET /api/admin/configs */
router.get('/configs', (_req, res) => {
  try {
    const configs = listConfigs();
    res.json({ success: true, data: configs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/** PUT /api/admin/configs/:key */
router.put('/configs/:key', (req, res) => {
  try {
    const { value, label, description } = req.body;
    const updated = updateConfig(req.params.key, { value, label, description });

    if (!updated) {
      return res.status(404).json({ success: false, error: '未找到该配置项' });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== 修改历史 ====================

/** GET /api/admin/history?target_type=prompt&target_id=xxx&limit=50&offset=0 */
router.get('/history', (req, res) => {
  try {
    const { target_type, target_id, limit = 50, offset = 0 } = req.query;
    const history = listHistory({
      targetType: target_type,
      targetId: target_id,
      limit: Number(limit),
      offset: Number(offset),
    });
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/** POST /api/admin/history/:id/rollback */
router.post('/history/:id/rollback', (req, res) => {
  try {
    const historyId = Number(req.params.id);
    const history = getHistory(historyId);

    if (!history) {
      return res.status(404).json({ success: false, error: '未找到该历史记录' });
    }

    const result = rollbackToHistory(historyId);
    res.json({ success: true, data: result, message: '回滚成功' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
