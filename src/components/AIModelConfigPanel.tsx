import React from 'react';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { AIModelType } from '../services/geminiService';

const MODEL_OPTIONS: { label: string; value: AIModelType }[] = [
  { label: 'GPT', value: 'gpt' },
  { label: 'Gemini', value: 'gemini' },
];

const DEFAULT_MODEL_NAME: Record<string, string> = {
  gpt: 'gpt-4o-mini',
  gemini: 'gemini-1.5-flash'
};

interface AIModelConfigPanelProps {
  modelType: AIModelType;
  setModelType: (t: AIModelType) => void;
  modelName: string;
  setModelName: (n: string) => void;
  apiKey: string;
  setApiKey: (k: string) => void;
  hasApiKey: boolean;
  setHasApiKey: (b: boolean) => void;
  error: string;
  setError: (e: string) => void;
  success: string;
  setSuccess: (s: string) => void;
  isValidatingKey: boolean;
  setIsValidatingKey: (b: boolean) => void;
  availableModels: Record<string, any>;
  showApiKeyInput: boolean;
  setShowApiKeyInput: (b: boolean) => void;
}

const AIModelConfigPanel: React.FC<AIModelConfigPanelProps> = ({
  modelType, setModelType, modelName, setModelName, apiKey, setApiKey, hasApiKey, setHasApiKey, error, setError, success, setSuccess, isValidatingKey, setIsValidatingKey, availableModels, showApiKeyInput, setShowApiKeyInput
}) => {
  const modelList: string[] = availableModels?.[modelType]?.models || [];

  // Luôn hiển thị panel nếu có API key hoặc cần nhập API key
  if (!hasApiKey && !showApiKeyInput) return null;

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      setError('Please enter an API key');
      return;
    }
    setIsValidatingKey(true);
    setError('');
    try {
      const validation = await import('../services/geminiService').then(m => m.aiModelService.validateApiKey(modelType, apiKey, modelName));
      if (validation.data?.overall_valid || validation.success) {
        await import('../services/geminiService').then(m => m.aiModelService.setApiKey(modelType, apiKey, modelName));
        setSuccess('API key saved successfully!');
        setApiKey('');
        setHasApiKey(true);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(
          validation.data?.validation_details?.errors?.join(', ') ||
          validation.error ||
          'Invalid API key'
        );
      }
    } catch (error) {
      setError('Error validating API key');
    } finally {
      setIsValidatingKey(false);
    }
  };

  const handleRemoveApiKey = async () => {
    if (confirm('Are you sure you want to remove the API key?')) {
      try {
        await import('../services/geminiService').then(m => m.aiModelService.clearApiKey(modelType));
        setSuccess('API key removed');
        setHasApiKey(false);
        setTimeout(() => setSuccess(''), 3000);
      } catch {
        setError('Failed to remove API key');
      }
    }
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3 mb-4">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">Model type:</label>
        <select
          value={modelType}
          onChange={e => {
            const newType = e.target.value as AIModelType;
            setModelType(newType);
            setModelName(DEFAULT_MODEL_NAME[newType] || '');
            setApiKey('');
            setError('');
            setSuccess('');
          }}
          className="px-2 py-1 border border-gray-300 rounded-lg text-sm"
        >
          {MODEL_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <label className="text-sm font-medium text-gray-700 ml-4">Model:</label>
        <select
          value={modelName}
          onChange={e => setModelName(e.target.value)}
          className="px-2 py-1 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">(Default)</option>
          {modelList.map((m: string) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {MODEL_OPTIONS.find(opt => opt.value === modelType)?.label || modelType} API Key
        </label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => {
            setApiKey(e.target.value);
            setError('');
          }}
          placeholder={`Enter your ${modelType.toUpperCase()} API key...`}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleSaveApiKey}
          disabled={isValidatingKey || !apiKey.trim()}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {isValidatingKey ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Validating...
            </>
          ) : (
            'Save API Key'
          )}
        </button>
        {hasApiKey && (
          <button
            onClick={handleRemoveApiKey}
            className="text-red-600 hover:text-red-700 text-sm font-medium"
          >
            Remove API Key
          </button>
        )}
      </div>
      
      {/* Hiển thị thông báo khi đã có API key */}
      {hasApiKey && (
        <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 border border-green-200 rounded-lg p-2">
          <CheckCircle size={14} />
          {modelType.toUpperCase()} API key đã được cấu hình thành công!
        </div>
      )}
      
      {/* Hiển thị thông báo khi chưa có API key */}
      {!hasApiKey && (
        <div className="flex items-center gap-2 text-blue-600 text-sm bg-blue-50 border border-blue-200 rounded-lg p-2">
          <AlertCircle size={14} />
          Vui lòng nhập và lưu {modelType.toUpperCase()} API key để sử dụng tính năng AI.
        </div>
      )}
      <div className="text-xs text-gray-500 space-y-1">
        {modelType === 'gemini' && (
          <>
            <p>Get your free Gemini API key from:</p>
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-purple-600 hover:underline"
            >
              Google AI Studio
            </a>
          </>
        )}
        {modelType === 'gpt' && (
          <>
            <p>Get your OpenAI GPT API key from:</p>
            <a 
              href="https://platform.openai.com/api-keys" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-purple-600 hover:underline"
            >
              OpenAI Platform
            </a>
          </>
        )}
        <p className="text-gray-400">Your API key is stored securely and never shared.</p>
      </div>
      {success && (
        <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 border border-green-200 rounded-lg p-2 mt-2">
          <CheckCircle size={14} />
          {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-2 mt-2">
          <AlertCircle size={14} />
          {error}
        </div>
      )}
    </div>
  );
};

export default AIModelConfigPanel; 