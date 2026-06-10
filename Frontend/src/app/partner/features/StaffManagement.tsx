import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Mail, Phone, MapPin, MoreVertical, Shield } from 'lucide-react';
import { useLanguage } from '../../shared/contexts/LanguageContext';
import { toast } from 'sonner';
import api from '../../../lib/api';
import { AddStaffModal } from './components/AddStaffModal';
import {
  Button,
  Input,
  Badge,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@voucherhub/ui';

export default function StaffManagement() {
  const { language } = useLanguage();
  const tText = (en: string, vi: string) => (language === 'vi' ? vi : en);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStaffList = async () => {
    try {
      setLoading(true);
      const partnerIdStr = localStorage.getItem('partnerId');
      const partnerId = partnerIdStr ? parseInt(partnerIdStr, 10) : 1;
      
      const res = await api.get(`/partners/${partnerId}/staff`);
      setStaffList(res.data);
    } catch (error) {
      console.error('Failed to fetch staff list', error);
      toast.error('Lỗi khi lấy danh sách nhân viên');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffList();
  }, []);

  const filteredStaff = staffList.filter(staff => 
    staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    staff.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">{tText('Staff Management', 'Quản lý nhân viên')}</h1>
          <p className="text-gray-500">{tText('Manage your store staff and their permissions', 'Quản lý nhân viên cửa hàng và quyền hạn của họ')}</p>
        </div>
        <Button className="gap-2 shrink-0" onClick={() => setIsAddModalOpen(true)}>
          <UserPlus className="w-5 h-5" />
          {tText('Add Staff', 'Thêm nhân viên')}
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="w-full sm:w-96 relative">
            <Input
              placeholder={tText('Search staff by name, email or phone...', 'Tìm kiếm nhân viên theo tên, email hoặc SĐT...')}
              value={searchQuery}
              onChange={(e: any) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead>{tText('Staff Info', 'Thông tin nhân viên')}</TableHead>
                <TableHead>{tText('Contact', 'Liên hệ')}</TableHead>
                <TableHead>{tText('Position', 'Chức vụ')}</TableHead>
                <TableHead>{tText('Branch', 'Chi nhánh')}</TableHead>
                <TableHead>{tText('Status', 'Trạng thái')}</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                        {staff.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{staff.name}</p>
                        <p className="text-xs text-gray-500">ID: #{staff.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" /> {staff.email}
                        </div>
                      </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-sm">{staff.position}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" /> {staff.branch}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={staff.status === 'Hoạt động' ? 'default' : 'secondary'}
                      className={staff.status === 'Hoạt động' ? 'bg-green-100 text-green-700 shadow-none hover:bg-green-100' : 'bg-gray-100 text-gray-700 shadow-none'}
                    >
                      {staff.status === 'Hoạt động' ? tText('Active', 'Hoạt động') : tText('Inactive', 'Ngưng HĐ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredStaff.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    <Users className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                    <p>{tText('No staff members found.', 'Không tìm thấy nhân viên nào.')}</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <AddStaffModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={() => {
          fetchStaffList();
        }} 
      />
    </div>
  );
}
