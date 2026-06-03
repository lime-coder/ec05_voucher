import { useState, useEffect } from 'react';
import {
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  PauseCircle,
  PlayCircle,
  Filter,
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

  useEffect(() => {
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
              validFrom: new Date(v.ThoiGianBatDau).toLocaleDateString('vi-VN'),
              validTo: new Date(v.ThoiGianKetThuc).toLocaleDateString('vi-VN'),
            };
          });
          setVouchers(mappedVouchers);
        }
      })
      .catch(console.error);
  }, []);

  const handleViewDetails = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setDetailDialogOpen(true);
  };

  const handleEdit = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setEditDialogOpen(true);
  };

  const handleDelete = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setDeleteDialogOpen(true);
  };

  const filteredVouchers = vouchers.filter((voucher) => {
    const matchesSearch = voucher.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab =
      currentTab === 'all' ||
      (currentTab === 'active' && voucher.status === 'active') ||
      (currentTab === 'pending' && voucher.status === 'pending') ||
      (currentTab === 'paused' && voucher.status === 'paused');
    return matchesSearch && matchesTab;
  });

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
            <Button variant="outline" className="shrink-0 gap-2" onClick={() => alert(t('partner.vouchers.filter') + " - Coming soon")}>
              <Filter className="w-4 h-4" />
              {t('partner.vouchers.filter')}
            </Button>
          </div>

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
                      className={`${
                        voucher.status === 'active'
                          ? 'bg-green-100 text-green-700 hover:bg-green-100'
                          : voucher.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-100'
                      } border-transparent shadow-none`}
                    >
                      {language === 'en' ? (voucher.status === 'active' ? 'Active' : voucher.status === 'pending' ? 'Pending' : 'Paused') : voucherStatusConfig[voucher.status].label}
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
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(voucher)} className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
              <div>
                <p className="text-sm text-gray-500">{t('partner.vouchers.code_label')}</p>
                <p className="font-semibold">{selectedVoucher.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('partner.vouchers.status_label')}</p>
                <Badge
                  className={`mt-1 ${
                    selectedVoucher.status === 'active'
                      ? 'bg-green-100 text-green-700 hover:bg-green-100'
                      : selectedVoucher.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-100'
                  } border-transparent shadow-none`}
                >
                  {language === 'en' ? (selectedVoucher.status === 'active' ? 'Active' : selectedVoucher.status === 'pending' ? 'Pending' : 'Paused') : voucherStatusConfig[selectedVoucher.status].label}
                </Badge>
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm text-gray-500">{t('partner.vouchers.name_label')}</p>
                <p className="font-semibold">{selectedVoucher.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('partner.vouchers.original_price_label')}</p>
                <p>{selectedVoucher.originalPrice.toLocaleString('vi-VN')}₫</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('partner.vouchers.sale_price_label')}</p>
                <p className="font-semibold text-red-500">
                  {selectedVoucher.salePrice.toLocaleString('vi-VN')}₫
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('partner.vouchers.sale_time_label')}</p>
                <p className="text-sm">
                  {selectedVoucher.validFrom} → {selectedVoucher.validTo}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('partner.vouchers.sold_total_label')}</p>
                <p>
                  {selectedVoucher.sold} / {selectedVoucher.quantity}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm text-gray-500">{t('partner.vouchers.category_label')}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedVoucher.categories.map((cat) => (
                    <Badge key={cat} variant="secondary" className="font-normal shadow-none">
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>
              {selectedVoucher.branches && (
                <div className="sm:col-span-2">
                  <p className="text-sm text-gray-500">{t('partner.vouchers.branches_label')}</p>
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
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('partner.vouchers.name_req')}</label>
                <Input defaultValue={selectedVoucher.name} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('partner.vouchers.original_price_req')}</label>
                  <Input type="number" defaultValue={selectedVoucher.originalPrice} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('partner.vouchers.sale_price_req')}</label>
                  <Input type="number" defaultValue={selectedVoucher.salePrice} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('partner.vouchers.total_req')}</label>
                  <Input type="number" defaultValue={selectedVoucher.quantity} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('partner.vouchers.status_label')}</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    defaultValue={selectedVoucher.status}
                  >
                    <option value="active">{t('partner.vouchers.tab_active')}</option>
                    <option value="paused">{t('partner.vouchers.tab_paused')}</option>
                  </select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>{t('common.cancel')}</Button>
            <Button onClick={() => setEditDialogOpen(false)}>{t('profile.save')}</Button>
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
            <Button variant="destructive" onClick={() => setDeleteDialogOpen(false)} className="bg-red-600 hover:bg-red-700 text-white">
              {t('partner.vouchers.delete_title')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
