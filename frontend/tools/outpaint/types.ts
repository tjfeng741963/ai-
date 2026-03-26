/** 九宫格锚点位置 */
export type AnchorPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'center-left'
  | 'center'
  | 'center-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

/** 预设比例定义 */
export interface PresetRatio {
  label: string;
  value: string;
  w: number;
  h: number;
  description: string;
}

/** 扩图任务状态 */
export type OutpaintTaskStatus = 'uploading' | 'processing' | 'completed' | 'failed';

// ==================== Provider / Model 类型 ====================

/** 模型参数选项 */
export interface ParamOption {
  value: string;
  label: string;
}

/** 模型参数定义 */
export interface ParamDef {
  type: 'select' | 'toggle';
  label: string;
  options?: ParamOption[];
  default: string | boolean;
}

/** 扩图 Provider */
export interface OutpaintProvider {
  id: string;
  name: string;
  description: string;
  modelCount: number;
  default?: boolean;
}

/** 扩图模型 */
export interface OutpaintModel {
  id: string;
  label: string;
  description: string;
  params: Record<string, ParamDef>;
}

// ==================== 结果 & 请求 ====================

/** 单个扩图结果 */
export interface OutpaintResult {
  id: string;
  taskId: string;
  status: OutpaintTaskStatus;
  progress: number;
  resultUrl?: string;
  error?: string;
  createdAt: number;
  /** 生成时的参数快照 */
  params: {
    sourcePreview: string;
    targetRatio: string;
    targetWidth: number;
    targetHeight: number;
    anchor: AnchorPosition;
    prompt: string;
    provider: string;
    model: string;
    quality: string;
  };
}

/** 提交扩图的参数 */
export interface OutpaintRequestParams {
  /** 原图 OSS URL */
  image: string;
  /** 目标画布宽度 (px) */
  targetWidth: number;
  /** 目标画布高度 (px) */
  targetHeight: number;
  /** 原图在画布中的 X 位置比例 (0.0-1.0) */
  positionX: number;
  /** 原图在画布中的 Y 位置比例 (0.0-1.0) */
  positionY: number;
  /** 生成引导提示词 */
  prompt?: string;
  /** 生成数量 (1-4) */
  numResults?: number;
  /** AI provider */
  provider?: string;
  /** 模型 ID */
  model?: string;
  /** 画质 */
  quality?: string;
}

/** 原始图片信息 */
export interface SourceImageInfo {
  file: File;
  preview: string;
  dataUrl: string;
  width: number;
  height: number;
}

/** 预设比例列表 */
export const PRESET_RATIOS: readonly PresetRatio[] = [
  { label: '16:9', value: '16:9', w: 16, h: 9, description: '横版宽屏' },
  { label: '9:16', value: '9:16', w: 9, h: 16, description: '竖版全屏' },
  { label: '1:1', value: '1:1', w: 1, h: 1, description: '正方形' },
  { label: '4:3', value: '4:3', w: 4, h: 3, description: '传统横版' },
  { label: '3:4', value: '3:4', w: 3, h: 4, description: '传统竖版' },
  { label: '3:2', value: '3:2', w: 3, h: 2, description: '单反横版' },
  { label: '2:3', value: '2:3', w: 2, h: 3, description: '竖版打印' },
  { label: '4:5', value: '4:5', w: 4, h: 5, description: 'Instagram' },
  { label: '21:9', value: '21:9', w: 21, h: 9, description: '电影宽银幕' },
] as const;

/**
 * 根据原图尺寸和目标比例计算目标画布大小
 * 保证：目标画布 >= 原图尺寸，且符合目标比例
 */
export function calcTargetDimensions(
  origW: number,
  origH: number,
  ratioW: number,
  ratioH: number,
): { width: number; height: number } {
  const origAspect = origW / origH;
  const targetAspect = ratioW / ratioH;

  let width: number;
  let height: number;

  if (origAspect > targetAspect) {
    // 原图更宽 → 需要扩展高度
    width = origW;
    height = Math.ceil(origW * ratioH / ratioW);
  } else {
    // 原图更高 → 需要扩展宽度
    height = origH;
    width = Math.ceil(origH * ratioW / ratioH);
  }

  return { width, height };
}

/**
 * 根据锚点位置计算原图在目标画布中的坐标 (0.0-1.0)
 */
export function anchorToPosition(
  anchor: AnchorPosition,
): { x: number; y: number } {
  const map: Record<AnchorPosition, { x: number; y: number }> = {
    'top-left': { x: 0, y: 0 },
    'top-center': { x: 0.5, y: 0 },
    'top-right': { x: 1, y: 0 },
    'center-left': { x: 0, y: 0.5 },
    'center': { x: 0.5, y: 0.5 },
    'center-right': { x: 1, y: 0.5 },
    'bottom-left': { x: 0, y: 1 },
    'bottom-center': { x: 0.5, y: 1 },
    'bottom-right': { x: 1, y: 1 },
  };
  return map[anchor];
}
