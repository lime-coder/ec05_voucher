import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Mail, Lock, User, Phone, Calendar, MapPin, CheckCircle } from "lucide-react";
import { Button, Input } from "@voucherhub/ui";
import { useLanguage } from "../../shared/contexts/LanguageContext";

export function RegisterCustomerPage() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [step, setStep] = useState<"form" | "otp" | "success">("form");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [timer, setTimer] = useState(30);
  const [otpError, setOtpError] = useState("");
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "otp" && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const generateAndSendOtp = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setTimer(30);
    setOtpError("");
    setOtp("");
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 15000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("otp");
    generateAndSendOtp();
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp === generatedOtp) {
      setStep("success");
      setShowNotification(false);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } else {
      setOtpError(t('auth.invalid_otp') || "Invalid OTP code. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-secondary">
      
      <main className="flex-1 px-6 py-12">
        <div className="max-w-[760px] mx-auto">
          {/* Card */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            {step === "success" ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
                <h3 className="text-2xl font-bold mb-4">{t('auth.customer_register_success_title')}</h3>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  {t('auth.customer_register_success')}
                </p>
                <p className="text-sm font-semibold text-primary animate-pulse mb-6">Redirecting to login automatically...</p>
                <Button onClick={() => navigate('/login')} className="px-8">
                  {t('auth.login_here')}
                </Button>
              </div>
            ) : step === "otp" ? (
              <div className="text-center py-12">
                <Mail className="w-16 h-16 text-primary mx-auto mb-6" />
                <h3 className="text-2xl font-bold mb-4">Verify Your Email</h3>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  We've sent a 6-digit code to your email. Please enter it below to confirm your account.
                </p>
                <form onSubmit={handleVerifyOtp} className="max-w-xs mx-auto space-y-4">
                  <div>
                    <Input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      className="text-center text-2xl tracking-widest py-6 bg-input-background font-mono"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required
                    />
                    {otpError && <p className="text-red-500 text-sm mt-2">{otpError}</p>}
                  </div>
                  <Button type="submit" className="w-full py-6 font-bold" disabled={otp.length !== 6}>
                    Verify OTP
                  </Button>
                </form>
                <div className="mt-8">
                  {timer > 0 ? (
                    <p className="text-muted-foreground text-sm">Resend code in <span className="font-bold text-primary">{timer}s</span></p>
                  ) : (
                    <Button variant="outline" onClick={generateAndSendOtp} className="text-sm">
                      Resend OTP
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <>
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
            </>
            )}
          </div>
        </div>
      </main>

      {/* Custom Notification Toast for Mock OTP */}
      {showNotification && (
        <div className="fixed top-6 right-6 z-50 bg-white border border-border shadow-xl rounded-xl p-4 max-w-sm animate-in slide-in-from-top-2 fade-in duration-300">
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 p-2 rounded-full text-primary shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-foreground">Email sent!</h4>
              <p className="text-xs text-muted-foreground mt-1">An email with your OTP code has been sent to your account.</p>
              <div className="mt-3 bg-secondary rounded p-3 text-center border border-border">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Your OTP Code:</span>
                <p className="text-3xl font-black text-primary tracking-widest mt-1 font-mono">{generatedOtp}</p>
              </div>
            </div>
            <button onClick={() => setShowNotification(false)} className="text-muted-foreground hover:text-foreground ml-auto shrink-0 p-1">
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
