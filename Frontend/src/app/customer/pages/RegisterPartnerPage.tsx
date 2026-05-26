import { useState } from "react";
import { useNavigate } from "react-router";
import { Mail, Lock, User, Briefcase, Building2, FileText, Info } from "lucide-react";
import { Button, Input } from "@voucherhub/ui";
import { useLanguage } from "../../shared/contexts/LanguageContext";

export function RegisterPartnerPage() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [accountType, setAccountType] = useState<"customer" | "partner">("partner");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate registration - show success message
    alert(t('auth.partner_submit_alert'));
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-secondary">
      
      <main className="flex-1 px-6 py-12">
        <div className="max-w-[760px] mx-auto">
          {/* Card */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            {/* Header */}
            <h2 className="text-3xl font-bold mb-2">{t('auth.partner_register_title')}</h2>
            <p className="text-muted mb-6">
              {t('auth.partner_register_desc')}
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Account Details */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
                    {t('auth.account_details')}
                  </h3>

                  {/* Username */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      {t('auth.partner_username')} <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder={t('auth.username_ph')}
                        className="pl-10 py-6 bg-input-background"
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      {t('auth.partner_password')} <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="password"
                        placeholder={t('profile.new_password_ph')}
                        className="pl-10 py-6 bg-input-background"
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      {t('auth.email')} <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="business@company.com"
                        className="pl-10 py-6 bg-input-background"
                        required
                      />
                    </div>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      {t('auth.partner_fullname')} <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder={t('auth.fullname_ph')}
                        className="pl-10 py-6 bg-input-background"
                        required
                      />
                    </div>
                  </div>

                  {/* Job Position */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      {t('auth.job_position')} <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder={t('auth.job_position_ph')}
                        className="pl-10 py-6 bg-input-background"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column - Business Details */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
                    {t('auth.business_details')}
                  </h3>

                  {/* Company Name */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      {t('auth.company_name')} <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder={t('auth.company_name_ph')}
                        className="pl-10 py-6 bg-input-background"
                        required
                      />
                    </div>
                  </div>

                  {/* Tax ID */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      {t('auth.tax_id')} <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder={t('auth.tax_id_ph')}
                        className="pl-10 py-6 bg-input-background"
                        required
                      />
                    </div>
                  </div>

                  {/* Legal Representative */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      {t('auth.legal_rep')} <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder={t('auth.legal_rep_ph')}
                        className="pl-10 py-6 bg-input-background"
                        required
                      />
                    </div>
                  </div>

                  {/* Business Field */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      {t('auth.business_field')} <span className="text-destructive">*</span>
                    </label>
                    <select
                      className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    >
                      <option>{t('auth.biz_field.retail')}</option>
                      <option>{t('auth.biz_field.food')}</option>
                      <option>{t('auth.biz_field.travel')}</option>
                      <option>{t('auth.biz_field.health')}</option>
                      <option>{t('auth.biz_field.entertainment')}</option>
                      <option>{t('auth.biz_field.auto')}</option>
                      <option>{t('auth.biz_field.edu')}</option>
                      <option>{t('auth.biz_field.other')}</option>
                    </select>
                  </div>

                  {/* Info Box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                    <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-900">
                      {t('auth.business_info_warning')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full py-6 bg-primary hover:opacity-90 text-primary-foreground font-bold mt-8"
              >
                {t('auth.submit_application')}
              </Button>

              {/* Note */}
              <p className="text-sm text-muted-foreground mt-4">
                <span className="text-destructive">*</span> {t('auth.review_notice')}
              </p>

              {/* Login Link */}
              <p className="text-center text-sm text-muted-foreground mt-4">
                {t('auth.already_partner')}{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-primary hover:underline font-semibold"
                >
                  {t('auth.login_here')}
                </button>
              </p>

              {/* Footer Links */}
              <div className="flex justify-center gap-6 mt-6 text-xs text-muted-foreground">
                <a href="/not-implemented" className="hover:text-primary">{language === 'vi' ? 'Chính Sách Bảo Mật' : 'Privacy Policy'}</a>
                <a href="/not-implemented" className="hover:text-primary">{language === 'vi' ? 'Điều Khoản Dịch Vụ' : 'Terms of Service'}</a>
                <a href="/not-implemented" className="hover:text-primary">{t('auth.partner_agreement')}</a>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
