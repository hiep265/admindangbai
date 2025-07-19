import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye,
  Plus,
  Download,
  Upload,
  ChevronLeft,
  ChevronRight,
  Smartphone,
  Palette,
  X,
  Save,
  Loader,
  Link
} from 'lucide-react';
import { deviceApiService } from '../services/deviceApiService';
import { DeviceColor, DeviceInfo, Color, DeviceFilter, DevicePagination } from '../types/device';

const DeviceColorRow: React.FC<{
  deviceColor: DeviceColor;
  onDelete: (id: string) => void;
}> = ({ deviceColor, onDelete }) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            {deviceColor.device_info?.image_url ? (
              <img 
                className="h-10 w-10 rounded-md object-cover" 
                src={deviceColor.device_info.image_url} 
                alt={deviceColor.device_info.name} 
              />
            ) : (
              <div className="h-10 w-10 rounded-md bg-gray-300 flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-gray-500" />
              </div>
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{deviceColor.device_info?.name}</div>
            <div className="text-sm text-gray-500">{deviceColor.device_info?.brand} {deviceColor.device_info?.model}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div 
            className="flex-shrink-0 h-8 w-8 rounded-md border border-gray-200" 
            style={{ backgroundColor: deviceColor.color?.hex_code }}
          />
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">{deviceColor.color?.name}</div>
            {/* <div className="text-sm text-gray-500">{deviceColor.color?.hex_code || 'Unknown'}</div> */}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(deviceColor.created_at).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="text-gray-400 hover:text-gray-600"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
          {showActions && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
              <div className="py-1">
                <button
                  onClick={() => {
                    onDelete(deviceColor.id);
                    setShowActions(false);
                  }}
                  className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa
                </button>
              </div>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

const DeviceColorModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (deviceColorData: { device_info_id: string; color_id: string }) => void;
  isLoading: boolean;
}> = ({ isOpen, onClose, onSave, isLoading }) => {
  const [formData, setFormData] = useState<{ device_info_id: string; color_id: string }>({
    device_info_id: '',
    color_id: ''
  });
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchOptions();
    }
  }, [isOpen]);

  const fetchOptions = async () => {
    setLoadingOptions(true);
    try {
      const devicesResult = await deviceApiService.getDeviceInfos({}, { page: 1, limit: 100 });
      const colorsResult = await deviceApiService.getColors(0, 100, '');
      setDevices(devicesResult.devices);
      setColors(colorsResult.data);
      
      // Set default values if options are available
      if (devicesResult.devices.length > 0) {
        setFormData(prev => ({ ...prev, device_info_id: devicesResult.devices[0].id }));
      }
      if (colorsResult.data.length > 0) {
        setFormData(prev => ({ ...prev, color_id: colorsResult.data[0].id }));
      }
    } catch (error) {
      console.error('Error fetching options:', error);
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Thêm màu sắc cho thiết bị</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {loadingOptions ? (
          <div className="p-4 flex justify-center items-center h-40">
            <Loader className="h-8 w-8 text-blue-500 animate-spin" />
            <span className="ml-2">Đang tải dữ liệu...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Thiết bị</label>
                <select
                  name="device_info_id"
                  value={formData.device_info_id}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                >
                  {devices.length === 0 ? (
                    <option value="" disabled>Không có thiết bị nào</option>
                  ) : (
                    devices.map(device => (
                      <option key={device.id} value={device.id}>
                        {device.model}
                      </option>
                    ))
                  )}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Màu sắc</label>
                <select
                  name="color_id"
                  value={formData.color_id}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                >
                  {colors.length === 0 ? (
                    <option value="" disabled>Không có màu sắc nào</option>
                  ) : (
                    colors.map(color => (
                      <option key={color.id} value={color.id}>
                        {color.name} ({color.hex_code})
                      </option>
                    ))
                  )}
                </select>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">Xem trước</label>
                <div className="mt-1 p-4 border border-gray-200 rounded-md">
                  <div className="flex items-center">
                    <div className="flex items-center">
                      <Smartphone className="h-5 w-5 text-gray-500 mr-2" />
                      <span className="text-sm font-medium">
                        {devices.find(d => d.id === formData.device_info_id)?.model || 'Chọn thiết bị'}
                      </span>
                    </div>
                    <div className="mx-2 text-gray-400">
                      <Link className="h-4 w-4" />
                    </div>
                    <div className="flex items-center">
                      <div 
                        className="h-5 w-5 rounded-md border border-gray-200 mr-2" 
                        style={{ backgroundColor: colors.find(c => c.id === formData.color_id)?.hex_code }}
                      />
                      <span className="text-sm font-medium">
                        {colors.find(c => c.id === formData.color_id)?.name || 'Chọn màu sắc'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isLoading || !formData.device_info_id || !formData.color_id}
                className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 flex items-center"
              >
                {isLoading ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Lưu
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export const AdminDeviceColors: React.FC = () => {
  const [deviceColors, setDeviceColors] = useState<DeviceColor[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filter, setFilter] = useState<DeviceFilter>({ search: '' });
  const [pagination, setPagination] = useState<DevicePagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchDeviceColors();
  }, [pagination.page, filter]);

  const fetchDeviceColors = async () => {
    setIsLoading(true);
    try {
      const result = await deviceApiService.getAllDeviceColors(filter, pagination);
      setDeviceColors(result.deviceColors);
      setPagination(prev => ({
        ...prev,
        total: result.pagination.total,
        totalPages: result.pagination.totalPages
      }));
    } catch (error) {
      console.error('Error fetching device colors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(prev => ({ ...prev, search: e.target.value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleCreateDeviceColor = () => {
    setIsModalOpen(true);
  };

  const handleDeleteDeviceColor = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa liên kết thiết bị-màu sắc này?')) {
      setIsDeleting(true);
      try {
        // Tìm device color object để lấy device_info_id và color_id
        const deviceColor = deviceColors.find(dc => dc.id === id);
        
        if (deviceColor && deviceColor.device_info_id && deviceColor.color_id) {
          await deviceApiService.removeColorFromDevice(deviceColor.device_info_id, deviceColor.color_id);
        } else {
          throw new Error('Không tìm thấy thông tin thiết bị hoặc màu sắc');
        }
        fetchDeviceColors();
      } catch (error) {
        console.error('Error deleting device color:', error);
        alert('Có lỗi xảy ra khi xóa liên kết thiết bị-màu sắc');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleSaveDeviceColor = async (deviceColorData: { device_info_id: string; color_id: string }) => {
    setIsLoading(true);
    try {
      await deviceApiService.addColorToDevice(deviceColorData.device_info_id, deviceColorData.color_id);
      setIsModalOpen(false);
      fetchDeviceColors();
    } catch (error) {
      console.error('Error saving device color:', error);
      alert('Có lỗi xảy ra khi lưu liên kết thiết bị-màu sắc');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
          <div className="flex items-center">
            <Smartphone className="h-5 w-5" />
            <span className="mx-1">+</span>
            <Palette className="h-5 w-5" />
          </div>
          <span className="ml-2">Quản lý thiết bị-màu sắc</span>
        </h3>
        <button
          onClick={handleCreateDeviceColor}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Thêm màu sắc cho thiết bị
        </button>
      </div>
      
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        <div className="mb-5 flex justify-between">
          <div className="relative max-w-xs w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm thiết bị hoặc màu sắc..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={filter.search}
              onChange={handleSearch}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thiết bị
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Màu sắc
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading && deviceColors.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center">
                      <Loader className="h-5 w-5 text-blue-500 animate-spin mr-3" />
                      <span>Đang tải...</span>
                    </div>
                  </td>
                </tr>
              ) : deviceColors.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    Không có liên kết thiết bị-màu sắc nào
                  </td>
                </tr>
              ) : (
                deviceColors.map(deviceColor => (
                  <DeviceColorRow
                    key={deviceColor.id}
                    deviceColor={deviceColor}
                    onDelete={handleDeleteDeviceColor}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {deviceColors.length > 0 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-700">
              Hiển thị <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> đến <span className="font-medium">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span> trong <span className="font-medium">{pagination.total}</span> kết quả
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className={`inline-flex items-center px-3 py-2 border border-gray-300 text-sm rounded-md ${pagination.page === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className={`inline-flex items-center px-3 py-2 border border-gray-300 text-sm rounded-md ${pagination.page === pagination.totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Device Color Modal */}
      <DeviceColorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveDeviceColor}
        isLoading={isLoading}
      />
    </div>
  );
};