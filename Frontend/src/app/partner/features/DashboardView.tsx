import React, { useState, useEffect } from 'react';
import {
  Tag,
  CheckCircle,
  Clock,
  DollarSign,
} from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { cn } from '@voucherhub/ui';

import {
  salesData as mockSalesData,
  topVouchers as mockTopVouchers,
} from '../data/mockData';
import { useLanguage } from '../../shared/contexts/LanguageContext';

const statIcons: Record<string, React.ReactNode> = {
  money: <DollarSign size={24} />,
  voucher: <Tag size={24} />,
  check: <CheckCircle size={24} />,
  schedule: <Clock size={24} />,
};

export default function DashboardView() {
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalSold: 0,
    pendingVouchers: 0,
    activeVouchers: 0,
    topVouchers: mockTopVouchers,
    salesData: mockSalesData // Fallback or initial state
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const partnerId = localStorage.getItem('partnerId') || '1';
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/partners/${partnerId}/statistics`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          // Merge with mockTopVouchers if backend doesn't return topVouchers or returns empty array
          setStats(prev => ({
            ...prev,
            ...data,
            topVouchers: data.topVouchers && data.topVouchers.length > 0 ? data.topVouchers : mockTopVouchers,
            salesData: data.salesData || mockSalesData
          }));
        }
      } catch (err) {
        console.error("Failed to fetch partner stats", err);
      }
    };
    fetchStats();
  }, []);

  let revenueChange = '+0%';
  let soldChange = '+0%';

  if (stats.salesData && stats.salesData.length >= 2) {
    const currentMonth = stats.salesData[stats.salesData.length - 1];
    const prevMonth = stats.salesData[stats.salesData.length - 2];
    
    if (prevMonth.revenue > 0) {
      const revDiff = ((currentMonth.revenue - prevMonth.revenue) / prevMonth.revenue) * 100;
      revenueChange = `${revDiff > 0 ? '+' : ''}${revDiff.toFixed(1)}%`;
    } else if (currentMonth.revenue > 0) {
      revenueChange = '+100%';
    }
    
    if (prevMonth.vouchers > 0) {
      const soldDiff = ((currentMonth.vouchers - prevMonth.vouchers) / prevMonth.vouchers) * 100;
      soldChange = `${soldDiff > 0 ? '+' : ''}${soldDiff.toFixed(1)}%`;
    } else if (currentMonth.vouchers > 0) {
      soldChange = '+100%';
    }
  }

  const dynamicStats = [
    { title: t('partner.dash.total_revenue') || 'Tổng Doanh Thu', value: `${stats.totalRevenue.toLocaleString('vi-VN')}₫`, change: revenueChange, icon: 'money', colorClass: 'text-blue-500', bgClass: 'bg-blue-50' },
    { title: t('partner.dash.total_sold') || 'Voucher Đã Bán', value: stats.totalSold.toString(), change: soldChange, icon: 'voucher', colorClass: 'text-green-500', bgClass: 'bg-green-50' },
    { title: t('partner.dash.pending') || 'Chờ Duyệt', value: stats.pendingVouchers.toString(), change: '0%', icon: 'check', colorClass: 'text-yellow-500', bgClass: 'bg-yellow-50' },
    { title: t('partner.dash.active') || 'Đang Phát Hành', value: stats.activeVouchers.toString(), change: '0%', icon: 'schedule', colorClass: 'text-purple-500', bgClass: 'bg-purple-50' }
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {t('partner.dash.greeting', { name: (stats as any).partnerName || '...' })}
        </h1>
        <p className="text-gray-500">
          {t('partner.dash.overview')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {dynamicStats.map((stat) => (
          <div key={stat.title} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={cn('p-4 rounded-full', stat.bgClass, stat.colorClass)}>
              {statIcons[stat.icon]}
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
              <h3 className="text-2xl font-bold">{stat.value}</h3>
              <p className={cn('text-xs font-medium', stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600')}>
                {stat.change} {t('partner.dash.vs_last_month') || 'so với tháng trước'}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        <div className="lg:col-span-12 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
          <h2 className="text-lg font-bold mb-6">{t('partner.dash.revenue_sales')}</h2>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" label={{ value: t('partner.dash.month_label') || 'Tháng', position: 'insideBottom', offset: -5 }} height={40} tickFormatter={(val) => typeof val === 'string' && val.startsWith('T') ? val.replace('T', t('common.month_prefix') || 'T') : val} />
                <YAxis yAxisId="left" label={{ value: t('partner.dash.revenue_y') || 'Triệu VNĐ', angle: -90, position: 'insideLeft', offset: 15 }} width={80} />
                <YAxis yAxisId="right" orientation="right" label={{ value: t('partner.dash.vouchers_y') || 'Số lượng', angle: 90, position: 'insideRight', offset: 15 }} width={80} />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2196f3"
                  strokeWidth={2}
                  name={t('partner.dash.revenue_label')}
                  isAnimationActive={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="vouchers"
                  stroke="#4caf50"
                  strokeWidth={2}
                  name={t('partner.dash.vouchers_sold_label')}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold mb-6">{t('partner.dash.top_vouchers')}</h2>
        <div className="flex flex-col gap-6">
          {stats.topVouchers.map((voucher, index, arr) => {
            const maxSold = Math.max(...arr.map(v => v.sold || 0), 1);
            return (
            <div key={index}>
              <div className="flex flex-col sm:flex-row justify-between gap-4 mb-2">
                <div className="flex gap-3 items-center min-w-0">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                      index === 0
                        ? 'bg-yellow-400 text-white'
                        : index === 1
                        ? 'bg-gray-300 text-white'
                        : index === 2
                        ? 'bg-orange-400 text-white'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <h3 className="text-base font-semibold truncate">{voucher.name}</h3>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <p className="text-sm font-bold text-green-600">
                    {voucher.revenue.toLocaleString('vi-VN')}₫
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{voucher.sold} {t('partner.dash.sold')}</p>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                <div
                  className={`h-1.5 rounded-full ${
                    index === 0
                      ? 'bg-green-500'
                      : index === 1
                      ? 'bg-blue-500'
                      : 'bg-orange-500'
                  }`}
                  style={{ width: `${Math.min((voucher.sold / maxSold) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
