import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
  ReferenceLine,
} from 'recharts';
import { motion } from 'framer-motion';
import type { EmotionPoint, PleasurePoint, EmotionType } from '@/types/rating-advanced.ts';

interface EmotionCurveProps {
  emotionCurve: EmotionPoint[];
  pleasurePoints?: PleasurePoint[];
  overallArc?: string;
  emotionTags?: string[];
}

// 情绪类型配置
const EMOTION_CONFIG: Record<EmotionType, { color: string; label: string }> = {
  tension: { color: '#ef4444', label: '紧张' },
  relief: { color: '#22c55e', label: '舒缓' },
  climax: { color: '#f59e0b', label: '高潮' },
  resolution: { color: '#3b82f6', label: '解决' },
  hook: { color: '#8b5cf6', label: '钩子' },
  twist: { color: '#ec4899', label: '反转' },
  tearjerker: { color: '#06b6d4', label: '催泪' },
  comedy: { color: '#84cc16', label: '搞笑' },
  romance: { color: '#f472b6', label: '浪漫' },
};

// 爽点类型标签
const PLEASURE_LABELS: Record<string, string> = {
  reversal: '反转',
  faceslap: '打脸',
  revenge: '复仇',
  revelation: '揭秘',
  reunion: '重逢',
  sacrifice: '牺牲',
};

// 自定义 Tooltip
function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: EmotionPoint }> }) {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;
  const config = EMOTION_CONFIG[data.emotion] || { color: '#6366f1', label: data.emotion };

  return (
    <div className="bg-white/95 backdrop-blur-sm shadow-lg rounded-lg p-3 border border-gray-100 max-w-xs">
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: config.color }}
        />
        <span className="font-semibold text-gray-800">{config.label}</span>
        <span className="text-gray-400">@ {data.position}%</span>
      </div>
      <p className="text-sm text-gray-600 mb-1">
        <span className="font-medium">强度：</span>
        {data.intensity}/10
      </p>
      <p className="text-sm text-gray-600 mb-1">
        <span className="font-medium">事件：</span>
        {data.event}
      </p>
      {data.description && (
        <p className="text-xs text-gray-500 mt-1 border-t pt-1">
          {data.description}
        </p>
      )}
      {data.isPeak && (
        <div className="mt-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full inline-block">
          ⭐ 峰值点
        </div>
      )}
    </div>
  );
}

export function EmotionCurve({
  emotionCurve,
  pleasurePoints = [],
  overallArc,
  emotionTags = [],
}: EmotionCurveProps) {
  // 处理数据，确保有默认值
  const chartData = emotionCurve.length > 0
    ? emotionCurve.map((point) => ({
        ...point,
        color: EMOTION_CONFIG[point.emotion]?.color || '#6366f1',
      }))
    : [];

  // 找出峰值点
  const peakPoints = chartData.filter((p) => p.isPeak);

  // 找出爽点位置
  const pleasureMarkers = pleasurePoints.map((p) => ({
    position: p.position,
    power: p.power,
    type: p.type,
    label: PLEASURE_LABELS[p.type] || p.type,
  }));

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">💫</span>
          情绪曲线
        </h3>
        <div className="h-64 flex items-center justify-center text-gray-400">
          暂无情绪曲线数据
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
    >
      {/* 标题 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <span className="text-xl">💫</span>
          情绪曲线
        </h3>

        {/* 情感标签 */}
        {emotionTags.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {emotionTags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 整体走势描述 */}
      {overallArc && (
        <p className="text-sm text-gray-500 mb-4 px-2 py-2 bg-gray-50 rounded-lg">
          📈 {overallArc}
        </p>
      )}

      {/* 图表 */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="emotionGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

            <XAxis
              dataKey="position"
              stroke="#9ca3af"
              fontSize={12}
              tickFormatter={(v) => `${v}%`}
              domain={[0, 100]}
            />

            <YAxis
              stroke="#9ca3af"
              fontSize={12}
              domain={[0, 10]}
              ticks={[0, 2, 4, 6, 8, 10]}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* 三幕分界线 */}
            <ReferenceLine
              x={25}
              stroke="#cbd5e1"
              strokeDasharray="3 3"
              label={{ value: '第一幕', position: 'top', fontSize: 10, fill: '#94a3b8' }}
            />
            <ReferenceLine
              x={75}
              stroke="#cbd5e1"
              strokeDasharray="3 3"
              label={{ value: '第三幕', position: 'top', fontSize: 10, fill: '#94a3b8' }}
            />

            {/* 情绪曲线 */}
            <Area
              type="monotone"
              dataKey="intensity"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#emotionGradient)"
              dot={(props) => {
                const { cx, cy, payload } = props;
                const config = EMOTION_CONFIG[payload.emotion as EmotionType];
                return (
                  <circle
                    key={`dot-${payload.position}`}
                    cx={cx}
                    cy={cy}
                    r={payload.isPeak ? 6 : 4}
                    fill={config?.color || '#6366f1'}
                    stroke="white"
                    strokeWidth={2}
                  />
                );
              }}
            />

            {/* 峰值点标记 */}
            {peakPoints.map((point) => (
              <ReferenceDot
                key={`peak-${point.position}`}
                x={point.position}
                y={point.intensity}
                r={8}
                fill="#f59e0b"
                stroke="white"
                strokeWidth={2}
              />
            ))}

            {/* 爽点标记 */}
            {pleasureMarkers.map((marker) => (
              <ReferenceLine
                key={`pleasure-${marker.position}`}
                x={marker.position}
                stroke="#ec4899"
                strokeDasharray="5 5"
                label={{
                  value: `💥 ${marker.label}`,
                  position: 'bottom',
                  fontSize: 10,
                  fill: '#ec4899',
                }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 图例 */}
      <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-100">
        {Object.entries(EMOTION_CONFIG).slice(0, 6).map(([key, config]) => (
          <div key={key} className="flex items-center gap-1.5 text-xs text-gray-500">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: config.color }}
            />
            {config.label}
          </div>
        ))}
      </div>

      {/* 爽点统计 */}
      {pleasurePoints.length > 0 && (
        <div className="mt-4 p-4 bg-pink-50 rounded-xl">
          <h4 className="text-sm font-semibold text-pink-700 mb-3">
            💥 爽点分布 ({pleasurePoints.length}个)
          </h4>
          <div className="space-y-3">
            {pleasurePoints.map((point, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-3 shadow-sm border border-pink-100"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-pink-500 text-white text-xs rounded font-medium">
                      {PLEASURE_LABELS[point.type] || point.type}
                    </span>
                    <span className="text-sm text-gray-500">
                      @ 剧本 {point.position}% 处
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-pink-600 font-bold">{point.power}</span>
                    <span className="text-pink-400 text-xs">/10 爽感</span>
                  </div>
                </div>
                {point.description && (
                  <p className="text-sm text-gray-600 mb-2">{point.description}</p>
                )}
                {point.technique && (
                  <p className="text-xs text-pink-500 flex items-center gap-1">
                    <span>✨</span>
                    <span>技法：{point.technique}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 关键情绪节点详情 */}
      {peakPoints.length > 0 && (
        <div className="mt-4 p-4 bg-amber-50 rounded-xl">
          <h4 className="text-sm font-semibold text-amber-700 mb-3">
            ⭐ 情绪峰值点 ({peakPoints.length}个)
          </h4>
          <div className="space-y-3">
            {peakPoints.map((point, index) => {
              const config = EMOTION_CONFIG[point.emotion] || { color: '#6366f1', label: point.emotion };
              return (
                <div
                  key={index}
                  className="bg-white rounded-lg p-3 shadow-sm border border-amber-100"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: config.color }}
                      />
                      <span className="font-medium text-gray-800">{config.label}</span>
                      <span className="text-sm text-gray-500">
                        @ 剧本 {point.position}% 处
                      </span>
                    </div>
                    <span className="text-amber-600 font-bold">强度 {point.intensity}/10</span>
                  </div>
                  {point.event && (
                    <div className="text-sm text-gray-600 mb-1">
                      <span className="text-gray-400">📍 事件：</span>
                      {point.event}
                    </div>
                  )}
                  {point.description && (
                    <p className="text-sm text-gray-500 italic border-l-2 border-amber-300 pl-2 mt-2">
                      {point.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 情绪节点时间线 */}
      <div className="mt-4 p-4 bg-gray-50 rounded-xl">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">
          📊 情绪节点时间线
        </h4>
        <div className="relative">
          {/* 时间轴 */}
          <div className="absolute top-3 left-0 right-0 h-0.5 bg-gray-200" />

          <div className="flex justify-between relative">
            {chartData.slice(0, 8).map((point, index) => {
              const config = EMOTION_CONFIG[point.emotion] || { color: '#6366f1', label: point.emotion };
              return (
                <div
                  key={index}
                  className="flex flex-col items-center"
                  style={{ width: `${100 / Math.min(chartData.length, 8)}%` }}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold z-10 ${
                      point.isPeak ? 'ring-2 ring-amber-400 ring-offset-2' : ''
                    }`}
                    style={{ backgroundColor: config.color }}
                  >
                    {point.intensity}
                  </div>
                  <div className="mt-2 text-center">
                    <div className="text-xs text-gray-500">{point.position}%</div>
                    <div className="text-xs font-medium text-gray-700">{config.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {chartData.length > 8 && (
          <p className="text-xs text-gray-400 text-center mt-3">
            显示前8个节点，共 {chartData.length} 个情绪节点
          </p>
        )}
      </div>
    </motion.div>
  );
}

export default EmotionCurve;
