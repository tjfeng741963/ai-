import { describe, it, expect } from 'vitest';
import {
  AD_PATTERNS,
  SCRIPT_TEMPLATES,
  GENRE_MATERIALS,
  recommendAdPatterns,
  recommendScriptTemplates,
} from '../services/ad-knowledge-base.js';

describe('AD_PATTERNS', () => {
  it('应包含6种广告模式', () => {
    const ids = Object.keys(AD_PATTERNS);
    expect(ids).toHaveLength(6);
    expect(ids).toContain('emotional');
    expect(ids).toContain('pain-amplify');
    expect(ids).toContain('contrast');
    expect(ids).toContain('reversal');
    expect(ids).toContain('scene-demo');
    expect(ids).toContain('testimonial');
  });

  it('每种模式应有完整字段', () => {
    for (const pattern of Object.values(AD_PATTERNS)) {
      expect(pattern.id).toBeDefined();
      expect(pattern.name).toBeDefined();
      expect(pattern.formula).toBeDefined();
      expect(pattern.example).toBeDefined();
      expect(Array.isArray(pattern.bestFor)).toBe(true);
      expect(Array.isArray(pattern.notFor)).toBe(true);
      expect(pattern.bestFor.length).toBeGreaterThan(0);
    }
  });
});

describe('SCRIPT_TEMPLATES', () => {
  it('应包含6种剧本模板', () => {
    const ids = Object.keys(SCRIPT_TEMPLATES);
    expect(ids.length).toBeGreaterThanOrEqual(5);
  });

  it('每种模板应有结构描述和套路标签', () => {
    for (const tmpl of Object.values(SCRIPT_TEMPLATES)) {
      expect(tmpl.structure).toBeDefined();
      expect(Array.isArray(tmpl.tropes)).toBe(true);
      expect(tmpl.tropes.length).toBeGreaterThan(0);
    }
  });
});

describe('GENRE_MATERIALS', () => {
  it('应包含5种流派素材', () => {
    expect(Object.keys(GENRE_MATERIALS).length).toBeGreaterThanOrEqual(5);
  });

  it('每种素材应有场景模板和产品融入方式', () => {
    for (const mat of Object.values(GENRE_MATERIALS)) {
      expect(mat.sceneTemplate).toBeDefined();
      expect(mat.dialogueStyle).toBeDefined();
      expect(mat.productAdaptation).toBeDefined();
    }
  });
});

describe('recommendAdPatterns', () => {
  it('应返回最多3个推荐', () => {
    const result = recommendAdPatterns({ productCategory: '3C数码' });
    expect(result.length).toBeLessThanOrEqual(3);
    expect(result.length).toBeGreaterThan(0);
  });

  it('3C数码品类应优先推荐痛点放大和效果对比', () => {
    const result = recommendAdPatterns({ productCategory: '3C数码' });
    const types = result.map((r) => r.type);
    // 3C数码适合痛点放大/效果对比，不适合情感共鸣
    expect(types).toContain('pain-amplify');
    expect(types).toContain('contrast');
  });

  it('家居家纺品类应优先推荐情感共鸣', () => {
    const result = recommendAdPatterns({ productCategory: '家居家纺' });
    expect(result[0].type).toBe('emotional');
  });

  it('温情基调应匹配情感共鸣', () => {
    const result = recommendAdPatterns({ emotionalTone: '温情' });
    const types = result.map((r) => r.type);
    expect(types).toContain('emotional');
  });

  it('无参数时应返回默认排序', () => {
    const result = recommendAdPatterns();
    expect(result.length).toBe(3);
  });
});

describe('recommendScriptTemplates', () => {
  it('应返回最多2个推荐', () => {
    const result = recommendScriptTemplates({ tier: 'short' });
    expect(result.length).toBeLessThanOrEqual(2);
    expect(result.length).toBeGreaterThan(0);
  });

  it('品牌短剧档应匹配最长的模板', () => {
    const result = recommendScriptTemplates({ tier: 'brand-drama' });
    // 所有返回的模板应支持180s+时长
    for (const tmpl of result) {
      const [_, max] = tmpl.duration.split('-').map((s) => parseInt(s) || 0);
      expect(max).toBeGreaterThanOrEqual(60);
    }
  });

  it('科幻方向应匹配scifi模板', () => {
    const result = recommendScriptTemplates({ creativeDirection: '近未来科幻考场' });
    const ids = result.map((r) => r.id);
    expect(ids).toContain('scifi-concept');
  });

  it('无参数时应返回默认推荐', () => {
    const result = recommendScriptTemplates();
    expect(result.length).toBeGreaterThan(0);
  });
});
