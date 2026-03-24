import { motion } from 'framer-motion';
import {
  Globe, Zap, Landmark, Gem, Link2, Rocket,
  Check, AlertTriangle, Sword,
  Building2, Sparkles, RotateCcw, Skull,
  GraduationCap, Briefcase, Heart,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { WorldBuilding } from '@/types/rating-advanced.ts';

interface WorldBuildingAnalysisProps {
  data: WorldBuilding;
}

// 世界观类型配置 — Lucide SVG 替代 emoji
const WORLD_TYPE_CONFIG: Record<string, { color: string; Icon: LucideIcon }> = {
  '都市': { color: '#3b82f6', Icon: Building2 },
  '玄幻': { color: '#8b5cf6', Icon: Sparkles },
  '穿越': { color: '#ec4899', Icon: RotateCcw },
  '末日': { color: '#ef4444', Icon: Skull },
  '仙侠': { color: '#06b6d4', Icon: Sword },
  '科幻': { color: '#22c55e', Icon: Rocket },
  '校园': { color: '#f59e0b', Icon: GraduationCap },
  '职场': { color: '#64748b', Icon: Briefcase },
  '古风': { color: '#a855f7', Icon: Landmark },
  '现代甜宠': { color: '#f472b6', Icon: Heart },
};

/** 归一化评分 — 兼容 0-10 与 0-100 两种量纲 */
function normalizeScore(score: number): number {
  return score > 10 ? score / 10 : score;
}

function getScoreColor(score: number): string {
  const s = normalizeScore(score);
  if (s >= 8) return 'text-green-600';
  if (s >= 6) return 'text-amber-600';
  return 'text-red-500';
}

function getScoreBg(score: number): string {
  const s = normalizeScore(score);
  if (s >= 8) return 'bg-green-50';
  if (s >= 6) return 'bg-amber-50';
  return 'bg-red-50';
}

function getScoreRingStroke(score: number): string {
  const s = normalizeScore(score);
  if (s >= 8) return '#22c55e';
  if (s >= 6) return '#f59e0b';
  return '#ef4444';
}

/** 环形分数指示器 — 替代原来的 "88/10" 小徽章 */
function ScoreRing({ score, size = 52, label }: { score: number; size?: number; label?: string }) {
  const normalized = normalizeScore(score);
  const pct = (normalized / 10) * 100;
  const r = (size - 6) / 2;
  const C = 2 * Math.PI * r;
  const offset = C - (pct / 100) * C;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2} cy={size / 2} r={r}
            className="stroke-border" strokeWidth={3} fill="none"
          />
          <motion.circle
            cx={size / 2} cy={size / 2} r={r}
            stroke={getScoreRingStroke(score)}
            strokeWidth={3} fill="none"
            strokeDasharray={C}
            initial={{ strokeDashoffset: C }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-sm font-bold ${getScoreColor(score)}`}>
            {normalized.toFixed(1)}
          </span>
        </div>
      </div>
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
    </div>
  );
}

export function WorldBuildingAnalysis({ data }: WorldBuildingAnalysisProps) {
  const typeConfig = WORLD_TYPE_CONFIG[data.type] || { color: '#6366f1', Icon: Globe };
  const TypeIcon = typeConfig.Icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl shadow-card p-6 border border-border
                 transition-shadow duration-200 hover:shadow-card-hover"
    >
      {/* ── 标题栏 ── */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          世界观分析
        </h3>
        <div className="flex items-center gap-3">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium text-white cursor-default"
            style={{ backgroundColor: typeConfig.color }}
          >
            <TypeIcon size={14} />
            {data.type}
          </span>
          <ScoreRing score={data.worldBuildingScore} size={44} />
        </div>
      </div>

      {/* ── 整体分析 ── */}
      <p className="text-sm text-muted-foreground mb-6 p-3 bg-muted rounded-lg leading-relaxed">
        {data.analysis}
      </p>

      {/* ── 主体四宫格 ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 力量体系 */}
        {data.powerSystem.exists && (
          <div className="bg-primary-50/60 rounded-xl p-4 border border-primary-100">
            <h4 className="font-semibold text-primary-700 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              力量体系
              <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium
                ${getScoreBg(data.powerSystem.clarity)} ${getScoreColor(data.powerSystem.clarity)}`}
              >
                清晰度 {normalizeScore(data.powerSystem.clarity).toFixed(1)}
              </span>
            </h4>
            <p className="text-sm text-foreground/70 mb-3">{data.powerSystem.description}</p>

            {data.powerSystem.levels.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-primary-600 font-medium mb-1.5">等级划分</p>
                <div className="flex flex-wrap gap-1.5">
                  {data.powerSystem.levels.map((level, i) => (
                    <span key={i} className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-md">
                      {level}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {data.powerSystem.rules.length > 0 && (
              <div>
                <p className="text-xs text-primary-600 font-medium mb-1.5">核心规则</p>
                <ul className="space-y-1">
                  {data.powerSystem.rules.map((rule, i) => (
                    <li key={i} className="text-xs text-foreground/60 flex items-start gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* 社会架构 */}
        <div className="bg-blue-50/60 rounded-xl p-4 border border-blue-100">
          <h4 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
            <Landmark className="w-4 h-4" />
            社会架构
          </h4>
          <p className="text-sm text-foreground/70 mb-3">{data.socialStructure.description}</p>

          {data.socialStructure.factions.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-blue-600 font-medium mb-1.5">主要势力</p>
              <div className="flex flex-wrap gap-1.5">
                {data.socialStructure.factions.map((faction, i) => (
                  <span key={i} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-md">
                    {faction}
                  </span>
                ))}
              </div>
            </div>
          )}

          {data.socialStructure.conflicts.length > 0 && (
            <div>
              <p className="text-xs text-blue-600 font-medium mb-1.5">核心矛盾</p>
              <ul className="space-y-1">
                {data.socialStructure.conflicts.map((conflict, i) => (
                  <li key={i} className="text-xs text-foreground/60 flex items-start gap-1.5">
                    <Sword className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" />
                    {conflict}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* 独特元素 */}
        <div className="bg-amber-50/60 rounded-xl p-4 border border-amber-100">
          <h4 className="font-semibold text-amber-700 mb-3 flex items-center gap-2">
            <Gem className="w-4 h-4" />
            独特元素
          </h4>
          <div className="flex flex-wrap gap-2">
            {data.uniqueElements.map((element, i) => (
              <span
                key={i}
                className="px-3 py-1.5 bg-card text-amber-700 text-sm rounded-lg
                           border border-amber-200 shadow-sm"
              >
                {element}
              </span>
            ))}
          </div>
        </div>

        {/* 设定一致性 — 红框修复区 */}
        <div className="bg-muted/60 rounded-xl p-4 border border-border">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <Link2 className="w-4 h-4 text-primary" />
              设定一致性
            </h4>
            <ScoreRing score={data.consistency.score} size={44} />
          </div>

          {data.consistency.strengths.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-green-600 font-medium mb-1.5">设定亮点</p>
              <ul className="space-y-1">
                {data.consistency.strengths.map((s, i) => (
                  <li key={i} className="text-xs text-foreground/60 flex items-start gap-1.5">
                    <Check className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {data.consistency.issues.length > 0 && (
            <div>
              <p className="text-xs text-amber-600 font-medium mb-1.5">潜在问题</p>
              <ul className="space-y-1">
                {data.consistency.issues.map((issue, i) => (
                  <li key={i} className="text-xs text-foreground/60 flex items-start gap-1.5">
                    <AlertTriangle className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* ── IP延展潜力 — 红框修复区 ── */}
      <div className="mt-6 p-5 bg-gradient-to-r from-primary-50 to-purple-50 rounded-xl border border-primary-100">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-primary-700 flex items-center gap-2">
            <Rocket className="w-4 h-4" />
            IP延展潜力
          </h4>
          <ScoreRing score={data.ipPotential.score} size={48} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 续集可能性 */}
          <div className="bg-card rounded-lg p-3 shadow-sm border border-border/50">
            <p className="text-xs text-muted-foreground mb-2">续集可能性</p>
            <span className={`
              inline-flex px-2.5 py-1 rounded-md text-sm font-semibold
              ${data.ipPotential.sequelPossibility === 'high' ? 'bg-green-50 text-green-600' : ''}
              ${data.ipPotential.sequelPossibility === 'medium' ? 'bg-amber-50 text-amber-600' : ''}
              ${data.ipPotential.sequelPossibility === 'low' ? 'bg-red-50 text-red-500' : ''}
            `}>
              {{ high: '高', medium: '中', low: '低' }[data.ipPotential.sequelPossibility]}
            </span>
          </div>

          {/* 衍生方向 */}
          <div className="bg-card rounded-lg p-3 shadow-sm border border-border/50">
            <p className="text-xs text-muted-foreground mb-2">衍生方向</p>
            <div className="flex flex-wrap gap-1.5">
              {data.ipPotential.spinoffIdeas.map((idea, i) => (
                <span key={i} className="px-2 py-0.5 bg-primary-50 text-primary-700 text-xs rounded-md">
                  {idea}
                </span>
              ))}
            </div>
          </div>

          {/* 周边潜力 */}
          <div className="bg-card rounded-lg p-3 shadow-sm border border-border/50">
            <p className="text-xs text-muted-foreground mb-2">周边潜力</p>
            <div className="flex flex-wrap gap-1.5">
              {data.ipPotential.merchandisePotential.map((item, i) => (
                <span key={i} className="px-2 py-0.5 bg-purple-50 text-purple-700 text-xs rounded-md">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default WorldBuildingAnalysis;
