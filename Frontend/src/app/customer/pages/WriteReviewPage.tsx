import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { ChevronLeft, Star, Check, Info } from "lucide-react";
import { Button } from "@voucherhub/ui";
import { useLanguage } from "../../shared/contexts/LanguageContext";

export function WriteReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState("");

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuccessModal(true);
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    navigate("/orders");
  };

  return (
    <div className="min-h-screen flex flex-col bg-secondary">
      
      <main className="flex-1 px-6 py-12">
        <div className="max-w-[640px] mx-auto">
          {/* Back Link */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted hover:text-foreground mb-6"
          >
            <ChevronLeft className="w-5 h-5" />
            {t('review.back_history')}
          </button>

          {/* Card */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            {/* Title */}
            <h2 className="text-3xl font-bold mb-2">{t('review.write_title')}</h2>
            <p className="text-muted mb-8">
              {t('review.write_desc')}
            </p>

            {/* Voucher Info */}
            <div className="border border-border rounded-lg p-4 mb-8 flex gap-4">
              {/* Thumbnail */}
              <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1771508558500-f410039d7fc0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjByZXN0YXVyYW50JTIwZGluaW5nJTIwZm9vZCUyMGV4cGVyaWVuY2V8ZW58MXx8fHwxNzc5MzU5NTg3fDA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Voucher"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1">
                {/* Badge */}
                <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full mb-2">
                  {t('review.purchased_badge')}
                </div>

                {/* Provider */}
                <p className="text-sm text-muted mb-1">
                  The Grand Waterfront Hotel — Marina Bay
                </p>

                {/* Voucher Name */}
                <h3 className="font-bold mb-2">
                  Premium Weekend Seafood Buffet for Two
                </h3>

                {/* Redemption Info */}
                <div className="flex items-center gap-2 text-sm text-primary">
                  <Check className="w-4 h-4" />
                  <span>{t('review.redeemed_on')}</span>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-border mb-8" />

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {/* Rating */}
              <div className="mb-8">
                <label className="block text-sm font-bold tracking-wide text-muted mb-3">
                  {t('review.rate_experience')}
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-12 h-12 transition-colors ${
                          star <= (hoveredRating || rating)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Text */}
              <div className="mb-6">
                <label className="block text-sm font-bold tracking-wide text-muted mb-3">
                  {t('review.share_detailed')}
                </label>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder={t('review.placeholder')}
                  rows={8}
                  className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  required
                />
                <div className="flex justify-between items-center mt-2 text-sm">
                  <div className="flex items-center gap-2 text-muted">
                    <Info className="w-4 h-4" />
                    <span>{t('review.min_chars')}</span>
                  </div>
                  <span className="text-muted">
                    {review.length}/500
                  </span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex-1 py-6 font-semibold"
                >
                  {t('review.cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={rating === 0}
                  className="flex-1 py-6 bg-primary text-foreground hover:opacity-90 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('review.submit')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-2">{t('review.success_title')}</h3>
              <p className="text-muted-foreground mb-8">
                {t('review.success_desc')}
              </p>
              <Button onClick={handleCloseModal} className="w-full font-bold">
                {t('order.back')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
