import { useState } from 'react';
import { Search, Eye, Lock, Unlock } from 'lucide-react';
import { toast } from 'sonner';
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

const mockUsers = [
  { id: 1, name: 'Nguyễn Văn A', email: 'nguyenvana@gmail.com', phone: '0901234567', status: 'Hoạt động', date: '15/03/2026' },
  { id: 2, name: 'Trần Thị B', email: 'tranthib@gmail.com', phone: '0912345678', status: 'Hoạt động', date: '12/03/2026' },
  { id: 3, name: 'Lê Văn C', email: 'levanc@gmail.com', phone: '0923456789', status: 'Bị khóa', date: '08/03/2026' },
  { id: 4, name: 'Phạm Thị D', email: 'phamthid@gmail.com', phone: '0934567890', status: 'Hoạt động', date: '05/03/2026' },
  { id: 5, name: 'Hoàng Văn E', email: 'hoangvane@gmail.com', phone: '0945678901', status: 'Hoạt động', date: '02/03/2026' },
  { id: 6, name: 'Vũ Thị F', email: 'vuthif@gmail.com', phone: '0956789012', status: 'Hoạt động', date: '28/02/2026' },
  { id: 7, name: 'Đỗ Văn G', email: 'dovang@gmail.com', phone: '0967890123', status: 'Bị khóa', date: '25/02/2026' },
  { id: 8, name: 'Bùi Thị H', email: 'buithih@gmail.com', phone: '0978901234', status: 'Hoạt động', date: '20/02/2026' },
  { id: 9, name: 'Đinh Văn I', email: 'dinhvani@gmail.com', phone: '0989012345', status: 'Hoạt động', date: '18/02/2026' },
  { id: 10, name: 'Mai Thị K', email: 'maithik@gmail.com', phone: '0990123456', status: 'Hoạt động', date: '15/02/2026' },
];

export function UserManagement() {
  const [users, setUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<typeof mockUsers[0] | null>(null);
  const [lockReason, setLockReason] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const currentUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleLockUser = (user: typeof mockUsers[0]) => {
    setSelectedUser(user);
    setShowModal(true);
    setLockReason('');
  };

  const confirmLockUser = () => {
    if (!lockReason.trim()) {
      toast.error('Vui lòng nhập lý do khóa tài khoản');
      return;
    }

    if (selectedUser) {
      setUsers(
        users.map((u) =>
          u.id === selectedUser.id ? { ...u, status: 'Bị khóa' } : u
        )
      );
      toast.success(`Đã khóa tài khoản ${selectedUser.name}`);
      setShowModal(false);
      setSelectedUser(null);
      setLockReason('');
    }
  };

  const handleUnlockUser = (user: typeof mockUsers[0]) => {
    setUsers(users.map((u) => (u.id === user.id ? { ...u, status: 'Hoạt động' } : u)));
    toast.success(`Đã kích hoạt lại tài khoản ${user.name}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <Input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white shadow-sm border-gray-200"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 py-0 pl-4 pr-8 border border-gray-200 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none bg-[length:16px_16px] bg-[position:right_8px_center] bg-no-repeat cursor-pointer"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")` }}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="Hoạt động">Hoạt động</option>
          <option value="Bị khóa">Bị khóa</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead>STT</TableHead>
              <TableHead>Tên</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>SĐT</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày đăng ký</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
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
                <TableCell>{user.phone}</TableCell>
                <TableCell>
                  <Badge
                    variant={user.status === 'Hoạt động' ? 'default' : 'destructive'}
                    className={
                      user.status === 'Hoạt động'
                        ? 'bg-green-100 text-green-700 hover:bg-green-100 shadow-none border-transparent'
                        : 'bg-red-100 text-red-700 hover:bg-red-100 shadow-none border-transparent'
                    }
                  >
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-500">{user.date}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                      <Eye className="w-4 h-4" />
                    </Button>
                    {user.status === 'Hoạt động' ? (
                      <Button
                        variant="ghost" size="icon"
                        onClick={() => handleLockUser(user)}
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Lock className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost" size="icon"
                        onClick={() => handleUnlockUser(user)}
                        className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <Unlock className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
            <div className="text-sm text-gray-500">
              Hiển thị {(currentPage - 1) * itemsPerPage + 1} -{' '}
              {Math.min(currentPage * itemsPerPage, filteredUsers.length)} / {filteredUsers.length}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Trước
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-primary">Xác nhận khóa tài khoản</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-700 mb-4">
              Bạn có chắc chắn muốn khóa tài khoản <strong>{selectedUser?.name}</strong>?
            </p>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Lý do khóa <span className="text-red-500">*</span>
              </label>
              <textarea
                value={lockReason}
                onChange={(e) => setLockReason(e.target.value)}
                placeholder="Nhập lý do khóa tài khoản..."
                className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-sm"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={confirmLockUser}>
              Xác nhận khóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
