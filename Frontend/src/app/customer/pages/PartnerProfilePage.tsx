import { useState } from "react";
import { useNavigate } from "react-router";
import { Building2, User, Mail, Phone, MapPin, Hash, Save, Camera } from "lucide-react";
import { Button, Input } from "@voucherhub/ui";
import { ImageUploadModal } from "../../shared/components/ImageUploadModal";
import { useLanguage } from "../../shared/contexts/LanguageContext";

export function PartnerProfilePage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("https://ui-avatars.com/api/?name=Technova+Global&background=f59e0b&color=fff&size=128");
  const [formData, setFormData] = useState({
    companyName: "TECHNOVA GLOBAL SOLUTIONS",
    taxCode: "0312984551",
    businessEmail: "admin@technova.co",
    hotline: "1900 6789",
    headquarters: "Floor 12, Landmark Tower, 72nd Street, District 1, HCMC",
    contactPersonName: "Nguyen Van Minh",
    staffEmail: "minh.nv@technova.co",
    staffPhone: "0987 654 321",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    alert(t('partner.profile_updated'));
  };

  const handleDiscard = () => {
    setFormData({
      companyName: "TECHNOVA GLOBAL SOLUTIONS",
      taxCode: "0312984551",
      businessEmail: "admin@technova.co",
      hotline: "1900 6789",
      headquarters: "Floor 12, Landmark Tower, 72nd Street, District 1, HCMC",
      contactPersonName: "Nguyen Van Minh",
      staffEmail: "minh.nv@technova.co",
      staffPhone: "0987 654 321",
    });
  };

  if (activeTab === "security") {
    navigate("/profile/security");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      
      <main className="flex-1 max-w-[1440px] mx-auto px-6 py-8 w-full">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 border border-foreground rounded-full text-xs font-semibold uppercase">
              {t('partner.mode_enterprise')}
            </span>
          </div>
          <h1 className="text-4xl font-black uppercase text-foreground mb-4">
            {t('partner.profile_mgmt')}
          </h1>
          <div className="border-t border-border" />
        </div>

        {/* Tabs Navigation */}
        <div className="flex gap-8 mb-8 border-b border-border">
          <button
            onClick={() => setActiveTab("profile")}
            className={`pb-3 font-semibold uppercase transition-colors relative ${
              activeTab === "profile"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t('partner.tab_profile')}
            {activeTab === "profile" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`pb-3 font-semibold uppercase transition-colors relative ${
              activeTab === "security"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t('partner.tab_security')}
            {activeTab === "security" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
            )}
          </button>
        </div>

        {/* Section 1 - Company Information */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-9 h-9 bg-foreground rounded flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="font-bold uppercase text-lg text-foreground">
                {t('partner.company_info')}
              </h2>
              <p className="text-sm italic text-muted-foreground">
                {t('partner.enterprise_info')}
              </p>
            </div>
          </div>
          <div className="border-t border-border mb-6" />

          {/* Avatar */}
          <div className="mb-8 flex items-center gap-6">
            <div className="relative">
              <img src={avatarUrl} alt="Company Logo" className="w-24 h-24 rounded-lg object-cover border-4 border-background shadow-md" />
              <button 
                onClick={() => setIsUploadModalOpen(true)}
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center hover:opacity-90 transition-opacity shadow-sm"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{t('partner.company_logo')}</h3>
              <p className="text-sm text-muted-foreground">{t('profile.picture_desc')}</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Company Name */}
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground mb-2">
                <Building2 className="w-4 h-4" />
                {t('partner.company_name_label')}
              </label>
              <Input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                className="bg-input-background uppercase font-semibold"
              />
            </div>

            {/* Tax Code & Business Email */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground mb-2">
                  <Hash className="w-4 h-4" />
                  {t('partner.tax_code_label')}
                </label>
                <Input
                  type="text"
                  name="taxCode"
                  value={formData.taxCode}
                  onChange={handleInputChange}
                  className="bg-input-background"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground mb-2">
                  <Mail className="w-4 h-4" />
                  {t('partner.business_email_label')}
                </label>
                <Input
                  type="email"
                  name="businessEmail"
                  value={formData.businessEmail}
                  onChange={handleInputChange}
                  className="bg-input-background"
                />
              </div>
            </div>

            {/* Hotline & Headquarters */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground mb-2">
                  <Phone className="w-4 h-4" />
                  {t('partner.hotline_label')}
                </label>
                <Input
                  type="tel"
                  name="hotline"
                  value={formData.hotline}
                  onChange={handleInputChange}
                  className="bg-input-background"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground mb-2">
                  <MapPin className="w-4 h-4" />
                  {t('partner.hq_address_label')}
                </label>
                <Input
                  type="text"
                  name="headquarters"
                  value={formData.headquarters}
                  onChange={handleInputChange}
                  className="bg-input-background"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2 - Representative Information */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-9 h-9 bg-foreground rounded flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="font-bold uppercase text-lg text-foreground">
                {t('partner.rep_info')}
              </h2>
              <p className="text-sm italic text-muted-foreground">
                {t('partner.staff_info')}
              </p>
            </div>
          </div>
          <div className="border-t border-border mb-6" />

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-2">
                {t('partner.contact_person_label')}
              </label>
              <Input
                type="text"
                name="contactPersonName"
                value={formData.contactPersonName}
                onChange={handleInputChange}
                className="bg-input-background"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-2">
                {t('partner.staff_email_label')}
              </label>
              <Input
                type="email"
                name="staffEmail"
                value={formData.staffEmail}
                onChange={handleInputChange}
                className="bg-input-background"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-2">
                {t('partner.staff_phone_label')}
              </label>
              <Input
                type="tel"
                name="staffPhone"
                value={formData.staffPhone}
                onChange={handleInputChange}
                className="bg-input-background"
              />
            </div>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="border-t border-border pt-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <p className="text-xs uppercase text-muted-foreground">
              {t('partner.review_fields')}
            </p>
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={handleDiscard}
                className="px-8 font-semibold"
              >
                {t('profile.discard')}
              </Button>
              <Button
                onClick={handleSave}
                className="px-8 font-bold flex items-center gap-2 bg-foreground text-white hover:bg-foreground/90"
              >
                <Save className="w-5 h-5" />
                {t('profile.save')}
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-border py-6 mt-12">
        <div className="max-w-[1440px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs uppercase text-muted-foreground">
            {t('partner.footer_copyright')}
          </p>
          <div className="flex gap-6 text-xs uppercase">
            <a href="/not-implemented" className="text-muted-foreground hover:text-foreground">
              {t('partner.footer_privacy')}
            </a>
            <a href="/not-implemented" className="text-muted-foreground hover:text-foreground">
              {t('partner.footer_terms')}
            </a>
            <a href="/not-implemented" className="text-muted-foreground hover:text-foreground">
              {t('partner.footer_support')}
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
    </div>
  );
}
