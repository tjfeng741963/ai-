import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ModelInfo, Provider, ProviderId } from '@/types/models.ts';
import {
  getAvailableModels,
  getConfiguredProviders,
  getCurrentModel,
  setCurrentModel,
} from '@/services/volcengine.ts';

interface ModelSelectorProps {
  onModelChange?: (modelId: string, provider: ProviderId) => void;
  compact?: boolean;
}

// 提供商图标
const PROVIDER_ICONS: Record<ProviderId, string> = {
  volcengine: '🌋',
  openai: '🤖',
  claude: '🧠',
  deepseek: '🔍',
  moonshot: '🌙',
  qwen: '💬',
};

// 提供商颜色
const PROVIDER_COLORS: Record<ProviderId, { bg: string; text: string; border: string }> = {
  volcengine: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  openai: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  claude: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  deepseek: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  moonshot: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  qwen: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
};

export function ModelSelector({ onModelChange, compact = false }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState<string>(getCurrentModel().modelId);
  const [selectedProvider, setSelectedProvider] = useState<ProviderId>(getCurrentModel().provider);

  // 加载模型和提供商列表
  useEffect(() => {
    async function loadData() {
      try {
        const [modelList, providerList] = await Promise.all([
          getAvailableModels(),
          getConfiguredProviders(),
        ]);
        setModels(modelList);
        setProviders(providerList);

        // 验证当前选中的模型是否在列表中
        const current = getCurrentModel();
        const modelExists = modelList.some((m) => m.id === current.modelId);
        if (!modelExists && modelList.length > 0) {
          // 如果当前模型不在列表中，重置为第一个可用模型
          const firstModel = modelList[0];
          console.log(`[ModelSelector] 重置模型: ${current.modelId} -> ${firstModel.id}`);
          setSelectedModel(firstModel.id);
          setSelectedProvider(firstModel.provider);
          setCurrentModel({
            provider: firstModel.provider,
            modelId: firstModel.id,
          });
        }
      } catch (error) {
        console.error('加载模型列表失败:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // 按提供商分组模型
  const modelsByProvider = models.reduce(
    (acc, model) => {
      if (!acc[model.provider]) {
        acc[model.provider] = [];
      }
      acc[model.provider].push(model);
      return acc;
    },
    {} as Record<ProviderId, ModelInfo[]>
  );

  // 选择模型
  const handleSelectModel = (model: ModelInfo) => {
    setSelectedModel(model.id);
    setSelectedProvider(model.provider);
    setCurrentModel({
      provider: model.provider,
      modelId: model.id,
    });
    onModelChange?.(model.id, model.provider);
    setIsOpen(false);
  };

  // 当前选中的模型信息
  const currentModelInfo = models.find((m) => m.id === selectedModel);
  const colors = PROVIDER_COLORS[selectedProvider] || PROVIDER_COLORS.volcengine;

  if (loading) {
    return (
      <div className={`${compact ? 'h-8' : 'h-10'} flex items-center px-3 bg-gray-100 rounded-lg animate-pulse`}>
        <span className="text-gray-400 text-sm">加载模型...</span>
      </div>
    );
  }

  // 如果没有配置任何模型，显示默认
  if (models.length === 0) {
    return (
      <div className={`${compact ? 'h-8' : 'h-10'} flex items-center px-3 ${colors.bg} ${colors.border} border rounded-lg`}>
        <span className="mr-2">{PROVIDER_ICONS[selectedProvider]}</span>
        <span className={`text-sm ${colors.text}`}>默认模型</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* 选择按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-3 ${compact ? 'py-1.5' : 'py-2'}
          ${colors.bg} ${colors.border} border rounded-lg
          hover:shadow-sm transition-all cursor-pointer
        `}
      >
        <span>{PROVIDER_ICONS[selectedProvider]}</span>
        <span className={`text-sm font-medium ${colors.text}`}>
          {currentModelInfo?.name || '选择模型'}
        </span>
        <svg
          className={`w-4 h-4 ${colors.text} transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 下拉面板 */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* 遮罩 */}
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

            {/* 面板 */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden"
            >
              <div className="p-3 border-b border-gray-100">
                <h4 className="text-sm font-semibold text-gray-700">选择 AI 模型</h4>
                <p className="text-xs text-gray-500 mt-0.5">选择用于剧本分析的 AI 模型</p>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {Object.entries(modelsByProvider).map(([providerId, providerModels]) => {
                  const provider = providers.find((p) => p.id === providerId);
                  const providerColors = PROVIDER_COLORS[providerId as ProviderId] || PROVIDER_COLORS.volcengine;

                  return (
                    <div key={providerId} className="p-2">
                      {/* 提供商标题 */}
                      <div className="flex items-center gap-2 px-2 py-1 mb-1">
                        <span>{PROVIDER_ICONS[providerId as ProviderId]}</span>
                        <span className="text-xs font-medium text-gray-500">
                          {provider?.name || providerId}
                        </span>
                      </div>

                      {/* 模型列表 */}
                      <div className="space-y-1">
                        {providerModels.map((model) => (
                          <button
                            key={model.id}
                            onClick={() => handleSelectModel(model)}
                            className={`
                              w-full text-left px-3 py-2 rounded-lg transition-all
                              ${selectedModel === model.id
                                ? `${providerColors.bg} ${providerColors.border} border`
                                : 'hover:bg-gray-50'
                              }
                            `}
                          >
                            <div className="flex items-center justify-between">
                              <span className={`text-sm font-medium ${
                                selectedModel === model.id ? providerColors.text : 'text-gray-700'
                              }`}>
                                {model.name}
                              </span>
                              {selectedModel === model.id && (
                                <svg className={`w-4 h-4 ${providerColors.text}`} fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">{model.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-400">
                                上下文: {(model.contextLength / 1000).toFixed(0)}K
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 底部提示 */}
              <div className="p-3 bg-gray-50 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  💡 不同模型有不同的特点，建议使用火山引擎豆包或 GPT-4o 进行剧本分析
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ModelSelector;
