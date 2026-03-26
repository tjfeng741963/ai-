/**
 * 扩图模型配置
 *
 * 参照 aigc-storyboard-backend/config/provider-mappings 的层级结构：
 *   Provider → Model → Params
 *
 * 每个 provider 对应 scwh 后端的一个渠道（channel），
 * model 对应该渠道下支持的生图模型。
 */

/** 扩图可用的 Provider 列表 */
export const OUTPAINT_PROVIDERS = [
  {
    id: 'official-stable',
    name: '官方稳定',
    description: '腾讯云官方渠道，质量稳定',
    models: [
      'nanobanana-pro',
      'nanobanana-2',
      'doubao-seedream-5.0',
      'doubao-seedream-4.5',
      'hunyuan-image-3.0',
    ],
    default: true,
  },
  {
    id: 'ai147',
    name: '147AI',
    description: '第三方渠道，速度快',
    models: ['nanobanana-pro', 'nanobanana-2'],
  },
  {
    id: 't8star',
    name: 'T8Star',
    description: '备用渠道',
    models: ['nanobanana-pro'],
  },
];

/**
 * 扩图模型参数定义
 *
 * 每个 model 的 params 定义了该模型支持的可调参数，
 * type: 'select' — 枚举选择, type: 'toggle' — 布尔开关
 */
export const OUTPAINT_MODEL_PARAMS = {
  'nanobanana-pro': {
    label: 'NanoBanana Pro',
    description: '高质量扩图，支持 4K',
    params: {
      quality: {
        type: 'select',
        label: '画质',
        options: [
          { value: '2K', label: '2K' },
          { value: '4K', label: '4K' },
        ],
        default: '4K',
      },
    },
  },
  'nanobanana-2': {
    label: 'NanoBanana 2',
    description: 'GEM 3.1 基础模型',
    params: {
      quality: {
        type: 'select',
        label: '画质',
        options: [
          { value: '2K', label: '2K' },
          { value: '4K', label: '4K' },
        ],
        default: '2K',
      },
    },
  },
  'doubao-seedream-5.0': {
    label: 'Seedream 5.0',
    description: '豆包 Seedream 5.0 Lite',
    params: {
      quality: {
        type: 'select',
        label: '画质',
        options: [
          { value: '2K', label: '2K' },
          { value: '4K', label: '4K' },
        ],
        default: '2K',
      },
    },
  },
  'doubao-seedream-4.5': {
    label: 'Seedream 4.5',
    description: '豆包 Seedream 4.5',
    params: {
      quality: {
        type: 'select',
        label: '画质',
        options: [
          { value: '2K', label: '2K' },
          { value: '4K', label: '4K' },
        ],
        default: '2K',
      },
    },
  },
  'hunyuan-image-3.0': {
    label: '混元 3.0',
    description: '腾讯混元图片 3.0',
    params: {
      quality: {
        type: 'select',
        label: '画质',
        options: [
          { value: '2K', label: '2K' },
          { value: '4K', label: '4K' },
        ],
        default: '2K',
      },
    },
  },
};

/** 获取指定 provider 的模型列表及参数 */
export function getProviderModels(providerId) {
  const provider = OUTPAINT_PROVIDERS.find((p) => p.id === providerId);
  if (!provider) return [];

  return provider.models.map((modelId) => {
    const config = OUTPAINT_MODEL_PARAMS[modelId] || { label: modelId, params: {} };
    return {
      id: modelId,
      label: config.label,
      description: config.description || '',
      params: config.params,
    };
  });
}

/** 获取默认 provider ID */
export function getDefaultProviderId() {
  const defaultProvider = OUTPAINT_PROVIDERS.find((p) => p.default);
  return defaultProvider?.id || OUTPAINT_PROVIDERS[0]?.id || 'ai147';
}

/** 验证 provider + model 组合是否有效 */
export function isValidProviderModel(providerId, modelId) {
  const provider = OUTPAINT_PROVIDERS.find((p) => p.id === providerId);
  if (!provider) return false;
  return provider.models.includes(modelId);
}
