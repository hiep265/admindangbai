import React, { useState } from 'react';
import { Eye, Trash2, RefreshCw } from 'lucide-react';
import { Schedule } from './ScheduleHistoryTabs';
import { RepostModal } from './RepostModal';

export const ScheduleHistoryTable: React.FC<{
  schedules: Schedule[];
  onViewDetail: (schedule: Schedule) => void;
  onDeleteSchedule?: (schedule: Schedule) => void;
  onRepostSuccess?: () => void;
}> = ({ schedules, onViewDetail, onDeleteSchedule, onRepostSuccess }) => {
  const [repostSchedule, setRepostSchedule] = useState<Schedule | null>(null);

  if (schedules.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 text-center text-gray-500 text-sm">
        Không có lịch đăng nào trong mục này.
      </div>
    );
  }

  const handleRepostSuccess = () => {
    if (onRepostSuccess) {
      onRepostSuccess();
    }
  };

  return (
    <>
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-x-auto">
      <table className="min-w-full text-sm text-gray-700">
        <thead>
          <tr className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
            <th className="px-6 py-3 text-left">STT</th>
            <th className="px-6 py-3 text-left">Nền tảng</th>
            <th className="px-6 py-3 text-left">Thời gian</th>
            <th className="px-6 py-3 text-left">Trạng thái</th>
            <th className="px-6 py-3 text-left">Hành động</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {schedules.map((sch, idx) => (
            <tr key={sch.id} className="hover:bg-gray-50 transition">
              <td className="px-6 py-3">{idx + 1}</td>
              <td className="px-6 py-3">{sch.platform}</td>
              <td className="px-6 py-3">{new Date(sch.scheduled_time).toLocaleString()}</td>
              <td className="px-6 py-3">
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold 
                  ${sch.status === 'success' ? 'bg-green-100 text-green-700' : 
                    sch.status === 'failed' ? 'bg-red-100 text-red-700' : 
                    'bg-yellow-100 text-yellow-700'}`}>
                  {sch.status}
                </span>
              </td>
              <td className="px-6 py-3">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => onViewDetail(sch)}
                    className="flex items-center gap-1 px-2 py-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition text-xs font-medium border border-transparent hover:border-blue-200"
                  >
                    <Eye size={14} /> Xem
                  </button>

                  {sch.status === 'completed' && (
                    <button
                      onClick={() => setRepostSchedule(sch)}
                      className="flex items-center gap-1 px-2 py-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition text-xs font-medium border border-transparent hover:border-green-200"
                    >
                      <RefreshCw size={14} /> Đăng lại
                    </button>
                  )}

                  {onDeleteSchedule && (
                    <button
                      onClick={() => onDeleteSchedule(sch)}
                      className="flex items-center gap-1 px-2 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition text-xs font-medium border border-transparent hover:border-red-200"
                    >
                      <Trash2 size={14} /> Xóa
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Repost Modal */}
    {repostSchedule && (
      <RepostModal
        schedule={repostSchedule}
        onClose={() => setRepostSchedule(null)}
        onSuccess={handleRepostSuccess}
      />
    )}
  </>
  );
};
