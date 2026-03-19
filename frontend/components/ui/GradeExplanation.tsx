import { motion } from 'framer-motion';
import { Info, Trophy, Star, ThumbsUp, AlertCircle, XCircle } from 'lucide-react';

interface GradeExplanationProps {
  compact?: boolean;
}

/** 评级标准配置 */
const GRADE_STANDARDS = [
  {
    grade: 'S',
    range: '90-100',
    label: '爆款潜力',
    description: '具备重点孵化价值，可直接投入制作',
    characteristics: ['创新题材或独特切入点', '人设有强记忆点', '爽点密集且有效', '商业落地路径清晰'],
    icon: Trophy,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  {
    grade: 'A+',
    range: '85-89',
    label: '高质量剧本',
    description: '有较大商业价值，小幅打磨即可投拍',
    characteristics: ['结构完整、节奏紧凑', '人物立体有弧光', '对白有金句潜力', '市场定位精准'],
    icon: Star,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  {
    grade: 'A',
    range: '80-84',
    label: '优质剧本',
    description: '稳健投资选择，需要针对性优化',
    characteristics: ['主线清晰连贯', '有2-3个明显亮点', '受众定位明确', '合规风险可控'],
    icon: ThumbsUp,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
  },
  {
    grade: 'B',
    range: '70-79',
    label: '良好剧本',
    description: '基础扎实但需要系统打磨',
    characteristics: ['框架合理但缺乏亮点', '部分维度表现突出', '市场竞争力中等', '需要2-3轮修改'],
    icon: Info,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  {
    grade: 'C',
    range: '60-69',
    label: '待完善',
    description: '需要较大修改，投资需谨慎',
    characteristics: ['存在明显逻辑漏洞', '人物/情节薄弱', '市场定位模糊', '需要大幅重写'],
    icon: AlertCircle,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
  },
  {
    grade: 'D',
    range: '<60',
    label: '不建议投资',
    description: '需要大幅重写或放弃',
    characteristics: ['核心创意不成立', '多维度严重不足', '合规风险高', '商业价值低'],
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
];

export function GradeExplanation({ compact = false }: GradeExplanationProps) {
  if (compact) {
    return (
      <div className="bg-white rounded-xl p-4 border border-gray-100">
        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Info className="w-4 h-4 text-indigo-500" />
          评级标准
        </h4>
        <div className="grid grid-cols-3 gap-2 text-xs">
          {GRADE_STANDARDS.slice(0, 6).map((item) => (
            <div
              key={item.grade}
              className={`p-2 rounded-lg ${item.bgColor} ${item.borderColor} border`}
            >
              <div className="flex items-center gap-1 mb-1">
                <span className={`font-bold ${item.color}`}>{item.grade}</span>
                <span className="text-gray-500">({item.range})</span>
              </div>
              <div className="text-gray-600">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
    >
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Info className="w-5 h-5 text-indigo-500" />
        评级标准说明
      </h3>
      <p className="text-sm text-gray-500 mb-6">
        评级基于16个维度的加权综合评分，涵盖创作质量、商业潜力、合规风险等方面。
      </p>

      <div className="space-y-4">
        {GRADE_STANDARDS.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.grade}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-4 rounded-xl border ${item.borderColor} ${item.bgColor}`}
            >
              <div className="flex items-start gap-4">
                {/* Icon & Grade */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${item.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${item.color}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`text-2xl font-black ${item.color}`}>{item.grade}</span>
                    <span className="text-sm text-gray-500">({item.range}分)</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${item.color} ${item.bgColor}`}>
                      {item.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {item.characteristics.map((char, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-1 bg-white/60 rounded-full text-gray-600"
                      >
                        {char}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 评分维度说明 */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">评分维度权重</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <div className="font-medium text-indigo-700">核心创作 40%</div>
            <div className="text-indigo-600/70">钩子、爽点、节奏、悬念、冲突</div>
          </div>
          <div className="p-2 bg-purple-50 rounded-lg">
            <div className="font-medium text-purple-700">人物对白 25%</div>
            <div className="text-purple-600/70">人物塑造、对白质量、逻辑连贯</div>
          </div>
          <div className="p-2 bg-blue-50 rounded-lg">
            <div className="font-medium text-blue-700">市场商业 20%</div>
            <div className="text-blue-600/70">受众、热点、传播、商业价值</div>
          </div>
          <div className="p-2 bg-green-50 rounded-lg">
            <div className="font-medium text-green-700">合规创新 15%</div>
            <div className="text-green-600/70">合规性、价值观、原创性、粘性</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default GradeExplanation;
