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
  Palette,
  X,
  Save,
  Loader
} from 'lucide-react';
import { deviceApiService } from '../services/deviceApiService';
import { Color, DeviceFilter, DevicePagination } from '../types/device';

const ColorRow: React.FC<{
  color: Color;
  onEdit: (color: Color) => void;
  onDelete: (id: string) => void;
  onView: (color: Color) => void;
}> = ({ color, onEdit, onDelete, onView }) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div 
            className="flex-shrink-0 h-10 w-10 rounded-md border border-gray-200" 
            style={{ backgroundColor: color.hex_code }}
          />
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{color.name}</div>
            <div className="text-sm text-gray-500">{color.hex_code}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(color.created_at).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(color.updated_at).toLocaleDateString()}
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
                    onView(color);
                    setShowActions(false);
                  }}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Xem chi tiết
                </button>
                <button
                  onClick={() => {
                    onEdit(color);
                    setShowActions(false);
                  }}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Chỉnh sửa
                </button>
                <button
                  onClick={() => {
                    onDelete(color.id);
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

const ColorModal: React.FC<{
  color: Color | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (color: Partial<Color>) => void;
  isLoading: boolean;
}> = ({ color, isOpen, onClose, onSave, isLoading }) => {
  const [formData, setFormData] = useState<Partial<Color>>({
    name: '',
    hex_code: '#000000'
  });

  useEffect(() => {
    if (color) {
      setFormData({
        name: color.name || '',
        hex_code: color.hex_code || '#000000'
      });
    } else {
      setFormData({
        name: '',
        hex_code: '#000000'
      });
    }
  }, [color]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
            {color ? 'Chỉnh sửa màu sắc' : 'Thêm màu sắc mới'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Tên màu</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Mã màu (HEX)</label>
              <div className="flex mt-1">
                <input
                  type="color"
                  name="hex_code"
                  value={formData.hex_code}
                  onChange={handleChange}
                  className="h-10 w-10 border border-gray-300 rounded-md shadow-sm p-0"
                />
                <input
                  type="text"
                  name="hex_code"
                  value={formData.hex_code}
                  onChange={handleChange}
                  className="ml-2 flex-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                  title="Mã màu HEX hợp lệ (ví dụ: #FF5733)"
                  required
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Xem trước</label>
              <div className="mt-1 flex items-center">
                <div 
                  className="h-16 w-16 rounded-md border border-gray-300" 
                  style={{ backgroundColor: formData.hex_code }}
                />
                <div className="ml-4">
                  <p className="text-sm font-medium">{formData.name || 'Tên màu'}</p>
                  <p className="text-sm text-gray-500">{formData.hex_code}</p>
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

const ColorDetailModal: React.FC<{
  color: Color | null;
  isOpen: boolean;
  onClose: () => void;
}> = ({ color, isOpen, onClose }) => {
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [deviceFilter, setDeviceFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    if (color && isOpen) {
      fetchColorDetails(color.id);
    }
  }, [color, isOpen]);

  const fetchColorDetails = async (colorId: string) => {
    setLoading(true);
    try {
      const devicesData = await deviceApiService.getDevicesByColorId(colorId);
      setDevices(devicesData);
      setCurrentPage(1); // Reset to first page when loading new data
    } catch (error) {
      console.error('Error fetching color details:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter devices based on search input
  const filteredDevices = devices.filter(device => {
    const searchTerm = deviceFilter.toLowerCase();
    return (
      device.name?.toLowerCase().includes(searchTerm) ||
      device.brand?.toLowerCase().includes(searchTerm) ||
      device.model?.toLowerCase().includes(searchTerm)
    );
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredDevices.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDevices = filteredDevices.slice(indexOfFirstItem, indexOfLastItem);

  if (!isOpen || !color) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl my-8">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Chi tiết màu sắc</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center mb-8 gap-6">
            <div 
              className="h-32 w-32 rounded-md border border-gray-300 flex-shrink-0" 
              style={{ backgroundColor: color.hex_code }}
            />
            <div className="flex-grow">
              <h3 className="text-2xl font-bold mb-2">{color.name}</h3>
              <p className="text-gray-600 mb-4">{color.hex_code}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-500">Ngày tạo</p>
                  <p className="font-medium">{new Date(color.created_at).toLocaleDateString()}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-500">Cập nhật lần cuối</p>
                  <p className="font-medium">{new Date(color.updated_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
              <h4 className="text-lg font-medium">Thiết bị sử dụng màu này</h4>
              <div className="relative w-full md:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Tìm kiếm thiết bị..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={deviceFilter}
                  onChange={(e) => {
                    setDeviceFilter(e.target.value);
                    setCurrentPage(1); // Reset to first page when filtering
                  }}
                />
              </div>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center h-40 bg-gray-50 rounded-md">
                <Loader className="h-8 w-8 text-blue-500 animate-spin" />
              </div>
            ) : filteredDevices.length > 0 ? (
              <div className="bg-white rounded-md overflow-hidden border border-gray-200 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thiết bị
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thương hiệu
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Model
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentDevices.map(device => (
                        <tr key={device.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {device.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {device.brand}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {device.model}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200 bg-gray-50">
                    <div className="text-sm text-gray-700">
                      Hiển thị <span className="font-medium">{indexOfFirstItem + 1}</span> đến <span className="font-medium">
                        {Math.min(indexOfLastItem, filteredDevices.length)}
                      </span> trong <span className="font-medium">{filteredDevices.length}</span> kết quả
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`inline-flex items-center px-3 py-1 border border-gray-300 text-sm rounded-md ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`inline-flex items-center px-3 py-1 border border-gray-300 text-sm rounded-md ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 p-8 rounded-md text-center">
                <p className="text-gray-500">Không có thiết bị nào sử dụng màu này</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="border-t p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 rounded-md text-gray-700 hover:bg-gray-200 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export const AdminColors: React.FC = () => {
  const [colors, setColors] = useState<Color[]>([]);
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filter, setFilter] = useState<DeviceFilter>({ search: '' });
  const [pagination, setPagination] = useState<DevicePagination>({
    page: 1,
    limit: 31,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchColors();
  }, [pagination.page, pagination.limit, filter.search]);

  const fetchColors = async () => {
    setIsLoading(true);
    try {
      const skip = (pagination.page - 1) * pagination.limit;
      const limit = pagination.limit;
      const result = await deviceApiService.getColors(skip, limit, filter.search);
      setColors(result.data);
      setPagination(prev => ({
        ...prev,
        total: result.metadata.total,
        totalPages: result.metadata.total_pages
      }));
    } catch (error) {
      console.error('Error fetching colors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(prev => ({ ...prev, search: e.target.value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleCreateColor = () => {
    setSelectedColor(null);
    setIsModalOpen(true);
  };

  const handleEditColor = (color: Color) => {
    setSelectedColor(color);
    setIsModalOpen(true);
  };

  const handleViewColor = (color: Color) => {
    setSelectedColor(color);
    setIsDetailModalOpen(true);
  };

  const handleDeleteColor = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa màu sắc này?')) {
      setIsDeleting(true);
      try {
        await deviceApiService.deleteColor(id);
        fetchColors();
      } catch (error) {
        console.error('Error deleting color:', error);
        alert('Có lỗi xảy ra khi xóa màu sắc');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleSaveColor = async (colorData: Partial<Color>) => {
    setIsLoading(true);
    try {
      if (selectedColor) {
        await deviceApiService.updateColor(selectedColor.id, colorData);
      } else {
        await deviceApiService.createColor(colorData);
      }
      setIsModalOpen(false);
      fetchColors();
    } catch (error) {
      console.error('Error saving color:', error);
      alert('Có lỗi xảy ra khi lưu màu sắc');
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
          <Palette className="h-5 w-5 mr-2" />
          Quản lý màu sắc
        </h3>
        <button
          onClick={handleCreateColor}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Thêm màu sắc
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
              placeholder="Tìm kiếm màu sắc..."
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
                  Màu sắc
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cập nhật lần cuối
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading && colors.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center">
                      <Loader className="h-5 w-5 text-blue-500 animate-spin mr-3" />
                      <span>Đang tải...</span>
                    </div>
                  </td>
                </tr>
              ) : colors.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    Không có màu sắc nào
                  </td>
                </tr>
              ) : (
                colors.map(color => (
                  <ColorRow
                    key={color.id}
                    color={color}
                    onEdit={handleEditColor}
                    onDelete={handleDeleteColor}
                    onView={handleViewColor}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {colors.length > 0 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-700">
              Hiển thị <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> đến <span className="font-medium">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span> trong <span className="font-medium">{pagination.total}</span> kết quả
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">Hiển thị:</span>
                <select
                  value={pagination.limit}
                  onChange={(e) => {
                    const newLimit = parseInt(e.target.value);
                    setPagination(prev => ({
                      ...prev,
                      page: 1, // Reset về trang 1 khi thay đổi limit
                      limit: newLimit
                    }));
                  }}
                  className="border border-gray-300 rounded-md text-sm py-1 px-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="31">31</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
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
          </div>
        )}
      </div>
      
      {/* Color Modal */}
      <ColorModal
        color={selectedColor}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveColor}
        isLoading={isLoading}
      />
      
      {/* Color Detail Modal */}
      <ColorDetailModal
        color={selectedColor}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />
    </div>
  );
};