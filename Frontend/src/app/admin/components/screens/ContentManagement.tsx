import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useLanguage } from '../../../shared/contexts/LanguageContext';
import {
  Button,
  Badge,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Tabs,
  TabsList,
  TabsTrigger,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Input,
} from '@voucherhub/ui';

export function ContentManagement() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const tText = (en: string, vi: string) => (language === 'vi' ? vi : en);

  const [activeTab, setActiveTab] = useState('banners');

  // Content state loaded from backend
  const [banners, setBanners] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  // FAQ Modal state
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [currentFaq, setCurrentFaq] = useState<any | null>(null);
  const [faqForm, setFaqForm] = useState({
    CauHoi: '',
    TraLoi: '',
    DanhMucFAQ: 'Mua hàng',
    ThuTu: 0,
    TrangThai: 'Hiển thị'
  });

  // Category Modal state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<any | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    TenDanhMuc: '',
    MoTa: ''
  });

  // Article Modal state
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<any | null>(null);
  const [articleForm, setArticleForm] = useState({
    TieuDe: '',
    NoiDung: '',
    TacGia: 'Admin',
    TrangThai: 'Nháp'
  });

  // Load content from API
  const fetchAllContent = () => {
    fetch('/api/admin/content')
      .then(res => res.json())
      .then(data => {
        setBanners(Array.isArray(data.banners) ? data.banners : []);
        setArticles(Array.isArray(data.articles) ? data.articles : []);
        setFaqs(Array.isArray(data.faqs) ? data.faqs : []);
      })
      .catch(err => console.error('Fetch content error:', err));

    fetch('/api/content/categories')
      .then(res => res.json())
      .then(data => {
        setCategories(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error('Fetch categories error:', err));
  };

  useEffect(() => {
    fetchAllContent();
  }, []);

  // --- Deletion operations ---
  const handleDeleteBanner = async (id: number, title: string) => {
    if (!confirm(tText(`Are you sure you want to delete banner: ${title}?`, `Xác nhận xoá banner: ${title}?`))) return;
    try {
      const res = await fetch(`/api/admin/content/${id}?type=banner`, { method: 'DELETE' });
      if (res.ok) {
        toast.success(tText('Banner deleted successfully!', 'Đã xóa banner thành công!'));
        setBanners(prev => prev.filter(b => b.MaBanner !== id));
      } else {
        toast.error(tText('Failed to delete banner!', 'Xóa banner thất bại!'));
      }
    } catch (err) {
      console.error(err);
      toast.error(tText('An error occurred!', 'Có lỗi xảy ra!'));
    }
  };

  const handleDeleteArticle = async (id: number, title: string) => {
    if (!confirm(tText(`Are you sure you want to delete article: ${title}?`, `Xác nhận xoá bài viết: ${title}?`))) return;
    try {
      const res = await fetch(`/api/admin/content/${id}?type=article`, { method: 'DELETE' });
      if (res.ok) {
        toast.success(tText('Article deleted successfully!', 'Đã xóa bài viết thành công!'));
        setArticles(prev => prev.filter(a => a.MaBaiViet !== id));
      } else {
        toast.error(tText('Failed to delete article!', 'Xóa bài viết thất bại!'));
      }
    } catch (err) {
      console.error(err);
      toast.error(tText('An error occurred!', 'Có lỗi xảy ra!'));
    }
  };

  const handleDeleteFAQ = async (id: number, question: string) => {
    if (!confirm(tText(`Are you sure you want to delete FAQ: ${question}?`, `Xác nhận xoá FAQ: ${question}?`))) return;
    try {
      const res = await fetch(`/api/admin/content/${id}?type=faq`, { method: 'DELETE' });
      if (res.ok) {
        toast.success(tText('FAQ deleted successfully!', 'Đã xóa FAQ thành công!'));
        setFaqs(prev => prev.filter(f => f.MaFAQ !== id));
      } else {
        toast.error(tText('Failed to delete FAQ!', 'Xóa FAQ thất bại!'));
      }
    } catch (err) {
      console.error(err);
      toast.error(tText('An error occurred!', 'Có lỗi xảy ra!'));
    }
  };

  // --- Category Actions ---
  const handleDeleteCategory = async (id: number, name: string) => {
    if (!confirm(tText(`Are you sure you want to delete category: ${name}?`, `Xác nhận xoá danh mục: ${name}?`))) return;
    try {
      const res = await fetch(`/api/content/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success(tText('Category deleted successfully!', 'Đã xóa danh mục thành công!'));
        fetchAllContent();
      } else {
        const data = await res.json();
        toast.error(data.error || tText('Failed to delete category!', 'Xóa danh mục thất bại!'));
      }
    } catch (err) {
      console.error(err);
      toast.error(tText('An error occurred!', 'Có lỗi xảy ra!'));
    }
  };

  const handleAddCategory = () => {
    setCurrentCategory(null);
    setCategoryForm({
      TenDanhMuc: '',
      MoTa: ''
    });
    setShowCategoryModal(true);
  };

  const handleEditCategory = (cat: any) => {
    setCurrentCategory(cat);
    setCategoryForm({
      TenDanhMuc: cat.name || '',
      MoTa: cat.moTa || ''
    });
    setShowCategoryModal(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryForm.TenDanhMuc.trim()) {
      toast.error(tText('Please enter a category name', 'Vui lòng nhập tên danh mục'));
      return;
    }

    try {
      const url = currentCategory ? `/api/content/categories/${currentCategory.id}` : '/api/content/categories';
      const method = currentCategory ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm)
      });

      if (res.ok) {
        toast.success(currentCategory ? tText('Category updated successfully!', 'Đã cập nhật danh mục!') : tText('Category added successfully!', 'Đã thêm danh mục mới!'));
        setShowCategoryModal(false);
        fetchAllContent();
      } else {
        const data = await res.json();
        toast.error(data.error || tText('Failed to save category!', 'Lưu danh mục thất bại!'));
      }
    } catch (err) {
      console.error(err);
      toast.error(tText('An error occurred!', 'Có lỗi xảy ra!'));
    }
  };

  // --- FAQ Actions ---
  const handleAddFaq = () => {
    setCurrentFaq(null);
    setFaqForm({
      CauHoi: '',
      TraLoi: '',
      DanhMucFAQ: 'Mua hàng',
      ThuTu: faqs.length + 1,
      TrangThai: 'Hiển thị'
    });
    setShowFaqModal(true);
  };

  const handleEditFaq = (faq: any) => {
    setCurrentFaq(faq);
    setFaqForm({
      CauHoi: faq.CauHoi || '',
      TraLoi: faq.TraLoi || '',
      DanhMucFAQ: faq.DanhMucFAQ || 'Mua hàng',
      ThuTu: faq.ThuTu || 0,
      TrangThai: faq.TrangThai || 'Hiển thị'
    });
    setShowFaqModal(true);
  };

  const handleSaveFaq = async () => {
    if (!faqForm.CauHoi.trim() || !faqForm.TraLoi.trim()) {
      toast.error(tText('Please fill in both the question and answer', 'Vui lòng điền đầy đủ câu hỏi và trả lời'));
      return;
    }

    try {
      const url = currentFaq ? `/api/admin/content/${currentFaq.MaFAQ}` : '/api/admin/content';
      const method = currentFaq ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'faq', ...faqForm })
      });

      if (res.ok) {
        toast.success(currentFaq ? tText('FAQ updated successfully!', 'Đã cập nhật FAQ!') : tText('FAQ added successfully!', 'Đã thêm FAQ mới!'));
        setShowFaqModal(false);
        fetchAllContent();
      } else {
        toast.error(tText('Failed to save FAQ!', 'Lưu FAQ thất bại!'));
      }
    } catch (err) {
      console.error(err);
      toast.error(tText('An error occurred!', 'Có lỗi xảy ra!'));
    }
  };

  // --- Article Actions ---
  const handleAddArticle = () => {
    setCurrentArticle(null);
    setArticleForm({
      TieuDe: '',
      NoiDung: '',
      TacGia: 'Admin',
      TrangThai: 'Nháp'
    });
    setShowArticleModal(true);
  };

  const handleEditArticle = (art: any) => {
    setCurrentArticle(art);
    setArticleForm({
      TieuDe: art.TieuDe || '',
      NoiDung: art.NoiDung || '',
      TacGia: art.TacGia || 'Admin',
      TrangThai: art.TrangThai || 'Nháp'
    });
    setShowArticleModal(true);
  };

  const handleSaveArticle = async () => {
    if (!articleForm.TieuDe.trim()) {
      toast.error(tText('Please enter the article title', 'Vui lòng nhập tiêu đề bài viết'));
      return;
    }

    try {
      const url = currentArticle ? `/api/admin/content/${currentArticle.MaBaiViet}` : '/api/admin/content';
      const method = currentArticle ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'article', ...articleForm })
      });

      if (res.ok) {
        toast.success(currentArticle ? tText('Article updated successfully!', 'Đã cập nhật bài viết!') : tText('Article added successfully!', 'Đã thêm bài viết mới!'));
        setShowArticleModal(false);
        fetchAllContent();
      } else {
        toast.error(tText('Failed to save article!', 'Lưu bài viết thất bại!'));
      }
    } catch (err) {
      console.error(err);
      toast.error(tText('An error occurred!', 'Có lỗi xảy ra!'));
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-between items-center mb-6">
          <TabsList className="bg-transparent gap-2 p-0 h-auto justify-start flex-wrap">
            <TabsTrigger
              value="banners"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors border h-9 px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow data-[state=active]:border-b-primary hover:data-[state=active]:bg-primary/80 data-[state=inactive]:bg-background data-[state=inactive]:text-gray-700 data-[state=inactive]:border-input data-[state=inactive]:shadow-sm hover:data-[state=inactive]:bg-primary/10 hover:data-[state=inactive]:text-accent-foreground"
            >
              Banner & Slider
            </TabsTrigger>
            <TabsTrigger
              value="categories"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors border h-9 px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow data-[state=active]:border-b-primary hover:data-[state=active]:bg-primary/80 data-[state=inactive]:bg-background data-[state=inactive]:text-gray-700 data-[state=inactive]:border-input data-[state=inactive]:shadow-sm hover:data-[state=inactive]:bg-primary/10 hover:data-[state=inactive]:text-accent-foreground"
            >
              {tText('Categories', 'Danh mục')}
            </TabsTrigger>
            <TabsTrigger
              value="articles"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors border h-9 px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow data-[state=active]:border-b-primary hover:data-[state=active]:bg-primary/80 data-[state=inactive]:bg-background data-[state=inactive]:text-gray-700 data-[state=inactive]:border-input data-[state=inactive]:shadow-sm hover:data-[state=inactive]:bg-primary/10 hover:data-[state=inactive]:text-accent-foreground"
            >
              {tText('News & Articles', 'Tin tức')}
            </TabsTrigger>
            <TabsTrigger
              value="faqs"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors border h-9 px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow data-[state=active]:border-b-primary hover:data-[state=active]:bg-primary/80 data-[state=inactive]:bg-background data-[state=inactive]:text-gray-700 data-[state=inactive]:border-input data-[state=inactive]:shadow-sm hover:data-[state=inactive]:bg-primary/10 hover:data-[state=inactive]:text-accent-foreground"
            >
              FAQ
            </TabsTrigger>
          </TabsList>

          <div>
            {activeTab === 'banners' && (
              <Button className="gap-2" onClick={() => navigate('/admin/content/banner/new')}>
                <Plus className="w-4 h-4" />
                {tText('Add Banner', 'Thêm banner')}
              </Button>
            )}
            {activeTab === 'categories' && (
              <Button className="gap-2" onClick={handleAddCategory}>
                <Plus className="w-4 h-4" />
                {tText('Add Category', 'Thêm danh mục')}
              </Button>
            )}
            {activeTab === 'articles' && (
              <Button className="gap-2" onClick={handleAddArticle}>
                <Plus className="w-4 h-4" />
                {tText('Add Article', 'Thêm bài viết')}
              </Button>
            )}
            {activeTab === 'faqs' && (
              <Button className="gap-2" onClick={handleAddFaq}>
                <Plus className="w-4 h-4" />
                {tText('Add FAQ', 'Thêm FAQ')}
              </Button>
            )}
          </div>
        </div>

        <div>
          {activeTab === 'banners' && (
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50">
                      <TableHead>{tText('No.', 'STT')}</TableHead>
                      <TableHead>{tText('Title', 'Tiêu đề')}</TableHead>
                      <TableHead>{tText('Position', 'Vị trí')}</TableHead>
                      <TableHead>{tText('Status', 'Trạng thái')}</TableHead>
                      <TableHead>{tText('Created Date', 'Ngày tạo')}</TableHead>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">{tText('Actions', 'Hành động')}</th>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {banners.map((banner, index) => (
                      <TableRow key={banner.MaBanner}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium text-gray-900">{banner.TieuDe}</TableCell>
                        <TableCell>
                          {banner.ViTri === 'Homepage Top' ? tText('Homepage Top', 'Homepage Top')
                           : banner.ViTri === 'Homepage Middle' ? tText('Homepage Middle', 'Homepage Middle')
                           : banner.ViTri === 'Category Page' ? tText('Category Page', 'Trang danh mục')
                           : banner.ViTri}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={banner.TrangThai === 'Đang hiển thị' ? 'default' : 'secondary'}
                            className={banner.TrangThai === 'Đang hiển thị' ? 'bg-green-100 text-green-700 hover:bg-green-100 shadow-none border-transparent' : 'shadow-none border-transparent'}
                          >
                            {banner.TrangThai === 'Đang hiển thị' ? tText('Visible', 'Đang hiển thị') : tText('Paused', 'Tạm dừng')}
                          </Badge>
                        </TableCell>
                        <TableCell>{banner.NgayTao ? new Date(banner.NgayTao).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US') : ''}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button onClick={() => navigate(`/admin/content/banner/${banner.MaBanner}`)} variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" title={tText('View', 'Xem')}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button onClick={() => navigate(`/admin/content/banner/${banner.MaBanner}`)} variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50" title={tText('Edit', 'Sửa')}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button onClick={() => handleDeleteBanner(banner.MaBanner, banner.TieuDe)} variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" title={tText('Delete', 'Xóa')}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {banners.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-gray-500">{tText('No banners found.', 'Chưa có banner nào.')}</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50">
                      <TableHead>Icon</TableHead>
                      <TableHead>{tText('Category Name', 'Tên danh mục')}</TableHead>
                      <TableHead>{tText('Description', 'Mô tả')}</TableHead>
                      <TableHead>{tText('Vouchers', 'Số voucher')}</TableHead>
                      <TableHead>{tText('Status', 'Trạng thái')}</TableHead>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">{tText('Actions', 'Hành động')}</th>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="text-2xl">{category.icon}</TableCell>
                        <TableCell className="font-medium text-gray-900">
                          {category.name === 'Ăn uống' ? tText('Food & Dining', 'Ăn uống')
                           : category.name === 'Giải trí' ? tText('Entertainment', 'Giải trí')
                           : category.name === 'Du lịch' ? tText('Travel', 'Du lịch')
                           : category.name === 'Làm đẹp' ? tText('Beauty', 'Làm đẹp')
                           : category.name}
                        </TableCell>
                        <TableCell className="max-w-xs truncate" title={category.moTa}>{category.moTa || tText('No description provided', 'Không có mô tả')}</TableCell>
                        <TableCell>{category.vouchers}</TableCell>
                        <TableCell>
                          <Badge
                            variant={category.status === 'Hiển thị' ? 'default' : 'secondary'}
                            className={category.status === 'Hiển thị' ? 'bg-green-100 text-green-700 hover:bg-green-100 shadow-none border-transparent' : 'shadow-none border-transparent'}
                          >
                            {category.status === 'Hiển thị' ? tText('Visible', 'Hiển thị') : tText('Hidden', 'Ẩn')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button onClick={() => handleEditCategory(category)} variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50" title={tText('Edit', 'Sửa')}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button onClick={() => handleDeleteCategory(category.id, category.name)} variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" title={tText('Delete', 'Xóa')}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {activeTab === 'articles' && (
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50">
                      <TableHead>{tText('Title', 'Tiêu đề')}</TableHead>
                      <TableHead>{tText('Author', 'Tác giả')}</TableHead>
                      <TableHead>{tText('Views', 'Lượt xem')}</TableHead>
                      <TableHead>{tText('Status', 'Trạng thái')}</TableHead>
                      <TableHead>{tText('Created Date', 'Ngày tạo')}</TableHead>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">{tText('Actions', 'Hành động')}</th>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {articles.map((article) => (
                      <TableRow key={article.MaBaiViet}>
                        <TableCell className="font-medium text-gray-900">{article.TieuDe}</TableCell>
                        <TableCell>{article.TacGia}</TableCell>
                        <TableCell>{article.LuotXem}</TableCell>
                        <TableCell>
                          <Badge
                            variant={article.TrangThai === 'Đã xuất bản' ? 'default' : 'secondary'}
                            className={article.TrangThai === 'Đã xuất bản' ? 'bg-green-100 text-green-700 hover:bg-green-100 shadow-none border-transparent' : 'shadow-none border-transparent'}
                          >
                            {article.TrangThai === 'Đã xuất bản' ? tText('Published', 'Đã xuất bản') : article.TrangThai === 'Nháp' ? tText('Draft', 'Bản nháp') : tText('Hidden', 'Ẩn')}
                          </Badge>
                        </TableCell>
                        <TableCell>{article.NgayTao ? new Date(article.NgayTao).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US') : ''}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button onClick={() => alert(`${tText('View Article', 'Xem bài viết')}: ${article.TieuDe}\n${tText('Content', 'Nội dung')}: ${article.NoiDung || tText('Empty', 'Trống')}`)} variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" title={tText('View', 'Xem')}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button onClick={() => handleEditArticle(article)} variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50" title={tText('Edit', 'Sửa')}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button onClick={() => handleDeleteArticle(article.MaBaiViet, article.TieuDe)} variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" title={tText('Delete', 'Xóa')}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {articles.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-gray-500">{tText('No articles found.', 'Chưa có bài viết nào.')}</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {activeTab === 'faqs' && (
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50">
                      <TableHead>{tText('Question', 'Câu hỏi')}</TableHead>
                      <TableHead>{tText('Category', 'Danh mục')}</TableHead>
                      <TableHead>{tText('Order', 'Thứ tự')}</TableHead>
                      <TableHead>{tText('Status', 'Trạng thái')}</TableHead>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">{tText('Actions', 'Hành động')}</th>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {faqs.map((faq) => (
                      <TableRow key={faq.MaFAQ}>
                        <TableCell className="font-medium text-gray-900">{faq.CauHoi}</TableCell>
                        <TableCell>
                          {faq.DanhMucFAQ === 'Mua hàng' ? tText('Purchase', 'Mua hàng') 
                           : faq.DanhMucFAQ === 'Thanh toán' ? tText('Payment', 'Thanh toán') 
                           : faq.DanhMucFAQ === 'Sử dụng' ? tText('Usage', 'Sử dụng') 
                           : faq.DanhMucFAQ === 'Đối tác' ? tText('Partner', 'Đối tác') 
                           : faq.DanhMucFAQ}
                        </TableCell>
                        <TableCell>{faq.ThuTu}</TableCell>
                        <TableCell>
                          <Badge
                            variant={faq.TrangThai === 'Hiển thị' ? 'default' : 'secondary'}
                            className={faq.TrangThai === 'Hiển thị' ? 'bg-green-100 text-green-700 hover:bg-green-100 shadow-none border-transparent' : 'shadow-none border-transparent'}
                          >
                            {faq.TrangThai === 'Hiển thị' ? tText('Visible', 'Hiển thị') : tText('Hidden', 'Ẩn')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button onClick={() => handleEditFaq(faq)} variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50" title={tText('Edit', 'Sửa')}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button onClick={() => handleDeleteFAQ(faq.MaFAQ, faq.CauHoi)} variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" title={tText('Delete', 'Xóa')}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {faqs.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-gray-500">{tText('No FAQs found.', 'Chưa có FAQ nào.')}</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </Tabs>

      {/* --- FAQ Dialog --- */}
      <Dialog open={showFaqModal} onOpenChange={setShowFaqModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-primary">
              {currentFaq ? tText('Edit FAQ', 'Chỉnh Sửa FAQ') : tText('Add New FAQ', 'Thêm FAQ Mới')}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{tText('Question *', 'Câu hỏi *')}</label>
              <Input
                value={faqForm.CauHoi}
                onChange={e => setFaqForm(prev => ({ ...prev, CauHoi: e.target.value }))}
                placeholder={tText("e.g. How to buy a voucher?", "VD: Làm thế nào để mua voucher?")}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{tText('Answer *', 'Trả lời *')}</label>
              <textarea
                value={faqForm.TraLoi}
                onChange={e => setFaqForm(prev => ({ ...prev, TraLoi: e.target.value }))}
                placeholder={tText("e.g. Choose your voucher and click Buy now to pay online...", "VD: Bạn chọn voucher và ấn nút mua thanh toán trực tuyến...")}
                className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-sm"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">{tText('FAQ Category', 'Danh mục FAQ')}</label>
                <select
                  value={faqForm.DanhMucFAQ}
                  onChange={e => setFaqForm(prev => ({ ...prev, DanhMucFAQ: e.target.value }))}
                  className="w-full h-10 border border-gray-200 rounded-md bg-white text-sm px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Mua hàng">{tText('Purchase', 'Mua hàng')}</option>
                  <option value="Thanh toán">{tText('Payment', 'Thanh toán')}</option>
                  <option value="Sử dụng">{tText('Usage', 'Sử dụng')}</option>
                  <option value="Đối tác">{tText('Partner', 'Đối tác')}</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">{tText('Display Order', 'Thứ tự hiển thị')}</label>
                <Input
                  type="number"
                  value={faqForm.ThuTu}
                  onChange={e => setFaqForm(prev => ({ ...prev, ThuTu: Number(e.target.value) }))}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{tText('Status', 'Trạng thái')}</label>
              <select
                value={faqForm.TrangThai}
                onChange={e => setFaqForm(prev => ({ ...prev, TrangThai: e.target.value }))}
                className="w-full h-10 border border-gray-200 rounded-md bg-white text-sm px-3 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Hiển thị">{tText('Visible', 'Hiển thị')}</option>
                <option value="Ẩn">{tText('Hidden', 'Ẩn')}</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFaqModal(false)}>{tText('Cancel', 'Hủy')}</Button>
            <Button onClick={handleSaveFaq}>{tText('Save', 'Lưu lại')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- Article Dialog --- */}
      <Dialog open={showArticleModal} onOpenChange={setShowArticleModal}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-primary">
              {currentArticle ? tText('Edit Article', 'Chỉnh Sửa Bài Viết') : tText('Add New Article', 'Thêm Bài Viết Mới')}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{tText('Article Title *', 'Tiêu đề bài viết *')}</label>
              <Input
                value={articleForm.TieuDe}
                onChange={e => setArticleForm(prev => ({ ...prev, TieuDe: e.target.value }))}
                placeholder={tText("Enter title...", "Nhập tiêu đề...")}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{tText('Author', 'Tác giả')}</label>
              <Input
                value={articleForm.TacGia}
                onChange={e => setArticleForm(prev => ({ ...prev, TacGia: e.target.value }))}
                placeholder="e.g. Admin"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{tText('Article Content', 'Nội dung bài viết')}</label>
              <textarea
                value={articleForm.NoiDung}
                onChange={e => setArticleForm(prev => ({ ...prev, NoiDung: e.target.value }))}
                placeholder={tText("Enter detailed content here...", "Nhập nội dung chi tiết bài viết...")}
                className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-y text-sm"
                rows={6}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{tText('Status', 'Trạng thái')}</label>
              <select
                value={articleForm.TrangThai}
                onChange={e => setArticleForm(prev => ({ ...prev, TrangThai: e.target.value }))}
                className="w-full h-10 border border-gray-200 rounded-md bg-white text-sm px-3 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Đã xuất bản">{tText('Published', 'Đã xuất bản')}</option>
                <option value="Nháp">{tText('Draft', 'Bản nháp')}</option>
                <option value="Ẩn">{tText('Hidden', 'Ẩn')}</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowArticleModal(false)}>{tText('Cancel', 'Hủy')}</Button>
            <Button onClick={handleSaveArticle}>{tText('Save', 'Lưu lại')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- Category Dialog --- */}
      <Dialog open={showCategoryModal} onOpenChange={setShowCategoryModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-primary">
              {currentCategory ? tText('Edit Category', 'Chỉnh Sửa Danh Mục') : tText('Add New Category', 'Thêm Danh Mục Mới')}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{tText('Category Name *', 'Tên danh mục *')}</label>
              <Input
                value={categoryForm.TenDanhMuc}
                onChange={e => setCategoryForm(prev => ({ ...prev, TenDanhMuc: e.target.value }))}
                placeholder={tText("e.g. Food & Dining, Entertainment...", "VD: Ăn uống, Giải trí...")}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{tText('Category Description', 'Mô tả danh mục')}</label>
              <textarea
                value={categoryForm.MoTa}
                onChange={e => setCategoryForm(prev => ({ ...prev, MoTa: e.target.value }))}
                placeholder={tText("Enter description for this category...", "Nhập mô tả cho danh mục...")}
                className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-sm"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCategoryModal(false)}>{tText('Cancel', 'Hủy')}</Button>
            <Button onClick={handleSaveCategory}>{tText('Save', 'Lưu lại')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
