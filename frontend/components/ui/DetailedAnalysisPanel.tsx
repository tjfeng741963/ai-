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
  Search,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import type {
  DetailedAnalysis,
  DimensionDetailedAnalysis,
  ActionableRecommendation,
  BusinessClosedLoopPlan,
} from '@/types/rating-advanced.ts';
import { getLabels, getDimensionLabel, type OutputLanguage } from '@/services/i18n-labels.ts';

interface DetailedAnalysisPanelProps {
  detailedAnalysis: DetailedAnalysis;
  actionableRecommendations: ActionableRecommendation[];
  finalSummary?: {
    businessClosedLoop?: BusinessClosedLoopPlan;
  };
  outputLanguage?: OutputLanguage;
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

// 维度图标配置
const DIMENSION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  targetAudience: Users,
  originality: Sparkles,
  trendAlignment: TrendingUp,
  narrativeLogic: Layers,
  hookStrength: Zap,
  pleasureDesign: Heart,
  pacingStructure: BarChart3,
  plotCoherence: Target,
  characterization: Users,
  dialogueQuality: MessageSquare,
  suspenseEffectiveness: Zap,
  userStickiness: Heart,
  viralPotential: TrendingUp,
  contentCompliance: Shield,
  valueOrientation: Target,
};

// 单个维度详情卡片
function DimensionCard({
  dimensionKey,
  data,
  lang = 'zh',
}: {
  dimensionKey: string;
  data: DimensionDetailedAnalysis;
  lang?: OutputLanguage;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = DIMENSION_ICONS[dimensionKey] || Target;
  const label = getDimensionLabel(dimensionKey, lang);
  const L = getLabels(lang);
  const gradeColor = GRADE_COLORS[data.grade] || GRADE_COLORS['B'];

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden bg-white">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-indigo-500" />
          <span className="font-medium text-gray-800">{label}</span>
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
              {/* 综合分析 */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-1">
                  <BarChart3 className="w-3 h-3" />
                  {L.analysisTitle}
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {data.analysis || L.noAnalysis}
                </p>
              </div>

              {/* 关键发现 */}
              {data.keyFindings && data.keyFindings.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="text-xs font-semibold text-blue-700 uppercase mb-2 flex items-center gap-1">
                    <Search className="w-3 h-3" />
                    {L.keyFindingsTitle}
                  </h4>
                  <ul className="space-y-2">
                    {data.keyFindings.map((item, i) => (
                      <li key={i} className="text-sm text-blue-800 flex items-start gap-2">
                        <span className="mt-1 w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 原文引用 */}
              {data.evidence && data.evidence.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-xs font-semibold text-gray-600 uppercase mb-2 flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    {L.evidenceTitle}
                  </h4>
                  <ul className="space-y-2">
                    {data.evidence.map((item, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-2 italic">
                        <span className="mt-1 w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 优势亮点 */}
              {data.strengths && data.strengths.length > 0 && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="text-xs font-semibold text-green-700 uppercase mb-2 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {L.strengthsTitle}
                  </h4>
                  <ul className="space-y-2">
                    {data.strengths.map((item, i) => (
                      <li key={i} className="text-sm text-green-800 flex items-start gap-2">
                        <span className="mt-1 w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 可打磨点 */}
              {data.improvements && data.improvements.length > 0 && (
                <div className="bg-amber-50 rounded-lg p-4">
                  <h4 className="text-xs font-semibold text-amber-700 uppercase mb-2 flex items-center gap-1">
                    <Lightbulb className="w-3 h-3" />
                    {L.improvementsTitle}
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
  outputLanguage = 'zh',
}: DetailedAnalysisPanelProps) {
  // 标签始终使用中文（客户群体为华人），outputLanguage仅影响台词语言
  const lang: OutputLanguage = 'zh';
  const L = getLabels(lang);
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
        <SectionTitle title={L.sectionA} subtitle={L.sectionASubtitle} />
        <div className="space-y-3">
          <DimensionCard dimensionKey="targetAudience" data={marketResonance.targetAudience} lang={lang} />
          <DimensionCard dimensionKey="originality" data={marketResonance.originality} lang={lang} />
          <DimensionCard dimensionKey="trendAlignment" data={marketResonance.trendAlignment} lang={lang} />
        </div>
      </motion.div>

      {/* B. 叙事与剧本基因 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
      >
        <SectionTitle title={L.sectionB} subtitle={L.sectionBSubtitle} />
        <div className="space-y-3">
          <DimensionCard dimensionKey="narrativeLogic" data={narrativeDNA.narrativeLogic} lang={lang} />
          <DimensionCard dimensionKey="hookStrength" data={narrativeDNA.hookStrength} lang={lang} />
          <DimensionCard dimensionKey="pleasureDesign" data={narrativeDNA.pleasureDesign} lang={lang} />
          <DimensionCard dimensionKey="pacingStructure" data={narrativeDNA.pacingStructure} lang={lang} />
          <DimensionCard dimensionKey="plotCoherence" data={narrativeDNA.plotCoherence} lang={lang} />
          <DimensionCard dimensionKey="characterization" data={narrativeDNA.characterization} lang={lang} />
          <DimensionCard dimensionKey="dialogueQuality" data={narrativeDNA.dialogueQuality} lang={lang} />
          <DimensionCard dimensionKey="suspenseEffectiveness" data={narrativeDNA.suspenseEffectiveness} lang={lang} />
        </div>
      </motion.div>

      {/* C. 商业化潜力 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
      >
        <SectionTitle title={L.sectionC} subtitle={L.sectionCSubtitle} />
        <div className="space-y-3">
          <DimensionCard dimensionKey="userStickiness" data={commercialPotential.userStickiness} lang={lang} />
          <DimensionCard dimensionKey="viralPotential" data={commercialPotential.viralPotential} lang={lang} />
        </div>
      </motion.div>

      {/* D. 合规性评估 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
      >
        <SectionTitle title={L.sectionD} subtitle={L.sectionDSubtitle} />
        <div className="space-y-3">
          <DimensionCard dimensionKey="contentCompliance" data={complianceAssessment.contentCompliance} lang={lang} />
          <DimensionCard dimensionKey="valueOrientation" data={complianceAssessment.valueOrientation} lang={lang} />
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
            {L.actionableRecommendations}
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
            {L.businessClosedLoop}
          </h3>

          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">{L.targetPositioning}</p>
              <p className="leading-relaxed">{businessLoop.targetPositioning}</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">{L.monetizationPath}</p>
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
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">{L.launchPlan}</p>
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
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">{L.kpiDashboard}</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border border-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-2 border-b border-gray-200">{L.kpiMetric}</th>
                      <th className="text-left p-2 border-b border-gray-200">{L.kpiTarget}</th>
                      <th className="text-left p-2 border-b border-gray-200">{L.kpiWindow}</th>
                      <th className="text-left p-2 border-b border-gray-200">{L.kpiOwner}</th>
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
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">{L.validationExperiments}</p>
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
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">{L.riskMitigation}</p>
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
              <p className="text-xs font-semibold text-indigo-700 uppercase mb-1">{L.nextQuarterGoal}</p>
              <p className="text-sm text-indigo-800">{businessLoop.nextQuarterGoal}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default DetailedAnalysisPanel;
