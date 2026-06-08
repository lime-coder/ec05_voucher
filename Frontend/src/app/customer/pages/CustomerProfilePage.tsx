import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { User, Mail, Phone, MapPin, Calendar, Save, ShieldCheck, Camera, Settings, Moon, Globe } from "lucide-react";
import { Button, Input } from "@voucherhub/ui";
import { ImageUploadModal } from "../../shared/components/ImageUploadModal";
import { useLanguage } from "../../shared/contexts/LanguageContext";
import api from "../../../lib/api";
import { useEffect } from "react";
import { toast } from "sonner";

export function CustomerProfilePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "settings">((searchParams.get("tab") as any) || "profile");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("https://ui-avatars.com/api/?name=Alex+Walker&background=f59e0b&color=fff&size=128");
  const [formData, setFormData] = useState({
    username: "alex_walker_99",
    fullName: "Alex Walker",
    email: "alex.walker@provider.com",
    phone: "+1 (555) 000-1234",
    gender: "MALE",
    dateOfBirth: "1995-06-15",
    address: "123 Industrial Way, Suite 400, New York, NY",
  });
  const [originalData, setOriginalData] = useState(formData);
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/me');
        const data = res.data.user;
        const mappedData = {
          username: data.TenDangNhap || "",
          fullName: data.HoTenNguoiDung || "",
          email: data.Email || "",
          phone: data.KhachHang?.SDT_KH || "",
          gender: data.KhachHang?.GioiTinh || "MALE",
          dateOfBirth: data.KhachHang?.NgaySinh ? new Date(data.KhachHang.NgaySinh).toISOString().split('T')[0] : "",
          address: data.KhachHang?.DiaChi_KH || "",
        };
        setFormData(mappedData);
        setOriginalData(mappedData);
      } catch (error) {
        toast.error("Failed to fetch profile");
      }
    };
    fetchProfile();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const [modalState, setModalState] = useState<{isOpen: boolean, title: string, message: string, onConfirm?: () => void}>({
    isOpen: false,
    title: "",
    message: ""
  });

  const handleSave = async () => {
    try {
      await api.put('/customers/profile', {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender,
        dob: formData.dateOfBirth,
        address: formData.address,
      });
      setOriginalData(formData);
      setModalState({ isOpen: true, title: t('profile.success_title'), message: t('profile.success_update_profile') });
    } catch (error) {
      toast.error("Failed to save profile");
    }
  };

  const handleUpdatePassword = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error(t('profile.pwd_mismatch') || "Passwords do not match");
      return;
    }
    if (!passwords.currentPassword || !passwords.newPassword) {
      toast.error(t('profile.pwd_missing') || "Please fill all password fields");
      return;
    }
    try {
      await api.put('/customers/password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setModalState({ isOpen: true, title: t('profile.success_title'), message: t('profile.success_update_password') });
    } catch (error: any) {
      toast.error(error.response?.data?.message ? t(error.response.data.message as string) : "Failed to update password");
    }
  };

  const handleDiscard = (e: React.MouseEvent) => {
    e.preventDefault();
    setFormData(originalData);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      
      <main className="flex-1 max-w-[1440px] mx-auto px-6 py-8 w-full">
        {/* Page Header */}
        <div className="border-l-4 border-primary pl-6 mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t('profile.title')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('profile.desc')}
          </p>
        </div>

        <div className="border-t border-border mb-8" />

        {/* 2 Column Layout */}
        <div className="flex flex-col md:flex-row gap-12">
          {/* Left Sidebar */}
          <aside className="w-full md:w-[240px] shrink-0">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === "profile"
                    ? "font-bold text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <User className="w-5 h-5" />
                <span>{t('profile.tab.personal_info')}</span>
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === "security"
                    ? "font-bold text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <ShieldCheck className="w-5 h-5" />
                <span>{t('profile.tab.security')}</span>
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === "settings"
                    ? "font-bold text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <Settings className="w-5 h-5" />
                <span>{t('profile.tab.settings')}</span>
              </button>
            </nav>
          </aside>

          {/* Right Content - Form */}
          <div className="flex-1">
            {activeTab === "profile" ? (
              <>
                {/* Section Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <User className="w-5 h-5 text-primary" />
                    <h2 className="font-bold text-lg">{t('profile.personal_information')}</h2>
                  </div>
                  <div className="border-t border-border" />
                </div>

                {/* Avatar */}
                <div className="mb-8 flex items-center gap-6">
                  <div className="relative">
                    <img src={avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-background shadow-md" />
                    <button 
                      onClick={() => setIsUploadModalOpen(true)}
                      className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center hover:opacity-90 transition-opacity shadow-sm"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{t('profile.profile_picture')}</h3>
                    <p className="text-sm text-muted-foreground">{t('profile.picture_desc')}</p>
                  </div>
                </div>

                {/* Form */}
                <div className="space-y-6">
                  {/* Username - Non-editable */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                      <User className="w-4 h-4" />
                      {t('profile.username')}
                    </label>
                    <Input
                      type="text"
                      name="username"
                      value={formData.username}
                      disabled
                      className="bg-secondary cursor-not-allowed"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('profile.username_desc')}
                    </p>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      {t('profile.full_name')}
                    </label>
                    <Input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="bg-input-background"
                    />
                  </div>

                  {/* Email & Phone */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                        <Mail className="w-4 h-4" />
                        {t('profile.email')}
                      </label>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="bg-input-background"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                        <Phone className="w-4 h-4" />
                        {t('profile.phone')}
                      </label>
                      <Input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="bg-input-background"
                      />
                    </div>
                  </div>

                  {/* Gender & Date of Birth */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        {t('profile.gender')}
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="flex h-9 w-full rounded-md border border-border bg-input-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <option value="MALE">{t('profile.gender.male')}</option>
                        <option value="FEMALE">{t('profile.gender.female')}</option>
                        <option value="OTHER">{t('profile.gender.other')}</option>
                      </select>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                        <Calendar className="w-4 h-4" />
                        {t('profile.dob')}
                      </label>
                      <Input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        className="bg-input-background"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                      <MapPin className="w-4 h-4" />
                      {t('profile.address')}
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 bg-input-background border border-border rounded-md resize-none text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleDiscard}
                      className="px-8 font-semibold"
                    >
                      {t('profile.discard')}
                    </Button>
                    <Button
                      onClick={handleSave}
                      className="px-8 font-bold flex items-center gap-2 bg-foreground text-white hover:opacity-90"
                    >
                      <Save className="w-5 h-5" />
                      {t('profile.save')}
                    </Button>
                  </div>
                </div>
              </>
            ) : activeTab === "security" ? (
              <>
                {/* Security Section Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    <h2 className="font-bold text-lg">{t('profile.change_password')}</h2>
                  </div>
                  <div className="border-t border-border" />
                </div>

                <div className="space-y-6 max-w-xl">
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      {t('profile.current_password')}
                    </label>
                    <Input
                      type="password"
                      name="currentPassword"
                      value={passwords.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder={t('profile.current_password_ph')}
                      className="bg-input-background"
                    />
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      {t('profile.new_password')}
                    </label>
                    <Input
                      type="password"
                      name="newPassword"
                      value={passwords.newPassword}
                      onChange={handlePasswordChange}
                      placeholder={t('profile.new_password_ph')}
                      className="bg-input-background"
                    />
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      {t('profile.confirm_new_password')}
                    </label>
                    <Input
                      type="password"
                      name="confirmPassword"
                      value={passwords.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder={t('profile.confirm_new_password_ph')}
                      className="bg-input-background"
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <p className="text-sm font-semibold text-blue-900 mb-2">{t('profile.password_requirements')}</p>
                    <ul className="text-sm text-blue-800 space-y-1 list-disc pl-5">
                      <li>{t('profile.req.length')}</li>
                      <li>{t('profile.req.upper')}</li>
                      <li>{t('profile.req.number')}</li>
                      <li>{t('profile.req.special')}</li>
                    </ul>
                  </div>

                  <div className="pt-4">
                    <Button
                      type="button"
                      onClick={handleUpdatePassword}
                      className="px-8 font-bold flex items-center gap-2 bg-foreground text-white hover:opacity-90"
                    >
                      <Save className="w-5 h-5" />
                      {t('profile.update_password')}
                    </Button>
                  </div>
                </div>
              </>
            ) : activeTab === "settings" ? (
              <>
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Settings className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="font-bold text-lg">{t('settings.title')}</h2>
                  </div>
                  <div className="border-t border-border" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border rounded-xl p-6 bg-background">
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
                        </div>
                        <div className={`w-4 h-4 rounded-full ${language === 'en' ? 'border-4 border-primary' : 'border border-border'}`}></div>
                      </div>
                      <div 
                        onClick={() => setLanguage('vi')}
                        className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${language === 'vi' ? 'bg-secondary border-primary' : 'hover:bg-secondary'}`}
                      >
                        <div>
                          <p className="font-semibold text-foreground">{t('settings.lang.vi')}</p>
                        </div>
                        <div className={`w-4 h-4 rounded-full ${language === 'vi' ? 'border-4 border-primary' : 'border border-border'}`}></div>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-xl p-6 bg-background">
                    <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                      <Moon className="w-5 h-5 text-primary" /> {t('settings.theme')}
                    </h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary cursor-pointer">
                        <div>
                          <p className="font-semibold text-foreground">{t('settings.theme.light')}</p>
                        </div>
                        <div className="w-4 h-4 rounded-full border-4 border-primary"></div>
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary cursor-pointer opacity-70">
                        <div>
                          <p className="font-semibold text-foreground">{t('settings.theme.dark')}</p>
                        </div>
                        <div className="w-4 h-4 rounded-full border border-border"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-border py-6 mt-auto">
        <div className="max-w-[1440px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            {t('profile.footer.copyright')}
          </p>
          <div className="flex gap-6 text-xs">
            <a href="/not-implemented" className="text-muted-foreground hover:text-foreground">
              {t('profile.footer.privacy')}
            </a>
            <a href="/not-implemented" className="text-muted-foreground hover:text-foreground">
              {t('profile.footer.terms')}
            </a>
            <a href="/not-implemented" className="text-muted-foreground hover:text-foreground">
              {t('profile.footer.support')}
            </a>
          </div>
        </div>
      </footer>

      <ImageUploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        onUpload={(file) => {
          const url = URL.createObjectURL(file);
          setAvatarUrl(url);
        }} 
      />

      {/* Custom Message Modal */}
      {modalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">{modalState.title}</h3>
              <p className="text-muted-foreground">{modalState.message}</p>
            </div>
            <div className="bg-gray-50 p-4 flex justify-center border-t border-border">
              <Button 
                onClick={() => {
                  if (modalState.onConfirm) {
                    modalState.onConfirm();
                  } else {
                    setModalState({ ...modalState, isOpen: false });
                  }
                }}
                className="w-full font-bold bg-primary text-white"
              >
                {t('profile.modal.ok')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
