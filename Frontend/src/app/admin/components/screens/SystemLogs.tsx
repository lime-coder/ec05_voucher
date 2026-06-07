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

export function SystemLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
const mapLogActionToEnglish = (action: string) => {
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
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
    fetch('/api/admin/logs')
      .then(res => res.json())
      .then(data => setLogs(Array.isArray(data) ? data : []))
      .catch(err => console.error('Fetch logs error:', err));
  }, []);

  const processedLogs = logs.map(log => ({
    ...log,
    englishAction: mapLogActionToEnglish(log.action),
    englishStatus: log.status === 'Thành công' ? 'Success' : log.status
  }));

  const filteredLogs = processedLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.englishAction.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesAction = actionFilter === 'all';
    if (actionFilter === 'approve' && (log.englishAction.toLowerCase().includes('approve') || log.action.toLowerCase().includes('phê duyệt'))) matchesAction = true;
    if (actionFilter === 'reject' && (log.englishAction.toLowerCase().includes('reject') || log.action.toLowerCase().includes('từ chối'))) matchesAction = true;
    if (actionFilter === 'lock' && (log.englishAction.toLowerCase().includes('lock') || log.action.toLowerCase().includes('khóa'))) matchesAction = true;
    if (actionFilter === 'update' && (log.englishAction.toLowerCase().includes('update') || log.action.toLowerCase().includes('cập nhật'))) matchesAction = true;
    if (actionFilter === 'delete' && (log.englishAction.toLowerCase().includes('delete') || log.action.toLowerCase().includes('xóa'))) matchesAction = true;

    let matchesDate = true;
    if (dateFilter) {
      const logDate = parseViDate(log.time);
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

  const totalPages = Math.ceil(logs.length / itemsPerPage);
  const currentLogs = logs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
  const handleExportReport = () => {
    if (filteredLogs.length === 0) {
      toast.error(tText("No data to export!", "Không có dữ liệu để xuất!"));
      return;
    }

    const headers = [
      tText("No.", "STT"),
      tText("User", "Người dùng"),
      tText("Action", "Hành động"),
      tText("Target", "Đối tượng"),
      tText("Time", "Thời gian"),
      tText("Status", "Trạng thái")
    ];

    const rows = filteredLogs.map((log, index) => [
      index + 1,
      log.user,
      tText(log.englishAction, log.action),
      log.target,
      log.time,
      tText(log.englishStatus, log.status)
    ]);

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
                  Không tìm thấy nhật ký hệ thống nào.
                </TableCell>
              </TableRow>
            ) : (
              currentLogs.map((log, index) => (
                <TableRow key={log.MaLog} className="hover:bg-gray-50/50">
                  <TableCell className="text-gray-500">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </TableCell>
                  <TableCell className="text-gray-700">{log.IDTaiKhoan ? `Tài khoản #${log.IDTaiKhoan}` : 'Hệ thống'}</TableCell>
                  <TableCell className="font-medium text-gray-900">{log.HanhDong}</TableCell>
                  <TableCell className="text-gray-700">{log.DoiTuong || log.ChiTiet || '-'}</TableCell>
                  <TableCell className="text-gray-500 font-mono text-xs">{log.DiaChiIP || '-'}</TableCell>
                  <TableCell className="text-gray-500">{formatDate(log.ThoiGian)}</TableCell>
                  <TableCell>
                    <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-100 shadow-none border-transparent">
                      {log.TrangThai || 'Thành công'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
                <TableCell className="text-gray-700">{log.user}</TableCell>
                <TableCell className="font-medium text-gray-900">
                  {tText(log.englishAction, log.action)}
                </TableCell>
                <TableCell className="text-gray-700">{log.target}</TableCell>
                <TableCell className="text-gray-500">{log.time}</TableCell>
                <TableCell>
                  <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-100 shadow-none border-transparent">
                    {tText(log.englishStatus, log.status)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {currentLogs.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                  {tText("No activity logs found.", "Chưa có nhật ký hoạt động nào.")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
            <div className="text-sm text-gray-500">
              Hiển thị {(currentPage - 1) * itemsPerPage + 1} -{' '}
              {Math.min(currentPage * itemsPerPage, logs.length)} / {logs.length}
              {tText(
                `Showing ${(currentPage - 1) * itemsPerPage + 1} - ${Math.min(currentPage * itemsPerPage, filteredLogs.length)} of ${filteredLogs.length}`,
                `Hiển thị ${(currentPage - 1) * itemsPerPage + 1} - ${Math.min(currentPage * itemsPerPage, filteredLogs.length)} trên ${filteredLogs.length}`
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
    </div>
  );
}
