import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { Star, MapPin, Globe, Phone, Mail, ChevronDown, ChevronUp, ArrowLeft } from "lucide-react";
import { VoucherCard, Voucher } from "../components/VoucherCard";
import { useLanguage } from "../../shared/contexts/LanguageContext";

export function BrandStorePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [readMoreAbout, setReadMoreAbout] = useState(false);
  const [sortOption, setSortOption] = useState("default");
  const [activeTab, setActiveTab] = useState<'vouchers' | 'reviews'>('vouchers');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 4;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storeData, setStoreData] = useState<any>(null);

  useEffect(() => {
    const fetchBrandDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/brands/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch store details');
        }
        const data = await response.json();
        setStoreData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBrandDetails();
    }
  }, [id]);

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  if (error || !storeData) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-red-500">{error || "Store not found"}</div>;
  }

  const { store, branches, vouchers, reviews } = storeData;

  const sortedVouchers = [...vouchers].sort((a: any, b: any) => {
    if (sortOption === "price_low_high") return a.price - b.price;
    if (sortOption === "price_high_low") return b.price - a.price;
    return 0; // default
  });

  const totalPages = Math.ceil(sortedVouchers.length / ITEMS_PER_PAGE);
  const paginatedVouchers = sortedVouchers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Hero Banner */}
      <div className="relative h-[300px] w-full bg-primary/20">
        <img
          src="https://images.unsplash.com/photo-1542840410-3092f99611a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGF8ZW58MXx8fHwxNzc5NjQxMjEyfDA&ixlib=rb-4.1.0&q=80&w=1920"
          alt="Brand Banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40 transition-colors text-white"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 mt-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Info */}
          <div className="w-full lg:w-[360px] shrink-0 space-y-6">
            
            {/* Store Stats Bento Box */}
            <div className="bg-white rounded-xl shadow-sm border border-border p-6 flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full border-4 border-gray-50 bg-white overflow-hidden shadow-sm shrink-0">
                  <img 
                    src={store.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(store.name)}&background=f59e0b&color=fff&size=128`} 
                    alt="Brand Logo" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground leading-tight mb-1">{store.name}</h1>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" /> {branches.length > 0 ? branches[0].address.split(',')[0] : 'Online'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100 text-center">
                <div>
                  <p className="text-lg font-bold text-primary">{store.totalSales}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t('store.sales')}</p>
                </div>
                <div className="border-l border-r border-gray-100">
                  <p className="text-lg font-bold text-primary flex items-center justify-center gap-1">
                    <Star className="w-4 h-4 fill-primary" /> {store.rating ? store.rating.toFixed(1) : '0.0'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{t('store.rating')}</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-primary">{store.joinedDate || 'N/A'}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t('store.joined')}</p>
                </div>
              </div>
            </div>

            {/* About Store */}
            <div className="bg-white rounded-xl shadow-sm border border-border p-6">
              <h3 className="font-bold text-lg mb-4">{t('store.about')}</h3>
              <div className="text-sm text-muted-foreground mb-4 leading-relaxed">
                <p className={readMoreAbout ? "" : "line-clamp-4"}>
                  {store.about || "Chưa có mô tả chi tiết cho đối tác này."}
                </p>
                {store.about && store.about.length > 150 && (
                  <button 
                    onClick={() => setReadMoreAbout(!readMoreAbout)}
                    className="text-primary mt-2 underline hover:opacity-80"
                  >
                    {readMoreAbout ? t('store.read_less') : t('store.read_more')}
                  </button>
                )}
              </div>

              <div className="space-y-4 text-sm pt-4 border-t border-gray-100">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Phone className="w-4 h-4 text-primary" />
                  <span>{store.phone || "Đang cập nhật"}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="w-4 h-4 text-primary" />
                  <span>{store.email || "Đang cập nhật"}</span>
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-white rounded-xl shadow-sm border border-border p-6">
              <h3 className="font-bold text-lg mb-4">{t('store.business_hours')}</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Giờ hoạt động</span>
                  <span className="font-medium">
                    {store.openTime && store.closeTime 
                      ? `${store.openTime} - ${store.closeTime}` 
                      : "Đang cập nhật"}
                  </span>
                </li>
              </ul>
            </div>

            {/* Available Branches */}
            <div className="bg-white rounded-xl shadow-sm border border-border p-6">
              <h3 className="font-bold text-lg mb-4">{t('store.branches')}</h3>
              <div className="space-y-4 text-sm">
                {branches.length > 0 ? (
                  branches.slice(0, 3).map((branch: any, idx: number) => (
                    <div key={idx}>
                      <p className="font-medium text-foreground">{branch.name}</p>
                      <p className="text-muted-foreground flex gap-1 mt-1">
                        <MapPin className="w-4 h-4 shrink-0" />
                        <span>{branch.address}</span>
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">Chưa có thông tin chi nhánh.</p>
                )}
              </div>
              {branches.length > 3 && (
                <button className="text-primary mt-4 underline text-sm hover:opacity-80">
                  {t('store.view_all_branches')}
                </button>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-8">
            
            {/* Tabs */}
            <div className="flex border-b border-border mb-6">
              <button 
                onClick={() => setActiveTab('vouchers')} 
                className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'vouchers' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
              >
                {t('store.available_vouchers')} ({vouchers.length})
              </button>
              <button 
                onClick={() => setActiveTab('reviews')} 
                className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'reviews' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
              >
                {t('store.reviews.count', { count: reviews.length })}
              </button>
            </div>

            {activeTab === 'vouchers' ? (
              <div>
                {/* Vouchers Grid */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-end mb-6 gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500">{t('store.filter.sort_by')}</span>
                    <select 
                      className="border rounded-md px-3 py-2 text-sm bg-white"
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value)}
                    >
                      <option value="default">{t('store.filter.default')}</option>
                      <option value="price_low_high">{t('store.filter.price_low_high')}</option>
                      <option value="price_high_low">{t('store.filter.price_high_low')}</option>
                    </select>
                  </div>
                </div>
                
                {paginatedVouchers.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      {paginatedVouchers.map((voucher: any) => (
                        <VoucherCard key={voucher.id} voucher={voucher} />
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex justify-center items-center gap-2 mt-8">
                        <button 
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="w-10 h-10 rounded-full flex items-center justify-center border border-border hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          &lt;
                        </button>
                        {[...Array(totalPages)].map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${
                              currentPage === i + 1 
                                ? "bg-primary text-white border border-primary" 
                                : "border border-border hover:bg-secondary text-foreground"
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                        <button 
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="w-10 h-10 rounded-full flex items-center justify-center border border-border hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          &gt;
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-border text-muted-foreground">
                    Chưa có voucher nào đang hoạt động.
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-border p-6 sm:p-8">
                {/* Reviews Section */}
                <div className="text-center mb-8 pb-8 border-b border-gray-100">
                  <h2 className="text-4xl font-bold text-primary mb-2">{store.rating ? store.rating.toFixed(1) : '0.0'}/5</h2>
                  <div className="flex justify-center mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={`w-5 h-5 ${store.rating && store.rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                    ))}
                  </div>
                  <p className="text-muted-foreground">{t('store.reviews.count', { count: reviews.length })}</p>
                </div>

                {reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review: any) => (
                      <div key={review.id} className="pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                        <div className="mb-2">
                          <p className="font-bold text-foreground">{review.user}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <div className="flex">
                              {[...Array(review.rating)].map((_, i) => (
                                <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                              ))}
                            </div>
                            <span>•</span>
                            <span>{review.date}</span>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-3">{review.comment}</p>
                        {review.image && (
                          <img src={review.image} alt="Review" className="w-20 h-20 object-cover rounded-lg mb-3" />
                        )}
                        
                        {/* Store Reply */}
                        {review.reply && (
                          <div className="bg-gray-50 rounded-lg p-4 ml-4 sm:ml-8 border border-gray-100">
                            <p className="font-semibold text-sm text-primary mb-1">{review.reply.user} • <span className="text-gray-500 font-normal">{review.reply.date}</span></p>
                            <p className="text-sm text-gray-700">{review.reply.comment}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    Chưa có đánh giá nào cho đối tác này.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
