'use client';

export interface CustomEndpoint {
  id: string;
  name: string;
  modelName: string;
  baseUrl: string;
  apiKey?: string;
  isDefault?: boolean;
}

export interface ApiKeysConfig {
  anthropicKey: string;
  openaiKey: string;
  deepseekKey: string;
  geminiKey: string;
  ollamaUrl: string;
  customEndpoints: CustomEndpoint[];
}

export const DEFAULT_CUSTOM_ENDPOINTS: CustomEndpoint[] = [
  {
    id: 'ep-openrouter',
    name: 'OpenRouter (Multi-Model Gateway)',
    modelName: 'deepseek/deepseek-r1',
    baseUrl: 'https://openrouter.ai/api/v1',
    apiKey: '',
  },
  {
    id: 'ep-groq',
    name: 'Groq Cloud (Ultra-Fast Inference)',
    modelName: 'llama-3.3-70b-versatile',
    baseUrl: 'https://api.groq.com/openai/v1',
    apiKey: '',
  },
  {
    id: 'ep-local',
    name: 'Local vLLM / Ollama',
    modelName: 'qwen2.5-coder:32b',
    baseUrl: 'http://localhost:11434/v1',
    apiKey: '',
  },
];

export const DEFAULT_API_KEYS: ApiKeysConfig = {
  anthropicKey: '',
  openaiKey: '',
  deepseekKey: '',
  geminiKey: '',
  ollamaUrl: 'http://localhost:11434',
  customEndpoints: DEFAULT_CUSTOM_ENDPOINTS,
};

const STORAGE_KEY = 'forgeos_connected_api_keys';

export function getStoredApiKeys(): ApiKeysConfig {
  if (typeof window === 'undefined') return DEFAULT_API_KEYS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_API_KEYS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_API_KEYS,
      ...parsed,
      customEndpoints: Array.isArray(parsed.customEndpoints) && parsed.customEndpoints.length > 0
        ? parsed.customEndpoints
        : DEFAULT_CUSTOM_ENDPOINTS,
    };
  } catch {
    return DEFAULT_API_KEYS;
  }
}

export function saveStoredApiKeys(keys: ApiKeysConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
  } catch (err) {
    console.error('Failed to save API keys to localStorage', err);
  }
}

export interface ModelOption {
  id: string;
  name: string;
  provider: string;
  cost?: string;
  tag?: string;
}

export const ALL_MODELS: ModelOption[] = [
  { id: 'custom-model', name: 'Custom User Model', provider: 'Custom', cost: 'User Defined', tag: 'Custom Endpoint' },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', cost: '$3.00 / 1M', tag: 'Architecture & Code' },
  { id: 'deepseek/deepseek-coder-v2', name: 'DeepSeek-Coder V2', provider: 'DeepSeek', cost: '$0.28 / 1M', tag: 'Fast Scaffolding' },
  { id: 'openai/gpt-4o', name: 'GPT-4o (Omni)', provider: 'OpenAI', cost: '$2.50 / 1M', tag: 'Reasoning' },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o-mini', provider: 'OpenAI', cost: '$0.15 / 1M', tag: 'Cost-Optimized QA' },
  { id: 'ollama/llama3.1-70b', name: 'Llama 3.1 70B (Local)', provider: 'Ollama', cost: '$0.00 (Self-hosted)', tag: 'Airgap Local' },
];
