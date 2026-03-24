import { motion, AnimatePresence } from 'framer-motion';
import type { AnalysisPhase, AnalysisPhaseStatus } from '../types/rating-advanced';
import { ANALYSIS_PHASES } from '../types/rating-advanced';

interface AnalysisProgressProps {
  phases: AnalysisPhase[];
  currentPhaseIndex: number;
  totalProgress: number;
  isAnalyzing: boolean;
}

const STATUS_CONFIG: Record<AnalysisPhaseStatus, {
  bg: string;
  text: string;
  icon: string;
  ring: string;
}> = {
  pending: {
    bg: 'bg-gray-100',
    text: 'text-gray-400',
    icon: '○',
    ring: 'ring-gray-200',
  },
  in_progress: {
    bg: 'bg-indigo-100',
    text: 'text-indigo-600',
    icon: '◐',
    ring: 'ring-indigo-300',
  },
  completed: {
    bg: 'bg-green-100',
    text: 'text-green-600',
    icon: '✓',
    ring: 'ring-green-300',
  },
  error: {
    bg: 'bg-red-100',
    text: 'text-red-600',
    icon: '✕',
    ring: 'ring-red-300',
  },
};

const PHASE_ICONS = [
  '📐', // 结构分析
  '👥', // 人物分析
  '💫', // 情感分析
  '📊', // 市场分析
  '✅', // 综合评级
];

export function AnalysisProgress({
  phases,
  currentPhaseIndex,
  totalProgress,
  isAnalyzing,
}: AnalysisProgressProps) {
  // 确保有默认阶段数据
  const displayPhases: AnalysisPhase[] = phases.length > 0
    ? phases
    : ANALYSIS_PHASES.map((p) => ({
        id: p.id,
        name: p.name,
        status: 'pending' as AnalysisPhaseStatus,
        progress: 0,
      }));

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      {/* 标题 */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <span className="text-xl">🔄</span>
          分析进度
        </h3>
        <span className="text-2xl font-bold text-indigo-600">
          {totalProgress}%
        </span>
      </div>

      {/* 总进度条 */}
      <div className="mb-6">
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${totalProgress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* 阶段列表 */}
      <div className="space-y-3">
        <AnimatePresence mode="wait">
          {displayPhases.map((phase, index) => {
            const config = STATUS_CONFIG[phase.status];
            const isActive = index === currentPhaseIndex && isAnalyzing;

            return (
              <motion.div
                key={phase.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  relative flex items-center gap-4 p-3 rounded-xl
                  ${config.bg} ${isActive ? 'ring-2 ' + config.ring : ''}
                  transition-all duration-300
                `}
              >
                {/* 阶段图标 */}
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    ${phase.status === 'completed' ? 'bg-green-500 text-white' : ''}
                    ${phase.status === 'in_progress' ? 'bg-indigo-500 text-white' : ''}
                    ${phase.status === 'error' ? 'bg-red-500 text-white' : ''}
                    ${phase.status === 'pending' ? 'bg-gray-200 text-gray-500' : ''}
                    text-lg font-bold
                  `}
                >
                  {phase.status === 'in_progress' ? (
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      ⟳
                    </motion.span>
                  ) : phase.status === 'completed' ? (
                    '✓'
                  ) : phase.status === 'error' ? (
                    '✕'
                  ) : (
                    PHASE_ICONS[index] || '○'
                  )}
                </div>

                {/* 阶段信息 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`font-semibold ${config.text}`}>
                      {phase.name}
                    </span>
                    {phase.status === 'in_progress' && (
                      <span className="text-sm text-indigo-500 font-medium">
                        {phase.progress}%
                      </span>
                    )}
                    {phase.status === 'completed' && phase.duration && (
                      <span className="text-xs text-green-500">
                        {(phase.duration / 1000).toFixed(1)}s
                      </span>
                    )}
                  </div>

                  {/* 阶段进度条 */}
                  {phase.status === 'in_progress' && (
                    <div className="mt-2 h-1.5 bg-indigo-200 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-indigo-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${phase.progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  )}

                  {/* 错误信息 */}
                  {phase.status === 'error' && phase.error && (
                    <p className="mt-1 text-xs text-red-500 truncate">
                      {phase.error}
                    </p>
                  )}
                </div>

                {/* 连接线 */}
                {index < displayPhases.length - 1 && (
                  <div
                    className={`
                      absolute left-[1.4rem] top-[3.5rem] w-0.5 h-3
                      ${phase.status === 'completed' ? 'bg-green-300' : 'bg-gray-200'}
                    `}
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* 提示信息 */}
      {isAnalyzing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 p-3 bg-indigo-50 rounded-lg text-sm text-indigo-600 flex items-center gap-2"
        >
          <span className="animate-pulse">💡</span>
          正在进行深度分析，将评估 16 个维度，请耐心等待...
        </motion.div>
      )}

      {/* 完成提示 */}
      {!isAnalyzing && totalProgress === 100 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 p-3 bg-green-50 rounded-lg text-sm text-green-600 flex items-center gap-2"
        >
          <span>✨</span>
          分析完成！请查看详细报告
        </motion.div>
      )}
    </div>
  );
}

export default AnalysisProgress;
