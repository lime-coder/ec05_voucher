import { useState } from "react";
import { useParams } from "react-router";
import { Star, MapPin, Globe, Phone, Mail, ChevronDown, ChevronUp } from "lucide-react";
import { VoucherCard, Voucher } from "../components/VoucherCard";
import { useLanguage } from "../../shared/contexts/LanguageContext";

const mockVouchers: Voucher[] = [
  {
    id: "1",
    image: "https://images.unsplash.com/photo-1630595633877-9918ee257288?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGElMjB3ZWxsbmVzcyUyMG1hc3NhZ2UlMjB0cmVhdG1lbnR8ZW58MXx8fHwxNzc5MzU5NTg3fDA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "SPA",
    name: "Grand Bliss Royal Massage & Hydro-Aromatherapy",
    partner: "Ethereal Zen Wellness Spa",
    price: 129,
    originalPrice: 245,
    discount: 47,
    rating: 4.8,
    reviews: 248,
    flashDeal: true,
  },
  {
    id: "2",
    image: "https://images.unsplash.com/photo-1630595633877-9918ee257288?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGElMjB3ZWxsbmVzcyUyMG1hc3NhZ2UlMjB0cmVhdG1lbnR8ZW58MXx8fHwxNzc5MzU5NTg3fDA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "WELLNESS",
    name: "Rejuvenating Spa Day Package",
    partner: "Ethereal Zen Wellness Spa",
    price: 99,
    originalPrice: 189,
    discount: 48,
    rating: 4.5,
    reviews: 156,
  },
  {
    id: "3",
    image: "https://images.unsplash.com/photo-1630595633877-9918ee257288?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGElMjB3ZWxsbmVzcyUyMG1hc3NhZ2UlMjB0cmVhdG1lbnR8ZW58MXx8fHwxNzc5MzU5NTg3fDA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "SPA",
    name: "Hot Stone Therapy & Deep Tissue Massage",
    partner: "Ethereal Zen Wellness Spa",
    price: 149,
    originalPrice: 279,
    discount: 47,
    rating: 4.9,
    reviews: 312,
  },
  {
    id: "4",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXNzYWdlfGVufDB8fHx8MTc3OTM1OTU4Nw&ixlib=rb-4.1.0&q=80&w=1080",
    category: "SPA",
    name: "Aromatherapy Full Body Relaxation",
    partner: "Ethereal Zen Wellness Spa",
    price: 89,
    originalPrice: 150,
    discount: 40,
    rating: 4.7,
    reviews: 189,
  },
  {
    id: "5",
    image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGF8ZW58MHx8fHwxNzc5MzU5NTg3&ixlib=rb-4.1.0&q=80&w=1080",
    category: "WELLNESS",
    name: "Couples Spa Retreat Package",
    partner: "Ethereal Zen Wellness Spa",
    price: 199,
    originalPrice: 350,
    discount: 43,
    rating: 4.9,
    reviews: 420,
  },
];

const mockBranches = [
  { name: "Nhà hàng Ethereal Zen Quận 1", address: "123 Serenity Blvd, Los Angeles, CA 90001" },
  { name: "Ethereal Zen Wellness Spa - Quận 3", address: "456 Tranquil Ave, Los Angeles, CA 90002" },
  { name: "Ethereal Zen Spa & Massage", address: "789 Harmony St, Los Angeles, CA 90003" }
];

const mockReviews = [
  { id: 1, user: "Lê Ngọc", date: "17/11/2025 09:40", rating: 5, comment: "nhân viên hỗ trợ nhanh, giá hợp lí.", reply: { user: "Sale Online", date: "28/11/2025 21:03", comment: "Cảm ơn Quý khách đã tin tưởng và sử dụng dịch vụ. Hệ thống rất trân trọng sự ủng hộ của Quý khách và luôn sẵn sàng hỗ trợ khi cần. Rất mong được phục vụ Quý khách trong những lần tiếp theo!" } },
  { id: 2, user: "Vũ Minh Thủy", date: "03/10/2025 18:47", rating: 5, comment: "dịch vụ đa dạng vừa ý. nhân viên nhiệt tình. giá cả hợp lý", image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=100&h=100&fit=crop", reply: { user: "Sale Online", date: "21/10/2025 15:38", comment: "Xin chào bạn, Cám ơn bạn đã quan tâm và sử dụng dịch vụ cung cấp. Chúc bạn có những trải nghiệm tốt trong các lần sử dụng tới nha. Trân trọng!" } }
];

export function BrandStorePage() {
  const { id } = useParams();
  const { t } = useLanguage();
  const [readMoreAbout, setReadMoreAbout] = useState(false);
  const [sortOption, setSortOption] = useState("default");
  const [activeTab, setActiveTab] = useState<'vouchers' | 'reviews'>('vouchers');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 4;

  const sortedVouchers = [...mockVouchers].sort((a, b) => {
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
      <div className="relative h-[300px] w-full">
        <img
          src="https://images.unsplash.com/photo-1542840410-3092f99611a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGF8ZW58MXx8fHwxNzc5NjQxMjEyfDA&ixlib=rb-4.1.0&q=80&w=1920"
          alt="Brand Banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
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
                    src="https://ui-avatars.com/api/?name=Ethereal+Zen&background=f59e0b&color=fff&size=128" 
                    alt="Brand Logo" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground leading-tight mb-1">Ethereal Zen Wellness Spa</h1>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" /> Los Angeles, CA
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100 text-center">
                <div>
                  <p className="text-lg font-bold text-primary">9.7k</p>
                  <p className="text-xs text-muted-foreground mt-1">{t('store.sales')}</p>
                </div>
                <div className="border-l border-r border-gray-100">
                  <p className="text-lg font-bold text-primary flex items-center justify-center gap-1">
                    <Star className="w-4 h-4 fill-primary" /> 4.8
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{t('store.rating')}</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-primary">05/2023</p>
                  <p className="text-xs text-muted-foreground mt-1">{t('store.joined')}</p>
                </div>
              </div>
            </div>
            {/* About Store */}
            <div className="bg-white rounded-xl shadow-sm border border-border p-6">
              <h3 className="font-bold text-lg mb-4">{t('store.about')}</h3>
              <div className="text-sm text-muted-foreground mb-4 leading-relaxed">
                <p className={readMoreAbout ? "" : "line-clamp-4"}>
                  Experience ultimate relaxation and rejuvenation at Ethereal Zen Wellness Spa. We offer premium massage therapy, holistic wellness treatments, and aromatherapy to restore your body and mind. Our highly trained therapists will guide you through a journey of tranquility, ensuring you leave feeling completely renewed and energized for the days ahead.
                </p>
                <button 
                  onClick={() => setReadMoreAbout(!readMoreAbout)}
                  className="text-primary mt-2 underline hover:opacity-80"
                >
                  {readMoreAbout ? t('store.read_less') : t('store.read_more')}
                </button>
              </div>

              <div className="space-y-4 text-sm pt-4 border-t border-gray-100">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Phone className="w-4 h-4 text-primary" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="w-4 h-4 text-primary" />
                  <span>contact@etherealzen.com</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Globe className="w-4 h-4 text-primary" />
                  <a href="/not-implemented" className="hover:text-primary transition-colors">www.etherealzen.com</a>
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-white rounded-xl shadow-sm border border-border p-6">
              <h3 className="font-bold text-lg mb-4">{t('store.business_hours')}</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span className="text-muted-foreground">{t('common.mon_fri')}</span>
                  <span className="font-medium">9:00 AM - 8:00 PM</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">{t('common.saturday')}</span>
                  <span className="font-medium">10:00 AM - 9:00 PM</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">{t('common.sunday')}</span>
                  <span className="font-medium">10:00 AM - 6:00 PM</span>
                </li>
              </ul>
            </div>

            {/* Available Branches */}
            <div className="bg-white rounded-xl shadow-sm border border-border p-6">
              <h3 className="font-bold text-lg mb-4">{t('store.branches')}</h3>
              <div className="space-y-4 text-sm">
                {mockBranches.slice(0, 3).map((branch, idx) => (
                  <div key={idx}>
                    <p className="font-medium text-foreground">{branch.name}</p>
                    <p className="text-muted-foreground flex gap-1 mt-1">
                      <MapPin className="w-4 h-4 shrink-0" />
                      <span>{branch.address}</span>
                    </p>
                  </div>
                ))}
              </div>
              <button className="text-primary mt-4 underline text-sm hover:opacity-80">
                {t('store.view_all_branches')}
              </button>
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
                {t('store.available_vouchers')} ({mockVouchers.length})
              </button>
              <button 
                onClick={() => setActiveTab('reviews')} 
                className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'reviews' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
              >
                {t('store.reviews.count', { count: 1234 })}
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {paginatedVouchers.map((voucher) => (
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
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-border p-6 sm:p-8">
                {/* Reviews Section */}
                <div className="text-center mb-8 pb-8 border-b border-gray-100">
                  <h2 className="text-4xl font-bold text-primary mb-2">4.8/5</h2>
                  <div className="flex justify-center mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground">{t('store.reviews.count', { count: 1234 })}</p>
                </div>

                <div className="space-y-6">
                  {mockReviews.map((review) => (
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

                <div className="mt-8 text-center">
                  <button className="px-6 py-2 border border-primary text-primary rounded-full font-medium hover:bg-primary/5 transition-colors">
                    {t('store.reviews.view_all')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
