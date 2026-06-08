import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Handshake, Ticket, CheckCircle, Send, Award } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@voucherhub/ui';
import { useLanguage } from '../../../shared/contexts/LanguageContext';
import api from '../../../../lib/api';

const defaultRevenueData = [
  { date: '14/05', revenue: 45000000 },
  { date: '15/05', revenue: 52000000 },
  { date: '16/05', revenue: 48000000 },
  { date: '17/05', revenue: 61000000 },
  { date: '18/05', revenue: 55000000 },
  { date: '19/05', revenue: 67000000 },
  { date: '20/05', revenue: 72000000 },
];

const defaultTopVouchers = [
  { name: 'Highlands Coffee - 50K Off', nameVi: 'Highlands Coffee - Giảm 50K', sales: 1250 },
  { name: 'CGV - Popcorn Combo', nameVi: 'CGV - Combo bắp nước', sales: 980 },
  { name: 'The Coffee House - Buy 1 Get 1', nameVi: 'The Coffee House - Mua 1 Tặng 1', sales: 850 },
  { name: 'Lotteria - Crispy Chicken Combo', nameVi: 'Lotteria - Combo gà giòn', sales: 720 },
  { name: 'Pizza Hut - 30% Off', nameVi: 'Pizza Hut - Giảm 30%', sales: 650 },
];

const defaultRecentOrders = [
  { id: 'ORD-2401', customer: 'Nguyen Van A', total: '245,000đ', status: 'Đã thanh toán', time: '10:30 - 19/05/2026' },
  { id: 'ORD-2402', customer: 'Tran Thi B', total: '189,000đ', status: 'Chờ thanh toán', time: '10:15 - 19/05/2026' },
  { id: 'ORD-2403', customer: 'Le Van C', total: '320,000đ', status: 'Đã thanh toán', time: '09:45 - 19/05/2026' },
  { id: 'ORD-2404', customer: 'Pham Thi D', total: '156,000đ', status: 'Đã hủy', time: '09:20 - 19/05/2026' },
  { id: 'ORD-2405', customer: 'Hoang Van E', total: '278,000đ', status: 'Đã thanh toán', time: '08:55 - 19/05/2026' },
];

interface KPICardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
  isNeutral?: boolean;
  colorClass: string;
  bgClass: string;
}

function KPICard({ icon, label, value, change, isPositive, isNeutral = false, bgClass }: KPICardProps) {
  return (
    <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${bgClass}`}>
          {icon}
        </div>
      </div>
      <div className="text-xs text-gray-600 mb-1">{label}</div>
      <div className="text-2xl font-bold mb-2 text-primary">{value}</div>
      <div className={`text-xs flex items-center gap-1 ${isNeutral ? 'text-gray-500' : isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {!isNeutral && (isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />)}
        <span>{change}</span>
      </div>
    </div>
  );
}

export function Dashboard() {
  const { language } = useLanguage();
  const tText = (en: string, vi: string) => (language === 'vi' ? vi : en);

  const [timeRange, setTimeRange] = useState<string>('today');
  const [customStartDate, setCustomStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [customEndDate, setCustomEndDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [stats, setStats] = useState<any>(null);

  const fetchStats = () => {
    let url = `/admin/dashboard/stats?range=${timeRange}`;
    if (timeRange === 'custom') {
      url += `&startDate=${customStartDate}&endDate=${customEndDate}`;
    }
    api.get(url)
      .then(res => setStats(res.data))
      .catch(err => console.error('Fetch stats error:', err));
  };

  useEffect(() => {
    fetchStats();
  }, [timeRange, customStartDate, customEndDate]);

  const formatRevenueValue = (val: number | undefined) => {
    if (val === undefined) return '0đ';
    if (val >= 1000000000) return `${(val / 1000000000).toFixed(1)}B`;
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    return val.toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US') + 'đ';
  };

  const getGrowth = (current: number | undefined | null, prev: number | undefined | null) => {
    if (current === undefined || current === null || prev === undefined || prev === null) {
      return { changeText: tText('No previous-period data', 'Chưa có dữ liệu kỳ trước'), isPositive: true, isNeutral: true };
    }
    if (prev === 0) {
      return { changeText: current > 0 ? '+100%' : '0%', isPositive: true, isNeutral: false };
    }
    const diff = current - prev;
    const percent = (diff / prev) * 100;
    const absPercent = Math.abs(percent).toFixed(1);
    const prefix = percent >= 0 ? '+' : '-';
    
    let periodText = '';
    if (timeRange === 'today') periodText = tText('vs yesterday', 'so với hôm qua');
    else if (timeRange === '7days') periodText = tText('vs last week', 'so với tuần trước');
    else if (timeRange === '30days') periodText = tText('vs last month', 'so với tháng trước');
    else periodText = tText('vs last period', 'so với kỳ trước');

    return {
      changeText: `${prefix}${absPercent}% ${periodText}`,
      isPositive: percent >= 0,
      isNeutral: false
    };
  };

  const getGrowthDiff = (current: number | undefined | null, prev: number | undefined | null, labelEn: string, labelVi: string) => {
    if (current === undefined || current === null || prev === undefined || prev === null) {
      return { changeText: tText('No previous-period data', 'Chưa có dữ liệu kỳ trước'), isPositive: true, isNeutral: true };
    }
    const diff = current - prev;
    const absDiff = Math.abs(diff);
    const prefix = diff >= 0 ? '+' : '-';
    return {
      changeText: `${prefix}${absDiff} ${tText(labelEn, labelVi)}`,
      isPositive: diff >= 0,
      isNeutral: false
    };
  };

  const mapStatusToEnglish = (status: string) => {
    if (status === 'PAID') return tText('Paid', 'Đã thanh toán');
    if (status === 'PENDING') return tText('Pending', 'Chờ thanh toán');
    if (status === 'CANCELLED') return tText('Cancelled', 'Đã hủy');
    if (status === 'REFUNDED') return tText('Refunded', 'Đã hoàn tiền');
    return status;
  };

  const revenueData = stats?.doanhThuTheoNgay || defaultRevenueData;
  const topVouchers = (stats?.topVouchers || defaultTopVouchers).map((v: any) => ({
    ...v,
    displayName: tText(v.name, v.nameVi || v.name)
  }));
  const recentOrders = stats?.recentOrders || defaultRecentOrders;

  // Calculate dynamic growth for KPI cards
  const revenueGrowth = getGrowth(stats?.tongDoanhThu, stats?.prevDoanhThu);
  const ordersGrowth = getGrowth(stats?.tongDonHang, stats?.prevDonHang);
  const customersGrowth = getGrowth(stats?.tongKhachHang, stats?.prevKhachHang);
  const partnersGrowth = getGrowthDiff(stats?.tongDoiTac, stats?.prevDoiTac, 'new partners', 'đối tác mới');
  const vouchersGrowth = getGrowthDiff(stats?.tongVoucher, stats?.prevVoucher, 'new vouchers', 'voucher mới');
  const vouchersSoldGrowth = getGrowth(stats?.tongVoucherDaBan, stats?.prevVoucherDaBan);
  const issuedCodesGrowth = getGrowth(stats?.tongMaPhatHanh, stats?.prevMaPhatHanh);
  const usedCodesGrowth = getGrowth(stats?.tongMaSuDung, stats?.prevMaSuDung);
  const revenueChartTitle = stats?.revenueGranularity === 'month'
    ? tText('Monthly Revenue', 'Doanh thu theo tháng')
    : stats?.revenueGranularity === 'week'
      ? tText('Weekly Revenue', 'Doanh thu theo tuần')
      : tText('Daily Revenue', 'Doanh thu theo ngày');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={timeRange === 'today' ? 'default' : 'outline'}
            onClick={() => setTimeRange('today')}
          >
            {tText('Today', 'Hôm nay')}
          </Button>
          <Button 
            variant={timeRange === '7days' ? 'default' : 'outline'}
            onClick={() => setTimeRange('7days')}
          >
            {tText('7 Days', '7 ngày')}
          </Button>
          <Button 
            variant={timeRange === '30days' ? 'default' : 'outline'}
            onClick={() => setTimeRange('30days')}
          >
            {tText('30 Days', '30 ngày')}
          </Button>
          <Button 
            variant={timeRange === 'custom' ? 'default' : 'outline'}
            onClick={() => setTimeRange('custom')}
          >
            {tText('Custom', 'Tùy chọn')}
          </Button>
        </div>

        {timeRange === 'custom' && (
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 border rounded-lg shadow-sm">
            <input 
              type="date" 
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-primary text-gray-700 bg-transparent"
            />
            <span className="text-gray-400 text-sm">{tText('to', 'đến')}</span>
            <input 
              type="date" 
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-primary text-gray-700 bg-transparent"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard
          icon={<DollarSign size={20} className="text-primary" />}
          label={tText('Total Revenue', 'Tổng doanh thu')}
          value={formatRevenueValue(stats?.tongDoanhThu)}
          change={revenueGrowth.changeText}
          isPositive={revenueGrowth.isPositive}
          isNeutral={revenueGrowth.isNeutral}
          colorClass="text-primary"
          bgClass="bg-primary/10"
        />
        <KPICard
          icon={<ShoppingCart size={20} className="text-emerald-500" />}
          label={tText('Total Orders', 'Tổng đơn hàng')}
          value={stats?.tongDonHang?.toLocaleString() ?? '0'}
          change={ordersGrowth.changeText}
          isPositive={ordersGrowth.isPositive}
          isNeutral={ordersGrowth.isNeutral}
          colorClass="text-emerald-500"
          bgClass="bg-emerald-500/10"
        />
        <KPICard
          icon={<Users size={20} className="text-amber-500" />}
          label={tText('Customers', 'Khách hàng')}
          value={stats?.tongKhachHang?.toLocaleString() ?? '0'}
          change={customersGrowth.changeText}
          isPositive={customersGrowth.isPositive}
          isNeutral={customersGrowth.isNeutral}
          colorClass="text-amber-500"
          bgClass="bg-amber-500/10"
        />
        <KPICard
          icon={<Handshake size={20} className="text-violet-500" />}
          label={tText('Partners', 'Đối tác')}
          value={stats?.tongDoiTac?.toLocaleString() ?? '0'}
          change={partnersGrowth.changeText}
          isPositive={partnersGrowth.isPositive}
          isNeutral={partnersGrowth.isNeutral}
          colorClass="text-violet-500"
          bgClass="bg-violet-500/10"
        />
        <KPICard
          icon={<Ticket size={20} className="text-pink-500" />}
          label={tText('Vouchers', 'Voucher')}
          value={stats?.tongVoucher?.toLocaleString() ?? '0'}
          change={vouchersGrowth.changeText}
          isPositive={vouchersGrowth.isPositive}
          isNeutral={vouchersGrowth.isNeutral}
          colorClass="text-pink-500"
          bgClass="bg-pink-500/10"
        />
        <KPICard
          icon={<CheckCircle size={20} className="text-cyan-500" />}
          label={tText('Vouchers Sold', 'Voucher đã bán')}
          value={stats?.tongVoucherDaBan?.toLocaleString() ?? '0'}
          change={vouchersSoldGrowth.changeText}
          isPositive={vouchersSoldGrowth.isPositive}
          isNeutral={vouchersSoldGrowth.isNeutral}
          colorClass="text-cyan-500"
          bgClass="bg-cyan-500/10"
        />
        <KPICard
          icon={<Send size={20} className="text-teal-500" />}
          label={tText('Issued Codes', 'Mã đã phát hành')}
          value={stats?.tongMaPhatHanh?.toLocaleString() ?? '0'}
          change={issuedCodesGrowth.changeText}
          isPositive={issuedCodesGrowth.isPositive}
          isNeutral={issuedCodesGrowth.isNeutral}
          colorClass="text-teal-500"
          bgClass="bg-teal-500/10"
        />
        <KPICard
          icon={<Award size={20} className="text-orange-500" />}
          label={tText('Used Codes', 'Mã đã sử dụng')}
          value={stats?.tongMaSuDung?.toLocaleString() ?? '0'}
          change={usedCodesGrowth.changeText}
          isPositive={usedCodesGrowth.isPositive}
          isNeutral={usedCodesGrowth.isNeutral}
          colorClass="text-orange-500"
          bgClass="bg-orange-500/10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">{revenueChartTitle}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }} 
                interval={revenueData.length > 15 ? 'preserveEnd' : 0} 
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: number) => {
                  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                  return value.toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US');
                }}
                labelStyle={{ color: 'var(--color-primary)' }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                name={tText("Revenue", "Doanh thu")}
                stroke="var(--color-primary)"
                strokeWidth={3}
                dot={revenueData.length > 15 ? false : { fill: 'var(--color-primary)', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">{tText('Top 5 Best-Selling Vouchers', 'Top 5 Voucher bán chạy')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topVouchers} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="displayName" type="category" width={120} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="sales" name={tText("Sales", "Doanh số")} fill="var(--color-primary)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-lg font-semibold text-gray-800">{tText('Recent Orders', 'Đơn hàng gần đây')}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{tText('Order ID', 'Mã đơn')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{tText('Customer', 'Khách hàng')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{tText('Total', 'Tổng tiền')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{tText('Status', 'Trạng thái')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{tText('Time', 'Thời gian')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {recentOrders.map((order: any) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.customer}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{order.total}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.status === 'PAID'
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : order.status === 'REFUNDED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {mapStatusToEnglish(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.time}</td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-gray-500">{tText('No recent orders.', 'Chưa có đơn hàng nào.')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
