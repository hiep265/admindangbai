import React from 'react';
import { ScheduleHistoryTabs } from '../components/ScheduleHistoryTabs';

export const PostHistoryPage: React.FC = () => {
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-4">Lịch sử đăng bài</h2>
      <p className="text-gray-600 mb-8">Xem lại toàn bộ lịch sử các bài đăng đã lên lịch và đã xử lý trên tất cả các nền tảng.</p>
      <ScheduleHistoryTabs />
    </main>
  );
}; 