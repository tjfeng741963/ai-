import {
  FileText,
  Upload,
  Languages,
  Shield,
  Clock,
  Layers,
  Users,
  Activity,
  TrendingUp,
  Clapperboard,
  BarChart3,
} from 'lucide-react';

interface UploadGuideProps {
  analysisMode: 'simple' | 'advanced';
}

export function UploadGuide({ analysisMode }: UploadGuideProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* 标题区 */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-4">
        <h3 className="text-white font-bold text-base">评剧本 · 使用指引</h3>
        <p className="text-indigo-100 text-xs mt-1">AI智能诊断，多维度深度评估</p>
      </div>

      <div className="p-5 space-y-5">
        {/* 输入方式 */}
        <GuideSection
          icon={<Upload className="w-4 h-4" />}
          iconBg="bg-blue-100 text-blue-600"
          title="输入方式"
        >
          <p>支持直接粘贴剧本文本，或上传 <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">.txt</code> / <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">.md</code> 文件</p>
          <p className="text-amber-600 mt-1">建议至少 500 字以获得更准确的分析结果</p>
        </GuideSection>

        {/* 支持格式 */}
        <GuideSection
          icon={<FileText className="w-4 h-4" />}
          iconBg="bg-purple-100 text-purple-600"
          title="支持的剧本格式"
        >
          <ul className="space-y-1">
            <li className="flex items-center gap-1.5">
              <span className="w-1 h-1 bg-purple-400 rounded-full" />
              标准剧本格式（场景、人物、对白）
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1 h-1 bg-purple-400 rounded-full" />
              小说稿 / 故事大纲
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1 h-1 bg-purple-400 rounded-full" />
              分集大纲 / 剧情梗概
            </li>
          </ul>
        </GuideSection>

        {/* 分析内容 */}
        <GuideSection
          icon={<Layers className="w-4 h-4" />}
          iconBg="bg-indigo-100 text-indigo-600"
          title="评估维度"
        >
          {analysisMode === 'advanced' ? (
            <div className="flex flex-wrap gap-1.5">
              {[
                { icon: Layers, label: '结构与世界观' },
                { icon: Users, label: '人物关系' },
                { icon: Activity, label: '情感与爽点' },
                { icon: TrendingUp, label: '市场潜力' },
                { icon: Clapperboard, label: '制作可行性' },
                { icon: Shield, label: '合规审查' },
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs">
                  <Icon className="w-3 h-3" />
                  {label}
                </span>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {['16维度评分', '核心亮点', '改进建议', '雷达图'].map((label) => (
                <span key={label} className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs">
                  <BarChart3 className="w-3 h-3" />
                  {label}
                </span>
              ))}
            </div>
          )}
        </GuideSection>

        {/* 输出语言 */}
        <GuideSection
          icon={<Languages className="w-4 h-4" />}
          iconBg="bg-green-100 text-green-600"
          title="输出语言"
        >
          <p>支持中文 / English 双语输出，可在顶部工具栏切换</p>
        </GuideSection>

        {/* 数据安全 */}
        <GuideSection
          icon={<Shield className="w-4 h-4" />}
          iconBg="bg-amber-100 text-amber-600"
          title="数据安全"
        >
          <p>剧本内容仅用于本次分析，不会被存储或用于模型训练。分析完成后可导出报告留档。</p>
        </GuideSection>

        {/* 预计时间 */}
        <div className="flex items-center gap-2 pt-3 border-t border-gray-100 text-xs text-gray-400">
          <Clock className="w-3.5 h-3.5" />
          预计分析时间：{analysisMode === 'advanced' ? '2-3 分钟（深度分析）' : '30-60 秒（快速分析）'}
        </div>
      </div>
    </div>
  );
}

function GuideSection({
  icon,
  iconBg,
  title,
  children,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-gray-800 mb-1">{title}</h4>
        <div className="text-xs text-gray-500 leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
