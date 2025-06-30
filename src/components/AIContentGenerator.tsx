import React, { useState, useEffect } from 'react';
import { Sparkles, Settings, Key, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { aiModelService, AIModelType } from '../services/geminiService';

interface AIContentGeneratorProps {
  onContentGenerated: (content: string) => void;
  platforms: string[];
  modelType: AIModelType;
  modelName: string;
  hasApiKey: boolean;
  platformConfigs: Record<string, any>;
}


// Helper function to safely trim strings
const safeTrim = (val: any) => (typeof val === 'string' ? val.trim() : '');

export const AIContentGenerator: React.FC<AIContentGeneratorProps> = ({
  onContentGenerated,
  platforms,
  modelType,
  modelName,
  hasApiKey,
  platformConfigs
}) => {
  const [showPromptInput, setShowPromptInput] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isValidatingKey, setIsValidatingKey] = useState(false);
  const [availableModels, setAvailableModels] = useState<Record<string, any>>({});
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  // Lấy danh sách model khả dụng khi mount
  useEffect(() => {
    aiModelService.getAvailableModels().then(res => {
      setAvailableModels(res.data || {});
    });
  }, []);

  const handleGenerateContent = async () => {
    if (safeTrim(prompt) === '') {
      setError('Please enter a prompt');
      return;
    }
    if (!hasApiKey) {
      setError(`Vui lòng cấu hình ${modelType.toUpperCase()} API key trước khi sử dụng.`);
      return;
    }
    if (!platforms || platforms.length === 0) {
      setError('Vui lòng chọn ít nhất một tài khoản để đăng bài trước khi sinh nội dung AI.');
      return;
    }
    setIsGenerating(true);
    setError('');
    setSuccess('');
    try {
      await aiModelService.getApiKey(modelType);
      // Lấy config cho từng platform nếu có
      const config = platformConfigs;
      // Nếu có config cho từng platform, gọi API cho từng platform và merge kết quả
      let finalResult: { success: boolean; content?: any; error?: string } = { success: false };
      if (config && Object.keys(config).length > 0) {
        const allResults: any = {};
        console.log('DEBUG Platforms:', platforms);
        for (const p of platforms) {
          const c = config[p] || {};
          console.log('DEBUG config for platform', p, ':', c);
          const result = await aiModelService.generateContentWithModel(
            modelType,
            prompt,
            [p],
            {
              brand: c.brand,
              systemPrompt: c.systemPrompt,
              hashtags: c.hashtags
            }
          );
          if (result.success && result.content) {
            let platformContent = result.content;
            if (platformContent && typeof platformContent === 'object' && platformContent[p]) {
              platformContent = platformContent[p];
            }
            allResults[p] = platformContent;
          } else {
            finalResult = result;
            break;
          }
        }
        if (Object.keys(allResults).length > 0) {
          finalResult = { success: true, content: allResults };
        }
      } else {
        finalResult = await aiModelService.generateContentWithModel(modelType, prompt, platforms);
      }
      if (finalResult.success && finalResult.content) {
        onContentGenerated(finalResult.content);
        setSuccess('Content generated successfully!');
        setPrompt('');
        setShowPromptInput(false);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(finalResult.error || 'Failed to generate content');
      }
    } catch (error) {
      setError('Unexpected error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-3">

      {/* AI Generate Button */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowPromptInput(!showPromptInput)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 text-sm font-medium"
        >
          <Sparkles size={16} />
          Generate with AI
        </button>
      </div>

      {/* Prompt Input */}
      {showPromptInput && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <Sparkles size={16} className="text-purple-600" />
              AI Content Generator
            </h4>
            <button
              onClick={() => {
                setShowPromptInput(false);
                setError('');
                setPrompt('');
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Describe what you want to post about:
            </label>
            <textarea
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                setError('');
              }}
              placeholder={`e.g., 'A motivational post about starting a new business', 'Announce our new product launch with excitement', 'Share tips for healthy living'...`}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
            />
            <div className="mt-1 text-xs text-gray-500">
              Be specific about the tone, topic, and style you want
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleGenerateContent}
              disabled={isGenerating || safeTrim(prompt) === '' || !hasApiKey}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  Generate Content
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};