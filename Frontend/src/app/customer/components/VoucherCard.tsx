import { useNavigate, Link } from "react-router";
import { Star } from "lucide-react";
import { useLanguage } from "../../shared/contexts/LanguageContext";

export interface Voucher {
  id: string;
  image: string;
  category: string;
  name: string;
  partner: string;
  price: number;
  originalPrice: number;
  discount: number;
  rating?: number;
  reviews?: number;
  flashDeal?: boolean;
}

interface VoucherCardProps {
  voucher: Voucher;
  viewMode?: "grid" | "list";
}

export function VoucherCard({ voucher, viewMode = "grid" }: VoucherCardProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className={`group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all ${viewMode === 'list' ? 'flex flex-row' : 'flex flex-col h-full'}`}>
      {/* Image */}
      <div className={`relative overflow-hidden shrink-0 ${viewMode === 'list' ? 'w-[35%] min-w-[200px] max-w-[300px]' : 'aspect-[16/9]'}`}>
        <img
          src={voucher.image}
          alt={voucher.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Discount Badge */}
        <div className="absolute top-3 left-3 bg-[#FF4444] text-white px-3 py-1 rounded-md font-bold">
          -{voucher.discount}%
        </div>
        {/* Flash Deal */}
        {voucher.flashDeal && (
          <div className="absolute top-3 right-3 bg-primary text-foreground px-3 py-1 rounded-full text-xs font-semibold">
            {t('voucher.flash_deal')}
          </div>
        )}
      </div>

      {/* Content */}
      <div className={`p-4 flex flex-col ${viewMode === 'list' ? 'flex-1' : ''}`}>
        {/* Category Tag */}
        <div className="w-fit px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full uppercase tracking-wide mb-2">
          {t(`category.${voucher.category.toLowerCase()}`)}
        </div>

        {/* Voucher Name */}
        <Link to={`/voucher/${voucher.id}`} className="transition-colors">
          <h3 className="font-bold text-foreground group-hover:text-primary transition-colors mb-1 line-clamp-2 min-h-[3rem]">
            {voucher.name}
          </h3>
        </Link>

        {/* Partner Name */}
        <p className="text-sm text-muted-foreground italic mb-3">{voucher.partner}</p>

        {/* Rating */}
        {voucher.rating && (
          <div className="flex items-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(voucher.rating!)
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
            {voucher.reviews && (
              <span className="text-xs text-muted-foreground ml-1">({voucher.reviews})</span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-2xl font-bold text-foreground">
            ${voucher.price}
          </span>
          <span className="text-sm text-muted-foreground line-through">
            ${voucher.originalPrice}
          </span>
        </div>

        {/* Button */}
        <div className={viewMode === 'list' ? 'mt-auto' : ''}>
          <button
            onClick={() => navigate(`/voucher/${voucher.id}`)}
            className="w-full py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors font-semibold cursor-pointer"
          >
            {voucher.rating ? t('voucher.view_detail') : t('voucher.buy_now')}
          </button>
        </div>
      </div>
    </div>
  );
}
