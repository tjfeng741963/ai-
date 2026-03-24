import { motion } from 'framer-motion';
import {
  Target,
  FileText,
  BookOpen,
  Lightbulb,
  TrendingUp,
} from 'lucide-react';
import type { ExecutiveSummary as ExecutiveSummaryType } from '../types/rating-advanced';
import type { GradeLevel } from '../types/rating';
import { GRADE_CONFIG } from '../types/rating';

interface ExecutiveSummaryProps {
  data: ExecutiveSummaryType;
  overallScore: number;
  overallGrade: GradeLevel;
}

export function ExecutiveSummary({ data, overallScore, overallGrade }: ExecutiveSummaryProps) {
  const gradeConfig = GRADE_CONFIG[overallGrade];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
    >
      {/* Header with Score */}
      <div className={`p-6 bg-gradient-to-r ${gradeConfig.bgColor.replace('bg-', 'from-').replace('/10', '/20')} to-white`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className={`text-5xl font-black ${gradeConfig.color}`}>
                {overallGrade}
              </span>
              <div>
                <div className="text-3xl font-bold text-gray-800">
                  {overallScore.toFixed(0)}
                  <span className="text-lg text-gray-400">/100</span>
                </div>
                <div className={`text-sm font-medium ${gradeConfig.color}`}>
                  {gradeConfig.label}
                </div>
              </div>
            </div>

            {/* One Sentence */}
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              {data.oneSentence}
            </h2>

            {/* Genre & Themes */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`
                px-3 py-1 rounded-full text-sm font-medium
                ${data.genre === '男频' ? 'bg-blue-100 text-blue-700' : ''}
                ${data.genre === '女频' ? 'bg-pink-100 text-pink-700' : ''}
                ${data.genre === '中性' ? 'bg-gray-100 text-gray-700' : ''}
              `}>
                {data.genre}
              </span>
              {data.themes.map((theme, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full"
                >
                  {theme}
                </span>
              ))}
            </div>
          </div>

          {/* Circular Score Indicator */}
          <div className="relative w-24 h-24 hidden sm:block">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="42"
                fill="none"
                stroke="#f1f5f9"
                strokeWidth="6"
              />
              <motion.circle
                cx="48"
                cy="48"
                r="42"
                fill="none"
                stroke="url(#scoreGradient)"
                strokeWidth="6"
                strokeLinecap="round"
                initial={{ strokeDasharray: '0 264' }}
                animate={{ strokeDasharray: `${(overallScore / 100) * 264} 264` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-indigo-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Plot Summary */}
      <div className="p-6 border-t border-gray-100">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
          <BookOpen className="w-4 h-4 text-indigo-500" />
          剧情主线
        </h3>
        <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">
          {data.plotSummary}
        </p>
      </div>

      {/* Core Conclusion */}
      <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-indigo-700 mb-3">
          <Lightbulb className="w-4 h-4" />
          核心结论
        </h3>
        <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-line">
          {data.coreConclusion}
        </p>
      </div>
    </motion.div>
  );
}

export default ExecutiveSummary;
