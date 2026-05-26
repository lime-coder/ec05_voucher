import { useState } from 'react';
import { Eye, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  Button,
  Badge,
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

const mockVouchers = [
  { id: 1, name: 'Highlands - Giảm 50K cho hóa đơn từ 100K', partner: 'Highlands Coffee', originalPrice: '100,000đ', salePrice: '50,000đ', quantity: 500, date: '15/05/2026', status: 'Chờ duyệt' },
  { id: 2, name: 'CGV - Combo bắp nước size L', partner: 'CGV Cinemas', originalPrice: '120,000đ', salePrice: '70,000đ', quantity: 300, date: '14/05/2026', status: 'Chờ duyệt' },
  { id: 3, name: 'The Coffee House - Buy 1 Get 1', partner: 'The Coffee House', originalPrice: '80,000đ', salePrice: '40,000đ', quantity: 1000, date: '13/05/2026', status: 'Đã duyệt' },
  { id: 4, name: 'Pizza Hut - Giảm 30% tối đa 100K', partner: 'Pizza Hut', originalPrice: '200,000đ', salePrice: '140,000đ', quantity: 200, date: '12/05/2026', status: 'Từ chối' },
  { id: 5, name: 'Lotteria - Combo gà giòn + khoai', partner: 'Lotteria', originalPrice: '95,000đ', salePrice: '65,000đ', quantity: 400, date: '11/05/2026', status: 'Chờ duyệt' },
];

export function VoucherApproval() {
  const [vouchers, setVouchers] = useState(mockVouchers);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'approve' | 'reject'>('approve');
  const [selectedVoucher, setSelectedVoucher] = useState<typeof mockVouchers[0] | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const filteredVouchers = vouchers.filter((v) =>
    statusFilter === 'all' ? true : v.status === statusFilter
  );

  const handleApprove = (voucher: typeof mockVouchers[0]) => {
    setSelectedVoucher(voucher);
    setModalType('approve');
    setShowModal(true);
  };

  const handleReject = (voucher: typeof mockVouchers[0]) => {
    setSelectedVoucher(voucher);
    setModalType('reject');
    setShowModal(true);
    setRejectReason('');
  };

  const confirmAction = () => {
    if (modalType === 'reject' && !rejectReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }

    if (selectedVoucher) {
      const newStatus = modalType === 'approve' ? 'Đã duyệt' : 'Từ chối';
      setVouchers(
        vouchers.map((v) =>
          v.id === selectedVoucher.id ? { ...v, status: newStatus } : v
        )
      );
      toast.success(
        modalType === 'approve'
          ? `Đã phê duyệt voucher ${selectedVoucher.name}`
          : `Đã từ chối voucher ${selectedVoucher.name}`
      );
      setShowModal(false);
      setSelectedVoucher(null);
      setRejectReason('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Button
          variant={statusFilter === 'all' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('all')}
        >
          Tất cả
        </Button>
        <Button
          variant={statusFilter === 'Chờ duyệt' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('Chờ duyệt')}
        >
          Chờ duyệt
        </Button>
        <Button
          variant={statusFilter === 'Đã duyệt' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('Đã duyệt')}
        >
          Đã duyệt
        </Button>
        <Button
          variant={statusFilter === 'Từ chối' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('Từ chối')}
        >
          Từ chối
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead>STT</TableHead>
              <TableHead>Tên voucher</TableHead>
              <TableHead>Đối tác</TableHead>
              <TableHead>Giá gốc</TableHead>
              <TableHead>Giá bán</TableHead>
              <TableHead>Số lượng</TableHead>
              <TableHead>Ngày gửi</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVouchers.map((voucher, index) => (
              <TableRow key={voucher.id} className="hover:bg-gray-50/50">
                <TableCell className="text-gray-500">{index + 1}</TableCell>
                <TableCell className="font-medium text-gray-900 max-w-xs">{voucher.name}</TableCell>
                <TableCell>{voucher.partner}</TableCell>
                <TableCell className="text-gray-500 line-through">{voucher.originalPrice}</TableCell>
                <TableCell className="font-medium text-green-600">{voucher.salePrice}</TableCell>
                <TableCell>{voucher.quantity}</TableCell>
                <TableCell className="text-gray-500">{voucher.date}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      voucher.status === 'Chờ duyệt'
                        ? 'outline'
                        : voucher.status === 'Đã duyệt'
                        ? 'default'
                        : 'destructive'
                    }
                    className={
                      voucher.status === 'Chờ duyệt'
                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 shadow-none border-transparent'
                        : voucher.status === 'Đã duyệt'
                        ? 'bg-green-100 text-green-700 hover:bg-green-100 shadow-none border-transparent'
                        : 'bg-red-100 text-red-700 hover:bg-red-100 shadow-none border-transparent'
                    }
                  >
                    {voucher.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                      <Eye className="w-4 h-4" />
                    </Button>
                    {voucher.status === 'Chờ duyệt' && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleApprove(voucher)}
                          className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleReject(voucher)}
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-primary">
              {modalType === 'approve' ? 'Xác nhận phê duyệt' : 'Xác nhận từ chối'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-700 mb-4">
              {modalType === 'approve'
                ? `Bạn có chắc chắn muốn phê duyệt voucher "${selectedVoucher?.name}"?`
                : `Bạn có chắc chắn muốn từ chối voucher "${selectedVoucher?.name}"?`}
            </p>
            {modalType === 'reject' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Lý do từ chối <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Nhập lý do từ chối..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-sm"
                  rows={4}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Hủy
            </Button>
            <Button
              variant={modalType === 'approve' ? 'default' : 'destructive'}
              onClick={confirmAction}
              className={modalType === 'approve' ? "bg-green-600 hover:bg-green-700" : ""}
            >
              {modalType === 'approve' ? 'Phê duyệt' : 'Từ chối'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
