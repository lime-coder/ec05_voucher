import { useState, useEffect } from 'react';
import { Search, Eye, XCircle, DollarSign, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '../../../shared/contexts/LanguageContext';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@voucherhub/ui';

export function OrderManagement() {
  const { language } = useLanguage();
  const tText = (en: string, vi: string) => (language === 'vi' ? vi : en);

  const [orders, setOrders] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  // Custom Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmVariant?: 'default' | 'destructive';
  }>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const triggerConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    confirmVariant: 'default' | 'destructive' = 'default'
  ) => {
    setConfirmDialog({
      open: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmDialog(prev => ({ ...prev, open: false }));
      },
      confirmVariant
    });
  };

  const fetchOrders = () => {
    let url = `/admin/orders?t=${Date.now()}`;
    if (startDate && endDate) {
      url += `&startDate=${startDate}&endDate=${endDate}`;
    }
    api.get(url)
      .then(res => {
        const data = res.data;
        if (Array.isArray(data)) {
          const mapped = data.map((o: any) => ({
            ...o,
            englishStatus: o.status === 'PAID' ? 'Paid' 
                         : o.status === 'PENDING' ? 'Pending Payment'
                         : o.status === 'CANCELLED' ? 'Cancelled'
                         : o.status === 'REFUNDED' ? 'Refunded' : o.status
          }));
          setOrders(mapped);
        } else {
          setOrders([]);
        }
      })
      .catch(err => console.error('Fetch orders error:', err));
  };

  useEffect(() => {
    fetchOrders();
  }, [startDate, endDate]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, startDate, endDate]);

  const handleUpdateStatus = (orderId: number, nextStatus: string) => {
    const statusTextEn = nextStatus === 'PAID' ? 'process payment' : nextStatus === 'CANCELLED' ? 'cancel order' : 'refund';
    const statusTextVi = nextStatus === 'PAID' ? 'xử lý thanh toán' : nextStatus === 'CANCELLED' ? 'hủy đơn hàng' : 'hoàn tiền';
    const confirmMsg = tText(
      `Are you sure you want to ${statusTextEn} for order ORD-${orderId}?`,
      `Bạn có chắc chắn muốn ${statusTextVi} cho đơn hàng ORD-${orderId}?`
    );

    const isDestructive = nextStatus === 'CANCELLED' || nextStatus === 'REFUNDED';
    const confirmTitle = nextStatus === 'PAID' ? tText('Process Payment', 'Xử Lý Thanh Toán')
                       : nextStatus === 'CANCELLED' ? tText('Cancel Order', 'Hủy Đơn Hàng')
                       : tText('Refund Order', 'Hoàn Tiền Đơn Hàng');

    triggerConfirm(
      confirmTitle,
      confirmMsg,
      async () => {
        try {
          const res = await api.patch(`/admin/orders/${orderId}/status`, { status: nextStatus });

          if (res.status === 200) {
            toast.success(tText('Order status updated successfully!', 'Cập nhật trạng thái đơn hàng thành công!'));
            setOrders(prev => prev.map(o => o.rawId === orderId ? {
              ...o,
              status: nextStatus,
              englishStatus: nextStatus === 'PAID' ? 'Paid'
                           : nextStatus === 'CANCELLED' ? 'Cancelled'
                           : nextStatus === 'REFUNDED' ? 'Refunded' : nextStatus
            } : o));
            fetchOrders();
          } else {
            toast.error(tText('Update failed!', 'Cập nhật thất bại!'));
          }
        } catch (e) {
          console.error(e);
          toast.error(tText('An error occurred!', 'Có lỗi xảy ra!'));
        }
      },
      isDestructive ? 'destructive' : 'default'
    );
  };

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = statusFilter === 'all';
    if (statusFilter === 'paid' && order.englishStatus === 'Paid') matchesStatus = true;
    if (statusFilter === 'pending' && order.englishStatus === 'Pending Payment') matchesStatus = true;
    if (statusFilter === 'cancelled' && order.englishStatus === 'Cancelled') matchesStatus = true;
    if (statusFilter === 'refunded' && order.englishStatus === 'Refunded') matchesStatus = true;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <Input
            type="text"
            placeholder={tText("Search by order ID or customer name...", "Tìm kiếm theo mã đơn hàng hoặc tên khách hàng...")}
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
          <option value="all">{tText("All Statuses", "Tất cả trạng thái")}</option>
          <option value="paid">{tText("Paid", "Đã thanh toán")}</option>
          <option value="pending">{tText("Pending Payment", "Chờ thanh toán")}</option>
          <option value="cancelled">{tText("Cancelled", "Đã hủy")}</option>
          <option value="refunded">{tText("Refunded", "Đã hoàn tiền")}</option>
        </select>
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-auto bg-white shadow-sm border-gray-200 text-sm"
          />
          <span className="text-gray-400 text-sm">{tText('to', 'đến')}</span>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-auto bg-white shadow-sm border-gray-200 text-sm"
          />
          {(startDate || endDate) && (
            <Button
              variant="ghost"
              onClick={() => { setStartDate(''); setEndDate(''); }}
              className="text-xs text-gray-500 hover:text-gray-700 px-2 h-10 border border-gray-200 bg-white"
            >
              {tText('Clear', 'Xóa')}
            </Button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead>{tText("Order ID", "Mã đơn hàng")}</TableHead>
              <TableHead>{tText("Customer", "Khách hàng")}</TableHead>
              <TableHead>{tText("Total", "Tổng tiền")}</TableHead>
              <TableHead>{tText("Payment Method", "PT thanh toán")}</TableHead>
              <TableHead>{tText("Status", "Trạng thái")}</TableHead>
              <TableHead>{tText("Order Date", "Ngày đặt")}</TableHead>
              <TableHead className="text-right">{tText("Actions", "Hành động")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedOrders.map((order) => (
              <TableRow key={order.id} className="hover:bg-gray-50/50">
                <TableCell className="font-medium text-gray-900">{order.id}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell className="font-medium text-gray-900">{order.total}</TableCell>
                <TableCell>{order.payment}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      order.englishStatus === 'Paid'
                        ? 'default'
                        : order.englishStatus === 'Pending Payment'
                        ? 'outline'
                        : 'secondary'
                    }
                    className={
                      order.englishStatus === 'Paid'
                        ? 'bg-green-100 text-green-700 hover:bg-green-100 shadow-none border-transparent'
                        : order.englishStatus === 'Pending Payment'
                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 shadow-none border-transparent'
                        : order.englishStatus === 'Cancelled'
                        ? 'bg-red-100 text-red-800 hover:bg-red-100 shadow-none border-transparent'
                        : 'bg-blue-100 text-blue-800 hover:bg-blue-100 shadow-none border-transparent'
                    }
                  >
                    {tText(order.englishStatus,
                      order.englishStatus === 'Paid' ? 'Đã thanh toán'
                      : order.englishStatus === 'Pending Payment' ? 'Chờ thanh toán'
                      : order.englishStatus === 'Cancelled' ? 'Đã hủy'
                      : 'Đã hoàn tiền'
                    )}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-500">{order.date}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button onClick={() => handleViewOrder(order)} variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" title={tText("Details", "Chi tiết")}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    {order.englishStatus === 'Pending Payment' && (
                      <Button onClick={() => handleUpdateStatus(order.rawId, 'CANCELLED')} variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" title={tText("Cancel Order", "Hủy đơn")}>
                        <XCircle className="w-4 h-4" />
                      </Button>
                    )}
                    {order.englishStatus === 'Pending Payment' && (
                      <Button onClick={() => handleUpdateStatus(order.rawId, 'PAID')} variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50" title={tText("Process Payment", "Xử lý thanh toán")}>
                        <DollarSign className="w-4 h-4" />
                      </Button>
                    )}
                    {order.englishStatus === 'Paid' && (
                      <Button onClick={() => handleUpdateStatus(order.rawId, 'REFUNDED')} variant="ghost" size="icon" className="h-8 w-8 text-orange-600 hover:text-orange-700 hover:bg-orange-50" title={tText("Refund", "Hoàn tiền")}>
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {paginatedOrders.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                  {tText("No orders found.", "Không tìm thấy đơn hàng nào.")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-gray-500">
            {tText(
              `Showing ${(currentPage - 1) * ITEMS_PER_PAGE + 1} to ${Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)} of ${filteredOrders.length} entries`,
              `Đang hiển thị ${(currentPage - 1) * ITEMS_PER_PAGE + 1} đến ${Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)} trong số ${filteredOrders.length} mục`
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              {tText('Previous', 'Trước')}
            </Button>
            <div className="text-sm font-medium">
              {currentPage} / {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              {tText('Next', 'Tiếp')}
            </Button>
          </div>
        </div>
      )}

      {/* --- View Order Details Dialog --- */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-primary text-lg font-bold">
              {tText("Order Details", "Chi tiết đơn hàng")}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="py-4 space-y-4 text-sm max-h-[75vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-gray-500 font-medium block">{tText("Order ID:", "Mã đơn hàng:")}</span>
                  <span className="font-bold text-gray-900">{selectedOrder.id}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-gray-500 font-medium block">{tText("Order Date:", "Ngày đặt:")}</span>
                  <span className="text-gray-900">{selectedOrder.date}</span>
                </div>
              </div>

              <div className="border-t pt-3">
                <h4 className="font-semibold text-gray-800 mb-2">{tText("Customer Information", "Thông tin khách hàng")}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-500 text-xs block">{tText("Name:", "Họ và tên:")}</span>
                    <span className="text-gray-900 font-medium">{selectedOrder.customer}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs block">Email:</span>
                    <span className="text-gray-900">{selectedOrder.customerEmail || tText('Not provided', 'Chưa cung cấp')}</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-3">
                <h4 className="font-semibold text-gray-800 mb-2">{tText("Product Details", "Chi tiết sản phẩm")}</h4>
                <div className="space-y-2">
                  {selectedOrder.items && selectedOrder.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center bg-gray-50 p-2.5 rounded border border-gray-100">
                      <div>
                        <span className="font-medium text-gray-900 block text-xs">{item.name}</span>
                        <span className="text-gray-500 text-xs">{tText("ID:", "Mã:")} #{item.voucherId}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-900 text-xs font-semibold block">{item.price}</span>
                        <span className="text-gray-500 text-xs">{tText("Qty:", "SL:")} {item.quantity}</span>
                      </div>
                    </div>
                  ))}
                  {(!selectedOrder.items || selectedOrder.items.length === 0) && (
                    <span className="text-gray-500 italic">{tText("No product details found.", "Không có chi tiết sản phẩm.")}</span>
                  )}
                </div>
              </div>

              <div className="border-t pt-3 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-500 font-medium block">{tText("Payment Method:", "Phương thức thanh toán:")}</span>
                  <span className="text-gray-900 font-medium">{selectedOrder.payment}</span>
                </div>
                <div>
                  <span className="text-gray-500 font-medium block">{tText("Status:", "Trạng thái:")}</span>
                  <Badge
                    variant={
                      selectedOrder.englishStatus === 'Paid'
                        ? 'default'
                        : selectedOrder.englishStatus === 'Pending Payment'
                        ? 'outline'
                        : 'secondary'
                    }
                    className={
                      selectedOrder.englishStatus === 'Paid'
                        ? 'bg-green-100 text-green-700 hover:bg-green-100 shadow-none border-transparent'
                        : selectedOrder.englishStatus === 'Pending Payment'
                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 shadow-none border-transparent'
                        : selectedOrder.englishStatus === 'Cancelled'
                        ? 'bg-red-100 text-red-800 hover:bg-red-100 shadow-none border-transparent'
                        : 'bg-blue-100 text-blue-800 hover:bg-blue-100 shadow-none border-transparent'
                    }
                  >
                    {tText(selectedOrder.englishStatus,
                      selectedOrder.englishStatus === 'Paid' ? 'Đã thanh toán'
                      : selectedOrder.englishStatus === 'Pending Payment' ? 'Chờ thanh toán'
                      : selectedOrder.englishStatus === 'Cancelled' ? 'Đã hủy'
                      : 'Đã hoàn tiền'
                    )}
                  </Badge>
                </div>
              </div>

              <div className="border-t pt-3 flex justify-between items-center">
                <span className="text-gray-800 font-bold text-base">{tText("Total Payment Amount:", "Tổng tiền thanh toán:")}</span>
                <span className="text-primary font-bold text-lg">{selectedOrder.total}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button className="w-full" onClick={() => setShowDetailModal(false)}>{tText("Close", "Đóng")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Custom Confirm Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-gray-900 font-bold text-lg">
              {confirmDialog.title}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="text-gray-600 text-sm">{confirmDialog.message}</p>
          </div>
          <DialogFooter className="flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => setConfirmDialog(prev => ({ ...prev, open: false }))}>
              {tText('Cancel', 'Hủy')}
            </Button>
            <Button
              onClick={confirmDialog.onConfirm}
              variant={confirmDialog.confirmVariant}
              className={confirmDialog.confirmVariant === 'destructive' ? 'bg-red-600 hover:bg-red-700 text-white' : ''}
            >
              {tText('Confirm', 'Xác nhận')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
