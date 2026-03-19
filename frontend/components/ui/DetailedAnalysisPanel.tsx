import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  Target,
  Users,
  Sparkles,
  TrendingUp,
  Layers,
  MessageSquare,
  Zap,
  Shield,
  Heart,
  BarChart3,
  Lightbulb,
} from 'lucide-react';
import type {
  DetailedAnalysis,
  DimensionDetailedAnalysis,
  ActionableRecommendation,
  BusinessClosedLoopPlan,
} from '@/types/rating-advanced.ts';

interface DetailedAnalysisPanelProps {
  detailedAnalysis: DetailedAnalysis;
  actionableRecommendations: ActionableRecommendation[];
  finalSummary?: {
    businessClosedLoop?: BusinessClosedLoopPlan;
  };
}

// 等级颜色配置
const GRADE_COLORS: Record<string, { text: string; bg: string }> = {
  'S': { text: 'text-amber-700', bg: 'bg-amber-100' },
  'A+': { text: 'text-purple-700', bg: 'bg-purple-100' },
  'A': { text: 'text-indigo-700', bg: 'bg-indigo-100' },
  'B': { text: 'text-blue-700', bg: 'bg-blue-100' },
  'C': { text: 'text-gray-700', bg: 'bg-gray-100' },
  'D': { text: 'text-red-700', bg: 'bg-red-100' },
};

// 分析维度配置
const DIMENSION_CONFIG: Record<string, { icon: React.ComponentType<{ className?: string }>; label: string }> = {
  targetAudience: { icon: Users, label: '目标受众定位' },
  originality: { icon: Sparkles, label: '原创性评分' },
  trendAlignment: { icon: TrendingUp, label: '当下热播契合度' },
  narrativeLogic: { icon: Layers, label: '叙事逻辑' },
  hookStrength: { icon: Zap, label: '钩子强度' },
  pleasureDesign: { icon: Heart, label: '爽点设计' },
  pacingStructure: { icon: BarChart3, label: '节奏与结构' },
  plotCoherence: { icon: Target, label: '主线连贯性' },
  characterization: { icon: Users, label: '人物塑造' },
  dialogueQuality: { icon: MessageSquare, label: '对白质量' },
  suspenseEffectiveness: { icon: Zap, label: '悬念有效性' },
  userStickiness: { icon: Heart, label: '用户粘性' },
  viralPotential: { icon: TrendingUp, label: '传播潜力' },
  contentCompliance: { icon: Shield, label: '内容合规性' },
  valueOrientation: { icon: Target, label: '价值观导向' },
};

// 单个维度详情卡片
function DimensionCard({
  dimensionKey,
  data,
}: {
  dimensionKey: string;
  data: DimensionDetailedAnalysis;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = DIMENSION_CONFIG[dimensionKey] || { icon: Target, label: dimensionKey };
  const gradeColor = GRADE_COLORS[data.grade] || GRADE_COLORS['B'];
  const Icon = config.icon;

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden bg-white">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-indigo-500" />
          <span className="font-medium text-gray-800">{config.label}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-2 py-0.5 rounded text-sm font-bold ${gradeColor.bg} ${gradeColor.text}`}>
            {data.grade}
          </span>
          <span className="text-lg font-bold text-gray-700">
            {data.score}
            <span className="text-xs text-gray-400">/100</span>
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-100"
          >
            <div className="p-4 space-y-4">
              {/* Analysis Text */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">详细分析</h4>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {data.analysis}
                </p>
              </div>

              {/* Improvements */}
              {data.improvements && data.improvements.length > 0 && (
                <div className="bg-amber-50 rounded-lg p-4">
                  <h4 className="text-xs font-semibold text-amber-700 uppercase mb-2 flex items-center gap-1">
                    <Lightbulb className="w-3 h-3" />
                    可打磨点
                  </h4>
                  <ul className="space-y-2">
                    {data.improvements.map((item, i) => (
                      <li key={i} className="text-sm text-amber-800 flex items-start gap-2">
                        <span className="mt-1 w-1.5 h-1.5 bg-amber-500 rounded-full flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// 分类标题
function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-4">
      <h3 className="text-lg font-bold text-gray-800">{title}</h3>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
  );
}

export function DetailedAnalysisPanel({
  detailedAnalysis,
  actionableRecommendations,
  finalSummary,
}: DetailedAnalysisPanelProps) {
  const { marketResonance, narrativeDNA, commercialPotential, complianceAssessment } = detailedAnalysis;
  const businessLoop = finalSummary?.businessClosedLoop;

  return (
    <div className="space-y-8">
      {/* A. 市场共鸣与竞争定位 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
      >
        <SectionTitle
          title="A. 市场共鸣与竞争定位"
          subtitle="分析剧本与目标市场的契合度"
        />
        <div className="space-y-3">
          <DimensionCard dimensionKey="targetAudience" data={marketResonance.targetAudience} />
          <DimensionCard dimensionKey="originality" data={marketResonance.originality} />
          <DimensionCard dimensionKey="trendAlignment" data={marketResonance.trendAlignment} />
        </div>
      </motion.div>

      {/* B. 叙事与剧本基因 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
      >
        <SectionTitle
          title="B. 叙事与剧本基因"
          subtitle="评估剧本的核心创作质量"
        />
        <div className="space-y-3">
          <DimensionCard dimensionKey="narrativeLogic" data={narrativeDNA.narrativeLogic} />
          <DimensionCard dimensionKey="hookStrength" data={narrativeDNA.hookStrength} />
          <DimensionCard dimensionKey="pleasureDesign" data={narrativeDNA.pleasureDesign} />
          <DimensionCard dimensionKey="pacingStructure" data={narrativeDNA.pacingStructure} />
          <DimensionCard dimensionKey="plotCoherence" data={narrativeDNA.plotCoherence} />
          <DimensionCard dimensionKey="characterization" data={narrativeDNA.characterization} />
          <DimensionCard dimensionKey="dialogueQuality" data={narrativeDNA.dialogueQuality} />
          <DimensionCard dimensionKey="suspenseEffectiveness" data={narrativeDNA.suspenseEffectiveness} />
        </div>
      </motion.div>

      {/* C. 商业化潜力 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
      >
        <SectionTitle
          title="C. 商业化潜力"
          subtitle="评估剧本的商业变现能力"
        />
        <div className="space-y-3">
          <DimensionCard dimensionKey="userStickiness" data={commercialPotential.userStickiness} />
          <DimensionCard dimensionKey="viralPotential" data={commercialPotential.viralPotential} />
        </div>
      </motion.div>

      {/* D. 合规性评估 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
      >
        <SectionTitle
          title="D. 合规性评估"
          subtitle="审查内容安全与价值导向"
        />
        <div className="space-y-3">
          <DimensionCard dimensionKey="contentCompliance" data={complianceAssessment.contentCompliance} />
          <DimensionCard dimensionKey="valueOrientation" data={complianceAssessment.valueOrientation} />
        </div>
      </motion.div>

      {/* 综合可操作建议 */}
      {actionableRecommendations && actionableRecommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-lg p-6 border border-indigo-100"
        >
          <h3 className="text-lg font-bold text-indigo-800 mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            综合可操作建议
          </h3>
          <div className="space-y-4">
            {actionableRecommendations.map((rec, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-4 border border-indigo-100"
              >
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {rec.priority}
                  </span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 mb-1">{rec.title}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{rec.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 商业闭环方案 */}
      {businessLoop && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-500" />
            E. 商业化闭环方案
          </h3>

          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">目标定位</p>
              <p className="leading-relaxed">{businessLoop.targetPositioning}</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">变现路径</p>
              <ul className="space-y-1">
                {businessLoop.monetizationPath.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1 w-1.5 h-1.5 bg-indigo-500 rounded-full flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">上线节奏</p>
              <ul className="space-y-1">
                {businessLoop.launchPlan.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1 w-1.5 h-1.5 bg-indigo-500 rounded-full flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">KPI看板</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border border-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-2 border-b border-gray-200">指标</th>
                      <th className="text-left p-2 border-b border-gray-200">目标</th>
                      <th className="text-left p-2 border-b border-gray-200">周期</th>
                      <th className="text-left p-2 border-b border-gray-200">负责人</th>
                    </tr>
                  </thead>
                  <tbody>
                    {businessLoop.kpiDashboard.map((item, i) => (
                      <tr key={i} className="border-b border-gray-100 last:border-b-0">
                        <td className="p-2">{item.metric}</td>
                        <td className="p-2">{item.target}</td>
                        <td className="p-2">{item.window}</td>
                        <td className="p-2">{item.owner || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">验证实验</p>
              <ul className="space-y-1">
                {businessLoop.validationExperiments.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1 w-1.5 h-1.5 bg-indigo-500 rounded-full flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">风险与兜底</p>
              <ul className="space-y-1">
                {businessLoop.riskMitigation.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1 w-1.5 h-1.5 bg-indigo-500 rounded-full flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
              <p className="text-xs font-semibold text-indigo-700 uppercase mb-1">下一季度目标</p>
              <p className="text-sm text-indigo-800">{businessLoop.nextQuarterGoal}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default DetailedAnalysisPanel;
