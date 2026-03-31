import {
  type ContentType,
  type TypedDimensionScore,
  type TypedRatingResult,
  getContentTypeConfig,
} from '../types/rating';

interface TypedDimensionDisplayProps {
  contentType: ContentType;
  result?: TypedRatingResult | null;
  /** 是否为预览模式（仅展示维度权重，不展示评分） */
  previewOnly?: boolean;
}

/** 权重条颜色 */
function getWeightColor(weight: number): string {
  if (weight >= 0.14) return 'bg-red-400';
  if (weight >= 0.10) return 'bg-orange-400';
  if (weight >= 0.08) return 'bg-blue-400';
  return 'bg-gray-400';
}

/** 评分颜色 */
function getScoreColor(score: number): string {
  if (score >= 8.5) return 'text-red-500';
  if (score >= 7.0) return 'text-orange-500';
  if (score >= 5.5) return 'text-blue-500';
  if (score >= 4.0) return 'text-gray-500';
  return 'text-gray-400';
}

/** 评分背景 */
function getScoreBg(score: number): string {
  if (score >= 8.5) return 'bg-red-50';
  if (score >= 7.0) return 'bg-orange-50';
  if (score >= 5.5) return 'bg-blue-50';
  if (score >= 4.0) return 'bg-gray-50';
  return 'bg-gray-100';
}

export function TypedDimensionDisplay({ contentType, result, previewOnly }: TypedDimensionDisplayProps) {
  const config = getContentTypeConfig(contentType);
  const maxWeight = Math.max(...config.dimensions.map((d) => d.weight));

  return (
    <div className="space-y-4">
      {/* 类型标题 */}
      <div className="flex items-center gap-2">
        <span className="text-lg">{config.icon}</span>
        <h3 className="text-sm font-semibold text-gray-700">
          评测维度 · {config.label}
        </h3>
        <span className="text-xs text-gray-400">
          {config.dimensions.length} 个维度
        </span>
      </div>

      {/* 维度列表 */}
      <div className="space-y-2">
        {config.dimensions.map((dim) => {
          const dimResult: TypedDimensionScore | undefined = result?.dimensions[dim.key];
          const widthPercent = (dim.weight / maxWeight) * 100;

          return (
            <div key={dim.key} className="group">
              {/* 维度行 */}
              <div className="flex items-center gap-3">
                {/* 维度名称 */}
                <div className="w-24 shrink-0 text-right">
                  <span className="text-xs font-medium text-gray-600">{dim.name}</span>
                </div>

                {/* 权重条 */}
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${getWeightColor(dim.weight)}`}
                      style={{ width: `${widthPercent}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-xs text-gray-400 tabular-nums">
                    {(dim.weight * 100).toFixed(0)}%
                  </span>
                </div>

                {/* 评分（仅在有结果时显示） */}
                {!previewOnly && dimResult && (
                  <div className={`w-12 text-center px-2 py-0.5 rounded-md text-xs font-bold tabular-nums ${getScoreColor(dimResult.score)} ${getScoreBg(dimResult.score)}`}>
                    {dimResult.score.toFixed(1)}
                  </div>
                )}
              </div>

              {/* 展开分析（有结果时） */}
              {!previewOnly && dimResult?.analysis && (
                <div className="ml-[calc(6rem+12px)] mt-1 pl-2 border-l-2 border-gray-200">
                  <p className="text-xs text-gray-500 leading-relaxed">{dimResult.analysis}</p>
                  {dimResult.suggestions && dimResult.suggestions.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {dimResult.suggestions.map((s, i) => (
                        <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] bg-blue-50 text-blue-600">
                          💡 {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 总分（有结果时） */}
      {!previewOnly && result && (
        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">加权总分</span>
          <div className="flex items-center gap-3">
            <span className={`text-2xl font-bold tabular-nums ${getScoreColor(result.overallScore)}`}>
              {result.overallScore.toFixed(1)}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreBg(result.overallScore)} ${getScoreColor(result.overallScore)}`}>
              {result.overallGrade} · {result.gradeLabel}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
