import { VoucherCard, Voucher } from "../components/VoucherCard";
import { useState, useEffect, } from "react";
import { useSearchParams, Link } from "react-router";
import { ChevronDown, Grid3x3, List, X, ChevronRight, ChevronLeft } from "lucide-react";
import { Button, Input, Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@voucherhub/ui";
import Autoplay from "embla-carousel-autoplay";
import { PriceRangeSlider } from "../components/PriceRangeSlider";
import { useLanguage } from "../../shared/contexts/LanguageContext";



const getCityFromAddress = (address?: string) => {
  if (!address) return "TP. Hồ Chí Minh";
  const addr = address.toLowerCase();
  if (addr.includes("hà nội") || addr.includes("hn")) return "Hà Nội";
  if (addr.includes("đà nẵng") || addr.includes("dn")) return "Đà Nẵng";
  return "TP. Hồ Chí Minh";
};

const getDistrictFromAddress = (address?: string) => {
  if (!address) return "Khác";
  const addr = address.toLowerCase();
  
  if (addr.includes("quận 1") || addr.includes("q.1") || addr.includes("q1")) return "Quận 1";
  if (addr.includes("quận 3") || addr.includes("q.3") || addr.includes("q3")) return "Quận 3";
  if (addr.includes("quận 4") || addr.includes("q.4") || addr.includes("q4")) return "Quận 4";
  if (addr.includes("quận 5") || addr.includes("q.5") || addr.includes("q5")) return "Quận 5";
  if (addr.includes("quận 7") || addr.includes("q.7") || addr.includes("q7")) return "Quận 7";
  if (addr.includes("bình thạnh")) return "Bình Thạnh";
  if (addr.includes("gò vấp")) return "Gò Vấp";
  if (addr.includes("bình tân")) return "Bình Tân";
  if (addr.includes("hoàn kiếm")) return "Hoàn Kiếm";
  if (addr.includes("đống đa")) return "Đống Đa";
  if (addr.includes("cầu giấy")) return "Cầu Giấy";
  if (addr.includes("hải châu")) return "Hải Châu";
  if (addr.includes("thanh khê")) return "Thanh Khê";
  
  return "Khác";
};

export function SearchResultsPage() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  
  const [allVouchers, setAllVouchers] = useState<Voucher[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);

  const [categories, setCategories] = useState<any[]>([]);
  const [categoryBanners, setCategoryBanners] = useState<any[]>([]);
  const [allCategoryBanners, setAllCategoryBanners] = useState<any[]>([]);

  const [sortType, setSortType] =
    useState("popular");

  const [partners, setPartners] = useState<any[]>([]);

  const [categoryName, setCategoryName] = useState("");
  const query = searchParams.get("q") || categoryName || "Search";
  const categoryId = searchParams.get("category");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isBrandsModalOpen, setIsBrandsModalOpen] = useState(false);
  
  // Dynamic Price Range
  const [maxVoucherPrice, setMaxVoucherPrice] = useState(2000000);
  const [priceRange, setPriceRange] = useState([0, 2000000]);
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  // Dynamic Locations Data
  const [locationsData, setLocationsData] = useState<Record<string, Array<{ name: string; count: number }>>>({
    "TP. Hồ Chí Minh": [
      { name: "Quận 1", count: 42 },
      { name: "Quận 7", count: 28 },
      { name: "Bình Thạnh", count: 19 },
    ]
  });
  const [selectedState, setSelectedState] = useState("TP. Hồ Chí Minh (89)");
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [sliderResetKey, setSliderResetKey] = useState(0);
  const [triggerFilter, setTriggerFilter] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);


  const ITEMS_PER_PAGE = 6;
  const totalPages =
    Math.ceil(
      vouchers.length /
        ITEMS_PER_PAGE
    );

  const paginatedVouchers =
    vouchers.slice(
      (currentPage - 1) *
        ITEMS_PER_PAGE,
      currentPage *
        ITEMS_PER_PAGE
    );

  const handleClearAll = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    const defaultCity = Object.keys(locationsData)[0] || "TP. Hồ Chí Minh";
    const defaultCount = (locationsData[defaultCity] || []).reduce((sum, item) => sum + item.count, 0);
    setSelectedState(`${defaultCity} (${defaultCount})`);
    setSelectedCities([]);
    setSelectedRatings([]);
    setPriceRange([0, maxVoucherPrice]);
    setSliderResetKey(prev => prev + 1);
    setCurrentPage(1);
  };

  useEffect(() => {
    const query = searchParams.get("q");
    let url = "/api/vouchers";
    if (query) {
      url = `/api/vouchers/search?q=${encodeURIComponent(query)}`;
    }
    if (categoryId) {
      url = `/api/vouchers?category=${categoryId}`;
    }

    fetch("/api/vouchers/categories")
      .then((res) => res.json())
      .then((categories) => {
        setCategories(categories);
        if (categoryId) {
          const found = categories.find((c: any) => c.id === Number(categoryId));
          if (found) setCategoryName(found.name);
        }
      })
      .catch((err) => console.error("Fetch categories error:", err));

    fetch('/api/content/banners')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const active = data
            .filter((b: any) => b.TrangThai === 'Đang hiển thị' && (b.ViTri === 'Category Page' || b.ViTri === 'category_page'))
            .sort((a: any, b: any) => a.ThuTu - b.ThuTu);
          setAllCategoryBanners(active);
        }
      })
      .catch((err) => console.error('Fetch category banners error:', err));

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAllVouchers(data);
          // Lấy partner thật
          const uniquePartners = Array.from(
            new Map(data.map((v: any) => [v.partner?.id, v.partner])).values()
          ).filter(Boolean);
          setPartners(uniquePartners);

          // Dynamic Max Price calculation
          if (data.length > 0) {
            const prices = data.map((v: any) => v.salePrice || 0);
            const maxPrice = Math.max(...prices, 100000);
            const roundedMax = Math.ceil(maxPrice / 100000) * 100000;
            setMaxVoucherPrice(roundedMax);
            setPriceRange([0, roundedMax]);
          }
        }
      })
      .catch((err) => console.error("Fetch vouchers error:", err));
  }, [categoryId, searchParams]);

  useEffect(() => {
    // Build locations tree from allVouchers
    const tree: Record<string, Record<string, number>> = {};
    
    allVouchers.forEach(v => {
      const branches = v.partner?.branches || [];
      branches.forEach((b: any) => {
        const city = getCityFromAddress(b.address);
        const district = getDistrictFromAddress(b.address);
        
        if (!tree[city]) tree[city] = {};
        tree[city][district] = (tree[city][district] || 0) + 1;
      });
    });
    
    const formatted: Record<string, Array<{ name: string; count: number }>> = {};
    Object.keys(tree).forEach(city => {
      formatted[city] = Object.keys(tree[city]).map(district => ({
        name: district,
        count: tree[city][district]
      })).sort((a, b) => b.count - a.count);
    });
    
    if (Object.keys(formatted).length > 0) {
      setLocationsData(formatted);
      const cities = Object.keys(formatted);
      const currentCity = selectedState.split(" (")[0];
      const activeCity = cities.includes(currentCity) ? currentCity : (cities.find(c => c === "TP. Hồ Chí Minh") || cities[0]);
      const count = formatted[activeCity].reduce((sum, item) => sum + item.count, 0);
      setSelectedState(`${activeCity} (${count})`);
    }
  }, [allVouchers]);

  useEffect(() => {
    if (categoryId && categoryName) {
      const filtered = allCategoryBanners.filter(
        (b) => !b.Tag || b.Tag.toLowerCase() === categoryName.toLowerCase()
      );
      setCategoryBanners(filtered);
    } else {
      setCategoryBanners(allCategoryBanners);
    }
  }, [allCategoryBanners, categoryName, categoryId]);

  useEffect(() => {
    let sortedData = [...allVouchers];

    // Local Filtering
    if (selectedCategories.length > 0) {
      sortedData = sortedData.filter(v => v.category && typeof v.category === 'object' && selectedCategories.includes(String(v.category.id)));
    }
    if (selectedBrands.length > 0) {
      sortedData = sortedData.filter(v => v.partner && selectedBrands.includes(String(v.partner.id)));
    }
    if (priceRange) {
      sortedData = sortedData.filter(v => v.salePrice >= priceRange[0] && (priceRange[1] === maxVoucherPrice ? true : v.salePrice <= priceRange[1]));
    }
    if (selectedCities.length > 0) {
      const activeStateName = selectedState.split(" (")[0];
      sortedData = sortedData.filter(v => {
        const branches = v.partner?.branches || [];
        return branches.some((b: any) => {
          const city = getCityFromAddress(b.address);
          const district = getDistrictFromAddress(b.address);
          return city === activeStateName && selectedCities.includes(district);
        });
      });
    }
    if (selectedRatings.length > 0) {
      sortedData = sortedData.filter(v => {
        const rating = Math.floor(v.rating || 0);
        return selectedRatings.includes(rating);
      });
    }

    if (sortType === "low-price") {
      sortedData.sort((a, b) => Number(a.salePrice) - Number(b.salePrice));
    } else if (sortType === "high-price") {
      sortedData.sort((a, b) => Number(b.salePrice) - Number(a.salePrice));
    } else if (sortType === "newest") {
      sortedData.sort((a, b) => Number(b.id) - Number(a.id));
    }

    setCurrentPage(1);
    setVouchers(sortedData);
  }, [allVouchers, sortType, triggerFilter, sliderResetKey]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      
      <main className="flex-1 max-w-[1440px] mx-auto px-6 py-8 w-full">
        {/* Breadcrumb */}
        <div className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
          <Link to="/" className="hover:text-foreground font-semibold">{t('search.home')}</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="font-bold text-foreground">{t('search.results')}</span>
        </div>

        {/* Page Title */}
        <h1 className="text-3xl font-bold mb-2">
          {t('search.results_for')} <span className="text-primary">"{query}"</span>
        </h1>

        <p className="text-muted-foreground mb-6">
          Showing{" "}
          {vouchers.length === 0
            ? 0
            : (currentPage - 1) *
                ITEMS_PER_PAGE +
              1}
          -
          {Math.min(
            currentPage *
              ITEMS_PER_PAGE,
            vouchers.length
          )}{" "}
          of {vouchers.length} vouchers
          found
        </p>



        {categoryBanners.length > 0 && (
          <div className="mb-8 w-full max-h-[300px] rounded-2xl overflow-hidden relative">
            <Carousel opts={{ loop: true }} plugins={[Autoplay({ delay: 5000 })]}>
              <CarouselContent>
                {categoryBanners.map((banner, idx) => (
                  <CarouselItem key={banner.MaBanner || idx}>
                    <div 
                      className="w-full relative cursor-pointer"
                      onClick={() => {
                        const target = banner?.LinkURL || '/search';
                        if (target.startsWith('http://') || target.startsWith('https://')) {
                          window.open(target, '_blank');
                        } else {
                          window.location.href = target;
                        }
                      }}
                    >
                      <img
                        src={banner.HinhAnh}
                        alt={banner.TieuDe || "Category Banner"}
                        className="w-full h-[200px] md:h-[300px] object-cover"
                      />
                      {banner.TieuDe && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <h3 className="text-white text-3xl font-bold px-4 text-center">{banner.TieuDe}</h3>
                        </div>
                      )}
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {categoryBanners.length > 1 && (
                <>
                  <CarouselPrevious className="left-4 bg-white" />
                  <CarouselNext className="right-4 bg-white" />
                </>
              )}
            </Carousel>
          </div>
        )}

        {/* Sort Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-4 border-b border-border">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold">{t('search.sort_by')}</span>
            <Button
              variant={
                sortType === "popular"
                  ? "default"
                  : "secondary"
              }
              onClick={() =>
                setSortType("popular")
              }
              className={
                sortType === "popular"
                  ? "bg-primary text-primary-foreground hover:opacity-90 font-semibold"
                  : "font-semibold"
              }
            >
              {t("search.sort.popular")}
            </Button>

            <Button
              variant={
                sortType === "newest"
                  ? "default"
                  : "secondary"
              }
              onClick={() =>
                setSortType("newest")
              }
              className={
                sortType === "newest"
                  ? "bg-primary text-primary-foreground hover:opacity-90 font-semibold"
                  : "font-semibold"
              }
            >
              {t("search.sort.newest")}
            </Button>

            <Button
              variant={
                sortType === "low-price"
                  ? "default"
                  : "secondary"
              }
              onClick={() =>
                setSortType(
                  "low-price"
                )
              }
              className={
                sortType ===
                "low-price"
                  ? "bg-primary text-primary-foreground hover:opacity-90 font-semibold"
                  : "font-semibold"
              }
            >
              {t("search.sort.price_low")}
            </Button>

            <Button
              variant={
                sortType ===
                "high-price"
                  ? "default"
                  : "secondary"
              }
              onClick={() =>
                setSortType(
                  "high-price"
                )
              }
              className={
                sortType ===
                "high-price"
                  ? "bg-primary text-primary-foreground hover:opacity-90 font-semibold"
                  : "font-semibold"
              }
            >
              {t("search.sort.price_high")}
            </Button>

          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted">{t('search.per_page')}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded ${
                  viewMode === "grid" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                }`}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded ${
                  viewMode === "list" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content - Sidebar + Grid */}
        <div className="flex gap-8">
          {/* Left Sidebar - Filters */}
          <aside className="w-64 shrink-0 hidden lg:block">
            <div className="sticky top-24">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold">{t('search.filters')}</h3>
                <button onClick={handleClearAll} className="text-sm text-primary hover:underline">
                  {t('search.clear_all')}
                </button>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3 text-sm uppercase">{t('search.categories')}</h4>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <label
                      key={cat.id}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className="rounded border-border"
                        checked={
                          selectedCategories.includes(
                            String(cat.id)
                          )
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCategories([
                              ...selectedCategories,
                              String(cat.id),
                            ]);
                          } else {
                            setSelectedCategories(
                              selectedCategories.filter(
                                (c) =>
                                  c !==
                                  String(cat.id)
                              )
                            );
                          }
                        }}
                      />

                      <span className="text-sm">
                        {cat.name}
                      </span>

                      <span className="text-xs text-muted ml-auto">
                        (
                        {cat.totalVouchers}
                        )
                      </span>
                    </label>
                  ))}


                </div>
              </div>

              {/* Brands / Providers */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3 text-sm uppercase">
                  {t('search.brands')}
                </h4>
                <div className="space-y-2">
                  {partners.map(
                    (partner: any) => (
                      <label
                        key={partner.id}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="rounded border-border"
                          checked={selectedBrands.includes(
                            String(partner.id)
                          )}
                          onChange={(e) => {
                            if (
                              e.target.checked
                            ) {
                              setSelectedBrands([
                                ...selectedBrands,
                                String(
                                  partner.id
                                ),
                              ]);
                            } else {
                              setSelectedBrands(
                                selectedBrands.filter(
                                  (b) =>
                                    b !==
                                    String(
                                      partner.id
                                    )
                                )
                              );
                            }
                          }}
                        />

                        <span className="text-sm">
                          {partner.name}
                        </span>
                      </label>
                    )
                  )}

                </div>
              </div>

              {/* Location */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3 text-sm uppercase">{t('search.location')}</h4>
                <select 
                  className="w-full px-3 py-2 bg-input-background rounded-lg border border-border text-sm"
                  value={selectedState}
                  onChange={(e) => {
                    setSelectedState(e.target.value);
                    setSelectedCities([]);
                  }}
                >
                  {Object.keys(locationsData).map(city => {
                    const count = locationsData[city].reduce((sum, item) => sum + item.count, 0);
                    return <option key={city} value={`${city} (${count})`}>{city} ({count})</option>;
                  })}
                </select>
                <div className="space-y-2 mt-3 ml-4">
                  {(locationsData[selectedState.split(" (")[0]] || []).map((city) => (
                    <label key={city.name} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="rounded border-border" 
                        checked={selectedCities.includes(city.name)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedCities([...selectedCities, city.name]);
                          else setSelectedCities(selectedCities.filter(c => c !== city.name));
                        }}
                      />
                      <span className="text-sm">{city.name}</span>
                      <span className="text-xs text-muted ml-auto">({city.count})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3 text-sm uppercase">{t('search.price_range')}</h4>
                <div className="px-2">
                  <PriceRangeSlider 
                    key={sliderResetKey}
                    min={0} 
                    max={maxVoucherPrice} 
                    value={priceRange}
                    onChange={(min, max) => setPriceRange([min, max])} 
                  />
                </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-2 px-1">
                    <span>0đ</span>
                    <span className="font-semibold text-foreground text-sm">
                      {priceRange[0].toLocaleString("vi-VN")}đ - {priceRange[1].toLocaleString("vi-VN")}đ{priceRange[1] >= maxVoucherPrice ? '+' : ''}
                    </span>
                    <span>{maxVoucherPrice.toLocaleString("vi-VN")}đ+</span>
                  </div>
              </div>

              {/* Rating */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3 text-sm uppercase">{t('search.rating')}</h4>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((stars) => (
                    <label key={stars} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="rounded border-border" 
                        checked={selectedRatings.includes(stars)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedRatings([...selectedRatings, stars]);
                          else setSelectedRatings(selectedRatings.filter(r => r !== stars));
                        }}
                      />
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className={`w-4 h-4 ${i < stars ? "fill-current" : "text-gray-300 fill-current"}`} viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Filter Button */}
              <Button onClick={() => setTriggerFilter(prev => prev + 1)} className="w-full bg-primary text-primary-foreground font-semibold py-6 hover:opacity-90 transition-colors">
                {t('search.apply_filters')}
              </Button>
            </div>
          </aside>

          {/* Right - Voucher Grid */}
          <div className="flex-1">

            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
                  : "flex flex-col gap-6 mb-8"
              }
            >
              {paginatedVouchers.map(
                (voucher) => (
                  <VoucherCard
                    key={voucher.id}
                    voucher={voucher}
                    viewMode={viewMode}
                  />
                )
              )}
            </div>

            {paginatedVouchers.length ===
              0 && (
              <div className="text-center py-20 text-muted-foreground">
                No vouchers found
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8 pb-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-border bg-white cursor-pointer disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5 text-foreground" />
                </Button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 flex items-center justify-center font-bold rounded-lg border cursor-pointer ${
                      currentPage === page
                        ? "bg-primary text-primary-foreground border-primary hover:opacity-90"
                        : "bg-white text-foreground border-border hover:bg-accent"
                    }`}
                  >
                    {page}
                  </Button>
                ))}
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-border bg-white cursor-pointer disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5 text-foreground" />
                </Button>
              </div>
            )}

          </div>
        </div>


        {/* Brands Modal */}
        {isBrandsModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-[400px] max-h-[80vh] flex flex-col mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">{t('search.all_brands')}</h3>
                <button onClick={() => setIsBrandsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="relative mb-4">
                <Input placeholder={t('search.search_brands')} className="w-full bg-input-background" />
              </div>
              <div className="overflow-y-auto flex-1 space-y-3 pr-2">
                {["Adidas", "Amazon", "Apple", "Burger King", "Domino's", "Dunkin'", "Hilton Resorts", "Hyatt", "KFC", "Marriott Int.", "McDonald's", "Nike Store", "Pizza Hut", "Starbucks", "Subway", "Target", "Uber", "Walmart", "Wendy's"].map((brand) => (
                  <label key={brand} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-border" />
                    <span className="text-sm">{brand}</span>
                  </label>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-border flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsBrandsModalOpen(false)}>{t('common.cancel')}</Button>
                <Button onClick={() => { setTriggerFilter(prev => prev + 1); setIsBrandsModalOpen(false); }} className="bg-primary text-primary-foreground font-semibold">{t('search.apply_filters')}</Button>
              </div>
            </div>
          </div>
        )}
      </main>

    </div>
  );
}
