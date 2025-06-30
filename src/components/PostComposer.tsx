import React, { useState, useRef, useEffect } from 'react';
import { PlatformAccount, Post, MediaFile } from '../types/platform';
import { Send, Calendar, X, CheckSquare, Square, History } from 'lucide-react';
import { MediaUploader } from './MediaUploader';
import { PlatformMediaValidator } from './PlatformMediaValidator';
import { AIContentGenerator } from './AIContentGenerator';
import { validateMediaForPlatform } from '../utils/mediaUtils';
import { backendService } from '../services/backendService';
import { Link } from 'react-router-dom';
import { Settings } from "lucide-react";
import {
  Facebook,
  Instagram,
  Youtube,
  Twitter,
  Linkedin,
  Music2,
  Globe
} from 'lucide-react';
import { PlatformConfigPanel, PlatformConfig } from './PlatformConfigPanel';
import AIModelConfigPanel from './AIModelConfigPanel';
import { AIModelType } from '../services/geminiService';

interface PostComposerProps {
  accounts: PlatformAccount[];
  onCreatePost: (post: Omit<Post, 'id' | 'createdAt'>) => void;
}

export const PostComposer: React.FC<PostComposerProps> = ({
  accounts,
  onCreatePost
}) => {
  const [content, setContent] = useState<string | Record<string, any>>('');
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);
  const [lastGeneratedContent, setLastGeneratedContent] = useState('');
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<PlatformAccount[]>([]);
  const [scheduledTime, setScheduledTime] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [activePlatform, setActivePlatform] = useState<'facebook' | 'instagram' | 'youtube'>('instagram');
  const [textareaHeight, setTextareaHeight] = useState('120px');
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [platformConfigs, setPlatformConfigs] = useState<Record<string, PlatformConfig>>({
    facebook: { hashtags: [], brand: '', systemPrompt: '' },
    instagram: { hashtags: [], brand: '', systemPrompt: '' },
    youtube: { hashtags: [], brand: '', systemPrompt: '' },
  });
  const [modelType, setModelType] = useState<AIModelType>('gemini');
  const [modelName, setModelName] = useState<string>('gemini-1.5-flash');
  const [apiKey, setApiKey] = useState<string>('');
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isValidatingKey, setIsValidatingKey] = useState<boolean>(false);
  const [availableModels, setAvailableModels] = useState<Record<string, any>>({});
  const [showApiKeyInput, setShowApiKeyInput] = useState<boolean>(true);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const connectedAccounts = accounts.filter(acc => acc.connected);

  // Lấy content cho platform đang active
  const getPlatformContent = () => {
    if (typeof content === 'string') return content;
    if (!content || typeof content !== 'object') return '';
    let platformData = content[activePlatform];
    // Nếu lại lồng thêm 1 cấp nữa, unwrap tiếp
    if (platformData && typeof platformData === 'object' && platformData[activePlatform]) {
      platformData = platformData[activePlatform];
    }
    if (!platformData) {
      console.warn('No content for platform:', activePlatform, content);
      return '';
    }
    if (activePlatform === 'facebook') {
      return platformData.message || platformData.caption || platformData.title || platformData.text || '';
    }
    if (activePlatform === 'instagram') {
      return platformData.caption || platformData.message || platformData.title || platformData.text || '';
    }
    if (activePlatform === 'youtube') {
      let base = (platformData.title ? platformData.title + '\n' : '') + (platformData.description || '');
      if (platformData.tags && platformData.tags.length > 0) {
        const tagString = '\n\n' + platformData.tags.map((tag: string) => `#${tag}`).join(' ');
        base += tagString;
      }
      return base;
    }
    return '';
  };

  // Khi chỉnh sửa textarea, cập nhật đúng trường content
  const handlePlatformContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (typeof content === 'string') {
      setContent(newValue);
    } else if (content && typeof content === 'object') {
      if (activePlatform === 'youtube') {
        // Tách tags khỏi nội dung
        const lines = newValue.split('\n');
        let tagLineIdx = lines.findIndex(line => line.trim().startsWith('#'));
        let tags: string[] = [];
        if (tagLineIdx !== -1) {
          // Lấy tất cả các tag từ dòng đầu tiên có # trở đi
          tags = lines.slice(tagLineIdx).join(' ').split('#').map(t => t.trim()).filter(Boolean);
        }
        // Lấy title và description
        const title = lines[0] || '';
        const description = tagLineIdx === -1 ? lines.slice(1).join('\n') : lines.slice(1, tagLineIdx).join('\n');
        setContent({
          ...content,
          youtube: {
            ...(content.youtube || {}),
            title,
            description,
            tags
          }
        });
      } else {
        setContent({
          ...content,
          [activePlatform]: {
            ...(content[activePlatform] || {}),
            [activePlatform === 'facebook' ? 'message' : 'caption']: newValue
          }
        });
      }
    }
  };

  // Helper function to safely trim strings
  const safeTrim = (val: any) => (typeof val === 'string' ? val.trim() : '');

  // Update content display with hashtags
  const getDisplayContent = () => {
    if (typeof content === 'string') {
      let displayContent = content;
      if (selectedHashtags.length > 0) {
        const hashtagString = selectedHashtags.map(tag => `#${tag}`).join(' ');
        if (displayContent.trim()) {
          displayContent += '\n\n' + hashtagString;
        } else {
          displayContent = hashtagString;
        }
      }
      return displayContent;
    } else if (typeof content === 'object' && content !== null) {
      const c = content as Record<string, any>;
      if (c.instagram && c.instagram.caption) {
        let displayContent = c.instagram.caption;
        if (selectedHashtags.length > 0) {
          const hashtagString = selectedHashtags.map(tag => `#${tag}`).join(' ');
          if (displayContent.trim()) {
            displayContent += '\n\n' + hashtagString;
          } else {
            displayContent = hashtagString;
          }
        }
        return displayContent;
      }
      if (c.facebook && c.facebook.message) {
        let displayContent = c.facebook.message;
        if (selectedHashtags.length > 0) {
          const hashtagString = selectedHashtags.map(tag => `#${tag}`).join(' ');
          if (displayContent.trim()) {
            displayContent += '\n\n' + hashtagString;
          } else {
            displayContent = hashtagString;
          }
        }
        return displayContent;
      }
      if (c.youtube && c.youtube.title) {
        let displayContent = c.youtube.title + '\n' + (c.youtube.description || '');
        if (selectedHashtags.length > 0) {
          const hashtagString = selectedHashtags.map(tag => `#${tag}`).join(' ');
          if (displayContent.trim()) {
            displayContent += '\n\n' + hashtagString;
          } else {
            displayContent = hashtagString;
          }
        }
        return displayContent;
      }
      // fallback
      return '';
    }
    return '';
  };

  // Auto-resize textarea when content or hashtags change
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      // Set height based on content
      const newHeight = Math.max(120, textarea.scrollHeight);
      textarea.style.height = `${newHeight}px`;
    }
  }, [content, selectedHashtags]); // Add selectedHashtags as dependency

  const handleAccountToggle = (account: PlatformAccount) => {
    setSelectedAccounts(prev => 
      prev.find(acc => acc.id === account.id)
        ? prev.filter(acc => acc.id !== account.id)
        : [...prev, account]
    );
  };

  const handleSelectAll = () => {
    if (selectedAccounts.length === connectedAccounts.length) {
      // Deselect all
      setSelectedAccounts([]);
    } else {
      // Select all
      setSelectedAccounts([...connectedAccounts]);
    }
  };

  const handleAIContentGenerated = (generatedContent: any) => {
    // Unwrap .data nếu có
    if (generatedContent && typeof generatedContent === 'object' && 'data' in generatedContent) {
      generatedContent = generatedContent.data;
    }
    // Gộp với content cũ để không mất nội dung các nền tảng khác
    setContent((prev: any) => ({
      ...prev,
      ...generatedContent
    }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalContent = getDisplayContent();
    if (!finalContent.trim() && media.length === 0) {
      alert('Vui lòng nhập nội dung hoặc thêm media');
      return;
    }
    if (selectedAccounts.length === 0) {
      alert('Vui lòng chọn ít nhất một tài khoản');
      return;
    }
    if (!scheduledTime) {
      alert('Bạn phải chọn thời gian để lập lịch đăng bài.');
      return;
    }
    // Validate media for selected accounts
    const accountsWithErrors = selectedAccounts.filter(account => {
      const errors = validateMediaForPlatform(media, account.platformId);
      return errors.length > 0;
    });
    if (accountsWithErrors.length > 0) {
      const proceed = confirm(
        `Some media files are not compatible with ${accountsWithErrors.map(acc => acc.accountName).join(', ')}. ` +
        'These accounts will be skipped. Do you want to continue?'
      );
      if (!proceed) return;
    }
    setIsComposing(true);
    // Lấy token từ localStorage
    const token = localStorage.getItem('auth_token');
    if (!token) {
      alert('Bạn chưa đăng nhập!');
      setIsComposing(false);
      return;
    }
    // Chỉ lập lịch, không đăng trực tiếp
    const results: any[] = [];
    for (const acc of selectedAccounts) {
      let params: any = {
        platforms: [acc.platformId],
        content_metadata: content,
        privacy_status: 'public',
        scheduled_time: new Date(scheduledTime).toISOString(),
      };
      // Xử lý account_id/page_id và file cho từng platform
      if (acc.platformId === 'youtube') {
        params.account_id = acc.profileInfo?.username;
        // Lấy video đầu tiên
        const videoFile = media.find(m => m.type === 'video')?.file;
        if (videoFile) params.video_file = videoFile;
        
      } else if (acc.platformId === 'facebook') {
        params.page_id = acc.profileInfo?.username;
        // Ưu tiên video cho Facebook nếu có
        const videoFile = media.find(m => m.type === 'video')?.file;
        if (videoFile) {
          params.video_file = videoFile;
        } else {
          // Lấy tất cả ảnh
          const imageFiles = media.filter(m => m.type === 'image').map(m => m.file);
          if (imageFiles.length > 0) params.image_files = imageFiles;
        }
      } else if (acc.platformId === 'instagram') {
        params.page_id = acc.profileInfo?.username;
        // Nếu có video thì đăng reels
        const videoFile = media.find(m => m.type === 'video')?.file;
        if (videoFile) {
          params.video_file = videoFile;
          params.post_type = 'reel';
        } else {
          // Lấy tất cả ảnh
          const imageFiles = media.filter(m => m.type === 'image').map(m => m.file);
          if (imageFiles.length > 0) params.image_files = imageFiles;
        }
      }
      try {
        const res = await backendService.schedulePost(token, params);
        results.push({ platform: acc.platformId, account: acc.accountName, success: res.success, message: res.message });
      } catch (err) {
        results.push({ platform: acc.platformId, account: acc.accountName, success: false, message: 'Lỗi kết nối server' });
      }
    }
    // Thông báo kết quả
    let msg = 'Kết quả lập lịch:\n';
    for (const r of results) {
      msg += `${r.platform} (${r.account}): ${r.success ? '✅' : '❌'} ${r.message}\n`;
    }
    alert(msg.trim());
    // Reset form
    setContent('');
    setSelectedHashtags([]);
    setLastGeneratedContent('');
    setMedia([]);
    setSelectedAccounts([]);
    setScheduledTime('');
    setIsComposing(false);
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    return now.toISOString().slice(0, 16);
  };

  const clearForm = () => {
    setContent('');
    setSelectedHashtags([]);
    setLastGeneratedContent('');
    setMedia([]);
    setSelectedAccounts([]);
    setScheduledTime('');
  };

  // Group accounts by platform
  const accountsByPlatform = connectedAccounts.reduce((acc, account) => {
    if (!acc[account.platformId]) {
      acc[account.platformId] = [];
    }
    acc[account.platformId].push(account);
    return acc;
  }, {} as Record<string, PlatformAccount[]>);

  const getPlatformIcon = (platformId: string) => {
    const icons: Record<string, JSX.Element> = {
      facebook: <Facebook className="w-5 h-5 text-blue-600" />,
      instagram: <Instagram className="w-5 h-5 text-pink-500" />,
      youtube: <Youtube className="w-5 h-5 text-red-600" />,
      twitter: <Twitter className="w-5 h-5 text-sky-500" />,
      linkedin: <Linkedin className="w-5 h-5 text-blue-700" />,
      tiktok: <Music2 className="w-5 h-5 text-black" />,
    };
  
    return icons[platformId] || <Globe className="w-5 h-5 text-gray-400" />;
  };

  const formatFollowerCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const isAllSelected = selectedAccounts.length === connectedAccounts.length && connectedAccounts.length > 0;
  const isSomeSelected = selectedAccounts.length > 0 && selectedAccounts.length < connectedAccounts.length;

  // Calculate final content length with hashtags
  const finalContentLength = getDisplayContent().length;

  useEffect(() => {
    import('../services/geminiService').then(m => {
      m.aiModelService.getAvailableModels().then(res => {
        setAvailableModels(res.data || res);
      }).catch(() => {});
    });
    // Kiểm tra trạng thái API key khi mount
    import('../services/geminiService').then(m => {
      m.aiModelService.checkApiKeyStatus(modelType).then((data) => {
        setHasApiKey(!!data);
      });
    });
  }, [modelType]);

  return (
    <>
      <div className="flex justify-end mb-8">
        <Link
          to="/post-history"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-full shadow-md hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
        >
          <History size={18} /> Xem lịch sử đăng bài
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-8 mb-10">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-8 flex items-center gap-3">
          <Settings size={24} className="text-blue-600" /> Cấu hình
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AIModelConfigPanel
            modelType={modelType}
            setModelType={setModelType}
            modelName={modelName}
            setModelName={setModelName}
            apiKey={apiKey}
            setApiKey={setApiKey}
            hasApiKey={hasApiKey}
            setHasApiKey={setHasApiKey}
            error={error}
            setError={setError}
            success={success}
            setSuccess={setSuccess}
            isValidatingKey={isValidatingKey}
            setIsValidatingKey={setIsValidatingKey}
            availableModels={availableModels}
            showApiKeyInput={showApiKeyInput}
            setShowApiKeyInput={setShowApiKeyInput}
          />
          <PlatformConfigPanel configs={platformConfigs} setConfigs={setPlatformConfigs} />
        </div>
      </div>

      {showEditorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowEditorModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-[70vw] h-[70vh] p-8 z-10 flex flex-col">
            <button className="absolute top-4 right-4 text-gray-500 hover:text-black" onClick={() => setShowEditorModal(false)}>Đóng</button>
            <h3 className="text-lg font-bold mb-4">Chỉnh sửa nội dung</h3>
            <textarea
              value={getPlatformContent()}
              onChange={handlePlatformContentChange}
              className="w-full h-full border border-gray-300 rounded-xl p-4 text-base resize-none flex-1 bg-gray-50 focus:ring-2 focus:ring-blue-500"
              style={{ minHeight: '50vh' }}
              autoFocus
            />
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-10 transition-all duration-300">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-8 flex items-center gap-3">
          <Send size={24} className="text-blue-600" /> Tạo Lịch Đăng Bài
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-wrap gap-4 mb-6">
            {(['facebook', 'instagram', 'youtube'] as const).map((platform) => {
              const isActive = activePlatform === platform;
              let btnClass = 'px-6 py-2.5 rounded-full font-semibold shadow-md transition-all duration-300 hover:scale-105 ';
              if (isActive) {
                if (platform === 'facebook') btnClass += 'text-white bg-blue-600';
                else if (platform === 'instagram') btnClass += 'text-white bg-pink-500';
                else btnClass += 'text-white bg-red-500';
              } else {
                btnClass += 'bg-gray-100 text-gray-700 hover:bg-gray-200';
              }
              return (
                <button
                  key={platform}
                  type="button"
                  className={btnClass}
                  onClick={() => setActivePlatform(platform)}
                >
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Left */}
            <div className="space-y-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Post Content</label>
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={getPlatformContent()}
                    readOnly
                    onFocus={() => setShowEditorModal(true)}
                    placeholder="What's on your mind? Share your thoughts across all your social platforms..."
                    style={{ height: textareaHeight }}
                    className="w-full px-6 py-5 border border-gray-200 rounded-xl bg-gray-50 text-gray-700 placeholder-gray-400 shadow-inner resize-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all duration-200"
                  />
                  {selectedHashtags.length > 0 && (
                    <div className="absolute bottom-3 right-3 bg-blue-100 text-blue-700 px-3 py-1 rounded text-xs shadow">
                      {selectedHashtags.length} hashtag{selectedHashtags.length !== 1 ? 's' : ''} added
                    </div>
                  )}
                </div>
                <div className="mt-2 text-xs text-gray-500 text-right">
                  {finalContentLength}/2200 characters
                  {selectedHashtags.length > 0 && (
                    <span className="ml-2 text-blue-600">
                      (includes {selectedHashtags.length} hashtag{selectedHashtags.length !== 1 ? 's' : ''})
                    </span>
                  )}
                </div>
              </div>

              <AIContentGenerator
                onContentGenerated={handleAIContentGenerated}
                platforms={[...new Set(selectedAccounts.map(account => account.platformId))]}
                modelType={modelType}
                modelName={modelName}
                hasApiKey={hasApiKey}
                platformConfigs={platformConfigs}
              />

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">Media Files (Images & Videos)</label>
                <MediaUploader media={media} onMediaChange={setMedia} maxFiles={10} />
              </div>
            </div>

            {/* Right */}
            <div className="space-y-8">
              {/* Account Selection */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-medium text-gray-700">Select Accounts ({selectedAccounts.length} selected)</label>
                  {connectedAccounts.length > 0 && (
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                        isAllSelected
                          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          : isSomeSelected
                          ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {isAllSelected ? (
                        <CheckSquare size={12} />
                      ) : isSomeSelected ? (
                        <div className="w-3 h-3 bg-blue-600 rounded-sm flex items-center justify-center">
                          <div className="w-1.5 h-0.5 bg-white rounded"></div>
                        </div>
                      ) : (
                        <Square size={12} />
                      )}
                      {isAllSelected ? 'Deselect All' : 'Select All'}
                    </button>
                  )}
                </div>
                {connectedAccounts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <div className="text-4xl mb-2">📱</div>
                    <p className="font-medium">No accounts connected</p>
                    <p className="text-sm mt-1">Connect your social media accounts above to start posting.</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {Object.entries(accountsByPlatform).map(([platformId, platformAccounts]) => (
                      <div key={platformId} className="border border-gray-200 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-base">{getPlatformIcon(platformId)}</span>
                          <h4 className="font-medium text-gray-900 text-sm">
                            {platformAccounts[0].platformName}
                          </h4>
                          <span className="text-xs text-gray-500">
                            ({platformAccounts.length} account{platformAccounts.length !== 1 ? 's' : ''})
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {platformAccounts.map((account) => (
                            <button
                              key={account.id}
                              type="button"
                              onClick={() => handleAccountToggle(account)}
                              className={`p-2 rounded-xl border-2 transition-all duration-200 text-left hover:shadow-sm ${
                                selectedAccounts.find(acc => acc.id === account.id)
                                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex flex-col items-center text-center space-y-1">
                                {account.profileInfo?.profilePicture ? (
                                  <img
                                    src={account.profileInfo.profilePicture}
                                    alt={account.accountName}
                                    className="w-8 h-8 rounded-full object-cover border border-gray-200"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-sm">👤</span>
                                  </div>
                                )}
                                <div className="w-full">
                                  <div className="flex items-center justify-center gap-1">
                                    <div className="font-medium text-xs text-gray-900 truncate max-w-full">
                                      {account.accountName}
                                    </div>
                                    {account.profileInfo?.verified && (
                                      <div className="text-blue-500 text-xs flex-shrink-0" title="Verified">✓</div>
                                    )}
                                  </div>
                                  {account.profileInfo?.username && (
                                    <div className="text-xs text-gray-500 truncate">
                                      @{account.profileInfo.username}
                                    </div>
                                  )}
                                  {account.followers !== undefined && (
                                    <div className="text-xs text-gray-500">
                                      {formatFollowerCount(account.followers)}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-1">
                  <Calendar size={16} /> Schedule (optional)
                </label>
                <input
                  type="datetime-local"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  min={getMinDateTime()}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {scheduledTime && (
                  <p className="mt-2 text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-2">
                    📅 Post will be published on {new Date(scheduledTime).toLocaleString()}
                  </p>
                )}
              </div>

              <div className="space-y-4 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={
                    isComposing ||
                    (safeTrim(content) === '' && selectedHashtags.length === 0 && media.length === 0) ||
                    selectedAccounts.length === 0
                  }
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-xl transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isComposing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      {scheduledTime ? 'Scheduling...' : 'Posting...'}
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      {scheduledTime ? 'Schedule Post' : 'Post Now'}
                    </>
                  )}
                </button>
                {(content || selectedHashtags.length > 0 || media.length > 0 || selectedAccounts.length > 0 || scheduledTime) && (
                  <button
                    type="button"
                    onClick={clearForm}
                    className="w-full px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors border border-gray-300 rounded-xl hover:bg-gray-50 flex items-center justify-center gap-2"
                  >
                    <X size={16} />
                    Clear Form
                  </button>
                )}
              </div>

              {selectedAccounts.length > 0 && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Posting Summary</h4>
                  <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
                    <div className="flex justify-between"><span>Accounts:</span><span className="font-medium">{selectedAccounts.length}</span></div>
                    <div className="flex justify-between"><span>Reach:</span><span className="font-medium">{formatFollowerCount(selectedAccounts.reduce((total, acc) => total + (acc.followers || 0), 0))}</span></div>
                    {media.length > 0 && <div className="flex justify-between"><span>Media:</span><span className="font-medium">{media.length}</span></div>}
                    {selectedHashtags.length > 0 && <div className="flex justify-between"><span>Hashtags:</span><span className="font-medium">{selectedHashtags.length}</span></div>}
                    {scheduledTime && (
                      <div className="flex justify-between col-span-2">
                        <span>Scheduled:</span>
                        <span className="font-medium text-blue-600">{new Date(scheduledTime).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {media.length > 0 && selectedAccounts.length > 0 && (
            <div className="mt-10 pt-6 border-t border-gray-200">
              <PlatformMediaValidator media={media} selectedPlatforms={selectedAccounts} />
            </div>
          )}
        </form>
      </div>
    </>
  );
};
