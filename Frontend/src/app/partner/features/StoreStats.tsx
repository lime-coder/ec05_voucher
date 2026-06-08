import { useState, useEffect } from 'react';
import { Store, MapPin, Phone, Ticket, DollarSign, ArrowRightLeft, TrendingUp } from 'lucide-react';
import { useLanguage } from '../../shared/contexts/LanguageContext';
import {
  Button,
  Badge,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@voucherhub/ui';
import api from '../../../lib/api';

interface UsedVoucher {
  voucherId: number;
  name: string;
  category: string;
  limitCount: number;
  usedCount: number;
  salePrice: number;
}

interface BranchStat {
  branchId: number;
  branchName: string;
  address: string;
  phone: string;
  vouchers: UsedVoucher[];
  totalVouchersCount: number;
  totalUsed: number;
  totalRevenue: number;
}

interface Partner {
  id: number;
  name: string;
  category: string;
}

export default function StoreStats() {
  const { language } = useLanguage();
  const tText = (en: string, vi: string) => (language === 'vi' ? vi : en);

  const selectedPartnerId = localStorage.getItem('partnerId') || '1';
  const [branchStats, setBranchStats] = useState<BranchStat[]>([]);
  const [loading, setLoading] = useState(false);

  // Load branch stats for current partner
  useEffect(() => {
    if (!selectedPartnerId) return;

    let isActive = true;
    setLoading(true);
    api.get(`/partners/${selectedPartnerId}/branch-stats?t=${Date.now()}`)
      .then((res: any) => res.data)
      .then((data: any) => {
        if (isActive && Array.isArray(data)) {
          setBranchStats(data);
        }
      })
      .catch((err: any) => {
        console.error('Fetch branch stats error:', err);
      })
      .finally(() => {
        if (isActive) setLoading(false);
      });
    return () => {
      isActive = false;
    };
  }, [selectedPartnerId]);

  // Aggregate statistics
  const totalBranches = branchStats.length;
  const totalVouchersUsed = branchStats.reduce((sum, b) => sum + b.totalUsed, 0);
  const totalRevenue = branchStats.reduce((sum, b) => sum + b.totalRevenue, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">{tText('Store Statistics', 'Thống kê cửa hàng')}</h1>
        <p className="text-gray-500">{tText('View detailed voucher usage and revenue for each of your stores', 'Xem chi tiết lượt dùng voucher và doanh thu của từng cửa hàng')}</p>
      </div>

      {/* Aggregate metrics */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="p-3.5 bg-blue-50 rounded-lg text-blue-600">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{tText('Total Branches', 'Tổng số chi nhánh')}</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{totalBranches}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="p-3.5 bg-green-50 rounded-lg text-green-600">
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{tText('Vouchers Used', 'Voucher đã dùng')}</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{totalVouchersUsed}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="p-3.5 bg-purple-50 rounded-lg text-purple-600">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{tText('Accumulated Revenue', 'Doanh thu tích lũy')}</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{totalRevenue.toLocaleString('vi-VN')}₫</h3>
            </div>
          </div>
        </div>
      )}

      {/* Detailed branch usage grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-medium">{tText('Loading statistics...', 'Đang tải thống kê...')}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {branchStats.map(branch => (
            <div key={branch.branchId} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              {/* Branch Header Details */}
              <div className="bg-gray-50/50 p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Store className="w-5 h-5 text-primary" />
                    <h3 className="text-base font-bold text-gray-900">{branch.branchName}</h3>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 shrink-0 text-gray-400" />
                      {branch.address}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-4 h-4 shrink-0 text-gray-400" />
                      {branch.phone}
                    </span>
                  </div>
                </div>
                {/* Branch Summary Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="bg-purple-50/50 text-purple-700 border-purple-100 font-semibold py-1 px-3 shadow-none">
                    {tText(`${branch.totalVouchersCount || 0} vouchers`, `${branch.totalVouchersCount || 0} loại voucher có`)}
                  </Badge>
                  <Badge variant="outline" className="bg-blue-50/50 text-blue-700 border-blue-100 font-semibold py-1 px-3 shadow-none">
                    {tText(`${branch.totalUsed} used`, `${branch.totalUsed} lượt dùng`)}
                  </Badge>
                  <Badge variant="outline" className="bg-green-50/50 text-green-700 border-green-100 font-semibold py-1 px-3 shadow-none">
                    {tText(`Revenue: ${branch.totalRevenue.toLocaleString('vi-VN')}₫`, `Doanh thu: ${branch.totalRevenue.toLocaleString('vi-VN')}₫`)}
                  </Badge>
                </div>
              </div>

              {/* Vouchers Usage Breakdown Table */}
              <div className="p-6">
                {branch.vouchers.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50/50">
                          <TableHead className="font-semibold text-gray-700">{tText('Voucher Name', 'Tên Voucher')}</TableHead>
                          <TableHead className="font-semibold text-gray-700">{tText('Category', 'Danh mục')}</TableHead>
                          <TableHead className="font-semibold text-gray-700 text-center">{tText('Price', 'Đơn giá')}</TableHead>
                          <TableHead className="font-semibold text-gray-700 text-center">{tText('Total Allowed', 'Số lượng cấp')}</TableHead>
                          <TableHead className="font-semibold text-gray-700 text-center">{tText('Quantity Used', 'Số lượng đã dùng')}</TableHead>
                          <TableHead className="font-semibold text-gray-700 text-right">{tText('Total Value', 'Thành tiền')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {branch.vouchers.map(v => (
                          <TableRow key={v.voucherId} className="hover:bg-gray-50/30 transition-colors">
                            <TableCell className="font-medium text-gray-900 max-w-xs">{v.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-normal border-gray-200 text-gray-600 shadow-none">
                                {v.category}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center font-medium text-gray-900">{v.salePrice.toLocaleString('vi-VN')}₫</TableCell>
                            <TableCell className="text-center font-medium text-gray-500">{v.limitCount}</TableCell>
                            <TableCell className="text-center">
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                                {v.usedCount}
                              </span>
                            </TableCell>
                            <TableCell className="text-right font-bold text-green-600">
                              {(v.usedCount * v.salePrice).toLocaleString('vi-VN')}₫
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 border border-dashed rounded-lg bg-gray-50/50">
                    <Ticket className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm font-medium">{tText('No vouchers used at this branch yet', 'Chưa có lượt sử dụng voucher nào tại chi nhánh này')}</p>
                  </div>
                )}
              </div>
            </div>
          ))}

          {branchStats.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
              <Store className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <h3 className="text-base font-bold text-gray-900 mb-1">{tText('No Branches Found', 'Không tìm thấy chi nhánh nào')}</h3>
              <p className="text-sm">{tText('This partner does not have any branches registered in the system.', 'Đối tác này chưa đăng ký chi nhánh nào trên hệ thống.')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
