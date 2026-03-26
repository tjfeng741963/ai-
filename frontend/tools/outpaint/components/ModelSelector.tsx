/**
 * Model / 参数选择器
 *
 * 仅支持 official-stable 渠道，不显示渠道切换。
 * 选择模型和画质参数。
 */

import { useState, useEffect, useCallback } from 'react';
import { Loader2, ChevronDown } from 'lucide-react';

import { getOutpaintModels } from '../services/api';
import type { OutpaintModel, ParamDef } from '../types';

export interface ModelSelectionState {
  provider: string;
  model: string;
  quality: string;
}

interface ModelSelectorProps {
  value: ModelSelectionState;
  onChange: (state: ModelSelectionState) => void;
  disabled?: boolean;
}

export function ModelSelector({ value, onChange, disabled }: ModelSelectorProps) {
  const [models, setModels] = useState<OutpaintModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 固定使用 official-stable，加载其模型列表
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getOutpaintModels('official-stable')
      .then((data) => {
        if (cancelled) return;
        setModels(data);
        // 如果当前 model 不在列表中，选择第一个
        if (data.length > 0 && !data.find((m) => m.id === value.model)) {
          const first = data[0];
          const defaultQuality = getDefaultQuality(first);
          onChange({ ...value, model: first.id, quality: defaultQuality });
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleModelChange = useCallback(
    (modelId: string) => {
      const model = models.find((m) => m.id === modelId);
      const quality = model ? getDefaultQuality(model) : value.quality;
      onChange({ ...value, model: modelId, quality });
    },
    [value, onChange, models],
  );

  const handleQualityChange = useCallback(
    (quality: string) => {
      onChange({ ...value, quality });
    },
    [value, onChange],
  );

  const currentModel = models.find((m) => m.id === value.model);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4 text-cm-on-surface-variant/40">
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
        <span className="text-[11px]">加载模型配置...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-[11px] text-red-400/80 py-3 px-4 rounded-xl bg-red-500/5 border border-red-500/10">
        {error}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* Model 选择 */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-cm-on-surface-variant mb-2">
          模型
        </label>
        <div className="relative">
          <select
            value={value.model}
            onChange={(e) => handleModelChange(e.target.value)}
            className="w-full appearance-none px-3 py-2 pr-8 rounded-lg bg-cm-surface-high/50 border border-cm-outline-variant/15 text-[12px] text-cm-on-surface outline-none focus:border-cm-primary/40 transition-colors cursor-pointer"
          >
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-cm-on-surface-variant/50 pointer-events-none" />
        </div>
        {currentModel?.description && (
          <p className="text-[10px] text-cm-on-surface-variant/50 mt-1">
            {currentModel.description}
          </p>
        )}
      </div>

      {/* 模型参数 — 画质 */}
      {currentModel?.params?.quality && (
        <ParamSelect
          label={currentModel.params.quality.label}
          paramDef={currentModel.params.quality}
          value={value.quality}
          onChange={handleQualityChange}
        />
      )}
    </div>
  );
}

// ==================== 内部组件 ====================

function ParamSelect({
  label,
  paramDef,
  value,
  onChange,
}: {
  label: string;
  paramDef: ParamDef;
  value: string;
  onChange: (v: string) => void;
}) {
  if (paramDef.type !== 'select' || !paramDef.options) return null;

  return (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-wider text-cm-on-surface-variant mb-2">
        {label}
      </label>
      <div className="flex gap-1.5">
        {paramDef.options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex-1 py-1.5 rounded-lg text-[12px] font-bold transition-all duration-300 ${
              value === opt.value
                ? 'bg-cm-secondary/15 border border-cm-secondary/40 text-cm-secondary'
                : 'bg-cm-surface-high/50 border border-cm-outline-variant/10 text-cm-on-surface-variant hover:border-cm-secondary/20'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ==================== 工具函数 ====================

function getDefaultQuality(model: OutpaintModel): string {
  const qualityParam = model.params?.quality;
  if (!qualityParam) return '4K';
  return String(qualityParam.default || '4K');
}
