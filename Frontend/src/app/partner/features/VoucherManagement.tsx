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
import { voucherStatusConfig } from '../data/mockData';
import type { PartnerVoucher as Voucher } from '@voucherhub/types';
import { useLanguage } from '../../shared/contexts/LanguageContext';
import { useAuth } from '../../auth/AuthContext';
import { useNavigate } from 'react-router';
import { ConfirmModal } from '../../shared/components/ConfirmModal';
import api from '../../../lib/api';

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
      .then(res => {
        const data = res.data;
        if (Array.isArray(data)) {
          setVoucherCategories(data.map((c: any) => ({ id: c.MaDanhMuc, name: c.TenDanhMuc })));
        }
      })
      .catch(console.error);
  }, []);

  const handleEditCategoryToggle = (categoryName: string) => {
    setEditingVoucher(prev => {
      if (!prev) return null;
      const cats = prev.categories || [];
      if (cats.includes(categoryName)) {
        return { ...prev, categories: cats.filter(c => c !== categoryName) };
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
        setEditImages(prev => [...prev, newImage]);
      } catch (error: any) {
        console.error('Error uploading image:', error);
        toast.error(error.response?.data?.message ? t(error.response.data.message as string) : t('toast.voucher.connection_error') || 'Lỗi kết nối khi tải ảnh.');
      }
    }
    setUploadingImage(false);
  };

  const handleRemoveEditImage = async (id: string) => {
    const imgToRemove = editImages.find(img => img.id === id);
    if (imgToRemove && imgToRemove.url.includes('/uploads/temp/')) {
      try {
        await api.delete(`/vouchers/upload-image?url=${encodeURIComponent(imgToRemove.url)}`);
      } catch (error) {
        console.error('Failed to delete image from server', error);
      }
    }
    setEditImages(prev => prev.filter(img => img.id !== id));
  };

  const handleCancelEdit = async () => {
    const originalUrls = selectedVoucher?.imageUrl ? selectedVoucher.imageUrl.split(',').map(u => u.startsWith('http') ? u : `http://localhost:5000${u}`) : [];
    const newImages = editImages.filter(img => !originalUrls.includes(img.url));

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
      .then(res => {
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

  const allCategories = Array.from(new Set(vouchers.flatMap(v => v.categories)));

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
                <Input type="number" placeholder="0" value={priceMin} onChange={e => setPriceMin(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">{t('partner.vouchers.filter_price_max') || 'Giá tối đa'}</label>
                <Input type="number" placeholder={t('partner.vouchers.filter_unlimited') || 'Vô hạn'} value={priceMax} onChange={e => setPriceMax(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">{t('partner.vouchers.filter_category') || 'Danh mục'}</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                >
                  <option value="all">{t('partner.vouchers.filter_all_categories') || 'Tất cả danh mục'}</option>
                  {allCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">{t('partner.vouchers.filter_sold') || 'Số lượng bán'}</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={sortSold}
                  onChange={e => setSortSold(e.target.value as any)}
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
                  onChange={e => setSortDate(e.target.value as any)}
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
                  onChange={e => setStatusFilter(e.target.value)}
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

      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-[750px] p-0 overflow-hidden bg-white rounded-2xl">
          <DialogHeader className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-500" />
              {t('partner.vouchers.details_title')}
            </DialogTitle>
          </DialogHeader>
          {selectedVoucher && (
            <div className="max-h-[75vh] overflow-y-auto custom-scrollbar">
              {/* Header section with image and key info */}
              <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50/30 border-b border-gray-100">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Image Gallery */}
                  <div className="w-full md:w-1/3 shrink-0">
                    <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-white shadow-sm border border-white flex items-center justify-center relative group">
                      {selectedVoucher.imageUrl ? (
                        <div className="flex flex-col h-full w-full overflow-y-auto snap-y custom-scrollbar">
                          {selectedVoucher.imageUrl.split(',').map((url, i) => {
                            const fullUrl = url.startsWith('http') ? url : `http://localhost:5000${url}`;
                            return (
                              <div key={i} className="relative w-full h-full shrink-0 snap-center">
                                <img src={fullUrl} alt="Voucher" className="w-full h-full object-cover cursor-pointer transition-transform duration-500 group-hover:scale-105" onClick={() => setPreviewImage(fullUrl)} />
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center justify-center">
                                  <Eye className="text-white w-8 h-8 drop-shadow-md" />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                            <Eye className="w-5 h-5 text-gray-300" />
                          </div>
                          <span className="text-sm font-medium">{t('partner.vouchers.no_image') || 'Chưa có ảnh'}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Key Info */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <h3 className="text-2xl font-bold text-gray-900 leading-tight">{selectedVoucher.name}</h3>
                        <Badge
                          className={`shrink-0 px-3 py-1 text-sm font-medium rounded-full shadow-sm ${selectedVoucher.status === 'active'
                            ? 'bg-green-100 text-green-700 hover:bg-green-100 border-green-200'
                            : selectedVoucher.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200'
                              : ['deleted', 'rejected', 'expired'].includes(selectedVoucher.status as string)
                                ? 'bg-red-100 text-red-700 hover:bg-red-100 border-red-200'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-100 border-gray-200'
                            }`}
                        >
                          {language === 'en' ? (selectedVoucher.status === 'active' ? 'Active' : selectedVoucher.status === 'pending' ? 'Pending' : 'Paused') : (statusTranslations[selectedVoucher.status] || selectedVoucher.status)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                        <span className="bg-white/60 px-2 py-1 rounded-md border border-gray-200/60 font-mono text-xs">{selectedVoucher.id}</span>
                        <span>•</span>
                        <div className="flex flex-wrap gap-1">
                          {selectedVoucher.categories.map((cat) => (
                            <Badge key={cat} variant="secondary" className="bg-white/60 hover:bg-white text-gray-600 font-normal shadow-none border-gray-200/60">
                              {cat}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 bg-white/60 p-4 rounded-xl border border-gray-100 backdrop-blur-sm">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{t('partner.vouchers.sale_price_label')}</p>
                        <p className="text-2xl font-bold text-red-600">{selectedVoucher.salePrice.toLocaleString('vi-VN')}₫</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{t('partner.vouchers.original_price_label')}</p>
                        <p className="text-lg font-semibold text-gray-400 line-through decoration-gray-300">{selectedVoucher.originalPrice.toLocaleString('vi-VN')}₫</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Details Sections */}
              <div className="p-6 space-y-8">
                {/* Metrics & Dates Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{t('partner.vouchers.sold_total_label')}</p>
                    <div className="flex items-end gap-2">
                      <p className="text-xl font-bold text-gray-900">{selectedVoucher.sold}</p>
                      <p className="text-sm text-gray-500 mb-1">/ {selectedVoucher.quantity}</p>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full mt-3 overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full transition-all duration-500 group-hover:bg-blue-600" style={{ width: `${(selectedVoucher.sold / selectedVoucher.quantity) * 100}%` }} />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow sm:col-span-3 flex flex-col justify-center gap-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{t('partner.create.sale_start_label') || 'Thời gian bán'}</p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-50 rounded-lg py-2 px-3 border border-gray-100 text-center">
                          <span className="text-sm font-medium text-gray-800">{selectedVoucher.saleStartDateRaw ? new Date(selectedVoucher.saleStartDateRaw).toLocaleDateString('vi-VN') : 'N/A'}</span>
                        </div>
                        <span className="text-gray-400 font-medium">→</span>
                        <div className="flex-1 bg-gray-50 rounded-lg py-2 px-3 border border-gray-100 text-center">
                          <span className="text-sm font-medium text-gray-800">{selectedVoucher.saleEndDateRaw ? new Date(selectedVoucher.saleEndDateRaw).toLocaleDateString('vi-VN') : 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{t('partner.create.valid_start_label') || 'Thời gian sử dụng'}</p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-50 rounded-lg py-2 px-3 border border-gray-100 text-center">
                          <span className="text-sm font-medium text-gray-800">{selectedVoucher.validFrom}</span>
                        </div>
                        <span className="text-gray-400 font-medium">→</span>
                        <div className="flex-1 bg-gray-50 rounded-lg py-2 px-3 border border-gray-100 text-center">
                          <span className="text-sm font-medium text-gray-800">{selectedVoucher.validTo}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Text Content Sections */}
                <div className="space-y-6">
                  {/* Row 1: Description & Terms */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <section className="h-full flex flex-col">
                      <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-4 bg-blue-500 rounded-full"></span>
                        {t('partner.vouchers.description_label') || 'Mô tả'}
                      </h4>
                      <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-100 shadow-inner flex-1">
                        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{selectedVoucher.description || t('partner.vouchers.not_updated') || 'Chưa cập nhật'}</p>
                      </div>
                    </section>
                    <section className="h-full flex flex-col">
                      <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-4 bg-orange-500 rounded-full"></span>
                        {t('partner.vouchers.terms_label') || 'Điều kiện áp dụng'}
                      </h4>
                      <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-100 shadow-inner flex-1">
                        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{selectedVoucher.terms || t('partner.vouchers.not_updated') || 'Chưa cập nhật'}</p>
                      </div>
                    </section>
                  </div>

                  {/* Row 2: Usage Guide & Refund Policy */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <section className="h-full flex flex-col">
                      <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-4 bg-purple-500 rounded-full"></span>
                        {t('partner.create.guide_label') || 'Hướng dẫn sử dụng'}
                      </h4>
                      <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-100 shadow-inner flex-1">
                        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{selectedVoucher.usageInstructions || t('partner.vouchers.not_updated') || 'Chưa cập nhật'}</p>
                      </div>
                    </section>
                    <section className="h-full flex flex-col">
                      <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-4 bg-green-500 rounded-full"></span>
                        {t('partner.create.refund_policy_label') || 'Chính sách hoàn tiền'}
                      </h4>
                      <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-100 shadow-inner flex-1">
                        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{selectedVoucher.refundPolicy || t('partner.vouchers.not_updated') || 'Chưa cập nhật'}</p>
                      </div>
                    </section>
                  </div>
                </div>

                {/* Branches */}
                {selectedVoucher.branches && selectedVoucher.branches.length > 0 && (
                  <section>
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <span className="w-1.5 h-4 bg-teal-500 rounded-full"></span>
                      {t('partner.vouchers.branches_label') || 'Chi nhánh'}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedVoucher.branches.map((branch) => (
                        <div key={branch} className="px-3 py-1.5 bg-teal-50 text-teal-700 text-sm font-medium rounded-lg border border-teal-100 flex items-center gap-1.5 shadow-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
                          {branch}
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </div>
          )}
          <DialogFooter className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 sm:justify-between items-center">
            <p className="text-xs text-gray-400 hidden sm:block">ID: {selectedVoucher?.id}</p>
            <Button variant="outline" className="px-6 rounded-full hover:bg-gray-100 font-medium border-gray-200" onClick={() => setDetailDialogOpen(false)}>{t('partner.vouchers.close')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={(open) => { if (!open) handleCancelEdit(); else setEditDialogOpen(true); }}>
        <DialogContent
          className="sm:max-w-[800px] p-0 overflow-hidden bg-white rounded-2xl"
          onInteractOutside={(e) => {
            if (previewImage) {
              e.preventDefault();
            }
          }}
          onEscapeKeyDown={(e) => {
            if (previewImage) {
              e.preventDefault();
            }
          }}
        >
          <DialogHeader className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Edit className="w-5 h-5 text-blue-500" />
              {t('partner.vouchers.edit_title')}
            </DialogTitle>
          </DialogHeader>
          {selectedVoucher && (
            <div className="max-h-[75vh] overflow-y-auto px-6 py-6 space-y-8 custom-scrollbar">
              {editingVoucher?.status === 'draft' && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-xl flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="bg-yellow-100 p-2 rounded-lg">
                      <Edit className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div>
                      <span className="font-semibold block text-sm">{t('partner.vouchers.draft_label') || 'Bản nháp'}</span>
                      <span className="text-sm text-yellow-700">{t('partner.vouchers.draft_not_submitted') || 'Voucher này chưa được gửi duyệt.'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Basic Info Section */}
              <section className="space-y-6">
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b pb-2">
                  <span className="w-1.5 h-4 bg-blue-500 rounded-full"></span>
                  {t('partner.create.basic_info') || 'Thông tin cơ bản'}
                </h4>

                <div className="flex flex-col md:flex-row gap-6">
                  {/* Image Upload */}
                  <div className="md:w-1/3 flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">{t('partner.vouchers.image_label') || 'Ảnh Voucher'}</label>
                    {editImages.length === 0 ? (
                      <label htmlFor="edit-voucher-image" className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center relative overflow-hidden bg-gray-50 flex flex-col items-center justify-center aspect-square cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all group">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Plus className="w-5 h-5" />
                          </div>
                          <span className="text-blue-600 font-medium text-sm">{t('partner.vouchers.choose_file') || 'Chọn tệp'}</span>
                        </div>
                        {uploadingImage && <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center text-sm font-bold text-blue-600">{t('partner.vouchers.uploading') || 'Đang tải...'}</div>}
                      </label>
                    ) : (
                      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                        {editImages.map((img) => (
                          <div key={img.id} className="relative border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm group">
                            <img
                              src={img.url}
                              alt="Voucher"
                              className="w-full h-32 object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
                              onClick={() => setPreviewImage(img.url)}
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center justify-center">
                              <Eye className="text-white w-6 h-6" />
                            </div>
                            <button
                              type="button"
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-md p-1.5 opacity-0 group-hover:opacity-100 transition-all shadow-sm hover:bg-red-600 hover:scale-110 z-10"
                              onClick={() => handleRemoveEditImage(img.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <label className="cursor-pointer flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-300 transition-all gap-2">
                          <Plus className="w-4 h-4" />
                          {t('partner.vouchers.add_more_image') || 'Thêm ảnh khác'}
                          <input type="file" className="hidden" accept="image/jpeg, image/png" multiple onChange={handleEditImageUpload} />
                        </label>
                        {uploadingImage && <div className="text-center text-xs text-blue-600 font-medium">{t('partner.vouchers.uploading') || 'Đang tải...'}</div>}
                      </div>
                    )}
                    <input type="file" id="edit-voucher-image" accept="image/jpeg, image/png" onChange={handleEditImageUpload} className="hidden" multiple />
                  </div>

                  {/* Name and Categories */}
                  <div className="md:w-2/3 space-y-5">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">{t('partner.vouchers.name_req')}</label>
                      <Input
                        className="rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                        value={editingVoucher?.name || ''}
                        onChange={e => setEditingVoucher(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">{t('partner.vouchers.category_label') || 'Danh mục'}</label>
                        <div className="border border-gray-300 rounded-lg p-3 max-h-[140px] overflow-y-auto space-y-2 bg-gray-50 shadow-inner custom-scrollbar">
                          {voucherCategories.map((cat) => (
                            <label key={cat.id} className="flex items-center gap-3 cursor-pointer hover:bg-white p-2 rounded-md transition-colors border border-transparent hover:border-gray-200">
                              <input
                                type="checkbox"
                                checked={(editingVoucher?.categories || []).includes(cat.name)}
                                onChange={() => handleEditCategoryToggle(cat.name)}
                                className="rounded border-gray-300 w-4 h-4 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {editingVoucher?.status !== 'draft' && (
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700">{t('partner.vouchers.status_label')}</label>
                          <div className="flex h-[42px] w-full items-center rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-500 font-medium cursor-not-allowed">
                            {language === 'en' ? (editingVoucher?.status ? editingVoucher.status.charAt(0).toUpperCase() + editingVoucher.status.slice(1) : '') : (statusTranslations[editingVoucher?.status || ''] || editingVoucher?.status)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* Pricing & Limits Section */}
              <section className="space-y-6">
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b pb-2">
                  <span className="w-1.5 h-4 bg-purple-500 rounded-full"></span>
                  Pricing & Limits
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">{t('partner.vouchers.original_price_req')}</label>
                    <div className="relative">
                      <Input
                        type="number"
                        className="rounded-lg border-gray-300 pr-8 shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:opacity-70"
                        value={editingVoucher?.originalPrice || 0}
                        onChange={e => setEditingVoucher(prev => ({ ...prev, originalPrice: parseFloat(e.target.value) }))}
                        disabled={!(editingVoucher && ['draft', 'rejected', 'paused'].includes(editingVoucher.status as string))}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₫</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">{t('partner.vouchers.sale_price_req')}</label>
                    <div className="relative">
                      <Input
                        type="number"
                        className="rounded-lg border-red-300 text-red-600 font-semibold pr-8 shadow-sm focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100 disabled:opacity-70"
                        value={editingVoucher?.salePrice || 0}
                        onChange={e => setEditingVoucher(prev => ({ ...prev, salePrice: parseFloat(e.target.value) }))}
                        disabled={!(editingVoucher && ['draft', 'rejected', 'paused'].includes(editingVoucher.status as string))}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 font-medium">₫</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">{t('partner.vouchers.total_req')}</label>
                    <Input
                      type="number"
                      className="rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      value={editingVoucher?.quantity || 0}
                      onChange={e => setEditingVoucher(prev => ({ ...prev, quantity: parseInt(e.target.value, 10) }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">{t('partner.create.sale_start_label') || 'Thời gian bán (Bắt đầu)'}</label>
                    <Input
                      type="date"
                      className="rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:opacity-70"
                      value={editingVoucher?.saleStartDateRaw ? new Date(editingVoucher.saleStartDateRaw as string).toISOString().split('T')[0] : ''}
                      onChange={e => setEditingVoucher(prev => ({ ...prev, saleStartDateRaw: e.target.value }))}
                      disabled={!(editingVoucher && ['draft', 'rejected', 'paused'].includes(editingVoucher.status as string))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">{t('partner.create.sale_end_label') || 'Thời gian bán (Kết thúc)'}</label>
                    <Input
                      type="date"
                      className="rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:opacity-70"
                      value={editingVoucher?.saleEndDateRaw ? new Date(editingVoucher.saleEndDateRaw as string).toISOString().split('T')[0] : ''}
                      onChange={e => setEditingVoucher(prev => ({ ...prev, saleEndDateRaw: e.target.value }))}
                      disabled={!(editingVoucher && ['draft', 'rejected', 'paused'].includes(editingVoucher.status as string))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">{t('partner.create.valid_start_label') || 'Thời gian sử dụng (Bắt đầu)'}</label>
                    <Input
                      type="date"
                      className="rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:opacity-70"
                      value={editingVoucher?.validStartDateRaw ? new Date(editingVoucher.validStartDateRaw as string).toISOString().split('T')[0] : ''}
                      onChange={e => setEditingVoucher(prev => ({ ...prev, validStartDateRaw: e.target.value }))}
                      disabled={!(editingVoucher && ['draft', 'rejected', 'paused'].includes(editingVoucher.status as string))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">{t('partner.create.valid_end_label') || 'Thời gian sử dụng (Kết thúc)'}</label>
                    <Input
                      type="date"
                      className="rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:opacity-70"
                      value={editingVoucher?.validEndDateRaw ? new Date(editingVoucher.validEndDateRaw as string).toISOString().split('T')[0] : ''}
                      onChange={e => setEditingVoucher(prev => ({ ...prev, validEndDateRaw: e.target.value }))}
                      disabled={!(editingVoucher && ['draft', 'rejected', 'paused'].includes(editingVoucher.status as string))}
                    />
                  </div>
                </div>
              </section>

              {/* Descriptions Section */}
              <section className="space-y-6">
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b pb-2">
                  <span className="w-1.5 h-4 bg-orange-500 rounded-full"></span>
                  {t('partner.vouchers.details_terms') || 'Chi tiết & Điều khoản'}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">{t('partner.vouchers.description_label') || 'Mô tả'}</label>
                    <textarea
                      className="flex min-h-[120px] w-full rounded-xl border-gray-300 bg-white px-4 py-3 text-sm shadow-sm focus-visible:border-blue-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 resize-y custom-scrollbar"
                      value={editingVoucher?.description || ''}
                      onChange={e => setEditingVoucher(prev => prev ? { ...prev, description: e.target.value } : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">{t('partner.create.guide_label') || 'Hướng dẫn sử dụng'}</label>
                    <textarea
                      className="flex min-h-[120px] w-full rounded-xl border-gray-300 bg-white px-4 py-3 text-sm shadow-sm focus-visible:border-blue-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 resize-y custom-scrollbar"
                      value={editingVoucher?.usageInstructions || ''}
                      onChange={e => setEditingVoucher(prev => prev ? { ...prev, usageInstructions: e.target.value } : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">{t('partner.vouchers.terms_label') || 'Điều kiện'}</label>
                    <textarea
                      className="flex min-h-[120px] w-full rounded-xl border-gray-300 bg-white px-4 py-3 text-sm shadow-sm focus-visible:border-orange-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-500 resize-y custom-scrollbar"
                      value={editingVoucher?.terms || ''}
                      onChange={e => setEditingVoucher(prev => prev ? { ...prev, terms: e.target.value } : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">{t('partner.create.refund_policy_label') || 'Chính sách hoàn tiền'}</label>
                    <textarea
                      className="flex min-h-[120px] w-full rounded-xl border-gray-300 bg-white px-4 py-3 text-sm shadow-sm focus-visible:border-green-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-500 resize-y custom-scrollbar"
                      value={editingVoucher?.refundPolicy || ''}
                      onChange={e => setEditingVoucher(prev => prev ? { ...prev, refundPolicy: e.target.value } : null)}
                    />
                  </div>
                </div>
              </section>
            </div>
          )}
          <DialogFooter className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex flex-row justify-end gap-3 items-center">
            <Button variant="outline" className="rounded-full px-6 font-medium border-gray-300 hover:bg-gray-100" onClick={() => handleCancelEdit()}>{t('common.cancel') || 'Hủy'}</Button>
            {['draft', 'rejected', 'paused'].includes(editingVoucher?.status as string) && (
              <Button
                variant="default"
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 font-medium shadow-md hover:shadow-lg transition-all"
                onClick={() => {
                  if (!editingVoucher) return;
                  setConfirmModalState({
                    isOpen: true,
                    title: t('voucher.submit_approval.title') || 'Gửi duyệt voucher',
                    description: t('voucher.submit_approval.desc') || 'Bạn có chắc chắn muốn gửi duyệt voucher này không?',
                    onConfirm: async () => {
                      try {
                        if (!editingVoucher.name || !editingVoucher.originalPrice || !editingVoucher.salePrice || !editingVoucher.validStartDateRaw || !editingVoucher.validEndDateRaw || !editingVoucher.saleStartDateRaw || !editingVoucher.saleEndDateRaw || !editingVoucher.quantity) {
                          toast.error(t('toast.voucher.missing_fields') || 'Vui lòng điền đầy đủ các trường bắt buộc!');
                          return;
                        }
                        if (editingVoucher.salePrice >= editingVoucher.originalPrice) {
                          toast.error(t('toast.voucher.price_error') || 'Giá bán phải nhỏ hơn giá gốc!');
                          return;
                        }
                        if (new Date(editingVoucher.validEndDateRaw) < new Date(editingVoucher.validStartDateRaw)) {
                          toast.error(t('toast.voucher.date_error') || 'Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu!');
                          return;
                        }
                        if (new Date(editingVoucher.saleEndDateRaw) < new Date(editingVoucher.saleStartDateRaw)) {
                          toast.error(t('toast.voucher.date_error') || 'Ngày kết thúc bán phải lớn hơn hoặc bằng ngày bắt đầu bán!');
                          return;
                        }

                        const partnerId = localStorage.getItem('partnerId') || '1';
                        const categoryObj = voucherCategories.find(c => editingVoucher.categories && editingVoucher.categories.includes(c.name));
                        const payload = {
                          name: editingVoucher.name,
                          categoryId: categoryObj ? categoryObj.id : editingVoucher.categoryId,
                          partnerId: parseInt(partnerId, 10),
                          description: editingVoucher.description,
                          terms: editingVoucher.terms,
                          originalPrice: editingVoucher.originalPrice,
                          salePrice: editingVoucher.salePrice,
                          quantity: editingVoucher.quantity,
                          saleStartDate: editingVoucher.saleStartDateRaw,
                          saleEndDate: editingVoucher.saleEndDateRaw,
                          validStartDate: editingVoucher.validStartDateRaw,
                          validEndDate: editingVoucher.validEndDateRaw,
                          status: 'PENDING_APPROVAL',
                          refundPolicy: editingVoucher.refundPolicy,
                          usageInstructions: editingVoucher.usageInstructions,
                          imageUrl: editImages.length > 0 ? editImages.map(img => img.url.replace('http://localhost:5000', '')).join(',') : null
                        };
                        await api.put(`/vouchers/${editingVoucher.id}`, payload);
                        setEditDialogOpen(false);
                        fetchVouchers();
                        toast.success(t('toast.voucher.submit_success') || 'Đã gửi duyệt Voucher thành công!');
                      } catch (err: any) {
                        console.error(err);
                        toast.error(err.response?.data?.message ? t(err.response.data.message as string) : t('toast.voucher.submit_failed') || 'Gửi duyệt thất bại. Vui lòng thử lại!');
                      }
                    }
                  });
                }}
              >
                {t('voucher.submit_approval.title') || 'Gửi duyệt'}
              </Button>
            )}
            {['draft', 'rejected', 'paused'].includes(editingVoucher?.status as string) && (
              <Button className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-6 font-medium shadow-md hover:shadow-lg transition-all" onClick={async () => {
                if (!editingVoucher) return;
                
                if (!editingVoucher.name || !editingVoucher.originalPrice || !editingVoucher.salePrice || !editingVoucher.validStartDateRaw || !editingVoucher.validEndDateRaw || !editingVoucher.saleStartDateRaw || !editingVoucher.saleEndDateRaw || !editingVoucher.quantity) {
                  toast.error(t('toast.voucher.missing_fields') || 'Vui lòng điền đầy đủ các trường bắt buộc!');
                  return;
                }

                if (editingVoucher.salePrice >= editingVoucher.originalPrice) {
                  toast.error(t('toast.voucher.price_error') || 'Giá bán phải nhỏ hơn giá gốc!');
                  return;
                }

                if (new Date(editingVoucher.validEndDateRaw) < new Date(editingVoucher.validStartDateRaw)) {
                  toast.error(t('toast.voucher.date_error') || 'Ngày kết thúc sử dụng phải lớn hơn hoặc bằng ngày bắt đầu!');
                  return;
                }
                
                if (new Date(editingVoucher.saleEndDateRaw) < new Date(editingVoucher.saleStartDateRaw)) {
                  toast.error(t('toast.voucher.date_error') || 'Ngày kết thúc bán phải lớn hơn hoặc bằng ngày bắt đầu bán!');
                  return;
                }

                const executeSave = async () => {
                  try {
                    const partnerId = localStorage.getItem('partnerId') || '1';

                    let backendStatus = 'DRAFT';
                    if (editingVoucher.status === 'active') backendStatus = 'ACTIVE';
                    if (editingVoucher.status === 'paused') backendStatus = 'DRAFT';
                    if (editingVoucher.status === 'pending') backendStatus = 'PENDING_APPROVAL';
                    if (editingVoucher.status === 'rejected') backendStatus = 'REJECTED';

                    const categoryObj = voucherCategories.find(c => editingVoucher.categories && editingVoucher.categories.includes(c.name));

                    const payload = {
                      name: editingVoucher.name,
                      categoryId: categoryObj ? categoryObj.id : editingVoucher.categoryId,
                      partnerId: parseInt(partnerId, 10),
                      description: editingVoucher.description,
                      terms: editingVoucher.terms,
                      originalPrice: editingVoucher.originalPrice,
                      salePrice: editingVoucher.salePrice,
                      quantity: editingVoucher.quantity,
                      saleStartDate: editingVoucher.saleStartDateRaw,
                      saleEndDate: editingVoucher.saleEndDateRaw,
                      validStartDate: editingVoucher.validStartDateRaw,
                      validEndDate: editingVoucher.validEndDateRaw,
                      status: backendStatus,
                      refundPolicy: editingVoucher.refundPolicy,
                      usageInstructions: editingVoucher.usageInstructions,
                      imageUrl: editImages.length > 0 ? editImages.map(img => img.url.replace('http://localhost:5000', '')).join(',') : null
                    };

                    await api.put(`/vouchers/${editingVoucher.id}`, payload);

                    setVouchers(prev => prev.map(v => v.id === editingVoucher.id ? {
                      ...v,
                      name: editingVoucher.name!,
                      originalPrice: editingVoucher.originalPrice!,
                      salePrice: editingVoucher.salePrice!,
                      quantity: editingVoucher.quantity!,
                      status: editingVoucher.status === 'paused' ? 'draft' : editingVoucher.status!,
                      categoryId: editingVoucher.categoryId,
                      validStartDateRaw: editingVoucher.validStartDateRaw,
                      validEndDateRaw: editingVoucher.validEndDateRaw,
                      validFrom: new Date(editingVoucher.validStartDateRaw!).toLocaleDateString('vi-VN'),
                      validTo: new Date(editingVoucher.validEndDateRaw!).toLocaleDateString('vi-VN'),
                      description: editingVoucher.description,
                      terms: editingVoucher.terms,
                      refundPolicy: editingVoucher.refundPolicy,
                      usageInstructions: editingVoucher.usageInstructions,
                      imageUrl: editingVoucher.imageUrl
                    } : v));
                    setEditDialogOpen(false);
                    fetchVouchers(); // Refresh
                    toast.success(t('toast.voucher.update_success') || 'Cập nhật Voucher thành công!');
                  } catch (err: any) {
                    console.error(err);
                    toast.error(err.response?.data?.message ? t(err.response.data.message as string) : t('toast.voucher.update_failed') || 'Cập nhật thất bại. Vui lòng kiểm tra lại thông tin!');
                  }
                };

                if (editingVoucher.status === 'paused') {
                  setConfirmModalState({
                    isOpen: true,
                    title: t('partner.vouchers.save_changes') || 'Lưu thay đổi',
                    description: t('partner.vouchers.save_paused_warn') || 'Lưu thay đổi sẽ khiến voucher này bị chuyển về trạng thái Bản nháp và bạn sẽ phải Gửi duyệt lại. Bạn có chắc chắn muốn tiếp tục không?',
                    onConfirm: executeSave
                  });
                } else {
                  await executeSave();
                }
              }}>{t('profile.save')}</Button>
            )}
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
                  setVouchers(prev => prev.map(v => v.id === selectedVoucher.id ? { ...v, status: 'deleted' } : v));
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
        onClose={() => setConfirmModalState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModalState.onConfirm}
        title={confirmModalState.title}
        description={confirmModalState.description}
      />
    </div>
  );
}
