/**
 * 分层 Prompt 组装器
 *
 * 来自 Pattern 02 — 把 prompt 当作有序的层（Layer）组装，每层有
 * 自己的优先级、条件和渲染函数。避免 ad-hoc 字符串拼接。
 *
 * Priority 范围约定:
 *   0-9   模板正文 / 角色设定
 *   10-29 领域知识（产品、人群、广告模式）
 *   30-49 结构化上下文（创意方案、植入设计）
 *   50-69 连贯性约束（钩子回收、格式规范）
 *   70-89 用户补充 / 合规
 *   90-99 最终指令
 */

/**
 * @typedef {object} PromptLayer
 * @property {string} id - 唯一标识，用于调试和审计
 * @property {number} priority - 数字越小越靠前
 * @property {string} title - 渲染时自动加 ### 前缀
 * @property {(ctx: PromptContext) => string | null} render - 返回 null 表示跳过该层
 * @property {'normal' | 'important' | 'critical'} [intensity]
 */

/**
 * @typedef {object} PromptContext
 * @property {Record<string, string>} vars - 模板占位符变量
 * @property {Record<string, unknown>} data - 任意附加数据
 */

/**
 * @typedef {object} LayerMeta
 * @property {string} layerId
 * @property {string} title
 * @property {boolean} rendered
 * @property {number} charCount
 * @property {{ start: number; end: number }} position
 */

/**
 * @typedef {object} AssembledPrompt
 * @property {string} text - 最终 prompt 文本
 * @property {LayerMeta[]} layers - 每层的元信息
 * @property {number} estimatedTokens - 预估 token 数（中文按 1.5 字/token）
 */

/**
 * 创建 Prompt 组装器
 */
export function createAssembler() {
  /**
   * 组装最终 prompt
   * @param {PromptLayer[]} layers
   * @param {PromptContext} ctx
   * @returns {AssembledPrompt}
   */
  function assemble(layers, ctx) {
    const sorted = [...layers].sort((a, b) => a.priority - b.priority);
    const sections = [];
    /** @type {LayerMeta[]} */
    const layerMetas = [];

    for (const layer of sorted) {
      const content = layer.render(ctx);
      if (content === null || content === undefined || content === '') {
        layerMetas.push({
          layerId: layer.id,
          title: layer.title,
          rendered: false,
          charCount: 0,
          position: { start: -1, end: -1 },
        });
        continue;
      }

      const start = sections.join('\n\n').length;
      const intensityMarker = layer.intensity === 'critical' ? '【硬性要求】'
        : layer.intensity === 'important' ? '【重要】'
        : '';

      const header = `### ${layer.title}${intensityMarker ? ` ${intensityMarker}` : ''}`;
      sections.push(`${header}\n${content}`);
      const end = sections.join('\n\n').length;

      layerMetas.push({
        layerId: layer.id,
        title: layer.title,
        rendered: true,
        charCount: content.length,
        position: { start, end },
      });
    }

    const text = sections.join('\n\n');
    const estimatedTokens = Math.ceil(text.length / 1.5);

    return { text, layers: layerMetas, estimatedTokens };
  }

  /**
   * 预览——只返回每层内容，不输出最终文本（用于调试）
   * @param {PromptLayer[]} layers
   * @param {PromptContext} ctx
   * @returns {{ layerId: string; title: string; content: string | null; skipped: boolean }[]}
   */
  function preview(layers, ctx) {
    const sorted = [...layers].sort((a, b) => a.priority - b.priority);
    return sorted.map((layer) => {
      const content = layer.render(ctx);
      return {
        layerId: layer.id,
        title: layer.title,
        content: content || null,
        skipped: content === null || content === undefined || content === '',
      };
    });
  }

  return { assemble, preview };
}

/** 单例 */
const defaultAssembler = createAssembler();
export default defaultAssembler;
