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
export default function CreateVoucher() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<CreateVoucherFormData & { id?: number }>(initialCreateVoucherForm);

  const [images, setImages] = useState<ImageItem[]>([]);
  const [submitModal, setSubmitModal] = useState<{ isOpen: boolean, isDraft: boolean }>({ isOpen: false, isDraft: false });
  const [partnerBranches, setPartnerBranches] = useState<string[]>([]);
  const [voucherCategories, setVoucherCategories] = useState<{ id: number; name: string }[]>([]);

  // Fetch branches and categories from API
  useEffect(() => {
    const partnerId = localStorage.getItem('partnerId') || '1';
    fetch(`http://localhost:5000/api/branches/partner/${partnerId}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPartnerBranches(data.map((b: any) => b.TenChiNhanh));
        }
      })
      .catch(console.error);

    fetch('http://localhost:5000/api/categories')
      .then(res => res.json())
      .then(data => {
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
        setFormData(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  // Save draft to localStorage on change
  useEffect(() => {
    localStorage.setItem('voucher_draft', JSON.stringify(formData));
  }, [formData]);

  const handleChange = (field: keyof CreateVoucherFormData) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = event.target.value;
    setFormData((current) => ({ ...current, [field]: value }));
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

  const handleFiles = (files: FileList) => {
    let hasInvalid = false;
    const validFiles = Array.from(files).filter(file => {
      if (file.type === 'image/jpeg' || file.type === 'image/png') return true;
      hasInvalid = true;
      return false;
    });

    if (hasInvalid) {
      toast.error('Chỉ chấp nhận định dạng JPEG và PNG');
    }

    const newImages = validFiles.map(file => ({
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      url: URL.createObjectURL(file),
      description: '',
    }));
    setImages(prev => [...prev, ...newImages]);
  };

  const handleImageDescriptionChange = (id: string, description: string) => {
    setImages(images.map(img => img.id === id ? { ...img, description } : img));
  };

  const handleRemoveImage = (id: string) => {
    setImages(images.filter(img => img.id !== id));
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
  };

  const handleSubmit = (isDraft: boolean) => {
    if (!isDraft) {
      if (!formData.name || !formData.originalPrice || !formData.salePrice || !formData.quantity) {
        toast.error('Vui lòng nhập đầy đủ Tên, Giá và Số lượng!');
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

      const payload = {
        ...formData,
        categoryId: categoryObj ? categoryObj.id : null,
        partnerId: parseInt(localStorage.getItem('partnerId') || '1', 10),
        status,
        images // Optional: send images if the backend handles them
      };

      const url = formData.id ? `http://localhost:5000/api/vouchers/${formData.id}` : 'http://localhost:5000/api/vouchers';
      const method = formData.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Lỗi khi lưu Voucher');
      }
      
      const data = await response.json();

      toast.success(submitModal.isDraft ? 'Đã lưu bản nháp thành công!' : 'Đã gửi duyệt Voucher thành công!');
      setSubmitModal({ isOpen: false, isDraft: false });
      
      if (submitModal.isDraft) {
        // Cập nhật ID để lần save sau sẽ gọi PUT thay vì tạo mới
        setFormData(prev => ({ ...prev, id: data.VoucherID }));
      } else {
        // Nộp xong thì clear form và localStorage
        setFormData(initialCreateVoucherForm);
        localStorage.removeItem('voucher_draft');
      }
    } catch (error) {
      toast.error('Đã xảy ra lỗi khi lưu Voucher. Vui lòng thử lại!');
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
                {formData.branches && formData.branches.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {formData.branches.map((branch) => (
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
                  placeholder={t('partner.create.guide_ph')}
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
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('partner.create.who_set_time')}</label>
                <select
                  value={formData.dateSetBy}
                  onChange={(e) => setFormData({ ...formData, dateSetBy: e.target.value as any })}
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="partner">{t('partner.create.time_partner')}</option>
                  <option value="admin">{t('partner.create.time_admin')}</option>
                  <option value="system">{t('partner.create.time_system')}</option>
                </select>
              </div>

              {formData.dateSetBy === 'partner' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('partner.create.sale_start_label')}</label>
                    <Input
                      type="date"
                      value={formData.saleStartDate}
                      onChange={handleChange('saleStartDate')}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('partner.create.sale_end_label')}</label>
                    <Input
                      type="date"
                      value={formData.saleEndDate}
                      onChange={handleChange('saleEndDate')}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('partner.create.valid_start_label')}</label>
                    <Input
                      type="date"
                      value={formData.validStartDate}
                      onChange={handleChange('validStartDate')}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('partner.create.valid_end_label')}</label>
                    <Input
                      type="date"
                      value={formData.validEndDate}
                      onChange={handleChange('validEndDate')}
                    />
                  </div>
                </div>
              )}

              {formData.dateSetBy !== 'partner' && (
                <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-4 text-sm">
                  {formData.dateSetBy === 'admin'
                    ? t('partner.create.admin_time_msg')
                    : t('partner.create.system_time_msg')}
                </div>
              )}
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
