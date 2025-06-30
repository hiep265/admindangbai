import React, { useState } from 'react';

const PLATFORMS = [
  { id: 'facebook', name: 'Facebook' },
  { id: 'instagram', name: 'Instagram' },
  { id: 'youtube', name: 'YouTube' },
];

export interface PlatformConfig {
  hashtags: string[];
  brand: string;
  systemPrompt: string;
}

const defaultConfig: PlatformConfig = {
  hashtags: [],
  brand: '',
  systemPrompt: '',
};

export const PlatformConfigPanel: React.FC<{
  configs: Record<string, PlatformConfig>;
  setConfigs: React.Dispatch<React.SetStateAction<Record<string, PlatformConfig>>>;
}> = ({ configs, setConfigs }) => {
  const [activeTab, setActiveTab] = useState('facebook');

  // Lấy config chung từ platform đầu tiên (hoặc default)
  const globalConfig = configs[activeTab] || defaultConfig;

  const handleGlobalChange = (field: keyof PlatformConfig, value: any) => {
    // Cập nhật cho tất cả platforms
    const newConfigs: Record<string, PlatformConfig> = {};
    PLATFORMS.forEach(platform => {
      newConfigs[platform.id] = {
        ...(configs[platform.id] || defaultConfig),
        [field]: value,
      };
    });
    setConfigs(newConfigs);
  };

  const handleHashtagInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
    handleGlobalChange('hashtags', tags);
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-8">
      <div className="flex gap-2 mb-4">
        {PLATFORMS.map(p => (
          <button
            key={p.id}
            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === p.id
                ? 'bg-blue-600 text-white shadow'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setActiveTab(p.id)}
          >
            {p.name}
          </button>
        ))}
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Hashtags mặc định</label>
          <input
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            type="text"
            value={globalConfig.hashtags.join(', ')}
            onChange={handleHashtagInput}
            placeholder="Ví dụ: brand, sale, summer"
          />
          <div className="text-xs text-gray-400 mt-1">Nhập nhiều hashtag, cách nhau bởi dấu phẩy</div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Brand</label>
          <input
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            type="text"
            value={globalConfig.brand}
            onChange={e => handleGlobalChange('brand', e.target.value)}
            placeholder="Tên thương hiệu hoặc từ khóa brand"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">System Prompt</label>
          <textarea
            className="w-full border border-gray-300 rounded-lg px-3 py-2 min-h-[60px]"
            value={globalConfig.systemPrompt}
            onChange={e => handleGlobalChange('systemPrompt', e.target.value)}
            placeholder="Prompt hệ thống cho AI (ví dụ: Hãy viết nội dung sáng tạo, ngắn gọn, ... )"
          />
        </div>
      </div>
    </div>
  );
}; 