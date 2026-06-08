import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, Tag } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
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

const PRESET_ICONS = [
  // Ăn uống & Đồ uống
  'UtensilsCrossed', 'Coffee', 'Wine', 'Pizza', 'Cake', 'IceCream', 'Soup',
  'Beer', 'Milk', 'Salad', 'ChefHat', 'Sandwich', 'Cookie',
  // Du lịch & Địa điểm
  'Plane', 'Train', 'Bus', 'Ship', 'Car', 'Bike', 'MapPin', 'Globe',
  'Compass', 'Tent', 'Hotel', 'Luggage', 'Map',
  // Làm đẹp & Sức khỏe
  'Sparkles', 'Heart', 'Stethoscope', 'Pill', 'FlaskConical', 'Activity',
  'Leaf', 'Flower2', 'HandHeart', 'Scissors',
  // Thể thao & Fitness
  'Dumbbell', 'Bike', 'Footprints', 'Trophy', 'Target', 'Zap', 'Flame',
  'Sword', 'ShieldCheck',
  // Giải trí & Văn hóa
  'Tv', 'Music', 'Music2', 'Film', 'Ticket', 'Gamepad2', 'Headphones',
  'Mic', 'Star', 'Radio', 'Drama',
  // Mua sắm & Thời trang
  'ShoppingBag', 'ShoppingCart', 'Tag', 'Gift', 'Package', 'Gem',
  'Watch', 'Shirt', 'Crown',
  // Nhiếp ảnh & Sáng tạo
  'Camera', 'Palette', 'Brush', 'Pen', 'BookOpen', 'Image',
  // Giáo dục & Công nghệ
  'GraduationCap', 'Laptop', 'Smartphone', 'Cpu', 'Code2', 'Brain',
  'Microscope', 'Calculator',
  // Nhà cửa & Dịch vụ
  'Home', 'Building2', 'Wrench', 'Hammer', 'Sofa', 'Lamp', 'KeyRound',
  // Trẻ em & Gia đình
  'Baby', 'Dog', 'Cat', 'BirdIcon', 'Smile',
  // Tài chính & Kinh doanh
  'Banknote', 'CreditCard', 'Briefcase', 'PieChart', 'TrendingUp',
  // Khác
  'Leaf', 'Sun', 'Cloud', 'Umbrella', 'Snowflake', 'Rainbow',
];

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
    MoTa: '',
    Icon: 'Tag'
  });
  const [iconSearch, setIconSearch] = useState('');

  // Preview Article Modal state
  const [showViewArticleModal, setShowViewArticleModal] = useState(false);
  const [previewArticle, setPreviewArticle] = useState<any | null>(null);

  // Preview FAQ Modal state
  const [showViewFaqModal, setShowViewFaqModal] = useState(false);
  const [previewFaq, setPreviewFaq] = useState<any | null>(null);

  // Preview Banner Modal state
  const [showViewBannerModal, setShowViewBannerModal] = useState(false);
  const [previewBanner, setPreviewBanner] = useState<any | null>(null);

  const handleViewBanner = (banner: any) => {
    setPreviewBanner(banner);
    setShowViewBannerModal(true);
  };

  const handleViewFaq = (faq: any) => {
    setPreviewFaq(faq);
    setShowViewFaqModal(true);
  };

  // Custom Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const triggerConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmDialog({
      open: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmDialog(prev => ({ ...prev, open: false }));
      }
    });
  };

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
    fetch(`/api/admin/content?t=${Date.now()}`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.banners)) setBanners(data.banners);
        if (Array.isArray(data.articles)) setArticles(data.articles);
        if (Array.isArray(data.faqs)) setFaqs(data.faqs);
      })
      .catch(err => console.error('Fetch content error:', err));

    fetch(`/api/content/categories?t=${Date.now()}`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch(err => console.error('Fetch categories error:', err));
  };

  useEffect(() => {
    fetchAllContent();
  }, []);

  // --- Deletion operations ---
  const handleDeleteBanner = (id: number, title: string) => {
    triggerConfirm(
      tText('Delete Banner', 'Xóa Banner'),
      tText(`Are you sure you want to delete banner: ${title}?`, `Xác nhận xoá banner: ${title}?`),
      async () => {
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
      }
    );
  };

  const handleDeleteArticle = (id: number, title: string) => {
    triggerConfirm(
      tText('Delete Article', 'Xóa Bài Viết'),
      tText(`Are you sure you want to delete article: ${title}?`, `Xác nhận xoá bài viết: ${title}?`),
      async () => {
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
      }
    );
  };

  const handleDeleteFAQ = (id: number, question: string) => {
    triggerConfirm(
      tText('Delete FAQ', 'Xóa FAQ'),
      tText(`Are you sure you want to delete FAQ: ${question}?`, `Xác nhận xoá FAQ: ${question}?`),
      async () => {
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
      }
    );
  };

  // --- Category Actions ---
  const handleDeleteCategory = (id: number, name: string) => {
    triggerConfirm(
      tText('Delete Category', 'Xóa Danh Mục'),
      tText(`Are you sure you want to delete category: ${name}?`, `Xác nhận xoá danh mục: ${name}?`),
      async () => {
        try {
          const res = await fetch(`/api/content/categories/${id}`, { method: 'DELETE' });
          if (res.ok) {
            toast.success(tText('Category deleted successfully!', 'Đã xóa danh mục thành công!'));
            setCategories(prev => prev.filter(c => c.id !== id));
            fetchAllContent();
          } else {
            const data = await res.json();
            toast.error(data.error ? tText(data.error, data.error) : tText('Failed to delete category!', 'Xóa danh mục thất bại!'));
          }
        } catch (err) {
          console.error(err);
          toast.error(tText('An error occurred!', 'Có lỗi xảy ra!'));
        }
      }
    );
  };

  const handleAddCategory = () => {
    setCurrentCategory(null);
    setCategoryForm({
      TenDanhMuc: '',
      MoTa: '',
      Icon: 'Tag'
    });
    setShowCategoryModal(true);
  };

  const handleEditCategory = (cat: any) => {
    setCurrentCategory(cat);
    setCategoryForm({
      TenDanhMuc: cat.name || '',
      MoTa: cat.moTa || '',
      Icon: cat.icon || 'Tag'
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
        toast.error(data.error ? tText(data.error, data.error) : tText('Failed to save category!', 'Lưu danh mục thất bại!'));
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
        const data = await res.json().catch(() => null);
        toast.error(data?.error ? tText(data.error, data.error) : tText('Failed to save FAQ!', 'Lưu FAQ thất bại!'));
      }
    } catch (err) {
      console.error(err);
      toast.error(tText('An error occurred!', 'Có lỗi xảy ra!'));
    }
  };

  // --- Article Actions ---
  const handleViewArticle = (art: any) => {
    setPreviewArticle(art);
    setShowViewArticleModal(true);
  };

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
    if (!articleForm.TieuDe.trim() || !articleForm.NoiDung.trim()) {
      toast.error(tText('Please enter the article title and content', 'Vui lòng nhập tiêu đề và nội dung bài viết'));
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
        const data = await res.json().catch(() => null);
        toast.error(data?.error ? tText(data.error, data.error) : tText('Failed to save article!', 'Lưu bài viết thất bại!'));
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
                            <Button onClick={() => handleViewBanner(banner)} variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" title={tText('View', 'Xem')}>
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
                      <TableHead>{tText('Total Vouchers', 'Tổng voucher')}</TableHead>
                      <TableHead>{tText('Active Vouchers', 'Voucher hoạt động')}</TableHead>
                      <TableHead>{tText('Status', 'Trạng thái')}</TableHead>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">{tText('Actions', 'Hành động')}</th>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category) => {
                      const IconComponent = (LucideIcons as any)[category.icon] || LucideIcons.Tag;
                      return (
                        <TableRow key={category.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                <IconComponent className="w-4 h-4" />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium text-gray-900">
                            {category.name === 'Ăn uống' ? tText('Food & Dining', 'Ăn uống')
                             : category.name === 'Giải trí' ? tText('Entertainment', 'Giải trí')
                             : category.name === 'Du lịch' ? tText('Travel', 'Du lịch')
                             : category.name === 'Làm đẹp' ? tText('Beauty', 'Làm đẹp')
                             : category.name}
                          </TableCell>
                          <TableCell className="max-w-xs truncate" title={category.moTa}>{category.moTa || tText('No description provided', 'Không có mô tả')}</TableCell>
                          <TableCell>{category.vouchers}</TableCell>
                          <TableCell>{category.activeVouchers}</TableCell>
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
                      );
                    })}
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
                            <Button onClick={() => handleViewArticle(article)} variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" title={tText('View', 'Xem')}>
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
                            <Button onClick={() => handleViewFaq(faq)} variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" title={tText('View', 'Xem')}>
                              <Eye className="w-4 h-4" />
                            </Button>
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
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">{tText('Category Icon', 'Icon danh mục')}</label>
                {(() => {
                  const SelectedIconComponent = (LucideIcons as any)[categoryForm.Icon] || LucideIcons.Tag;
                  return (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-primary/10 text-xs text-primary font-semibold border border-primary/20">
                      <span>{tText('Selected:', 'Đã chọn:')}</span>
                      <SelectedIconComponent className="w-3.5 h-3.5" />
                      <span>{categoryForm.Icon}</span>
                    </div>
                  );
                })()}
              </div>
              <div className="grid grid-cols-5 gap-2 p-3 border border-gray-200 rounded-lg bg-gray-50 max-h-36 overflow-y-auto">
                {PRESET_ICONS.map((iconName) => {
                  const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Tag;
                  const isSelected = categoryForm.Icon === iconName;
                  return (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setCategoryForm(prev => ({ ...prev, Icon: iconName }))}
                      className={`flex flex-col items-center justify-center p-2 rounded-md border transition-all ${
                        isSelected
                          ? 'bg-primary/10 border-primary text-primary shadow-sm font-medium'
                          : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-100/50'
                      }`}
                      title={iconName}
                    >
                      <IconComponent className="w-5 h-5" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCategoryModal(false)}>{tText('Cancel', 'Hủy')}</Button>
            <Button onClick={handleSaveCategory}>{tText('Save', 'Lưu lại')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- View Banner Dialog --- */}
      <Dialog open={showViewBannerModal} onOpenChange={setShowViewBannerModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-primary text-lg font-bold">
              {previewBanner?.TieuDe}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4 text-sm">
            {previewBanner?.HinhAnh && (
              <div className="border rounded-lg overflow-hidden bg-gray-50">
                <img
                  src={previewBanner.HinhAnh}
                  alt={previewBanner.TieuDe || 'Banner'}
                  className="w-full max-h-64 object-cover"
                />
              </div>
            )}
            <div className="space-y-3">
              <div className="flex justify-between border-b pb-2 gap-4">
                <span className="text-gray-500 font-medium">{tText('Position:', 'Vị trí:')}</span>
                <span className="font-semibold text-gray-900 text-right">{previewBanner?.ViTri || '-'}</span>
              </div>
              <div className="flex justify-between border-b pb-2 gap-4">
                <span className="text-gray-500 font-medium">{tText('Status:', 'Trạng thái:')}</span>
                <span className="font-semibold text-gray-900 text-right">{previewBanner?.TrangThai || '-'}</span>
              </div>
              <div className="flex justify-between border-b pb-2 gap-4">
                <span className="text-gray-500 font-medium">{tText('Created Date:', 'Ngày tạo:')}</span>
                <span className="font-semibold text-gray-900 text-right">
                  {previewBanner?.NgayTao ? new Date(previewBanner.NgayTao).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US') : '-'}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-gray-500 font-medium block">{tText('Destination Link:', 'Đường dẫn đích:')}</span>
                <p className="text-gray-700 bg-gray-50 p-2.5 rounded border border-gray-100 break-all">
                  {previewBanner?.LinkURL || tText('No link.', 'Không có đường dẫn.')}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowViewBannerModal(false)}>{tText('Close', 'Đóng')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- View Article Dialog --- */}
      <Dialog open={showViewArticleModal} onOpenChange={setShowViewArticleModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-primary text-lg font-bold">
              {previewArticle?.TieuDe}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-3 text-sm">
            <div className="flex justify-between text-xs text-gray-500 border-b pb-2">
              <span>{tText('Author:', 'Tác giả:')} <strong className="text-gray-700">{previewArticle?.TacGia}</strong></span>
              <span>{tText('Status:', 'Trạng thái:')} <strong className="text-gray-700">{previewArticle?.TrangThai}</strong></span>
            </div>
            <div className="text-gray-700 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto pt-2">
              {previewArticle?.NoiDung || tText('No content.', 'Không có nội dung.')}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowViewArticleModal(false)}>{tText('Close', 'Đóng')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- View FAQ Dialog --- */}
      <Dialog open={showViewFaqModal} onOpenChange={setShowViewFaqModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-primary text-lg font-bold">
              {previewFaq?.CauHoi}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-3 text-sm">
            <div className="flex justify-between text-xs text-gray-500 border-b pb-2">
              <span>{tText('Category:', 'Danh mục:')} <strong className="text-gray-700">{previewFaq?.DanhMucFAQ}</strong></span>
              <span>{tText('Display Order:', 'Thứ tự hiển thị:')} <strong className="text-gray-700">{previewFaq?.ThuTu}</strong></span>
            </div>
            <div className="text-gray-700 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto pt-2">
              {previewFaq?.TraLoi || tText('No answer.', 'Không có câu trả lời.')}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowViewFaqModal(false)}>{tText('Close', 'Đóng')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Custom Confirm Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-gray-900 font-bold text-lg">
              {confirmDialog.title}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="text-gray-600 text-sm">{confirmDialog.message}</p>
          </div>
          <DialogFooter className="flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => setConfirmDialog(prev => ({ ...prev, open: false }))}>
              {tText('Cancel', 'Hủy')}
            </Button>
            <Button onClick={confirmDialog.onConfirm} variant="destructive" className="bg-red-600 hover:bg-red-700 text-white">
              {tText('Confirm', 'Xác nhận')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
