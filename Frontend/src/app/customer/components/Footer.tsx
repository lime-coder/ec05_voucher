import { Diamond, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Link } from "react-router";
import { useLanguage } from "../../shared/contexts/LanguageContext";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-foreground text-white mt-auto">
      <div className="max-w-[1440px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Logo & Tagline */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Diamond className="w-8 h-8 text-primary fill-primary" />
              <span className="text-xl font-bold">VoucherHub</span>
            </div>
            <p className="text-sm text-gray-400">
              {t('footer.tagline')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">{t('footer.quick_links')}</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/" className="hover:text-primary transition-colors">{t('footer.home')}</Link></li>
              <li><Link to="/search" className="hover:text-primary transition-colors">{t('footer.browse_deals')}</Link></li>
              <li><Link to="/categories" className="hover:text-primary transition-colors">{t('footer.categories')}</Link></li>
              <li><Link to="/about" className="hover:text-primary transition-colors">{t('footer.about_us')}</Link></li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h4 className="font-semibold mb-4">{t('footer.customer_support')}</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/help" className="hover:text-primary transition-colors">{t('footer.help_center')}</Link></li>
              <li><Link to="/faq" className="hover:text-primary transition-colors">{t('footer.faq')}</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">{t('footer.contact_us')}</Link></li>
              <li><Link to="/refund" className="hover:text-primary transition-colors">{t('footer.refund_policy')}</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4">{t('footer.contact_info')}</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>{t('footer.email')}</li>
              <li>{t('footer.phone')}</li>
              <li>{t('footer.hours')}</li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold mb-4">{t('footer.follow_us')}</h4>
            <div className="flex gap-4">
              <a href="/not-implemented" className="text-gray-400 hover:text-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="/not-implemented" className="text-gray-400 hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="/not-implemented" className="text-gray-400 hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="/not-implemented" className="text-gray-400 hover:text-primary transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
          <p>{t('footer.rights')}</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-primary transition-colors">{t('footer.privacy')}</Link>
            <Link to="/terms" className="hover:text-primary transition-colors">{t('footer.terms')}</Link>
            <Link to="/cookies" className="hover:text-primary transition-colors">{t('footer.cookies')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
