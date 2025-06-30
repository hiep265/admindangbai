import React, { useState } from 'react';
import { Download } from 'lucide-react';

const PLATFORM_OPTIONS = [
  { value: '', label: 'Tất cả nền tảng' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'youtube', label: 'YouTube' },
];

export const ScheduleExportButton: React.FC<{ data: any[] }> = ({ data }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [platform, setPlatform] = useState('');
  const [fromTime, setFromTime] = useState('');
  const [toTime, setToTime] = useState('');

  const handleExport = () => {
    const csv = [
      ['ID', 'Platform', 'Time', 'Status'],
      ...filteredData.map(sch => [
        sch.id,
        sch.platform,
        new Date(sch.scheduled_time).toLocaleString(),
        sch.status
      ])
    ]
      .map(row => row.map(String).map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schedules_export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filter & sort for preview
  const filteredData = data
    .filter(sch => {
      let ok = true;
      if (platform && sch.platform !== platform) ok = false;
      if (fromTime && new Date(sch.scheduled_time) < new Date(fromTime)) ok = false;
      if (toTime && new Date(sch.scheduled_time) > new Date(toTime)) ok = false;
      return ok;
    })
    .sort((a, b) => new Date(b.scheduled_time).getTime() - new Date(a.scheduled_time).getTime());

  return (
    <>
      <button
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg shadow-md hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-200"
        onClick={() => setShowPreview(true)}
        title="Export to Excel"
      >
        <Download size={18} /> Export Excel
      </button>
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-4xl w-full relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition text-xl"
              onClick={() => setShowPreview(false)}
            >
              ✕
            </button>
            <h3 className="text-2xl font-bold mb-6 text-gray-800">📊 Excel Data Preview</h3>
            {/* Filter UI */}
            <div className="flex flex-wrap gap-2 mb-4 items-center">
              <select
                className="border rounded px-3 py-2 text-sm"
                value={platform}
                onChange={e => setPlatform(e.target.value)}
              >
                {PLATFORM_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <input
                type="datetime-local"
                className="border rounded px-2 py-1 text-sm"
                value={fromTime}
                onChange={e => setFromTime(e.target.value)}
                placeholder="Từ ngày"
              />
              <input
                type="datetime-local"
                className="border rounded px-2 py-1 text-sm"
                value={toTime}
                onChange={e => setToTime(e.target.value)}
                placeholder="Đến ngày"
              />
              <span className="ml-2 text-gray-500 text-xs">({filteredData.length} kết quả, mới nhất lên đầu)</span>
            </div>
            <div className="overflow-x-auto border rounded-lg">
              <table className="min-w-full text-sm text-gray-700">
                <thead className="bg-gray-100 text-left">
                  <tr>
                    <th className="px-4 py-3 border">ID</th>
                    <th className="px-4 py-3 border">Platform</th>
                    <th className="px-4 py-3 border">Time</th>
                    <th className="px-4 py-3 border">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((sch) => (
                    <tr key={sch.id} className="even:bg-gray-50">
                      <td className="px-4 py-2 border">{sch.id}</td>
                      <td className="px-4 py-2 border">{sch.platform}</td>
                      <td className="px-4 py-2 border">{new Date(sch.scheduled_time).toLocaleString()}</td>
                      <td className="px-4 py-2 border">{sch.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 text-right">
              <button
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition"
                onClick={handleExport}
              >
                <Download size={16} /> Tải Excel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
