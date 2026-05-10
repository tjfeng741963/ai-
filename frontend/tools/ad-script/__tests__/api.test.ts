import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseSSELine, API_BASE } from '../services/api';

describe('parseSSELine', () => {
  it('应解析delta事件', () => {
    const result = parseSSELine('data: {"type":"delta","content":"你好"}');
    expect(result).toEqual({ type: 'delta', content: '你好' });
  });

  it('应解析session事件', () => {
    const result = parseSSELine('data: {"type":"session","sessionId":"ad-123"}');
    expect(result).toEqual({ type: 'session', sessionId: 'ad-123' });
  });

  it('应解析step事件', () => {
    const result = parseSSELine('data: {"type":"step","step":1,"currentStep":2,"isReadyToGenerate":false}');
    expect(result).toEqual({ type: 'step', step: 1, currentStep: 2, isReadyToGenerate: false });
  });

  it('应解析done事件', () => {
    const result = parseSSELine('data: {"type":"done","sessionId":"ad-123","currentStep":2}');
    expect(result).toEqual({ type: 'done', sessionId: 'ad-123', currentStep: 2 });
  });

  it('应解析error事件', () => {
    const result = parseSSELine('data: {"type":"error","error":"出错了"}');
    expect(result).toEqual({ type: 'error', error: '出错了' });
  });

  it('空行应返回null', () => {
    expect(parseSSELine('')).toBeNull();
    expect(parseSSELine('  ')).toBeNull();
  });

  it('非data行应返回null', () => {
    expect(parseSSELine('event: message')).toBeNull();
    expect(parseSSELine(': comment')).toBeNull();
  });

  it('JSON解析失败应返回null', () => {
    expect(parseSSELine('data: not-json')).toBeNull();
  });
});

describe('API_BASE', () => {
  it('应指向ad-script端点', () => {
    expect(API_BASE).toBe('/api/ad-script');
  });
});
