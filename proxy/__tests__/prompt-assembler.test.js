import { describe, it, expect } from 'vitest';
import { createAssembler } from '../services/prompt-assembler.js';

describe('prompt-assembler', () => {
  const assembler = createAssembler();

  describe('assemble', () => {
    it('应按 priority 顺序组装各层', () => {
      const { text } = assembler.assemble(
        [
          { id: 'c', priority: 30, title: '第三层', render: () => 'c内容' },
          { id: 'a', priority: 10, title: '第一层', render: () => 'a内容' },
          { id: 'b', priority: 20, title: '第二层', render: () => 'b内容' },
        ],
        { vars: {}, data: {} },
      );

      const aPos = text.indexOf('### 第一层');
      const bPos = text.indexOf('### 第二层');
      const cPos = text.indexOf('### 第三层');
      expect(aPos).toBeLessThan(bPos);
      expect(bPos).toBeLessThan(cPos);
    });

    it('render 返回 null 时应跳过该层', () => {
      const { text, layers } = assembler.assemble(
        [
          { id: 'a', priority: 10, title: '出现', render: () => '有内容' },
          { id: 'b', priority: 20, title: '隐藏', render: () => null },
          { id: 'c', priority: 30, title: '出现2', render: () => '也有内容' },
        ],
        { vars: {}, data: {} },
      );

      expect(text).toContain('### 出现');
      expect(text).not.toContain('### 隐藏');
      expect(text).toContain('### 出现2');
      expect(layers.find((l) => l.layerId === 'b').rendered).toBe(false);
      expect(layers.filter((l) => l.rendered).length).toBe(2);
    });

    it('render 返回空字符串时应跳过', () => {
      const { text } = assembler.assemble(
        [
          { id: 'a', priority: 10, title: '有', render: () => 'x' },
          { id: 'b', priority: 20, title: '空', render: () => '' },
        ],
        { vars: {}, data: {} },
      );

      expect(text).not.toContain('### 空');
    });

    it('应计算 estimatedTokens', () => {
      const { estimatedTokens, layers } = assembler.assemble(
        [
          { id: 'test', priority: 10, title: '测试', render: () => '这是一段测试文本，用于验证token估算功能。' },
        ],
        { vars: {}, data: {} },
      );

      expect(estimatedTokens).toBeGreaterThan(0);
      expect(layers[0].charCount).toBe(23);
    });

    it('应标记 intensity', () => {
      const { text } = assembler.assemble(
        [
          { id: 'critical', priority: 10, title: '关键层', intensity: 'critical', render: () => 'c' },
          { id: 'important', priority: 20, title: '重要层', intensity: 'important', render: () => 'i' },
          { id: 'normal', priority: 30, title: '普通层', render: () => 'n' },
        ],
        { vars: {}, data: {} },
      );

      expect(text).toContain('【硬性要求】');
      expect(text).toContain('【重要】');
      // 普通层不应该有 intensity 标记
      const normalPos = text.indexOf('### 普通层');
      const normalEnd = text.indexOf('\n', normalPos);
      const normalLine = text.slice(normalPos, normalEnd);
      expect(normalLine).not.toContain('【');
    });

    it('同 priority 应按注册顺序排列（稳定排序）', () => {
      const { text } = assembler.assemble(
        [
          { id: 'b', priority: 10, title: 'B', render: () => 'B' },
          { id: 'a', priority: 10, title: 'A', render: () => 'A' },
        ],
        { vars: {}, data: {} },
      );

      // 稳定排序：同 priority 保持注册顺序，B 在前 A 在后
      expect(text.indexOf('### B')).toBeLessThan(text.indexOf('### A'));
    });
  });

  describe('preview', () => {
    it('应返回每层的预览信息', () => {
      const previews = assembler.preview(
        [
          { id: 'a', priority: 10, title: 'A层', render: () => '内容A' },
          { id: 'b', priority: 20, title: 'B层', render: () => null },
        ],
        { vars: {}, data: {} },
      );

      expect(previews).toHaveLength(2);
      expect(previews[0].content).toBe('内容A');
      expect(previews[0].skipped).toBe(false);
      expect(previews[1].content).toBeNull();
      expect(previews[1].skipped).toBe(true);
    });
  });
});
