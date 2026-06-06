import { Link, useNavigate } from "react-router";
import { Search, ShoppingCart, User, Diamond } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { useLanguage } from "../../shared/contexts/LanguageContext";
import { useCartStore } from "../../../store/useCartStore";

interface NavbarProps {
  isLoggedIn?: boolean;
  showSearch?: boolean;
}

export function Navbar({ isLoggedIn = false, showSearch = true }: NavbarProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const { items } = useCartStore(); 
  const cartCount = items.reduce( ( total, item ) => total + item.quantity, 0 );

  const handleSearch = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    const keyword =
      searchQuery.trim();

    if (!keyword) return;

    navigate(
      `/search?q=${encodeURIComponent(
        keyword
      )}`
    );
  };



  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
      <div className="max-w-[1440px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <Diamond className="w-8 h-8 text-primary fill-primary" />
            <span className="text-xl font-bold text-foreground">VoucherHub</span>
          </Link>

          {/* Search Bar */}
          {showSearch && (
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={t('nav.search_placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}

                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch(
                        e as any
                      );
                    }
                  }}

                  className="flex-1 px-4 py-2 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-colors flex items-center gap-2"
                >
                  <Search className="w-5 h-5" />
                  {t('nav.search')}
                </button>
              </div>
            </form>
          )}

          {/* Right Actions */}
          <div className="flex items-center gap-4 shrink-0">
            {isLoggedIn ? (
              <>
                <div className="relative group">
                  <button className="flex items-center gap-2 text-foreground hover:text-primary transition-colors p-2">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                      {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="hidden md:inline font-medium">{user?.username || t('nav.account')}</span>
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                    <Link
                      to="/profile/customer"
                      className="block px-4 py-3 text-sm hover:bg-secondary transition-colors"
                    >
                      {t('nav.my_profile')}
                    </Link>
                    <Link
                      to="/orders"
                      className="block px-4 py-3 text-sm hover:bg-secondary transition-colors"
                    >
                      {t('nav.order_history')}
                    </Link>
                    <div className="border-t border-border"></div>
                    <button
                      onClick={() => {
                        logout();
                        navigate('/');
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-destructive hover:bg-destructive/10 transition-colors font-semibold"
                    >
                      {t('nav.logout')}
                    </button>
                  </div>
                </div>
                
                <Link
                  to="/cart"
                  className="flex items-center gap-2 text-foreground hover:text-primary transition-colors relative p-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute top-0 right-0 bg-destructive text-white text-xs rounded-full w-5 h-5 flex items-center justify-center transform translate-x-1 -translate-y-1">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 text-foreground hover:text-primary transition-colors font-medium"
              >
                <User className="w-5 h-5" />
                <span>{t('nav.login_register')}</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
