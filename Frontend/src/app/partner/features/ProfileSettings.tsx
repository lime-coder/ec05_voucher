import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import type { ChangeEvent } from 'react';
import {
  Edit2,
  Save,
  Camera,
  Store,
  Shield,
  Settings,
  Moon,
  Globe,
  CheckCircle
} from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router';
import { initialBusinessProfile } from '../data/mockData';
import { ImageUploadModal } from '../../shared/components/ImageUploadModal';
import { useLanguage } from '../../shared/contexts/LanguageContext';
import type { BusinessProfile } from '@voucherhub/types';

import {
  Button,
  Input,
  Badge,
  Tabs,
  TabsList,
  TabsTrigger,
} from '@voucherhub/ui';

export default function ProfileSettings() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const defaultTab = searchParams.get('tab') || 'business';

  const [currentTab, setCurrentTab] = useState(defaultTab);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [avatarSuccess, setAvatarSuccess] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [formData, setFormData] = useState<BusinessProfile>(initialBusinessProfile);

  // Security Tab States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const partnerId = localStorage.getItem('partnerId') || '1';
        const res = await fetch(`http://localhost:5000/api/partners/${partnerId}/profile`);
        if (res.ok) {
          const data = await res.json();
          setFormData(prev => ({ ...prev, ...data }));
          if (data.avatarUrl) {
            setAvatarUrl(data.avatarUrl);
          }
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tab !== currentTab) {
      setCurrentTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (val: string) => {
    setCurrentTab(val);
    navigate(`/partner/profile?tab=${val}`, { replace: true });
  };

  const handleChange = (field: keyof BusinessProfile) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [field]: event.target.value });
  };

  const handleSave = async () => {
    try {
      const partnerId = localStorage.getItem('partnerId') || '1';
      const res = await fetch(`http://localhost:5000/api/partners/${partnerId}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsEditing(false);
        toast.success(t('partner.settings.business.save_success'));
      } else {
        alert(t('toast.partner.profile.save_error') || 'Có lỗi xảy ra khi lưu thay đổi.');
      }
    } catch (err) {
      console.error(err);
      alert(t('toast.voucher.connection_error') || 'Lỗi kết nối.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">{t('partner.settings.title')}</h1>
        <p className="text-gray-500">{t('partner.settings.subtitle')}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
          <div className="px-6 pt-4 border-b">
            <TabsList className="bg-transparent gap-6 p-0 h-auto">
              <TabsTrigger
                value="business"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-b-primary rounded-none px-0 pb-3 gap-2"
              >
                <Store className="w-4 h-4" />
                {t('partner.settings.tab_business')}
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-b-primary rounded-none px-0 pb-3 gap-2"
              >
                <Shield className="w-4 h-4" />
                {t('partner.settings.tab_security')}
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-b-primary rounded-none px-0 pb-3 gap-2"
              >
                <Settings className="w-4 h-4" />
                {t('partner.settings.tab_settings')}
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>

        <div className="p-6">
          {currentTab === 'business' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4">
                <div className="border rounded-xl p-6 flex flex-col items-center text-center">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md mb-4" />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-4xl font-bold mb-4">
                      BD
                    </div>
                  )}
                  <h2 className="text-xl font-bold mb-2">{formData.businessName}</h2>
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100 mb-6">
                    {t('partner.settings.business.verified')}
                  </Badge>
                  <Button
                    variant="outline"
                    className="w-full gap-2 z-10"
                    onClick={() => setIsUploadModalOpen(true)}
                  >
                    <Camera className="w-4 h-4" />
                    {t('partner.settings.business.change_avatar')}
                  </Button>
                </div>
              </div>

              <div className="lg:col-span-8 space-y-6">
                <div className="border rounded-xl p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-6">
                    <h2 className="text-lg font-bold">{t('partner.settings.business.info_title')}</h2>
                    {isEditing ? (
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          {t('partner.settings.business.cancel')}
                        </Button>
                        <Button onClick={handleSave} className="gap-2">
                          <Save className="w-4 h-4" />
                          {t('partner.settings.business.save')}
                        </Button>
                      </div>
                    ) : (
                      <Button variant="outline" onClick={() => setIsEditing(true)} className="gap-2">
                        <Edit2 className="w-4 h-4" />
                        {t('partner.settings.business.edit')}
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-sm font-medium">{t('partner.settings.business.name')}</label>
                      <Input
                        value={formData.businessName}
                        onChange={handleChange('businessName')}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t('partner.settings.business.type')}</label>
                      <Input
                        value={formData.businessType}
                        onChange={handleChange('businessType')}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t('partner.settings.business.tax_code')}</label>
                      <Input
                        value={formData.taxCode}
                        onChange={handleChange('taxCode')}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t('partner.settings.business.email')}</label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={handleChange('email')}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t('partner.settings.business.phone')}</label>
                      <Input
                        value={formData.phone}
                        onChange={handleChange('phone')}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <label className="text-sm font-medium">{t('partner.settings.business.website')}</label>
                      <Input
                        value={formData.website}
                        onChange={handleChange('website')}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <label className="text-sm font-medium">{t('partner.settings.business.address')}</label>
                      <textarea
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        value={formData.address}
                        onChange={handleChange('address')}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="my-8 border-t" />

                  <h2 className="text-lg font-bold mb-6">{t('partner.settings.business.rep_title')}</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-sm font-medium">{t('partner.settings.business.rep_name')}</label>
                      <Input
                        value={formData.representativeName}
                        onChange={handleChange('representativeName')}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t('partner.settings.business.rep_phone')}</label>
                      <Input
                        value={formData.representativePhone}
                        onChange={handleChange('representativePhone')}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t('partner.settings.business.rep_email')}</label>
                      <Input
                        type="email"
                        value={formData.representativeEmail}
                        onChange={handleChange('representativeEmail')}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentTab === 'security' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="border rounded-xl p-6">
                <h2 className="text-lg font-bold mb-6">{t('partner.settings.security.pwd_title')}</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('partner.settings.security.pwd_current')}</label>
                    <Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder={t('partner.settings.security.pwd_current_ph')} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('partner.settings.security.pwd_new')}</label>
                    <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder={t('partner.settings.security.pwd_new_ph')} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('partner.settings.security.pwd_confirm')}</label>
                    <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder={t('partner.settings.security.pwd_confirm_ph')} />
                  </div>
                  <Button className="w-full mt-4" onClick={async () => {
                    if (newPassword !== confirmPassword) {
                      return alert(t('toast.partner.profile.pwd_mismatch') || 'Mật khẩu mới không khớp.');
                    }
                    if (!currentPassword || !newPassword) {
                      return alert(t('toast.partner.profile.pwd_missing') || 'Vui lòng điền đủ thông tin mật khẩu.');
                    }
                    try {
                      const partnerId = localStorage.getItem('partnerId') || '1';
                      const res = await fetch(`http://localhost:5000/api/partners/${partnerId}/password`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ currentPassword, newPassword })
                      });
                      const data = await res.json();
                      if (res.ok) {
                        toast.success(data.message);
                        setCurrentPassword("");
                        setNewPassword("");
                        setConfirmPassword("");
                      } else {
                        alert(data.message || t('toast.partner.profile.pwd_error') || 'Lỗi cập nhật mật khẩu.');
                      }
                    } catch (e) {
                      console.error(e);
                      alert(t('toast.voucher.connection_error') || 'Lỗi kết nối.');
                    }
                  }}>
                    {t('partner.settings.security.pwd_update_btn')}
                  </Button>
                </div>
              </div>

              <div className="space-y-6">
                <div className="border rounded-xl p-6">
                  <h2 className="text-lg font-bold mb-2">{t('partner.settings.security.2fa_title')}</h2>
                  <p className="text-sm text-gray-500 mb-6">
                    {t('partner.settings.security.2fa_desc')}
                  </p>
                  <Button variant="outline" className="w-full" onClick={() => alert(t('partner.settings.security.2fa_dev') || 'Tính năng 2FA đang trong quá trình phát triển.')}>
                    {t('partner.settings.security.2fa_enable_btn')}
                  </Button>
                </div>

                <div className="border rounded-xl p-6">
                  <h2 className="text-lg font-bold mb-4">{t('partner.settings.security.sessions_title')}</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-4 border-b">
                      <div>
                        <p className="font-semibold">{t('partner.settings.security.session_chrome')}</p>
                        <p className="text-sm text-gray-500">{t('partner.settings.security.session_chrome_ip')}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 shadow-none">
                        {t('partner.settings.security.session_active')}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{t('partner.settings.security.session_safari')}</p>
                        <p className="text-sm text-gray-500">{t('partner.settings.security.session_safari_ip')}</p>
                      </div>
                      <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => alert(t('partner.settings.security.session_dev') || 'Tính năng Quản lý phiên đang trong quá trình phát triển.')}>
                        {t('partner.settings.security.session_logout')}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentTab === 'settings' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="border rounded-xl p-6">
                <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" /> {t('settings.language')}
                </h2>
                <div className="space-y-4">
                  <div
                    onClick={() => setLanguage('en')}
                    className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${language === 'en' ? 'bg-secondary border-primary' : 'hover:bg-secondary'}`}
                  >
                    <div>
                      <p className="font-semibold text-foreground">{t('settings.lang.en')}</p>
                      <p className="text-sm text-muted-foreground">{t('settings.lang.en.desc')}</p>
                    </div>
                    <div className={`w-4 h-4 rounded-full ${language === 'en' ? 'border-4 border-primary' : 'border border-border'}`}></div>
                  </div>
                  <div
                    onClick={() => setLanguage('vi')}
                    className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${language === 'vi' ? 'bg-secondary border-primary' : 'hover:bg-secondary'}`}
                  >
                    <div>
                      <p className="font-semibold text-foreground">{t('settings.lang.vi')}</p>
                      <p className="text-sm text-muted-foreground">{t('settings.lang.vi.desc')}</p>
                    </div>
                    <div className={`w-4 h-4 rounded-full ${language === 'vi' ? 'border-4 border-primary' : 'border border-border'}`}></div>
                  </div>
                </div>
              </div>

              <div className="border rounded-xl p-6">
                <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <Moon className="w-5 h-5 text-primary" /> {t('partner.settings.general.theme')}
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div>
                      <p className="font-semibold">{t('partner.settings.general.light')}</p>
                      <p className="text-sm text-gray-500">{t('partner.settings.general.light_desc')}</p>
                    </div>
                    <div className="w-4 h-4 rounded-full border-4 border-primary"></div>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer opacity-70">
                    <div>
                      <p className="font-semibold">{t('partner.settings.general.dark')}</p>
                      <p className="text-sm text-gray-500">{t('partner.settings.general.dark_desc')}</p>
                    </div>
                    <div className="w-4 h-4 rounded-full border border-gray-300"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ImageUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={async (file) => {
          try {
            const partnerId = localStorage.getItem('partnerId') || '1';
            const formData = new FormData();
            formData.append('avatar', file);

            const res = await fetch(`http://localhost:5000/api/partners/${partnerId}/upload-avatar`, {
              method: 'POST',
              body: formData,
            });

            if (res.ok) {
              const data = await res.json();
              setAvatarUrl(data.avatarUrl);
              setIsUploadModalOpen(false);
              setAvatarSuccess(true);
            } else {
              alert(t('toast.voucher.image_upload_error') || 'Lỗi tải ảnh lên máy chủ.');
            }
          } catch (error) {
            console.error('Error uploading avatar:', error);
            alert(t('toast.voucher.connection_error') || 'Lỗi kết nối khi tải ảnh.');
          }
        }}
      />

      {avatarSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 animate-in fade-in zoom-in duration-200 shadow-2xl text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-xl mb-2">
              {t('partner.settings.business.avatar_success')}
            </h3>
            <Button
              onClick={() => setAvatarSuccess(false)}
              className="w-full py-3 mt-4"
            >
              OK
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
