import { VoucherCard, Voucher } from "../components/VoucherCard";
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router";
import { ChevronDown, Grid3x3, List, X, ChevronRight } from "lucide-react";
import { Button, Input } from "@voucherhub/ui";
import { PriceRangeSlider } from "../components/PriceRangeSlider";
import { useLanguage } from "../../shared/contexts/LanguageContext";



export function SearchResultsPage() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "Wellness & Spa";
  const [sortBy, setSortBy] = useState("popular");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isBrandsModalOpen, setIsBrandsModalOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([10, 1000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState("California (124)");
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [sliderResetKey, setSliderResetKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  const handleClearAll = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedState("California (124)");
    setSelectedCities([]);
    setSelectedRatings([]);
    setPriceRange([10, 1000]);
    setSliderResetKey(prev => prev + 1);
    setCurrentPage(1);
  };

  // API vouchers
  const [vouchers, setVouchers] =
    useState<any[]>([]);

  // Loading
  const [loading, setLoading] =
    useState(false);

  /**
   * Load voucher search
   */
  useEffect(() => {

    fetchVouchers();

  }, [
    query,
    priceRange,
    selectedCategories,
    selectedBrands,
    sortBy,
  ]);



  /**
   * Fetch voucher API
   */
  const fetchVouchers = async () => {

    try {

      setLoading(true);

      // Build query params
      const params =
        new URLSearchParams();

      // Search keyword
      if (query) {

        params.append(
          "keyword",
          query
        );
      }

      // Price filter
      params.append(
        "minPrice",
        String(priceRange[0])
      );

      params.append(
        "maxPrice",
        String(priceRange[1])
      );

      // Category filter
      if (
        selectedCategories.length > 0
      ) {

        params.append(
          "category",
          selectedCategories.join(",")
        );
      }

      // Brand filter
      if (
        selectedBrands.length > 0
      ) {

        params.append(
          "brand",
          selectedBrands.join(",")
        );
      }

      // API
      const response =
        await fetch(

          `http://localhost:3000/api/vouchers/search?${params.toString()}`

        );

      const data =
        await response.json();

      // Mapping data
      const mappedData =
        data.map(
          (voucher: any) => ({

            id:
              String(
                voucher.VoucherID
              ),

            image:
              "https://images.unsplash.com/photo-1544161515-4ab6ce6db874",

            category:
              voucher.DanhMuc
                ?.TenDanhMuc ||
              "OTHER",

            name:
              voucher.TenVoucher,

            partner:
              voucher.DoiTac
                ?.TenDoanhNghiep ||
              "Partner",

            price:
              Number(
                voucher.GiaBan
              ),

            originalPrice:
              Number(
                voucher.GiaGoc
              ),

            discount:
              Math.round(

                (
                  (
                    voucher.GiaGoc -
                    voucher.GiaBan
                  ) /
                  voucher.GiaGoc
                ) * 100

              ),

            rating: 5,

            reviews: 100,

            flashDeal: true,

          })
        );

      // SORT FRONTEND
      if (
        sortBy === "price-low"
      ) {

        mappedData.sort(
          (a: any, b: any) =>
            a.price - b.price
        );
      }

      if (
        sortBy === "price-high"
      ) {

        mappedData.sort(
          (a: any, b: any) =>
            b.price - a.price
        );
      }

      setVouchers(
        mappedData
      );

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }
  };


  const totalPages = Math.ceil(vouchers.length / ITEMS_PER_PAGE);
  const paginatedVouchers = vouchers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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
        <p className="text-muted-foreground mb-6">{t('search.showing')}</p>

        {/* Sort Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-4 border-b border-border">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold">{t('search.sort_by')}</span>
            <Button
              variant={sortBy === "popular" ? "default" : "secondary"}
              onClick={() => setSortBy("popular")}
              className={sortBy === "popular" ? "bg-primary text-primary-foreground hover:opacity-90 font-semibold" : "font-semibold"}
            >
              {t('search.sort.popular')}
            </Button>
            <Button
              variant={sortBy === "newest" ? "default" : "secondary"}
              onClick={() => setSortBy("newest")}
              className={sortBy === "newest" ? "bg-primary text-primary-foreground hover:opacity-90 font-semibold" : "font-semibold"}
            >
              {t('search.sort.newest')}
            </Button>
            <Button
              variant={sortBy === "price-low" ? "default" : "secondary"}
              onClick={() => setSortBy("price-low")}
              className={sortBy === "price-low" ? "bg-primary text-primary-foreground hover:opacity-90 font-semibold" : "font-semibold"}
            >
              {t('search.sort.price_low')}
            </Button>
            <Button
              variant={sortBy === "price-high" ? "default" : "secondary"}
              onClick={() => setSortBy("price-high")}
              className={sortBy === "price-high" ? "bg-primary text-primary-foreground hover:opacity-90 font-semibold" : "font-semibold"}
            >
              {t('search.sort.price_high')}
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
                  {[
                    { name: "Travel & Hotels", key: 'search.cat.travel', count: 24 },
                    { name: "Food & Beverages", key: 'search.cat.food', count: 18 },
                    { name: "Wellness & Spa", key: 'search.cat.wellness', count: 12 },
                    { name: "Entertainment", key: 'search.cat.entertainment', count: 8 },
                    { name: "Sports & Fitness", key: 'search.cat.sports', count: 15 },
                  ].map((cat) => (
                    <label key={cat.name} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="rounded border-border" 
                        checked={selectedCategories.includes(cat.name)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedCategories([...selectedCategories, cat.name]);
                          else setSelectedCategories(selectedCategories.filter(c => c !== cat.name));
                        }}
                      />
                      <span className="text-sm">{t(cat.key)}</span>
                      <span className="text-xs text-muted ml-auto">({cat.count})</span>
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
                  {["Marriott Int.", "Starbucks", "Hilton Resorts", "Nike Store"].map(
                    (brand) => (
                      <label key={brand} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="rounded border-border" 
                          checked={selectedBrands.includes(brand)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedBrands([...selectedBrands, brand]);
                            else setSelectedBrands(selectedBrands.filter(b => b !== brand));
                          }}
                        />
                        <span className="text-sm">{brand}</span>
                      </label>
                    )
                  )}
                  <button onClick={() => setIsBrandsModalOpen(true)} className="text-primary text-sm font-semibold hover:underline mt-2 inline-block">
                    {t('search.view_more')}
                  </button>
                </div>
              </div>

              {/* Location */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3 text-sm uppercase">{t('search.location')}</h4>
                <select 
                  className="w-full px-3 py-2 bg-input-background rounded-lg border border-border text-sm"
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                >
                  <option>California (124)</option>
                  <option>New York (98)</option>
                  <option>Florida (67)</option>
                  <option>Texas (54)</option>
                </select>
                <div className="space-y-2 mt-3 ml-4">
                  {[
                    { name: "Miami", count: 42 },
                    { name: "Orlando", count: 28 },
                    { name: "Tampa", count: 19 },
                  ].map((city) => (
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
                    min={10} 
                    max={1000} 
                    value={priceRange}
                    onChange={(min, max) => setPriceRange([min, max])} 
                  />
                </div>
                <div className="flex justify-between items-center text-xs text-muted-foreground mt-2">
                  <span>$10</span>
                  <span className="font-semibold text-foreground text-sm">
                    ${priceRange[0]} - ${priceRange[1]}{priceRange[1] === 1000 ? '+' : ''}
                  </span>
                  <span>$1000+</span>
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
              <Button className="w-full bg-primary text-primary-foreground font-semibold py-6 hover:opacity-90 transition-colors">
                {t('search.apply_filters')}
              </Button>
            </div>
          </aside>

          {/* Right - Voucher Grid */}
          <div className="flex-1">
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8" : "flex flex-col gap-6 mb-8"}>
              {paginatedVouchers.map((voucher) => (
                <VoucherCard key={voucher.id} voucher={voucher} viewMode={viewMode} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <Button 
                  variant="secondary" 
                  className="px-3 py-2 disabled:opacity-50"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  &lt;
                </Button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <Button 
                    key={i}
                    variant={currentPage === i + 1 ? "default" : "secondary"}
                    className={`px-4 py-2 ${currentPage === i + 1 ? 'bg-primary text-primary-foreground font-semibold hover:opacity-90' : ''}`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}

                <Button 
                  variant="secondary" 
                  className="px-3 py-2 disabled:opacity-50"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  &gt;
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
                <Button onClick={() => setIsBrandsModalOpen(false)} className="bg-primary text-primary-foreground font-semibold">{t('search.apply_filters')}</Button>
              </div>
            </div>
          </div>
        )}
      </main>

    </div>
  );
  }  
