import { motion } from 'framer-motion';
import type { ProductionFeasibility as ProductionFeasibilityType, BudgetTier } from '../types/rating-advanced';

interface ProductionFeasibilityProps {
  data: ProductionFeasibilityType;
}

// AI漫剧预算等级配置（基于2025年实际市场数据）
// 每集约30-40个分镜，单集成本30-200元
const BUDGET_CONFIG: Record<BudgetTier, {
  label: string;
  perEpisode: string;
  fullSeason: string;
  panels: string;
  color: string;
  bg: string;
  gradient: string;
}> = {
  S: {
    label: 'S级精品',
    perEpisode: '120-200元/集',
    fullSeason: '80集约9600-16000元',
    panels: '30-40分镜/集',
    color: 'text-amber-700',
    bg: 'bg-amber-100',
    gradient: 'from-amber-400 to-orange-500',
  },
  A: {
    label: 'A级优质',
    perEpisode: '80-120元/集',
    fullSeason: '80集约6400-9600元',
    panels: '30-40分镜/集',
    color: 'text-purple-700',
    bg: 'bg-purple-100',
    gradient: 'from-purple-400 to-indigo-500',
  },
  B: {
    label: 'B级标准',
    perEpisode: '50-80元/集',
    fullSeason: '80集约4000-6400元',
    panels: '30-40分镜/集',
    color: 'text-blue-700',
    bg: 'bg-blue-100',
    gradient: 'from-blue-400 to-cyan-500',
  },
  C: {
    label: 'C级轻量',
    perEpisode: '30-50元/集',
    fullSeason: '80集约2400-4000元',
    panels: '30-40分镜/集',
    color: 'text-green-700',
    bg: 'bg-green-100',
    gradient: 'from-green-400 to-emerald-500',
  },
};

// AI生成复杂度配置
const VFX_CONFIG = {
  heavy: { label: '高复杂度', color: 'text-red-600', icon: '🎇', desc: '大量动作/特效场景' },
  moderate: { label: '中等复杂度', color: 'text-yellow-600', icon: '✨', desc: '部分动态场景' },
  light: { label: '低复杂度', color: 'text-blue-600', icon: '💫', desc: '静态为主' },
  none: { label: '极简', color: 'text-green-600', icon: '📷', desc: '纯对话场景' },
};

export function ProductionFeasibility({ data }: ProductionFeasibilityProps) {
  const {
    budgetTier,
    budgetDescription,
    sceneComplexity,
    vfxRequirement,
    locationCount,
    estimatedDays,
    castRequirement,
    technicalChallenges,
  } = data;

  const budgetConfig = BUDGET_CONFIG[budgetTier] || BUDGET_CONFIG.B;
  const vfxConfig = VFX_CONFIG[vfxRequirement] || VFX_CONFIG.light;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
    >
      {/* 标题 */}
      <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
        <span className="text-xl">🎬</span>
        制作可行性
      </h3>

      {/* 预算等级 */}
      <div className="mb-6">
        <div
          className={`
            relative p-6 rounded-2xl overflow-hidden
            bg-gradient-to-br ${budgetConfig.gradient}
          `}
        >
          {/* 背景装饰 */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white/80 text-sm">AI制作等级</div>
                <div className="text-white text-3xl font-black mt-1">
                  {budgetTier}级
                </div>
                <div className="text-white/90 text-sm mt-1">
                  {budgetConfig.label}
                </div>
              </div>
              <div className="text-right">
                <div className="text-white/80 text-sm">单集成本</div>
                <div className="text-white text-2xl font-bold mt-1">
                  {budgetConfig.perEpisode}
                </div>
                <div className="text-white/70 text-xs mt-1">
                  {budgetConfig.panels} · {budgetConfig.fullSeason}
                </div>
              </div>
            </div>

            {budgetDescription && (
              <div className="mt-4 pt-4 border-t border-white/20 text-white/90 text-sm">
                {budgetDescription}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 核心指标 */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {/* 场景复杂度 */}
        <div className="text-center p-3 bg-gray-50 rounded-xl">
          <div className="text-2xl font-bold text-gray-800">
            {sceneComplexity}/10
          </div>
          <div className="text-xs text-gray-500 mt-1">场景复杂度</div>
          <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full"
              style={{ width: `${sceneComplexity * 10}%` }}
            />
          </div>
        </div>

        {/* 场景数量 */}
        <div className="text-center p-3 bg-gray-50 rounded-xl">
          <div className="text-2xl font-bold text-gray-800">
            {locationCount}
          </div>
          <div className="text-xs text-gray-500 mt-1">场景数量</div>
        </div>

        {/* 预估天数 */}
        <div className="text-center p-3 bg-gray-50 rounded-xl">
          <div className="text-2xl font-bold text-gray-800">
            {estimatedDays}天
          </div>
          <div className="text-xs text-gray-500 mt-1">预估制作</div>
        </div>

        {/* 特效需求 */}
        <div className={`text-center p-3 rounded-xl ${vfxConfig.color === 'text-red-600' ? 'bg-red-50' : vfxConfig.color === 'text-yellow-600' ? 'bg-yellow-50' : vfxConfig.color === 'text-blue-600' ? 'bg-blue-50' : 'bg-green-50'}`}>
          <div className="text-2xl">{vfxConfig.icon}</div>
          <div className={`text-xs mt-1 font-medium ${vfxConfig.color}`}>
            {vfxConfig.label}
          </div>
        </div>
      </div>

      {/* 角色设计要求 */}
      {castRequirement && (
        <div className="mb-6 p-4 bg-purple-50 rounded-xl">
          <h4 className="text-sm font-semibold text-purple-700 mb-2 flex items-center gap-1">
            <span>🎨</span> 角色设计要求
          </h4>
          <p className="text-sm text-purple-600">{castRequirement}</p>
        </div>
      )}

      {/* AI生成难点 */}
      {technicalChallenges?.length > 0 && (
        <div className="p-4 bg-amber-50 rounded-xl">
          <h4 className="text-sm font-semibold text-amber-700 mb-3 flex items-center gap-1">
            <span>🤖</span> AI生成难点
          </h4>
          <div className="space-y-2">
            {technicalChallenges.map((challenge, index) => (
              <div
                key={index}
                className="flex items-start gap-2 text-sm text-amber-700"
              >
                <span className="mt-0.5 text-amber-500">⚠</span>
                <span>{challenge}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 可行性总结 */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">制作可行性：</span>
          <span
            className={`
              px-3 py-1 rounded-full font-medium
              ${sceneComplexity <= 5 ? 'bg-green-100 text-green-700' : ''}
              ${sceneComplexity > 5 && sceneComplexity <= 7 ? 'bg-yellow-100 text-yellow-700' : ''}
              ${sceneComplexity > 7 ? 'bg-red-100 text-red-700' : ''}
            `}
          >
            {sceneComplexity <= 5 ? '✓ 易于实现' : sceneComplexity <= 7 ? '⚠ 需要规划' : '⚠ 较有挑战'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default ProductionFeasibility;
