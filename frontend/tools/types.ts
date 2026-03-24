import type { ComponentType } from 'react';
import type { LucideIcon } from 'lucide-react';

/** 工具可用状态 */
export type ToolStatus = 'available' | 'coming_soon' | 'beta';

/** 主题强调色，映射到 cm-primary / cm-secondary / cm-tertiary */
export type ToolAccentColor = 'primary' | 'secondary' | 'tertiary';

/** 工具定义 */
export interface ToolDefinition {
  /** 唯一标识符，用于路由和 key */
  id: string;
  /** 显示名称 */
  name: string;
  /** 简短描述 */
  description: string;
  /** Lucide 图标组件 */
  icon: LucideIcon;
  /** 路由路径 */
  route: string;
  /** 当前状态 */
  status: ToolStatus;
  /** 强调色 */
  accentColor: ToolAccentColor;
  /** 懒加载页面组件（仅 available/beta 工具需要） */
  component?: ComponentType;
}
