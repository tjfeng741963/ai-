import { useState } from 'react';
import { Lock, Unlock } from 'lucide-react';
import { PRESET_RATIOS } from '../types';
import type { PresetRatio } from '../types';

interface RatioSelectorProps {
  selectedRatio: string;
  customWidth: number;
  customHeight: number;
  onRatioChange: (ratio: string) => void;
  onCustomSizeChange: (w: number, h: number) => void;
  disabled?: boolean;
}

export function RatioSelector({
  selectedRatio,
  customWidth,
  customHeight,
  onRatioChange,
  onCustomSizeChange,
  disabled,
}: RatioSelectorProps) {
  const [lockAspect, setLockAspect] = useState(false);
  const isCustom = selectedRatio === 'custom';

  const handlePresetClick = (ratio: PresetRatio) => {
    onRatioChange(ratio.value);
  };

  const handleCustomClick = () => {
    onRatioChange('custom');
  };

  const handleWidthChange = (value: string) => {
    const w = Math.max(64, Math.min(8192, parseInt(value, 10) || 0));
    if (lockAspect && customWidth > 0) {
      const aspect = customHeight / customWidth;
      onCustomSizeChange(w, Math.round(w * aspect));
    } else {
      onCustomSizeChange(w, customHeight);
    }
  };

  const handleHeightChange = (value: string) => {
    const h = Math.max(64, Math.min(8192, parseInt(value, 10) || 0));
    if (lockAspect && customHeight > 0) {
      const aspect = customWidth / customHeight;
      onCustomSizeChange(Math.round(h * aspect), h);
    } else {
      onCustomSizeChange(customWidth, h);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-[11px] font-bold uppercase tracking-wider text-cm-on-surface-variant">
        目标比例
      </label>

      {/* 预设比例网格 */}
      <div className="grid grid-cols-3 gap-1.5">
        {PRESET_RATIOS.map((ratio) => (
          <button
            key={ratio.value}
            onClick={() => handlePresetClick(ratio)}
            disabled={disabled}
            className={`group relative px-2 py-2 rounded-lg text-center transition-all duration-300 ${
              selectedRatio === ratio.value
                ? 'bg-cm-secondary/15 border border-cm-secondary/40 text-cm-secondary'
                : 'bg-cm-surface-high/50 border border-cm-outline-variant/10 text-cm-on-surface-variant hover:border-cm-secondary/20 hover:text-cm-on-surface'
            } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
          >
            {/* 比例缩略图 */}
            <div className="flex justify-center mb-1">
              <div
                className={`border transition-colors ${
                  selectedRatio === ratio.value
                    ? 'border-cm-secondary/60'
                    : 'border-cm-on-surface-variant/30 group-hover:border-cm-on-surface-variant/50'
                }`}
                style={{
                  width: `${Math.min(24, 24 * (ratio.w / Math.max(ratio.w, ratio.h)))}px`,
                  height: `${Math.min(24, 24 * (ratio.h / Math.max(ratio.w, ratio.h)))}px`,
                }}
              />
            </div>
            <div className="text-[11px] font-bold font-headline">{ratio.label}</div>
            <div className="text-[9px] opacity-60">{ratio.description}</div>
          </button>
        ))}
      </div>

      {/* 自定义尺寸 */}
      <button
        onClick={handleCustomClick}
        disabled={disabled}
        className={`w-full px-3 py-2 rounded-lg text-center text-[11px] font-bold transition-all duration-300 ${
          isCustom
            ? 'bg-cm-secondary/15 border border-cm-secondary/40 text-cm-secondary'
            : 'bg-cm-surface-high/50 border border-cm-outline-variant/10 text-cm-on-surface-variant hover:border-cm-secondary/20'
        } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
      >
        自定义尺寸
      </button>

      {isCustom && (
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={customWidth || ''}
            onChange={(e) => handleWidthChange(e.target.value)}
            placeholder="宽"
            disabled={disabled}
            className="flex-1 px-3 py-2 rounded-lg bg-cm-surface-high/50 border border-cm-outline-variant/15 text-sm text-cm-on-surface placeholder:text-cm-on-surface-variant/40 outline-none focus:border-cm-secondary/40 font-mono"
          />
          <button
            onClick={() => setLockAspect(!lockAspect)}
            className={`p-2 rounded-lg transition-colors ${
              lockAspect
                ? 'bg-cm-secondary/15 text-cm-secondary'
                : 'bg-cm-surface-high/50 text-cm-on-surface-variant/40 hover:text-cm-on-surface-variant'
            }`}
          >
            {lockAspect ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          </button>
          <input
            type="number"
            value={customHeight || ''}
            onChange={(e) => handleHeightChange(e.target.value)}
            placeholder="高"
            disabled={disabled}
            className="flex-1 px-3 py-2 rounded-lg bg-cm-surface-high/50 border border-cm-outline-variant/15 text-sm text-cm-on-surface placeholder:text-cm-on-surface-variant/40 outline-none focus:border-cm-secondary/40 font-mono"
          />
        </div>
      )}
    </div>
  );
}
