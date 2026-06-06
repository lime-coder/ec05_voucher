
import {
  useNavigate,
} from "react-router";

import {
  useEffect,
  useState,
} from "react";

import { Clock } from "lucide-react";

import { Button } from "@voucherhub/ui";

import { useLanguage } from "../../../shared/contexts/LanguageContext";

import { VoucherCard } from "../VoucherCard";

interface FlashSaleSectionProps {
  timeLeft: {
    hours: number;
    minutes: number;
    seconds: number;
  };
}

export function FlashSaleSection({
  timeLeft,
}: FlashSaleSectionProps) {
  const navigate =
    useNavigate();

  const { t } =
    useLanguage();

  const [vouchers, setVouchers] =
    useState<any[]>([]);

  useEffect(() => {
    fetch("/api/vouchers")
      .then((res) => res.json())
      .then((data) => {
        if (
          Array.isArray(data)
        ) {
          setVouchers(data);
        }
      })
      .catch((err) =>
        console.error(
          "Fetch vouchers error:",
          err
        )
      );
  }, []);

  return (
    <section className="max-w-[1440px] mx-auto px-6 py-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-1 h-8 bg-[#FF4444]" />

          <h2 className="text-3xl font-bold">
            {t(
              "home.flash_sale_vouchers"
            )}
          </h2>

          <div className="flex items-center gap-2 text-[#FF4444]">
            <Clock className="w-5 h-5" />

            <span className="font-semibold">
              {t("home.ends_in")}{" "}
              {timeLeft.hours}h{" "}
              {timeLeft.minutes}m
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={() =>
            navigate("/search")
          }
          className="border-2 font-semibold"
        >
          {t(
            "home.view_all_offers"
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {vouchers.map(
          (voucher) => (
            <VoucherCard
              key={voucher.id}
              voucher={voucher}
            />
          )
        )}
      </div>
    </section>
  );
}
