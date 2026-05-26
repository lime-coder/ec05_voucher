import { useState } from 'react';
import { Plus, Edit2, Trash2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router';
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
} from '@voucherhub/ui';

const banners = [
  { id: 1, title: 'Banner khuyến mãi hè 2026', image: 'banner-summer.jpg', position: 'Homepage Top', status: 'Đang hiển thị', date: '01/05/2026' },
  { id: 2, title: 'Flash Sale cuối tuần', image: 'banner-flash.jpg', position: 'Homepage Middle', status: 'Đang hiển thị', date: '15/05/2026' },
  { id: 3, title: 'Voucher F&B hot nhất', image: 'banner-fnb.jpg', position: 'Category Page', status: 'Tạm dừng', date: '10/05/2026' },
];

const categories = [
  { id: 1, name: 'Ăn uống', slug: 'an-uong', vouchers: 156, icon: '🍔', status: 'Hiển thị' },
  { id: 2, name: 'Giải trí', slug: 'giai-tri', vouchers: 89, icon: '🎬', status: 'Hiển thị' },
  { id: 3, name: 'Du lịch', slug: 'du-lich', vouchers: 45, icon: '✈️', status: 'Hiển thị' },
  { id: 4, name: 'Làm đẹp', slug: 'lam-dep', vouchers: 67, icon: '💄', status: 'Ẩn' },
];

const articles = [
  { id: 1, title: 'Top 10 voucher ăn uống hot nhất tháng 5', author: 'Admin', views: 1234, status: 'Đã xuất bản', date: '18/05/2026' },
  { id: 2, title: 'Hướng dẫn sử dụng mã voucher hiệu quả', author: 'Admin', views: 890, status: 'Đã xuất bản', date: '16/05/2026' },
  { id: 3, title: 'Chương trình Flash Sale cuối tuần', author: 'Admin', views: 567, status: 'Nháp', date: '15/05/2026' },
];

const faqs = [
  { id: 1, question: 'Làm thế nào để mua voucher?', category: 'Mua hàng', status: 'Hiển thị', order: 1 },
  { id: 2, question: 'Tôi có thể hoàn tiền không?', category: 'Thanh toán', status: 'Hiển thị', order: 2 },
  { id: 3, question: 'Voucher có thời hạn sử dụng không?', category: 'Sử dụng', status: 'Hiển thị', order: 3 },
  { id: 4, question: 'Làm sao để trở thành đối tác?', category: 'Đối tác', status: 'Ẩn', order: 4 },
];

export function ContentManagement() {
  const [activeTab, setActiveTab] = useState('banners');
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-between items-center mb-6">
          <TabsList className="bg-transparent gap-2 p-0 h-auto justify-start flex-wrap">
            <TabsTrigger
              value="banners"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors border h-9 px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow data-[state=active]:border-primary hover:data-[state=active]:bg-primary/80 data-[state=inactive]:bg-background data-[state=inactive]:text-gray-700 data-[state=inactive]:border-input data-[state=inactive]:shadow-sm hover:data-[state=inactive]:bg-primary/10 hover:data-[state=inactive]:text-accent-foreground"
            >
              Banner & Slider
            </TabsTrigger>
            <TabsTrigger
              value="categories"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors border h-9 px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow data-[state=active]:border-primary hover:data-[state=active]:bg-primary/80 data-[state=inactive]:bg-background data-[state=inactive]:text-gray-700 data-[state=inactive]:border-input data-[state=inactive]:shadow-sm hover:data-[state=inactive]:bg-primary/10 hover:data-[state=inactive]:text-accent-foreground"
            >
              Danh mục
            </TabsTrigger>
            <TabsTrigger
              value="articles"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors border h-9 px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow data-[state=active]:border-primary hover:data-[state=active]:bg-primary/80 data-[state=inactive]:bg-background data-[state=inactive]:text-gray-700 data-[state=inactive]:border-input data-[state=inactive]:shadow-sm hover:data-[state=inactive]:bg-primary/10 hover:data-[state=inactive]:text-accent-foreground"
            >
              Tin tức
            </TabsTrigger>
            <TabsTrigger
              value="faqs"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors border h-9 px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow data-[state=active]:border-primary hover:data-[state=active]:bg-primary/80 data-[state=inactive]:bg-background data-[state=inactive]:text-gray-700 data-[state=inactive]:border-input data-[state=inactive]:shadow-sm hover:data-[state=inactive]:bg-primary/10 hover:data-[state=inactive]:text-accent-foreground"
            >
              FAQ
            </TabsTrigger>
          </TabsList>

          <div>
            {activeTab === 'banners' && (
              <Button className="gap-2" onClick={() => navigate('/admin/content/banner/new')}>
                <Plus className="w-4 h-4" />
                Thêm banner
              </Button>
            )}
            {activeTab === 'categories' && (
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Thêm danh mục
              </Button>
            )}
            {activeTab === 'articles' && (
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Thêm bài viết
              </Button>
            )}
            {activeTab === 'faqs' && (
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Thêm FAQ
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
                      <TableHead>STT</TableHead>
                      <TableHead>Tiêu đề</TableHead>
                      <TableHead>Vị trí</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                      <TableHead className="text-right">Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {banners.map((banner, index) => (
                      <TableRow key={banner.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium text-gray-900">{banner.title}</TableCell>
                        <TableCell>{banner.position}</TableCell>
                        <TableCell>
                          <Badge
                            variant={banner.status === 'Đang hiển thị' ? 'default' : 'secondary'}
                            className={banner.status === 'Đang hiển thị' ? 'bg-green-100 text-green-700 hover:bg-green-100 shadow-none' : 'shadow-none'}
                          >
                            {banner.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{banner.date}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button onClick={() => navigate(`/admin/content/banner/${banner.id}`)} variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button onClick={() => navigate(`/admin/content/banner/${banner.id}`)} variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50">
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button onClick={() => confirm(`Xoá banner: ${banner.title}?`)} variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50">
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

          {activeTab === 'categories' && (
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50">
                      <TableHead>Icon</TableHead>
                      <TableHead>Tên danh mục</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Số voucher</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-right">Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="text-2xl">{category.icon}</TableCell>
                        <TableCell className="font-medium text-gray-900">{category.name}</TableCell>
                        <TableCell>{category.slug}</TableCell>
                        <TableCell>{category.vouchers}</TableCell>
                        <TableCell>
                          <Badge
                            variant={category.status === 'Hiển thị' ? 'default' : 'secondary'}
                            className={category.status === 'Hiển thị' ? 'bg-green-100 text-green-700 hover:bg-green-100 shadow-none' : 'shadow-none'}
                          >
                            {category.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button onClick={() => alert(`Sửa danh mục: ${category.name}`)} variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50">
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button onClick={() => confirm(`Xoá danh mục: ${category.name}?`)} variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50">
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
                      <TableHead>Tiêu đề</TableHead>
                      <TableHead>Tác giả</TableHead>
                      <TableHead>Lượt xem</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                      <TableHead className="text-right">Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {articles.map((article) => (
                      <TableRow key={article.id}>
                        <TableCell className="font-medium text-gray-900">{article.title}</TableCell>
                        <TableCell>{article.author}</TableCell>
                        <TableCell>{article.views}</TableCell>
                        <TableCell>
                          <Badge
                            variant={article.status === 'Đã xuất bản' ? 'default' : 'secondary'}
                            className={article.status === 'Đã xuất bản' ? 'bg-green-100 text-green-700 hover:bg-green-100 shadow-none' : 'shadow-none'}
                          >
                            {article.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{article.date}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button onClick={() => alert(`Xem bài viết: ${article.title}`)} variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button onClick={() => alert(`Sửa bài viết: ${article.title}`)} variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50">
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button onClick={() => confirm(`Xoá bài viết: ${article.title}?`)} variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50">
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

          {activeTab === 'faqs' && (
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50">
                      <TableHead>Câu hỏi</TableHead>
                      <TableHead>Danh mục</TableHead>
                      <TableHead>Thứ tự</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-right">Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {faqs.map((faq) => (
                      <TableRow key={faq.id}>
                        <TableCell className="font-medium text-gray-900">{faq.question}</TableCell>
                        <TableCell>{faq.category}</TableCell>
                        <TableCell>{faq.order}</TableCell>
                        <TableCell>
                          <Badge
                            variant={faq.status === 'Hiển thị' ? 'default' : 'secondary'}
                            className={faq.status === 'Hiển thị' ? 'bg-green-100 text-green-700 hover:bg-green-100 shadow-none' : 'shadow-none'}
                          >
                            {faq.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button onClick={() => alert(`Sửa FAQ: ${faq.question}`)} variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50">
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button onClick={() => confirm(`Xoá FAQ: ${faq.question}?`)} variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50">
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
        </div>
      </Tabs>
    </div>
  );
}
