import { useState } from 'react';
import { Search, Eye, Edit2, Trash2, Plus } from 'lucide-react';
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

const mockPartners = [
  { id: 1, name: 'Highlands Coffee', category: 'F&B', vouchers: 45, revenue: '125,000,000đ', status: 'Hoạt động', date: '01/01/2026' },
  { id: 2, name: 'CGV Cinemas', category: 'Giải trí', vouchers: 28, revenue: '89,500,000đ', status: 'Hoạt động', date: '05/01/2026' },
  { id: 3, name: 'The Coffee House', category: 'F&B', vouchers: 52, revenue: '156,200,000đ', status: 'Hoạt động', date: '10/01/2026' },
  { id: 4, name: 'Lotteria', category: 'F&B', vouchers: 34, revenue: '78,900,000đ', status: 'Tạm dừng', date: '15/01/2026' },
  { id: 5, name: 'Pizza Hut', category: 'F&B', vouchers: 29, revenue: '92,400,000đ', status: 'Hoạt động', date: '20/01/2026' },
  { id: 6, name: 'Galaxy Cinema', category: 'Giải trí', vouchers: 18, revenue: '54,300,000đ', status: 'Hoạt động', date: '25/01/2026' },
  { id: 7, name: 'Phúc Long', category: 'F&B', vouchers: 41, revenue: '103,700,000đ', status: 'Hoạt động', date: '28/01/2026' },
  { id: 8, name: 'KFC', category: 'F&B', vouchers: 38, revenue: '115,800,000đ', status: 'Hoạt động', date: '01/02/2026' },
];

export function PartnerManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredPartners = mockPartners.filter((partner) => {
    const matchesSearch = partner.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || partner.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredPartners.length / itemsPerPage);
  const currentPartners = filteredPartners.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Tìm kiếm đối tác..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white shadow-sm border-gray-200"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 py-0 pl-4 pr-8 border border-gray-200 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none bg-[length:16px_16px] bg-[position:right_8px_center] bg-no-repeat cursor-pointer"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")` }}
          >
            <option value="all">Tất cả danh mục</option>
            <option value="F&B">F&B</option>
            <option value="Giải trí">Giải trí</option>
          </select>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Thêm đối tác
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead>STT</TableHead>
              <TableHead>Tên đối tác</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Voucher</TableHead>
              <TableHead>Doanh thu</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tham gia</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentPartners.map((partner, index) => (
              <TableRow key={partner.id} className="hover:bg-gray-50/50">
                <TableCell className="text-gray-500">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </TableCell>
                <TableCell className="font-medium text-gray-900">{partner.name}</TableCell>
                <TableCell>{partner.category}</TableCell>
                <TableCell>{partner.vouchers}</TableCell>
                <TableCell className="font-medium text-gray-900">{partner.revenue}</TableCell>
                <TableCell>
                  <Badge
                    variant={partner.status === 'Hoạt động' ? 'default' : 'secondary'}
                    className={
                      partner.status === 'Hoạt động'
                        ? 'bg-green-100 text-green-700 hover:bg-green-100 shadow-none border-transparent'
                        : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 shadow-none border-transparent'
                    }
                  >
                    {partner.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-500">{partner.date}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
            <div className="text-sm text-gray-500">
              Hiển thị {(currentPage - 1) * itemsPerPage + 1} -{' '}
              {Math.min(currentPage * itemsPerPage, filteredPartners.length)} / {filteredPartners.length}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
