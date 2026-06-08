import { useState, useEffect } from 'react';
import { Eye, CheckCircle, XCircle, PauseCircle, PlayCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  Button, Badge, Table, TableHeader, TableRow, TableHead,
  TableBody, TableCell, Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from '@voucherhub/ui';

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

const STATUS_LABEL: Record<VoucherStatus, string> = {
  PENDING_APPROVAL: 'Chờ duyệt',
  ACTIVE: 'Đã duyệt',
  REJECTED: 'Từ chối',
  SUSPENDED: 'Tạm ngưng',
};

const STATUS_CLASS: Record<VoucherStatus, string> = {
  PENDING_APPROVAL: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 shadow-none border-transparent',
  ACTIVE: 'bg-green-100 text-green-700 hover:bg-green-100 shadow-none border-transparent',
  REJECTED: 'bg-red-100 text-red-700 hover:bg-red-100 shadow-none border-transparent',
  SUSPENDED: 'bg-gray-100 text-gray-700 hover:bg-gray-100 shadow-none border-transparent',
};

type ModalType = 'approve' | 'reject' | 'suspend' | 'restore';

export function VoucherApproval() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [statusFilter, setStatusFilter] = useState<VoucherStatus | 'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<ModalType>('approve');
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [reason, setReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailVoucher, setDetailVoucher] = useState<Voucher | null>(null);

  const fetchVouchers = (silent = false) => {
    fetch(`/api/admin/vouchers?t=${Date.now()}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setVouchers(data);
      })
      .catch(() => {
        if (!silent) toast.error('Không tải được danh sách voucher');
      });
  };

  useEffect(() => {
    fetchVouchers(true);
  }, []);

  const filtered = vouchers.filter(v => {
    const matchStatus = statusFilter === 'all' || v.status === statusFilter;
    const matchSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

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
      const res = await fetch(`/api/admin/vouchers/${selectedVoucher.id}/${endpointMap[modalType]}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lyDo: reason }),
      });

      if (res.ok) {
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
        const err = await res.json();
        toast.error(err.error || 'Thực hiện thất bại!');
      }
    } catch { toast.error('Có lỗi xảy ra!'); }
  };

  const filterButtons: { label: string; value: VoucherStatus | 'all' }[] = [
    { label: 'Tất cả', value: 'all' },
    { label: 'Chờ duyệt', value: 'PENDING_APPROVAL' },
    { label: 'Đã duyệt', value: 'ACTIVE' },
    { label: 'Từ chối', value: 'REJECTED' },
    { label: 'Tạm ngưng', value: 'SUSPENDED' },
  ];

  const modalTitle: Record<ModalType, string> = {
    approve: 'Xác nhận phê duyệt',
    reject: 'Xác nhận từ chối',
    suspend: 'Xác nhận tạm ngưng',
    restore: 'Xác nhận khôi phục',
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
        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Tìm kiếm voucher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>
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
              <TableHead>Đã bán / Tổng</TableHead>
              <TableHead>Ngày gửi</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((v, i) => (
              <TableRow key={v.id} className="hover:bg-gray-50/50">
                <TableCell className="text-gray-500">{i + 1}</TableCell>
                <TableCell className="font-medium text-gray-900 max-w-xs">{v.name}</TableCell>
                <TableCell>{v.partner}</TableCell>
                <TableCell className="text-gray-500 line-through">{v.originalPrice}</TableCell>
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
                        <Button variant="ghost" size="icon" onClick={() => openModal(v, 'approve')} className="h-8 w-8 text-green-600 hover:bg-green-50" title="Duyệt">
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openModal(v, 'reject')} className="h-8 w-8 text-red-600 hover:bg-red-50" title="Từ chối">
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    {/* Nút Tạm ngưng — chỉ hiện khi ACTIVE */}
                    {v.status === 'ACTIVE' && (
                      <Button variant="ghost" size="icon" onClick={() => openModal(v, 'suspend')} className="h-8 w-8 text-orange-500 hover:bg-orange-50" title="Tạm ngưng">
                        <PauseCircle className="w-4 h-4" />
                      </Button>
                    )}
                    {/* Nút Khôi phục — chỉ hiện khi SUSPENDED */}
                    {v.status === 'SUSPENDED' && (
                      <Button variant="ghost" size="icon" onClick={() => openModal(v, 'restore')} className="h-8 w-8 text-green-600 hover:bg-green-50" title="Khôi phục">
                        <PlayCircle className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-6 text-gray-500">Không có voucher nào.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal xác nhận */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-primary">{modalTitle[modalType]}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-700 mb-4">
              {modalType === 'approve' && `Bạn có chắc chắn muốn phê duyệt voucher "${selectedVoucher?.name}"?`}
              {modalType === 'reject' && `Bạn có chắc chắn muốn từ chối voucher "${selectedVoucher?.name}"?`}
              {modalType === 'suspend' && `Bạn có chắc chắn muốn tạm ngưng voucher "${selectedVoucher?.name}"?`}
              {modalType === 'restore' && `Bạn có chắc chắn muốn khôi phục hoạt động cho voucher "${selectedVoucher?.name}"?`}
            </p>
            {(modalType === 'reject' || modalType === 'suspend') && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {modalType === 'reject' ? 'Lý do từ chối' : 'Lý do tạm ngưng'} <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder={modalType === 'reject' ? 'Nhập lý do từ chối...' : 'Nhập lý do tạm ngưng...'}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
                  rows={4}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>Hủy</Button>
            <Button
              onClick={confirmAction}
              className={
                modalType === 'approve' || modalType === 'restore' ? 'bg-green-600 hover:bg-green-700' :
                modalType === 'suspend' ? 'bg-orange-500 hover:bg-orange-600' : ''
              }
              variant={modalType === 'reject' ? 'destructive' : 'default'}
            >
              {modalType === 'approve' ? 'Phê duyệt' : modalType === 'reject' ? 'Từ chối' : modalType === 'suspend' ? 'Tạm ngưng' : 'Khôi phục'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal chi tiết voucher */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-primary">Chi tiết Voucher</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {detailVoucher && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Tên voucher</p>
                  <p className="font-medium text-gray-900">{detailVoucher.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Đối tác</p>
                  <p className="font-medium text-gray-900">{detailVoucher.partner}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Giá gốc</p>
                  <p className="font-medium text-gray-900 line-through">{detailVoucher.originalPrice}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Giá bán</p>
                  <p className="font-medium text-green-600">{detailVoucher.salePrice}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Đã bán</p>
                  <p className="font-medium text-gray-900">{detailVoucher.quantitySold}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tổng cho phép</p>
                  <p className="font-medium text-gray-900">{detailVoucher.quantityTotal}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ngày gửi</p>
                  <p className="font-medium text-gray-900">{detailVoucher.date}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Trạng thái</p>
                  <Badge variant="outline" className={STATUS_CLASS[detailVoucher.status]}>
                    {STATUS_LABEL[detailVoucher.status]}
                  </Badge>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowDetailModal(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
