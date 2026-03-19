import { motion } from 'framer-motion';
import type { WorldBuilding } from '@/types/rating-advanced.ts';

interface WorldBuildingAnalysisProps {
  data: WorldBuilding;
}

// 世界观类型配置
const WORLD_TYPE_CONFIG: Record<string, { color: string; icon: string }> = {
  '都市': { color: '#3b82f6', icon: '🏙️' },
  '玄幻': { color: '#8b5cf6', icon: '✨' },
  '穿越': { color: '#ec4899', icon: '🌀' },
  '末日': { color: '#ef4444', icon: '💀' },
  '仙侠': { color: '#06b6d4', icon: '🗡️' },
  '科幻': { color: '#22c55e', icon: '🚀' },
  '校园': { color: '#f59e0b', icon: '🎓' },
  '职场': { color: '#64748b', icon: '💼' },
  '古风': { color: '#a855f7', icon: '🏯' },
  '现代甜宠': { color: '#f472b6', icon: '💕' },
};

// 等级颜色
function getScoreColor(score: number): string {
  if (score >= 8) return 'text-green-600';
  if (score >= 6) return 'text-amber-600';
  return 'text-red-500';
}

function getScoreBg(score: number): string {
  if (score >= 8) return 'bg-green-100';
  if (score >= 6) return 'bg-amber-100';
  return 'bg-red-100';
}

export function WorldBuildingAnalysis({ data }: WorldBuildingAnalysisProps) {
  const typeConfig = WORLD_TYPE_CONFIG[data.type] || { color: '#6366f1', icon: '🌍' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
    >
      {/* 标题 */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <span className="text-xl">🌍</span>
          世界观分析
        </h3>
        <div className="flex items-center gap-2">
          <span
            className="px-3 py-1 rounded-full text-sm font-medium text-white"
            style={{ backgroundColor: typeConfig.color }}
          >
            {typeConfig.icon} {data.type}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreBg(data.worldBuildingScore)} ${getScoreColor(data.worldBuildingScore)}`}>
            {data.worldBuildingScore.toFixed(1)}分
          </span>
        </div>
      </div>

      {/* 整体分析 */}
      <p className="text-sm text-gray-600 mb-6 p-3 bg-gray-50 rounded-lg">
        {data.analysis}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 力���体系 */}
        {data.powerSystem.exists && (
          <div className="bg-purple-50 rounded-xl p-4">
            <h4 className="font-semibold text-purple-700 mb-3 flex items-center gap-2">
              <span>⚡</span>
              力量体系
              <span className={`ml-auto text-sm px-2 py-0.5 rounded ${getScoreBg(data.powerSystem.clarity)} ${getScoreColor(data.powerSystem.clarity)}`}>
                清晰度 {data.powerSystem.clarity}/10
              </span>
            </h4>
            <p className="text-sm text-gray-700 mb-3">{data.powerSystem.description}</p>

            {data.powerSystem.levels.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-purple-600 font-medium mb-1">等级划分</p>
                <div className="flex flex-wrap gap-1">
                  {data.powerSystem.levels.map((level, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded"
                    >
                      {level}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {data.powerSystem.rules.length > 0 && (
              <div>
                <p className="text-xs text-purple-600 font-medium mb-1">核心规则</p>
                <ul className="space-y-1">
                  {data.powerSystem.rules.map((rule, i) => (
                    <li key={i} className="text-xs text-gray-600 flex items-start gap-1">
                      <span className="text-purple-500">•</span>
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* 社会架构 */}
        <div className="bg-blue-50 rounded-xl p-4">
          <h4 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
            <span>🏛️</span>
            社会架构
          </h4>
          <p className="text-sm text-gray-700 mb-3">{data.socialStructure.description}</p>

          {data.socialStructure.factions.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-blue-600 font-medium mb-1">主要势力</p>
              <div className="flex flex-wrap gap-1">
                {data.socialStructure.factions.map((faction, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded"
                  >
                    {faction}
                  </span>
                ))}
              </div>
            </div>
          )}

          {data.socialStructure.conflicts.length > 0 && (
            <div>
              <p className="text-xs text-blue-600 font-medium mb-1">核心矛盾</p>
              <ul className="space-y-1">
                {data.socialStructure.conflicts.map((conflict, i) => (
                  <li key={i} className="text-xs text-gray-600 flex items-start gap-1">
                    <span className="text-red-500">⚔️</span>
                    {conflict}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* 独特元素 */}
        <div className="bg-amber-50 rounded-xl p-4">
          <h4 className="font-semibold text-amber-700 mb-3 flex items-center gap-2">
            <span>💎</span>
            独特元素
          </h4>
          <div className="flex flex-wrap gap-2">
            {data.uniqueElements.map((element, i) => (
              <span
                key={i}
                className="px-3 py-1.5 bg-white text-amber-700 text-sm rounded-lg border border-amber-200 shadow-sm"
              >
                {element}
              </span>
            ))}
          </div>
        </div>

        {/* 一致性评估 */}
        <div className="bg-gray-50 rounded-xl p-4">
          <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span>🔗</span>
            设定一致性
            <span className={`ml-auto text-sm px-2 py-0.5 rounded ${getScoreBg(data.consistency.score)} ${getScoreColor(data.consistency.score)}`}>
              {data.consistency.score}/10
            </span>
          </h4>

          {data.consistency.strengths.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-green-600 font-medium mb-1">设定亮点</p>
              <ul className="space-y-1">
                {data.consistency.strengths.map((s, i) => (
                  <li key={i} className="text-xs text-gray-600 flex items-start gap-1">
                    <span className="text-green-500">✓</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {data.consistency.issues.length > 0 && (
            <div>
              <p className="text-xs text-amber-600 font-medium mb-1">潜在问题</p>
              <ul className="space-y-1">
                {data.consistency.issues.map((issue, i) => (
                  <li key={i} className="text-xs text-gray-600 flex items-start gap-1">
                    <span className="text-amber-500">!</span>
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* IP延展潜力 */}
      <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
        <h4 className="font-semibold text-indigo-700 mb-4 flex items-center gap-2">
          <span>🚀</span>
          IP延展潜力
          <span className={`ml-auto text-sm px-2 py-0.5 rounded ${getScoreBg(data.ipPotential.score)} ${getScoreColor(data.ipPotential.score)}`}>
            {data.ipPotential.score}/10
          </span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 续集可能性 */}
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">续集可能性</p>
            <span className={`
              px-2 py-1 rounded text-sm font-medium
              ${data.ipPotential.sequelPossibility === 'high' ? 'bg-green-100 text-green-700' : ''}
              ${data.ipPotential.sequelPossibility === 'medium' ? 'bg-amber-100 text-amber-700' : ''}
              ${data.ipPotential.sequelPossibility === 'low' ? 'bg-red-100 text-red-700' : ''}
            `}>
              {{ high: '高', medium: '中', low: '低' }[data.ipPotential.sequelPossibility]}
            </span>
          </div>

          {/* 衍生方向 */}
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <p className="text-xs text-gray-500 mb-2">衍生方向</p>
            <div className="flex flex-wrap gap-1">
              {data.ipPotential.spinoffIdeas.map((idea, i) => (
                <span key={i} className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded">
                  {idea}
                </span>
              ))}
            </div>
          </div>

          {/* 周边潜力 */}
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <p className="text-xs text-gray-500 mb-2">周边潜力</p>
            <div className="flex flex-wrap gap-1">
              {data.ipPotential.merchandisePotential.map((item, i) => (
                <span key={i} className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">
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
