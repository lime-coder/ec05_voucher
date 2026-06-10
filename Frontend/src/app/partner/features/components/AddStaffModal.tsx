import React, { useState } from 'react';
import { X, UserPlus, Mail, Lock, User, Shield } from 'lucide-react';
import { useLanguage } from '../../../shared/contexts/LanguageContext';
import { Button, Input } from '@voucherhub/ui';
import { toast } from 'sonner';
import api from '../../../../lib/api';
import { useAuth } from '../../../auth/AuthContext';

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddStaffModal({ isOpen, onClose, onSuccess }: AddStaffModalProps) {
  const { language } = useLanguage();
  const tText = (en: string, vi: string) => (language === 'vi' ? vi : en);
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    fullName: '',
    position: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.password || !formData.email || !formData.fullName) {
      toast.error(tText('Please fill all required fields.', 'Vui lòng điền đầy đủ các trường bắt buộc.'));
      return;
    }

    if (formData.username.includes(' ')) {
      toast.error(tText('Username cannot contain spaces.', 'Tên đăng nhập không được chứa khoảng trắng.'));
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      toast.error(tText('Password must be at least 8 characters with upper and lower case letters, and a number.', 'Mật khẩu phải dài ít nhất 8 ký tự, gồm cả chữ hoa, chữ thường và chữ số.'));
      return;
    }

    try {
      setLoading(true);
      // Attempt to get partnerId from localStorage as fallback, or use a default
      const partnerIdStr = localStorage.getItem('partnerId');
      const partnerId = partnerIdStr ? parseInt(partnerIdStr, 10) : 1;
      if (!partnerId) throw new Error('Partner ID not found');

      await api.post(`/partners/${partnerId}/staff`, formData);
      toast.success(tText('Staff added successfully!', 'Thêm nhân viên thành công!'));
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || tText('Failed to add staff', 'Lỗi khi thêm nhân viên'));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-gray-900">{tText('Add New Staff', 'Thêm Nhân Viên Mới')}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <User className="w-4 h-4" /> {tText('Username', 'Tên đăng nhập')} *
              </label>
              <Input
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder={tText('Enter username', 'Nhập tên đăng nhập')}
                required
              />
            </div>
            
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Lock className="w-4 h-4" /> {tText('Password', 'Mật khẩu')} *
              </label>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={tText('Enter password', 'Nhập mật khẩu')}
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Mail className="w-4 h-4" /> {tText('Email', 'Email')} *
              </label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={tText('Enter email', 'Nhập địa chỉ email')}
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <User className="w-4 h-4" /> {tText('Full Name', 'Họ tên')} *
              </label>
              <Input
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder={tText('Enter full name', 'Nhập họ tên đầy đủ')}
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Shield className="w-4 h-4" /> {tText('Position', 'Chức vụ')}
              </label>
              <Input
                name="position"
                value={formData.position}
                onChange={handleChange}
                placeholder={tText('Enter position', 'Nhập chức vụ (VD: Quản lý, Nhân viên bán hàng...)')}
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              {tText('Cancel', 'Hủy')}
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading}
            >
              {loading ? tText('Adding...', 'Đang thêm...') : tText('Add Staff', 'Thêm Nhân Viên')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
