import re

with open('../Frontend/src/app/customer/pages/SearchResultsPage.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Add allVouchers state
code = code.replace('const [vouchers, setVouchers] =\n    useState<Voucher[]>([]);', 'const [allVouchers, setAllVouchers] = useState<Voucher[]>([]);\n  const [vouchers, setVouchers] = useState<Voucher[]>([]);')

# Replace the single useEffect with two
# We need to find the entire useEffect block
effect_pattern = re.compile(r'useEffect\(\(\) => \{.*?\}, \[\n    categoryId,\n    searchParams,\n    sortType,\n    sliderResetKey,\n    triggerFilter,\n  \]\);', re.DOTALL)

new_effect = '''useEffect(() => {
    const query = searchParams.get("q");
    let url = "/api/vouchers";
    if (query) {
      url = /api/vouchers/search?q=;
    }
    if (categoryId) {
      url = /api/vouchers?category=;
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
        }
      })
      .catch((err) => console.error("Fetch vouchers error:", err));
  }, [categoryId, searchParams]);

  useEffect(() => {
    let sortedData = [...allVouchers];

    // Local Filtering
    if (selectedCategories.length > 0) {
      sortedData = sortedData.filter(v => v.category && selectedCategories.includes(String(v.category.id)));
    }
    if (selectedBrands.length > 0) {
      sortedData = sortedData.filter(v => v.partner && selectedBrands.includes(String(v.partner.id)));
    }
    if (priceRange) {
      sortedData = sortedData.filter(v => v.salePrice >= priceRange[0] && (priceRange[1] === 2000000 ? true : v.salePrice <= priceRange[1]));
    }
    if (selectedRatings.length > 0) {
      // For now rating is missing, so this will filter out everything unless we use mock
      // Just keep it as is
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
  }, [allVouchers, sortType, triggerFilter, sliderResetKey]);'''

code = effect_pattern.sub(new_effect, code)

with open('../Frontend/src/app/customer/pages/SearchResultsPage.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Replaced successfully")
