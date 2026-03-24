import { Clapperboard } from 'lucide-react';
import type { ToolDefinition } from '../types';

export const scriptRatingToolMeta: Omit<ToolDefinition, 'component'> = {
  id: 'script-rating',
  name: '剧本评级',
  description: 'AI 深度分析剧本质量，16维评分体系，市场分析与改进建议一站式报告',
  icon: Clapperboard,
  route: '/tools/script-rating',
  status: 'available',
  accentColor: 'primary',
};
