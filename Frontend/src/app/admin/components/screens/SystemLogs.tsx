import { useState, useEffect } from 'react';
import { Search, Download, Loader2 } from 'lucide-react';
import api from '../../../../lib/api';
import {
  Button,
  Badge,
  Input,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@voucherhub/ui';

export function SystemLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, searchTerm]);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      // Backend filtering is supported, so we pass the params
      const response = await api.get('/logs', {
        params: { search: searchTerm, action: actionFilter }
      });
      const responseData = response.data;
      // Handle the new API format { data: [...], pagination: {...} }
      if (responseData && Array.isArray(responseData.data)) {
        setLogs(responseData.data);
      } else if (Array.isArray(responseData)) {
        setLogs(responseData);
      } else {
        console.error('Expected array from /logs, got:', responseData);
        setLogs([]);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      setLogs([]); // Reset to empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const totalPages = Math.ceil(logs.length / itemsPerPage);
  const currentLogs = logs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4">
        <div className="flex gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Tìm kiếm hành động, đối tượng hoặc người dùng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white shadow-sm border-gray-200"
            />
          </div>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="h-10 py-0 pl-4 pr-8 border border-gray-200 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none bg-[length:16px_16px] bg-[position:right_8px_center] bg-no-repeat cursor-pointer"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")` }}
          >
            <option value="all">Tất cả hành động</option>
            <option value="Phê duyệt">Phê duyệt</option>
            <option value="Từ chối">Từ chối</option>
            <option value="Khóa">Khóa/Kích hoạt</option>
            <option value="Cập nhật">Cập nhật</option>
            <option value="Xóa">Xóa</option>
          </select>
          <Input
            type="date"
            className="w-auto bg-white shadow-sm border-gray-200"
          />
        </div>
        <Button className="gap-2">
          <Download className="w-4 h-4" />
          Xuất báo cáo
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead>STT</TableHead>
              <TableHead>Người dùng</TableHead>
              <TableHead>Hành động</TableHead>
              <TableHead>Đối tượng</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead>Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                </TableCell>
              </TableRow>
            ) : currentLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-gray-500">
                  Không tìm thấy nhật ký hệ thống nào.
                </TableCell>
              </TableRow>
            ) : (
              currentLogs.map((log, index) => (
                <TableRow key={log.MaLog} className="hover:bg-gray-50/50">
                  <TableCell className="text-gray-500">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </TableCell>
                  <TableCell className="text-gray-700">{log.IDTaiKhoan ? `Tài khoản #${log.IDTaiKhoan}` : 'Hệ thống'}</TableCell>
                  <TableCell className="font-medium text-gray-900">{log.HanhDong}</TableCell>
                  <TableCell className="text-gray-700">{log.DoiTuong || log.ChiTiet || '-'}</TableCell>
                  <TableCell className="text-gray-500 font-mono text-xs">{log.DiaChiIP || '-'}</TableCell>
                  <TableCell className="text-gray-500">{formatDate(log.ThoiGian)}</TableCell>
                  <TableCell>
                    <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-100 shadow-none border-transparent">
                      {log.TrangThai || 'Thành công'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
            <div className="text-sm text-gray-500">
              Hiển thị {(currentPage - 1) * itemsPerPage + 1} -{' '}
              {Math.min(currentPage * itemsPerPage, logs.length)} / {logs.length}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
