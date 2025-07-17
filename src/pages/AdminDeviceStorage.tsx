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
  Database,
  X,
  Save,
  Loader,
  Link
} from 'lucide-react';
import { deviceApiService } from '../services/deviceApiService';
import { DeviceStorage as DeviceStorageType, DeviceInfo, Storage, DeviceFilter, DevicePagination } from '../types/device';

const DeviceStorageRow: React.FC<{
  deviceStorage: DeviceStorageType;
  onDelete: (id: string) => void;
}> = ({ deviceStorage, onDelete }) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-8 w-8 rounded-md bg-blue-100 flex items-center justify-center">
            <Database className="h-4 w-4 text-blue-600" />
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">{deviceStorage.storage?.capacity || 0} GB</div>
            <div className="text-sm text-gray-500">{deviceStorage.storage?.type || 'Unknown'}</div>
          </div>
        </div>
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
                    onDelete(deviceStorage.id);
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

const DeviceStorageModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (deviceStorageData: { device_info_id: string; capacity: number }) => void;
  isLoading: boolean;
}> = ({ isOpen, onClose, onSave, isLoading }) => {
  const [formData, setFormData] = useState<{ device_info_id: string; capacity: number | '' }>({
    device_info_id: '',
    capacity: ''
  });
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
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
      setDevices(devicesResult.devices);
      // Set default values if options are available
      if (devicesResult.devices.length > 0) {
        setFormData(prev => ({ ...prev, device_info_id: devicesResult.devices[0].id }));
      }
    } catch (error) {
      console.error('Error fetching options:', error);
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'capacity' ? (value === '' ? '' : Number(value)) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.device_info_id && formData.capacity) {
      onSave({ device_info_id: formData.device_info_id, capacity: Number(formData.capacity) });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Thêm dung lượng cho thiết bị</h2>
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
                        {device.name} ({device.brand} {device.model})
                      </option>
                    ))
                  )}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Dung lượng (GB)</label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  min={1}
                  required
                  placeholder="Nhập dung lượng (GB)"
                />
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">Xem trước</label>
                <div className="mt-1 p-4 border border-gray-200 rounded-md">
                  <div className="flex items-center">
                    <div className="flex items-center">
                      <Smartphone className="h-5 w-5 text-gray-500 mr-2" />
                      <span className="text-sm font-medium">
                        {devices.find(d => d.id === formData.device_info_id)?.name || 'Chọn thiết bị'}
                      </span>
                    </div>
                    <div className="mx-2 text-gray-400">
                      <Link className="h-4 w-4" />
                    </div>
                    <div className="flex items-center">
                      <Database className="h-5 w-5 text-blue-500 mr-2" />
                      <span className="text-sm font-medium">
                        {formData.capacity ? `${formData.capacity} GB` : 'Nhập dung lượng'}
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
                disabled={isLoading || !formData.device_info_id || !formData.capacity}
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

export const AdminDeviceStorage: React.FC = () => {
  const [deviceStorages, setDeviceStorages] = useState<DeviceStorageType[]>([]);
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
  // Thêm state chọn thiết bị để lấy device storages theo thiết bị
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [storages, setStorages] = useState<Storage[]>([]);
  // Thêm state cho danh sách thiết bị đã lọc theo tìm kiếm
  const [filteredDevices, setFilteredDevices] = useState<DeviceInfo[]>([]);

  useEffect(() => {
    // Fetch devices và storages cho select
    const fetchOptions = async () => {
      try {
        const devicesResult = await deviceApiService.getDeviceInfos({}, { page: 1, limit: 100 });
        setDevices(devicesResult.devices);
        setFilteredDevices(devicesResult.devices); // ban đầu hiển thị tất cả
        const storagesResult = await deviceApiService.getStorages({}, { page: 1, limit: 100 });
        setStorages(storagesResult.storages);
      } catch (error) {
        console.error('Error fetching options:', error);
      }
    };
    fetchOptions();
  }, []);

  useEffect(() => {
    fetchDeviceStorages();
  }, [pagination.page, filter, selectedDeviceId]);

  const fetchDeviceStorages = async () => {
    setIsLoading(true);
    try {
      if (!selectedDeviceId) {
        setDeviceStorages([]);
        return;
      }
      const result = await deviceApiService.getDeviceStorages(selectedDeviceId);
      // Map lại để gán storage object dựa trên capacity (vì API chỉ trả về capacity)
      const mapped = Array.isArray(result)
        ? result.map((ds: any) => ({
            ...ds,
            storage: storages.find(s => s.capacity === ds.capacity) || { capacity: ds.capacity, type: 'Unknown' }
          }))
        : [];
      setDeviceStorages(mapped);
      // Nếu có phân trang, set lại pagination
    } catch (error) {
      console.error('Error fetching device storages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Sửa lại handleSearch để filter danh sách thiết bị
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const keyword = e.target.value.toLowerCase();
    setFilter(prev => ({ ...prev, search: e.target.value }));
    setPagination(prev => ({ ...prev, page: 1 }));
    if (!keyword) {
      setFilteredDevices(devices);
    } else {
      setFilteredDevices(devices.filter(device =>
        (device.name && device.name.toLowerCase().includes(keyword)) ||
        (device.brand && device.brand.toLowerCase().includes(keyword)) ||
        (device.model && device.model.toLowerCase().includes(keyword))
      ));
    }
  };

  const handleCreateDeviceStorage = () => {
    setIsModalOpen(true);
  };

  const handleDeleteDeviceStorage = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa liên kết thiết bị-dung lượng này?')) {
      setIsDeleting(true);
      try {
        // Cần truyền device_info_id và storage_id
        await deviceApiService.removeStorageFromDevice(selectedDeviceId, id);
        fetchDeviceStorages();
      } catch (error) {
        console.error('Error deleting device storage:', error);
        alert('Có lỗi xảy ra khi xóa liên kết thiết bị-dung lượng');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleSaveDeviceStorage = async (deviceStorageData: { device_info_id: string; capacity: number }) => {
    setIsLoading(true);
    try {
      await deviceApiService.addStorageToDevice(deviceStorageData.device_info_id, deviceStorageData.capacity);
      setIsModalOpen(false);
      fetchDeviceStorages();
    } catch (error) {
      console.error('Error saving device storage:', error);
      alert('Có lỗi xảy ra khi lưu liên kết thiết bị-dung lượng');
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
            <Database className="h-5 w-5" />
          </div>
          <span className="ml-2">Quản lý thiết bị-dung lượng</span>
        </h3>
        <button
          onClick={handleCreateDeviceStorage}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Thêm dung lượng cho thiết bị
        </button>
      </div>
      
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        <div className="mb-5 flex justify-between">
          <div className="relative max-w-xs w-full flex items-center space-x-2">
            <select
              className="block w-48 border border-gray-300 rounded-md p-2 mr-2"
              value={selectedDeviceId}
              onChange={e => {
                setSelectedDeviceId(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
            >
              <option value="">Chọn thiết bị để xem dung lượng</option>
              {filteredDevices.map(device => (
                <option key={device.id} value={device.id}>
                  {device.name ? `${device.name} - ` : ''}{device.brand} {device.model}
                </option>
              ))}
            </select>
            {/* <div className="relative max-w-xs w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm thiết bị hoặc dung lượng..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={filter.search}
                onChange={handleSearch}
              />
            </div> */}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dung lượng
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading && deviceStorages.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center">
                      <Loader className="h-5 w-5 text-blue-500 animate-spin mr-3" />
                      <span>Đang tải...</span>
                    </div>
                  </td>
                </tr>
              ) : deviceStorages.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-6 py-4 text-center text-gray-500">
                    Không có liên kết thiết bị-dung lượng nào
                  </td>
                </tr>
              ) : (
                deviceStorages.map(deviceStorage => (
                  <DeviceStorageRow
                    key={deviceStorage.id}
                    deviceStorage={deviceStorage}
                    onDelete={handleDeleteDeviceStorage}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {deviceStorages.length > 0 && (
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
      
      {/* Device Storage Modal */}
      <DeviceStorageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveDeviceStorage}
        isLoading={isLoading}
      />
    </div>
  );
};