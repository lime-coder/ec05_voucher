import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Save, UploadCloud } from 'lucide-react';
import { Button, Input } from '@voucherhub/ui';

export function BannerEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // In a real app, you would fetch banner details by ID
  const isNew = id === 'new';
  const [formData, setFormData] = useState({
    title: isNew ? '' : 'Banner khuyến mãi hè 2026',
    position: isNew ? 'Homepage Top' : 'Homepage Top',
    status: isNew ? 'Đang hiển thị' : 'Đang hiển thị',
    link: isNew ? '' : '/search?category=summer',
    imageUrl: isNew ? '' : 'https://via.placeholder.com/800x400'
  });

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = () => {
    // Save logic here
    alert('Đã lưu banner thành công!');
    navigate('/admin/content');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-8">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/admin/content')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isNew ? 'Thêm Banner Mới' : 'Sửa Banner'}
          </h1>
          <p className="text-gray-500">
            {isNew ? 'Thiết lập thông tin cho banner mới' : 'Cập nhật thông tin và hình ảnh banner'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
            <h2 className="text-lg font-bold">Thông tin chung</h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tiêu đề Banner *</label>
                <Input 
                  value={formData.title} 
                  onChange={handleChange('title')} 
                  placeholder="VD: Flash Sale Cuối Tuần" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Đường dẫn đích (URL) *</label>
                <Input 
                  value={formData.link} 
                  onChange={handleChange('link')} 
                  placeholder="VD: /search?category=food" 
                />
                <p className="text-xs text-gray-500">Khách hàng sẽ được chuyển đến link này khi click vào banner</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Vị trí hiển thị *</label>
                  <select 
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    value={formData.position}
                    onChange={handleChange('position')}
                  >
                    <option value="Homepage Top">Homepage Top (Hero)</option>
                    <option value="Homepage Middle">Homepage Middle (Nổi bật)</option>
                    <option value="Category Page">Trang danh mục</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Trạng thái *</label>
                  <select 
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    value={formData.status}
                    onChange={handleChange('status')}
                  >
                    <option value="Đang hiển thị">Đang hiển thị</option>
                    <option value="Tạm dừng">Tạm dừng</option>
                    <option value="Nháp">Bản nháp</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold mb-4">Hình ảnh Banner</h2>
            
            {formData.imageUrl ? (
              <div className="space-y-4">
                <div className="border rounded-lg overflow-hidden bg-gray-50">
                  <img src={formData.imageUrl} alt="Banner Preview" className="w-full h-auto object-cover max-h-[300px]" />
                </div>
                <Button variant="outline" className="w-full" onClick={() => setFormData(prev => ({...prev, imageUrl: ''}))}>
                  Thay đổi hình ảnh
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">
                <UploadCloud className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="font-medium text-gray-700 mb-1">Kéo thả ảnh vào đây hoặc click để tải lên</p>
                <p className="text-sm text-gray-500">Hỗ trợ: JPG, PNG, GIF (Tối đa 5MB)</p>
                <p className="text-sm text-gray-500 mt-2 font-medium">Kích thước đề xuất: 1440x480px (Homepage Top)</p>
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24 space-y-6">
            <h2 className="text-lg font-bold">Hành động</h2>
            
            <div className="space-y-3">
              <Button onClick={handleSave} className="w-full gap-2" size="lg">
                <Save className="w-4 h-4" />
                Lưu Thay Đổi
              </Button>
              <Button variant="outline" onClick={() => navigate('/admin/content')} className="w-full" size="lg">
                Hủy bỏ
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
