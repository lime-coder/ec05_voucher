import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Handshake, Ticket, CheckCircle, Send, Award } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@voucherhub/ui';

const revenueData = [
  { date: '14/05', revenue: 45000000 },
  { date: '15/05', revenue: 52000000 },
  { date: '16/05', revenue: 48000000 },
  { date: '17/05', revenue: 61000000 },
  { date: '18/05', revenue: 55000000 },
  { date: '19/05', revenue: 67000000 },
  { date: '20/05', revenue: 72000000 },
];

const topVouchers = [
  { name: 'Highlands Coffee - Giảm 50K', sales: 1250 },
  { name: 'CGV - Combo bắp nước', sales: 980 },
  { name: 'The Coffee House - Buy 1 Get 1', sales: 850 },
  { name: 'Lotteria - Combo gà giòn', sales: 720 },
  { name: 'Pizza Hut - Giảm 30%', sales: 650 },
];

const recentOrders = [
  { id: 'ORD-2401', customer: 'Nguyễn Văn A', total: '245,000đ', status: 'Đã thanh toán', time: '10:30 - 19/05/2026' },
  { id: 'ORD-2402', customer: 'Trần Thị B', total: '189,000đ', status: 'Chờ thanh toán', time: '10:15 - 19/05/2026' },
  { id: 'ORD-2403', customer: 'Lê Văn C', total: '320,000đ', status: 'Đã thanh toán', time: '09:45 - 19/05/2026' },
  { id: 'ORD-2404', customer: 'Phạm Thị D', total: '156,000đ', status: 'Đã hủy', time: '09:20 - 19/05/2026' },
  { id: 'ORD-2405', customer: 'Hoàng Văn E', total: '278,000đ', status: 'Đã thanh toán', time: '08:55 - 19/05/2026' },
];

interface KPICardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
  colorClass: string;
  bgClass: string;
}

function KPICard({ icon, label, value, change, isPositive, colorClass, bgClass }: KPICardProps) {
  return (
    <div className="bg-white rounded-lg p-5 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${bgClass}`}>
          {icon}
        </div>
      </div>
      <div className="text-xs text-gray-600 mb-1">{label}</div>
      <div className={`text-2xl font-bold mb-2 text-primary`}>{value}</div>
      <div className={`text-xs flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        <span>{change}</span>
      </div>
    </div>
  );
}

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button variant="default">
            Hôm nay
          </Button>
          <Button variant="outline">
            7 ngày
          </Button>
          <Button variant="outline">
            30 ngày
          </Button>
          <Button variant="outline">
            Tùy chọn
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5">
        <KPICard
          icon={<DollarSign size={20} className="text-primary" />}
          label="Tổng doanh thu"
          value="72,5M"
          change="+12.5% so với hôm qua"
          isPositive={true}
          colorClass="text-primary"
          bgClass="bg-primary/10"
        />
        <KPICard
          icon={<ShoppingCart size={20} className="text-emerald-500" />}
          label="Tổng đơn hàng"
          value="1,248"
          change="+8.3% so với hôm qua"
          isPositive={true}
          colorClass="text-emerald-500"
          bgClass="bg-emerald-500/10"
        />
        <KPICard
          icon={<Users size={20} className="text-amber-500" />}
          label="Khách hàng"
          value="4,532"
          change="+15.2% so với tuần trước"
          isPositive={true}
          colorClass="text-amber-500"
          bgClass="bg-amber-500/10"
        />
        <KPICard
          icon={<Handshake size={20} className="text-violet-500" />}
          label="Đối tác"
          value="89"
          change="+3 đối tác mới"
          isPositive={true}
          colorClass="text-violet-500"
          bgClass="bg-violet-500/10"
        />
        <KPICard
          icon={<Ticket size={20} className="text-pink-500" />}
          label="Voucher"
          value="234"
          change="+18 voucher mới"
          isPositive={true}
          colorClass="text-pink-500"
          bgClass="bg-pink-500/10"
        />
        <KPICard
          icon={<CheckCircle size={20} className="text-cyan-500" />}
          label="Voucher đã bán"
          value="8,945"
          change="+22.1% so với hôm qua"
          isPositive={true}
          colorClass="text-cyan-500"
          bgClass="bg-cyan-500/10"
        />
        <KPICard
          icon={<Send size={20} className="text-teal-500" />}
          label="Mã đã phát hành"
          value="12,340"
          change="+890 mã mới"
          isPositive={true}
          colorClass="text-teal-500"
          bgClass="bg-teal-500/10"
        />
        <KPICard
          icon={<Award size={20} className="text-orange-500" />}
          label="Mã đã sử dụng"
          value="9,127"
          change="74% tỷ lệ sử dụng"
          isPositive={true}
          colorClass="text-orange-500"
          bgClass="bg-orange-500/10"
        />
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Doanh thu theo ngày</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: number) => `${(value / 1000000).toFixed(1)}M`}
                labelStyle={{ color: 'var(--color-primary)' }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="var(--color-primary)"
                strokeWidth={3}
                dot={{ fill: 'var(--color-primary)', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top 5 Voucher bán chạy</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topVouchers} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="sales" fill="var(--color-primary)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-lg font-semibold text-gray-800">Đơn hàng gần đây</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mã đơn</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Khách hàng</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tổng tiền</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Thời gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {recentOrders.map((order, index) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.customer}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{order.total}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.status === 'Đã thanh toán'
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'Chờ thanh toán'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
