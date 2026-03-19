import { motion } from 'framer-motion';
import type { RiskAssessment as RiskAssessmentType, RiskItem, PlatformComplianceStatus } from '@/types/rating-advanced.ts';

interface RiskAssessmentProps {
  data: RiskAssessmentType;
}

// 风险等级配置
const RISK_LEVEL_CONFIG = {
  critical: { bg: 'bg-red-100', text: 'text-red-700', icon: '🚨', label: '严重' },
  high: { bg: 'bg-orange-100', text: 'text-orange-700', icon: '⚠️', label: '高危' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: '⚡', label: '中等' },
  low: { bg: 'bg-green-100', text: 'text-green-700', icon: '✓', label: '低危' },
};

// 总体风险配置
const OVERALL_RISK_CONFIG = {
  high: { gradient: 'from-red-500 to-orange-500', text: '高风险', desc: '需要重大修改' },
  medium: { gradient: 'from-yellow-500 to-amber-500', text: '中风险', desc: '建议适当调整' },
  low: { gradient: 'from-green-500 to-emerald-500', text: '低风险', desc: '基本合规' },
};

// 平台适配配置
const PLATFORM_SUITABILITY_CONFIG = {
  suitable: { color: 'text-green-600', bg: 'bg-green-50', icon: '✓', label: '适合' },
  needs_modification: { color: 'text-yellow-600', bg: 'bg-yellow-50', icon: '⚠', label: '需修改' },
  unsuitable: { color: 'text-red-600', bg: 'bg-red-50', icon: '✕', label: '不适合' },
};

// AI漫剧平台标签
const AI_COMIC_PLATFORM_LABELS: Record<string, { name: string; icon: string }> = {
  hongGuo: { name: '红果短剧', icon: '🍎' },
  fanQie: { name: '番茄短剧', icon: '🍅' },
  douyin: { name: '抖音/快手', icon: '📱' },
  overseas: { name: '海外平台', icon: '🌍' },
  shortVideo: { name: '短视频', icon: '📱' },
  longVideo: { name: '长视频', icon: '📺' },
  cinema: { name: '院线', icon: '🎬' },
};

function RiskCard({
  title,
  icon,
  risks,
  bgColor,
}: {
  title: string;
  icon: string;
  risks: RiskItem[];
  bgColor: string;
}) {
  if (risks.length === 0) {
    return (
      <div className={`p-4 ${bgColor} rounded-xl`}>
        <div className="flex items-center gap-2 mb-2">
          <span>{icon}</span>
          <span className="font-semibold text-gray-700">{title}</span>
        </div>
        <div className="text-sm text-gray-500 text-center py-2">
          暂无风险项
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 ${bgColor} rounded-xl`}>
      <div className="flex items-center gap-2 mb-3">
        <span>{icon}</span>
        <span className="font-semibold text-gray-700">{title}</span>
        <span className="ml-auto text-sm text-gray-500">{risks.length}项</span>
      </div>
      <div className="space-y-2">
        {risks.map((risk, index) => {
          const config = RISK_LEVEL_CONFIG[risk.severity] || RISK_LEVEL_CONFIG.medium;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg p-3 shadow-sm"
            >
              <div className="flex items-start gap-2">
                <span
                  className={`px-1.5 py-0.5 text-xs rounded ${config.bg} ${config.text}`}
                >
                  {config.icon} {config.label}
                </span>
                <div className="flex-1">
                  <p className="text-sm text-gray-700">{risk.description}</p>
                  {risk.location && (
                    <p className="text-xs text-gray-500 mt-1">📍 {risk.location}</p>
                  )}
                  {risk.affectedPlatforms && risk.affectedPlatforms.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {risk.affectedPlatforms.map((platform) => (
                        <span key={platform} className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                          {platform}
                        </span>
                      ))}
                    </div>
                  )}
                  {risk.suggestion && (
                    <p className="text-xs text-blue-600 mt-1">
                      💡 建议：{risk.suggestion}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// 判断是否为详细平台合规格式
function isPlatformComplianceStatus(item: unknown): item is PlatformComplianceStatus {
  return typeof item === 'object' && item !== null && 'status' in item;
}

export function RiskAssessment({ data }: RiskAssessmentProps) {
  // 安全解构，提供默认值
  const {
    compliance = {
      overallRisk: 'low' as const,
      passRate: 100,
      issues: [],
      platformSuitability: undefined,
    },
    aiContentCompliance,
    marketRisks = [],
    productionRisks = [],
    platformRisks = [],
    canPublish = true,
    requiredChanges = [],
    recommendedChanges = [],
    platformSpecificChanges,
    valueOrientation,
    ageRating,
  } = data || {};

  const overallConfig = OVERALL_RISK_CONFIG[compliance?.overallRisk] || OVERALL_RISK_CONFIG.medium;

  // 如果没有任何数据，显示空状态
  if (!data) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
      >
        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="text-xl">🚨</span>
          AI漫剧风险评估
        </h3>
        <div className="h-48 flex items-center justify-center text-gray-400">
          暂无风险评估数据
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
    >
      {/* 标题 */}
      <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
        <span className="text-xl">🚨</span>
        AI漫剧风险评估
      </h3>

      {/* 总体风险指标 */}
      <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-xl">
        <div className="flex items-center gap-4">
          <div
            className={`
              w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl
              bg-gradient-to-br ${overallConfig.gradient}
            `}
          >
            {compliance.passRate}%
          </div>
          <div>
            <div className="font-bold text-gray-800">{overallConfig.text}</div>
            <div className="text-sm text-gray-500">{overallConfig.desc}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* 年龄分级 */}
          {ageRating && (
            <div className={`
              px-3 py-1.5 rounded-lg font-medium text-sm
              ${ageRating.suggested === '全年龄' ? 'bg-green-100 text-green-700' : ''}
              ${ageRating.suggested === '12+' ? 'bg-blue-100 text-blue-700' : ''}
              ${ageRating.suggested === '16+' ? 'bg-yellow-100 text-yellow-700' : ''}
              ${ageRating.suggested === '18+' ? 'bg-red-100 text-red-700' : ''}
            `}>
              {ageRating.suggested}
            </div>
          )}
          {/* 是否可发布 */}
          <div
            className={`
              px-4 py-2 rounded-lg font-semibold
              ${canPublish ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
            `}
          >
            {canPublish ? '✓ 可发布' : '✕ 需修改'}
          </div>
        </div>
      </div>

      {/* AI内容合规（新增） */}
      {aiContentCompliance && (
        <div className="mb-6 p-4 bg-indigo-50 rounded-xl">
          <h4 className="text-sm font-semibold text-indigo-700 mb-3 flex items-center gap-2">
            <span>🤖</span>
            AI内容合规
          </h4>
          <div className="grid grid-cols-2 gap-4">
            {/* AI标识需求 */}
            <div className="bg-white rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">AI标识要求</div>
              <div className={`text-sm font-medium ${aiContentCompliance.needsAILabel ? 'text-amber-600' : 'text-green-600'}`}>
                {aiContentCompliance.needsAILabel ? '需要标注AI生成' : '无需特别标注'}
              </div>
            </div>
            {/* Deepfake风险 */}
            <div className="bg-white rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">Deepfake风险</div>
              <div className={`text-sm font-medium ${
                aiContentCompliance.deepfakeRisk === 'high' ? 'text-red-600' :
                aiContentCompliance.deepfakeRisk === 'medium' ? 'text-yellow-600' :
                'text-green-600'
              }`}>
                {{ high: '高风险', medium: '中风险', low: '低风险' }[aiContentCompliance.deepfakeRisk]}
              </div>
            </div>
          </div>

          {/* 版权风险 */}
          {aiContentCompliance.copyrightRisk && (
            <div className="mt-3 bg-white rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">版权风险</span>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  aiContentCompliance.copyrightRisk.level === 'high' ? 'bg-red-100 text-red-700' :
                  aiContentCompliance.copyrightRisk.level === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {{ high: '高', medium: '中', low: '低' }[aiContentCompliance.copyrightRisk.level]}
                </span>
              </div>
              {aiContentCompliance.copyrightRisk.concerns.length > 0 && (
                <ul className="space-y-1">
                  {aiContentCompliance.copyrightRisk.concerns.map((concern, i) => (
                    <li key={i} className="text-xs text-gray-600 flex items-start gap-1">
                      <span className="text-amber-500">•</span>
                      {concern}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* 肖像权风险 */}
          {aiContentCompliance.likenessRisk && (
            <div className="mt-3 bg-white rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">肖像权风险</span>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  aiContentCompliance.likenessRisk.level === 'high' ? 'bg-red-100 text-red-700' :
                  aiContentCompliance.likenessRisk.level === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {{ high: '高', medium: '中', low: '低' }[aiContentCompliance.likenessRisk.level]}
                </span>
              </div>
              {aiContentCompliance.likenessRisk.concerns.length > 0 && (
                <ul className="space-y-1">
                  {aiContentCompliance.likenessRisk.concerns.map((concern, i) => (
                    <li key={i} className="text-xs text-gray-600 flex items-start gap-1">
                      <span className="text-amber-500">•</span>
                      {concern}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {/* 平台适配性（AI漫剧平台） */}
      {compliance.platformSuitability && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-600 mb-3">AI漫剧平台适配性</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(compliance.platformSuitability).map(([platform, statusOrDetailed]) => {
              // 处理详细格式和简单格式
              const status = isPlatformComplianceStatus(statusOrDetailed) ? statusOrDetailed.status : statusOrDetailed;
              const config = PLATFORM_SUITABILITY_CONFIG[status as keyof typeof PLATFORM_SUITABILITY_CONFIG] || PLATFORM_SUITABILITY_CONFIG.needs_modification;
              const platformInfo = AI_COMIC_PLATFORM_LABELS[platform] || { name: platform, icon: '📌' };

              return (
                <div
                  key={platform}
                  className={`p-3 ${config.bg} rounded-lg`}
                >
                  <div className="flex items-center gap-1 mb-1">
                    <span>{platformInfo.icon}</span>
                    <span className="text-sm font-medium text-gray-700">
                      {platformInfo.name}
                    </span>
                  </div>
                  <div className={`text-lg ${config.color}`}>{config.icon}</div>
                  <div className={`text-xs ${config.color}`}>{config.label}</div>
                  {/* 如果是详细格式，显示问题 */}
                  {isPlatformComplianceStatus(statusOrDetailed) && statusOrDetailed.issues.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      {statusOrDetailed.issues.slice(0, 2).map((issue, i) => (
                        <div key={i} className="truncate">• {issue}</div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 价值导向评估 */}
      {valueOrientation && (
        <div className="mb-6 p-4 bg-green-50 rounded-xl">
          <h4 className="text-sm font-semibold text-green-700 mb-3 flex items-center gap-2">
            <span>✨</span>
            价值导向评估
            <span className={`ml-auto px-2 py-0.5 rounded text-xs ${
              valueOrientation.score >= 8 ? 'bg-green-200 text-green-700' :
              valueOrientation.score >= 6 ? 'bg-yellow-200 text-yellow-700' :
              'bg-red-200 text-red-700'
            }`}>
              {valueOrientation.score}/10
            </span>
          </h4>
          <div className="text-sm text-gray-700 mb-2">
            <span className="text-gray-500">主题：</span>
            {valueOrientation.mainTheme}
          </div>
          {valueOrientation.positiveElements.length > 0 && (
            <div className="mb-2">
              <span className="text-xs text-green-600">正向元素：</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {valueOrientation.positiveElements.map((el, i) => (
                  <span key={i} className="px-2 py-0.5 bg-white text-green-700 text-xs rounded">
                    {el}
                  </span>
                ))}
              </div>
            </div>
          )}
          {valueOrientation.concerns.length > 0 && (
            <div className="mb-2">
              <span className="text-xs text-amber-600">需关注：</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {valueOrientation.concerns.map((el, i) => (
                  <span key={i} className="px-2 py-0.5 bg-white text-amber-700 text-xs rounded">
                    {el}
                  </span>
                ))}
              </div>
            </div>
          )}
          {valueOrientation.moralClosure && (
            <div className="text-xs text-gray-600 mt-2 p-2 bg-white rounded">
              <span className="text-gray-500">道德闭环：</span>
              {valueOrientation.moralClosure}
            </div>
          )}
        </div>
      )}

      {/* 合规问题 */}
      {compliance?.issues && compliance.issues.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-600 mb-3">
            合规问题 ({compliance.issues.length}项)
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {compliance.issues.map((issue, index) => {
              const config = RISK_LEVEL_CONFIG[issue.severity] || RISK_LEVEL_CONFIG.medium;
              return (
                <div
                  key={index}
                  className={`p-3 ${config.bg} rounded-lg`}
                >
                  <div className="flex items-start gap-2">
                    <span className={`text-sm ${config.text}`}>{config.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-xs px-1.5 py-0.5 rounded ${config.text} bg-white/50`}>
                          {issue.type}
                        </span>
                        {issue.location && (
                          <span className="text-xs text-gray-500">{issue.location}</span>
                        )}
                        {issue.affectedPlatforms && issue.affectedPlatforms.length > 0 && (
                          <span className="text-xs text-gray-400">
                            影响：{issue.affectedPlatforms.join('、')}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700">{issue.content}</p>
                      {issue.suggestion && (
                        <p className="text-xs text-blue-600 mt-1">
                          💡 {issue.suggestion}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 市场风险、制作风险、平台政策风险 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <RiskCard
          title="市场风险"
          icon="📊"
          risks={marketRisks || []}
          bgColor="bg-blue-50"
        />
        <RiskCard
          title="制作风险"
          icon="🎬"
          risks={productionRisks || []}
          bgColor="bg-purple-50"
        />
        <RiskCard
          title="平台政策风险"
          icon="📋"
          risks={platformRisks || []}
          bgColor="bg-amber-50"
        />
      </div>

      {/* 修改建议 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* 必须修改 */}
        {requiredChanges?.length > 0 && (
          <div className="p-4 bg-red-50 rounded-xl">
            <h4 className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-1">
              <span>🔴</span> 必须修改
            </h4>
            <ul className="space-y-1">
              {requiredChanges.map((change, i) => (
                <li key={i} className="text-sm text-red-600 flex items-start gap-1">
                  <span className="mt-1">•</span>
                  <span>{change}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 建议修改 */}
        {recommendedChanges?.length > 0 && (
          <div className="p-4 bg-yellow-50 rounded-xl">
            <h4 className="text-sm font-semibold text-yellow-700 mb-2 flex items-center gap-1">
              <span>🟡</span> 建议修改
            </h4>
            <ul className="space-y-1">
              {recommendedChanges.map((change, i) => (
                <li key={i} className="text-sm text-yellow-600 flex items-start gap-1">
                  <span className="mt-1">•</span>
                  <span>{change}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 平台特定修改建议 */}
      {platformSpecificChanges && (
        <div className="p-4 bg-gray-50 rounded-xl">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span>📝</span>
            平台特定修改建议
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {platformSpecificChanges.hongGuo && platformSpecificChanges.hongGuo.length > 0 && (
              <div className="bg-white rounded-lg p-3">
                <div className="flex items-center gap-1 mb-2">
                  <span>🍎</span>
                  <span className="text-sm font-medium text-gray-700">红果短剧</span>
                </div>
                <ul className="space-y-1">
                  {platformSpecificChanges.hongGuo.map((change, i) => (
                    <li key={i} className="text-xs text-gray-600">• {change}</li>
                  ))}
                </ul>
              </div>
            )}
            {platformSpecificChanges.fanQie && platformSpecificChanges.fanQie.length > 0 && (
              <div className="bg-white rounded-lg p-3">
                <div className="flex items-center gap-1 mb-2">
                  <span>🍅</span>
                  <span className="text-sm font-medium text-gray-700">番茄短剧</span>
                </div>
                <ul className="space-y-1">
                  {platformSpecificChanges.fanQie.map((change, i) => (
                    <li key={i} className="text-xs text-gray-600">• {change}</li>
                  ))}
                </ul>
              </div>
            )}
            {platformSpecificChanges.overseas && platformSpecificChanges.overseas.length > 0 && (
              <div className="bg-white rounded-lg p-3">
                <div className="flex items-center gap-1 mb-2">
                  <span>🌍</span>
                  <span className="text-sm font-medium text-gray-700">海外平台</span>
                </div>
                <ul className="space-y-1">
                  {platformSpecificChanges.overseas.map((change, i) => (
                    <li key={i} className="text-xs text-gray-600">• {change}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 年龄分级说明 */}
      {ageRating && ageRating.reason && (
        <div className="mt-4 p-3 bg-gray-100 rounded-lg">
          <div className="text-xs text-gray-500">
            <span className="font-medium">年龄分级说明：</span>
            {ageRating.reason}
          </div>
          {ageRating.platformImplications && (
            <div className="text-xs text-gray-500 mt-1">
              <span className="font-medium">平台影响：</span>
              {ageRating.platformImplications}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default RiskAssessment;
