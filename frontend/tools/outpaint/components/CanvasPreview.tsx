import { useMemo } from 'react';
import { Maximize2 } from 'lucide-react';
import type { AnchorPosition, SourceImageInfo } from '../types';
import { anchorToPosition } from '../types';

interface CanvasPreviewProps {
  source: SourceImageInfo;
  targetWidth: number;
  targetHeight: number;
  anchor: AnchorPosition;
}

/**
 * 画布预览：展示原图在目标画布中的位置
 * - 棋盘格背景 = 待生成区域
 * - 原图缩放到正确的比例位置
 */
export function CanvasPreview({
  source,
  targetWidth,
  targetHeight,
  anchor,
}: CanvasPreviewProps) {
  const layout = useMemo(() => {
    const { x: ax, y: ay } = anchorToPosition(anchor);

    // 原图占目标画布的比例
    const imgWPercent = (source.width / targetWidth) * 100;
    const imgHPercent = (source.height / targetHeight) * 100;

    // 原图在画布中可移动的范围（百分比）
    const maxLeftPercent = 100 - imgWPercent;
    const maxTopPercent = 100 - imgHPercent;

    // 根据锚点计算位置
    const leftPercent = ax * maxLeftPercent;
    const topPercent = ay * maxTopPercent;

    return { imgWPercent, imgHPercent, leftPercent, topPercent };
  }, [source, targetWidth, targetHeight, anchor]);

  // 计算扩展方向标注
  const expansionInfo = useMemo(() => {
    const dw = targetWidth - source.width;
    const dh = targetHeight - source.height;
    return {
      expanded: dw > 0 || dh > 0,
      deltaW: dw,
      deltaH: dh,
    };
  }, [source, targetWidth, targetHeight]);

  return (
    <div className="flex flex-col gap-3">
      {/* 尺寸信息 */}
      <div className="flex items-center justify-between text-[11px] text-cm-on-surface-variant font-label">
        <div className="flex items-center gap-1.5">
          <Maximize2 className="w-3.5 h-3.5" />
          <span>
            {source.width}×{source.height} → {targetWidth}×{targetHeight}
          </span>
        </div>
        {expansionInfo.expanded && (
          <span className="text-cm-secondary">
            +{expansionInfo.deltaW > 0 ? `${expansionInfo.deltaW}W` : ''}
            {expansionInfo.deltaW > 0 && expansionInfo.deltaH > 0 ? ' ' : ''}
            {expansionInfo.deltaH > 0 ? `+${expansionInfo.deltaH}H` : ''}
          </span>
        )}
      </div>

      {/* 画布预览区 */}
      <div className="relative w-full rounded-xl overflow-hidden border border-cm-outline-variant/20">
        {/* 保持目标画布的比例 */}
        <div
          className="relative w-full"
          style={{ paddingBottom: `${(targetHeight / targetWidth) * 100}%` }}
        >
          {/* 棋盘格背景（待扩展区域） */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(45deg, rgba(255,255,255,0.03) 25%, transparent 25%),
                linear-gradient(-45deg, rgba(255,255,255,0.03) 25%, transparent 25%),
                linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.03) 75%),
                linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.03) 75%)
              `,
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0',
              backgroundColor: 'rgba(0,0,0,0.3)',
            }}
          />

          {/* 扩展区域半透明遮罩 */}
          <div className="absolute inset-0 bg-cm-secondary/[0.03]" />

          {/* 原图 */}
          <div
            className="absolute overflow-hidden shadow-2xl transition-all duration-500 ease-out"
            style={{
              left: `${layout.leftPercent}%`,
              top: `${layout.topPercent}%`,
              width: `${layout.imgWPercent}%`,
              height: `${layout.imgHPercent}%`,
            }}
          >
            <img
              src={source.preview}
              alt="原图"
              className="w-full h-full object-cover"
              draggable={false}
            />
            {/* 原图边框 */}
            <div className="absolute inset-0 border-2 border-cm-primary/50 pointer-events-none" />
          </div>

          {/* 四角尺寸标签 */}
          <div className="absolute top-1.5 left-2 px-1.5 py-0.5 rounded bg-black/60 text-[9px] text-white/70 font-mono">
            {targetWidth}×{targetHeight}
          </div>
        </div>
      </div>

      {/* 无扩展提示 */}
      {!expansionInfo.expanded && (
        <p className="text-[11px] text-amber-400/80 text-center">
          当前比例无需扩展（原图已符合目标比例）
        </p>
      )}
    </div>
  );
}
