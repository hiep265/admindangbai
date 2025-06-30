import React, { useEffect, useState } from 'react';
import { CheckCircle, Clock } from 'lucide-react';
import { backendService } from '../services/backendService';
import { ScheduleHistoryTable } from './ScheduleHistoryTable';
import { ScheduleDetailModal } from './ScheduleDetailModal';
import { ScheduleExportButton } from './ScheduleExportButton';

export interface Schedule {
  id: string;
  status: string;
  platform: string;
  scheduled_time: string;
  content_metadata: any;
  account_id?: string;
  page_id?: string;
  video_url?: string;
  image_urls?: Record<string, []>;
  [key: string]: any;
}

const PAGE_SIZE = 5;

export const ScheduleHistoryTabs: React.FC = () => {
  const [tab, setTab] = useState<'pending' | 'completed'>('pending');
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selected, setSelected] = useState<Schedule | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      setLoading(true);
      backendService.getSchedules(token, page, PAGE_SIZE, tab).then(res => {
        setLoading(false);
        if (res.success) {
          setSchedules(res.data.schedules || []);
          setTotalPages(res.data.total_pages || 1);
          setTotal(res.data.total || 0);
        }
      });
    }
  }, [page, tab]);

  const handleTabChange = (newTab: 'pending' | 'completed') => {
    setTab(newTab);
    setPage(1); // reset page when switching tabs
  };

  const handleDeleteSchedule = async (schedule: Schedule) => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      alert('Vui lòng đăng nhập!');
      return;
    }
    if (window.confirm('Bạn có chắc muốn xóa lịch này?')) {
      setLoading(true);
      const res = await backendService.deleteSchedule(token, schedule.id);
      setLoading(false);
      if (res.success) {
        alert('Xóa lịch thành công!');
        // Reload lại danh sách lịch
        backendService.getSchedules(token, page, PAGE_SIZE, tab).then(res => {
          if (res.success) {
            setSchedules(res.data.schedules || []);
            setTotalPages(res.data.total_pages || 1);
            setTotal(res.data.total || 0);
          }
        });
      } else {
        alert(res.message || 'Xóa lịch thất bại!');
      }
    }
  };

  const handleRepostSuccess = () => {
    // Reload lại danh sách lịch khi đăng lại thành công
    const token = localStorage.getItem('auth_token');
    if (token) {
      setLoading(true);
      backendService.getSchedules(token, page, PAGE_SIZE, tab).then(res => {
        setLoading(false);
        if (res.success) {
          setSchedules(res.data.schedules || []);
          setTotalPages(res.data.total_pages || 1);
          setTotal(res.data.total || 0);
        }
      });
    }
  };

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button
          className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg shadow-md hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-200 ${
            tab === 'completed' ? '' : 'opacity-70'
          }`}
          onClick={() => handleTabChange('completed')}
        >
          <CheckCircle size={18} /> Đã xử lý xong
        </button>

        <button
          className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 ${
            tab === 'pending' ? '' : 'opacity-70'
          }`}
          onClick={() => handleTabChange('pending')}
        >
          <Clock size={18} /> Đang chờ xử lý
        </button>

        <div className="ml-auto">
          <ScheduleExportButton data={schedules} />
        </div>
      </div>

      <ScheduleHistoryTable
        schedules={schedules}
        onViewDetail={setSelected}
        onDeleteSchedule={handleDeleteSchedule}
        onRepostSuccess={handleRepostSuccess}
      />

      {selected && (
        <ScheduleDetailModal schedule={selected} onClose={() => setSelected(null)} />
      )}

      {/* Pagination controls */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <button
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          disabled={page === 1 || loading}
          onClick={() => setPage(prev => Math.max(prev - 1, 1))}
        >
          Trước
        </button>
        <span>
          Trang {page} / {totalPages}
        </span>
        <button
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          disabled={page === totalPages || loading}
          onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
        >
          Sau
        </button>
      </div>
    </div>
  );
};
