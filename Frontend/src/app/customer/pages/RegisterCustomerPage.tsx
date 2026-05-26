import { useState } from "react";
import { useNavigate } from "react-router";
import { Mail, Lock, User, Phone, Calendar, MapPin } from "lucide-react";
import { Button, Input } from "@voucherhub/ui";
import { useLanguage } from "../../shared/contexts/LanguageContext";

export function RegisterCustomerPage() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [accountType, setAccountType] = useState<"customer" | "partner">("customer");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate registration - navigate to login
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-secondary">
      
      <main className="flex-1 px-6 py-12">
        <div className="max-w-[760px] mx-auto">
          {/* Card */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            {/* Header */}
            <h2 className="text-3xl font-bold mb-2">{t('auth.register_title')}</h2>
            <p className="text-muted mb-6">
              {t('auth.register_desc')}
            </p>

            {/* Section Title */}
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-4">
              {t('profile.personal_information')}
            </h3>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Two-column grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Username */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    {t('profile.username')}
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

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    {t('auth.email')}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder={t('auth.email_ph')}
                      className="pl-10 py-6 bg-input-background"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    {t('auth.password')}
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

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    {t('profile.full_name')}
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

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    {t('profile.phone')}
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="tel"
                      placeholder={t('auth.phone_ph')}
                      className="pl-10 py-6 bg-input-background"
                      required
                    />
                  </div>
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    {t('profile.dob')}
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="date"
                      className="pl-10 py-6 bg-input-background"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Gender - Full Width */}
              <div>
                <label className="block text-sm font-semibold mb-2">{t('profile.gender')}</label>
                <select className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary">
                  <option>{t('auth.select_gender')}</option>
                  <option>{t('profile.gender.male')}</option>
                  <option>{t('profile.gender.female')}</option>
                  <option>{t('profile.gender.other')}</option>
                  <option>{t('auth.prefer_not_say')}</option>
                </select>
              </div>

              {/* Address - Full Width */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  {t('profile.address')}
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-4 w-5 h-5 text-muted-foreground" />
                  <textarea
                    placeholder={t('auth.address_ph')}
                    rows={3}
                    className="w-full pl-10 pr-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full py-6 bg-primary hover:opacity-90 text-primary-foreground font-bold mt-6"
              >
                {t('auth.register_now')}
              </Button>

              {/* Login Link */}
              <p className="text-center text-sm text-muted-foreground">
                {t('auth.already_have_account')}{" "}
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
    </div>
  );
}
