import { describe, it, expect } from 'vitest';
import { parseOptions, extractOptionsFromText, ensureOptions } from '../services/ad-script-agent.js';

describe('parseOptions', () => {
  it('应解析出OPTIONS标记中的JSON数组', () => {
    const text = `好的，分析完毕！

1. **情感共鸣** — 让用户产生共情
2. **搞笑反转** — 用反差制造记忆点
3. **效果对比** — 前后对比突出卖点
<!-- OPTIONS:[{"id":"1","label":"情感共鸣","description":"让用户产生共情"},{"id":"2","label":"搞笑反转","description":"用反差制造记忆点"},{"id":"3","label":"效果对比","description":"前后对比突出卖点"}] -->`;

    const { cleanText, options } = parseOptions(text);
    expect(options).toHaveLength(3);
    expect(options[0].id).toBe('1');
    expect(options[0].label).toBe('情感共鸣');
    expect(options[2].description).toBe('前后对比突出卖点');
    expect(cleanText).not.toContain('OPTIONS');
    expect(cleanText).toContain('效果对比');
  });

  it('无OPTIONS标记时应正常返回原文', () => {
    const text = '你好，请告诉我你的产品是什么';
    const { cleanText, options } = parseOptions(text);
    expect(cleanText).toBe(text);
    expect(options).toBeNull();
  });

  it('OPTIONS的JSON格式错误时应容错', () => {
    const text = '回复内容\n<!-- OPTIONS:not-json -->';
    const { cleanText, options } = parseOptions(text);
    expect(options).toBeNull();
    expect(cleanText).toBe('回复内容');
  });

  it('cleanText应去除标记并保持正文完整', () => {
    const text = '分析完毕！\n<!-- OPTIONS:[{"id":"1","label":"确认","description":"没问题"}] -->';
    const { cleanText, options } = parseOptions(text);
    expect(cleanText).toBe('分析完毕！');
    expect(options).toHaveLength(1);
  });

  it('应处理多行OPTIONS标记', () => {
    const text = `内容
<!-- OPTIONS:[
  {"id":"1","label":"A","description":"描述A"},
  {"id":"2","label":"B","description":"描述B"}
] -->`;
    const { cleanText, options } = parseOptions(text);
    expect(options).toHaveLength(2);
    expect(cleanText).toBe('内容');
  });
});

describe('extractOptionsFromText', () => {
  it('应从 × 分隔的编号选项中提取', () => {
    const text = `1. 通勤型男 × "怕热又得穿得体面" → 场景描述：每天挤地铁
2. 懒人奶爸 × "一条裤子穿一周" → 场景描述：不想动脑
3. 微胖兄弟 × "走路磨裆出汗" → 场景描述：夏天最尴尬`;
    const options = extractOptionsFromText(text);
    expect(options).toHaveLength(3);
    expect(options[0].label).toBe('通勤型男');
    expect(options[1].label).toBe('懒人奶爸');
  });

  it('应从 ： 分隔的选项中提取', () => {
    const text = `1. 情感共鸣：用温情打动用户
2. 搞笑反转：反差制造记忆点
3. 效果对比：前后对比突出卖点`;
    const options = extractOptionsFromText(text);
    expect(options).toHaveLength(3);
    expect(options[0].label).toBe('情感共鸣');
  });

  it('少于2个选项时返回null', () => {
    expect(extractOptionsFromText('1. 只有一个选项：不够')).toBeNull();
  });

  it('无编号行时返回null', () => {
    expect(extractOptionsFromText('普通文本没有选项')).toBeNull();
  });
});

describe('ensureOptions', () => {
  it('优先使用AI标记中的选项', () => {
    const text = '内容\n<!-- OPTIONS:[{"id":"1","label":"X","description":"Y"}] -->';
    const { options } = ensureOptions(text);
    expect(options).toHaveLength(1);
    expect(options[0].label).toBe('X');
  });

  it('无标记时回退到文本提取（安全网）', () => {
    const text = `方案如下：
1. 方案A × 描述A说明文字
2. 方案B × 描述B说明文字
3. 方案C × 描述C说明文字`;
    const { options } = ensureOptions(text);
    expect(options).toHaveLength(3);
    expect(options[0].label).toBe('方案A');
  });

  it('既无标记也无编号时返回null', () => {
    const { options } = ensureOptions('产品分析完毕，这是一款AI玩具狗...');
    expect(options).toBeNull();
  });

  it('cleanText应不含OPTIONS标记', () => {
    const text = '内容\n<!-- OPTIONS:[{"id":"1","label":"X","description":"Y"}] -->';
    const { cleanText } = ensureOptions(text);
    expect(cleanText).toBe('内容');
    expect(cleanText).not.toContain('OPTIONS');
  });
});
