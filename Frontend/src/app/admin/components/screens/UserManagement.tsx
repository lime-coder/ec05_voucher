import { useState, useEffect } from 'react';
import { Search, Eye, Lock, Unlock } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '../../../shared/contexts/LanguageContext';
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

export function UserManagement() {
  const { language } = useLanguage();
  const tText = (en: string, vi: string) => (language === 'vi' ? vi : en);

  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [lockReason, setLockReason] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchUsers = () => {
    fetch('/api/admin/users')
      .then(res => res.json())
      .then(data => setUsers(Array.isArray(data) ? data : []))
      .catch(err => console.error('Fetch users error:', err));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const nameStr = user.name || '';
    const emailStr = user.email || '';
    const matchesSearch =
      nameStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emailStr.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status in DB: 'ACTIVE', 'LOCKED'
    let statusMatch = statusFilter === 'all';
    if (statusFilter === 'active' && user.status === 'ACTIVE') statusMatch = true;
    if (statusFilter === 'locked' && user.status === 'LOCKED') statusMatch = true;

    return matchesSearch && statusMatch;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const currentUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleViewUser = (user: any) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const handleLockUser = (user: any) => {
    setSelectedUser(user);
    setShowModal(true);
    setLockReason('');
  };

  const confirmLockUser = async () => {
    if (!lockReason.trim()) {
      toast.error(tText('Please enter a reason for locking this account', 'Vui lòng nhập lý do khóa tài khoản'));
      return;
    }

    if (selectedUser) {
      try {
        const res = await fetch(`/api/admin/users/${selectedUser.id}/toggle`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: lockReason })
        });
        
        if (res.ok) {
          toast.success(
            tText(`Locked account for ${selectedUser.name}`, `Đã khóa tài khoản của ${selectedUser.name}`)
          );
          setShowModal(false);
          setSelectedUser(null);
          setLockReason('');
          fetchUsers();
        } else {
          toast.error(tText('Failed to lock account!', 'Khóa tài khoản thất bại!'));
        }
      } catch (err) {
        console.error(err);
        toast.error(tText('An error occurred!', 'Có lỗi xảy ra!'));
      }
    }
  };

  const handleUnlockUser = async (user: any) => {
    try {
      const res = await fetch(`/api/admin/users/${user.id}/toggle`, {
        method: 'PATCH'
      });
      
      if (res.ok) {
        toast.success(
          tText(`Reactivated account for ${user.name}`, `Đã mở khóa tài khoản của ${user.name}`)
        );
        fetchUsers();
      } else {
        toast.error(tText('Failed to unlock account!', 'Mở khóa tài khoản thất bại!'));
      }
    } catch (err) {
      console.error(err);
      toast.error(tText('An error occurred!', 'Có lỗi xảy ra!'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <Input
            type="text"
            placeholder={tText("Search by name or email...", "Tìm kiếm theo tên hoặc email...")}
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="pl-10 bg-white shadow-sm border-gray-200"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          className="h-10 py-0 pl-4 pr-8 border border-gray-200 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none bg-[length:16px_16px] bg-[position:right_8px_center] bg-no-repeat cursor-pointer"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")` }}
        >
          <option value="all">{tText("All Statuses", "Tất cả trạng thái")}</option>
          <option value="active">{tText("Active", "Hoạt động")}</option>
          <option value="locked">{tText("Locked", "Bị khóa")}</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead>{tText("No.", "STT")}</TableHead>
              <TableHead>{tText("Name", "Họ tên")}</TableHead>
              <TableHead>{tText("Email", "Email")}</TableHead>
              <TableHead>{tText("Phone", "Số điện thoại")}</TableHead>
              <TableHead>{tText("Status", "Trạng thái")}</TableHead>
              <TableHead>{tText("Registration Date", "Ngày đăng ký")}</TableHead>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">{tText("Actions", "Hành động")}</th>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentUsers.map((user, index) => (
              <TableRow key={user.id} className="hover:bg-gray-50/50">
                <TableCell className="text-gray-500">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </TableCell>
                <TableCell className="font-medium text-gray-900">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone || tText("Not provided", "Chưa cung cấp")}</TableCell>
                <TableCell>
                  <Badge
                    variant={user.status === 'ACTIVE' ? 'default' : 'destructive'}
                    className={
                      user.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-700 hover:bg-green-100 shadow-none border-transparent'
                        : 'bg-red-100 text-red-700 hover:bg-red-100 shadow-none border-transparent'
                    }
                  >
                    {user.status === 'ACTIVE' ? tText('Active', 'Hoạt động') : tText('Locked', 'Bị khóa')}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-500">{user.date}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button onClick={() => handleViewUser(user)} variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" title={tText("Details", "Chi tiết")}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    {user.status === 'ACTIVE' ? (
                      <Button
                        variant="ghost" size="icon"
                        onClick={() => handleLockUser(user)}
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        title={tText("Lock", "Khóa tài khoản")}
                      >
                        <Lock className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost" size="icon"
                        onClick={() => handleUnlockUser(user)}
                        className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                        title={tText("Unlock", "Mở khóa tài khoản")}
                      >
                        <Unlock className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {currentUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                  {tText("No users found.", "Không tìm thấy người dùng nào.")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
            <div className="text-sm text-gray-500">
              {tText(
                `Showing ${(currentPage - 1) * itemsPerPage + 1} - ${Math.min(currentPage * itemsPerPage, filteredUsers.length)} of ${filteredUsers.length}`,
                `Hiển thị ${(currentPage - 1) * itemsPerPage + 1} - ${Math.min(currentPage * itemsPerPage, filteredUsers.length)} trên ${filteredUsers.length}`
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                {tText("Previous", "Trước")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                {tText("Next", "Sau")}
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-primary">{tText("Confirm Account Lock", "Xác nhận khóa tài khoản")}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-700 mb-4">
              {tText(
                `Are you sure you want to lock the account for `,
                `Bạn có chắc chắn muốn khóa tài khoản của `
              )}
              <strong>{selectedUser?.name}</strong>?
            </p>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {tText("Lock Reason", "Lý do khóa")} <span className="text-red-500">*</span>
              </label>
              <textarea
                value={lockReason}
                onChange={(e) => setLockReason(e.target.value)}
                placeholder={tText("Enter lock reason...", "Nhập lý do khóa...")}
                className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-sm"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              {tText("Cancel", "Hủy")}
            </Button>
            <Button variant="destructive" onClick={confirmLockUser}>
              {tText("Confirm Lock", "Xác nhận khóa")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- View User Details Dialog --- */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-primary text-lg font-bold">
              {tText("User Details", "Chi tiết người dùng")}
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="py-4 space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500 font-medium">{tText("Full Name:", "Họ và tên:")}</span>
                <span className="font-semibold text-gray-900">{selectedUser.name}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500 font-medium">{tText("Email:", "Email:")}</span>
                <span className="text-gray-900">{selectedUser.email}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500 font-medium">{tText("Phone Number:", "Số điện thoại:")}</span>
                <span className="text-gray-900">{selectedUser.phone || tText('Not provided', 'Chưa cung cấp')}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500 font-medium">{tText("Registration Date:", "Ngày đăng ký:")}</span>
                <span className="text-gray-900">{selectedUser.date}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500 font-medium">{tText("Account Status:", "Trạng thái:")}</span>
                <Badge
                  variant={selectedUser.status === 'ACTIVE' ? 'default' : 'destructive'}
                  className={selectedUser.status === 'ACTIVE' ? 'bg-green-100 text-green-700 hover:bg-green-100 shadow-none' : 'bg-red-100 text-red-700 hover:bg-red-100 shadow-none'}
                >
                  {selectedUser.status === 'ACTIVE' ? tText('Active', 'Hoạt động') : tText('Locked', 'Bị khóa')}
                </Badge>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button className="w-full" onClick={() => setShowDetailModal(false)}>{tText("Close", "Đóng")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
