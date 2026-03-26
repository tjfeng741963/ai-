/**
 * 阶梯式轮询间隔 (参照 scwh/utils/steppedInterval.ts)
 * 前 3 次: 1s → 3-6 次: 2s → 6-10 次: 3s → 10+ 次: 5s
 */
export function getSteppedInterval(count: number): number {
  if (count < 3) return 1000;
  if (count < 6) return 2000;
  if (count < 10) return 3000;
  return 5000;
}

/** 最大轮询次数（~3 分钟） */
export const MAX_POLL_COUNT = 60;
