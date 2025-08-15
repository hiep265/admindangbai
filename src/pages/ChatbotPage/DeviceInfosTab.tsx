import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { DeviceInfo } from '../../types/deviceTypes';
import { deviceInfoService } from '../../services/deviceInfoService';
import { Plus, Edit, Trash2, Search, Loader, ChevronLeft, ChevronRight, ChevronsUpDown, ChevronDown, ChevronUp, FileUp, FileDown } from 'lucide-react';
import DeviceInfoModal from '../../components/DeviceInfoModal';
import Pagination from '../../components/Pagination';
import Filter, { FilterConfig } from '../../components/Filter';

const DeviceInfosTab: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [deviceInfos, setDeviceInfos] = useState<DeviceInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDeviceInfo, setSelectedDeviceInfo] = useState<DeviceInfo | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'brand', direction: 'asc' });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState<{ brand?: string }>({});
  const [brands, setBrands] = useState<string[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDeviceInfos();
    }
  }, [isAuthenticated, pagination.page, pagination.limit, searchTerm, sortConfig, filters]);

  useEffect(() => {
    // Fetch brands for filter options
    const fetchBrands = async () => {
      try {
        // This should be an API call to a new endpoint that returns distinct brands
        // For now, I'll simulate it, but you should create that endpoint.
        const allBrands = await deviceInfoService.getDistinctBrands(); 
        setBrands(allBrands);
      } catch (error) {
        console.error("Failed to fetch brands for filter:", error);
      }
    };
    fetchBrands();
  }, []);


  const fetchDeviceInfos = async () => {
    setIsLoading(true);
    try {
      const filter = { 
        search: searchTerm,
        sort_by: sortConfig.key,
        sort_order: sortConfig.direction,
        ...filters
      };
      const pageOptions = { page: pagination.page, limit: pagination.limit };
      const result = await deviceInfoService.getDeviceInfos(filter, pageOptions);
      setDeviceInfos(result.devices);
      setPagination(prev => ({
        ...prev,
        total: result.pagination.total,
        totalPages: result.pagination.totalPages
      }));
    } catch (error) {
      console.error('Error fetching device infos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleCreate = () => {
    setSelectedDeviceInfo(null);
    setIsModalOpen(true);
  };

  const handleEdit = (deviceInfo: DeviceInfo) => {
    setSelectedDeviceInfo(deviceInfo);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thông tin thiết bị này?')) {
      return;
    }
    try {
      await deviceInfoService.deleteDeviceInfo(id);
      fetchDeviceInfos();
    } catch (error: any) {
      console.error('Failed to delete device info:', error, typeof error, JSON.stringify(error));
      if (error && error.status === 403) {
        alert(error.message || 'Bạn không có quyền xoá mục này');
      } else if (error?.message?.toLowerCase().includes('quyền')) {
        alert(error.message);
      } else if (typeof error === 'string' && error.toLowerCase().includes('quyền')) {
        alert(error);
      } else {
        const errorMessage = error?.message || 'Xóa thông tin thiết bị không thành công';
        alert(errorMessage);
      }
    }
  };

  const handleSave = async (deviceInfoData: Partial<DeviceInfo>) => {
    setIsLoading(true);
    try {
      if (selectedDeviceInfo) {
        await deviceInfoService.updateDeviceInfo(selectedDeviceInfo.id, deviceInfoData);
      } else {
        await deviceInfoService.createDeviceInfo(deviceInfoData);
      }
      setIsModalOpen(false);
      fetchDeviceInfos();
    } catch (error) {
      alert('Có lỗi xảy ra khi lưu thông tin thiết bị');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportTemplate = async () => {
    try {
      await deviceInfoService.exportTemplate();
    } catch (error) {
      console.error('Error exporting template:', error);
      alert('Có lỗi xảy ra khi xuất file mẫu.');
    }
  };

  const handleTriggerImport = () => {
    fileInputRef.current?.click();
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setIsLoading(true);
        const result = await deviceInfoService.importDeviceInfos(file);
        const importResult = result.data; // Lấy kết quả từ object lồng nhau
        let message = `Import hoàn tất:\n- Tạo mới: ${importResult.created_count}\n- Cập nhật: ${importResult.updated_count}\n- Lỗi: ${importResult.error}`;
        if (importResult.errors && importResult.errors.length > 0) {
          message += `\n\nChi tiết lỗi:\n${importResult.errors.join('\n')}`;
        }
        alert(message);
        fetchDeviceInfos();
      } catch (error) {
        console.error('Error importing from Excel:', error);
        alert('Có lỗi xảy ra khi import file.');
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setIsLoading(false);
      }
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (newLimit: number) => {
    setPagination(prev => ({ ...prev, page: 1, limit: newLimit }));
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleFilterChange = (newFilters: { [key: string]: any }) => {
    setPagination(prev => ({ ...prev, page: 1 }));
    setFilters(newFilters);
  };
  
  const filterConfig: FilterConfig[] = [
    {
      key: 'brand',
      label: 'Hãng',
      type: 'select',
      options: brands.map(brand => ({ label: brand, value: brand })),
    }
  ];

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Quản lý thông tin thiết bị</h2>
        <div className="flex items-center gap-2">
          <Filter config={filterConfig} onFilterChange={handleFilterChange} />
          <button onClick={handleTriggerImport} className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center">
            <FileUp size={20} className="mr-2" />
            Import Excel
          </button>
          <input type="file" ref={fileInputRef} onChange={handleImport} style={{ display: 'none' }} accept=".xlsx, .xls" />
          <button onClick={handleExportTemplate} className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center">
            <FileDown size={20} className="mr-2" />
            Export Mẫu
          </button>
          <button onClick={handleCreate} className="bg-indigo-500 text-white px-4 py-2 rounded-lg flex items-center">
            <Plus size={20} className="mr-2" />
            Thêm thông tin
          </button>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm theo model..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="animate-spin text-blue-500" size={40} />
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-auto max-h-[70vh]">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('brand')}>
                  <div className="flex items-center">
                    Thương hiệu
                    {sortConfig.key === 'brand' ? (
                      sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                    ) : <ChevronsUpDown size={16} />}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('model')}>
                  <div className="flex items-center">
                    Model
                    {sortConfig.key === 'model' ? (
                      sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                    ) : <ChevronsUpDown size={16} />}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('release_date')}>
                   <div className="flex items-center">
                    Ngày ra mắt
                    {sortConfig.key === 'release_date' ? (
                      sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                    ) : <ChevronsUpDown size={16} />}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Màn hình</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chip/RAM</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Camera</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kết nối/HĐH</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Màu (EN)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kích thước/Trọng lượng</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('created_at')}>
                   <div className="flex items-center">
                    Ngày tạo
                    {sortConfig.key === 'created_at' ? (
                      sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                    ) : <ChevronsUpDown size={16} />}
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {deviceInfos.map((info) => (
                <tr key={info.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{info.brand}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{info.model}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{info.release_date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{info.screen}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{info.chip_ram}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{info.camera}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{info.battery}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{info.connectivity_os}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{info.color_english}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{info.dimensions_weight}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(info.created_at)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleEdit(info)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                      <Edit size={20} />
                    </button>
                    <button onClick={() => handleDelete(info.id)} className="text-red-600 hover:text-red-900">
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-between items-center mt-4">
        <div>
          <select
            value={pagination.limit}
            onChange={(e) => handleLimitChange(Number(e.target.value))}
            className="px-3 py-1 rounded-lg bg-gray-200"
          >
            <option value={10}>10 / trang</option>
            <option value={20}>20 / trang</option>
            <option value={50}>50 / trang</option>
          </select>
        </div>
        
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      <DeviceInfoModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        deviceInfo={selectedDeviceInfo}
      />
    </div>
  );
};

export default DeviceInfosTab;