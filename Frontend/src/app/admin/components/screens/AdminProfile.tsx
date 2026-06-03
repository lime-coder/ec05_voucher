import { useState, useEffect } from 'react';
import { User, Shield, Camera, Save, Key } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '../../../shared/contexts/LanguageContext';
import {
  Button,
  Input,
  Badge,
} from '@voucherhub/ui';

export function AdminProfile() {
  const { language } = useLanguage();
  const tText = (en: string, vi: string) => (language === 'vi' ? vi : en);

  const [isEditing, setIsEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  
  const [profileData, setProfileData] = useState({
    username: 'admin01',
    fullName: 'System Administrator',
    email: 'admin@voucher.vn',
    phone: '0911111111',
    role: 'System Admin',
    address: '123 Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh'
  });

  useEffect(() => {
    fetch('/api/admin/profile')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setProfileData(data);
        }
      })
      .catch(err => console.error('Fetch profile error:', err));
  }, []);

  const [pwdForm, setPwdForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleProfileSave = async () => {
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });
      if (res.ok) {
        setIsEditing(false);
        toast.success(
          tText('Profile updated successfully!', 'Cập nhật thông tin hồ sơ thành công!')
        );
      } else {
        const data = await res.json();
        toast.error(data.error || tText('Failed to update profile!', 'Cập nhật hồ sơ thất bại!'));
      }
    } catch (e) {
      console.error(e);
      toast.error(tText('An error occurred!', 'Có lỗi xảy ra!'));
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwdForm.currentPassword || !pwdForm.newPassword || !pwdForm.confirmPassword) {
      toast.error(tText('Please fill in all fields', 'Vui lòng điền đầy đủ các trường'));
      return;
    }
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      toast.error(tText('Confirm password does not match!', 'Mật khẩu xác nhận không khớp!'));
      return;
    }

    try {
      const res = await fetch('/api/admin/profile/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: pwdForm.currentPassword,
          newPassword: pwdForm.newPassword
        })
      });
      if (res.ok) {
        toast.success(tText('Password updated successfully!', 'Đổi mật khẩu thành công!'));
        setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const data = await res.json();
        toast.error(data.error || tText('Failed to update password!', 'Đổi mật khẩu thất bại!'));
      }
    } catch (err) {
      console.error(err);
      toast.error(tText('An error occurred!', 'Có lỗi xảy ra!'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {tText('Admin Profile', 'Hồ sơ Admin')}
        </h1>
        <p className="text-gray-500">
          {tText('Manage your personal account details and security settings.', 'Quản lý thông tin tài khoản cá nhân và cài đặt bảo mật.')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4">
          <div className="bg-white border rounded-xl p-6 flex flex-col items-center text-center shadow-sm">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md mb-4" />
            ) : (
              <div className="w-32 h-32 rounded-full bg-primary/10 text-primary flex items-center justify-center text-4xl font-bold mb-4 border">
                AD
              </div>
            )}
            <h2 className="text-xl font-bold mb-2">{profileData.fullName}</h2>
            <Badge className="bg-primary text-primary-foreground hover:bg-primary mb-6 shadow-none">
              {profileData.role}
            </Badge>
            <Button 
              variant="outline" 
              className="w-full gap-2 relative cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              {tText('Change Avatar', 'Thay đổi ảnh đại diện')}
              <input 
                type="file" 
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setAvatarUrl(URL.createObjectURL(file));
                    toast.success(tText('Avatar changed!', 'Đã cập nhật ảnh đại diện!'));
                  }
                }}
              />
            </Button>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          {/* Profile information */}
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                {tText('Personal Information', 'Thông tin cá nhân')}
              </h2>
              {isEditing ? (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    {tText('Cancel', 'Hủy')}
                  </Button>
                  <Button onClick={handleProfileSave} className="gap-2">
                    <Save className="w-4 h-4" />
                    {tText('Save', 'Lưu lại')}
                  </Button>
                </div>
              ) : (
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  {tText('Edit Profile', 'Chỉnh sửa')}
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">{tText('Username', 'Tên đăng nhập')}</label>
                <Input value={profileData.username} disabled />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">{tText('Role', 'Vai trò')}</label>
                <Input value={profileData.role} disabled />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-semibold text-gray-500 uppercase">{tText('Full Name', 'Họ và tên')}</label>
                <Input 
                  value={profileData.fullName} 
                  disabled={!isEditing} 
                  onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">{tText('Email Address', 'Địa chỉ email')}</label>
                <Input 
                  value={profileData.email} 
                  disabled={!isEditing} 
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">{tText('Phone Number', 'Số điện thoại')}</label>
                <Input 
                  value={profileData.phone} 
                  disabled={!isEditing} 
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-semibold text-gray-500 uppercase">{tText('Residential Address', 'Địa chỉ liên hệ')}</label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={profileData.address}
                  disabled={!isEditing}
                  onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Change password */}
          <form onSubmit={handlePasswordSave} className="bg-white border rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              {tText('Security & Password', 'Bảo mật & Mật khẩu')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">{tText('Current Password', 'Mật khẩu hiện tại')}</label>
                <Input 
                  type="password" 
                  value={pwdForm.currentPassword}
                  onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">{tText('New Password', 'Mật khẩu mới')}</label>
                <Input 
                  type="password" 
                  value={pwdForm.newPassword}
                  onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">{tText('Confirm Password', 'Xác nhận mật khẩu')}</label>
                <Input 
                  type="password" 
                  value={pwdForm.confirmPassword}
                  onChange={(e) => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit" className="gap-2">
                <Key className="w-4 h-4" />
                {tText('Change Password', 'Đổi mật khẩu')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
export default AdminProfile;
