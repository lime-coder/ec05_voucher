import { useState } from "react";
import { useNavigate } from "react-router";
import { Mail, Lock, User, ShieldCheck, Ticket, Zap } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input } from "@voucherhub/ui";
import { useAuth } from "../../auth/AuthContext";
import { useLanguage } from "../../shared/contexts/LanguageContext";
import { loginSchema, type LoginInput, forgotPasswordSchema, type ForgotPasswordInput } from "../../../lib/validations/auth";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<"login" | "register" | "forgot_password">("login");
  const [loginError, setLoginError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema as any),
  });

  const {
    register: registerForgot,
    handleSubmit: handleForgotSubmit,
    formState: { errors: forgotErrors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema as any),
  });

  const onForgotSubmit = (data: ForgotPasswordInput) => {
    // Simulate sending email
    setForgotSuccess(true);
  };

  const onLoginSubmit = async (data: LoginInput) => {
    setLoginError("");
    setIsSubmitting(true);

    const result = await login(data.username, data.password);
    setIsSubmitting(false);

    if (result.success && result.user) {
      if (result.user.role === "admin") navigate("/admin");
      else if (result.user.role === "partner") navigate("/partner");
      else navigate("/");
    } else {
      const errorMessage = (result.error === "Invalid credentials" || result.error === "error.invalid_credentials")
        ? t('auth.invalid_credentials')
        : (result.error || "Incorrect email address or password");
      setLoginError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen md:h-screen flex flex-col md:flex-row bg-background">
      
      {/* Left side - Hero Image */}
      <div className="hidden md:flex md:w-1/2 bg-secondary relative overflow-hidden">
        <img 
          src="/login_hero.png" 
          alt="Premium dining experience" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Optional overlay to make text pop if added later */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-12">
          <div className="text-white">
            <h1 className="text-4xl font-bold mb-4">{t('auth.hero_title')}</h1>
            <p className="text-lg text-white/90">{t('auth.hero_desc')}</p>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <main className="flex-1 flex flex-col justify-center px-6 py-12 md:px-12 lg:px-24 md:overflow-y-auto">
        <div className="w-full max-w-[480px] mx-auto py-8">
          {/* Card */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            {/* Avatar */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-primary" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-center text-3xl font-bold mb-2">{t('auth.welcome_back')}</h2>
            <p className="text-center text-muted-foreground mb-6">
              {t('auth.sign_in_desc')}
            </p>

            {/* Tabs */}
            <div className="flex border-b border-border mb-6">
              <button
                onClick={() => setActiveTab("login")}
                className={`flex-1 pb-3 font-semibold transition-colors relative ${
                  activeTab === "login"
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t('auth.sign_in')}
                {activeTab === "login" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
              <button
                onClick={() => setActiveTab("register")}
                className={`flex-1 pb-3 font-semibold transition-colors relative ${
                  activeTab === "register"
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t('auth.create_account')}
                {activeTab === "register" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            </div>

            {/* Login Form */}
            {activeTab === "login" && (
              <form onSubmit={handleLoginSubmit(onLoginSubmit)} className="space-y-4">

                {/* Username Field */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    {language === 'vi' ? 'Tên đăng nhập' : 'Username'}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder={language === 'vi' ? 'Nhập tên đăng nhập của bạn' : 'Enter your username'}
                      className="pl-10 py-6 bg-input-background"
                      {...registerLogin("username")}
                    />
                  </div>
                  {loginErrors.username && (
                    <p className="text-red-500 text-xs mt-1">{loginErrors.username.message}</p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-semibold">{t('auth.password')}</label>
                    <button
                      type="button"
                      onClick={() => setActiveTab("forgot_password")}
                      className="text-sm text-primary hover:underline"
                    >
                      {t('auth.forgot_password')}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder={t('auth.password_ph')}
                      className="pl-10 py-6 bg-input-background"
                      {...registerLogin("password")}
                    />
                  </div>
                  {(loginErrors.password || loginError) && (
                    <p className="text-red-500 text-xs mt-1">
                      {loginErrors.password?.message || loginError}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-6 text-primary-foreground font-bold mt-6 hover:opacity-90"
                >
                  {isSubmitting ? "Loading..." : t('auth.sign_in')}
                </Button>
              </form>
            )}

            {/* Register Tab */}
            {activeTab === "register" && (
              <div className="space-y-4 text-center">
                <p className="text-muted-foreground mb-4">
                  {t('auth.join_desc')}
                </p>

                <Button
                  onClick={() => navigate("/register/customer")}
                  className="w-full py-6 text-primary-foreground font-bold mb-4 hover:opacity-90"
                >
                  {t('auth.register_email')}
                </Button>

                <p className="text-sm text-muted-foreground">
                  {t('auth.terms_privacy').split('Terms of Service')[0]}<a href="/not-implemented" className="text-primary hover:underline">{language === 'vi' ? 'Điều Khoản Dịch Vụ' : 'Terms of Service'}</a>{t('auth.terms_privacy').includes('and') ? ' and ' : ' và '}<a href="/not-implemented" className="text-primary hover:underline">{language === 'vi' ? 'Chính Sách Bảo Mật' : 'Privacy Policy'}</a>{t('auth.terms_privacy').split('Privacy Policy')[1] || t('auth.terms_privacy').split('Chính Sách Bảo Mật')[1]}
                </p>
                
                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-3">{t('auth.business_owner')}</p>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/register/partner")}
                    className="w-full"
                  >
                    {t('auth.partner_with_us')}
                  </Button>
                </div>
              </div>
            )}

            {/* Forgot Password Tab */}
            {activeTab === "forgot_password" && (
              <div className="space-y-4">
                {forgotSuccess ? (
                  <div className="p-4 text-center text-green-700 bg-green-50 border border-green-200 rounded-md">
                    Email have been sent if the email do associate with an account.
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full mt-4 py-4"
                      onClick={() => {
                        setForgotSuccess(false);
                        setActiveTab("login");
                      }}
                    >
                      Back to Login
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotSubmit(onForgotSubmit)} className="space-y-4">
                    <p className="text-center text-muted-foreground mb-4">
                      Enter your email address and we will send you a link to reset your password.
                    </p>
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        {t('auth.email')}
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="alex@example.com"
                          className="pl-10 py-6 bg-input-background"
                          {...registerForgot("email")}
                        />
                      </div>
                      {forgotErrors.email && (
                        <p className="text-red-500 text-xs mt-1">{forgotErrors.email.message}</p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      className="w-full py-6 text-primary-foreground font-bold mt-6 hover:opacity-90"
                    >
                      Reset Password
                    </Button>
                    <div className="text-center mt-4">
                      <button
                        type="button"
                        onClick={() => setActiveTab("login")}
                        className="text-sm text-primary hover:underline"
                      >
                        Back to Login
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <ShieldCheck className="w-8 h-8 text-primary" />
              </div>
              <h4 className="font-semibold mb-1">{t('auth.verified_partners')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('auth.certified_biz')}
              </p>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Ticket className="w-8 h-8 text-primary" />
              </div>
              <h4 className="font-semibold mb-1">{t('auth.secure_payments')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('auth.encryption')}
              </p>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h4 className="font-semibold mb-1">{t('auth.247_support')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('auth.always_help')}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
