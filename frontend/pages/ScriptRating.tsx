import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Sparkles,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Upload,
  X,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Target,
  Users,
  TrendingUp,
  ShieldAlert,
  Clapperboard,
  Activity,
  Layers,
  History,
  Save,
  Download,
  Printer,
  HelpCircle,
  Tag,
} from 'lucide-react';
import { useRatingStore } from '@/store/ratingStore.ts';
import { analyzeScript, analyzeScriptAdvanced, analyzeScriptDetailed } from '@/services/volcengine.ts';
import { DIMENSION_LABELS, GRADE_CONFIG } from '@/types/rating.ts';
import type { RatingResult, DimensionScore, GradeLevel } from '@/types/rating.ts';
import type { AdvancedRatingResult } from '@/types/rating-advanced.ts';
import { RadarChart } from '@/components/ui/RadarChart.tsx';
import { AnalysisProgress } from '@/components/ui/AnalysisProgress.tsx';
import { EmotionCurve } from '@/components/ui/EmotionCurve.tsx';
import { CharacterNetwork } from '@/components/ui/CharacterNetwork.tsx';
import { StructureAnalysis } from '@/components/ui/StructureAnalysis.tsx';
import { WorldBuildingAnalysis } from '@/components/ui/WorldBuildingAnalysis.tsx';
import { MarketSuggestion } from '@/components/ui/MarketSuggestion.tsx';
import { RiskAssessment } from '@/components/ui/RiskAssessment.tsx';
import { ProductionFeasibility } from '@/components/ui/ProductionFeasibility.tsx';
import { RatingHistory } from '@/components/ui/RatingHistory.tsx';
import { ExecutiveSummary } from '@/components/ui/ExecutiveSummary.tsx';
import { DetailedAnalysisPanel } from '@/components/ui/DetailedAnalysisPanel.tsx';
import { exportRatingReport } from '@/services/export.ts';
import { extractScriptName } from '@/services/storage.ts';
import { GradeExplanation } from '@/components/ui/GradeExplanation.tsx';
import { ModelSelector } from '@/components/ui/ModelSelector.tsx';
import { MarketTypeSelector } from '@/components/ui/MarketTypeSelector.tsx';
import { OutputLanguageSelector } from '@/components/ui/OutputLanguageSelector.tsx';
import { UploadGuide } from '@/components/ui/UploadGuide.tsx';

// Tab 配置
const TABS = [
  { id: 'overview', label: '总览', icon: BarChart3 },
  { id: 'report', label: '详细报告', icon: FileText },
  { id: 'structure', label: '结构', icon: Layers },
  { id: 'character', label: '人物', icon: Users },
  { id: 'emotion', label: '情感', icon: Activity },
  { id: 'market', label: '市场', icon: TrendingUp },
  { id: 'risk', label: '风险', icon: ShieldAlert },
] as const;

export function ScriptRating() {
  const {
    scriptContent,
    status,
    result,
    advancedResult,
    error,
    progress,
    currentStep,
    analysisMode,
    phases,
    currentPhaseIndex,
    activeTab,
    historyRecords,
    selectedRecordId,
    showHistory,
    setScriptContent,
    setAnalysisMode,
    marketType,
    setMarketType,
    outputLanguage,
    setOutputLanguage,
    startAnalyzing,
    setProgress,
    updatePhase,
    setResult,
    setAdvancedResult,
    setError,
    setActiveTab,
    reset,
    loadHistory,
    saveToHistory,
    deleteFromHistory,
    clearHistory,
    loadFromRecord,
    toggleHistory,
    renameRecord,
  } = useRatingStore();

  const [expandedDimension, setExpandedDimension] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const [showGradeHelp, setShowGradeHelp] = useState(false);

  // 分析完成后自动保存
  useEffect(() => {
    if (status === 'completed' && (result || advancedResult) && !selectedRecordId) {
      const record = saveToHistory();
      if (record) {
        setJustSaved(true);
        setTimeout(() => setJustSaved(false), 3000);
      }
    }
  }, [status, result, advancedResult]);

  // 开始分析
  const handleAnalyze = async () => {
    if (!scriptContent.trim()) {
      setError('请输入剧本内容');
      return;
    }

    startAnalyzing();

    try {
      if (analysisMode === 'advanced') {
        // 深度分析模式 - 使用新的详细分析函数
        const result = await analyzeScriptDetailed(
          scriptContent,
          (p, phase, step, phaseIndex) => {
            setProgress(p, `${phase}: ${step}`, phaseIndex);
          },
          (phase) => {
            updatePhase(phase);
          },
          undefined,
          marketType,
          outputLanguage
        );
        // 设置基础结果和高级结果
        setResult({
          overallScore: result.overallScore,
          overallGrade: result.overallGrade,
          gradeLabel: result.gradeLabel ?? '',
          dimensions: result.dimensions,
          summary: result.summary,
          highlights: result.highlights,
          improvements: result.improvements,
          risks: result.risks ?? { compliance: [], market: [], production: [] },
        });
        setAdvancedResult(result);
      } else {
        // 快速分析模式
        const result = await analyzeScript(scriptContent, (p, step) => {
          setProgress(p, step);
        });
        setResult(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '分析失败');
    }
  };

  // 处理文件上传
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setScriptContent(content);
    };
    reader.readAsText(file);
  };

  const isAnalyzing = status === 'analyzing';
  const hasResult = result || advancedResult;

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">AI漫剧评级系统</h1>
              <p className="text-gray-500 text-sm">上传剧本，获取AI漫剧专业的多维度评级报告</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* 分析模式切换 */}
            <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm">
              <button
                onClick={() => setAnalysisMode('simple')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  analysisMode === 'simple'
                    ? 'bg-indigo-500 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                快速分析
              </button>
              <button
                onClick={() => setAnalysisMode('advanced')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  analysisMode === 'advanced'
                    ? 'bg-indigo-500 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                深度分析
              </button>
            </div>

            {/* 分隔线 */}
            <div className="w-px h-8 bg-gray-200" />

            {/* 市场选择器 */}
            <MarketTypeSelector value={marketType} onChange={setMarketType} compact />

            {/* 语言选择器 */}
            <OutputLanguageSelector value={outputLanguage} onChange={setOutputLanguage} compact />

            {/* 分隔线 */}
            <div className="w-px h-8 bg-gray-200" />

            {/* 模型选择器 */}
            <ModelSelector compact />

            {/* 历史记录按钮 */}
            <button
              onClick={toggleHistory}
              className="relative flex items-center gap-2 px-4 py-2 rounded-lg bg-white shadow-sm hover:bg-gray-50 transition-colors"
            >
              <History className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">历史</span>
              {historyRecords.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-indigo-500 text-white text-xs flex items-center justify-center">
                  {historyRecords.length > 9 ? '9+' : historyRecords.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* 输入区域 */}
        {!hasResult && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左侧：剧本输入 */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-500" />
                    剧本内容
                  </h2>
                  <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 cursor-pointer transition-colors text-sm">
                    <Upload className="w-4 h-4" />
                    上传文件
                    <input
                      type="file"
                      accept=".txt,.md"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
                <textarea
                  value={scriptContent}
                  onChange={(e) => setScriptContent(e.target.value)}
                  placeholder="请粘贴剧本内容，或上传 .txt / .md 文件...&#10;&#10;支持的格式：&#10;- 标准剧本格式（场景、人物、对白）&#10;- 小说稿/故事大纲&#10;- 分集大纲"
                  className="w-full h-[500px] p-4 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none text-sm leading-relaxed"
                />
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">
                      {scriptContent.length.toLocaleString()} 字
                      {scriptContent.length > 0 && scriptContent.length < 500 && (
                        <span className="ml-2 text-amber-500">
                          (建议至少 500 字以获得更准确的分析)
                        </span>
                      )}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      marketType === 'domestic'
                        ? 'bg-red-50 text-red-600 border border-red-200'
                        : 'bg-blue-50 text-blue-600 border border-blue-200'
                    }`}>
                      {marketType === 'domestic' ? '🇨🇳 国内市场' : '🌏 出海市场'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {scriptContent && (
                      <button
                        onClick={reset}
                        className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-sm"
                      >
                        清空
                      </button>
                    )}
                    <button
                      onClick={handleAnalyze}
                      disabled={isAnalyzing || !scriptContent.trim()}
                      className="px-6 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-indigo-500/25"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          分析中...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          开始评级
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* 错误提示 */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3"
                  >
                    <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-red-700">分析失败</p>
                      <p className="text-sm text-red-600 mt-1">{error}</p>
                    </div>
                    <button onClick={() => setError('')} className="text-red-400 hover:text-red-500">
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 右侧：分析进度 / 说明 */}
            <div className="space-y-4">
              {isAnalyzing && analysisMode === 'advanced' ? (
                <AnalysisProgress
                  phases={phases}
                  currentPhaseIndex={currentPhaseIndex}
                  totalProgress={progress}
                  isAnalyzing={isAnalyzing}
                />
              ) : isAnalyzing ? (
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                    <span className="font-medium">{currentStep}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-600"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">{progress}%</p>
                </div>
              ) : (
                <UploadGuide analysisMode={analysisMode} />
              )}
            </div>
          </div>
        )}

        {/* 结果展示 */}
        {hasResult && (
          <div className="space-y-6">
            {/* Tab 导航 */}
            <div className="flex items-center justify-between">
              <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  // 只有总览对简单分析可用，其他 tab 需要高级分析结果
                  const isDisabled = !advancedResult && tab.id !== 'overview';
                  // 详细报告 tab 需要 detailedAnalysis 数据
                  const isReportDisabled = tab.id === 'report' && !advancedResult?.detailedAnalysis;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => !(isDisabled || isReportDisabled) && setActiveTab(tab.id)}
                      disabled={isDisabled || isReportDisabled}
                      className={`
                        flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                        ${isActive ? 'bg-indigo-500 text-white shadow-sm' : ''}
                        ${!isActive && !(isDisabled || isReportDisabled) ? 'text-gray-600 hover:bg-gray-100' : ''}
                        ${(isDisabled || isReportDisabled) ? 'text-gray-300 cursor-not-allowed' : ''}
                      `}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                {/* 导出按钮 */}
                <div className="relative group">
                  <button
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90 transition-opacity text-sm flex items-center gap-2 shadow-lg shadow-indigo-500/25"
                  >
                    <Download className="w-4 h-4" />
                    导出报告
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                    <button
                      onClick={() => {
                        const scriptName = extractScriptName(scriptContent);
                        exportRatingReport(result!, advancedResult || undefined, {
                          format: 'html',
                          scriptName,
                          language: outputLanguage,
                          includeSummary: true,
                          includeDetailedAnalysis: true,
                          includeRecommendations: true,
                        });
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2 rounded-t-xl"
                    >
                      <FileText className="w-4 h-4 text-indigo-500" />
                      导出为 HTML
                    </button>
                    <button
                      onClick={() => {
                        const scriptName = extractScriptName(scriptContent);
                        exportRatingReport(result!, advancedResult || undefined, {
                          format: 'markdown',
                          scriptName,
                          language: outputLanguage,
                          includeSummary: true,
                          includeDetailedAnalysis: true,
                          includeRecommendations: true,
                        });
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4 text-gray-500" />
                      导出为 Markdown
                    </button>
                    <button
                      onClick={() => {
                        const scriptName = extractScriptName(scriptContent);
                        exportRatingReport(result!, advancedResult || undefined, {
                          format: 'pdf',
                          scriptName,
                          language: outputLanguage,
                          includeSummary: true,
                          includeDetailedAnalysis: true,
                          includeRecommendations: true,
                        });
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2 rounded-b-xl border-t border-gray-100"
                    >
                      <Printer className="w-4 h-4 text-gray-500" />
                      导出为 PDF
                    </button>
                  </div>
                </div>

                <button
                  onClick={reset}
                  className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-sm flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  新的分析
                </button>
              </div>
            </div>

            {/* Tab 内容 */}
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && result && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* AI漫剧标签展示（最重要） */}
                  {advancedResult?.executiveSummary && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-4 border border-indigo-100"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                          <Tag className="w-5 h-5 text-indigo-500" />
                          AI漫剧标签
                        </h3>
                        <button
                          onClick={() => setShowGradeHelp(!showGradeHelp)}
                          className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
                        >
                          <HelpCircle className="w-4 h-4" />
                          评级说明
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {/* 频类标签 */}
                        <span className={`
                          px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm
                          ${advancedResult.executiveSummary.genre === '男频' ? 'bg-blue-500 text-white' : ''}
                          ${advancedResult.executiveSummary.genre === '女频' ? 'bg-pink-500 text-white' : ''}
                          ${advancedResult.executiveSummary.genre === '中性' ? 'bg-gray-500 text-white' : ''}
                        `}>
                          {advancedResult.executiveSummary.genre}
                        </span>
                        {/* 子类型标签 */}
                        {advancedResult.executiveSummary.subGenre && (
                          <span className="px-3 py-1.5 bg-purple-500 text-white rounded-full text-sm font-medium shadow-sm">
                            {advancedResult.executiveSummary.subGenre}
                          </span>
                        )}
                        {/* 题材标签 */}
                        {advancedResult.executiveSummary.themes.map((theme, i) => (
                          <span
                            key={i}
                            className="px-3 py-1.5 bg-white text-indigo-700 rounded-full text-sm font-medium shadow-sm border border-indigo-200"
                          >
                            {theme}
                          </span>
                        ))}
                        {/* 平台推荐标签 */}
                        {advancedResult.executiveSummary.platformTags?.map((tag, i) => (
                          <span
                            key={`platform-${i}`}
                            className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium shadow-sm border border-green-200"
                          >
                            #{tag}
                          </span>
                        ))}
                        {/* 评级标签 */}
                        <span className={`
                          px-3 py-1.5 rounded-full text-sm font-bold shadow-sm
                          ${result.overallGrade === 'S' ? 'bg-amber-500 text-white' : ''}

                          ${result.overallGrade === 'A' ? 'bg-indigo-500 text-white' : ''}
                          ${result.overallGrade === 'B' ? 'bg-blue-500 text-white' : ''}
                          ${result.overallGrade === 'C' ? 'bg-gray-500 text-white' : ''}
                          ${result.overallGrade === 'D' ? 'bg-red-500 text-white' : ''}
                        `}>
                          {result.overallGrade}级 · {result.overallScore.toFixed(0)}分
                        </span>
                      </div>
                      {/* AI漫剧亮点 */}
                      {advancedResult.executiveSummary.aiComicHighlights && advancedResult.executiveSummary.aiComicHighlights.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-indigo-100">
                          <p className="text-xs text-indigo-600 font-medium mb-2">AI漫剧亮点</p>
                          <div className="flex flex-wrap gap-1">
                            {advancedResult.executiveSummary.aiComicHighlights.map((highlight, i) => (
                              <span key={i} className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded">
                                {highlight}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* 评级标准说明（可折叠） */}
                  <AnimatePresence>
                    {showGradeHelp && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <GradeExplanation />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* 执行摘要（如果有） */}
                  {advancedResult?.executiveSummary && (
                    <ExecutiveSummary
                      data={advancedResult.executiveSummary}
                      overallScore={result.overallScore}
                      overallGrade={result.overallGrade as GradeLevel}
                    />
                  )}

                  {/* 基础评级面板 */}
                  <RatingResultPanel
                    result={result}
                    expandedDimension={expandedDimension}
                    setExpandedDimension={setExpandedDimension}
                  />
                </motion.div>
              )}

              {activeTab === 'report' && advancedResult?.detailedAnalysis && (
                <motion.div
                  key="report"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <DetailedAnalysisPanel
                    detailedAnalysis={advancedResult.detailedAnalysis}
                    actionableRecommendations={advancedResult.actionableRecommendations || []}
                    finalSummary={advancedResult.finalSummary}
                    outputLanguage={outputLanguage}
                  />
                </motion.div>
              )}

              {activeTab === 'structure' && advancedResult?.structureAnalysis && (
                <motion.div
                  key="structure"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* 世界观分析 */}
                  {advancedResult.structureAnalysis.worldBuilding && (
                    <WorldBuildingAnalysis data={advancedResult.structureAnalysis.worldBuilding} />
                  )}

                  {/* 结构分析 */}
                  <StructureAnalysis
                    actStructure={advancedResult.structureAnalysis.actStructure || []}
                    turningPoints={advancedResult.structureAnalysis.turningPoints || []}
                    suspenses={advancedResult.structureAnalysis.suspenses}
                    foreshadowRecoveryRate={advancedResult.structureAnalysis.foreshadowRecoveryRate}
                    structureType={advancedResult.structureAnalysis.structureType}
                    hookPositions={advancedResult.structureAnalysis.hookPositions}
                    cliffhangerCount={advancedResult.structureAnalysis.cliffhangerCount}
                  />
                </motion.div>
              )}

              {activeTab === 'character' && advancedResult?.characterAnalysis && (
                <motion.div
                  key="character"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <CharacterNetwork
                    characters={advancedResult.characterAnalysis.characters || []}
                    relationships={advancedResult.characterAnalysis.relationships || []}
                    goldenLines={advancedResult.characterAnalysis.goldenLines}
                    voiceDistinction={advancedResult.characterAnalysis.voiceDistinction}
                  />
                </motion.div>
              )}

              {activeTab === 'emotion' && advancedResult?.emotionAnalysis && (
                <motion.div
                  key="emotion"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <EmotionCurve
                    emotionCurve={advancedResult.emotionAnalysis.emotionCurve || []}
                    pleasurePoints={advancedResult.emotionAnalysis.majorPleasurePoints}
                    overallArc={advancedResult.emotionAnalysis.overallArc}
                    emotionTags={advancedResult.emotionAnalysis.emotionTags}
                  />
                </motion.div>
              )}

              {activeTab === 'market' && advancedResult?.marketSuggestion && (
                <motion.div
                  key="market"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start"
                >
                  <MarketSuggestion data={advancedResult.marketSuggestion} />
                  {advancedResult.productionFeasibility && (
                    <ProductionFeasibility data={advancedResult.productionFeasibility} />
                  )}
                </motion.div>
              )}

              {activeTab === 'risk' && advancedResult && (
                <motion.div
                  key="risk"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <RiskAssessment data={advancedResult.riskAssessment} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* 保存成功提示 */}
      <AnimatePresence>
        {justSaved && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 bg-green-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            <span className="font-medium">评级结果已自动保存</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 历史记录面板 */}
      <AnimatePresence>
        {showHistory && (
          <RatingHistory
            records={historyRecords}
            selectedId={selectedRecordId}
            onSelect={loadFromRecord}
            onDelete={deleteFromHistory}
            onClear={clearHistory}
            onRename={renameRecord}
            onClose={toggleHistory}
            onImport={loadHistory}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// 评级结果面板（总览Tab）
function RatingResultPanel({
  result,
  expandedDimension,
  setExpandedDimension,
}: {
  result: RatingResult;
  expandedDimension: string | null;
  setExpandedDimension: (d: string | null) => void;
}) {
  const gradeConfig = GRADE_CONFIG[result.overallGrade as GradeLevel];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {/* 左列 */}
      <div className="space-y-6">
        {/* 总评卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
        >
          <div className="flex items-start gap-6">
            {/* 评分圆环 */}
            <div className="relative w-28 h-28 flex-shrink-0">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  fill="none"
                  stroke="#f1f5f9"
                  strokeWidth="8"
                />
                <motion.circle
                  cx="56"
                  cy="56"
                  r="48"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: '0 301.59' }}
                  animate={{ strokeDasharray: `${(result.overallScore / 100) * 301.59} 301.59` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-gray-800">
                  {result.overallScore.toFixed(1)}
                </span>
                <span className="text-xs text-gray-400">/100</span>
              </div>
            </div>

            {/* 等级信息 */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className={`text-4xl font-bold ${gradeConfig.color}`}>
                  {result.overallGrade}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${gradeConfig.bgColor} ${gradeConfig.color}`}
                >
                  {gradeConfig.label}
                </span>
              </div>
              <p className="text-gray-800 font-medium mb-1">{result.summary.oneSentence}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{result.summary.paragraph}</p>
            </div>
          </div>
        </motion.div>

        {/* 雷达图 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
        >
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-500" />
            维度分析
          </h3>
          <RadarChart dimensions={result.dimensions} />
        </motion.div>
      </div>

      {/* 右列 */}
      <div className="space-y-6">
        {/* 亮点与建议 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* 亮点 */}
          <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              核心亮点
            </h3>
            <ul className="space-y-2">
              {result.highlights.top3Strengths.map((item, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 改进建议 */}
          <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-amber-600">
              <Lightbulb className="w-5 h-5" />
              改进建议
            </h3>
            <ul className="space-y-2">
              {result.improvements.critical.map((item, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">!</span>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
              {result.improvements.important.slice(0, 2).map((item, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">•</span>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* 维度详情 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
        >
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-500" />
            维度详情
          </h3>
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {Object.entries(result.dimensions).map(([key, dim]) => (
              <DimensionItem
                key={key}
                dimensionKey={key}
                dimension={dim as DimensionScore}
                isExpanded={expandedDimension === key}
                onToggle={() =>
                  setExpandedDimension(expandedDimension === key ? null : key)
                }
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// 维度详情项
function DimensionItem({
  dimensionKey,
  dimension,
  isExpanded,
  onToggle,
}: {
  dimensionKey: string;
  dimension: DimensionScore;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const label = DIMENSION_LABELS[dimensionKey] || dimensionKey;
  const scoreColor =
    dimension.score >= 8
      ? 'text-green-600'
      : dimension.score >= 6
        ? 'text-amber-600'
        : 'text-red-500';

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className={`text-lg font-bold ${scoreColor}`}>
            {dimension.score.toFixed(1)}
          </span>
          <span className="font-medium text-gray-700">{label}</span>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
            权重 {(dimension.weight * 100).toFixed(1)}%
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 pb-4 border-t border-gray-100"
          >
            <p className="text-sm text-gray-600 mt-3">{dimension.analysis}</p>
            {dimension.strengths && dimension.strengths.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-green-600 mb-1">优点</p>
                <ul className="text-sm space-y-1">
                  {dimension.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-1 text-gray-600">
                      <span className="text-green-500">+</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {dimension.weaknesses && dimension.weaknesses.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-amber-600 mb-1">待改进</p>
                <ul className="text-sm space-y-1">
                  {dimension.weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-1 text-gray-600">
                      <span className="text-amber-500">-</span>
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {dimension.suggestions && dimension.suggestions.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-indigo-600 mb-1">建议</p>
                <ul className="text-sm space-y-1">
                  {dimension.suggestions.map((s, i) => (
                    <li key={i} className="flex items-start gap-1 text-gray-600">
                      <span className="text-indigo-500">→</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
