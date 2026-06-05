import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  PauseCircle,
  PlayCircle,
  Filter,
  RotateCcw,
} from 'lucide-react';
import { voucherStatusConfig } from '../data/mockData';
import type { PartnerVoucher as Voucher } from '@voucherhub/types';
import { useLanguage } from '../../shared/contexts/LanguageContext';
import { useNavigate } from 'react-router';

import {
  Button,
  Input,
  Badge,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Tabs,
  TabsList,
  TabsTrigger,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@voucherhub/ui';

const statusTranslations: Record<string, string> = {
  active: 'Đang bán',
  pending: 'Chờ duyệt',
  paused: 'Tạm dừng',
  draft: 'Nháp',
  expired: 'Hết hạn',
  rejected: 'Từ chối',
  deleted: 'Đã xóa'
};

export default function VoucherManagement() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState('all');

  // Filter States
  const [priceMin, setPriceMin] = useState<string>('');
  const [priceMax, setPriceMax] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortSold, setSortSold] = useState<'none' | 'asc' | 'desc'>('none');
  const [sortDate, setSortDate] = useState<'none' | 'newest' | 'oldest'>('newest');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Edit State
  const [editingVoucher, setEditingVoucher] = useState<Partial<Voucher> | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleEditImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
      alert('Chỉ chấp nhận ảnh JPEG hoặc PNG');
      return;
    }

    const uploadFormData = new FormData();
    uploadFormData.append('image', file);

    try {
      setUploadingImage(true);
      const res = await fetch(`http://localhost:5000/api/vouchers/upload-image`, {
        method: 'POST',
        body: uploadFormData,
      });

      if (res.ok) {
        const data = await res.json();
        // Cập nhật imageUrl dạng đường dẫn tương đối (hoặc tuyệt đối theo tùy chọn)
        setEditingVoucher(prev => prev ? { ...prev, imageUrl: data.imageUrl } : null);
      } else {
        alert('Lỗi tải ảnh lên máy chủ.');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Lỗi kết nối khi tải ảnh.');
    } finally {
      setUploadingImage(false);
    }
  };

  const fetchVouchers = () => {
    const partnerId = localStorage.getItem('partnerId') || '1';
    fetch(`http://localhost:5000/api/vouchers/partner/${partnerId}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const mappedVouchers: Voucher[] = data.map((v: any) => {
            let status: any = 'draft';
            if (v.TrangThaiVoucher === 'PENDING_APPROVAL') status = 'pending';
            if (v.TrangThaiVoucher === 'APPROVED' || v.TrangThaiVoucher === 'ACTIVE') status = 'active';
            if (v.TrangThaiVoucher === 'PAUSED') status = 'paused';
            if (v.TrangThaiVoucher === 'REJECTED') status = 'rejected';
            if (v.TrangThaiVoucher === 'DELETED') status = 'deleted';
            if (v.TrangThaiVoucher === 'EXPIRED') status = 'expired';

            const originalPrice = v.GiaGoc ? parseFloat(v.GiaGoc) : 0;
            const salePrice = v.GiaBan ? parseFloat(v.GiaBan) : 0;
            let discount = 0;
            if (originalPrice > 0) {
              discount = Math.round(((originalPrice - salePrice) / originalPrice) * 100);
            }

            return {
              id: v.VoucherID.toString(),
              name: v.TenVoucher || '',
              originalPrice,
              salePrice,
              discount,
              quantity: v.SoLuongChoPhep || 0,
              sold: v.SoLuongDaBan || 0,
              status,
              categories: v.DanhMuc ? [v.DanhMuc.TenDanhMuc] : [], // Dynamic category from backend
              categoryId: v.MaDanhMuc,
              validFrom: new Date(v.ThoiGianBatDau).toLocaleDateString('vi-VN'),
              validTo: new Date(v.ThoiGianKetThuc).toLocaleDateString('vi-VN'),
              validStartDateRaw: v.ThoiGianBatDau,
              validEndDateRaw: v.ThoiGianKetThuc,
              description: v.MoTaVoucher || '',
              terms: v.MoTaDieuKien || '',
              refundPolicy: v.ChinhSachHoanTien || '',
              usageInstructions: v.HuongDanSuDung || '',
              imageUrl: v.ImageUrl || ''
            };
          });
          setVouchers(mappedVouchers);
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const allCategories = Array.from(new Set(vouchers.flatMap(v => v.categories)));

  const handleViewDetails = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setDetailDialogOpen(true);
  };

  const handleEdit = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setEditingVoucher({ ...voucher });
    setEditDialogOpen(true);
  };

  const handleDelete = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setDeleteDialogOpen(true);
  };

  const handleRestore = async (voucher: Voucher) => {
    if (confirm("Bạn có chắc muốn khôi phục voucher này?")) {
      try {
        const res = await fetch(`http://localhost:5000/api/vouchers/${voucher.id}/restore`, {
          method: 'PUT'
        });
        if (res.ok) {
          fetchVouchers();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleClearFilters = () => {
    setPriceMin('');
    setPriceMax('');
    setCategoryFilter('all');
    setSortSold('none');
    setSortDate('newest');
    setSearchTerm('');
  };

  let filteredVouchers = vouchers.filter((voucher) => {
    const matchesSearch = voucher.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab =
      currentTab === 'all' ||
      voucher.status === currentTab;

    const minP = priceMin ? parseInt(priceMin, 10) : 0;
    const maxP = priceMax ? parseInt(priceMax, 10) : Infinity;
    const matchesPrice = voucher.salePrice >= minP && voucher.salePrice <= maxP;

    const matchesCategory = categoryFilter === 'all' || voucher.categories.includes(categoryFilter);

    return matchesSearch && matchesTab && matchesPrice && matchesCategory;
  });

  if (sortSold === 'asc') {
    filteredVouchers.sort((a, b) => a.sold - b.sold);
  } else if (sortSold === 'desc') {
    filteredVouchers.sort((a, b) => b.sold - a.sold);
  } else if (sortDate === 'newest') {
    filteredVouchers.sort((a, b) => parseInt(b.id) - parseInt(a.id));
  } else if (sortDate === 'oldest') {
    filteredVouchers.sort((a, b) => parseInt(a.id) - parseInt(b.id));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('partner.vouchers.title')}</h1>
          <p className="text-gray-500">{t('partner.vouchers.subtitle')}</p>
        </div>
        <Button onClick={() => navigate('/partner/create')}>{t('partner.vouchers.create_new')}</Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <div className="px-6 pt-4 border-b">
            <TabsList className="bg-transparent gap-6 p-0 h-auto">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-b-primary rounded-none px-0 pb-3"
              >
                {t('partner.vouchers.tab_all')}
              </TabsTrigger>
              <TabsTrigger
                value="active"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-b-primary rounded-none px-0 pb-3"
              >
                {t('partner.vouchers.tab_active')}
              </TabsTrigger>
              <TabsTrigger
                value="pending"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-b-primary rounded-none px-0 pb-3"
              >
                {t('partner.vouchers.tab_pending')}
              </TabsTrigger>
              <TabsTrigger
                value="paused"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-b-primary rounded-none px-0 pb-3"
              >
                {t('partner.vouchers.tab_paused')}
              </TabsTrigger>
              <TabsTrigger
                value="draft"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-b-primary rounded-none px-0 pb-3"
              >
                Nháp
              </TabsTrigger>
              <TabsTrigger
                value="expired"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-b-primary rounded-none px-0 pb-3"
              >
                Đã hết hạn
              </TabsTrigger>
              <TabsTrigger
                value="rejected"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-b-primary rounded-none px-0 pb-3"
              >
                Từ chối
              </TabsTrigger>
              <TabsTrigger
                value="deleted"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-b-primary rounded-none px-0 pb-3"
              >
                Đã xóa
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>

        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                placeholder={t('partner.vouchers.search_ph')}
                className="pl-9"
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="shrink-0 gap-2" onClick={() => setIsFilterOpen(!isFilterOpen)}>
              <Filter className="w-4 h-4" />
              {t('partner.vouchers.filter')}
            </Button>
          </div>

          {isFilterOpen && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6 grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Giá tối thiểu</label>
                <Input type="number" placeholder="0" value={priceMin} onChange={e => setPriceMin(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Giá tối đa</label>
                <Input type="number" placeholder="Vô hạn" value={priceMax} onChange={e => setPriceMax(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Danh mục</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                >
                  <option value="all">Tất cả danh mục</option>
                  {allCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Số lượng bán</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={sortSold}
                  onChange={e => setSortSold(e.target.value as any)}
                >
                  <option value="none">Không sắp xếp</option>
                  <option value="desc">Nhiều nhất</option>
                  <option value="asc">Ít nhất</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Thời gian tạo</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={sortDate}
                  onChange={e => setSortDate(e.target.value as any)}
                >
                  <option value="none">Không sắp xếp</option>
                  <option value="newest">Mới nhất</option>
                  <option value="oldest">Cũ nhất</option>
                </select>
              </div>
              <div className="md:col-span-5 flex justify-end mt-2">
                <Button variant="outline" onClick={handleClearFilters}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Xóa bộ lọc
                </Button>
              </div>
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('partner.vouchers.col_name')}</TableHead>
                <TableHead>{t('partner.vouchers.col_category')}</TableHead>
                <TableHead>{t('partner.vouchers.col_original_price')}</TableHead>
                <TableHead>{t('partner.vouchers.col_sale_price')}</TableHead>
                <TableHead>{t('partner.vouchers.col_sold')}</TableHead>
                <TableHead>{t('partner.vouchers.col_status')}</TableHead>
                <TableHead>{t('partner.vouchers.col_action')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVouchers.map((voucher) => (
                <TableRow key={voucher.id}>
                  <TableCell>
                    <p className="font-semibold">{voucher.id}</p>
                    <p className="text-sm text-gray-500">{voucher.name}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {voucher.categories.map((cat) => (
                        <Badge key={cat} variant="outline" className="font-normal">
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span>
                      {voucher.originalPrice.toLocaleString('vi-VN')}₫
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-gray-900">
                      {voucher.salePrice.toLocaleString('vi-VN')}₫
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">
                      {voucher.sold}/{voucher.quantity}
                    </p>
                    <div className="w-16 h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
                      <div
                        className="h-full bg-green-500"
                        style={{ width: `${(voucher.sold / voucher.quantity) * 100}%` }}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`${voucher.status === 'active'
                        ? 'bg-green-100 text-green-700 hover:bg-green-100'
                        : voucher.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100'
                          : ['deleted', 'rejected', 'expired'].includes(voucher.status as string)
                            ? 'bg-red-100 text-red-700 hover:bg-red-100'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-100'
                        } border-transparent shadow-none`}
                    >
                      {language === 'en' ? (voucher.status === 'active' ? 'Active' : voucher.status === 'pending' ? 'Pending' : 'Paused') : (statusTranslations[voucher.status] || voucher.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleViewDetails(voucher)} className="h-8 w-8 text-gray-600 hover:text-gray-700 hover:bg-gray-50">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(voucher)} className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                        <Edit className="w-4 h-4" />
                      </Button>
                      {voucher.status === 'deleted' ? (
                        <Button variant="ghost" size="icon" onClick={() => handleRestore(voucher)} className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50" title="Khôi phục">
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(voucher)} className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" title="Xóa">
                          <Trash2 className="w-4 h-4" />
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

      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{t('partner.vouchers.details_title')}</DialogTitle>
          </DialogHeader>
          {selectedVoucher && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 max-h-[70vh] overflow-y-auto px-2">
              <div className="sm:col-span-2">
                <p className="text-sm font-semibold text-gray-700 mb-1">Ảnh Voucher</p>
                <div className="w-full rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center min-h-[150px]">
                  {selectedVoucher.imageUrl ? (
                    <img src={`http://localhost:5000${selectedVoucher.imageUrl}`} alt="Voucher" className="w-full max-h-[300px] object-contain" />
                  ) : (
                    <span className="text-sm text-gray-500 py-10">Chưa có ảnh</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">{t('partner.vouchers.code_label')}</p>
                <div className="mt-1 p-2 bg-gray-50 border border-gray-200 rounded-md">
                  <p className="font-medium text-lg text-blue-600">{selectedVoucher.id}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">{t('partner.vouchers.status_label')}</p>
                <Badge
                  className={`mt-1 ${selectedVoucher.status === 'active'
                    ? 'bg-green-100 text-green-700 hover:bg-green-100'
                    : selectedVoucher.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100'
                      : ['deleted', 'rejected', 'expired'].includes(selectedVoucher.status as string)
                        ? 'bg-red-100 text-red-700 hover:bg-red-100'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-100'
                    } border-transparent shadow-none`}
                >
                  {language === 'en' ? (selectedVoucher.status === 'active' ? 'Active' : selectedVoucher.status === 'pending' ? 'Pending' : 'Paused') : (statusTranslations[selectedVoucher.status] || selectedVoucher.status)}
                </Badge>
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm font-semibold text-gray-700">{t('partner.vouchers.name_label')}</p>
                <div className="mt-1 p-2 bg-gray-50 border border-gray-200 rounded-md">
                  <p className="font-medium text-lg">{selectedVoucher.name}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">{t('partner.vouchers.original_price_label')}</p>
                <div className="mt-1 p-2 bg-gray-50 border border-gray-200 rounded-md">
                  <p>{selectedVoucher.originalPrice.toLocaleString('vi-VN')}₫</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">{t('partner.vouchers.sale_price_label')}</p>
                <div className="mt-1 p-2 bg-gray-50 border border-gray-200 rounded-md">
                  <p className="font-semibold text-red-500">
                    {selectedVoucher.salePrice.toLocaleString('vi-VN')}₫
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">{t('partner.vouchers.sale_time_label')}</p>
                <div className="mt-1 p-2 bg-gray-50 border border-gray-200 rounded-md">
                  <p className="text-sm">
                    {selectedVoucher.validFrom} → {selectedVoucher.validTo}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">{t('partner.vouchers.sold_total_label')}</p>
                <div className="mt-1 p-2 bg-gray-50 border border-gray-200 rounded-md">
                  <p>
                    {selectedVoucher.sold} / {selectedVoucher.quantity}
                  </p>
                </div>
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm font-semibold text-gray-700">{t('partner.vouchers.category_label')}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedVoucher.categories.map((cat) => (
                    <Badge key={cat} variant="secondary" className="font-normal shadow-none">
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="sm:col-span-2 mt-2">
                <p className="text-sm font-semibold text-gray-700">Mô tả</p>
                <div className="mt-1 p-3 bg-gray-50 border border-gray-200 rounded-md">
                  <p className="text-sm whitespace-pre-wrap">{selectedVoucher.description || 'Chưa cập nhật'}</p>
                </div>
              </div>
              <div className="sm:col-span-2 mt-2">
                <p className="text-sm font-semibold text-gray-700">Điều kiện áp dụng</p>
                <div className="mt-1 p-3 bg-gray-50 border border-gray-200 rounded-md">
                  <p className="text-sm whitespace-pre-wrap">{selectedVoucher.terms || 'Chưa cập nhật'}</p>
                </div>
              </div>
              <div className="sm:col-span-2 mt-2">
                <p className="text-sm font-semibold text-gray-700">{t('partner.create.refund_policy_label') || 'Chính sách hoàn tiền'}</p>
                <div className="mt-1 p-3 bg-gray-50 border border-gray-200 rounded-md">
                  <p className="text-sm whitespace-pre-wrap">{selectedVoucher.refundPolicy || 'Chưa cập nhật'}</p>
                </div>
              </div>
              <div className="sm:col-span-2 mt-2">
                <p className="text-sm font-semibold text-gray-700">{t('partner.create.guide_label') || 'Hướng dẫn sử dụng'}</p>
                <div className="mt-1 p-3 bg-gray-50 border border-gray-200 rounded-md">
                  <p className="text-sm whitespace-pre-wrap">{selectedVoucher.usageInstructions || 'Chưa cập nhật'}</p>
                </div>
              </div>
              {selectedVoucher.branches && (
                <div className="sm:col-span-2">
                  <p className="text-sm font-semibold text-gray-700">{t('partner.vouchers.branches_label')}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedVoucher.branches.map((branch) => (
                      <Badge key={branch} variant="outline" className="font-normal text-primary border-primary">
                        {branch}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setDetailDialogOpen(false)}>{t('partner.vouchers.close')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{t('partner.vouchers.edit_title')}</DialogTitle>
          </DialogHeader>
          {selectedVoucher && (
            <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto px-2">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="sm:w-1/3 flex flex-col gap-2">
                  <label className="text-sm font-medium">Ảnh Voucher</label>
                  <div className="border-2 border-dashed rounded-lg p-2 text-center relative overflow-hidden bg-gray-50 flex items-center justify-center min-h-[150px]">
                    {editingVoucher?.imageUrl ? (
                      <img src={`http://localhost:5000${editingVoucher.imageUrl}`} alt="Voucher" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-gray-500">Chưa có ảnh</span>
                    )}
                    {uploadingImage && <div className="absolute inset-0 bg-white/50 flex items-center justify-center text-sm font-bold">Đang tải...</div>}
                  </div>
                  <input type="file" accept="image/jpeg, image/png" onChange={handleEditImageUpload} className="text-sm" />
                </div>
                <div className="sm:w-2/3 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('partner.vouchers.name_req')}</label>
                    <Input
                      value={editingVoucher?.name || ''}
                      onChange={e => setEditingVoucher(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Danh mục</label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      value={editingVoucher?.categoryId || ''}
                      onChange={e => setEditingVoucher(prev => ({ ...prev, categoryId: parseInt(e.target.value, 10) }))}
                    >
                      <option value="">Chọn danh mục</option>
                      <option value="1">Ăn uống</option>
                      <option value="2">Mua sắm</option>
                      <option value="3">Giải trí</option>
                      <option value="4">Du lịch</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('partner.vouchers.original_price_req')}</label>
                  <Input
                    type="number"
                    value={editingVoucher?.originalPrice || 0}
                    onChange={e => setEditingVoucher(prev => ({ ...prev, originalPrice: parseFloat(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('partner.vouchers.sale_price_req')}</label>
                  <Input
                    type="number"
                    value={editingVoucher?.salePrice || 0}
                    onChange={e => setEditingVoucher(prev => ({ ...prev, salePrice: parseFloat(e.target.value) }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('partner.vouchers.total_req')}</label>
                  <Input
                    type="number"
                    value={editingVoucher?.quantity || 0}
                    onChange={e => setEditingVoucher(prev => ({ ...prev, quantity: parseInt(e.target.value, 10) }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('partner.vouchers.status_label')}</label>
                  {(selectedVoucher?.status === 'draft' || selectedVoucher?.status === 'pending') ? (
                    <div className="flex items-center gap-3">
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:opacity-50"
                        value={editingVoucher?.status || 'draft'}
                        disabled
                      >
                        <option value="draft">Nháp</option>
                        <option value="pending">{t('partner.vouchers.tab_pending')}</option>
                      </select>
                      {editingVoucher?.status === 'draft' ? (
                        <button
                          type="button"
                          onClick={() => setEditingVoucher(prev => prev ? { ...prev, status: 'pending' } : null)}
                          className="text-primary hover:underline text-sm font-medium whitespace-nowrap"
                        >
                          Gửi duyệt
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setEditingVoucher(prev => prev ? { ...prev, status: 'draft' } : null)}
                          className="text-gray-500 hover:underline text-sm font-medium whitespace-nowrap"
                        >
                          Hủy gửi duyệt
                        </button>
                      )}
                    </div>
                  ) : (
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:opacity-50"
                      value={editingVoucher?.status || 'active'}
                      onChange={e => setEditingVoucher(prev => ({ ...prev, status: e.target.value as any }))}
                    >
                      {(selectedVoucher?.status === 'active' || selectedVoucher?.status === 'paused') && (
                        <>
                          <option value="active">{t('partner.vouchers.tab_active')}</option>
                          <option value="paused">{t('partner.vouchers.tab_paused')}</option>
                        </>
                      )}
                      {(selectedVoucher?.status as any !== 'draft' && selectedVoucher?.status as any !== 'pending' && selectedVoucher?.status !== 'active' && selectedVoucher?.status !== 'paused') && (
                        <option value={selectedVoucher?.status || 'active'}>
                          {statusTranslations[selectedVoucher?.status || 'active'] || selectedVoucher?.status}
                        </option>
                      )}
                    </select>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Bắt đầu</label>
                  <Input
                    type="date"
                    value={editingVoucher?.validStartDateRaw ? new Date(editingVoucher.validStartDateRaw as string).toISOString().split('T')[0] : ''}
                    onChange={e => setEditingVoucher(prev => ({ ...prev, validStartDateRaw: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Kết thúc</label>
                  <Input
                    type="date"
                    value={editingVoucher?.validEndDateRaw ? new Date(editingVoucher.validEndDateRaw as string).toISOString().split('T')[0] : ''}
                    onChange={e => setEditingVoucher(prev => ({ ...prev, validEndDateRaw: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Mô tả</label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border-2 border-gray-200 bg-background px-3 py-2 text-sm ring-offset-background focus-visible:border-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  value={editingVoucher?.description || ''}
                  onChange={e => setEditingVoucher(prev => prev ? { ...prev, description: e.target.value } : null)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Điều kiện</label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border-2 border-gray-200 bg-background px-3 py-2 text-sm ring-offset-background focus-visible:border-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  value={editingVoucher?.terms || ''}
                  onChange={e => setEditingVoucher(prev => prev ? { ...prev, terms: e.target.value } : null)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('partner.create.refund_policy_label') || 'Chính sách hoàn tiền'}</label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border-2 border-gray-200 bg-background px-3 py-2 text-sm ring-offset-background focus-visible:border-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  value={editingVoucher?.refundPolicy || ''}
                  onChange={e => setEditingVoucher(prev => prev ? { ...prev, refundPolicy: e.target.value } : null)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('partner.create.guide_label') || 'Hướng dẫn sử dụng'}</label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border-2 border-gray-200 bg-background px-3 py-2 text-sm ring-offset-background focus-visible:border-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  value={editingVoucher?.usageInstructions || ''}
                  onChange={e => setEditingVoucher(prev => prev ? { ...prev, usageInstructions: e.target.value } : null)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>{t('common.cancel')}</Button>
            <Button onClick={async () => {
              if (!editingVoucher) return;
              try {
                if (!editingVoucher.name || !editingVoucher.originalPrice || !editingVoucher.salePrice || !editingVoucher.validStartDateRaw || !editingVoucher.validEndDateRaw || !editingVoucher.quantity) {
                  toast.error('Vui lòng điền đầy đủ các trường bắt buộc!');
                  return;
                }

                if (editingVoucher.salePrice >= editingVoucher.originalPrice) {
                  toast.error('Giá bán phải nhỏ hơn giá gốc!');
                  return;
                }

                if (new Date(editingVoucher.validEndDateRaw) < new Date(editingVoucher.validStartDateRaw)) {
                  toast.error('Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu!');
                  return;
                }

                const partnerId = localStorage.getItem('partnerId') || '1';

                let backendStatus = 'DRAFT';
                if (editingVoucher.status === 'active') backendStatus = 'ACTIVE';
                if (editingVoucher.status === 'paused') backendStatus = 'PAUSED';
                if (editingVoucher.status === 'pending') backendStatus = 'PENDING_APPROVAL';

                const payload = {
                  name: editingVoucher.name,
                  categoryId: editingVoucher.categoryId,
                  partnerId: parseInt(partnerId, 10),
                  description: editingVoucher.description,
                  terms: editingVoucher.terms,
                  originalPrice: editingVoucher.originalPrice,
                  salePrice: editingVoucher.salePrice,
                  quantity: editingVoucher.quantity,
                  validStartDate: editingVoucher.validStartDateRaw,
                  validEndDate: editingVoucher.validEndDateRaw,
                  status: backendStatus,
                  refundPolicy: editingVoucher.refundPolicy,
                  usageInstructions: editingVoucher.usageInstructions,
                  imageUrl: editingVoucher.imageUrl ? editingVoucher.imageUrl.replace('http://localhost:5000', '') : null
                };

                const res = await fetch(`http://localhost:5000/api/vouchers/${editingVoucher.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload)
                });

                if (res.ok) {
                  setEditDialogOpen(false);
                  fetchVouchers(); // Refresh
                  toast.success('Cập nhật Voucher thành công!');
                } else {
                  toast.error('Cập nhật thất bại. Vui lòng kiểm tra lại thông tin!');
                }
              } catch (err) {
                console.error(err);
                toast.error('Đã xảy ra lỗi hệ thống, vui lòng thử lại!');
              }
            }}>{t('profile.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              {t('partner.vouchers.delete_title')}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>{t('partner.vouchers.delete_confirm')} <span className="font-bold">{selectedVoucher?.name}</span> ({selectedVoucher?.id})?</p>
            <p className="text-sm text-gray-500 mt-2">{t('partner.vouchers.delete_warning')}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={async () => {
                if (!selectedVoucher) return;
                try {
                  const res = await fetch(`http://localhost:5000/api/vouchers/${selectedVoucher.id}`, {
                    method: 'DELETE'
                  });
                  if (res.ok) {
                    setDeleteDialogOpen(false);
                    fetchVouchers();
                  }
                } catch (err) {
                  console.error(err);
                }
              }}
            >
              {t('partner.vouchers.delete_title')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
