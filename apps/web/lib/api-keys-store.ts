'use client';

export interface ApiKeysConfig {
  anthropicKey: string;
  openaiKey: string;
  deepseekKey: string;
  geminiKey: string;
  ollamaUrl: string;
}

export const DEFAULT_API_KEYS: ApiKeysConfig = {
  anthropicKey: '',
  openaiKey: '',
  deepseekKey: '',
  geminiKey: '',
  ollamaUrl: 'http://localhost:11434',
};

const STORAGE_KEY = 'forgeos_connected_api_keys';

export function getStoredApiKeys(): ApiKeysConfig {
  if (typeof window === 'undefined') return DEFAULT_API_KEYS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_API_KEYS;
    return { ...DEFAULT_API_KEYS, ...JSON.parse(raw) };
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
  provider: 'Anthropic' | 'OpenAI' | 'DeepSeek' | 'Google' | 'Ollama';
  cost: string;
  tag: string;
}

export const ALL_MODELS: ModelOption[] = [
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', cost: '$3.00 / 1M', tag: 'Best Architecture & Code' },
  { id: 'anthropic/claude-3.5-haiku', name: 'Claude 3.5 Haiku', provider: 'Anthropic', cost: '$0.80 / 1M', tag: 'Fast Verifier' },
  { id: 'openai/gpt-4o', name: 'GPT-4o (Omni)', provider: 'OpenAI', cost: '$2.50 / 1M', tag: 'Multimodal & Reasoning' },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o-mini', provider: 'OpenAI', cost: '$0.15 / 1M', tag: 'Cost-Optimized QA & Tests' },
  { id: 'deepseek/deepseek-coder-v2', name: 'DeepSeek-Coder V2', provider: 'DeepSeek', cost: '$0.28 / 1M', tag: 'Ultra-Fast Code Gen' },
  { id: 'deepseek/deepseek-chat', name: 'DeepSeek V3', provider: 'DeepSeek', cost: '$0.20 / 1M', tag: 'General Planning' },
  { id: 'gemini/gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'Google', cost: '$1.25 / 1M', tag: 'Massive 2M Context' },
  { id: 'gemini/gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'Google', cost: '$0.075 / 1M', tag: 'Ultra-Low Latency' },
  { id: 'ollama/llama3.1-70b', name: 'Llama 3.1 70B (Local)', provider: 'Ollama', cost: '$0.00 (Self-hosted)', tag: 'Zero-Cloud Airgap' },
  { id: 'ollama/qwen2.5-coder-32b', name: 'Qwen 2.5 Coder 32B (Local)', provider: 'Ollama', cost: '$0.00 (Self-hosted)', tag: 'Local Coding Power' },
];

export function isProviderConnected(provider: string, keys: ApiKeysConfig): boolean {
  switch (provider.toLowerCase()) {
    case 'anthropic':
      return Boolean(keys.anthropicKey?.trim());
    case 'openai':
      return Boolean(keys.openaiKey?.trim());
    case 'deepseek':
      return Boolean(keys.deepseekKey?.trim());
    case 'google':
    case 'gemini':
      return Boolean(keys.geminiKey?.trim());
    case 'ollama':
      return Boolean(keys.ollamaUrl?.trim());
    default:
      return false;
  }
}
