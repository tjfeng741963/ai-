import { motion } from 'framer-motion';
import type { MarketSuggestion as MarketSuggestionType, PlatformRecommendation, PriceSuggestion } from '../types/rating-advanced';

interface MarketSuggestionProps {
  data: MarketSuggestionType;
}

// AI漫剧平台图标映射
const PLATFORM_ICONS: Record<string, string> = {
  // 国内平台
  '红果短剧': '🍎',
  '红果': '🍎',
  '番茄短剧': '🍅',
  '番茄': '🍅',
  '抖音': '📱',
  '快手': '📲',
  '抖音/快手': '📱',
  // 海外平台
  'ReelShort': '🎬',
  'Dreame': '📖',
  'ShortMax': '🎥',
  'DramaBox': '📦',
  'FlexTV': '📺',
  'TikTok': '🎵',
  'YouTube Shorts': '▶️',
  'YouTube': '▶️',
  // 通用
  '海外': '🌍',
  '海外(ReelShort/Dreame)': '🌍',
  '海外平台': '🌍',
};

// 评级颜色
const LEVEL_COLORS = {
  high: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
  low: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
};

// 收益等级颜色
const TIER_COLORS: Record<string, { bg: string; text: string }> = {
  S: { bg: 'bg-amber-100', text: 'text-amber-700' },
  A: { bg: 'bg-purple-100', text: 'text-purple-700' },
  B: { bg: 'bg-blue-100', text: 'text-blue-700' },
  C: { bg: 'bg-gray-100', text: 'text-gray-700' },
};

// 判断是否为详细平台推荐格式
function isPlatformRecommendation(item: string | PlatformRecommendation): item is PlatformRecommendation {
  return typeof item === 'object' && 'platform' in item;
}

// 判断是否为详细定价格式
function isPriceSuggestion(item: string | PriceSuggestion): item is PriceSuggestion {
  return typeof item === 'object' && 'perEpisode' in item;
}

export function MarketSuggestion({ data }: MarketSuggestionProps) {
  const {
    suggestedPriceRange,
    targetPlatforms,
    marketingAngles,
    titleSuggestions,
    coverScenes,
    similarHits,
    audienceProfile,
    trendMatch,
    viralPotential,
    commercialValue,
    revenueProjection,
  } = data;

  // 处理定价显示
  const renderPrice = () => {
    if (isPriceSuggestion(suggestedPriceRange)) {
      return (
        <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
          <div className="text-sm text-indigo-500 mb-1">AI漫剧定价</div>
          <div className="text-lg font-bold text-indigo-700 mb-1">
            {suggestedPriceRange.perEpisode}
          </div>
          <div className="text-sm text-indigo-600">
            整季: {suggestedPriceRange.fullSeason}
          </div>
          {suggestedPriceRange.reasoning && (
            <p className="text-xs text-indigo-500 mt-2 italic">
              {suggestedPriceRange.reasoning}
            </p>
          )}
        </div>
      );
    }
    return (
      <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
        <div className="text-sm text-indigo-500 mb-1">建议定价</div>
        <div className="text-xl font-bold text-indigo-700">
          ¥{suggestedPriceRange}
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
    >
      {/* 标题 */}
      <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
        <span className="text-xl">📈</span>
        AI漫剧市场分析
      </h3>

      {/* 核心建议 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* 建议定价 */}
        {renderPrice()}

        {/* 收益预测 */}
        {revenueProjection ? (
          <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
            <div className="text-sm text-green-500 mb-1">收益预测</div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded text-sm font-bold ${TIER_COLORS[revenueProjection.tier]?.bg} ${TIER_COLORS[revenueProjection.tier]?.text}`}>
                {revenueProjection.tier}级
              </span>
              <span className="text-green-700 text-sm">{revenueProjection.description}</span>
            </div>
            {revenueProjection.totalEstimate && (
              <div className="text-xs text-green-600 mt-2">
                {revenueProjection.totalEstimate}
              </div>
            )}
          </div>
        ) : viralPotential && (
          <div className="p-4 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl">
            <div className="text-sm text-pink-500 mb-1">传播潜力</div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-pink-700">
                {viralPotential.score}/10
              </span>
              <span className="text-pink-500 text-sm">
                {viralPotential.score >= 8 ? '🔥 高' : viralPotential.score >= 6 ? '⭐ 中' : '💤 低'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 平台推荐 */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-600 mb-3">AI漫剧平台推荐</h4>
        {Array.isArray(targetPlatforms) && targetPlatforms.length > 0 && isPlatformRecommendation(targetPlatforms[0]) ? (
          // 详细平台推荐格式
          <div className="space-y-2">
            {(targetPlatforms as PlatformRecommendation[]).map((platform, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg border ${
                  platform.suitability === 'high' ? 'bg-green-50 border-green-200' :
                  platform.suitability === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-800 flex items-center gap-1">
                    <span>{PLATFORM_ICONS[platform.platform] || '📌'}</span>
                    {platform.platform}
                  </span>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    platform.suitability === 'high' ? 'bg-green-200 text-green-700' :
                    platform.suitability === 'medium' ? 'bg-yellow-200 text-yellow-700' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {platform.suitability === 'high' ? '强烈推荐' :
                     platform.suitability === 'medium' ? '适合' : '一般'}
                  </span>
                </div>
                <p className="text-xs text-gray-600">{platform.reason}</p>
                {platform.expectedRevenue && (
                  <p className="text-xs text-green-600 mt-1">{platform.expectedRevenue}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          // 简单平台列表格式
          <div className="flex flex-wrap gap-2">
            {(targetPlatforms as string[]).map((platform) => (
              <span
                key={platform}
                className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm flex items-center gap-1"
              >
                <span>{PLATFORM_ICONS[platform] || '📌'}</span>
                {platform}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 标题建议 */}
      {titleSuggestions && titleSuggestions.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-600 mb-3">标题建议</h4>
          <div className="space-y-2">
            {titleSuggestions.map((title, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-sm text-gray-700 p-2 bg-indigo-50 rounded-lg"
              >
                <span className="text-indigo-500 font-medium">{i + 1}.</span>
                <span className="font-medium">{title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 受众画像 */}
      {audienceProfile && (
        <div className="mb-6 p-4 bg-gray-50 rounded-xl">
          <h4 className="text-sm font-semibold text-gray-600 mb-3">目标受众</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500">性别偏向：</span>
              <span className="text-gray-700 font-medium">
                {{ male: '男性', female: '女性', neutral: '中性' }[audienceProfile.gender] || audienceProfile.gender}
                {audienceProfile.genderRatio && ` (${audienceProfile.genderRatio})`}
              </span>
            </div>
            <div>
              <span className="text-gray-500">年龄段：</span>
              <span className="text-gray-700 font-medium">
                {audienceProfile.ageRange}岁
                {audienceProfile.primaryAge && ` (核心: ${audienceProfile.primaryAge})`}
              </span>
            </div>
            <div>
              <span className="text-gray-500">市场规模：</span>
              <span className="text-gray-700 font-medium">
                {{ mass: '大众', large: '大众', niche: '垂直', medium: '中等', micro: '小众' }[audienceProfile.marketSize] || audienceProfile.marketSize}
              </span>
            </div>
            {audienceProfile.consumption && (
              <div>
                <span className="text-gray-500">付费意愿：</span>
                <span className="text-gray-700 font-medium">{audienceProfile.consumption}</span>
              </div>
            )}
          </div>
          {audienceProfile.interests?.length > 0 && (
            <div className="mt-3">
              <span className="text-gray-500 text-sm">兴趣标签：</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {audienceProfile.interests.map((interest) => (
                  <span
                    key={interest}
                    className="px-2 py-0.5 bg-white text-gray-600 text-xs rounded-full border"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
          {audienceProfile.psychographics && (
            <p className="mt-2 text-xs text-gray-500 italic">
              {audienceProfile.psychographics}
            </p>
          )}
        </div>
      )}

      {/* 营销切入点 */}
      {marketingAngles?.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-600 mb-3">营销切入点</h4>
          <div className="space-y-2">
            {marketingAngles.map((angle, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-sm text-gray-700 p-2 bg-amber-50 rounded-lg"
              >
                <span className="text-amber-500">💡</span>
                {angle}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 趋势匹配 */}
      {trendMatch && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-600 mb-3">AI漫剧趋势匹配</h4>
          <div className="grid grid-cols-2 gap-4">
            {/* 热门元素 */}
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-xs text-green-600 mb-2 flex items-center gap-1">
                <span>✓</span> 匹配的热门元素
              </div>
              <div className="flex flex-wrap gap-1">
                {trendMatch.hotElements?.map((el) => (
                  <span
                    key={el}
                    className="px-2 py-0.5 bg-white text-green-700 text-xs rounded-full"
                  >
                    {el}
                  </span>
                ))}
              </div>
            </div>

            {/* 缺失元素 */}
            <div className="p-3 bg-red-50 rounded-lg">
              <div className="text-xs text-red-600 mb-2 flex items-center gap-1">
                <span>✕</span> 缺失的热门元素
              </div>
              <div className="flex flex-wrap gap-1">
                {trendMatch.missingElements?.map((el) => (
                  <span
                    key={el}
                    className="px-2 py-0.5 bg-white text-red-700 text-xs rounded-full"
                  >
                    {el}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 当前趋势 */}
          {trendMatch.currentTrends && trendMatch.currentTrends.length > 0 && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <div className="text-xs text-blue-600 mb-2">2024-2026 AI漫剧热门趋势</div>
              <div className="flex flex-wrap gap-1">
                {trendMatch.currentTrends.map((trend) => (
                  <span
                    key={trend}
                    className="px-2 py-0.5 bg-white text-blue-700 text-xs rounded-full"
                  >
                    {trend}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 竞争程度和时机 */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">竞争程度：</span>
              <span className={`px-2 py-0.5 text-xs rounded-full ${LEVEL_COLORS[trendMatch.competitionLevel]?.bg} ${LEVEL_COLORS[trendMatch.competitionLevel]?.text}`}>
                {{ high: '激烈', medium: '适中', low: '蓝海' }[trendMatch.competitionLevel]}
              </span>
            </div>
            {trendMatch.timingScore !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">入场时机：</span>
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  trendMatch.timingScore >= 8 ? 'bg-green-100 text-green-700' :
                  trendMatch.timingScore >= 6 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {trendMatch.timingScore}/10
                </span>
              </div>
            )}
          </div>

          {trendMatch.differentiators?.length > 0 && (
            <div className="mt-3 text-sm">
              <span className="text-gray-500">差异化优势：</span>
              <span className="text-gray-700">{trendMatch.differentiators.join('、')}</span>
            </div>
          )}
        </div>
      )}

      {/* 类似爆款 */}
      {similarHits?.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-600 mb-3">近期AI漫剧爆款参考</h4>
          <div className="space-y-2">
            {similarHits.map((hit, i) => (
              <div
                key={i}
                className="p-3 bg-purple-50 rounded-lg"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-purple-800">
                    《{hit.title}》
                    {hit.platform && <span className="text-purple-500 text-xs ml-2">@{hit.platform}</span>}
                  </span>
                  <span className="text-xs text-purple-500">
                    相似度 {Math.round(hit.similarity * 100)}%
                  </span>
                </div>
                {hit.views && (
                  <div className="text-xs text-purple-600 mb-1">
                    播放量: {hit.views}
                  </div>
                )}
                {hit.learnableAspects?.length > 0 && (
                  <div className="text-xs text-purple-600">
                    可学习：{hit.learnableAspects.join('、')}
                  </div>
                )}
                {hit.differentiators && hit.differentiators.length > 0 && (
                  <div className="text-xs text-green-600 mt-1">
                    差异化：{hit.differentiators.join('、')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 传播潜力详情 */}
      {viralPotential && (
        <div className="mb-6 p-4 bg-pink-50 rounded-xl">
          <h4 className="text-sm font-semibold text-pink-700 mb-3">传播潜力分析</h4>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <span className="text-pink-500">CP感：</span>
              <span className={`font-medium ${LEVEL_COLORS[viralPotential.cpPotential]?.text}`}>
                {{ high: '强', medium: '中', low: '弱' }[viralPotential.cpPotential]}
              </span>
            </div>
            <div>
              <span className="text-pink-500">二创潜力：</span>
              <span className={`font-medium ${LEVEL_COLORS[viralPotential.memeability]?.text}`}>
                {{ high: '高', medium: '中', low: '低' }[viralPotential.memeability]}
              </span>
            </div>
            {viralPotential.clipPotential && (
              <div>
                <span className="text-pink-500">切片潜力：</span>
                <span className={`font-medium ${LEVEL_COLORS[viralPotential.clipPotential]?.text}`}>
                  {{ high: '高', medium: '中', low: '低' }[viralPotential.clipPotential]}
                </span>
              </div>
            )}
          </div>
          {viralPotential.viralScenes?.length > 0 && (
            <div className="mt-3">
              <div className="text-xs text-pink-600 mb-1">可能出圈的场景：</div>
              <div className="space-y-1">
                {viralPotential.viralScenes.map((scene, i) => (
                  <div key={i} className="text-xs text-pink-700 flex items-center gap-1">
                    <span>🔥</span> {scene}
                  </div>
                ))}
              </div>
            </div>
          )}
          {viralPotential.hashtagSuggestions && viralPotential.hashtagSuggestions.length > 0 && (
            <div className="mt-3">
              <div className="text-xs text-pink-600 mb-1">推荐话题标签：</div>
              <div className="flex flex-wrap gap-1">
                {viralPotential.hashtagSuggestions.map((tag, i) => (
                  <span key={i} className="px-2 py-0.5 bg-pink-100 text-pink-700 text-xs rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 封面场景建议 */}
      {coverScenes && coverScenes.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-600 mb-3">封面场景建议</h4>
          <div className="space-y-2">
            {coverScenes.map((scene, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-sm text-gray-700 p-2 bg-indigo-50 rounded-lg"
              >
                <span className="text-indigo-500">🖼️</span>
                {scene}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 商业价值 */}
      {commercialValue && (
        <div className="p-4 bg-amber-50 rounded-xl">
          <h4 className="text-sm font-semibold text-amber-700 mb-3">商业价值评估</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-amber-600">IP潜力：</span>
              <span className={`font-medium ${LEVEL_COLORS[commercialValue.ipPotential]?.text}`}>
                {{ high: '高', medium: '中', low: '低' }[commercialValue.ipPotential]}
              </span>
            </div>
            <div>
              <span className="text-amber-600">世界观深度：</span>
              <span className="font-medium text-amber-800">{commercialValue.worldBuildingDepth}/10</span>
            </div>
            <div>
              <span className="text-amber-600">改编难度：</span>
              <span className={`font-medium ${commercialValue.adaptationDifficulty === 'low' ? 'text-green-600' : commercialValue.adaptationDifficulty === 'high' ? 'text-red-600' : 'text-yellow-600'}`}>
                {{ low: '易', medium: '中', high: '难' }[commercialValue.adaptationDifficulty]}
              </span>
            </div>
          </div>
          {commercialValue.merchandisePotential?.length > 0 && (
            <div className="mt-3">
              <span className="text-xs text-amber-600">周边潜力：</span>
              <span className="text-xs text-amber-800 ml-1">
                {commercialValue.merchandisePotential.join('、')}
              </span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default MarketSuggestion;
