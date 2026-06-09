import { VoucherDetailModal } from './VoucherDetailModal';
import { VoucherEditModal } from './VoucherEditModal';
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
  Plus,
  X,
} from 'lucide-react';
import { voucherStatusConfig } from '../../data/mockData';
import type { PartnerVoucher as Voucher } from '@voucherhub/types';
import { useLanguage } from '../../../shared/contexts/LanguageContext';
import { useAuth } from '../../../auth/AuthContext';
import { useNavigate } from 'react-router';
import { ConfirmModal } from '../../../shared/components/ConfirmModal';

import api from '../../../../lib/api';

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
  const { user } = useAuth();
  const navigate = useNavigate();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState('all');
  const [confirmModalState, setConfirmModalState] = useState({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => { },
  });
  const [voucherCategories, setVoucherCategories] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    api.get('/categories')
      .then((res: any) => {
        const data = res.data;
        if (Array.isArray(data)) {
          setVoucherCategories(data.map((c: any) => ({ id: c.MaDanhMuc, name: c.TenDanhMuc })));
        }
      })
      .catch(console.error);
  }, []);

  const handleEditCategoryToggle = (categoryName: string) => {
    setEditingVoucher((prev: any) => {
      if (!prev) return null;
      const cats = prev.categories || [];
      if (cats.includes(categoryName)) {
        return { ...prev, categories: cats.filter((c: any) => c !== categoryName) };
      } else {
        return { ...prev, categories: [...cats, categoryName] };
      }
    });
  };

  // Filter States
  const [priceMin, setPriceMin] = useState<string>('');
  const [priceMax, setPriceMax] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortSold, setSortSold] = useState<'none' | 'asc' | 'desc'>('none');
  const [sortDate, setSortDate] = useState<'none' | 'newest' | 'oldest'>('newest');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Edit State
  const [editingVoucher, setEditingVoucher] = useState<Partial<Voucher> | null>(null);
  const [editImages, setEditImages] = useState<{ id: string; url: string; description: string }[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);




  const handleEditImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter(file => file.type === 'image/jpeg' || file.type === 'image/png');
    if (validFiles.length < files.length) {
      toast.error(t('toast.voucher.image_format_error') || 'Chỉ chấp nhận ảnh JPEG hoặc PNG');
    }

    setUploadingImage(true);
    for (const file of validFiles) {
      const uploadFormData = new FormData();
      uploadFormData.append('image', file);

      try {
        const res = await api.post(`/vouchers/upload-image`, uploadFormData);
        const data = res.data;
        const newImage = {
          id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
          url: `http://localhost:5000${data.imageUrl}`,
          description: '',
        };
        setEditImages((prev: any) => [...prev, newImage]);
      } catch (error: any) {
        console.error('Error uploading image:', error);
        toast.error(error.response?.data?.message ? t(error.response.data.message as string) : t('toast.voucher.connection_error') || 'Lỗi kết nối khi tải ảnh.');
      }
    }
    setUploadingImage(false);
  };

  const handleRemoveEditImage = async (id: string) => {
    const imgToRemove = editImages.find((img: any) => img.id === id);
    if (imgToRemove && imgToRemove.url.includes('/uploads/temp/')) {
      try {
        await api.delete(`/vouchers/upload-image?url=${encodeURIComponent(imgToRemove.url)}`);
      } catch (error) {
        console.error('Failed to delete image from server', error);
      }
    }
    setEditImages((prev: any) => prev.filter((img: any) => img.id !== id));
  };

  const handleCancelEdit = async () => {
    const originalUrls = selectedVoucher?.imageUrl ? selectedVoucher.imageUrl.split(',').map((u: any) => u.startsWith('http') ? u : `http://localhost:5000${u}`) : [];
    const newImages = editImages.filter((img: any) => !originalUrls.includes(img.url));

    for (const img of newImages) {
      if (img.url.includes('/uploads/temp/')) {
        try {
          await api.delete(`/vouchers/upload-image?url=${encodeURIComponent(img.url)}`);
        } catch (e) {
          console.error('Failed to clean up new image', e);
        }
      }
    }

    setEditDialogOpen(false);
  };

  const fetchVouchers = () => {
    const partnerId = user?.MaDoiTac || 1;
    api.get(`/vouchers/partner/${partnerId}?t=${Date.now()}`)
      .then((res: any) => {
        const data = res.data;
        if (Array.isArray(data)) {
          const mappedVouchers: Voucher[] = data.map((v: any) => {
            let status: any = 'draft';
            if (v.TrangThaiVoucher === 'PENDING_APPROVAL' || v.TrangThaiVoucher === 'Chờ duyệt') status = 'pending';
            else if (v.TrangThaiVoucher === 'APPROVED' || v.TrangThaiVoucher === 'ACTIVE' || v.TrangThaiVoucher === 'Đang hoạt động') status = 'active';
            else if (v.TrangThaiVoucher === 'PAUSED' || v.TrangThaiVoucher === 'Tạm ngưng') status = 'paused';
            else if (v.TrangThaiVoucher === 'REJECTED' || v.TrangThaiVoucher === 'Từ chối') status = 'rejected';
            else if (v.TrangThaiVoucher === 'DELETED' || v.TrangThaiVoucher === 'Đã xóa') status = 'deleted';
            else if (v.TrangThaiVoucher === 'EXPIRED' || v.TrangThaiVoucher === 'Hết hạn') status = 'expired';
            else if (v.TrangThaiVoucher === 'DRAFT' || v.TrangThaiVoucher === 'Bản nháp') status = 'draft';

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
              saleStartDateRaw: v.ThoiGianBatDauBan,
              saleEndDateRaw: v.ThoiGianKetThucBan,
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
    if (user?.MaDoiTac) {
      fetchVouchers();
    }
  }, [user?.MaDoiTac]);

  const allCategories = Array.from(new Set(vouchers.flatMap((v: any) => v.categories)));

  const handleViewDetails = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setDetailDialogOpen(true);
  };

  const handleEdit = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setEditingVoucher({ ...voucher });
    if (voucher.imageUrl) {
      const urls = voucher.imageUrl.split(',');
      setEditImages(urls.map((u, i) => ({
        id: i.toString(),
        url: u.startsWith('http') ? u : `http://localhost:5000${u}`,
        description: ''
      })));
    } else {
      setEditImages([]);
    }
    setEditDialogOpen(true);
  };

  const handleDelete = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setDeleteDialogOpen(true);
  };

  const handleRestore = async (voucher: Voucher) => {
    setConfirmModalState({
      isOpen: true,
      title: t('voucher.restore.title') || 'Khôi phục voucher',
      description: t('voucher.restore.desc') || 'Bạn có chắc muốn khôi phục voucher này?',
      onConfirm: async () => {
        try {
          await api.put(`/vouchers/${voucher.id}/restore`);
          fetchVouchers();
        } catch (err) {
          console.error(err);
        }
      }
    });
  };

  const handleTogglePause = async (voucher: Voucher) => {
    setConfirmModalState({
      isOpen: true,
      title: t('partner.vouchers.pause_title') || 'Tạm dừng voucher',
      description: language === 'en' 
        ? `Are you sure you want to pause voucher "${voucher.name}"?` 
        : `Bạn có chắc chắn muốn tạm dừng voucher "${voucher.name}" không?`,
      onConfirm: async () => {
        try {
          await api.put(`/vouchers/${voucher.id}`, { status: 'PAUSED' });
          toast.success(t('toast.voucher.update_success') || 'Tạm dừng voucher thành công');
          fetchVouchers();
        } catch (err) {
          console.error(err);
          toast.error(t('toast.voucher.update_failed') || 'Tạm dừng voucher thất bại');
        }
      }
    });
  };

  const handleToggleActive = async (voucher: Voucher) => {
    try {
      await api.put(`/vouchers/${voucher.id}`, { status: 'ACTIVE' });
      toast.success(t('toast.voucher.update_success') || 'Kích hoạt voucher thành công');
      fetchVouchers();
    } catch (err) {
      console.error(err);
      toast.error('Có lỗi xảy ra');
    }
  };

  const handleClearFilters = () => {
    setPriceMin('');
    setPriceMax('');
    setCategoryFilter('all');
    setSortSold('none');
    setSortDate('newest');
    setSearchTerm('');
    setStatusFilter('all');
  };

  let filteredVouchers = vouchers.filter((voucher) => {
    if (voucher.status === 'deleted') return false;

    const matchesSearch = voucher.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab =
      currentTab === 'all' ||
      voucher.status === currentTab;

    const minP = priceMin ? parseInt(priceMin, 10) : 0;
    const maxP = priceMax ? parseInt(priceMax, 10) : Infinity;
    const matchesPrice = voucher.salePrice >= minP && voucher.salePrice <= maxP;

    const matchesCategory = categoryFilter === 'all' || voucher.categories.includes(categoryFilter);
    const matchesStatus = statusFilter === 'all' || voucher.status === statusFilter;

    return matchesSearch && matchesTab && matchesPrice && matchesCategory && matchesStatus;
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
                value="paused"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-b-primary rounded-none px-0 pb-3"
              >
                {t('partner.vouchers.tab_inactive') || 'Pause'}
              </TabsTrigger>
              <TabsTrigger
                value="pending"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-b-primary rounded-none px-0 pb-3"
              >
                {t('partner.vouchers.tab_pending')}
              </TabsTrigger>
              <TabsTrigger
                value="draft"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-b-primary rounded-none px-0 pb-3"
              >
                {t('partner.vouchers.tab_draft')}
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
            <div className="bg-gray-50 p-4 rounded-lg mb-6 grid grid-cols-1 md:grid-cols-6 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">{t('partner.vouchers.filter_price_min') || 'Giá tối thiểu'}</label>
                <Input type="number" placeholder="0" value={priceMin} onChange={(e: any) => setPriceMin(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">{t('partner.vouchers.filter_price_max') || 'Giá tối đa'}</label>
                <Input type="number" placeholder={t('partner.vouchers.filter_unlimited') || 'Vô hạn'} value={priceMax} onChange={(e: any) => setPriceMax(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">{t('partner.vouchers.filter_category') || 'Danh mục'}</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={categoryFilter}
                  onChange={(e: any) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">{t('partner.vouchers.filter_all_categories') || 'Tất cả danh mục'}</option>
                  {allCategories.map((cat: any) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">{t('partner.vouchers.filter_sold') || 'Số lượng bán'}</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={sortSold}
                  onChange={(e: any) => setSortSold(e.target.value as any)}
                >
                  <option value="none">{t('partner.vouchers.sort_none') || 'Không sắp xếp'}</option>
                  <option value="desc">{t('partner.vouchers.sort_desc') || 'Nhiều nhất'}</option>
                  <option value="asc">{t('partner.vouchers.sort_asc') || 'Ít nhất'}</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">{t('partner.vouchers.filter_created') || 'Thời gian tạo'}</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={sortDate}
                  onChange={(e: any) => setSortDate(e.target.value as any)}
                >
                  <option value="none">{t('partner.vouchers.sort_none') || 'Không sắp xếp'}</option>
                  <option value="newest">{t('partner.vouchers.sort_newest') || 'Mới nhất'}</option>
                  <option value="oldest">{t('partner.vouchers.sort_oldest') || 'Cũ nhất'}</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">{t('partner.vouchers.filter_status') || 'Trạng thái'}</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={statusFilter}
                  onChange={(e: any) => setStatusFilter(e.target.value)}
                >
                  <option value="all">{t('partner.vouchers.filter_all') || 'Tất cả'}</option>
                  <option value="active">{t('partner.vouchers.tab_active') || 'Đang bán'}</option>
                  <option value="paused">{t('partner.vouchers.tab_inactive') || 'Tạm dừng'}</option>
                  <option value="pending">{t('partner.vouchers.tab_pending') || 'Chờ duyệt'}</option>
                  <option value="draft">{t('partner.vouchers.tab_draft') || 'Nháp'}</option>
                  <option value="expired">{t('partner.vouchers.tab_expired') || 'Hết hạn'}</option>
                  <option value="rejected">{t('partner.vouchers.tab_rejected') || 'Từ chối'}</option>
                </select>
              </div>
              <div className="md:col-span-6 flex justify-end mt-2">
                <Button variant="outline" onClick={handleClearFilters}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {t('partner.vouchers.filter_clear') || 'Xóa bộ lọc'}
                </Button>
              </div>
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>{t('partner.vouchers.col_name') || 'Tên Voucher'}</TableHead>
                <TableHead>{t('partner.vouchers.col_category')}</TableHead>
                <TableHead>{t('partner.vouchers.col_original_price')}</TableHead>
                <TableHead>{t('partner.vouchers.col_sale_price')}</TableHead>
                <TableHead>{t('partner.vouchers.col_sold')}</TableHead>
                <TableHead>{t('partner.vouchers.col_status')}</TableHead>
                <TableHead className="text-right">{t('partner.vouchers.col_action')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVouchers.map((voucher, index) => (
                <TableRow key={voucher.id}>
                  <TableCell>
                    <p className="font-semibold text-gray-500">{index + 1}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                        {voucher.imageUrl ? (
                          <img src={voucher.imageUrl.split(',')[0].startsWith('http') ? voucher.imageUrl.split(',')[0] : `http://localhost:5000${voucher.imageUrl.split(',')[0]}`} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px]">No img</div>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-900 max-w-[200px] truncate" title={voucher.name}>{voucher.name}</p>
                    </div>
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
                    <div className="font-semibold text-green-600">
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
                          : ['deleted', 'rejected', 'expired', 'paused'].includes(voucher.status as string)
                            ? 'bg-red-100 text-red-700 hover:bg-red-100'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-100'
                        } border-transparent shadow-none`}
                    >
                      {language === 'en' ? (voucher.status.charAt(0).toUpperCase() + voucher.status.slice(1)) : (statusTranslations[voucher.status] || voucher.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {voucher.status === 'active' && (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => handleViewDetails(voucher)} className="h-8 w-8 text-gray-600 hover:text-gray-700 hover:bg-gray-50" title={t('partner.vouchers.details_title') || 'Xem chi tiết'}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleTogglePause(voucher)} className="h-8 w-8 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50" title={t('partner.vouchers.pause_title') || 'Tạm ngưng'}>
                            <PauseCircle className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      {voucher.status === 'paused' && (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(voucher)} className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" title={t('partner.vouchers.edit_title') || 'Chỉnh sửa'}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleToggleActive(voucher)} className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50" title={t('partner.vouchers.active_title') || 'Kích hoạt'}>
                            <PlayCircle className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(voucher)} className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" title={t('partner.vouchers.delete_title') || 'Xóa'}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      {['draft', 'rejected'].includes(voucher.status as string) && (
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(voucher)} className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" title={t('partner.vouchers.edit_title') || 'Chỉnh sửa'}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                      {voucher.status === 'pending' && (
                        <Button variant="ghost" size="icon" onClick={() => handleViewDetails(voucher)} className="h-8 w-8 text-gray-600 hover:text-gray-700 hover:bg-gray-50" title={t('partner.vouchers.details_title') || 'Xem chi tiết'}>
                          <Eye className="w-4 h-4" />
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

      <VoucherDetailModal 
        detailDialogOpen={detailDialogOpen} 
        setDetailDialogOpen={setDetailDialogOpen} 
        selectedVoucher={selectedVoucher} 
        setPreviewImage={setPreviewImage} 
        statusTranslations={statusTranslations} 
      />

      <VoucherEditModal 
        editDialogOpen={editDialogOpen} 
        setEditDialogOpen={setEditDialogOpen} 
        selectedVoucher={selectedVoucher} 
        editingVoucher={editingVoucher}
        setEditingVoucher={setEditingVoucher}
        editImages={editImages}
        setEditImages={setEditImages}
        previewImage={previewImage}
        setPreviewImage={setPreviewImage}
        handleCancelEdit={handleCancelEdit}
        voucherCategories={voucherCategories}
        handleEditCategoryToggle={handleEditCategoryToggle}
        handleEditImageUpload={handleEditImageUpload}
        handleRemoveEditImage={handleRemoveEditImage}
        uploadingImage={uploadingImage}
        setConfirmModalState={setConfirmModalState}
        setVouchers={setVouchers}
        fetchVouchers={fetchVouchers}
        statusTranslations={statusTranslations} 
      />

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              {t('partner.vouchers.delete_title')}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>{t('partner.vouchers.delete_confirm') || 'Bạn có chắc chắn muốn xóa voucher'} <span className="font-bold">{selectedVoucher?.name}</span>?</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {t('common.cancel') || 'Hủy'}
            </Button>
            <Button
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={async () => {
                if (!selectedVoucher) return;
                try {
                  await api.delete(`/vouchers/${selectedVoucher.id}`);
                  setVouchers((prev: any) => prev.map((v: any) => v.id === selectedVoucher.id ? { ...v, status: 'deleted' } : v));
                  setDeleteDialogOpen(false);
                  fetchVouchers();
                  toast.success('Xóa voucher thành công');
                } catch (err) {
                  console.error(err);
                  toast.error('Xóa voucher thất bại. Vui lòng thử lại!');
                }
              }}
            >
              {t('partner.vouchers.delete_title')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent
          className="max-w-[95vw] w-[95vw] h-[95vh] sm:max-w-[95vw] bg-transparent border-none shadow-none p-0 flex justify-center items-center [&>button]:hidden"
          style={{ maxWidth: '95vw', width: '95vw', height: '95vh', backgroundColor: 'transparent', border: 'none', boxShadow: 'none', padding: 0 }}
        >
          <div className="relative w-full h-full flex justify-center items-center">
            <button
              className="absolute top-2 right-2 md:top-4 md:right-4 text-white bg-black/50 hover:bg-black/80 rounded-full p-2 transition-colors z-[110]"
              onClick={() => setPreviewImage(null)}
            >
              <X className="w-8 h-8" />
            </button>
            <img src={previewImage || ''} alt="Preview" className="max-w-full max-h-full object-contain rounded-md shadow-2xl drop-shadow-2xl" />
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmModal
        isOpen={confirmModalState.isOpen}
        onClose={() => setConfirmModalState((prev: any) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModalState.onConfirm}
        title={confirmModalState.title}
        description={confirmModalState.description}
      />
    </div>
  );
}
