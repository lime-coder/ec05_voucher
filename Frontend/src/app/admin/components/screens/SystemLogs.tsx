import { useState } from 'react';
import { Search, Download } from 'lucide-react';
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

const mockLogs = [
  { id: 1, user: 'admin@voucher.vn', action: 'Phê duyệt voucher', target: 'Highlands Coffee - Giảm 50K', ip: '192.168.1.100', time: '19/05/2026 10:45:23', status: 'Thành công' },
  { id: 2, user: 'admin@voucher.vn', action: 'Khóa tài khoản', target: 'Lê Văn C', ip: '192.168.1.100', time: '19/05/2026 10:30:15', status: 'Thành công' },
  { id: 3, user: 'admin@voucher.vn', action: 'Cập nhật đối tác', target: 'CGV Cinemas', ip: '192.168.1.100', time: '19/05/2026 10:15:42', status: 'Thành công' },
  { id: 4, user: 'admin@voucher.vn', action: 'Xóa banner', target: 'Banner khuyến mãi xuân', ip: '192.168.1.100', time: '19/05/2026 09:55:18', status: 'Thành công' },
  { id: 5, user: 'admin@voucher.vn', action: 'Từ chối voucher', target: 'Pizza Hut - Giảm 30%', ip: '192.168.1.100', time: '19/05/2026 09:30:45', status: 'Thành công' },
  { id: 6, user: 'admin@voucher.vn', action: 'Đăng nhập hệ thống', target: 'Dashboard', ip: '192.168.1.100', time: '19/05/2026 09:00:12', status: 'Thành công' },
  { id: 7, user: 'admin@voucher.vn', action: 'Hoàn tiền đơn hàng', target: 'ORD-2398', ip: '192.168.1.100', time: '18/05/2026 17:45:33', status: 'Thành công' },
  { id: 8, user: 'admin@voucher.vn', action: 'Thêm danh mục', target: 'Spa & Massage', ip: '192.168.1.100', time: '18/05/2026 16:20:08', status: 'Thành công' },
  { id: 9, user: 'admin@voucher.vn', action: 'Cập nhật banner', target: 'Flash Sale cuối tuần', ip: '192.168.1.100', time: '18/05/2026 15:10:55', status: 'Thành công' },
  { id: 10, user: 'admin@voucher.vn', action: 'Kích hoạt tài khoản', target: 'Đỗ Văn G', ip: '192.168.1.100', time: '18/05/2026 14:35:27', status: 'Thành công' },
];

export function SystemLogs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredLogs = mockLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === 'all' || log.action.includes(actionFilter);
    return matchesSearch && matchesAction;
  });

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const currentLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
            {currentLogs.map((log, index) => (
              <TableRow key={log.id} className="hover:bg-gray-50/50">
                <TableCell className="text-gray-500">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </TableCell>
                <TableCell className="text-gray-700">{log.user}</TableCell>
                <TableCell className="font-medium text-gray-900">{log.action}</TableCell>
                <TableCell className="text-gray-700">{log.target}</TableCell>
                <TableCell className="text-gray-500 font-mono text-xs">{log.ip}</TableCell>
                <TableCell className="text-gray-500">{log.time}</TableCell>
                <TableCell>
                  <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-100 shadow-none border-transparent">
                    {log.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
            <div className="text-sm text-gray-500">
              Hiển thị {(currentPage - 1) * itemsPerPage + 1} -{' '}
              {Math.min(currentPage * itemsPerPage, filteredLogs.length)} / {filteredLogs.length}
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
