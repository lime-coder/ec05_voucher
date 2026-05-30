import { useState } from 'react';
import {
  DollarSign,
  Tag,
  Users,
  Star,
  ChevronDown,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import { reportStats, revenueData, topCustomers } from '../data/mockData';
import { Tabs, TabsList, TabsTrigger, Input } from '@voucherhub/ui';
import { useLanguage } from '../../shared/contexts/LanguageContext';

const reportIcons: Record<string, React.ReactNode> = {
  money: <DollarSign className="w-5 h-5 text-blue-600" />,
  voucher: <Tag className="w-5 h-5 text-purple-600" />,
  people: <Users className="w-5 h-5 text-green-600" />,
  star: <Star className="w-5 h-5 text-orange-600" />,
};

export default function ReportsView() {
  const { t } = useLanguage();
  const [currentTab, setCurrentTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('month');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('partner.report.title')}</h1>
          <p className="text-gray-500">{t('partner.report.subtitle')}</p>
        </div>
        <div className="relative w-full sm:w-[150px]">
          <select
            className="flex h-10 w-full appearance-none rounded-md border border-border bg-white px-3 py-2 pr-8 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="week">{t('partner.report.time_7d')}</option>
            <option value="month">{t('partner.report.time_30d')}</option>
            <option value="quarter">{t('partner.report.time_3m')}</option>
            <option value="year">{t('partner.report.time_12m')}</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <ChevronDown className="h-4 w-4 opacity-50" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {reportStats.map((stat) => (
          <div key={stat.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-500">{t(`partner.report.stat.${stat.id}`)}</p>
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: stat.background }}
              >
                {reportIcons[stat.icon]}
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold">{stat.value}</h3>
              <span
                className={`text-sm font-medium ${
                  stat.trend === 'up' ? 'text-green-600' : stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}
              >
                {stat.trend === 'up' ? '+' : stat.trend === 'down' ? '-' : ''}
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <div className="px-6 pt-4 border-b">
            <TabsList className="bg-transparent gap-6 p-0 h-auto">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-b-primary rounded-none px-0 pb-3"
              >
                {t('partner.report.tab_overview')}
              </TabsTrigger>
              <TabsTrigger
                value="customers"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-b-primary rounded-none px-0 pb-3"
              >
                {t('partner.report.tab_customers')}
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>

        <div className="p-6">
          {currentTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 border rounded-xl p-6">
                <h2 className="text-lg font-bold mb-6">{t('partner.report.chart_title')}</h2>
                <div className="h-[380px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="#2196f3" strokeWidth={3} name={t('partner.report.chart_revenue')} isAnimationActive={false} />
                      <Line type="monotone" dataKey="target" stroke="#ff9800" strokeWidth={2} strokeDasharray="5 5" name={t('partner.report.chart_target')} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="lg:col-span-4 border rounded-xl p-6 flex flex-col justify-center text-center">
                <h2 className="text-lg font-bold mb-8">{t('partner.report.target_title')}</h2>
                <div>
                  <div className="text-6xl font-bold text-green-500 mb-2">106%</div>
                  <p className="text-gray-500 mb-8">{t('partner.report.target_exceed')}</p>
                  
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-6">
                    <div className="h-full bg-green-500" style={{ width: '106%' }} />
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-500">
                    <p>{t('partner.report.target_current')} <strong className="text-gray-900">85 triệu</strong></p>
                    <p>{t('partner.report.target_goal')} <strong className="text-gray-900">80 triệu</strong></p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentTab === 'customers' && (
            <div className="border rounded-xl p-6">
              <h2 className="text-lg font-bold mb-6">{t('partner.report.top_customers')}</h2>
              <div className="flex flex-col gap-4">
                {topCustomers.map((customer, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-4 rounded-xl ${
                      index < 3 ? 'bg-gray-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
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
                      <div>
                        <p className="font-semibold">{customer.name}</p>
                        <p className="text-sm text-gray-500">{customer.purchases} {t('partner.report.orders_count')}</p>
                      </div>
                    </div>
                    <div className="font-bold text-green-600 text-lg">
                      {customer.spent.toLocaleString('vi-VN')}₫
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
