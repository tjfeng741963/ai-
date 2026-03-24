/**
 * AI漫剧评级系统 - 模型类型定义
 */

/** AI 提供商 ID */
export type ProviderId =
  | 'volcengine'
  | 'openai'
  | 'claude'
  | 'deepseek'
  | 'moonshot'
  | 'qwen';

/** 提供商信息 */
export interface Provider {
  id: ProviderId;
  name: string;
  configured: boolean;
}

/** 模型信息 */
export interface ModelInfo {
  id: string;
  provider: ProviderId;
  providerName: string;
  name: string;
  description: string;
  maxTokens: number;
  contextLength: number;
  available: boolean;
}

/** 默认配置 */
export interface DefaultConfig {
  provider: ProviderId;
  model: string;
  temperature: number;
  maxTokens: number;
}

/** 获取模型列表响应 */
export interface GetModelsResponse {
  success: boolean;
  models: ModelInfo[];
  default: DefaultConfig;
}

/** 获取提供商列表响应 */
export interface GetProvidersResponse {
  success: boolean;
  providers: Provider[];
}

/** 模型选择配置 */
export interface ModelSelection {
  provider: ProviderId;
  modelId: string;
  temperature?: number;
  maxTokens?: number;
}

/** 预设模型组 */
export const MODEL_GROUPS: Record<string, { label: string; models: string[] }> = {
  recommended: {
    label: '推荐',
    models: ['ep-20260317144814-4pqbx', 'gpt-4o', 'claude-3-sonnet', 'deepseek-chat'],
  },
  volcengine: {
    label: '火山引擎',
    models: ['ep-20260317144814-4pqbx'],
  },
  openai: {
    label: 'OpenAI',
    models: ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  },
  claude: {
    label: 'Claude',
    models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
  },
  chinese: {
    label: '国产大模型',
    models: ['ep-20260317144814-4pqbx', 'deepseek-chat', 'moonshot-v1-32k', 'qwen-max'],
  },
};
