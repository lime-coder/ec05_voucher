import { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Store,
} from 'lucide-react';
import { toast } from 'sonner';

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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@voucherhub/ui';
import { useLanguage } from '../../shared/contexts/LanguageContext';
import api from '../../../lib/api';

export default function BranchManagement() {
  const { t } = useLanguage();
  const [branches, setBranches] = useState<any[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<any>(null);

  // Form states
  const [tenChiNhanh, setTenChiNhanh] = useState('');
  const [sdt, setSdt] = useState('');
  const [diaChi, setDiaChi] = useState('');

  const PARTNER_ID = localStorage.getItem('partnerId') || '1';

  const fetchBranches = async () => {
    try {
      const response = await api.get(`/branches/partner/${PARTNER_ID}`);
      setBranches(response.data);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách chi nhánh', error);
      toast.error(t('toast.branch.fetch_error') || 'Lỗi lấy danh sách chi nhánh');
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const resetForm = () => {
    setTenChiNhanh('');
    setSdt('');
    setDiaChi('');
  };

  const handleOpenAdd = () => {
    resetForm();
    setOpenDialog(true);
  };

  const handleCreate = async () => {
    try {
      await api.post(`/branches/partner/${PARTNER_ID}`, { tenChiNhanh, sdt, diaChi });
      toast.success(t('toast.branch.add_success') || 'Thêm chi nhánh thành công');
      setOpenDialog(false);
      fetchBranches();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('toast.branch.add_error') || 'Lỗi thêm chi nhánh');
    }
  };

  const handleEdit = (branch: any) => {
    setSelectedBranch(branch);
    setTenChiNhanh(branch.TenChiNhanh || '');
    setSdt(branch.SDT_CN || '');
    setDiaChi(branch.DiaChiChiNhanh || '');
    setEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    try {
      await api.put(`/branches/${selectedBranch.MaChiNhanh}`, { tenChiNhanh, sdt, diaChi });
      toast.success(t('toast.branch.update_success') || 'Cập nhật chi nhánh thành công');
      setEditDialogOpen(false);
      fetchBranches();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('toast.branch.update_error') || 'Lỗi cập nhật chi nhánh');
    }
  };

  const handleDeletePrompt = (branch: any) => {
    setSelectedBranch(branch);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/branches/${selectedBranch.MaChiNhanh}`);
      toast.success(t('toast.branch.delete_success') || 'Xóa chi nhánh thành công');
      setDeleteDialogOpen(false);
      fetchBranches();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('toast.branch.delete_error') || 'Lỗi xóa chi nhánh');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">{t('partner.branch.title')}</h1>
        <p className="text-gray-500">{t('partner.branch.subtitle')}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-6">
          <h2 className="text-lg font-bold">{t('partner.branch.list_title')}</h2>
          <Button onClick={handleOpenAdd} className="gap-2">
            <Plus className="w-4 h-4" />
            {t('partner.branch.add_btn')}
          </Button>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead>{t('partner.branch.col_name')}</TableHead>
                <TableHead>{t('partner.branch.col_address')}</TableHead>
                <TableHead>{t('partner.branch.col_phone')}</TableHead>
                <TableHead className="text-right">{t('partner.branch.col_actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {branches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                    {t('partner.branch.empty') || 'Chưa có chi nhánh nào.'}
                  </TableCell>
                </TableRow>
              ) : branches.map((branch) => (
                <TableRow key={branch.MaChiNhanh}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-primary" />
                      <span className="font-semibold">{branch.TenChiNhanh}</span>
                    </div>
                  </TableCell>
                  <TableCell>{branch.DiaChiChiNhanh}</TableCell>
                  <TableCell>{branch.SDT_CN}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEdit(branch)}
                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDeletePrompt(branch)}
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
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

      {/* Dialog Thêm Mới */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t('partner.branch.add_title')}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('partner.branch.name_label')}</label>
              <Input 
                placeholder={t('partner.branch.name_ph')} 
                value={tenChiNhanh}
                onChange={(e) => setTenChiNhanh(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('partner.branch.address_label')}</label>
              <textarea 
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder={t('partner.branch.address_ph')}
                value={diaChi}
                onChange={(e) => setDiaChi(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t('partner.branch.phone_label')}</label>
              <Input 
                placeholder={t('partner.branch.phone_ph')} 
                value={sdt}
                onChange={(e) => setSdt(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              {t('partner.branch.cancel')}
            </Button>
            <Button onClick={handleCreate}>
              {t('partner.branch.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Sửa */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t('partner.branch.edit_title')}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('partner.branch.name_label')}</label>
              <Input 
                value={tenChiNhanh}
                onChange={(e) => setTenChiNhanh(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('partner.branch.address_label')}</label>
              <textarea 
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={diaChi}
                onChange={(e) => setDiaChi(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t('partner.branch.phone_label')}</label>
              <Input 
                value={sdt}
                onChange={(e) => setSdt(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              {t('partner.branch.cancel')}
            </Button>
            <Button onClick={handleUpdate} className="ml-3">
              {t('partner.branch.update')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Xóa */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-500">
              <Trash2 className="w-5 h-5" />
              {t('partner.branch.delete_title')}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              {t('partner.branch.delete_confirm')} <span className="font-bold">{selectedBranch?.TenChiNhanh}</span>?
            </p>
            <p className="text-sm text-muted-foreground mt-2">{t('partner.branch.delete_warning')}</p>
          </div>
          <DialogFooter className="gap-2 sm:space-x-0">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {t('partner.branch.cancel')}
            </Button>
            <Button className="bg-red-500 hover:bg-red-600 text-white shadow-none" onClick={handleDelete}>
              {t('partner.branch.delete_btn')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
