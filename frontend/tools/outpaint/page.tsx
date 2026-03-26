/**
 * AI 扩图工具页面
 *
 * 布局参照 scwh/ImageGeneratorPage：
 * 左侧控制面板 (340px) + 右侧画布预览 & 结果展示
 *
 * 流程：上传图片 → 选择渠道/模型 → 选择比例/位置 → (可选)输入提示词 → 生成 → 查看结果 → 对比/下载
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowLeft, Loader2, History, Trash2, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { ImageUploader } from './components/ImageUploader';
import { CanvasPreview } from './components/CanvasPreview';
import { RatioSelector } from './components/RatioSelector';
import { PositionSelector } from './components/PositionSelector';
import { ResultGallery } from './components/ResultGallery';
import { ModelSelector } from './components/ModelSelector';
import type { ModelSelectionState } from './components/ModelSelector';

import { uploadImage, submitOutpaint, getTaskStatus } from './services/api';
import { getSteppedInterval, MAX_POLL_COUNT } from './services/polling';

import type {
  SourceImageInfo,
  AnchorPosition,
  OutpaintResult,
} from './types';
import { PRESET_RATIOS, calcTargetDimensions, anchorToPosition } from './types';

const CACHE_KEY = 'outpaint-results-cache';
const MAX_PROCESSING = 3;

function loadCache(): OutpaintResult[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCache(results: OutpaintResult[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(results.slice(0, 30)));
  } catch {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(results.slice(0, 5)));
    } catch {
      /* ignore */
    }
  }
}

export default function OutpaintPage() {
  const navigate = useNavigate();

  // --- 源图 ---
  const [sourceImage, setSourceImage] = useState<SourceImageInfo | null>(null);

  // --- 模型选择 ---
  const [modelSelection, setModelSelection] = useState<ModelSelectionState>({
    provider: 'official-stable',
    model: 'nanobanana-pro',
    quality: '4K',
  });

  // --- 目标比例 ---
  const [selectedRatio, setSelectedRatio] = useState('16:9');
  const [customWidth, setCustomWidth] = useState(1920);
  const [customHeight, setCustomHeight] = useState(1080);

  // --- 原图位置 ---
  const [anchor, setAnchor] = useState<AnchorPosition>('center');

  // --- 提示词 ---
  const [prompt, setPrompt] = useState('');

  // --- 生成状态 ---
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<OutpaintResult[]>(loadCache);

  // --- 轮询 ---
  const pollTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const pollCounts = useRef<Record<string, number>>({});

  // 缓存同步
  useEffect(() => {
    saveCache(results);
  }, [results]);

  // 清理轮询定时器
  useEffect(() => {
    return () => {
      Object.values(pollTimers.current).forEach(clearTimeout);
    };
  }, []);

  // 恢复 processing 任务的轮询
  const pollingResumed = useRef(false);
  useEffect(() => {
    if (pollingResumed.current) return;
    pollingResumed.current = true;
    results.forEach((r) => {
      if (r.status === 'processing' && r.taskId) {
        startPolling(r.taskId, r.id);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- 计算目标尺寸 ---
  const targetDimensions = useMemo(() => {
    if (!sourceImage) return { width: 1920, height: 1080 };

    if (selectedRatio === 'custom') {
      return {
        width: Math.max(sourceImage.width, customWidth),
        height: Math.max(sourceImage.height, customHeight),
      };
    }

    const ratio = PRESET_RATIOS.find((r) => r.value === selectedRatio);
    if (!ratio) return { width: sourceImage.width, height: sourceImage.height };

    return calcTargetDimensions(sourceImage.width, sourceImage.height, ratio.w, ratio.h);
  }, [sourceImage, selectedRatio, customWidth, customHeight]);

  // 是否需要扩展
  const needsExpansion = useMemo(() => {
    if (!sourceImage) return false;
    return (
      targetDimensions.width > sourceImage.width ||
      targetDimensions.height > sourceImage.height
    );
  }, [sourceImage, targetDimensions]);

  // 扩展轴信息 — 用于 PositionSelector 禁用无效方位
  const canMoveX = useMemo(() => {
    if (!sourceImage) return true;
    return targetDimensions.width > sourceImage.width;
  }, [sourceImage, targetDimensions]);

  const canMoveY = useMemo(() => {
    if (!sourceImage) return true;
    return targetDimensions.height > sourceImage.height;
  }, [sourceImage, targetDimensions]);

  // 当扩展轴变化时，自动将 anchor 修正到有效位置
  useEffect(() => {
    const [rowPart, colPart] = anchor === 'center'
      ? ['center', 'center']
      : anchor.split('-');

    let newRow = rowPart;
    let newCol = colPart;

    // 垂直不可移动 → 行强制 center
    if (!canMoveY && rowPart !== 'center') newRow = 'center';
    // 水平不可移动 → 列强制 center
    if (!canMoveX && colPart !== 'center') newCol = 'center';

    const newAnchor =
      newRow === 'center' && newCol === 'center'
        ? 'center'
        : `${newRow}-${newCol}`;

    if (newAnchor !== anchor) {
      setAnchor(newAnchor as AnchorPosition);
    }
  }, [canMoveX, canMoveY, anchor]);

  // 当前正在处理的任务数
  const processingCount = useMemo(
    () => results.filter((r) => r.status === 'processing' || r.status === 'uploading').length,
    [results],
  );

  // 是否达到最大并发
  const atMaxProcessing = processingCount >= MAX_PROCESSING;

  // --- 轮询逻辑 ---
  const startPolling = useCallback((taskId: string, resultId: string) => {
    pollCounts.current[taskId] = 0;

    const poll = async () => {
      try {
        const status = await getTaskStatus(taskId);

        if (status.status === 'completed' && status.resultUrl) {
          delete pollTimers.current[taskId];
          delete pollCounts.current[taskId];
          setResults((prev) =>
            prev.map((r) =>
              r.id === resultId
                ? { ...r, status: 'completed', progress: 100, resultUrl: status.resultUrl! }
                : r,
            ),
          );
          return;
        }

        if (status.status === 'failed') {
          delete pollTimers.current[taskId];
          delete pollCounts.current[taskId];
          setResults((prev) =>
            prev.map((r) =>
              r.id === resultId
                ? { ...r, status: 'failed', error: status.error || '生成失败' }
                : r,
            ),
          );
          return;
        }

        // 更新进度
        setResults((prev) =>
          prev.map((r) => (r.id === resultId ? { ...r, progress: status.progress } : r)),
        );
      } catch {
        // 轮询失败，继续重试
      }

      const count = pollCounts.current[taskId] ?? 0;
      if (count >= MAX_POLL_COUNT) {
        delete pollTimers.current[taskId];
        delete pollCounts.current[taskId];
        setResults((prev) =>
          prev.map((r) =>
            r.id === resultId ? { ...r, status: 'failed', error: '生成超时' } : r,
          ),
        );
        return;
      }

      pollCounts.current[taskId] = count + 1;
      pollTimers.current[taskId] = setTimeout(poll, getSteppedInterval(count));
    };

    poll();
  }, []);

  // --- 生成 ---
  const handleGenerate = useCallback(async () => {
    if (!sourceImage || !needsExpansion || atMaxProcessing) return;

    setIsGenerating(true);
    const pos = anchorToPosition(anchor);
    const { provider, model, quality } = modelSelection;

    const resultId = `outpaint-${Date.now()}`;

    setResults((prev) => [
      {
        id: resultId,
        taskId: '',
        status: 'uploading',
        progress: 0,
        createdAt: Date.now(),
        params: {
          sourcePreview: sourceImage.preview,
          targetRatio: selectedRatio,
          targetWidth: targetDimensions.width,
          targetHeight: targetDimensions.height,
          anchor,
          prompt,
          provider,
          model,
          quality,
        },
      },
      ...prev,
    ]);

    try {
      // 1. 上传原图
      const imageUrl = await uploadImage(sourceImage.file);

      // 2. 更新状态为 processing
      setResults((prev) =>
        prev.map((r) => (r.id === resultId ? { ...r, status: 'processing' } : r)),
      );

      // 3. 提交扩图任务
      const result = await submitOutpaint({
        image: imageUrl,
        targetWidth: targetDimensions.width,
        targetHeight: targetDimensions.height,
        positionX: pos.x,
        positionY: pos.y,
        prompt: prompt.trim() || undefined,
        numResults: 1,
        provider,
        model,
        quality,
      });

      // 4. 处理响应
      setResults((prev) =>
        prev.map((r) =>
          r.id === resultId
            ? {
                ...r,
                taskId: result.taskId,
                status: result.status === 'completed' ? 'completed' : 'processing',
                resultUrl: result.imageUrl,
              }
            : r,
        ),
      );

      if (result.status !== 'completed') {
        startPolling(result.taskId, resultId);
      }
    } catch (err: any) {
      setResults((prev) =>
        prev.map((r) =>
          r.id === resultId
            ? { ...r, status: 'failed', error: err.message || '生成失败' }
            : r,
        ),
      );
    } finally {
      setIsGenerating(false);
    }
  }, [
    sourceImage,
    needsExpansion,
    atMaxProcessing,
    anchor,
    selectedRatio,
    targetDimensions,
    prompt,
    modelSelection,
    startPolling,
  ]);

  // --- 删除结果 ---
  const handleDeleteResult = useCallback((id: string) => {
    setResults((prev) => prev.filter((r) => r.id !== id));
  }, []);

  // --- 重试 ---
  const handleRetry = useCallback(
    (result: OutpaintResult) => {
      handleDeleteResult(result.id);
      if (sourceImage) {
        handleGenerate();
      }
    },
    [sourceImage, handleGenerate, handleDeleteResult],
  );

  // --- 清除错误结果 ---
  const handleClearErrors = useCallback(() => {
    setResults((prev) => {
      const errorIds = prev.filter((r) => r.status === 'failed').map((r) => r.id);
      // 清理相关的轮询
      errorIds.forEach((id) => {
        const r = prev.find((x) => x.id === id);
        if (r?.taskId && pollTimers.current[r.taskId]) {
          clearTimeout(pollTimers.current[r.taskId]);
          delete pollTimers.current[r.taskId];
          delete pollCounts.current[r.taskId];
        }
      });
      return prev.filter((r) => r.status !== 'failed');
    });
  }, []);

  const hasErrors = useMemo(
    () => results.some((r) => r.status === 'failed'),
    [results],
  );

  // --- 清空全部 ---
  const handleClearAll = useCallback(() => {
    Object.values(pollTimers.current).forEach(clearTimeout);
    pollTimers.current = {};
    pollCounts.current = {};
    setResults([]);
  }, []);

  return (
    <div className="w-full h-[calc(100vh-2rem)] flex flex-col px-4 md:px-6 py-4 overflow-hidden">
      {/* Header — 紧凑 */}
      <motion.div
        className="mb-4 flex-shrink-0"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-1.5 rounded-lg text-cm-on-surface-variant hover:text-cm-on-surface hover:bg-cm-surface-high/50 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-xl font-headline font-bold text-cm-on-surface">AI 扩图</h1>
          <span className="text-xs text-cm-on-surface-variant/50 hidden md:inline">
            上传图片 → 选择比例/位置 → 生成
          </span>
        </div>
      </motion.div>

      {/* 3 列主体布局 */}
      <div className="flex-1 min-h-0 flex gap-4">

        {/* ====== 左列: 操作面板 ====== */}
        <motion.aside
          className="w-[340px] flex-shrink-0 overflow-y-auto scrollbar-thin"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          <div className="frosted-glass rounded-2xl border border-cm-outline-variant/10 p-4 space-y-4">
            {/* 1. 图片上传 */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-cm-on-surface-variant mb-2">
                原始图片
              </label>
              <ImageUploader
                image={sourceImage}
                onImageChange={setSourceImage}
                disabled={isGenerating}
              />
            </div>

            {/* 2. 渠道 / 模型 / 参数 */}
            <ModelSelector
              value={modelSelection}
              onChange={setModelSelection}
              disabled={isGenerating}
            />

            {/* 3. 目标比例 */}
            <RatioSelector
              selectedRatio={selectedRatio}
              customWidth={customWidth}
              customHeight={customHeight}
              onRatioChange={setSelectedRatio}
              onCustomSizeChange={(w, h) => {
                setCustomWidth(w);
                setCustomHeight(h);
              }}
              disabled={isGenerating}
            />
          </div>
        </motion.aside>

        {/* ====== 中列: 画布预览 + 位置/提示词/生成 ====== */}
        <motion.div
          className="w-[360px] flex-shrink-0 flex flex-col gap-3 overflow-y-auto scrollbar-thin"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {/* 画布预览 */}
          <div className="frosted-glass rounded-2xl border border-cm-outline-variant/10 p-4">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-cm-on-surface-variant mb-3 flex items-center justify-between">
              <span>画布预览</span>
              {sourceImage && (
                <span className="text-[10px] font-normal text-cm-on-surface-variant/50">
                  {targetDimensions.width}x{targetDimensions.height}
                </span>
              )}
            </h3>
            <div className="flex items-center justify-center">
              {sourceImage ? (
                <CanvasPreview
                  source={sourceImage}
                  targetWidth={targetDimensions.width}
                  targetHeight={targetDimensions.height}
                  anchor={anchor}
                />
              ) : (
                <div className="text-center text-cm-on-surface-variant/30 py-8">
                  <p className="text-sm font-headline">上传图片后预览扩图效果</p>
                </div>
              )}
            </div>
          </div>

          {/* 位置 + 提示词 + 生成按钮 */}
          <div className="frosted-glass rounded-2xl border border-cm-outline-variant/10 p-4 space-y-4">
            {/* 原图位置 */}
            <PositionSelector
              anchor={anchor}
              onChange={setAnchor}
              disabled={isGenerating}
              canMoveX={canMoveX}
              canMoveY={canMoveY}
            />

            {/* 提示词 */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-cm-on-surface-variant mb-1.5">
                提示词 <span className="text-cm-on-surface-variant/40 normal-case">(可选)</span>
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="描述扩展区域的内容..."
                disabled={isGenerating}
                className="w-full h-16 rounded-xl px-3 py-2 text-xs resize-none bg-cm-surface-high/30 border border-cm-outline-variant/15 text-cm-on-surface placeholder:text-cm-on-surface-variant/30 outline-none focus:border-cm-secondary/40 transition-colors font-body"
              />
            </div>

            {/* 生成按钮 */}
            <button
              onClick={handleGenerate}
              disabled={!sourceImage || !needsExpansion || isGenerating || atMaxProcessing}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-headline font-bold text-sm transition-all duration-500 ${
                sourceImage && needsExpansion && !isGenerating && !atMaxProcessing
                  ? 'bg-gradient-to-r from-cm-secondary to-cm-primary text-cm-surface shadow-lg shadow-cm-primary/20 hover:shadow-cm-primary/40 hover:scale-[1.02] active:scale-[0.98]'
                  : 'bg-cm-surface-high/30 text-cm-on-surface-variant/40 cursor-not-allowed'
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  开始扩图
                </>
              )}
            </button>

            {!sourceImage && (
              <p className="text-[10px] text-cm-on-surface-variant/40 text-center">请先上传一张图片</p>
            )}
            {sourceImage && !needsExpansion && (
              <p className="text-[10px] text-amber-400/70 text-center">
                当前比例与原图一致，无需扩展
              </p>
            )}
            {atMaxProcessing && (
              <p className="text-[10px] text-amber-400/70 text-center">
                已达最大并发数 ({MAX_PROCESSING})
              </p>
            )}
          </div>
        </motion.div>

        {/* ====== 右列: 结果画廊 (flex-1 获得最大空间) ====== */}
        <motion.aside
          className="flex-1 min-w-0 flex flex-col min-h-0"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <div className="frosted-glass rounded-2xl border border-cm-outline-variant/10 p-4 flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3 flex-shrink-0">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-cm-on-surface-variant flex items-center gap-2">
                <History className="w-3.5 h-3.5" />
                结果
                {processingCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-cm-secondary/15 text-cm-secondary text-[10px] font-mono">
                    {processingCount}
                  </span>
                )}
              </h3>
              <div className="flex items-center gap-2">
                {hasErrors && (
                  <button
                    onClick={handleClearErrors}
                    className="flex items-center gap-1 text-[10px] text-cm-on-surface-variant/50 hover:text-amber-400 transition-colors"
                  >
                    <XCircle className="w-3 h-3" />
                    清除错误
                  </button>
                )}
                {results.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="flex items-center gap-1 text-[10px] text-cm-on-surface-variant/50 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    清空
                  </button>
                )}
              </div>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
              <ResultGallery
                results={results}
                onDelete={handleDeleteResult}
                onRetry={handleRetry}
              />
            </div>
          </div>
        </motion.aside>
      </div>
    </div>
  );
}
