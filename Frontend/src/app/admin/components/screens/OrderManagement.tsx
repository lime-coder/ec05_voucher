import { useState } from 'react';
import { Search, Eye, XCircle, DollarSign, RotateCcw } from 'lucide-react';
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

const mockOrders = [
  { id: 'ORD-2401', customer: 'Nguyễn Văn A', total: '245,000đ', payment: 'MoMo', status: 'Đã thanh toán', date: '19/05/2026 10:30' },
  { id: 'ORD-2402', customer: 'Trần Thị B', total: '189,000đ', payment: 'ZaloPay', status: 'Chờ thanh toán', date: '19/05/2026 10:15' },
  { id: 'ORD-2403', customer: 'Lê Văn C', total: '320,000đ', payment: 'VNPay', status: 'Đã thanh toán', date: '19/05/2026 09:45' },
  { id: 'ORD-2404', customer: 'Phạm Thị D', total: '156,000đ', payment: 'MoMo', status: 'Đã hủy', date: '19/05/2026 09:20' },
  { id: 'ORD-2405', customer: 'Hoàng Văn E', total: '278,000đ', payment: 'Thẻ ngân hàng', status: 'Đã thanh toán', date: '19/05/2026 08:55' },
  { id: 'ORD-2406', customer: 'Vũ Thị F', total: '195,000đ', payment: 'MoMo', status: 'Chờ thanh toán', date: '18/05/2026 17:30' },
  { id: 'ORD-2407', customer: 'Đỗ Văn G', total: '340,000đ', payment: 'ZaloPay', status: 'Đã thanh toán', date: '18/05/2026 16:45' },
  { id: 'ORD-2408', customer: 'Bùi Thị H', total: '128,000đ', payment: 'VNPay', status: 'Đã hoàn tiền', date: '18/05/2026 15:20' },
];

export function OrderManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredOrders = mockOrders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <Input
            type="text"
            placeholder="Tìm kiếm theo mã đơn hoặc khách hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white shadow-sm border-gray-200"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 py-0 pl-4 pr-8 border border-gray-200 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none bg-[length:16px_16px] bg-[position:right_8px_center] bg-no-repeat cursor-pointer"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")` }}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="Đã thanh toán">Đã thanh toán</option>
          <option value="Chờ thanh toán">Chờ thanh toán</option>
          <option value="Đã hủy">Đã hủy</option>
          <option value="Đã hoàn tiền">Đã hoàn tiền</option>
        </select>
        <Input
          type="date"
          className="w-auto bg-white shadow-sm border-gray-200"
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead>Mã đơn</TableHead>
              <TableHead>Khách hàng</TableHead>
              <TableHead>Tổng tiền</TableHead>
              <TableHead>PT thanh toán</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày đặt</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id} className="hover:bg-gray-50/50">
                <TableCell className="font-medium text-gray-900">{order.id}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell className="font-medium text-gray-900">{order.total}</TableCell>
                <TableCell>{order.payment}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      order.status === 'Đã thanh toán'
                        ? 'default'
                        : order.status === 'Chờ thanh toán'
                        ? 'outline'
                        : 'secondary'
                    }
                    className={
                      order.status === 'Đã thanh toán'
                        ? 'bg-green-100 text-green-700 hover:bg-green-100 shadow-none border-transparent'
                        : order.status === 'Chờ thanh toán'
                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 shadow-none border-transparent'
                        : order.status === 'Đã hủy'
                        ? 'bg-red-100 text-red-800 hover:bg-red-100 shadow-none border-transparent'
                        : 'bg-blue-100 text-blue-800 hover:bg-blue-100 shadow-none border-transparent'
                    }
                  >
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-500">{order.date}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" title="Chi tiết">
                      <Eye className="w-4 h-4" />
                    </Button>
                    {order.status === 'Chờ thanh toán' && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" title="Hủy đơn">
                        <XCircle className="w-4 h-4" />
                      </Button>
                    )}
                    {order.status === 'Chờ thanh toán' && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50" title="Xử lý thanh toán">
                        <DollarSign className="w-4 h-4" />
                      </Button>
                    )}
                    {order.status === 'Đã thanh toán' && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-orange-600 hover:text-orange-700 hover:bg-orange-50" title="Hoàn tiền">
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
