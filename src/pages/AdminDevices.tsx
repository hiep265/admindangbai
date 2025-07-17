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
  X,
  Save,
  Loader
} from 'lucide-react';
import { deviceApiService } from '../services/deviceApiService';
import { DeviceInfo, DeviceFilter, DevicePagination } from '../types/device';

const DeviceRow: React.FC<{
  device: DeviceInfo;
  onEdit: (device: DeviceInfo) => void;
  onDelete: (id: string) => void;
  onView: (device: DeviceInfo) => void;
}> = ({ device, onEdit, onDelete, onView }) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            {device.image_url ? (
              <img className="h-10 w-10 rounded-md object-cover" src={device.image_url} alt={device.model} />
            ) : (
              <div className="h-10 w-10 rounded-md bg-gray-300 flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-gray-500" />
              </div>
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{device.model}</div>
            <div className="text-sm text-gray-500">{device.chip_ram}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {device.screen || '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {device.release_date || '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(device.created_at).toLocaleDateString()}
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
                    onView(device);
                    setShowActions(false);
                  }}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Xem chi tiết
                </button>
                <button
                  onClick={() => {
                    onEdit(device);
                    setShowActions(false);
                  }}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Chỉnh sửa
                </button>
                <button
                  onClick={() => {
                    onDelete(device.id);
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

const DeviceModal: React.FC<{
  device: DeviceInfo | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (device: Partial<DeviceInfo>) => void;
  isLoading: boolean;
}> = ({ device, isOpen, onClose, onSave, isLoading }) => {
  const [formData, setFormData] = useState<Partial<DeviceInfo>>({
    model: '',
    release_date: '',
    screen: '',
    chip_ram: '',
    camera: '',
    battery: '',
    connectivity_os: '',
    color_english: '',
    dimensions_weight: '',
    warranty: ''
  });

  useEffect(() => {
    if (device) {
      setFormData({
        model: device.model || '',
        release_date: device.release_date || '',
        screen: device.screen || '',
        chip_ram: device.chip_ram || '',
        camera: device.camera || '',
        battery: device.battery || '',
        connectivity_os: device.connectivity_os || '',
        color_english: device.color_english || '',
        dimensions_weight: device.dimensions_weight || '',
        warranty: device.warranty || ''
      });
    } else {
      setFormData({
        model: '',
        release_date: '',
        screen: '',
        chip_ram: '',
        camera: '',
        battery: '',
        connectivity_os: '',
        color_english: '',
        dimensions_weight: '',
        warranty: ''
      });
    }
  }, [device]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
          <h2 className="text-xl font-semibold">
            {device ? 'Chỉnh sửa thiết bị' : 'Thêm thiết bị mới'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Model</label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Ngày ra mắt</label>
              <input
                type="text"
                name="release_date"
                value={formData.release_date}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Màn hình</label>
              <input
                type="text"
                name="screen"
                value={formData.screen}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Chip & RAM</label>
              <input
                type="text"
                name="chip_ram"
                value={formData.chip_ram}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Camera</label>
              <input
                type="text"
                name="camera"
                value={formData.camera}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Pin</label>
              <input
                type="text"
                name="battery"
                value={formData.battery}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Kết nối & Hệ điều hành</label>
              <input
                type="text"
                name="connectivity_os"
                value={formData.connectivity_os}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Màu sắc (tiếng Anh)</label>
              <input
                type="text"
                name="color_english"
                value={formData.color_english}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Kích thước & Trọng lượng</label>
              <input
                type="text"
                name="dimensions_weight"
                value={formData.dimensions_weight}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Bảo hành</label>
              <input
                type="text"
                name="warranty"
                value={formData.warranty}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
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
              disabled={isLoading}
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
      </div>
    </div>
  );
};

const DeviceDetailModal: React.FC<{
  device: DeviceInfo | null;
  isOpen: boolean;
  onClose: () => void;
}> = ({ device, isOpen, onClose }) => {
  const [colors, setColors] = useState<any[]>([]);
  const [storages, setStorages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (device && isOpen) {
      fetchDeviceDetails(device.id);
    }
  }, [device, isOpen]);

  const fetchDeviceDetails = async (deviceId: string) => {
    setLoading(true);
    try {
      // Sử dụng Promise.allSettled để đảm bảo cả hai yêu cầu được xử lý độc lập
      const [colorsResult, storagesResult] = await Promise.allSettled([
        deviceApiService.getColorsByDeviceInfoId(deviceId),
        deviceApiService.getDeviceStorages(deviceId)
      ]);
      
      // Xử lý kết quả màu sắc
      if (colorsResult.status === 'fulfilled') {
        setColors(colorsResult.value);
      } else {
        console.error('Error fetching colors:', colorsResult.reason);
        setColors([]);
      }
      
      // Xử lý kết quả dung lượng
      if (storagesResult.status === 'fulfilled') {
        setStorages(storagesResult.value);
      } else {
        console.error('Error fetching storages:', storagesResult.reason);
        setStorages([]);
      }
    } catch (error) {
      console.error('Error fetching device details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !device) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-semibold">Chi tiết thiết bị</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-4">
          <div className="flex flex-col md:flex-row mb-6">
            <div className="w-full md:w-1/3 mb-4 md:mb-0">
              {device.image_url ? (
                <img 
                  src={device.image_url} 
                  alt={device.model} 
                  className="w-full h-auto rounded-md object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 rounded-md flex items-center justify-center">
                  <Smartphone className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>
            <div className="w-full md:w-2/3 md:pl-6">
              <h3 className="text-xl font-bold">{device.model}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-sm text-gray-500">Ngày ra mắt</p>
                  <p>{device.release_date || 'Không có'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Màn hình</p>
                  <p>{device.screen || 'Không có'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Chip & RAM</p>
                  <p>{device.chip_ram || 'Không có'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Camera</p>
                  <p>{device.camera || 'Không có'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pin</p>
                  <p>{device.battery || 'Không có'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Kết nối & Hệ điều hành</p>
                  <p>{device.connectivity_os || 'Không có'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Màu sắc</p>
                  <p>{device.color_english || 'Không có'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Kích thước & Trọng lượng</p>
                  <p>{device.dimensions_weight || 'Không có'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Bảo hành</p>
                  <p>{device.warranty || 'Không có'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ngày tạo</p>
                  <p>{new Date(device.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cập nhật lần cuối</p>
                  <p>{new Date(device.updated_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
          
          {device.description && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Mô tả</h4>
              <p className="text-gray-700">{device.description}</p>
            </div>
          )}
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Màu sắc có sẵn</h4>
              {loading ? (
                <div className="flex items-center justify-center h-20">
                  <Loader className="h-5 w-5 text-blue-500 animate-spin" />
                </div>
              ) : colors.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {colors.map(color => (
                    <span 
                      key={color.id} 
                      className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                    >
                      {color.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Không có màu sắc nào</p>
              )}
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Dung lượng có sẵn</h4>
              {loading ? (
                <div className="flex items-center justify-center h-20">
                  <Loader className="h-5 w-5 text-blue-500 animate-spin" />
                </div>
              ) : storages.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {storages.map(storage => (
                    <span 
                      key={storage.id} 
                      className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                    >
                      {storage.capacity} GB
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Không có dung lượng nào</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="border-t p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 rounded-md text-gray-700 hover:bg-gray-200"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export const AdminDevices: React.FC = () => {
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<DeviceInfo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
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
    fetchDevices();
  }, [pagination.page, filter]);

  const fetchDevices = async () => {
    setIsLoading(true);
    try {
      const result = await deviceApiService.getDeviceInfos(filter, pagination);
      setDevices(result.devices);
      setPagination(prev => ({
        ...prev,
        total: result.pagination.total,
        totalPages: result.pagination.totalPages
      }));
    } catch (error) {
      console.error('Error fetching devices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(prev => ({ ...prev, search: e.target.value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleCreateDevice = () => {
    setSelectedDevice(null);
    setIsModalOpen(true);
  };

  const handleEditDevice = (device: DeviceInfo) => {
    setSelectedDevice(device);
    setIsModalOpen(true);
  };

  const handleViewDevice = (device: DeviceInfo) => {
    setSelectedDevice(device);
    setIsDetailModalOpen(true);
  };

  const handleDeleteDevice = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thiết bị này?')) {
      setIsDeleting(true);
      try {
        await deviceApiService.deleteDeviceInfo(id);
        fetchDevices();
      } catch (error) {
        console.error('Error deleting device:', error);
        alert('Có lỗi xảy ra khi xóa thiết bị');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleSaveDevice = async (deviceData: Partial<DeviceInfo>) => {
    setIsLoading(true);
    try {
      if (selectedDevice) {
        await deviceApiService.updateDeviceInfo(selectedDevice.id, deviceData);
      } else {
        await deviceApiService.createDeviceInfo(deviceData);
      }
      setIsModalOpen(false);
      fetchDevices();
    } catch (error) {
      console.error('Error saving device:', error);
      alert('Có lỗi xảy ra khi lưu thiết bị');
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
          <Smartphone className="h-5 w-5 mr-2" />
          Quản lý thiết bị
        </h3>
        <button
          onClick={handleCreateDevice}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Thêm thiết bị
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
              placeholder="Tìm kiếm thiết bị..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={filter.search}
              onChange={handleSearch}
            />
          </div>
          
          <div className="flex space-x-2">
            <button
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              onClick={() => alert('Tính năng đang phát triển')}
            >
              <Upload className="h-4 w-4 mr-2" />
              Import
            </button>
            <button
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              onClick={() => alert('Tính năng đang phát triển')}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Model
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Màn hình
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày ra mắt
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
              {isLoading && devices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center">
                      <Loader className="h-5 w-5 text-blue-500 animate-spin mr-3" />
                      <span>Đang tải...</span>
                    </div>
                  </td>
                </tr>
              ) : devices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Không có thiết bị nào
                  </td>
                </tr>
              ) : (
                devices.map(device => (
                  <DeviceRow
                    key={device.id}
                    device={device}
                    onEdit={handleEditDevice}
                    onDelete={handleDeleteDevice}
                    onView={handleViewDevice}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {devices.length > 0 && (
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
      
      {/* Device Modal */}
      <DeviceModal
        device={selectedDevice}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveDevice}
        isLoading={isLoading}
      />
      
      {/* Device Detail Modal */}
      <DeviceDetailModal
        device={selectedDevice}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />
    </div>
  );
};