import { useState, useEffect } from 'react';
import { Search, Eye, Lock, Unlock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '../../../shared/contexts/LanguageContext';
import {
  Button, Badge, Input, Table, TableHeader, TableRow, TableHead,
  TableBody, TableCell, Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from '@voucherhub/ui';
import api from '../../../../lib/api';

export function UserManagement() {
  const { language } = useLanguage();
  const t = (en: string, vi: string) => (language === 'vi' ? vi : en);

  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal khóa
  const [showLockModal, setShowLockModal] = useState(false);
  const [lockReason, setLockReason] = useState('');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  // Modal cảnh báo partner PENDING
  const [showWarningModal, setShowWarningModal] = useState(false);

  // Modal xem chi tiết
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchUsers = () => {
    api.get(`/admin/users?t=${Date.now()}`)
      .then(r => r.data)
      .then(data => {
        if (Array.isArray(data)) setUsers(data);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => { fetchUsers(); }, []);

  const filteredUsers = users.filter(u => {
    const matchSearch = (u.name || '').toLowerCase().includes(searchTerm.toLowerCase())
      || (u.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all'
      || (statusFilter === 'active' && u.status === 'ACTIVE')
      || (statusFilter === 'inactive' && u.status === 'INACTIVE')
      || (statusFilter === 'pending' && u.status === 'PENDING');
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const currentUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleLockClick = (user: any) => {
    // Chặn khóa partner đang PENDING → hiện warning modal thay vì lock modal
    if (user.accountType === 'Partner' && user.partnerStatus === 'PENDING') {
      setSelectedUser(user);
      setShowWarningModal(true);
      return;
    }
    setSelectedUser(user);
    setLockReason('');
    setShowLockModal(true);
  };

  const confirmLock = async () => {
    try {
      await api.patch(`/admin/users/${selectedUser.id}/toggle`, { reason: lockReason });
      toast.success(t(`Locked account: ${selectedUser.name}`, `Đã khóa tài khoản: ${selectedUser.name}`));
      setShowLockModal(false);
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, status: 'INACTIVE' } : u));
    } catch (err: any) {
      toast.error(err.response?.data?.error || t('Failed!', 'Thất bại!'));
    }
  };

  const handleUnlock = async (user: any) => {
    try {
      await api.patch(`/admin/users/${user.id}/toggle`);
      toast.success(t(`Unlocked: ${user.name}`, `Đã mở khóa: ${user.name}`));
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: 'ACTIVE' } : u));
    } catch (err: any) {
      toast.error(err.response?.data?.error || t('Failed!', 'Thất bại!'));
    }
  };

  const statusBadge = (status: string) => {
    if (status === 'ACTIVE') return <Badge className="bg-green-100 text-green-700 shadow-none border-transparent">{t('Active', 'Hoạt động')}</Badge>;
    if (status === 'INACTIVE') return <Badge className="bg-red-100 text-red-700 shadow-none border-transparent">{t('Locked', 'Bị khóa')}</Badge>;
    return <Badge className="bg-yellow-100 text-yellow-800 shadow-none border-transparent">{t('Pending', 'Chờ duyệt')}</Badge>;
  };

  const accountTypeBadge = (type: string) => {
    if (type === 'Admin') return <Badge className="bg-purple-100 text-purple-700 shadow-none border-transparent">Admin</Badge>;
    if (type === 'Partner') return <Badge className="bg-blue-100 text-blue-700 shadow-none border-transparent">{t('Partner', 'Đối tác')}</Badge>;
    return <Badge className="bg-gray-100 text-gray-600 shadow-none border-transparent">{t('Customer', 'Khách hàng')}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Search + Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <Input value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            placeholder={t('Search by name or email...', 'Tìm kiếm theo tên hoặc email...')}
            className="pl-10 bg-white shadow-sm border-gray-200" />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          className="h-10 pl-4 pr-8 border border-gray-200 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary">
          <option value="all">{t('All Statuses', 'Tất cả trạng thái')}</option>
          <option value="active">{t('Active', 'Hoạt động')}</option>
          <option value="inactive">{t('Locked', 'Bị khóa')}</option>
          <option value="pending">{t('Pending', 'Chờ duyệt')}</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead>{t('No.', 'STT')}</TableHead>
              <TableHead>{t('Name', 'Họ tên')}</TableHead>
              <TableHead>{t('Username', 'Tên đăng nhập')}</TableHead>
              <TableHead>{t('Email', 'Email')}</TableHead>
              <TableHead>{t('Phone', 'SĐT')}</TableHead>
              <TableHead>{t('Account Type', 'Loại tài khoản')}</TableHead>
              <TableHead>{t('Status', 'Trạng thái')}</TableHead>
              <TableHead className="text-right">{t('Actions', 'Hành động')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentUsers.map((user, idx) => (
              <TableRow key={user.id} className="hover:bg-gray-50/50">
                <TableCell className="text-gray-500">{(currentPage - 1) * itemsPerPage + idx + 1}</TableCell>
                <TableCell className="font-medium text-gray-900">{user.name}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone || t('N/A', 'Chưa cung cấp')}</TableCell>
                {/* Loại tài khoản */}
                <TableCell>{accountTypeBadge(user.accountType)}</TableCell>
                <TableCell>{statusBadge(user.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button onClick={() => { setSelectedUser(user); setShowDetailModal(true); }}
                      variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50">
                      <Eye className="w-4 h-4" />
                    </Button>
                    {user.status === 'ACTIVE' && (
                      <Button onClick={() => handleLockClick(user)} variant="ghost" size="icon"
                        className="h-8 w-8 text-red-600 hover:bg-red-50">
                        <Lock className="w-4 h-4" />
                      </Button>
                    )}
                    {user.status === 'INACTIVE' && (
                      <Button onClick={() => handleUnlock(user)} variant="ghost" size="icon"
                        className="h-8 w-8 text-green-600 hover:bg-green-50">
                        <Unlock className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {currentUsers.length === 0 && (
              <TableRow><TableCell colSpan={8} className="text-center py-6 text-gray-500">{t('No users found.', 'Không tìm thấy người dùng.')}</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t flex items-center justify-between">
            <span className="text-sm text-gray-500">{t(`${(currentPage - 1) * itemsPerPage + 1}–${Math.min(currentPage * itemsPerPage, filteredUsers.length)} of ${filteredUsers.length}`, `${(currentPage - 1) * itemsPerPage + 1}–${Math.min(currentPage * itemsPerPage, filteredUsers.length)} trên ${filteredUsers.length}`)}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>{t('Previous', 'Trước')}</Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>{t('Next', 'Sau')}</Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal khóa tài khoản */}
      <Dialog open={showLockModal} onOpenChange={setShowLockModal}>
        <DialogContent>
          <DialogHeader><DialogTitle className="text-primary">{t('Confirm Account Lock', 'Xác nhận khóa tài khoản')}</DialogTitle></DialogHeader>
          <div className="py-4">
            <p className="text-gray-700 mb-4">{t('Lock account of', 'Khóa tài khoản của')} <strong>{selectedUser?.name}</strong>?</p>

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLockModal(false)}>{t('Cancel', 'Hủy')}</Button>
            <Button variant="destructive" onClick={confirmLock}>{t('Confirm Lock', 'Xác nhận khóa')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal cảnh báo partner PENDING */}
      <Dialog open={showWarningModal} onOpenChange={setShowWarningModal}>
        <DialogContent>
          <DialogHeader><DialogTitle className="text-orange-500 flex items-center gap-2"><AlertTriangle className="w-5 h-5" />{t('Cannot Lock Account', 'Không thể khóa tài khoản')}</DialogTitle></DialogHeader>
          <div className="py-4">
            <p className="text-gray-700">
              {t(
                `Account "${selectedUser?.name}" belongs to a Partner currently in PENDING status. Please process the partner approval first before locking.`,
                `Tài khoản "${selectedUser?.name}" thuộc về Đối tác đang ở trạng thái Chờ duyệt (PENDING). Vui lòng xử lý phê duyệt đối tác trước khi thực hiện khóa.`
              )}
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowWarningModal(false)}>{t('Understood', 'Đã hiểu')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal xem chi tiết */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="text-primary">{t('User Details', 'Chi tiết người dùng')}</DialogTitle></DialogHeader>
          {selectedUser && (
            <div className="py-4 space-y-3 text-sm">
              {[
                [t('Full Name', 'Họ và tên'), selectedUser.name],
                [t('Username', 'Tên đăng nhập'), selectedUser.username],
                ['Email', selectedUser.email],
                [t('Phone', 'Số điện thoại'), selectedUser.phone || t('N/A', 'Chưa cung cấp')],
                [t('Account Type', 'Loại tài khoản'), selectedUser.accountType],
                [t('Registration Date', 'Ngày đăng ký'), selectedUser.date],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between border-b pb-2">
                  <span className="text-gray-500 font-medium">{label}:</span>
                  <span className="font-semibold text-gray-900">{value}</span>
                </div>
              ))}
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500 font-medium">{t('Status', 'Trạng thái')}:</span>
                {statusBadge(selectedUser.status)}
              </div>
            </div>
          )}
          <DialogFooter><Button className="w-full" onClick={() => setShowDetailModal(false)}>{t('Close', 'Đóng')}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
