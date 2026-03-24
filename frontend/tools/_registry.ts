import { lazy } from 'react';
import { Clapperboard, ImagePlus, Wand2 } from 'lucide-react';
import type { ToolDefinition } from './types';

const ScriptRatingPage = lazy(() => import('./script-rating/page'));

export const toolRegistry: readonly ToolDefinition[] = [
  {
    id: 'script-rating',
    name: '剧本评级',
    description: 'AI 深度分析剧本质量，16维评分体系，市场分析与改进建议一站式报告',
    icon: Clapperboard,
    route: '/tools/script-rating',
    status: 'available',
    accentColor: 'primary',
    component: ScriptRatingPage,
  },
  {
    id: 'outpaint',
    name: 'AI 扩图',
    description: '智能扩展图片边界，AI 自动补全画面内容，支持多比例输出',
    icon: ImagePlus,
    route: '/tools/outpaint',
    status: 'coming_soon',
    accentColor: 'secondary',
  },
  {
    id: 'storyboard',
    name: '分镜生成',
    description: '从剧本自动生成分镜脚本，AI 绘制概念画面，加速预制流程',
    icon: Wand2,
    route: '/tools/storyboard',
    status: 'coming_soon',
    accentColor: 'tertiary',
  },
];

/** 获取所有可见工具（首页展示用） */
export function getVisibleTools(): readonly ToolDefinition[] {
  return toolRegistry;
}

/** 获取有路由的工具（动态路由注册用） */
export function getRoutableTools(): readonly ToolDefinition[] {
  return toolRegistry.filter(
    (t): t is ToolDefinition & { component: NonNullable<ToolDefinition['component']> } =>
      (t.status === 'available' || t.status === 'beta') && t.component != null,
  );
}
