import { lazy } from 'react';
import { Clapperboard, ImagePlus, Megaphone, Wand2, Rocket, Video, GitBranch, Music } from 'lucide-react';
import type { ToolDefinition } from './types';

const ScriptRatingPage = lazy(() => import('./script-rating/page'));
const OutpaintPage = lazy(() => import('./outpaint/page'));
const AdScriptPage = lazy(() => import('./ad-script/page'));
const SpaceLandingPage = lazy(() => import('./space-landing/page'));
const VideoPromptPage = lazy(() => import('./video-prompt/page'));
const InteractiveDramaPage = lazy(() => import('./interactive-drama/page'));
const MVStoryboardPage = lazy(() => import('./mv-storyboard/page'));

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
    status: 'available',
    accentColor: 'secondary',
    component: OutpaintPage,
  },
  {
    id: 'ad-script',
    name: '广告剧本',
    description: 'AI广告创意总监，对话式生成电商信息流广告短剧本，支持产品图片和淘宝链接输入',
    icon: Megaphone,
    route: '/tools/ad-script',
    status: 'beta',
    accentColor: 'tertiary',
    component: AdScriptPage,
  },
  {
    id: 'video-prompt',
    name: '视频分镜',
    description: '一句话生成拍摄分镜脚本，上传参考图即可用于任何视频工作流',
    icon: Video,
    route: '/tools/video-prompt',
    status: 'beta',
    accentColor: 'secondary',
    component: VideoPromptPage,
  },
  {
    id: 'mv-storyboard',
    name: 'MV分镜',
    description: 'AI MV创意导演，对话式生成MV分镜脚本，输出 Seedance 2.0 提示词',
    icon: Music,
    route: '/tools/mv-storyboard',
    status: 'beta',
    accentColor: 'tertiary',
    component: MVStoryboardPage,
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
  {
    id: 'interactive-drama',
    name: '互动剧',
    description: 'AI 辅助设计互动剧本，6步引导 + 节点图编辑器 + 播放验证',
    icon: GitBranch,
    route: '/tools/interactive-drama',
    status: 'beta',
    accentColor: 'tertiary',
    component: InteractiveDramaPage,
  },
  {
    id: 'space-landing',
    name: '星际着陆页',
    description: '沉浸式星际旅行落地页 — 液态玻璃设计系统 · 视频背景 · 逐词动画',
    icon: Rocket,
    route: '/space-landing',
    status: 'available',
    accentColor: 'secondary',
    component: SpaceLandingPage,
    fullscreen: true,
  },
];

/** 获取所有可见工具（首页展示用） */
export function getVisibleTools(): readonly ToolDefinition[] {
  return toolRegistry;
}

/** 获取有路由的工具（动态路由注册用，不含全屏工具） */
export function getRoutableTools(): readonly ToolDefinition[] {
  return toolRegistry.filter(
    (t): t is ToolDefinition & { component: NonNullable<ToolDefinition['component']> } =>
      (t.status === 'available' || t.status === 'beta') && t.component != null && !t.fullscreen,
  );
}

/** 获取全屏工具（在 AppLayout 外单独注册路由） */
export function getFullscreenTools(): readonly ToolDefinition[] {
  return toolRegistry.filter(
    (t): t is ToolDefinition & { component: NonNullable<ToolDefinition['component']> } =>
      t.fullscreen === true && t.component != null,
  );
}
