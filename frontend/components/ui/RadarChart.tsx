import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { DIMENSION_LABELS } from '@/types/rating.ts';
import type { DimensionScore } from '@/types/rating.ts';

interface RadarChartProps {
  dimensions: Record<string, DimensionScore>;
}

export function RadarChart({ dimensions }: RadarChartProps) {
  // 选择核心维度展示（避免太拥挤）
  const coreKeys = [
    'hookPower',
    'pleasurePoints',
    'pacingStructure',
    'characterization',
    'dialogueQuality',
    'conflictDesign',
    'viralPotential',
    'compliance',
  ];

  const data = coreKeys.map((key) => ({
    dimension: DIMENSION_LABELS[key] || key,
    score: dimensions[key]?.score || 0,
    fullMark: 10,
  }));

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fontSize: 11, fill: '#64748b' }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 10]}
            tick={{ fontSize: 10, fill: '#94a3b8' }}
          />
          <Tooltip
            content={({ payload }) => {
              if (payload && payload.length > 0) {
                const { dimension, score } = payload[0].payload;
                return (
                  <div className="bg-white shadow-lg rounded-lg px-3 py-2 border">
                    <p className="font-medium text-sm">{dimension}</p>
                    <p className="text-primary font-bold">{score.toFixed(1)} 分</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Radar
            name="评分"
            dataKey="score"
            stroke="#6366f1"
            fill="#6366f1"
            fillOpacity={0.3}
            strokeWidth={2}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}
