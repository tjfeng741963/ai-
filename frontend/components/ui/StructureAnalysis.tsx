import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import { motion } from 'framer-motion';
import type { ActBreakdown, TurningPoint, Suspense } from '@/types/rating-advanced.ts';

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

// 转折点类型配置
const TURNING_POINT_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  inciting_incident: { label: '激励事件', color: '#f59e0b', icon: '⚡' },
  first_plot_point: { label: '第一转折', color: '#3b82f6', icon: '🔄' },
  midpoint: { label: '中点', color: '#8b5cf6', icon: '⬆️' },
  second_plot_point: { label: '第二转折', color: '#ef4444', icon: '💥' },
  climax: { label: '高潮', color: '#f97316', icon: '🔥' },
  resolution: { label: '结局', color: '#22c55e', icon: '✨' },
};

// 节奏配置
const PACING_CONFIG = {
  fast: { label: '快节奏', color: '#ef4444', bg: 'bg-red-50' },
  medium: { label: '中节奏', color: '#f59e0b', bg: 'bg-yellow-50' },
  slow: { label: '慢节奏', color: '#3b82f6', bg: 'bg-blue-50' },
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
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">📐</span>
          结构分析
        </h3>
        <div className="h-64 flex items-center justify-center text-gray-400">
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

  // 计算累计百分比（用于转折点定位）
  const cumulativePercentages = actStructure.reduce<number[]>((acc, act, i) => {
    const prev = i > 0 ? acc[i - 1] : 0;
    acc.push(prev + act.percentage);
    return acc;
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
    >
      {/* 标题 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <span className="text-xl">📐</span>
          结构分析
        </h3>

        {structureType && (
          <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-xs rounded-full">
            {structureType}
          </span>
        )}
      </div>

      {/* 三幕结构占比图 */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-600 mb-3">三幕结构占比</h4>

        {/* 横向堆叠条 */}
        <div className="h-12 flex rounded-lg overflow-hidden shadow-inner">
          {actStructure.map((act, index) => (
            <motion.div
              key={act.act}
              initial={{ width: 0 }}
              animate={{ width: `${act.percentage}%` }}
              transition={{ delay: index * 0.2, duration: 0.5 }}
              className="relative flex items-center justify-center text-white font-semibold text-sm"
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
          {turningPoints.map((point, index) => (
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
                  className="w-0 h-0 border-l-4 border-r-4 border-t-6"
                  style={{
                    borderColor: `${TURNING_POINT_CONFIG[point.type]?.color || '#94a3b8'} transparent transparent transparent`,
                  }}
                />
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {TURNING_POINT_CONFIG[point.type]?.icon}{' '}
                  {TURNING_POINT_CONFIG[point.type]?.label || point.type}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 幕详情卡片 */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {actStructure.map((act, index) => {
          const pacingConfig = PACING_CONFIG[act.pacing] || PACING_CONFIG.medium;

          return (
            <motion.div
              key={act.act}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="p-3 rounded-xl border border-gray-100"
              style={{ backgroundColor: `${ACT_COLORS[index]}10` }}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className="font-semibold"
                  style={{ color: ACT_COLORS[index] }}
                >
                  {act.name || `第${act.act}幕`}
                </span>
                <span
                  className={`px-1.5 py-0.5 text-xs rounded ${pacingConfig.bg}`}
                  style={{ color: pacingConfig.color }}
                >
                  {pacingConfig.label}
                </span>
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                <div>场景数：{act.sceneCount}场</div>
                <div>占比：{act.percentage}%</div>
              </div>

              {act.keyEvents?.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <div className="text-xs text-gray-400 mb-1">关键事件：</div>
                  <ul className="text-xs text-gray-600 space-y-0.5">
                    {act.keyEvents.slice(0, 2).map((event, i) => (
                      <li key={i} className="truncate">• {event}</li>
                    ))}
                  </ul>
                </div>
              )}

              {act.quality && (
                <div className="mt-2 text-xs text-gray-600 italic">
                  "{act.quality}"
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* 悬念追踪 */}
      {suspenses.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-600 mb-3">悬念设置与回收</h4>
          <div className="space-y-2">
            {suspenses.map((suspense) => (
              <div
                key={suspense.id}
                className={`
                  flex items-center gap-3 p-2 rounded-lg text-sm
                  ${suspense.type === 'main' ? 'bg-purple-50' : 'bg-gray-50'}
                `}
              >
                <span
                  className={`
                    px-2 py-0.5 text-xs rounded-full
                    ${suspense.type === 'main' ? 'bg-purple-200 text-purple-700' : 'bg-gray-200 text-gray-600'}
                  `}
                >
                  {suspense.type === 'main' ? '主' : '次'}
                </span>

                <span className="flex-1 text-gray-700">{suspense.question}</span>

                <span className="text-xs text-gray-500">
                  @{suspense.setupPosition}%
                </span>

                {suspense.isResolved ? (
                  <span className="text-green-500 text-xs flex items-center gap-1">
                    ✓ 回收 @{suspense.resolvePosition}%
                  </span>
                ) : (
                  <span className="text-amber-500 text-xs">未回收</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 统计信息 */}
      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
        {/* 伏笔回收率 */}
        {foreshadowRecoveryRate !== undefined && (
          <div className="text-center p-3 bg-green-50 rounded-xl">
            <div className="text-2xl font-bold text-green-600">
              {foreshadowRecoveryRate}%
            </div>
            <div className="text-xs text-green-500">伏笔回收率</div>
          </div>
        )}

        {/* 钩子数量 */}
        {hookPositions.length > 0 && (
          <div className="text-center p-3 bg-purple-50 rounded-xl">
            <div className="text-2xl font-bold text-purple-600">
              {hookPositions.length}
            </div>
            <div className="text-xs text-purple-500">钩子数量</div>
          </div>
        )}

        {/* 悬崖钩子 */}
        {cliffhangerCount !== undefined && (
          <div className="text-center p-3 bg-amber-50 rounded-xl">
            <div className="text-2xl font-bold text-amber-600">
              {cliffhangerCount}
            </div>
            <div className="text-xs text-amber-500">悬崖钩子</div>
          </div>
        )}
      </div>

      {/* 图例 */}
      <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-100">
        {Object.entries(TURNING_POINT_CONFIG).map(([key, config]) => (
          <div key={key} className="flex items-center gap-1.5 text-xs text-gray-500">
            <span>{config.icon}</span>
            <span style={{ color: config.color }}>{config.label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default StructureAnalysis;
