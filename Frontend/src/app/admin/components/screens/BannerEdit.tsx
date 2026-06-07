import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { ArrowLeft, Save, UploadCloud } from 'lucide-react';
import { Button, Input } from '@voucherhub/ui';
import { toast } from 'sonner';
import { useLanguage } from '../../../shared/contexts/LanguageContext';

export function BannerEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { language } = useLanguage();
  const tText = (en: string, vi: string) => (language === 'vi' ? vi : en);
  
  const [searchParams] = useSearchParams();
  const isViewOnly = searchParams.get('mode') === 'view';
  
  const isNew = id === 'new';
  const [formData, setFormData] = useState({
    title: '',
    position: 'Homepage Top',
    status: 'Đang hiển thị',
    link: '',
    imageUrl: ''
  });

  // Fetch banner data if editing
  useEffect(() => {
    if (!isNew) {
      fetch('/api/admin/content')
        .then(res => res.json())
        .then(data => {
          if (data && Array.isArray(data.banners)) {
            const found = data.banners.find((b: any) => b.MaBanner === Number(id));
            if (found) {
              setFormData({
                title: found.TieuDe || '',
                position: found.ViTri || 'Homepage Top',
                status: found.TrangThai || 'Đang hiển thị',
                link: found.LinkURL || '',
                imageUrl: found.HinhAnh || ''
              });
            }
          }
        })
        .catch(err => console.error('Fetch banner detail error:', err));
    }
  }, [id, isNew]);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (isViewOnly) return;
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleAreaClick = () => {
    if (isViewOnly) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isViewOnly) return;
    const file = e.target.files?.[0];
    if (!file) return;

    const bodyData = new FormData();
    bodyData.append('image', file);

    try {
      const response = await fetch('/api/content/upload', {
        method: 'POST',
        body: bodyData
      });
      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({ ...prev, imageUrl: data.path }));
        toast.success(tText('Image uploaded successfully!', 'Tải ảnh lên thành công!'));
      } else {
        toast.error(tText('Failed to upload image!', 'Tải ảnh lên thất bại!'));
      }
    } catch (err) {
      console.error('File upload error:', err);
      toast.error(tText('An error occurred while uploading image!', 'Có lỗi xảy ra khi tải ảnh lên!'));
    }
  };

  const handleSave = async () => {
    if (isViewOnly) return;
    if (!formData.title.trim()) {
      toast.error(tText('Please enter the banner title', 'Vui lòng nhập tiêu đề Banner'));
      return;
    }
    
    const payload = {
      type: 'banner',
      TieuDe: formData.title,
      ViTri: formData.position,
      TrangThai: formData.status,
      LinkURL: formData.link,
      HinhAnh: formData.imageUrl
    };

    try {
      const url = isNew ? '/api/admin/content' : `/api/admin/content/${id}`;
      const method = isNew ? 'POST' : 'PUT';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success(isNew ? tText('Banner added successfully!', 'Đã thêm banner thành công!') : tText('Banner updated successfully!', 'Đã cập nhật banner thành công!'));
        navigate('/admin/content');
      } else {
        toast.error(tText('Failed to save banner!', 'Lưu banner thất bại!'));
      }
    } catch (err) {
      console.error(err);
      toast.error(tText('An error occurred while saving banner!', 'Có lỗi xảy ra khi lưu banner!'));
    }
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
            {isNew ? tText('Add New Banner', 'Thêm Banner Mới') : isViewOnly ? tText('Banner Details', 'Chi tiết Banner') : tText('Edit Banner', 'Sửa Banner')}
          </h1>
          <p className="text-gray-500">
            {isNew ? tText('Configure details for the new banner', 'Thiết lập thông tin cho banner mới') : isViewOnly ? tText('View banner details and image', 'Xem thông tin và hình ảnh banner') : tText('Update banner details and image', 'Cập nhật thông tin và hình ảnh banner')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
            <h2 className="text-lg font-bold">{tText('General Information', 'Thông tin chung')}</h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{tText('Banner Title *', 'Tiêu đề Banner *')}</label>
                <Input 
                  value={formData.title} 
                  onChange={handleChange('title')} 
                  placeholder={tText("e.g. Weekend Flash Sale", "VD: Flash Sale Cuối Tuần")} 
                  disabled={isViewOnly}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{tText('Destination Link (URL) *', 'Đường dẫn đích (URL) *')}</label>
                <Input 
                  value={formData.link} 
                  onChange={handleChange('link')} 
                  placeholder={tText("e.g. /search?category=food", "VD: /search?category=food")} 
                  disabled={isViewOnly}
                />
                <p className="text-xs text-gray-500">{tText('Customers will be redirected to this URL when clicking on the banner', 'Khách hàng sẽ được chuyển đến link này khi click vào banner')}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{tText('Display Position *', 'Vị trí hiển thị *')}</label>
                  <select 
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                    value={formData.position}
                    onChange={handleChange('position')}
                    disabled={isViewOnly}
                  >
                    <option value="Homepage Top">{tText('Homepage Top (Hero)', 'Homepage Top (Hero)')}</option>
                    <option value="Homepage Middle">{tText('Homepage Middle (Featured)', 'Homepage Middle (Nổi bật)')}</option>
                    <option value="Category Page">{tText('Category Page', 'Trang danh mục')}</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{tText('Status *', 'Trạng thái *')}</label>
                  <select 
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                    value={formData.status}
                    onChange={handleChange('status')}
                    disabled={isViewOnly}
                  >
                    <option value="Đang hiển thị">{tText('Visible', 'Đang hiển thị')}</option>
                    <option value="Tạm dừng">{tText('Paused', 'Tạm dừng')}</option>
                    <option value="Nháp">{tText('Draft', 'Bản nháp')}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold mb-4">{tText('Banner Image', 'Hình ảnh Banner')}</h2>
            
            {formData.imageUrl ? (
              <div className="space-y-4">
                <div className="border rounded-lg overflow-hidden bg-gray-50">
                  <img src={formData.imageUrl} alt="Banner Preview" className="w-full h-auto object-cover max-h-[300px]" />
                </div>
                {!isViewOnly && (
                  <Button variant="outline" className="w-full" onClick={() => setFormData(prev => ({...prev, imageUrl: ''}))}>
                    {tText('Change Image', 'Thay đổi hình ảnh')}
                  </Button>
                )}
              </div>
            ) : (
              <div 
                onClick={handleAreaClick}
                className={`border-2 border-dashed border-gray-300 rounded-xl p-12 text-center bg-gray-50 ${isViewOnly ? '' : 'hover:bg-gray-100 cursor-pointer'} transition-colors`}
              >
                <UploadCloud className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="font-medium text-gray-700 mb-1">
                  {isViewOnly 
                    ? tText('No image uploaded', 'Chưa tải ảnh lên')
                    : tText('Drag and drop image here or click to upload', 'Kéo thả ảnh vào đây hoặc click để tải lên')
                  }
                </p>
                {!isViewOnly && (
                  <>
                    <p className="text-sm text-gray-500">{tText('Supports: JPG, PNG, GIF (Max 5MB)', 'Hỗ trợ: JPG, PNG, GIF (Tối đa 5MB)')}</p>
                    <p className="text-sm text-gray-500 mt-2 font-medium">{tText('Recommended size: 1440x480px (Homepage Top)', 'Kích thước đề xuất: 1440x480px (Homepage Top)')}</p>
                  </>
                )}
              </div>
            )}
            
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24 space-y-6">
            <h2 className="text-lg font-bold">{tText('Actions', 'Hành động')}</h2>
            
            <div className="space-y-3">
              {!isViewOnly && (
                <Button onClick={handleSave} className="w-full gap-2" size="lg">
                  <Save className="w-4 h-4" />
                  {tText('Save Changes', 'Lưu Thay Đổi')}
                </Button>
              )}
              <Button variant="outline" onClick={() => navigate('/admin/content')} className="w-full" size="lg">
                {isViewOnly ? tText('Back', 'Quay lại') : tText('Cancel', 'Hủy bỏ')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
