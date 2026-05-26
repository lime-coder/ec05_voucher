import { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Store,
} from 'lucide-react';
import { branches } from '../data/mockData';

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

export default function BranchManagement() {
  const { t } = useLanguage();
  const [openDialog, setOpenDialog] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<any>(null);

  const handleEdit = (branch: any) => {
    setSelectedBranch(branch);
    setEditDialogOpen(true);
  };

  const handleDelete = (branch: any) => {
    setSelectedBranch(branch);
    setDeleteDialogOpen(true);
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
          <Button onClick={() => setOpenDialog(true)} className="gap-2">
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
                <TableHead>{t('partner.branch.col_status')}</TableHead>
                <TableHead className="text-right">{t('partner.branch.col_actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {branches.map((branch) => (
                <TableRow key={branch.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-primary" />
                      <span className="font-semibold">{branch.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{branch.address}</TableCell>
                  <TableCell>{branch.phone}</TableCell>
                  <TableCell>
                    <Badge
                      variant={branch.status === 'active' ? 'default' : 'secondary'}
                      className={branch.status === 'active' ? 'bg-green-100 text-green-700 hover:bg-green-100 shadow-none' : 'shadow-none'}
                    >
                      {branch.status === 'active' ? t('partner.branch.status_active') : t('partner.branch.status_inactive')}
                    </Badge>
                  </TableCell>
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
                        onClick={() => handleDelete(branch)}
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

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t('partner.branch.add_title')}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('partner.branch.name_label')}</label>
              <Input placeholder={t('partner.branch.name_ph')} />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('partner.branch.address_label')}</label>
              <textarea 
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder={t('partner.branch.address_ph')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('partner.branch.phone_label')}</label>
                <Input placeholder={t('partner.branch.phone_ph')} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('partner.branch.email_label')}</label>
                <Input placeholder={t('partner.branch.email_ph')} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              {t('partner.branch.cancel')}
            </Button>
            <Button onClick={() => setOpenDialog(false)}>
              {t('partner.branch.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t('partner.branch.edit_title')}</DialogTitle>
          </DialogHeader>
          
          {selectedBranch && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('partner.branch.name_label')}</label>
                <Input defaultValue={selectedBranch.name} />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('partner.branch.address_label')}</label>
                <textarea 
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  defaultValue={selectedBranch.address}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('partner.branch.phone_label')}</label>
                  <Input defaultValue={selectedBranch.phone} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('partner.branch.status_label')}</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    defaultValue={selectedBranch.status}
                  >
                    <option value="active">{t('partner.branch.status_active')}</option>
                    <option value="inactive">{t('partner.branch.status_inactive')}</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              {t('partner.branch.cancel')}
            </Button>
            <Button onClick={() => setEditDialogOpen(false)} className="ml-3">
              {t('partner.branch.update')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              {t('partner.branch.delete_confirm')} <span className="font-bold">{selectedBranch?.name}</span>?
            </p>
            <p className="text-sm text-muted-foreground mt-2">{t('partner.branch.delete_warning')}</p>
          </div>
          <DialogFooter className="gap-2 sm:space-x-0">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {t('partner.branch.cancel')}
            </Button>
            <Button className="bg-red-500 hover:bg-red-600 text-white shadow-none" onClick={() => setDeleteDialogOpen(false)}>
              {t('partner.branch.delete_btn')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
