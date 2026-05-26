import {
  Tag,
  CheckCircle,
  Clock,
  DollarSign,
} from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

import {
  dashboardStats,
  recentActivities,
  salesData,
  topVouchers,
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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {t('partner.dash.greeting')}
        </h1>
        <p className="text-gray-500">
          {t('partner.dash.overview')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {dashboardStats.map((stat) => (
          <div key={stat.title} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`p-4 rounded-full`} style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
              {statIcons[stat.icon]}
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
              <h3 className="text-2xl font-bold">{stat.value}</h3>
              <p className={`text-xs font-medium ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change} {t('partner.dash.vs_last_month')}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        <div className="lg:col-span-7 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
          <h2 className="text-lg font-bold mb-6">{t('partner.dash.revenue_sales')}</h2>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
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

        <div className="lg:col-span-5 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
          <h2 className="text-lg font-bold mb-6">{t('partner.dash.recent_activities')}</h2>
          <div className="flex flex-col gap-4">
            {recentActivities.map((activity) => (
              <div key={activity.text} className="flex gap-4">
                <div
                  className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                    activity.type === 'success'
                      ? 'bg-green-500'
                      : activity.type === 'warning'
                      ? 'bg-yellow-500'
                      : 'bg-blue-500'
                  }`}
                />
                <div>
                  <p className="text-sm font-medium">{activity.text}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold mb-6">{t('partner.dash.top_vouchers')}</h2>
        <div className="flex flex-col gap-6">
          {topVouchers.map((voucher, index) => (
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
                  style={{ width: `${(voucher.sold / 250) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
