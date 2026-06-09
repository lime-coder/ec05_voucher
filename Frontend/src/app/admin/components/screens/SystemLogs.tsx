import { useState, useEffect } from 'react';
import { Search, Download, Loader2 } from 'lucide-react';
import api from '../../../../lib/api';
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
} from '@voucherhub/ui';

const mapLogActionToEnglish = (action: string) => {
  if (!action) return '';
  if (action.includes('Khóa tài khoản')) return 'Lock Account';
  if (action.includes('Mở khóa tài khoản')) return 'Unlock Account';
  if (action.includes('Thêm đối tác')) return 'Add Partner';
  if (action.includes('Cập nhật đối tác')) return 'Update Partner';
  if (action.includes('Xóa đối tác')) return 'Delete Partner';
  if (action.includes('Phê duyệt đối tác')) return 'Approve Partner';
  if (action.includes('Từ chối đối tác')) return 'Reject Partner';
  if (action.includes('Phê duyệt voucher')) return 'Approve Voucher';
  if (action.includes('Từ chối voucher')) return 'Reject Voucher';
  if (action.includes('Cập nhật đơn hàng')) return action.replace('Cập nhật đơn hàng', 'Update Order');
  if (action.includes('Đăng nhập hệ thống')) return 'System Login';
  if (action.includes('Kích hoạt tài khoản')) return 'Activate Account';
  if (action.includes('Hoàn tiền đơn hàng')) return 'Refund Order';
  if (action.includes('Thêm danh mục')) return 'Add Category';
  if (action.includes('Cập nhật danh mục')) return 'Update Category';
  if (action.includes('Xóa danh mục')) return 'Delete Category';
  if (action.includes('Cập nhật banner')) return 'Update Banner';
  if (action.includes('Xóa banner')) return 'Delete Banner';
  return action;
};

const parseViDate = (timeStr: string): Date | null => {
  if (!timeStr) return null;
  const regex = /(\d{1,2})\/(\d{1,2})\/(\d{4})/;
  const match = timeStr.match(regex);
  if (match) {
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const year = parseInt(match[3], 10);
    return new Date(year, month, day);
  }
  const d = new Date(timeStr);
  return isNaN(d.getTime()) ? null : d;
};

export function SystemLogs() {
  const { language } = useLanguage();
  const tText = (en: string, vi: string) => (language === 'vi' ? vi : en);

  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, searchTerm]);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      // Backend filtering is supported, so we pass the params
      const response = await api.get('/logs', {
        params: { search: searchTerm, action: actionFilter }
      });
      const responseData = response.data;
      // Handle the new API format { data: [...], pagination: {...} }
      if (responseData && Array.isArray(responseData.data)) {
        setLogs(responseData.data);
      } else if (Array.isArray(responseData)) {
        setLogs(responseData);
      } else {
        console.error('Expected array from /logs, got:', responseData);
        setLogs([]);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      setLogs([]); // Reset to empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const processedLogs = logs.map(log => ({
    ...log,
    englishAction: mapLogActionToEnglish(log.action || log.HanhDong || ''),
    englishStatus: (log.status || log.TrangThai) === 'Thành công' ? 'Success' :
                   (log.status || log.TrangThai) === 'Thất bại' ? 'Failed' : (log.status || log.TrangThai)
  }));

  const filteredLogs = processedLogs.filter((log) => {
    const actionStr = log.action || log.HanhDong || '';
    const targetStr = log.target || log.DoiTuong || log.ChiTiet || '';
    let userStr = log.user || 'Hệ thống';
    if (log.TenDangNhap && log.IDTaiKhoan) {
      userStr = `${log.TenDangNhap} [${log.IDTaiKhoan}]`;
    } else if (log.IDTaiKhoan) {
      userStr = `Tài khoản #${log.IDTaiKhoan}`;
    }
    const timeStr = log.time || log.ThoiGian || '';

    const matchesSearch =
      actionStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.englishAction.toLowerCase().includes(searchTerm.toLowerCase()) ||
      targetStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userStr.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesAction = actionFilter === 'all';
    if (actionFilter === 'approve' && (log.englishAction.toLowerCase().includes('approve') || actionStr.toLowerCase().includes('phê duyệt'))) matchesAction = true;
    if (actionFilter === 'reject' && (log.englishAction.toLowerCase().includes('reject') || actionStr.toLowerCase().includes('từ chối'))) matchesAction = true;
    if (actionFilter === 'lock' && (log.englishAction.toLowerCase().includes('lock') || actionStr.toLowerCase().includes('khóa'))) matchesAction = true;
    if (actionFilter === 'update' && (log.englishAction.toLowerCase().includes('update') || actionStr.toLowerCase().includes('cập nhật'))) matchesAction = true;
    if (actionFilter === 'delete' && (log.englishAction.toLowerCase().includes('delete') || actionStr.toLowerCase().includes('xóa'))) matchesAction = true;

    let matchesDate = true;
    if (dateFilter) {
      const logDate = parseViDate(timeStr);
      if (logDate) {
        const [year, month, day] = dateFilter.split('-').map(num => parseInt(num, 10));
        matchesDate = logDate.getFullYear() === year &&
                      logDate.getMonth() === (month - 1) &&
                      logDate.getDate() === day;
      } else {
        matchesDate = false;
      }
    }

    return matchesSearch && matchesAction && matchesDate;
  });

  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);
  const currentLogs = filteredLogs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
  };

  const handleExportReport = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (filteredLogs.length === 0) {
      toast.error(tText("No data to export!", "Không có dữ liệu để xuất!"));
      return;
    }

    const headers = [
      tText("No.", "STT"),
      tText("User", "Người dùng"),
      tText("Privilege", "Vai trò"),
      tText("Action", "Hành động"),
      tText("Target", "Đối tượng"),
      tText("Time", "Thời gian"),
      tText("Status", "Trạng thái")
    ];

    const rows = filteredLogs.map((log, index) => {
      const actionStr = log.action || log.HanhDong || '';
      const targetStr = log.target || log.DoiTuong || log.ChiTiet || '-';
      let userStr = log.user || 'Hệ thống';
      if (log.TenDangNhap && log.IDTaiKhoan) {
        userStr = `${log.TenDangNhap} [${log.IDTaiKhoan}]`;
      } else if (log.IDTaiKhoan) {
        userStr = `Tài khoản #${log.IDTaiKhoan}`;
      }

      const privilegeMap: Record<string, {en: string, vi: string}> = {
        'admin': {en: 'Admin', vi: 'Quản trị viên'},
        'partner': {en: 'Partner', vi: 'Đối tác'},
        'customer': {en: 'Customer', vi: 'Khách hàng'},
        'unknown': {en: 'Unknown', vi: 'Không rõ'}
      };
      const priv = privilegeMap[log.VaiTro] || privilegeMap['unknown'];
      const privilegeStr = tText(priv.en, priv.vi);

      const timeStr = log.time || log.ThoiGian || '';
      const statusStr = log.status || log.TrangThai || 'Thành công';

      return [
        index + 1,
        userStr,
        privilegeStr,
        tText(log.englishAction, actionStr),
        targetStr,
        formatDate(timeStr) || timeStr,
        tText(log.englishStatus, statusStr)
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `system_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(tText("Report exported successfully!", "Xuất báo cáo thành công!"));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4">
        <div className="flex gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder={tText("Search action, target or user...", "Tìm kiếm hành động, đối tượng hoặc người dùng...")}
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="pl-10 bg-white shadow-sm border-gray-200"
            />
          </div>
          <select
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setCurrentPage(1); }}
            className="h-10 py-0 pl-4 pr-8 border border-gray-200 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none bg-[length:16px_16px] bg-[position:right_8px_center] bg-no-repeat cursor-pointer"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")` }}
          >
            <option value="all">{tText("All Actions", "Tất cả hành động")}</option>
            <option value="approve">{tText("Approve", "Phê duyệt")}</option>
            <option value="reject">{tText("Reject", "Từ chối")}</option>
            <option value="lock">{tText("Lock/Unlock", "Khóa/Kích hoạt")}</option>
            <option value="update">{tText("Update", "Cập nhật")}</option>
            <option value="delete">{tText("Delete", "Xóa")}</option>
          </select>
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
            className="w-auto bg-white shadow-sm border-gray-200"
          />
        </div>
        <Button onClick={handleExportReport} className="gap-2">
          <Download className="w-4 h-4" />
          {tText("Export Report", "Xuất báo cáo")}
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead>{tText("No.", "STT")}</TableHead>
              <TableHead>{tText("User", "Người dùng")}</TableHead>
              <TableHead>{tText("Privilege", "Vai trò")}</TableHead>
              <TableHead>{tText("Action", "Hành động")}</TableHead>
              <TableHead>{tText("Target", "Đối tượng")}</TableHead>
              <TableHead>{tText("Time", "Thời gian")}</TableHead>
              <TableHead>{tText("Status", "Trạng thái")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                </TableCell>
              </TableRow>
            ) : currentLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-gray-500">
                  {tText("No activity logs found.", "Chưa có nhật ký hoạt động nào.")}
                </TableCell>
              </TableRow>
            ) : (
              currentLogs.map((log, index) => {
                const actionStr = log.action || log.HanhDong || '';
                const targetStr = log.target || log.DoiTuong || log.ChiTiet || '-';
                let userStr = log.user || 'Hệ thống';
                if (log.TenDangNhap && log.IDTaiKhoan) {
                  userStr = `${log.TenDangNhap} [${log.IDTaiKhoan}]`;
                } else if (log.IDTaiKhoan) {
                  userStr = `Tài khoản #${log.IDTaiKhoan}`;
                }

                const privilegeMap: Record<string, {en: string, vi: string}> = {
                  'admin': {en: 'Admin', vi: 'Quản trị viên'},
                  'partner': {en: 'Partner', vi: 'Đối tác'},
                  'customer': {en: 'Customer', vi: 'Khách hàng'},
                  'unknown': {en: 'Unknown', vi: 'Không rõ'}
                };
                const priv = privilegeMap[log.VaiTro] || privilegeMap['unknown'];
                const privilegeStr = tText(priv.en, priv.vi);

                const timeStr = log.time || log.ThoiGian || '';
                const statusStr = log.status || log.TrangThai || 'Thành công';

                return (
                  <TableRow key={log.MaLog || log.id || index} className="hover:bg-gray-50/50">
                    <TableCell className="text-gray-500">
                      {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                    </TableCell>
                    <TableCell className="text-gray-700">{userStr}</TableCell>
                    <TableCell className="text-gray-700">
                      <Badge 
                        className={`whitespace-nowrap shadow-none border-transparent ${
                          log.VaiTro === 'admin' ? 'bg-purple-100 text-purple-700 hover:bg-purple-100' :
                          log.VaiTro === 'partner' ? 'bg-blue-100 text-blue-700 hover:bg-blue-100' :
                          'bg-gray-100 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {privilegeStr}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">
                      {tText(log.englishAction, actionStr)}
                    </TableCell>
                    <TableCell className="text-gray-700">{targetStr}</TableCell>
                    <TableCell className="text-gray-500">{formatDate(timeStr) || timeStr}</TableCell>
                    <TableCell>
                      <Badge variant="default" className={
                        (log.englishStatus === 'Failed' || statusStr === 'Thất bại')
                          ? "bg-red-100 text-red-700 hover:bg-red-100 shadow-none border-transparent"
                          : "bg-green-100 text-green-700 hover:bg-green-100 shadow-none border-transparent"
                      }>
                        {tText(log.englishStatus, statusStr)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-gray-500">
            {tText(
              `Showing ${(currentPage - 1) * ITEMS_PER_PAGE + 1} to ${Math.min(currentPage * ITEMS_PER_PAGE, filteredLogs.length)} of ${filteredLogs.length} entries`,
              `Đang hiển thị ${(currentPage - 1) * ITEMS_PER_PAGE + 1} đến ${Math.min(currentPage * ITEMS_PER_PAGE, filteredLogs.length)} trong số ${filteredLogs.length} mục`
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              {tText("Previous", "Trước")}
            </Button>
            <div className="text-sm font-medium">
              {currentPage} / {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              {tText("Next", "Tiếp")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

