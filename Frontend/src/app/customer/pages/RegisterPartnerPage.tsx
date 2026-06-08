import { useState } from "react";
import { useNavigate } from "react-router";
import { Mail, Lock, User, Briefcase, Building2, FileText, Info, CheckCircle2, Circle, Phone } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@voucherhub/ui";
import { useLanguage } from "../../shared/contexts/LanguageContext";
import { registerPartnerSchema, type RegisterPartnerInput } from "../../../lib/validations/auth";
import api from "../../../lib/api";

export function RegisterPartnerPage() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterPartnerInput>({
    resolver: zodResolver(registerPartnerSchema as any),
  });

  const passwordValue = watch("password", "");
  const confirmPasswordValue = watch("confirmPassword", "");

  const onRegisterSubmit = async (data: RegisterPartnerInput) => {
    setIsSubmitting(true);
    setRegisterError("");
    try {
      // 1. Check availability
      await api.post('/auth/check-availability', {
        username: data.username,
        email: data.email,
      });

      // 2. Register
      const payload = {
        TenDangNhap: data.username,
        MatKhau: data.password,
        Email: data.email,
        TenDoanhNghiep: data.companyName,
        MaSoThue: data.taxId,
        CaNhanDaiDien: data.legalRep,
        LinhVucKinhDoanh: data.businessField,
        ChucVu: data.jobPosition,
        EmailLienHe: data.companyEmail,
        SDTLienHe: data.companyPhone,
      };
      
      await api.post('/auth/register/partner', payload);
      
      // 3. Show success
      setIsSuccessDialogOpen(true);
    } catch (error: any) {
      setRegisterError(error.response?.data?.message || "Registration failed. Please check your information.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseDialog = () => {
    setIsSuccessDialogOpen(false);
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-secondary">
      <main className="flex-1 px-6 py-12">
        <div className="max-w-[760px] mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold mb-2">{t('auth.partner_register_title')}</h2>
            <p className="text-muted mb-6">
              {t('auth.partner_register_desc')}
            </p>

            {registerError && (
              <div className="p-3 mb-4 text-sm text-destructive bg-destructive/10 rounded-md">
                {registerError}
              </div>
            )}

            <form onSubmit={handleSubmit(onRegisterSubmit)}>
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
                        {...register("username")}
                      />
                    </div>
                    {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
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
                        {...register("email")}
                      />
                    </div>
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
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
                        {...register("password")}
                      />
                    </div>
                    <ul className="mt-3 ml-4 space-y-1 text-xs">
                      {[
                        { test: passwordValue.length >= 8, label: t('auth.pwd_min_8') || "At least 8 characters" },
                        { test: /[A-Z]/.test(passwordValue), label: t('auth.pwd_uppercase') || "At least one uppercase letter" },
                        { test: /[a-z]/.test(passwordValue), label: t('auth.pwd_lowercase') || "At least one lowercase letter" },
                        { test: /[0-9]/.test(passwordValue), label: t('auth.pwd_digit') || "At least one digit" },
                      ].map((rule) => (
                        <li key={rule.label} className={`flex items-center gap-1.5 ${rule.test ? "text-green-600" : (errors.password ? "text-red-500" : "text-muted-foreground")}`}>
                          {rule.test ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                          {rule.label}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      {t('auth.confirm_password') || "Confirm Password"} <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="password"
                        placeholder={t('auth.confirm_password_ph') || "Re-enter your password"}
                        className={`pl-10 py-6 bg-input-background ${confirmPasswordValue && passwordValue !== confirmPasswordValue ? "border-red-500" : ""}`}
                        {...register("confirmPassword")}
                      />
                    </div>
                    {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
                    {!errors.confirmPassword && confirmPasswordValue && passwordValue !== confirmPasswordValue && (
                      <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
                    )}
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
                        {...register("jobPosition")}
                      />
                    </div>
                    {errors.jobPosition && <p className="text-red-500 text-xs mt-1">{errors.jobPosition.message}</p>}
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
                        {...register("companyName")}
                      />
                    </div>
                    {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName.message}</p>}
                  </div>

                  {/* Company Email */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      {t('auth.company_email') || "Company Email"} <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="contact@company.com"
                        className="pl-10 py-6 bg-input-background"
                        {...register("companyEmail")}
                      />
                    </div>
                    {errors.companyEmail && <p className="text-red-500 text-xs mt-1">{errors.companyEmail.message}</p>}
                  </div>

                  {/* Company Phone */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      {t('auth.company_phone') || "Company Phone"} <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="0123456789"
                        className="pl-10 py-6 bg-input-background"
                        {...register("companyPhone")}
                      />
                    </div>
                    {errors.companyPhone && <p className="text-red-500 text-xs mt-1">{errors.companyPhone.message}</p>}
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
                        {...register("taxId")}
                      />
                    </div>
                    {errors.taxId && <p className="text-red-500 text-xs mt-1">{errors.taxId.message}</p>}
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
                        {...register("legalRep")}
                      />
                    </div>
                    {errors.legalRep && <p className="text-red-500 text-xs mt-1">{errors.legalRep.message}</p>}
                  </div>

                  {/* Business Field */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      {t('auth.business_field')} <span className="text-destructive">*</span>
                    </label>
                    <select
                      {...register("businessField")}
                      className={`w-full px-4 py-3 bg-input-background rounded-lg border ${errors.businessField ? 'border-red-500' : 'border-border'} focus:outline-none focus:ring-2 focus:ring-primary`}
                    >
                      <option value="">Select a field</option>
                      <option value="retail">{t('auth.biz_field.retail')}</option>
                      <option value="food">{t('auth.biz_field.food')}</option>
                      <option value="travel">{t('auth.biz_field.travel')}</option>
                      <option value="health">{t('auth.biz_field.health')}</option>
                      <option value="entertainment">{t('auth.biz_field.entertainment')}</option>
                      <option value="auto">{t('auth.biz_field.auto')}</option>
                      <option value="edu">{t('auth.biz_field.edu')}</option>
                      <option value="other">{t('auth.biz_field.other')}</option>
                    </select>
                    {errors.businessField && <p className="text-red-500 text-xs mt-1">{errors.businessField.message}</p>}
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
                disabled={isSubmitting}
                className="w-full py-6 bg-primary hover:opacity-90 text-primary-foreground font-bold mt-8"
              >
                {isSubmitting ? "Submitting..." : t('auth.submit_application')}
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
