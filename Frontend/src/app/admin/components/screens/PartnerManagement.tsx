import { useState, useEffect } from 'react';
import { Search, Eye, CheckCircle, XCircle, Lock, Unlock } from 'lucide-react';
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

export function PartnerManagement() {
  const { language } = useLanguage();
  const tText = (en: string, vi: string) => (language === 'vi' ? vi : en);

  const [partners, setPartners] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [approvalFilter, setApprovalFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modals state
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<any | null>(null);

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

  const fetchPartners = () => {
    api.get(`/admin/partners?t=${Date.now()}`)
      .then(res => {
        const data = res.data;
        if (Array.isArray(data)) {
          // Map backend approval status string
          const mapped = data.map((p: any) => ({
            ...p,
            displayApprovalStatus: p.approvalStatus === 'APPROVED' ? 'Approved'
                                 : p.approvalStatus === 'REJECTED' ? 'Rejected'
                                 : 'Pending'
          }));
          setPartners(mapped);
        }
      })
      .catch(err => console.error('Fetch partners error:', err));
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const handleApprovePartner = (id: number, name: string) => {
    triggerConfirm(
      tText('Approve Partner', 'Duyệt Đối Tác'),
      tText(`Are you sure you want to approve partner "${name}"?`, `Bạn có chắc chắn muốn duyệt đối tác "${name}" không?`),
      async () => {
        try {
          const res = await api.patch(`/admin/partners/${id}/approve`);

          if (res.status === 200) {
            toast.success(
              tText(
                `Successfully approved partner "${name}"!`,
                `Đã phê duyệt đối tác "${name}" thành công!`
              )
            );
            setPartners(prev => prev.map(p => p.id === id ? { ...p, displayApprovalStatus: 'Approved', approvalStatus: 'APPROVED', status: 'ACTIVE' } : p));
          } else {
            toast.error(tText('Approval failed!', 'Duyệt đối tác thất bại!'));
          }
        } catch (e) {
          console.error(e);
          toast.error(tText('An error occurred!', 'Có lỗi xảy ra!'));
        }
      },
      'default'
    );
  };

  const handleRejectPartner = (id: number, name: string) => {
    triggerConfirm(
      tText('Reject Partner', 'Từ Chối Đối Tác'),
      tText(`Are you sure you want to reject partner "${name}"?`, `Bạn có chắc chắn muốn từ chối đối tác "${name}" không?`),
      async () => {
        try {
          const res = await api.patch(`/admin/partners/${id}/reject`);

          if (res.status === 200) {
            toast.success(
              tText(
                `Successfully rejected partner "${name}"!`,
                `Đã từ chối đối tác "${name}"!`
              )
            );
            setPartners(prev => prev.map(p => p.id === id ? { ...p, displayApprovalStatus: 'Rejected', approvalStatus: 'REJECTED' } : p));
          } else {
            toast.error(tText('Rejection failed!', 'Từ chối đối tác thất bại!'));
          }
        } catch (e) {
          console.error(e);
          toast.error(tText('An error occurred!', 'Có lỗi xảy ra!'));
        }
      },
      'destructive'
    );
  };

  const handleTogglePartner = (id: number, name: string) => {
    const partner = partners.find(p => p.id === id);
    if (!partner) return;

    const isLocking = partner.status === 'ACTIVE';
    const confirmTitle = isLocking ? tText('Lock Partner', 'Khóa Đối Tác') : tText('Unlock Partner', 'Mở Khóa Đối Tác');
    const confirmMsg = isLocking
      ? tText(`Are you sure you want to lock partner "${name}"?`, `Bạn có chắc chắn muốn khóa đối tác "${name}" không?`)
      : tText(`Are you sure you want to unlock partner "${name}"?`, `Bạn có chắc chắn muốn mở khóa đối tác "${name}" không?`);

    triggerConfirm(
      confirmTitle,
      confirmMsg,
      async () => {
        try {
          const res = await api.patch(`/admin/partners/${id}/toggle`);

          if (res.status === 200) {
            toast.success(
              isLocking
                ? tText(`Successfully locked partner "${name}"!`, `Đã khóa đối tác "${name}" thành công!`)
                : tText(`Successfully unlocked partner "${name}"!`, `Đã mở khóa đối tác "${name}" thành công!`)
            );
            setPartners(prev => prev.map(p => p.id === id ? { ...p, status: isLocking ? 'LOCKED' : 'ACTIVE' } : p));
          } else {
            toast.error(tText('Failed to change partner status!', 'Thay đổi trạng thái đối tác thất bại!'));
          }
        } catch (e) {
          console.error(e);
          toast.error(tText('An error occurred!', 'Có lỗi xảy ra!'));
        }
      },
      isLocking ? 'destructive' : 'default'
    );
  };

  const handleViewPartner = (partner: any) => {
    setSelectedPartner(partner);
    setShowDetailModal(true);
  };

  const filteredPartners = partners.filter((partner) => {
    const matchesSearch = partner.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesApproval = approvalFilter === 'all' || partner.displayApprovalStatus.toLowerCase() === approvalFilter.toLowerCase();
    return matchesSearch && matchesApproval;
  });

  const totalPages = Math.ceil(filteredPartners.length / itemsPerPage);
  const currentPartners = filteredPartners.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Tabs for approval status */}
        <div className="flex gap-2">
          <Button
            variant={approvalFilter === 'all' ? 'default' : 'outline'}
            onClick={() => { setApprovalFilter('all'); setCurrentPage(1); }}
          >
            {tText('All', 'Tất cả')}
          </Button>
          <Button
            variant={approvalFilter === 'pending' ? 'default' : 'outline'}
            onClick={() => { setApprovalFilter('pending'); setCurrentPage(1); }}
            className={approvalFilter === 'pending' ? '' : 'text-yellow-600 border-yellow-200 hover:bg-yellow-50'}
          >
            {tText('Pending Approval', 'Chờ duyệt')}
          </Button>
          <Button
            variant={approvalFilter === 'approved' ? 'default' : 'outline'}
            onClick={() => { setApprovalFilter('approved'); setCurrentPage(1); }}
            className={approvalFilter === 'approved' ? '' : 'text-green-600 border-green-200 hover:bg-green-50'}
          >
            {tText('Approved', 'Đã duyệt')}
          </Button>
          <Button
            variant={approvalFilter === 'rejected' ? 'default' : 'outline'}
            onClick={() => { setApprovalFilter('rejected'); setCurrentPage(1); }}
            className={approvalFilter === 'rejected' ? '' : 'text-red-600 border-red-200 hover:bg-red-50'}
          >
            {tText('Rejected', 'Từ chối')}
          </Button>
        </div>

        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <Input
            type="text"
            placeholder={tText('Search partners...', 'Tìm kiếm đối tác...')}
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="pl-10 bg-white shadow-sm border-gray-200"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead>{tText('No.', 'STT')}</TableHead>
              <TableHead>{tText('Partner Name', 'Tên đối tác')}</TableHead>
              <TableHead>{tText('Category', 'Lĩnh vực')}</TableHead>
              <TableHead>{tText('Vouchers', 'Vouchers')}</TableHead>
              <TableHead>{tText('Revenue', 'Doanh thu')}</TableHead>
              <TableHead>{tText('Approval Status', 'Trạng thái duyệt')}</TableHead>
              <TableHead>{tText('Operational Status', 'Trạng thái HĐ')}</TableHead>
              <TableHead className="text-right">{tText('Actions', 'Hành động')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentPartners.map((partner, index) => (
              <TableRow key={partner.id} className="hover:bg-gray-50/50">
                <TableCell className="text-gray-500">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </TableCell>
                <TableCell className="font-medium text-gray-900">{partner.name}</TableCell>
                <TableCell>
                  {partner.category === 'Giải trí' ? tText('Entertainment', 'Giải trí') 
                   : partner.category === 'Du lịch' ? tText('Travel', 'Du lịch') 
                   : partner.category === 'Làm đẹp' ? tText('Beauty', 'Làm đẹp') 
                   : partner.category === 'Khác' ? tText('Other', 'Khác') 
                   : partner.category}
                </TableCell>
                <TableCell>{partner.vouchers}</TableCell>
                <TableCell className="font-medium text-gray-900">{partner.revenue}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      partner.displayApprovalStatus === 'Approved' ? 'default'
                      : partner.displayApprovalStatus === 'Pending' ? 'outline'
                      : 'destructive'
                    }
                    className={
                      partner.displayApprovalStatus === 'Approved'
                        ? 'bg-green-100 text-green-700 hover:bg-green-100 shadow-none border-transparent'
                        : partner.displayApprovalStatus === 'Pending'
                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 shadow-none border-transparent'
                        : 'bg-red-100 text-red-700 hover:bg-red-100 shadow-none border-transparent'
                    }
                  >
                    {tText(partner.displayApprovalStatus, 
                      partner.displayApprovalStatus === 'Approved' ? 'Đã duyệt'
                      : partner.displayApprovalStatus === 'Pending' ? 'Chờ duyệt'
                      : 'Từ chối'
                    )}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      partner.status === 'ACTIVE' ? 'default'
                      : partner.status === 'PENDING' ? 'outline'
                      : partner.status === 'LOCKED' ? 'destructive'
                      : 'secondary'
                    }
                    className={
                      partner.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-700 hover:bg-green-100 shadow-none border-transparent'
                        : partner.status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 shadow-none border-transparent'
                        : partner.status === 'LOCKED'
                        ? 'bg-red-100 text-red-700 hover:bg-red-100 shadow-none border-transparent'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-100 shadow-none border-transparent'
                    }
                  >
                    {partner.status === 'ACTIVE' ? tText('Active', 'Hoạt động')
                     : partner.status === 'PENDING' ? tText('Pending', 'Chờ kích hoạt')
                     : partner.status === 'LOCKED' ? tText('Locked', 'Bị khóa')
                     : tText('Inactive', 'Tạm dừng')}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button onClick={() => handleViewPartner(partner)} variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" title={tText('View details', 'Xem chi tiết')}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    
                    {partner.displayApprovalStatus === 'Pending' && (
                      <>
                        <Button onClick={() => handleApprovePartner(partner.id, partner.name)} variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50" title={tText('Approve', 'Duyệt đối tác')}>
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button onClick={() => handleRejectPartner(partner.id, partner.name)} variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" title={tText('Reject', 'Từ chối')}>
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </>
                    )}

                    {partner.status === 'ACTIVE' && (
                      <Button
                        onClick={() => handleTogglePartner(partner.id, partner.name)}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        title={tText('Lock partner', 'Khóa đối tác')}
                      >
                        <Lock className="w-4 h-4" />
                      </Button>
                    )}

                    {partner.status === 'LOCKED' && (
                      <Button
                        onClick={() => handleTogglePartner(partner.id, partner.name)}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                        title={tText('Unlock partner', 'Mở khóa đối tác')}
                      >
                        <Unlock className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredPartners.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6 text-gray-500">
                  {tText('No partners found.', 'Không tìm thấy đối tác nào.')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
            <div className="text-sm text-gray-500">
              {tText(
                `Showing ${(currentPage - 1) * itemsPerPage + 1} - ${Math.min(currentPage * itemsPerPage, filteredPartners.length)} of ${filteredPartners.length}`,
                `Hiển thị ${(currentPage - 1) * itemsPerPage + 1} - ${Math.min(currentPage * itemsPerPage, filteredPartners.length)} trên ${filteredPartners.length}`
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                {tText('Previous', 'Trước')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                {tText('Next', 'Sau')}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* --- View Partner Details Dialog --- */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-primary text-lg font-bold">
              {tText('Partner Details', 'Chi tiết đối tác')}
            </DialogTitle>
          </DialogHeader>
          {selectedPartner && (
            <div className="py-4 space-y-3 text-sm max-h-[60vh] overflow-y-auto pr-2">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500 font-medium">{tText('Enterprise Name:', 'Tên doanh nghiệp:')}</span>
                <span className="font-semibold text-gray-900">{selectedPartner.name}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500 font-medium">{tText('Field of Business:', 'Lĩnh vực kinh doanh:')}</span>
                <span className="text-gray-900">
                  {selectedPartner.category === 'Giải trí' ? tText('Entertainment', 'Giải trí') 
                   : selectedPartner.category === 'Du lịch' ? tText('Travel', 'Du lịch') 
                   : selectedPartner.category === 'Làm đẹp' ? tText('Beauty', 'Làm đẹp') 
                   : selectedPartner.category === 'Khác' ? tText('Other', 'Khác') 
                   : selectedPartner.category}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500 font-medium">{tText('Tax Code:', 'Mã số thuế:')}</span>
                <span className="text-gray-900 font-mono">{selectedPartner.taxCode || tText('Not provided', 'Chưa cung cấp')}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500 font-medium">{tText('Legal Representative:', 'Người đại diện:')}</span>
                <span className="text-gray-900">{selectedPartner.representative || tText('Not provided', 'Chưa cung cấp')}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500 font-medium">{tText('Phone:', 'Số điện thoại:')}</span>
                <span className="text-gray-900">{selectedPartner.phone || tText('Not provided', 'Chưa cung cấp')}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500 font-medium">{tText('Email:', 'Email:')}</span>
                <span className="text-gray-900">{selectedPartner.email || tText('Not provided', 'Chưa cung cấp')}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500 font-medium">{tText('Operating Hours:', 'Giờ hoạt động:')}</span>
                <span className="text-gray-900">
                  {selectedPartner.openTime && selectedPartner.closeTime 
                    ? `${selectedPartner.openTime} - ${selectedPartner.closeTime}`
                    : tText('Not provided', 'Chưa cung cấp')}
                </span>
              </div>
              <div className="flex flex-col border-b pb-2 gap-1">
                <span className="text-gray-500 font-medium">{tText('Description:', 'Mô tả:')}</span>
                <span className="text-gray-900 whitespace-pre-wrap">{selectedPartner.description || tText('Not provided', 'Chưa cung cấp')}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500 font-medium">{tText('Voucher Count:', 'Số lượng voucher:')}</span>
                <span className="text-gray-900 font-semibold">{selectedPartner.vouchers}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500 font-medium">{tText('Total Revenue:', 'Tổng doanh thu:')}</span>
                <span className="text-green-600 font-semibold">{selectedPartner.revenue}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500 font-medium">{tText('Approval Status:', 'Trạng thái duyệt:')}</span>
                <Badge
                  variant={
                    selectedPartner.displayApprovalStatus === 'Approved' ? 'default'
                    : selectedPartner.displayApprovalStatus === 'Pending' ? 'outline'
                    : 'destructive'
                  }
                  className={selectedPartner.displayApprovalStatus === 'Approved' ? 'bg-green-100 text-green-700 hover:bg-green-100 shadow-none' : ''}
                >
                  {tText(selectedPartner.displayApprovalStatus, 
                    selectedPartner.displayApprovalStatus === 'Approved' ? 'Đã duyệt'
                    : selectedPartner.displayApprovalStatus === 'Pending' ? 'Chờ duyệt'
                    : 'Từ chối'
                  )}
                </Badge>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-gray-500 font-medium">{tText('Join Date:', 'Ngày tham gia:')}</span>
                <span className="text-gray-900">{selectedPartner.date}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button className="w-full" onClick={() => setShowDetailModal(false)}>
              {tText('Close', 'Đóng')}
            </Button>
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
