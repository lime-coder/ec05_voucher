import { useState, useEffect } from 'react';
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

// Removed mockData import
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

  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [targetInput, setTargetInput] = useState('');
  const [isSavingTarget, setIsSavingTarget] = useState(false);

  const handleSaveTarget = async () => {
    const parsed = Number(targetInput.replace(/\./g, '').replace(',', '.'));
    if (isNaN(parsed) || parsed <= 0) return;
    setIsSavingTarget(true);
    try {
      const partnerId = localStorage.getItem('partnerId') || '1';
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/partners/${partnerId}/revenue-target`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ timeRange, target: parsed })
      });
      if (res.ok) {
        setIsEditingTarget(false);
        // Reload để cập nhật tỷ lệ hoàn thành mới
        const reportRes = await fetch(`http://localhost:5000/api/partners/${partnerId}/reports?timeRange=${timeRange}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (reportRes.ok) setReportData(await reportRes.json());
      }
    } finally {
      setIsSavingTarget(false);
    }
  };

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const partnerId = localStorage.getItem('partnerId') || '1';
        const url = `http://localhost:5000/api/partners/${partnerId}/reports?timeRange=${timeRange}`;
        console.log('[ReportsView] fetching:', url);
        const token = localStorage.getItem('token');
        const res = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('[ReportsView] status:', res.status);
        if (res.ok) {
          const data = await res.json();
          setReportData(data);
        } else {
          const errBody = await res.json().catch(() => ({}));
          setFetchError(`${t('common.error') || 'Lỗi'} ${res.status}: ${errBody.message || errBody.detail || t('partner.report.fetch_error') || 'Không tải được dữ liệu'}`);
        }
      } catch (error: any) {
        console.error('Failed to fetch reports', error);
        setFetchError(t('toast.voucher.connection_error') || 'Không kết nối được tới Backend. Hãy kiểm tra Backend đang chạy.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [timeRange]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (fetchError || !reportData) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4">
        <p className="text-red-500 font-medium">{fetchError || t('partner.report.no_data') || 'Không có dữ liệu'}</p>
        <button
          onClick={() => { setIsLoading(true); setFetchError(null); }}
          className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:opacity-90"
        >
          {t('common.retry') || 'Thử lại'}
        </button>
      </div>
    );
  }

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
        {reportData.reportStats.map((stat: any) => (
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
                className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-600' : stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'
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
                <div className="h-[380px] w-full">
                  <ResponsiveContainer width="99%" height="100%">
                    <LineChart data={reportData.revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tickFormatter={(val) => typeof val === 'string' && val.startsWith('T') ? val.replace('T', t('common.month_prefix') || 'T') : val} />
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
                <h2 className="text-lg font-bold mb-2">{t('partner.report.target_title')}</h2>
                <p className="text-sm text-gray-500 mb-6">
                  {t('partner.report.apply_for_period') || 'Áp dụng cho kỳ:'} <span className="font-medium text-gray-800">{
                    timeRange === 'week' ? t('partner.report.time_7d') || '7 ngày qua' :
                    timeRange === 'month' ? t('partner.report.time_30d') || '30 ngày qua' :
                    timeRange === 'quarter' ? t('partner.report.time_3m') || '3 tháng qua' :
                    t('partner.report.time_12m') || '12 tháng qua'
                  }</span>
                </p>
                <div>
                  <div className={`text-6xl font-bold ${reportData.targetStats.completionRate >= 100 ? 'text-green-500' : 'text-orange-500'} mb-2`}>
                    {reportData.targetStats.completionRate}%
                  </div>
                  <p className="text-gray-500 mb-8">
                    {reportData.targetStats.completionRate >= 100
                      ? `${t('partner.report.exceed_target') || 'Vượt mục tiêu'} ${reportData.targetStats.completionRate - 100}%`
                      : `${t('partner.report.miss_target') || 'Chưa đạt mục tiêu'} (${100 - reportData.targetStats.completionRate}%)`}
                  </p>

                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-6">
                    <div
                      className={`h-full ${reportData.targetStats.completionRate >= 100 ? 'bg-green-500' : 'bg-orange-500'}`}
                      style={{ width: `${Math.min(reportData.targetStats.completionRate, 100)}%` }}
                    />
                  </div>

                  <div className="space-y-1 text-sm text-gray-500 mb-5">
                    <p>{t('partner.report.target_current')} <strong className="text-gray-900">{(reportData.targetStats.currentRevenue / 1000000).toFixed(1)} {t('common.million') || 'triệu'}</strong></p>
                    <p>
                      {t('partner.report.target_goal')} <strong className="text-gray-900">{(reportData.targetStats.targetGoal / 1000000).toFixed(1)} {t('common.million') || 'triệu'}</strong>
                      {!reportData.targetStats.isCustomTarget && <span className="ml-1 text-xs text-gray-400">({t('common.auto') || 'tự động'})</span>}
                    </p>
                  </div>

                  {/* Inline edit mục tiêu */}
                  {isEditingTarget ? (
                    <div className="flex flex-col gap-2">
                      <input
                        type="number"
                        className="w-full border border-orange-300 rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-orange-400"
                        placeholder={t('partner.report.enter_amount_ph') || 'Nhập số tiền (VD: 50000000)'}
                        value={targetInput}
                        onChange={(e) => setTargetInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveTarget()}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveTarget}
                          disabled={isSavingTarget}
                          className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded-lg py-1.5 font-medium disabled:opacity-60 transition-colors"
                        >
                          {isSavingTarget ? (t('common.saving') || 'Đang lưu...') : (t('common.save') || 'Lưu')}
                        </button>
                        <button
                          onClick={() => setIsEditingTarget(false)}
                          className="flex-1 border border-gray-300 text-gray-600 text-sm rounded-lg py-1.5 font-medium hover:bg-gray-50 transition-colors"
                        >
                          {t('common.cancel') || 'Hủy'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setTargetInput(String(reportData.targetStats.targetGoal));
                        setIsEditingTarget(true);
                      }}
                      className="text-sm text-orange-500 hover:text-orange-600 underline underline-offset-2 font-medium transition-colors"
                    >
                      ⚙️ {t('partner.report.set_revenue_target') || 'Đặt mục tiêu doanh thu'}
                    </button>
                  )}
                </div>
              </div>

            </div>
          )}

          {currentTab === 'customers' && (
            <div className="border rounded-xl p-6">
              <h2 className="text-lg font-bold mb-6">{t('partner.report.top_customers')}</h2>
              <div className="flex flex-col gap-4">
                {reportData.topCustomers.map((customer: any, index: number) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-4 rounded-xl ${index < 3 ? 'bg-gray-50' : ''
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${index === 0
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
