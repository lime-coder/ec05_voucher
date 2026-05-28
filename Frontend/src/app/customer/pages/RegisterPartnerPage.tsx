import { useState } from "react";
import { useNavigate } from "react-router";
import { Mail, Lock, User, Briefcase, Building2, FileText, Info, CheckCircle2 } from "lucide-react";
import { Button, Input, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@voucherhub/ui";
import { useLanguage } from "../../shared/contexts/LanguageContext";

export function RegisterPartnerPage() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [accountType, setAccountType] = useState<"customer" | "partner">("partner");
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccessDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsSuccessDialogOpen(false);
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

              {/* Legal Text */}
              <p className="text-xs text-muted-foreground text-center mt-4">
                {t('auth.register_terms').split('Terms of Service')[0]}<a href="/not-implemented" className="text-primary hover:underline">{language === 'vi' ? 'Điều Khoản Dịch Vụ' : 'Terms of Service'}</a>{t('auth.register_terms').includes('and') ? ' and ' : ' và '}<a href="/not-implemented" className="text-primary hover:underline">{language === 'vi' ? 'Chính Sách Bảo Mật' : 'Privacy Policy'}</a>{t('auth.register_terms').split('Privacy Policy')[1] || t('auth.register_terms').split('Chính Sách Bảo Mật')[1]}
              </p>
            </form>
          </div>
        </div>
      </main>

      <Dialog open={isSuccessDialogOpen} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent className="sm:max-w-md text-center">
          <div className="flex justify-center pt-6 pb-2">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-2xl text-center font-bold">
              {t('auth.partner_register_success_title')}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              {t('auth.partner_register_success_msg')}
            </p>
          </div>
          <DialogFooter className="sm:justify-center flex-col sm:flex-col gap-2">
            <Button onClick={handleCloseDialog} className="w-full">
              {t('auth.login_here')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
