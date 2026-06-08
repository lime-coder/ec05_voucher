import React, { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import { toast } from 'sonner';
import {
  CloudUpload,
  Save,
  Send,
  Trash2,
  Plus,
} from 'lucide-react';
import {
  initialCreateVoucherForm,
} from '../data/mockData';
import type { CreateVoucherFormData, ImageItem } from '@voucherhub/types';

import {
  Button,
  Input,
  Badge,
} from '@voucherhub/ui';
import { useLanguage } from '../../shared/contexts/LanguageContext';
import { cn } from '@voucherhub/ui';
import api from '../../../lib/api';
import { useAuth } from '../../auth/AuthContext';
export default function CreateVoucher() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const partnerId = user?.MaDoiTac || 1;
  const [formData, setFormData] = useState<CreateVoucherFormData & { id?: number }>(initialCreateVoucherForm);

  const [images, setImages] = useState<ImageItem[]>([]);
  const [submitModal, setSubmitModal] = useState<{ isOpen: boolean, isDraft: boolean }>({ isOpen: false, isDraft: false });
  const [partnerBranches, setPartnerBranches] = useState<string[]>([]);
  const [voucherCategories, setVoucherCategories] = useState<{ id: number; name: string }[]>([]);

  // Fetch branches and categories from API
  useEffect(() => {
    api.get(`/branches/partner/${partnerId}`)
      .then(res => {
        const data = res.data;
        if (Array.isArray(data)) {
          setPartnerBranches(data.map((b: any) => b.TenChiNhanh));
        }
      })
      .catch(console.error);

    api.get('/categories')
      .then(res => {
        const data = res.data;
        if (Array.isArray(data)) {
          setVoucherCategories(data.map((c: any) => ({ id: c.MaDanhMuc, name: c.TenDanhMuc })));
        }
      })
      .catch(console.error);
  }, []);

  // Restore draft from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('voucher_draft');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(parsed);
      } catch (e) { }
    }
    
    const savedImages = localStorage.getItem('voucher_images_draft');
    if (savedImages) {
      try {
        const parsedImages = JSON.parse(savedImages);
        setImages(parsedImages);
      } catch (e) { }
    }
  }, []);

  // Save draft to localStorage on change
  useEffect(() => {
    localStorage.setItem('voucher_draft', JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    localStorage.setItem('voucher_images_draft', JSON.stringify(images));
  }, [images]);

  const handleChange = (field: keyof CreateVoucherFormData) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = event.target.value;
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleDateChange = (field: 'saleStartDate' | 'saleEndDate' | 'validStartDate' | 'validEndDate') => (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    setFormData((current) => {
      const newData = { ...current, [field]: value };

      if (field === 'saleStartDate' || field === 'saleEndDate') {
        if (newData.saleStartDate && newData.saleEndDate) {
          if (new Date(newData.saleEndDate) < new Date(newData.saleStartDate)) {
            toast.error(t('toast.voucher.date_error') || 'Ngày kết thúc bán phải lớn hơn hoặc bằng ngày bắt đầu bán!');
          }
        }
      }

      if (field === 'validStartDate' || field === 'validEndDate') {
        if (newData.validStartDate && newData.validEndDate) {
          if (new Date(newData.validEndDate) < new Date(newData.validStartDate)) {
            toast.error(t('toast.voucher.date_error') || 'Ngày kết thúc sử dụng phải lớn hơn hoặc bằng ngày bắt đầu sử dụng!');
          }
        }
      }

      return newData;
    });
  };

  const handleBranchToggle = (branch: string) => {
    setFormData(current => {
      const branches = current.branches || [];
      if (branches.includes(branch)) {
        return { ...current, branches: branches.filter(b => b !== branch) };
      } else {
        return { ...current, branches: [...branches, branch] };
      }
    });
  };

  const handleCategoryToggle = (category: string) => {
    setFormData(current => {
      const categories = current.categories || [];
      if (categories.includes(category)) {
        return { ...current, categories: categories.filter(c => c !== category) };
      } else {
        return { ...current, categories: [...categories, category] };
      }
    });
  };

  const handleFiles = async (files: FileList) => {
    let hasInvalid = false;
    const validFiles = Array.from(files).filter(file => {
      if (file.type === 'image/jpeg' || file.type === 'image/png') return true;
      hasInvalid = true;
      return false;
    });

    if (hasInvalid) {
      toast.error(t('toast.voucher.image_format_error') || 'Chỉ chấp nhận định dạng JPEG và PNG');
    }

    for (const file of validFiles) {
      const uploadFormData = new FormData();
      uploadFormData.append('image', file);

      try {
        const res = await api.post(`/vouchers/upload-image`, uploadFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (res.status === 200 || res.status === 201) {
          const data = res.data;
          const newImage = {
            id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
            url: `http://localhost:5000${data.imageUrl}`,
            description: '',
          };
          setImages(prev => [...prev, newImage]);
        } else {
          toast.error(t('toast.voucher.image_upload_error') || 'Lỗi tải ảnh lên máy chủ.');
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error(t('toast.voucher.connection_error') || 'Lỗi kết nối khi tải ảnh.');
      }
    }
  };

  const handleImageDescriptionChange = (id: string, description: string) => {
    setImages(images.map(img => img.id === id ? { ...img, description } : img));
  };

  const handleRemoveImage = (id: string) => {
    setImages(images.filter(img => img.id !== id));
  };

  const handleClearDraft = () => {
    setFormData(initialCreateVoucherForm);
    setImages([]);
    localStorage.removeItem('voucher_draft');
    localStorage.removeItem('voucher_images_draft');
    toast.success(t('toast.voucher.draft_cleared') || 'Đã xóa bản nháp và làm mới form!');
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
    e.target.value = '';
  };

  const handleSubmit = (isDraft: boolean) => {
    if (
      !formData.name ||
      !formData.categories?.length ||
      !formData.branches?.length ||
      !formData.originalPrice ||
      !formData.salePrice ||
      !formData.quantity ||
      !formData.saleStartDate ||
      !formData.saleEndDate ||
      !formData.validStartDate ||
      !formData.validEndDate ||
      !formData.description ||
      !formData.terms
    ) {
      toast.error(t('toast.voucher.missing_fields') || 'Vui lòng điền đầy đủ các trường bắt buộc (*)!');
      return;
    }

    if (new Date(formData.saleEndDate!) < new Date(formData.saleStartDate!)) {
      toast.error(t('toast.voucher.date_error') || 'Ngày kết thúc bán phải lớn hơn hoặc bằng ngày bắt đầu bán!');
      return;
    }

    if (new Date(formData.validEndDate!) < new Date(formData.validStartDate!)) {
      toast.error(t('toast.voucher.date_error') || 'Ngày kết thúc sử dụng phải lớn hơn hoặc bằng ngày bắt đầu sử dụng!');
      return;
    }

    if (formData.originalPrice && formData.salePrice) {
      if (parseFloat(formData.salePrice) >= parseFloat(formData.originalPrice)) {
        toast.error(t('toast.voucher.price_error') || 'Giá bán phải nhỏ hơn giá gốc!');
        return;
      }
    }

    setSubmitModal({ isOpen: true, isDraft });
  };

  const executeSubmit = async () => {
    try {
      const status = submitModal.isDraft ? 'DRAFT' : 'PENDING_APPROVAL';

      const selectedCategoryName = formData.categories && formData.categories.length > 0 ? formData.categories[0] : null;
      const categoryObj = voucherCategories.find(c => c.name === selectedCategoryName);
      
      const imageUrlsStr = images.length > 0 ? images.map(img => img.url.replace('http://localhost:5000', '')).join(',') : null;

      const payload = {
        ...formData,
        categoryId: categoryObj ? categoryObj.id : null,
        partnerId,
        status,
        imageUrl: imageUrlsStr,
        images // Optional: send images if the backend handles them
      };

      const url = formData.id ? `/vouchers/${formData.id}` : '/vouchers';
      const method = formData.id ? 'put' : 'post';

      const response = await api({
        method,
        url,
        data: payload
      });

      if (response.status !== 200 && response.status !== 201) {
        if (response.status === 404 || response.status === 500) {
          throw new Error('404');
        }
        throw new Error('Lỗi khi lưu Voucher');
      }

      const data = response.data;

      toast.success(submitModal.isDraft ? (t('toast.voucher.draft_success') || 'Đã lưu bản nháp thành công!') : (t('toast.voucher.submit_success') || 'Đã gửi duyệt Voucher thành công!'));
      setSubmitModal({ isOpen: false, isDraft: false });

      // Tự động reset lại toàn bộ màn hình khi thành công (cả Lưu Nháp và Gửi Duyệt)
      setFormData(initialCreateVoucherForm);
      setImages([]);
      localStorage.removeItem('voucher_draft');
      localStorage.removeItem('voucher_images_draft');
    } catch (error: any) {
      if (error.message.includes('404')) {
        toast.error(t('toast.voucher.draft_clear_needed') || 'Vui lòng nhấn "Xóa bản nháp" để tạo mới!');
      } else {
        toast.error(t('toast.voucher.save_failed') || 'Đã xảy ra lỗi khi lưu Voucher. Vui lòng thử lại!');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">{t('partner.create.title')}</h1>
        <p className="text-gray-500">{t('partner.create.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold mb-6">{t('partner.create.basic_info')}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium">{t('partner.create.name_label')}</label>
                <Input
                  value={formData.name}
                  onChange={handleChange('name')}
                  placeholder={t('partner.create.name_ph')}
                />
                <p className="text-xs text-gray-500">{t('partner.create.name_desc')}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t('partner.create.category_label')}</label>
                <div className="border border-input rounded-md p-3 max-h-[160px] overflow-y-auto space-y-2 bg-transparent shadow-sm">
                  {voucherCategories.map((cat) => (
                    <label key={cat.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={(formData.categories || []).includes(cat.name)}
                        onChange={() => handleCategoryToggle(cat.name)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm">{cat.name}</span>
                    </label>
                  ))}
                </div>
                {formData.categories && formData.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {formData.categories.map((cat) => (
                      <Badge key={cat} variant="secondary">{cat}</Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t('partner.create.branches_label')}</label>
                <div className="border border-input rounded-md p-3 max-h-[160px] overflow-y-auto space-y-2 bg-transparent shadow-sm">
                  {partnerBranches.map((branch) => (
                    <label key={branch} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={(formData.branches || []).includes(branch)}
                        onChange={() => handleBranchToggle(branch)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm">{branch}</span>
                    </label>
                  ))}
                </div>
                {formData.branches && formData.branches.filter(b => partnerBranches.includes(b)).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {formData.branches.filter(b => partnerBranches.includes(b)).map((branch) => (
                      <Badge key={branch} variant="secondary">{branch}</Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium">{t('partner.create.description_label') || 'Mô tả'}</label>
                <textarea
                  className="flex min-h-[150px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={formData.description}
                  onChange={handleChange('description')}
                  placeholder={t('partner.create.description_ph') || 'Nhập mô tả chi tiết voucher...'}
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium">{t('partner.create.refund_policy_label') || 'Chính sách hoàn tiền'}</label>
                <textarea
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={formData.refundPolicy || ''}
                  onChange={handleChange('refundPolicy')}
                  placeholder={t('partner.create.refund_policy_ph') || 'Nhập chính sách hoàn tiền...'}
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium">{t('partner.create.terms_label')}</label>
                <textarea
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={formData.terms}
                  onChange={handleChange('terms')}
                  placeholder={t('partner.create.terms_ph')}
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium">{t('partner.create.guide_label')}</label>
                <textarea
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={formData.usageInstructions || ''}
                  onChange={handleChange('usageInstructions')}
                  placeholder={t('partner.create.guide_ph') || 'Nhập hướng dẫn sử dụng...'}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold mb-6">{t('partner.create.price_quantity')}</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('partner.create.original_price_label')}</label>
                <div className="relative">
                  <Input
                    type="number"
                    value={formData.originalPrice}
                    onChange={handleChange('originalPrice')}
                    className="pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">₫</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t('partner.create.sale_price_label')}</label>
                <div className="relative">
                  <Input
                    type="number"
                    value={formData.salePrice}
                    onChange={handleChange('salePrice')}
                    className="pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">₫</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t('partner.create.quantity_label')}</label>
                <Input
                  type="number"
                  value={formData.quantity}
                  onChange={handleChange('quantity')}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold mb-6">{t('partner.create.time')}</h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('partner.create.sale_start_label')}</label>
                  <Input
                    type="date"
                    value={formData.saleStartDate}
                    onChange={handleDateChange('saleStartDate')}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('partner.create.sale_end_label')}</label>
                  <Input
                    type="date"
                    value={formData.saleEndDate}
                    onChange={handleDateChange('saleEndDate')}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('partner.create.valid_start_label')}</label>
                  <Input
                    type="date"
                    value={formData.validStartDate}
                    onChange={handleDateChange('validStartDate')}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('partner.create.valid_end_label')}</label>
                  <Input
                    type="date"
                    value={formData.validEndDate}
                    onChange={handleDateChange('validEndDate')}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold mb-6">{t('partner.create.images')}</h2>

            {images.length === 0 ? (
              <label
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="block border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
              >
                <input type="file" className="hidden" onChange={handleFileChange} accept="image/png, image/jpeg" multiple />
                <CloudUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="font-medium text-gray-700 mb-1">{t('partner.create.drag_drop')}</p>
                <p className="text-sm text-gray-500">{t('partner.create.image_format')}</p>
              </label>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {images.map((image) => (
                  <div key={image.id} className="border rounded-lg overflow-hidden bg-white">
                    <img src={image.url} alt="Voucher" className="w-full h-48 object-cover" />
                    <div className="p-4 space-y-4">
                      <Input
                        placeholder={t('partner.create.image_desc_ph')}
                        value={image.description}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleImageDescriptionChange(image.id, e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="w-full gap-2"
                        onClick={() => handleRemoveImage(image.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                        {t('partner.create.image_remove')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {images.length > 0 && (
              <div className="mt-4 flex justify-center">
                <label className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium border border-gray-300 bg-white hover:bg-gray-50 h-10 px-4 py-2 gap-2 transition-colors">
                  <Plus className="w-4 h-4" />
                  {t('partner.create.add_more_image') || 'Thêm ảnh khác'}
                  <input type="file" className="hidden" onChange={handleFileChange} accept="image/png, image/jpeg" multiple />
                </label>
              </div>
            )}

            {images.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-4 text-sm mt-4">
                {t('partner.create.image_note_prefix')}{images.length}{t('partner.create.image_note_suffix')}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <h2 className="text-lg font-bold mb-6">{t('partner.create.settings')}</h2>

            <div className="mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={formData.isRefundable}
                    onChange={(e) => setFormData({ ...formData, isRefundable: e.target.checked })}
                  />
                  <div className={cn('block w-10 h-6 rounded-full transition-colors', formData.isRefundable ? 'bg-primary' : 'bg-gray-300')}></div>
                  <div className={cn('absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform', formData.isRefundable ? 'translate-x-4' : '')}></div>
                </div>
                <span className="font-medium">{t('partner.create.refundable')}</span>
              </label>
              <p className="text-sm text-gray-500 mt-1 ml-13">{t('partner.create.refundable_desc')}</p>
            </div>

            <hr className="my-6" />

            <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-4 text-sm mb-6">
              <p className="font-semibold mb-2">{t('partner.create.approval_process')}</p>
              <ul className="space-y-1 list-disc pl-4">
                <li>{t('partner.create.process_step1')}</li>
                <li>{t('partner.create.process_step2')}</li>
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <Button onClick={() => handleSubmit(false)} className="w-full gap-2 text-white" size="lg">
                <Send className="w-4 h-4" />
                {t('partner.create.submit')}
              </Button>
              <Button variant="outline" onClick={() => handleSubmit(true)} className="w-full gap-2" size="lg">
                <Save className="w-4 h-4" />
                {t('partner.create.save_draft')}
              </Button>
              <Button variant="ghost" onClick={handleClearDraft} className="w-full gap-2 text-red-500 hover:text-red-600 hover:bg-red-50">
                <Trash2 className="w-4 h-4" />
                {t('partner.create.clear_draft') || 'Xóa bản nháp (Làm mới)'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {submitModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 animate-in fade-in zoom-in duration-200 shadow-2xl text-center">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
              {submitModal.isDraft ? <Save className="w-8 h-8" /> : <Send className="w-8 h-8" />}
            </div>
            <h3 className="font-bold text-xl mb-2">
              {submitModal.isDraft ? t('partner.create.draft_msg') : t('partner.create.submit_msg')}
            </h3>
            <p className="text-muted-foreground mb-6 text-sm">
              {submitModal.isDraft ? t('partner.create.draft_desc') : t('partner.create.submit_desc')}
            </p>
            <Button
              onClick={executeSubmit}
              className="w-full py-3"
            >
              OK
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
