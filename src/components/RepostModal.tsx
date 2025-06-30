import React, { useState } from 'react';
import { X, Calendar, Clock, Send } from 'lucide-react';
import { Schedule } from './ScheduleHistoryTabs';
import { backendService } from '../services/backendService';

interface RepostModalProps {
  schedule: Schedule;
  onClose: () => void;
  onSuccess: () => void;
}

export const RepostModal: React.FC<RepostModalProps> = ({ 
  schedule, 
  onClose, 
  onSuccess 
}) => {
  const [scheduledTime, setScheduledTime] = useState('');
  const [isReposting, setIsReposting] = useState(false);
  const [error, setError] = useState('');

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    return now.toISOString().slice(0, 16);
  };

  const handleRepost = async () => {
    if (!scheduledTime) {
      setError('Vui lòng chọn thời gian đăng bài');
      return;
    }

    setIsReposting(true);
    setError('');

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setError('Bạn chưa đăng nhập!');
        setIsReposting(false);
        return;
      }

      // Parse content metadata từ schedule
      let contentMetadata;
      try {
        const raw = typeof schedule.content_metadata === 'string'
          ? JSON.parse(schedule.content_metadata)
          : schedule.content_metadata;
        // Lấy đúng key cho platform
        let key = (schedule.platform || '').toLowerCase();
        if (raw && typeof raw === 'object' && raw[key]) {
          // Nếu đã đúng dạng { facebook: {...} }
          contentMetadata = { [key]: raw[key] };
        } else if (raw && typeof raw === 'object') {
          // Nếu là object chỉ có content, wrap lại thành { platform: content }
          contentMetadata = { [key]: raw };
        } else {
          // fallback: nếu content là string
          contentMetadata = { [key]: raw };
        }
      } catch (err) {
        setError('Dữ liệu bài đăng không hợp lệ');
        setIsReposting(false);
        return;
      }

      // Chuẩn bị params cho việc đăng lại
      const params: any = {
        platforms: [schedule.platform],
        content_metadata: contentMetadata,
        privacy_status: 'public',
        scheduled_time: new Date(scheduledTime).toISOString(),
      };

      // Xử lý account_id/page_id dựa trên platform
      if (schedule.platform === 'youtube') {
        params.account_id = schedule.page_id 
      } else {
        params.page_id = schedule.page_id
      }

      // Xử lý media files nếu có
      if (schedule.video_url) {
        // Nếu có video file URL, cần download và tạo File object
        try {
          const response = await fetch(schedule.video_url);
          const blob = await response.blob();
          const fileName = (schedule.video_url.split('/').pop() || 'image.jpg').split('?')[0];
          const file = new File([blob], fileName, { type: blob.type });
          params.video_file = file;
        } catch (err) {
          console.warn('Không thể tải video file:', err);
        }
      }

      if (
        schedule.image_urls &&
        typeof schedule.image_urls === 'object' &&
        Array.isArray(schedule.image_urls.image)
      ) {
        const imageFiles: File[] = [];
        for (const imageUrl of (schedule.image_urls.image as string[])) {
          try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const fileName = (imageUrl.split('/').pop() || 'image.jpg').split('?')[0];
            const file = new File([blob], fileName, { type: blob.type });
            imageFiles.push(file);
          } catch (err) {
            console.warn('Không thể tải image file:', err);
          }
        }
        if (imageFiles.length > 0) {
          params.image_files = imageFiles;
        }
      }

      // Gọi API để lập lịch đăng lại
      console.log("schedule: ", schedule);
      console.log("params: ", params);
      const response = await backendService.schedulePost(token, params);
      
      if (response.success) {
        alert('Đăng lại bài thành công!');
        onSuccess();
        onClose();
      } else {
        setError(response.message || 'Đăng lại bài thất bại');
      }
    } catch (err) {
      setError('Lỗi kết nối server');
    } finally {
      setIsReposting(false);
    }
  };

  const getPlatformDisplayName = (platform: string) => {
    const names: Record<string, string> = {
      facebook: 'Facebook',
      instagram: 'Instagram', 
      youtube: 'YouTube',
      twitter: 'Twitter',
      linkedin: 'LinkedIn'
    };
    return names[platform] || platform;
  };

  const getContentPreview = () => {
    try {
      const metadata = typeof schedule.content_metadata === 'string'
        ? JSON.parse(schedule.content_metadata)
        : schedule.content_metadata;
      
      if (schedule.platform === 'youtube') {
        return metadata.youtube?.title || metadata.title || 'Không có tiêu đề';
      } else if (schedule.platform === 'facebook') {
        return metadata.facebook?.message || metadata.message || 'Không có nội dung';
      } else if (schedule.platform === 'instagram') {
        return metadata.instagram?.caption || metadata.caption || 'Không có nội dung';
      }
      return 'Không có nội dung';
    } catch (err) {
      return 'Không thể đọc nội dung';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md relative animate-fade-in">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={22} />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send size={24} className="text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Đăng lại bài
          </h3>
          <p className="text-sm text-gray-600">
            Chọn thời gian để đăng lại bài này trên {getPlatformDisplayName(schedule.platform)}
          </p>
        </div>

        <div className="space-y-4">
          {/* Preview nội dung */}
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">Nội dung bài đăng:</p>
            <p className="text-sm text-gray-800 line-clamp-3">
              {getContentPreview()}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Calendar size={16} />
              Thời gian đăng bài
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
                📅 Bài sẽ được đăng vào {new Date(scheduledTime).toLocaleString()}
              </p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors border border-gray-300 rounded-xl hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleRepost}
              disabled={isReposting || !scheduledTime}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-xl font-semibold hover:shadow-xl transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isReposting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Đăng lại
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 