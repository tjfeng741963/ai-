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
  it('应从编号列表中提取选项（管道符分隔）', () => {
    const text = `分析完毕：
1. 体感冲突 | 冰火两重天，穿上秒变时尚达人
2. 场景冲突 | 地铁里的尊严保卫战
3. 时间冲突 | 早上7点vs上午9点`;
    const options = extractOptionsFromText(text);
    expect(options).toHaveLength(3);
    expect(options[0].id).toBe('1');
    expect(options[0].label).toBe('体感冲突');
    expect(options[1].label).toBe('场景冲突');
  });

  it('应从粗体标题中提取选项（冒号分隔）', () => {
    const text = `推荐三种打法：
1. **情感共鸣**：用温情故事打动用户
2. **搞笑反转**：用反差制造记忆点
3. **效果对比**：前后对比突出卖点`;
    const options = extractOptionsFromText(text);
    expect(options).toHaveLength(3);
    expect(options[0].label).toBe('情感共鸣');
    expect(options[2].label).toBe('效果对比');
  });

  it('应从中文冒号分隔的选项中提取', () => {
    const text = `1. 闺蜜日常：两个女生的穿搭对比
2. 职场逆袭：面试前后的形象差异
3. 约会惊喜：第一次见面的衣品加分`;
    const options = extractOptionsFromText(text);
    expect(options).toHaveLength(3);
    expect(options[0].label).toBe('闺蜜日常');
  });

  it('应从乘号分隔的选项中提取', () => {
    const text = `1. 宝妈群体 × 带娃出门收纳痛点
2. 职场白领 × 通勤效率需求
3. 学生党 × 性价比追求`;
    const options = extractOptionsFromText(text);
    expect(options).toHaveLength(3);
    expect(options[0].label).toBe('宝妈群体');
    expect(options[2].label).toBe('学生党');
  });

  it('应从破折号分隔的选项中提取', () => {
    const text = `1. 情感路线 — 用温情打动用户
2. 搞笑路线 — 反差制造记忆点`;
    const options = extractOptionsFromText(text);
    expect(options).toHaveLength(2);
    expect(options[0].label).toBe('情感路线');
  });

  it('少于2个选项时应返回null', () => {
    const text = '1. 只有一个选项 | 不够';
    const options = extractOptionsFromText(text);
    expect(options).toBeNull();
  });

  it('无编号列表时应返回null', () => {
    const text = '你好，请告诉我你的产品是什么';
    const options = extractOptionsFromText(text);
    expect(options).toBeNull();
  });
});

describe('ensureOptions', () => {
  it('优先使用AI标记中的选项', () => {
    const text = '内容\n<!-- OPTIONS:[{"id":"1","label":"X","description":"Y"}] -->';
    const { options } = ensureOptions(text);
    expect(options).toHaveLength(1);
    expect(options[0].label).toBe('X');
  });

  it('无标记时回退到文本提取', () => {
    const text = `方案如下：
1. 方案A | 描述A
2. 方案B | 描述B
3. 方案C | 描述C`;
    const { options } = ensureOptions(text);
    expect(options).toHaveLength(3);
    expect(options[0].label).toBe('方案A');
  });

  it('无标记且无编号选项时返回null', () => {
    const text = '产品分析完毕，这是一款AI玩具狗，核心卖点如下...';
    const { options } = ensureOptions(text);
    expect(options).toBeNull();
  });

  it('cleanText应不含标记', () => {
    const text = '内容\n<!-- OPTIONS:[{"id":"1","label":"X","description":"Y"}] -->';
    const { cleanText } = ensureOptions(text);
    expect(cleanText).toBe('内容');
    expect(cleanText).not.toContain('OPTIONS');
  });
});
