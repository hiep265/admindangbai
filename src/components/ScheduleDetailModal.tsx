import React from 'react';
import { X } from 'lucide-react';
import { Schedule } from './ScheduleHistoryTabs';

export const ScheduleDetailModal: React.FC<{
  schedule: Schedule;
  onClose: () => void;
}> = ({ schedule, onClose }) => {
  const renderMetadata = () => {
    try {
      const parsed = typeof schedule.content_metadata === 'string'
        ? JSON.parse(schedule.content_metadata)
        : schedule.content_metadata;

      return Object.entries(parsed).map(([key, value]) => (
        <div key={key} className="mb-2">
          <div className="font-medium text-gray-600 mb-1">{key}</div>
          <div className="bg-white border border-gray-200 rounded px-3 py-2 text-sm text-gray-800 whitespace-pre-wrap">
            {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
          </div>
        </div>
      ));
    } catch (err) {
      return <pre className="text-red-600 text-sm">Invalid metadata format</pre>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-2xl relative animate-fade-in">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={22} />
        </button>

        <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          🗓️ Chi tiết lịch đăng
        </h3>

        <table className="w-full text-sm text-gray-700">
          <tbody className="divide-y divide-gray-200">
            <tr>
              <td className="font-medium py-3 pr-4 w-1/4 text-gray-600">Nền tảng</td>
              <td className="py-3 capitalize">{schedule.platform}</td>
            </tr>
            <tr>
              <td className="font-medium py-3 pr-4 text-gray-600">Thời gian</td>
              <td className="py-3">{new Date(schedule.scheduled_time).toLocaleString()}</td>
            </tr>
            {schedule.platform === 'youtube' && (
              <tr>
                <td className="font-medium py-3 pr-4 text-gray-600">Youtube URL</td>
                <td className="py-3">{schedule.youtube_url}</td>
              </tr>
            )}
            <tr>
              <td className="font-medium py-3 pr-4 text-gray-600">Trạng thái</td>
              <td className="py-3">
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold 
                  ${schedule.status === 'success' ? 'bg-green-100 text-green-700' : 
                    schedule.status === 'failed' ? 'bg-red-100 text-red-700' : 
                    'bg-yellow-100 text-yellow-700'}`}>{schedule.status}</span>
              </td>
            </tr>
            <tr>
              <td className="font-medium py-3 pr-4 align-top text-gray-600">Metadata</td>
              <td className="py-3">
                <div className="space-y-2 max-h-64 overflow-auto pr-2">
                  {renderMetadata()}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
