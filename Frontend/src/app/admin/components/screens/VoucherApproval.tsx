import { useState, useEffect } from 'react';
import { Eye, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '../../../shared/contexts/LanguageContext';
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

export function VoucherApproval() {
  const { language } = useLanguage();
  const tText = (en: string, vi: string) => (language === 'vi' ? vi : en);

  const [vouchers, setVouchers] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [modalType, setModalType] = useState<'approve' | 'reject'>('approve');
  const [selectedVoucher, setSelectedVoucher] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchVouchers = () => {
    fetch('/api/admin/vouchers')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          const mapped = data.map((v: any) => ({
            ...v,
            englishStatus: v.status === 'Chờ duyệt' ? 'Pending' : v.status === 'Đã duyệt' ? 'Approved' : v.status === 'Từ chối' ? 'Rejected' : v.status
          }));
          setVouchers(mapped);
        } else {
          setVouchers([]);
        }
      })
      .catch(err => console.error('Fetch admin vouchers error:', err));
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const filteredVouchers = vouchers.filter((v) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'pending' && v.englishStatus === 'Pending') return true;
    if (statusFilter === 'approved' && v.englishStatus === 'Approved') return true;
    if (statusFilter === 'rejected' && v.englishStatus === 'Rejected') return true;
    return false;
  });

  const handleApprove = (voucher: any) => {
    setSelectedVoucher(voucher);
    setModalType('approve');
    setShowModal(true);
  };

  const handleReject = (voucher: any) => {
    setSelectedVoucher(voucher);
    setModalType('reject');
    setShowModal(true);
    setRejectReason('');
  };

  const confirmAction = async () => {
    if (modalType === 'reject' && !rejectReason.trim()) {
      toast.error(tText('Please enter a reason for rejection', 'Vui lòng nhập lý do từ chối'));
      return;
    }

    if (selectedVoucher) {
      try {
        const action = modalType === 'approve' ? 'approve' : 'reject';
        const url = `/api/vouchers/${selectedVoucher.id}/${action}`;
        const res = await fetch(url, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: modalType === 'reject' ? JSON.stringify({ lyDo: rejectReason }) : undefined
        });

        if (res.ok) {
          toast.success(
            modalType === 'approve'
              ? tText(`Successfully approved voucher "${selectedVoucher.name}"`, `Đã phê duyệt voucher "${selectedVoucher.name}" thành công`)
              : tText(`Successfully rejected voucher "${selectedVoucher.name}"`, `Đã từ chối voucher "${selectedVoucher.name}" thành công`)
          );
          setShowModal(false);
          setSelectedVoucher(null);
          setRejectReason('');
          fetchVouchers();
        } else {
          toast.error(tText('Action failed!', 'Thực hiện thất bại!'));
        }
      } catch (err) {
        console.error(err);
        toast.error(tText('An error occurred!', 'Có lỗi xảy ra!'));
      }
    }
  };

  const handleViewVoucher = (voucher: any) => {
    setSelectedVoucher(voucher);
    setShowDetailModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Button
          variant={statusFilter === 'all' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('all')}
        >
          {tText('All', 'Tất cả')}
        </Button>
        <Button
          variant={statusFilter === 'pending' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('pending')}
        >
          {tText('Pending', 'Chờ duyệt')}
        </Button>
        <Button
          variant={statusFilter === 'approved' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('approved')}
        >
          {tText('Approved', 'Đã duyệt')}
        </Button>
        <Button
          variant={statusFilter === 'rejected' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('rejected')}
        >
          {tText('Rejected', 'Từ chối')}
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead>{tText('No.', 'STT')}</TableHead>
              <TableHead>{tText('Voucher Name', 'Tên voucher')}</TableHead>
              <TableHead>{tText('Partner', 'Đối tác')}</TableHead>
              <TableHead>{tText('Original Price', 'Giá gốc')}</TableHead>
              <TableHead>{tText('Sale Price', 'Giá bán')}</TableHead>
              <TableHead>{tText('Quantity', 'Số lượng')}</TableHead>
              <TableHead>{tText('Submission Date', 'Ngày gửi')}</TableHead>
              <TableHead>{tText('Status', 'Trạng thái')}</TableHead>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">{tText('Actions', 'Hành động')}</th>
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
                      voucher.englishStatus === 'Pending'
                        ? 'outline'
                        : voucher.englishStatus === 'Approved'
                        ? 'default'
                        : 'destructive'
                    }
                    className={
                      voucher.englishStatus === 'Pending'
                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 shadow-none border-transparent'
                        : voucher.englishStatus === 'Approved'
                        ? 'bg-green-100 text-green-700 hover:bg-green-100 shadow-none border-transparent'
                        : 'bg-red-100 text-red-700 hover:bg-red-100 shadow-none border-transparent'
                    }
                  >
                    {tText(voucher.englishStatus, 
                      voucher.englishStatus === 'Pending' ? 'Chờ duyệt'
                      : voucher.englishStatus === 'Approved' ? 'Đã duyệt'
                      : 'Từ chối'
                    )}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button onClick={() => handleViewVoucher(voucher)} variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" title={tText('View details', 'Xem chi tiết')}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    {voucher.englishStatus === 'Pending' && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleApprove(voucher)}
                          className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                          title={tText('Approve', 'Phê duyệt')}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleReject(voucher)}
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          title={tText('Reject', 'Từ chối')}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredVouchers.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-6 text-gray-500">
                  {tText('No vouchers found matching the filter.', 'Không tìm thấy voucher nào phù hợp bộ lọc.')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-primary">
              {modalType === 'approve' 
                ? tText('Confirm Approval', 'Xác nhận phê duyệt') 
                : tText('Confirm Rejection', 'Xác nhận từ chối')}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-700 mb-4">
              {modalType === 'approve'
                ? tText(`Are you sure you want to approve voucher "${selectedVoucher?.name}"?`, `Bạn có chắc chắn muốn phê duyệt voucher "${selectedVoucher?.name}"?`)
                : tText(`Are you sure you want to reject voucher "${selectedVoucher?.name}"?`, `Bạn có chắc chắn muốn từ chối voucher "${selectedVoucher?.name}"?`)}
            </p>
            {modalType === 'reject' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {tText('Rejection Reason', 'Lý do từ chối')} <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder={tText('Enter rejection reason...', 'Nhập lý do từ chối...')}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-sm"
                  rows={4}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              {tText('Cancel', 'Hủy')}
            </Button>
            <Button
              variant={modalType === 'approve' ? 'default' : 'destructive'}
              onClick={confirmAction}
              className={modalType === 'approve' ? "bg-green-600 hover:bg-green-700" : ""}
            >
              {modalType === 'approve' ? tText('Approve', 'Phê duyệt') : tText('Reject', 'Từ chối')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- View Voucher Details Dialog --- */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-primary text-lg font-bold">
              {tText('Voucher Details', 'Chi tiết Voucher')}
            </DialogTitle>
          </DialogHeader>
          {selectedVoucher && (
            <div className="py-4 space-y-3 text-sm max-h-[70vh] overflow-y-auto pr-1">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500 font-medium">{tText('Voucher Name:', 'Tên Voucher:')}</span>
                <span className="font-semibold text-gray-900 max-w-[250px] text-right">{selectedVoucher.name}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500 font-medium">{tText('Partner:', 'Đối tác:')}</span>
                <span className="font-semibold text-gray-900">{selectedVoucher.partner}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500 font-medium">{tText('Original Price:', 'Giá gốc:')}</span>
                <span className="text-gray-600 line-through">{selectedVoucher.originalPrice}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500 font-medium">{tText('Sale Price:', 'Giá bán:')}</span>
                <span className="text-green-600 font-bold">{selectedVoucher.salePrice}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500 font-medium">{tText('Issued Quantity:', 'Số lượng phát hành:')}</span>
                <span className="text-gray-900">{selectedVoucher.quantity}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500 font-medium">{tText('Validity Period:', 'Thời gian áp dụng:')}</span>
                <span className="text-gray-900 text-right">
                  {selectedVoucher.startDate ? new Date(selectedVoucher.startDate).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US') : ''} - {selectedVoucher.endDate ? new Date(selectedVoucher.endDate).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US') : ''}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500 font-medium">{tText('Status:', 'Trạng thái:')}</span>
                <Badge
                  variant={
                    selectedVoucher.englishStatus === 'Pending'
                      ? 'outline'
                      : selectedVoucher.englishStatus === 'Approved'
                      ? 'default'
                      : 'destructive'
                  }
                  className={
                    selectedVoucher.englishStatus === 'Pending'
                      ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 shadow-none border-transparent'
                      : selectedVoucher.englishStatus === 'Approved'
                      ? 'bg-green-100 text-green-700 hover:bg-green-100 shadow-none border-transparent'
                      : 'bg-red-100 text-red-700 hover:bg-red-100 shadow-none border-transparent'
                  }
                >
                  {tText(selectedVoucher.englishStatus, 
                    selectedVoucher.englishStatus === 'Pending' ? 'Chờ duyệt'
                    : selectedVoucher.englishStatus === 'Approved' ? 'Đã duyệt'
                    : 'Từ chối'
                  )}
                </Badge>
              </div>
              <div className="space-y-1 pt-1">
                <span className="text-gray-500 font-medium block">{tText('Detailed Description:', 'Mô tả chi tiết:')}</span>
                <p className="text-gray-700 bg-gray-50 p-2.5 rounded border border-gray-100 leading-relaxed text-xs">
                  {selectedVoucher.description || tText('No description provided.', 'Không có mô tả.')}
                </p>
              </div>
              <div className="space-y-1 pt-1">
                <span className="text-gray-500 font-medium block">{tText('Usage Conditions:', 'Điều kiện áp dụng:')}</span>
                <p className="text-gray-700 bg-gray-50 p-2.5 rounded border border-gray-100 leading-relaxed text-xs">
                  {selectedVoucher.conditions || tText('No conditions provided.', 'Không có điều kiện.')}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button className="w-full" onClick={() => setShowDetailModal(false)}>{tText('Close', 'Đóng')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
