import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts';
import { motion } from 'framer-motion';
import {
  Layers, Zap, RefreshCw, TrendingUp, Target, Flame, Sparkles, Check,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ActBreakdown, TurningPoint, Suspense } from '../types/rating-advanced';

interface StructureAnalysisProps {
  actStructure: ActBreakdown[];
  turningPoints: TurningPoint[];
  suspenses?: Suspense[];
  foreshadowRecoveryRate?: number;
  structureType?: string;
  hookPositions?: number[];
  cliffhangerCount?: number;
}

// 幕结构颜色
const ACT_COLORS = ['#6366f1', '#8b5cf6', '#a855f7'];

// 转折点类型配置 — Lucide SVG 替代 emoji
const TURNING_POINT_CONFIG: Record<string, { label: string; color: string; Icon: LucideIcon }> = {
  inciting_incident: { label: '激励事件', color: '#f59e0b', Icon: Zap },
  first_plot_point:  { label: '第一转折', color: '#3b82f6', Icon: RefreshCw },
  midpoint:          { label: '中点',     color: '#8b5cf6', Icon: TrendingUp },
  second_plot_point: { label: '第二转折', color: '#ef4444', Icon: Target },
  climax:            { label: '高潮',     color: '#f97316', Icon: Flame },
  resolution:        { label: '结局',     color: '#22c55e', Icon: Sparkles },
};

// 节奏配置
const PACING_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  fast:   { label: '快节奏', color: '#ef4444', bg: 'bg-red-50' },
  medium: { label: '中节奏', color: '#f59e0b', bg: 'bg-amber-50' },
  slow:   { label: '慢节奏', color: '#3b82f6', bg: 'bg-blue-50' },
};

export function StructureAnalysis({
  actStructure,
  turningPoints,
  suspenses = [],
  foreshadowRecoveryRate,
  structureType,
  hookPositions = [],
  cliffhangerCount,
}: StructureAnalysisProps) {
  if (actStructure.length === 0) {
    return (
      <div className="bg-card rounded-2xl shadow-card p-6 border border-border">
        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-primary" />
          结构分析
        </h3>
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          暂无结构分析数据
        </div>
      </div>
    );
  }

  // 准备图表数据
  const chartData = actStructure.map((act, index) => ({
    name: act.name || `第${act.act}幕`,
    percentage: act.percentage,
    sceneCount: act.sceneCount,
    quality: act.quality,
    pacing: act.pacing,
    fill: ACT_COLORS[index % ACT_COLORS.length],
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl shadow-card p-6 border border-border
                 transition-shadow duration-200 hover:shadow-card-hover"
    >
      {/* ── 标题 ── */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Layers className="w-5 h-5 text-primary" />
          结构分析
        </h3>
        {structureType && (
          <span className="px-3 py-1 bg-primary-50 text-primary-600 text-xs font-medium rounded-full">
            {structureType}
          </span>
        )}
      </div>

      {/* ── 三幕结构占比 ── */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-muted-foreground mb-3">三幕结构占比</h4>

        {/* 横向堆叠条 */}
        <div className="h-12 flex rounded-xl overflow-hidden shadow-inner">
          {actStructure.map((act, index) => (
            <motion.div
              key={act.act}
              initial={{ width: 0 }}
              animate={{ width: `${act.percentage}%` }}
              transition={{ delay: index * 0.2, duration: 0.5 }}
              className="relative flex items-center justify-center text-white font-semibold text-sm cursor-default"
              style={{ backgroundColor: ACT_COLORS[index % ACT_COLORS.length] }}
            >
              <span className="drop-shadow-md">
                {act.name || `第${act.act}幕`}
              </span>
              <span className="absolute bottom-0.5 text-xs opacity-75">
                {act.percentage}%
              </span>
            </motion.div>
          ))}
        </div>

        {/* 转折点标记 */}
        <div className="relative h-8 mt-2">
          {turningPoints.map((point, index) => {
            const config = TURNING_POINT_CONFIG[point.type];
            const PointIcon = config?.Icon || Zap;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="absolute transform -translate-x-1/2"
                style={{ left: `${point.position}%` }}
              >
                <div className="flex flex-col items-center">
                  <div
                    className="w-0 h-0 border-l-4 border-r-4 border-t-[6px]"
                    style={{
                      borderColor: `${config?.color || '#94a3b8'} transparent transparent transparent`,
                    }}
                  />
                  <span className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-0.5">
                    <PointIcon size={10} style={{ color: config?.color }} />
                    {config?.label || point.type}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── 幕详情卡片 ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {actStructure.map((act, index) => {
          const pacingConfig = PACING_CONFIG[act.pacing] || PACING_CONFIG.medium;

          return (
            <motion.div
              key={act.act}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="p-4 rounded-xl border border-border/60 transition-shadow duration-200
                         hover:shadow-card"
              style={{ backgroundColor: `${ACT_COLORS[index]}08` }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm" style={{ color: ACT_COLORS[index] }}>
                  {act.name || `第${act.act}幕`}
                </span>
                <span
                  className={`px-1.5 py-0.5 text-xs rounded-md font-medium ${pacingConfig.bg}`}
                  style={{ color: pacingConfig.color }}
                >
                  {pacingConfig.label}
                </span>
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>场景数</span>
                  <span className="font-medium text-foreground">{act.sceneCount}场</span>
                </div>
                <div className="flex justify-between">
                  <span>占比</span>
                  <span className="font-medium text-foreground">{act.percentage}%</span>
                </div>
              </div>

              {act.keyEvents?.length > 0 && (
                <div className="mt-3 pt-2 border-t border-border/40">
                  <div className="text-xs text-muted-foreground mb-1">关键事件</div>
                  <ul className="text-xs text-foreground/70 space-y-0.5">
                    {act.keyEvents.slice(0, 2).map((event, i) => (
                      <li key={i} className="truncate flex items-start gap-1">
                        <span className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0"
                              style={{ backgroundColor: ACT_COLORS[index] }} />
                        {event}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {act.quality && (
                <div className="mt-2 text-xs text-foreground/50 italic leading-relaxed">
                  "{act.quality}"
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* ── 悬念追踪 ── */}
      {suspenses.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-muted-foreground mb-3">悬念设置与回收</h4>
          <div className="space-y-2">
            {suspenses.map((suspense) => (
              <div
                key={suspense.id}
                className={`flex items-center gap-3 p-2.5 rounded-lg text-sm border
                  ${suspense.type === 'main'
                    ? 'bg-primary-50/50 border-primary-100'
                    : 'bg-muted/50 border-border/50'
                  }`}
              >
                <span className={`px-2 py-0.5 text-xs rounded-full font-medium
                  ${suspense.type === 'main'
                    ? 'bg-primary-200 text-primary-700'
                    : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {suspense.type === 'main' ? '主' : '次'}
                </span>

                <span className="flex-1 text-foreground/80">{suspense.question}</span>

                <span className="text-xs text-muted-foreground">
                  @{suspense.setupPosition}%
                </span>

                {suspense.isResolved ? (
                  <span className="text-green-600 text-xs flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    回收 @{suspense.resolvePosition}%
                  </span>
                ) : (
                  <span className="text-amber-500 text-xs font-medium">未回收</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 统计信息 ── */}
      {(foreshadowRecoveryRate !== undefined || hookPositions.length > 0 || cliffhangerCount !== undefined) && (
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border">
          {foreshadowRecoveryRate !== undefined && (
            <div className="text-center p-3 bg-green-50/60 rounded-xl border border-green-100">
              <div className="text-2xl font-bold text-green-600">
                {foreshadowRecoveryRate}%
              </div>
              <div className="text-xs text-green-600/70 mt-0.5">伏笔回收率</div>
            </div>
          )}

          {hookPositions.length > 0 && (
            <div className="text-center p-3 bg-primary-50/60 rounded-xl border border-primary-100">
              <div className="text-2xl font-bold text-primary">
                {hookPositions.length}
              </div>
              <div className="text-xs text-primary/70 mt-0.5">钩子数量</div>
            </div>
          )}

          {cliffhangerCount !== undefined && (
            <div className="text-center p-3 bg-amber-50/60 rounded-xl border border-amber-100">
              <div className="text-2xl font-bold text-amber-600">
                {cliffhangerCount}
              </div>
              <div className="text-xs text-amber-600/70 mt-0.5">悬崖钩子</div>
            </div>
          )}
        </div>
      )}

      {/* ── 转折点图例 ── */}
      <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-border">
        {Object.entries(TURNING_POINT_CONFIG).map(([key, config]) => {
          const LegendIcon = config.Icon;
          return (
            <div key={key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <LegendIcon size={12} style={{ color: config.color }} />
              <span style={{ color: config.color }}>{config.label}</span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default StructureAnalysis;
