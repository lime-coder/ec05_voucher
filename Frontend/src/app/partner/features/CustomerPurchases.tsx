import { useState } from 'react';
import { ShoppingCart, Search, CreditCard, Clock, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { useLanguage } from '../../shared/contexts/LanguageContext';
import {
  Input,
  Badge,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@voucherhub/ui';

export default function CustomerPurchases() {
  const { language } = useLanguage();
  const tText = (en: string, vi: string) => (language === 'vi' ? vi : en);
  
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for customer purchases
  const mockPurchases = [
    {
      id: 'ORD-1001',
      customerName: 'Nguyen Van A',
      customerPhone: '0901234567',
      voucherName: 'Giảm 50% Buffet Trưa',
      quantity: 2,
      totalAmount: 500000,
      paymentMethod: 'Credit Card',
      status: 'Paid',
      date: '2026-06-10T10:30:00Z'
    },
    {
      id: 'ORD-1002',
      customerName: 'Tran Thi B',
      customerPhone: '0907654321',
      voucherName: 'Voucher Spa 500k',
      quantity: 1,
      totalAmount: 350000,
      paymentMethod: 'MoMo',
      status: 'Paid',
      date: '2026-06-09T14:15:00Z'
    },
    {
      id: 'ORD-1003',
      customerName: 'Le Van C',
      customerPhone: '0901122334',
      voucherName: 'Giảm 20% Cà phê',
      quantity: 3,
      totalAmount: 120000,
      paymentMethod: 'ZaloPay',
      status: 'Pending',
      date: '2026-06-10T08:00:00Z'
    },
    {
      id: 'ORD-1004',
      customerName: 'Pham Thu D',
      customerPhone: '0912345678',
      voucherName: 'Vé xem phim cuối tuần',
      quantity: 2,
      totalAmount: 200000,
      paymentMethod: 'Credit Card',
      status: 'Cancelled',
      date: '2026-06-08T19:45:00Z'
    }
  ];

  const filteredPurchases = mockPurchases.filter(p => 
    p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.customerPhone.includes(searchQuery) ||
    p.voucherName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">{tText('Customer Purchases', 'Giao dịch khách hàng')}</h1>
          <p className="text-gray-500">{tText('View and track vouchers purchased by customers', 'Xem và theo dõi các voucher khách hàng đã mua')}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="w-full sm:w-96 relative">
            <Input
              placeholder={tText('Search by order ID, customer or voucher...', 'Tìm theo mã đơn, khách hàng hoặc voucher...')}
              value={searchQuery}
              onChange={(e: any) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead>{tText('Order Info', 'Đơn hàng')}</TableHead>
                <TableHead>{tText('Customer', 'Khách hàng')}</TableHead>
                <TableHead>{tText('Voucher', 'Voucher')}</TableHead>
                <TableHead className="text-center">{tText('Payment', 'Thanh toán')}</TableHead>
                <TableHead>{tText('Status', 'Trạng thái')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPurchases.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-semibold text-gray-900">{p.id}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" /> 
                        {new Date(p.date).toLocaleString('vi-VN')}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium text-gray-900">{p.customerName}</p>
                      <p className="text-sm text-gray-500">{p.customerPhone}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium text-gray-900">{p.voucherName}</p>
                      <p className="text-sm text-gray-500">SL: <span className="font-semibold">{p.quantity}</span></p>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="space-y-1">
                      <p className="font-bold text-gray-900">{p.totalAmount.toLocaleString('vi-VN')}₫</p>
                      <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                        <CreditCard className="w-3 h-3" /> {p.paymentMethod}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {p.status === 'Paid' ? (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 shadow-none border-green-200">
                        <CheckCircle className="w-3 h-3 mr-1" /> {tText('Paid', 'Đã thanh toán')}
                      </Badge>
                    ) : p.status === 'Pending' ? (
                      <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 shadow-none border-yellow-200">
                        <Clock className="w-3 h-3 mr-1" /> {tText('Pending', 'Chờ thanh toán')}
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-700 hover:bg-red-100 shadow-none border-red-200">
                        <XCircle className="w-3 h-3 mr-1" /> {tText('Cancelled', 'Đã hủy')}
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filteredPurchases.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    <ShoppingCart className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                    <p>{tText('No purchases found.', 'Không tìm thấy giao dịch nào.')}</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
