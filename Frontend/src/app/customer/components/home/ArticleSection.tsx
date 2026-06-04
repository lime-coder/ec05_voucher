import { useState, useEffect } from 'react';
import { Newspaper, Eye, User, Calendar, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../../shared/contexts/LanguageContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button
} from '@voucherhub/ui';

interface ArticleItem {
  MaBaiViet: number;
  TieuDe: string;
  NoiDung: string | null;
  TacGia: string | null;
  LuotXem: number;
  TrangThai: string | null;
  NgayTao: string | null;
}

export function ArticleSection() {
  const { language } = useLanguage();
  const tText = (en: string, vi: string) => (language === 'vi' ? vi : en);

  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<ArticleItem | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetch('/api/content/baiviet')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Filter published articles (TrangThai === 'Đã xuất bản') and sort by date descending
          const published = data
            .filter((item: ArticleItem) => item.TrangThai === 'Đã xuất bản')
            .sort((a, b) => {
              const dateA = a.NgayTao ? new Date(a.NgayTao).getTime() : 0;
              const dateB = b.NgayTao ? new Date(b.NgayTao).getTime() : 0;
              return dateB - dateA;
            });
          setArticles(published.slice(0, 3)); // Display top 3 latest
        }
      })
      .catch((err) => console.error('Fetch articles error:', err));
  }, []);

  const handleReadMore = (article: ArticleItem) => {
    setSelectedArticle(article);
    setShowModal(true);
    
    // Increment view count locally/API if possible, or just open modal
    // For premium feel, we can just trigger a background POST to update views if there's an API, 
    // but a visual increment is sufficient for client display.
  };

  if (articles.length === 0) return null;

  // Curated premium gradients for card covers
  const gradients = [
    'from-indigo-500 to-purple-600',
    'from-pink-500 to-rose-600',
    'from-blue-600 to-teal-500'
  ];

  return (
    <section className="bg-gray-50/50 py-16 border-t border-gray-100">
      <div className="max-w-[1200px] mx-auto px-6 space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-2.5 bg-primary/10 text-primary rounded-full mb-1">
            <Newspaper className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-bold text-foreground">
            {tText('Latest News & Tips', 'Tin tức & Cẩm nang')}
          </h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            {tText(
              'Stay updated with the latest shopping guides, voucher tricks, and exclusive news.',
              'Cập nhật cẩm nang mua sắm, mẹo sử dụng voucher và tin tức khuyến mãi mới nhất.'
            )}
          </p>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {articles.map((article, idx) => {
            const dateStr = article.NgayTao
              ? new Date(article.NgayTao).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })
              : '';
            
            const excerpt = article.NoiDung
              ? article.NoiDung.length > 120
                ? article.NoiDung.substring(0, 120) + '...'
                : article.NoiDung
              : tText('No content available.', 'Không có nội dung.');

            const cardGradient = gradients[idx % gradients.length];

            return (
              <div
                key={article.MaBaiViet}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              >
                {/* Visual Cover Gradient Card */}
                <div className={`h-48 bg-gradient-to-r ${cardGradient} p-6 flex flex-col justify-between text-white relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                    <Newspaper className="w-48 h-48" />
                  </div>
                  
                  <div className="flex justify-between items-center z-10">
                    <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium">
                      {tText('Article', 'Bài viết')}
                    </span>
                    <span className="flex items-center gap-1 text-xs opacity-90">
                      <Eye className="w-3.5 h-3.5" />
                      {article.LuotXem || 0}
                    </span>
                  </div>

                  <h3 className="font-bold text-lg leading-snug line-clamp-2 z-10 group-hover:underline cursor-pointer" onClick={() => handleReadMore(article)}>
                    {article.TieuDe}
                  </h3>
                </div>

                {/* Card Body */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-gray-600 text-xs leading-relaxed flex-1">
                    {excerpt}
                  </p>

                  <div className="flex items-center justify-between border-t border-gray-50 pt-4 text-[11px] text-gray-400">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {article.TacGia || 'Admin'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {dateStr}
                      </span>
                    </div>

                    <button
                      onClick={() => handleReadMore(article)}
                      className="text-primary font-semibold flex items-center gap-0.5 hover:gap-1 transition-all"
                    >
                      {tText('Read More', 'Đọc thêm')}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- Article Detail Dialog Modal --- */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedArticle && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 text-xs text-primary font-semibold mb-2">
                  <span className="bg-primary/10 px-2.5 py-1 rounded-full">{tText('NEWS & BLOG', 'TIN TỨC & CẨM NANG')}</span>
                </div>
                <DialogTitle className="text-2xl font-bold text-gray-900 leading-tight">
                  {selectedArticle.TieuDe}
                </DialogTitle>
                <div className="flex items-center gap-4 text-xs text-gray-400 mt-3 pb-3 border-b border-gray-100">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    {tText('Author:', 'Tác giả:')} <strong className="text-gray-600">{selectedArticle.TacGia || 'Admin'}</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {selectedArticle.NgayTao ? new Date(selectedArticle.NgayTao).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US') : ''}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    {selectedArticle.LuotXem || 0} {tText('views', 'lượt xem')}
                  </span>
                </div>
              </DialogHeader>

              <div className="py-6 text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {selectedArticle.NoiDung}
              </div>

              <DialogFooter className="border-t border-gray-100 pt-4">
                <Button className="px-6" onClick={() => setShowModal(false)}>
                  {tText('Close', 'Đóng')}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
