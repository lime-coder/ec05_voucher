import { useEffect, useState } from "react";
import { HeroSection } from "../components/home/HeroSection";
import { HowItWorksSection } from "../components/home/HowItWorksSection";
import { CategorySection } from "../components/home/CategorySection";
import { FlashSaleSection } from "../components/home/FlashSaleSection";
import { ArticleSection } from "../components/home/ArticleSection";
import { FAQSection } from "../components/home/FAQSection";

import { VoucherCard } from "../components/VoucherCard";

export function HomePage() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 14,
    minutes: 22,
    seconds: 45,
  });

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        }
        
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Voucher ACTIVE
  const [vouchers, setVouchers] =
    useState<any[]>([]);

  // Loading
  const [loading, setLoading] =
    useState(false);

  // Countdown timer
  useEffect(() => {

    const timer = setInterval(() => {

      setTimeLeft((prev) => {

        let {
          hours,
          minutes,
          seconds,
        } = prev;

        if (seconds > 0) {

          seconds--;

        } else if (minutes > 0) {

          minutes--;
          seconds = 59;

        } else if (hours > 0) {

          hours--;
          minutes = 59;
          seconds = 59;

        }

        return {
          hours,
          minutes,
          seconds,
        };

      });

    }, 1000);

    return () =>
      clearInterval(timer);

  }, []);

  // Load voucher ACTIVE
  useEffect(() => {
    fetchVouchers();
  }, []);

  // API voucher
  const fetchVouchers =
    async () => {

      try {

        setLoading(true);

        const response =
          await fetch(
            "http://localhost:3000/api/vouchers"
          );

        const data =
          await response.json();

        // Chỉ lấy voucher ACTIVE
        const activeVouchers =
          data.filter(
            (voucher: any) =>
              voucher.TrangThaiVoucher ===
              "ACTIVE"
          );

        setVouchers(
          activeVouchers
        );

      } catch (error) {

        console.error(error);

      } finally {

        setLoading(false);

      }
    };

  return (
    <div className="min-h-screen flex flex-col bg-background">

      <main className="flex-1">

        {/* Hero */}
        <HeroSection
          timeLeft={timeLeft}
        />

        {/* How it works */}
        <HowItWorksSection />

        {/* Category */}
        <CategorySection />

        {/* Flash sale */}
        <FlashSaleSection
          timeLeft={timeLeft}
        />

        {/* Voucher ACTIVE */}
        <section className="max-w-[1440px] mx-auto px-6 py-20">

          {/* Title */}
          <h2 className="text-5xl font-bold mb-12">
            Active Vouchers
          </h2>

          {/* Loading */}
          {loading && (
            <p>
              Loading vouchers...
            </p>
          )}

          {/* Voucher grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

            {vouchers.map(
              (voucher) => (

                <VoucherCard
                  key={
                    voucher.VoucherID
                  }

                  voucher={{
                    id: String(
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

                    discount: 50,

                    rating: 5,

                    reviews: 100,

                    flashDeal: true,
                  }}
                />

              )
            )}
          </div>
        </section>
        <FlashSaleSection timeLeft={timeLeft} />
        <ArticleSection />
        <FAQSection />
      </main>
    </div>
  );
}