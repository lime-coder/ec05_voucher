import { useState, useEffect } from 'react';
import { Eye, CheckCircle, XCircle, PauseCircle, PlayCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  Button, Badge, Table, TableHeader, TableRow, TableHead,
  TableBody, TableCell, Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from '@voucherhub/ui';
import api from '../../../../lib/api';
import { useLanguage } from '../../../shared/contexts/LanguageContext';

type VoucherStatus = 'PENDING_APPROVAL' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED';

interface Voucher {
  id: number;
  name: string;
  partner: string;
  originalPrice: string;
  salePrice: string;
  quantitySold: number;    // ← mới: đã bán
  quantityTotal: number;   // ← mới: tổng cho phép
  date: string;
  status: VoucherStatus;
}

export function VoucherApproval() {
  const { language } = useLanguage();
  const tText = (en: string, vi: string) => (language === 'vi' ? vi : en);

  const STATUS_LABEL: Record<VoucherStatus, string> = {
    PENDING_APPROVAL: tText('Pending', 'Chờ duyệt'),
    ACTIVE: tText('Approved', 'Đã duyệt'),
    REJECTED: tText('Rejected', 'Từ chối'),
    SUSPENDED: tText('Suspended', 'Tạm ngưng'),
  };

  const STATUS_CLASS: Record<VoucherStatus, string> = {
    PENDING_APPROVAL: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 shadow-none border-transparent',
    ACTIVE: 'bg-green-100 text-green-700 hover:bg-green-100 shadow-none border-transparent',
    REJECTED: 'bg-red-100 text-red-700 hover:bg-red-100 shadow-none border-transparent',
    SUSPENDED: 'bg-gray-100 text-gray-700 hover:bg-gray-100 shadow-none border-transparent',
  };

  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [statusFilter, setStatusFilter] = useState<VoucherStatus | 'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<ModalType>('approve');
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [reason, setReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [partnerFilter, setPartnerFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailVoucher, setDetailVoucher] = useState<Voucher | null>(null);

  const fetchVouchers = (silent = false) => {
    api.get(`/admin/vouchers?t=${Date.now()}`)
      .then(res => {
        if (Array.isArray(res.data)) setVouchers(res.data);
      })
      .catch(() => {
        if (!silent) toast.error(tText('Failed to load voucher list', 'Không tải được danh sách voucher'));
      });
  };

  useEffect(() => {
    fetchVouchers(true);
  }, []);

  // Reset to page 1 on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchQuery, partnerFilter, startDate, endDate]);

  const parseDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split(' ')[0].split('/');
    return new Date(Number(year), Number(month) - 1, Number(day));
  };

  const filtered = vouchers.filter(v => {
    const matchStatus = statusFilter === 'all' || v.status === statusFilter;
    const matchSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchPartner = partnerFilter === 'all' || v.partner === partnerFilter;
    
    let matchDate = true;
    if (startDate || endDate) {
      const vDate = parseDate(v.date);
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (vDate < start) matchDate = false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (vDate > end) matchDate = false;
      }
    }
    
    return matchStatus && matchSearch && matchPartner && matchDate;
  });

  const sortedAndFiltered = [...filtered].sort((a, b) => {
    return parseDate(b.date).getTime() - parseDate(a.date).getTime();
  });

  const totalPages = Math.ceil(sortedAndFiltered.length / ITEMS_PER_PAGE);
  const paginatedVouchers = sortedAndFiltered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const uniquePartners = Array.from(new Set(vouchers.map(v => v.partner))).filter(Boolean);

  const openDetail = (v: Voucher) => {
    setDetailVoucher(v);
    setShowDetailModal(true);
  };

  const openModal = (v: Voucher, type: ModalType) => {
    setSelectedVoucher(v);
    setModalType(type);
    setReason('');
    setShowModal(true);
  };

  const confirmAction = async () => {
    if ((modalType === 'reject' || modalType === 'suspend') && !reason.trim()) {
      toast.error(modalType === 'reject' ? 'Vui lòng nhập lý do từ chối' : 'Vui lòng nhập lý do tạm ngưng');
      return;
    }
    if (!selectedVoucher) return;

    const endpointMap: Record<ModalType, string> = {
      approve: 'approve',
      reject: 'reject',
      suspend: 'suspend',
      restore: 'restore',
    };

    try {
      const res = await api.patch(`/admin/vouchers/${selectedVoucher.id}/${endpointMap[modalType]}`, { lyDo: reason });

      if (res.status === 200) {
        toast.success({
          approve: `Đã duyệt: ${selectedVoucher.name}`,
          reject: `Đã từ chối: ${selectedVoucher.name}`,
          suspend: `Đã tạm ngưng: ${selectedVoucher.name}`,
          restore: `Đã khôi phục: ${selectedVoucher.name}`,
        }[modalType]);
        setShowModal(false);
        setVouchers(prev => prev.map(v => v.id === selectedVoucher.id ? {
          ...v,
          status: modalType === 'approve' ? 'ACTIVE'
                : modalType === 'reject' ? 'REJECTED'
                : modalType === 'suspend' ? 'SUSPENDED'
                : 'ACTIVE'
        } : v));
        fetchVouchers(true);
      } else {
        const err = res.data;
        toast.error(err.error || tText('Operation failed!', 'Thực hiện thất bại!'));
      }
    } catch { toast.error(tText('An error occurred!', 'Có lỗi xảy ra!')); }
  };

  const filterButtons: { label: string; value: VoucherStatus | 'all' }[] = [
    { label: tText('All', 'Tất cả'), value: 'all' },
    { label: tText('Pending', 'Chờ duyệt'), value: 'PENDING_APPROVAL' },
    { label: tText('Approved', 'Đã duyệt'), value: 'ACTIVE' },
    { label: tText('Rejected', 'Từ chối'), value: 'REJECTED' },
    { label: tText('Suspended', 'Tạm ngưng'), value: 'SUSPENDED' },
  ];

  const modalTitle: Record<ModalType, string> = {
    approve: tText('Confirm Approval', 'Xác nhận phê duyệt'),
    reject: tText('Confirm Rejection', 'Xác nhận từ chối'),
    suspend: tText('Confirm Suspension', 'Xác nhận tạm ngưng'),
    restore: tText('Confirm Restoration', 'Xác nhận khôi phục'),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex gap-2 flex-wrap">
          {filterButtons.map(({ label, value }) => (
            <Button key={value} variant={statusFilter === value ? 'default' : 'outline'} onClick={() => setStatusFilter(value)}>
              {label}
            </Button>
          ))}
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder={tText('Search voucher...', 'Tìm kiếm voucher...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-white"
          />
        </div>
        <select
          value={partnerFilter}
          onChange={(e) => setPartnerFilter(e.target.value)}
          className="h-10 py-0 pl-3 pr-8 border border-gray-200 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none bg-[length:16px_16px] bg-[position:right_8px_center] bg-no-repeat cursor-pointer"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")` }}
        >
          <option value="all">{tText('All Partners', 'Tất cả đối tác')}</option>
          {uniquePartners.map(partner => (
            <option key={partner} value={partner}>{partner}</option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-10 px-3 border border-gray-200 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <span className="text-gray-400 text-sm">{tText('to', 'đến')}</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="h-10 px-3 border border-gray-200 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
              <TableHead>{tText('No.', 'STT')}</TableHead>
              <TableHead>{tText('Voucher Name', 'Tên voucher')}</TableHead>
              <TableHead>{tText('Partner', 'Đối tác')}</TableHead>
              <TableHead>{tText('Original Price', 'Giá gốc')}</TableHead>
              <TableHead>{tText('Sale Price', 'Giá bán')}</TableHead>
              <TableHead>{tText('Sold / Total', 'Đã bán / Tổng')}</TableHead>
              <TableHead>{tText('Date Sent', 'Ngày gửi')}</TableHead>
              <TableHead>{tText('Status', 'Trạng thái')}</TableHead>
              <TableHead className="text-right">{tText('Actions', 'Hành động')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedVouchers.map((v, i) => (
              <TableRow key={v.id} className="hover:bg-gray-50/50">
                <TableCell className="text-gray-500">{(currentPage - 1) * ITEMS_PER_PAGE + i + 1}</TableCell>
                <TableCell className="font-medium text-gray-900 max-w-xs">{v.name}</TableCell>
                <TableCell>{v.partner}</TableCell>
                <TableCell className="text-gray-500">{v.originalPrice}</TableCell>
                <TableCell className="font-medium text-green-600">{v.salePrice}</TableCell>
                {/* Hiển thị rõ đã bán / tổng */}
                <TableCell>
                  <span className="font-medium">{v.quantitySold}</span>
                  <span className="text-gray-400"> / {v.quantityTotal}</span>
                </TableCell>
                <TableCell className="text-gray-500">{v.date}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={STATUS_CLASS[v.status]}>
                    {STATUS_LABEL[v.status]}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openDetail(v)} className="h-8 w-8 text-blue-600 hover:bg-blue-50">
                      <Eye className="w-4 h-4" />
                    </Button>
                    {v.status === 'PENDING_APPROVAL' && (
                      <>
                        <Button variant="ghost" size="icon" onClick={() => openModal(v, 'approve')} className="h-8 w-8 text-green-600 hover:bg-green-50" title={tText('Approve', 'Duyệt')}>
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openModal(v, 'reject')} className="h-8 w-8 text-red-600 hover:bg-red-50" title={tText('Reject', 'Từ chối')}>
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    {/* Nút Tạm ngưng — chỉ hiện khi ACTIVE */}
                    {v.status === 'ACTIVE' && (
                      <Button variant="ghost" size="icon" onClick={() => openModal(v, 'suspend')} className="h-8 w-8 text-orange-500 hover:bg-orange-50" title={tText('Suspend', 'Tạm ngưng')}>
                        <PauseCircle className="w-4 h-4" />
                      </Button>
                    )}
                    {/* Nút Khôi phục — chỉ hiện khi SUSPENDED */}
                    {v.status === 'SUSPENDED' && (
                      <Button variant="ghost" size="icon" onClick={() => openModal(v, 'restore')} className="h-8 w-8 text-green-600 hover:bg-green-50" title={tText('Restore', 'Khôi phục')}>
                        <PlayCircle className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {paginatedVouchers.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-6 text-gray-500">{tText('No vouchers found.', 'Không có voucher nào.')}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-gray-500">
            {tText(
              `Showing ${(currentPage - 1) * ITEMS_PER_PAGE + 1} to ${Math.min(currentPage * ITEMS_PER_PAGE, sortedAndFiltered.length)} of ${sortedAndFiltered.length} entries`,
              `Đang hiển thị ${(currentPage - 1) * ITEMS_PER_PAGE + 1} đến ${Math.min(currentPage * ITEMS_PER_PAGE, sortedAndFiltered.length)} trong số ${sortedAndFiltered.length} mục`
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

      {/* Modal xác nhận */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-primary">{modalTitle[modalType]}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-700 mb-4">
              {modalType === 'approve' && tText(`Are you sure you want to approve voucher "${selectedVoucher?.name}"?`, `Bạn có chắc chắn muốn phê duyệt voucher "${selectedVoucher?.name}"?`)}
              {modalType === 'reject' && tText(`Are you sure you want to reject voucher "${selectedVoucher?.name}"?`, `Bạn có chắc chắn muốn từ chối voucher "${selectedVoucher?.name}"?`)}
              {modalType === 'suspend' && tText(`Are you sure you want to suspend voucher "${selectedVoucher?.name}"?`, `Bạn có chắc chắn muốn tạm ngưng voucher "${selectedVoucher?.name}"?`)}
              {modalType === 'restore' && tText(`Are you sure you want to restore voucher "${selectedVoucher?.name}"?`, `Bạn có chắc chắn muốn khôi phục hoạt động cho voucher "${selectedVoucher?.name}"?`)}
            </p>
            {(modalType === 'reject' || modalType === 'suspend') && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {modalType === 'reject' ? tText('Reason for rejection', 'Lý do từ chối') : tText('Reason for suspension', 'Lý do tạm ngưng')} <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder={modalType === 'reject' ? tText('Enter reason for rejection...', 'Nhập lý do từ chối...') : tText('Enter reason for suspension...', 'Nhập lý do tạm ngưng...')}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
                  rows={4}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>{tText('Cancel', 'Hủy')}</Button>
            <Button
              onClick={confirmAction}
              className={
                modalType === 'approve' || modalType === 'restore' ? 'bg-green-600 hover:bg-green-700' :
                modalType === 'suspend' ? 'bg-orange-500 hover:bg-orange-600' : ''
              }
              variant={modalType === 'reject' ? 'destructive' : 'default'}
            >
              {modalType === 'approve' ? tText('Approve', 'Phê duyệt') : modalType === 'reject' ? tText('Reject', 'Từ chối') : modalType === 'suspend' ? tText('Suspend', 'Tạm ngưng') : tText('Restore', 'Khôi phục')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal chi tiết voucher */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-primary">{tText('Voucher Details', 'Chi tiết Voucher')}</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {detailVoucher && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">{tText('Voucher Name', 'Tên voucher')}</p>
                  <p className="font-medium text-gray-900">{detailVoucher.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{tText('Partner', 'Đối tác')}</p>
                  <p className="font-medium text-gray-900">{detailVoucher.partner}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{tText('Original Price', 'Giá gốc')}</p>
                  <p className="font-medium text-gray-900">{detailVoucher.originalPrice}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{tText('Sale Price', 'Giá bán')}</p>
                  <p className="font-medium text-green-600">{detailVoucher.salePrice}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{tText('Sold', 'Đã bán')}</p>
                  <p className="font-medium text-gray-900">{detailVoucher.quantitySold}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{tText('Total Allowed', 'Tổng cho phép')}</p>
                  <p className="font-medium text-gray-900">{detailVoucher.quantityTotal}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{tText('Date Sent', 'Ngày gửi')}</p>
                  <p className="font-medium text-gray-900">{detailVoucher.date}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{tText('Status', 'Trạng thái')}</p>
                  <Badge variant="outline" className={STATUS_CLASS[detailVoucher.status]}>
                    {STATUS_LABEL[detailVoucher.status]}
                  </Badge>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowDetailModal(false)}>{tText('Close', 'Đóng')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
