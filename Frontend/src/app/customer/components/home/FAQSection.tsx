import { useState, useEffect } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../../shared/contexts/LanguageContext';

interface FAQItem {
  MaFAQ: number;
  CauHoi: string;
  TraLoi: string;
  DanhMucFAQ: string;
  ThuTu: number;
  TrangThai: string;
}

export function FAQSection() {
  const { language } = useLanguage();
  const tText = (en: string, vi: string) => (language === 'vi' ? vi : en);

  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/content/faqs')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const visible = data
            .filter((item: FAQItem) => item.TrangThai === 'Hiển thị')
            .sort((a, b) => a.ThuTu - b.ThuTu);
          setFaqs(visible);
        }
      })
      .catch((err) => console.error('Fetch FAQs error:', err));
  }, []);

  if (faqs.length === 0) return null;

  return (
    <section className="bg-white py-16 border-t border-gray-100">
      <div className="max-w-[800px] mx-auto px-6 space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-2.5 bg-primary/10 text-primary rounded-full mb-1">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-bold text-foreground">
            {tText('Frequently Asked Questions', 'Câu hỏi thường gặp')}
          </h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            {tText(
              'Quick answers to common questions about buying and using premium vouchers.',
              'Giải đáp nhanh các câu hỏi phổ biến về việc mua sắm và sử dụng voucher cao cấp.'
            )}
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {faqs.map((faq) => {
            const isOpen = openFaq === faq.MaFAQ;
            return (
              <div
                key={faq.MaFAQ}
                className="bg-gray-50/50 rounded-xl border border-gray-100 overflow-hidden transition-all duration-250"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : faq.MaFAQ)}
                  className="w-full px-5 py-4 text-left flex justify-between items-center hover:bg-gray-100/40 transition-colors"
                >
                  <span className="font-bold text-gray-800 text-sm pr-4">
                    {faq.CauHoi}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-250 ${
                      isOpen ? 'rotate-180 text-primary' : ''
                    }`}
                  />
                </button>
                <div
                  className={`transition-all duration-250 ease-in-out overflow-hidden ${
                    isOpen ? 'max-h-[300px] border-t border-gray-100/50' : 'max-h-0'
                  }`}
                >
                  <div className="p-5 text-gray-600 text-xs leading-relaxed whitespace-pre-line bg-white/70">
                    {faq.TraLoi}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
