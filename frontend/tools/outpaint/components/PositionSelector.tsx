import { useMemo } from 'react';
import type { AnchorPosition } from '../types';

interface PositionSelectorProps {
  anchor: AnchorPosition;
  onChange: (anchor: AnchorPosition) => void;
  disabled?: boolean;
  /** 水平方向是否可移动（目标宽度 > 原图宽度） */
  canMoveX?: boolean;
  /** 垂直方向是否可移动（目标高度 > 原图高度） */
  canMoveY?: boolean;
}

const GRID: AnchorPosition[][] = [
  ['top-left', 'top-center', 'top-right'],
  ['center-left', 'center', 'center-right'],
  ['bottom-left', 'bottom-center', 'bottom-right'],
];

const LABELS: Record<AnchorPosition, string> = {
  'top-left': '左上',
  'top-center': '上',
  'top-right': '右上',
  'center-left': '左',
  'center': '居中',
  'center-right': '右',
  'bottom-left': '左下',
  'bottom-center': '下',
  'bottom-right': '右下',
};

/**
 * 判断某个锚点在当前扩展轴下是否有效（即与其他位置不等效）
 *
 * 规则：
 * - canMoveX=false → 同一行的3个位置等效，只保留 center 列
 * - canMoveY=false → 同一列的3个位置等效，只保留 center 行
 */
function isPositionEffective(
  pos: AnchorPosition,
  canMoveX: boolean,
  canMoveY: boolean,
): boolean {
  const [rowPart, colPart] = splitAnchor(pos);

  // 如果水平不可移动，只有 center 列有效
  if (!canMoveX && colPart !== 'center') return false;
  // 如果垂直不可移动，只有 center 行有效
  if (!canMoveY && rowPart !== 'center') return false;

  return true;
}

/** 将 AnchorPosition 拆成行/列部分 */
function splitAnchor(pos: AnchorPosition): [string, string] {
  if (pos === 'center') return ['center', 'center'];
  const parts = pos.split('-');
  // e.g. 'top-left' → ['top', 'left'], 'center-left' → ['center', 'left']
  return [parts[0], parts[1]];
}

export function PositionSelector({
  anchor,
  onChange,
  disabled,
  canMoveX = true,
  canMoveY = true,
}: PositionSelectorProps) {
  // 当前选中位置是否有效（如果无效，自动提示）
  const currentEffective = useMemo(
    () => isPositionEffective(anchor, canMoveX, canMoveY),
    [anchor, canMoveX, canMoveY],
  );

  // 提示文本
  const hint = useMemo(() => {
    if (!canMoveX && !canMoveY) return '当前比例无需扩展，位置无影响';
    if (!canMoveX) return '仅扩展高度 — 只能上下调整位置';
    if (!canMoveY) return '仅扩展宽度 — 只能左右调整位置';
    return '选择原图在目标画布中的锚定位置';
  }, [canMoveX, canMoveY]);

  return (
    <div className="space-y-3">
      <label className="block text-[11px] font-bold uppercase tracking-wider text-cm-on-surface-variant">
        原图位置
      </label>

      <div
        className={`inline-grid grid-cols-3 gap-1 p-1.5 rounded-xl bg-cm-surface-high/30 border border-cm-outline-variant/10 ${
          disabled ? 'opacity-50 pointer-events-none' : ''
        }`}
      >
        {GRID.map((row) =>
          row.map((pos) => {
            const isActive = anchor === pos;
            const effective = isPositionEffective(pos, canMoveX, canMoveY);
            return (
              <button
                key={pos}
                onClick={() => onChange(pos)}
                disabled={disabled || !effective}
                title={effective ? LABELS[pos] : `${LABELS[pos]}（当前方向不可用）`}
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  !effective
                    ? 'opacity-20 cursor-not-allowed'
                    : isActive
                      ? 'bg-cm-primary/20 border border-cm-primary/40 shadow-sm shadow-cm-primary/10'
                      : 'bg-cm-surface-high/20 border border-transparent hover:bg-cm-surface-high/60 hover:border-cm-outline-variant/20'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    !effective
                      ? 'bg-cm-on-surface-variant/10'
                      : isActive
                        ? 'bg-cm-primary scale-125'
                        : 'bg-cm-on-surface-variant/30'
                  }`}
                />
              </button>
            );
          }),
        )}
      </div>

      <p className="text-[10px] text-cm-on-surface-variant/60">{hint}</p>
    </div>
  );
}
