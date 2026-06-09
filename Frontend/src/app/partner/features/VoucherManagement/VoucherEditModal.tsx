import React from 'react';
import { Edit, Plus, Eye, Trash2 } from 'lucide-react';
import { Badge, Button, Input, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@voucherhub/ui';
import type { PartnerVoucher as Voucher } from '@voucherhub/types';
import { useLanguage } from '../../../shared/contexts/LanguageContext';
import { toast } from 'sonner';
import api from '../../../../lib/api';

export const VoucherEditModal = ({
  editDialogOpen,
  setEditDialogOpen,
  selectedVoucher,
  editingVoucher,
  setEditingVoucher,
  editImages,
  setEditImages,
  previewImage,
  setPreviewImage,
  handleCancelEdit,
  voucherCategories,
  handleEditCategoryToggle,
  handleEditImageUpload,
  handleRemoveEditImage,
  uploadingImage,
  setConfirmModalState,
  setVouchers,
  fetchVouchers,
  statusTranslations
}: any) => {
  const { t, language } = useLanguage();

  return (
    <Dialog open={editDialogOpen} onOpenChange={(open) => { if (!open) handleCancelEdit(); else setEditDialogOpen(true); }}>
        <DialogContent
          className="sm:max-w-[800px] p-0 overflow-hidden bg-white rounded-2xl"
          onInteractOutside={(e) => {
            if (previewImage) {
              e.preventDefault();
            }
          }}
          onEscapeKeyDown={(e) => {
            if (previewImage) {
              e.preventDefault();
            }
          }}
        >
          <DialogHeader className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Edit className="w-5 h-5 text-blue-500" />
              {t('partner.vouchers.edit_title')}
            </DialogTitle>
          </DialogHeader>
          {selectedVoucher && (
            <div className="max-h-[75vh] overflow-y-auto px-6 py-6 space-y-8 custom-scrollbar">
              {editingVoucher?.status === 'draft' && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-xl flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="bg-yellow-100 p-2 rounded-lg">
                      <Edit className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div>
                      <span className="font-semibold block text-sm">{t('partner.vouchers.draft_label') || 'Bản nháp'}</span>
                      <span className="text-sm text-yellow-700">{t('partner.vouchers.draft_not_submitted') || 'Voucher này chưa được gửi duyệt.'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Basic Info Section */}
              <section className="space-y-6">
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b pb-2">
                  <span className="w-1.5 h-4 bg-blue-500 rounded-full"></span>
                  {t('partner.create.basic_info') || 'Thông tin cơ bản'}
                </h4>

                <div className="flex flex-col md:flex-row gap-6">
                  {/* Image Upload */}
                  <div className="md:w-1/3 flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">{t('partner.vouchers.image_label') || 'Ảnh Voucher'}</label>
                    {editImages.length === 0 ? (
                      <label htmlFor="edit-voucher-image" className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center relative overflow-hidden bg-gray-50 flex flex-col items-center justify-center aspect-square cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all group">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Plus className="w-5 h-5" />
                          </div>
                          <span className="text-blue-600 font-medium text-sm">{t('partner.vouchers.choose_file') || 'Chọn tệp'}</span>
                        </div>
                        {uploadingImage && <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center text-sm font-bold text-blue-600">{t('partner.vouchers.uploading') || 'Đang tải...'}</div>}
                      </label>
                    ) : (
                      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                        {editImages.map((img: any) => (
                          <div key={img.id} className="relative border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm group">
                            <img
                              src={img.url}
                              alt="Voucher"
                              className="w-full h-32 object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
                              onClick={() => setPreviewImage(img.url)}
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center justify-center">
                              <Eye className="text-white w-6 h-6" />
                            </div>
                            <button
                              type="button"
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-md p-1.5 opacity-0 group-hover:opacity-100 transition-all shadow-sm hover:bg-red-600 hover:scale-110 z-10"
                              onClick={() => handleRemoveEditImage(img.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <label className="cursor-pointer flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-300 transition-all gap-2">
                          <Plus className="w-4 h-4" />
                          {t('partner.vouchers.add_more_image') || 'Thêm ảnh khác'}
                          <input type="file" className="hidden" accept="image/jpeg, image/png" multiple onChange={handleEditImageUpload} />
                        </label>
                        {uploadingImage && <div className="text-center text-xs text-blue-600 font-medium">{t('partner.vouchers.uploading') || 'Đang tải...'}</div>}
                      </div>
                    )}
                    <input type="file" id="edit-voucher-image" accept="image/jpeg, image/png" onChange={handleEditImageUpload} className="hidden" multiple />
                  </div>

                  {/* Name and Categories */}
                  <div className="md:w-2/3 space-y-5">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">{t('partner.vouchers.name_req')}</label>
                      <Input
                        className="rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                        value={editingVoucher?.name || ''}
                        onChange={e => setEditingVoucher((prev: any) => ({ ...prev, name: e.target.value }))}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">{t('partner.vouchers.category_label') || 'Danh mục'}</label>
                        <div className="border border-gray-300 rounded-lg p-3 max-h-[140px] overflow-y-auto space-y-2 bg-gray-50 shadow-inner custom-scrollbar">
                          {voucherCategories.map((cat: any) => (
                            <label key={cat.id} className="flex items-center gap-3 cursor-pointer hover:bg-white p-2 rounded-md transition-colors border border-transparent hover:border-gray-200">
                              <input
                                type="checkbox"
                                checked={(editingVoucher?.categories || []).includes(cat.name)}
                                onChange={() => handleEditCategoryToggle(cat.name)}
                                className="rounded border-gray-300 w-4 h-4 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {editingVoucher?.status !== 'draft' && (
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700">{t('partner.vouchers.status_label')}</label>
                          <div className="flex h-[42px] w-full items-center rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-500 font-medium cursor-not-allowed">
                            {language === 'en' ? (editingVoucher?.status ? editingVoucher.status.charAt(0).toUpperCase() + editingVoucher.status.slice(1) : '') : (statusTranslations[editingVoucher?.status || ''] || editingVoucher?.status)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* Pricing & Limits Section */}
              <section className="space-y-6">
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b pb-2">
                  <span className="w-1.5 h-4 bg-purple-500 rounded-full"></span>
                  Pricing & Limits
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">{t('partner.vouchers.original_price_req')}</label>
                    <div className="relative">
                      <Input
                        type="number"
                        className="rounded-lg border-gray-300 pr-8 shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:opacity-70"
                        value={editingVoucher?.originalPrice || 0}
                        onChange={e => setEditingVoucher((prev: any) => ({ ...prev, originalPrice: parseFloat(e.target.value) }))}
                        disabled={!(editingVoucher && ['draft', 'rejected', 'paused'].includes(editingVoucher.status as string))}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₫</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">{t('partner.vouchers.sale_price_req')}</label>
                    <div className="relative">
                      <Input
                        type="number"
                        className="rounded-lg border-red-300 text-red-600 font-semibold pr-8 shadow-sm focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100 disabled:opacity-70"
                        value={editingVoucher?.salePrice || 0}
                        onChange={e => setEditingVoucher((prev: any) => ({ ...prev, salePrice: parseFloat(e.target.value) }))}
                        disabled={!(editingVoucher && ['draft', 'rejected', 'paused'].includes(editingVoucher.status as string))}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 font-medium">₫</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">{t('partner.vouchers.total_req')}</label>
                    <Input
                      type="number"
                      className="rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      value={editingVoucher?.quantity || 0}
                      onChange={e => setEditingVoucher((prev: any) => ({ ...prev, quantity: parseInt(e.target.value, 10) }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">{t('partner.create.sale_start_label') || 'Thời gian bán (Bắt đầu)'}</label>
                    <Input
                      type="date"
                      className="rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:opacity-70"
                      value={editingVoucher?.saleStartDateRaw ? new Date(editingVoucher.saleStartDateRaw as string).toISOString().split('T')[0] : ''}
                      onChange={e => setEditingVoucher((prev: any) => ({ ...prev, saleStartDateRaw: e.target.value }))}
                      disabled={!(editingVoucher && ['draft', 'rejected', 'paused'].includes(editingVoucher.status as string))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">{t('partner.create.sale_end_label') || 'Thời gian bán (Kết thúc)'}</label>
                    <Input
                      type="date"
                      className="rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:opacity-70"
                      value={editingVoucher?.saleEndDateRaw ? new Date(editingVoucher.saleEndDateRaw as string).toISOString().split('T')[0] : ''}
                      onChange={e => setEditingVoucher((prev: any) => ({ ...prev, saleEndDateRaw: e.target.value }))}
                      disabled={!(editingVoucher && ['draft', 'rejected', 'paused'].includes(editingVoucher.status as string))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">{t('partner.create.valid_start_label') || 'Thời gian sử dụng (Bắt đầu)'}</label>
                    <Input
                      type="date"
                      className="rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:opacity-70"
                      value={editingVoucher?.validStartDateRaw ? new Date(editingVoucher.validStartDateRaw as string).toISOString().split('T')[0] : ''}
                      onChange={e => setEditingVoucher((prev: any) => ({ ...prev, validStartDateRaw: e.target.value }))}
                      disabled={!(editingVoucher && ['draft', 'rejected', 'paused'].includes(editingVoucher.status as string))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">{t('partner.create.valid_end_label') || 'Thời gian sử dụng (Kết thúc)'}</label>
                    <Input
                      type="date"
                      className="rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:opacity-70"
                      value={editingVoucher?.validEndDateRaw ? new Date(editingVoucher.validEndDateRaw as string).toISOString().split('T')[0] : ''}
                      onChange={e => setEditingVoucher((prev: any) => ({ ...prev, validEndDateRaw: e.target.value }))}
                      disabled={!(editingVoucher && ['draft', 'rejected', 'paused'].includes(editingVoucher.status as string))}
                    />
                  </div>
                </div>
              </section>

              {/* Descriptions Section */}
              <section className="space-y-6">
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b pb-2">
                  <span className="w-1.5 h-4 bg-orange-500 rounded-full"></span>
                  {t('partner.vouchers.details_terms') || 'Chi tiết & Điều khoản'}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">{t('partner.vouchers.description_label') || 'Mô tả'} *</label>
                    <textarea
                      className="flex min-h-[120px] w-full rounded-xl border-gray-300 bg-white px-4 py-3 text-sm shadow-sm focus-visible:border-blue-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 resize-y custom-scrollbar"
                      value={editingVoucher?.description || ''}
                      onChange={e => setEditingVoucher((prev: any) => prev ? { ...prev, description: e.target.value } : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">{t('partner.create.guide_label') || 'Hướng dẫn sử dụng'}</label>
                    <textarea
                      className="flex min-h-[120px] w-full rounded-xl border-gray-300 bg-white px-4 py-3 text-sm shadow-sm focus-visible:border-blue-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 resize-y custom-scrollbar"
                      value={editingVoucher?.usageInstructions || ''}
                      onChange={e => setEditingVoucher((prev: any) => prev ? { ...prev, usageInstructions: e.target.value } : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">{t('partner.vouchers.terms_label') || 'Điều kiện'} *</label>
                    <textarea
                      className="flex min-h-[120px] w-full rounded-xl border-gray-300 bg-white px-4 py-3 text-sm shadow-sm focus-visible:border-orange-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-500 resize-y custom-scrollbar"
                      value={editingVoucher?.terms || ''}
                      onChange={e => setEditingVoucher((prev: any) => prev ? { ...prev, terms: e.target.value } : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">{t('partner.create.refund_policy_label') || 'Chính sách hoàn tiền'}</label>
                    <textarea
                      className="flex min-h-[120px] w-full rounded-xl border-gray-300 bg-white px-4 py-3 text-sm shadow-sm focus-visible:border-green-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-500 resize-y custom-scrollbar"
                      value={editingVoucher?.refundPolicy || ''}
                      onChange={e => setEditingVoucher((prev: any) => prev ? { ...prev, refundPolicy: e.target.value } : null)}
                    />
                  </div>
                </div>
              </section>
            </div>
          )}
          <DialogFooter className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex flex-row justify-end gap-3 items-center">
            <Button variant="outline" className="rounded-full px-6 font-medium border-gray-300 hover:bg-gray-100" onClick={() => handleCancelEdit()}>{t('common.cancel') || 'Hủy'}</Button>
            {['draft', 'rejected', 'paused'].includes(editingVoucher?.status as string) && (
              <Button
                variant="default"
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 font-medium shadow-md hover:shadow-lg transition-all"
                onClick={() => {
                  if (!editingVoucher) return;
                  setConfirmModalState({
                    isOpen: true,
                    title: t('voucher.submit_approval.title') || 'Gửi duyệt voucher',
                    description: t('voucher.submit_approval.desc') || 'Bạn có chắc chắn muốn gửi duyệt voucher này không?',
                    onConfirm: async () => {
                      try {
                        if (!editingVoucher.name || !editingVoucher.originalPrice || !editingVoucher.salePrice || !editingVoucher.validStartDateRaw || !editingVoucher.validEndDateRaw || !editingVoucher.saleStartDateRaw || !editingVoucher.saleEndDateRaw || !editingVoucher.quantity || !editingVoucher.description || !editingVoucher.terms) {
                          toast.error(t('toast.voucher.missing_fields') || 'Vui lòng điền đầy đủ các trường bắt buộc!');
                          return;
                        }
                        if (editingVoucher.salePrice >= editingVoucher.originalPrice) {
                          toast.error(t('toast.voucher.price_error') || 'Giá bán phải nhỏ hơn giá gốc!');
                          return;
                        }
                        if (new Date(editingVoucher.validEndDateRaw) < new Date(editingVoucher.validStartDateRaw)) {
                          toast.error(t('toast.voucher.date_error') || 'Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu!');
                          return;
                        }
                        if (new Date(editingVoucher.saleEndDateRaw) < new Date(editingVoucher.saleStartDateRaw)) {
                          toast.error(t('toast.voucher.date_error') || 'Ngày kết thúc bán phải lớn hơn hoặc bằng ngày bắt đầu bán!');
                          return;
                        }

                        const partnerId = localStorage.getItem('partnerId') || '1';
                        const categoryObj = voucherCategories.find((c: any) => editingVoucher.categories && editingVoucher.categories.includes(c.name));
                        const payload = {
                          name: editingVoucher.name,
                          categoryId: categoryObj ? categoryObj.id : editingVoucher.categoryId,
                          partnerId: parseInt(partnerId, 10),
                          description: editingVoucher.description,
                          terms: editingVoucher.terms,
                          originalPrice: editingVoucher.originalPrice,
                          salePrice: editingVoucher.salePrice,
                          quantity: editingVoucher.quantity,
                          saleStartDate: editingVoucher.saleStartDateRaw,
                          saleEndDate: editingVoucher.saleEndDateRaw,
                          validStartDate: editingVoucher.validStartDateRaw,
                          validEndDate: editingVoucher.validEndDateRaw,
                          status: 'PENDING_APPROVAL',
                          refundPolicy: editingVoucher.refundPolicy,
                          usageInstructions: editingVoucher.usageInstructions,
                          imageUrl: editImages.length > 0 ? editImages.map((img: any) => img.url.replace('http://localhost:5000', '')).join(',') : null
                        };
                        await api.put(`/vouchers/${editingVoucher.id}`, payload);
                        setEditDialogOpen(false);
                        fetchVouchers();
                        toast.success(t('toast.voucher.submit_success') || 'Đã gửi duyệt Voucher thành công!');
                      } catch (err: any) {
                        console.error(err);
                        toast.error(err.response?.data?.message ? t(err.response.data.message as string) : t('toast.voucher.submit_failed') || 'Gửi duyệt thất bại. Vui lòng thử lại!');
                      }
                    }
                  });
                }}
              >
                {t('voucher.submit_approval.title') || 'Gửi duyệt'}
              </Button>
            )}
            {['draft', 'rejected', 'paused'].includes(editingVoucher?.status as string) && (
              <Button className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-6 font-medium shadow-md hover:shadow-lg transition-all" onClick={async () => {
                if (!editingVoucher) return;
                
                if (!editingVoucher.name || !editingVoucher.originalPrice || !editingVoucher.salePrice || !editingVoucher.validStartDateRaw || !editingVoucher.validEndDateRaw || !editingVoucher.saleStartDateRaw || !editingVoucher.saleEndDateRaw || !editingVoucher.quantity) {
                  toast.error(t('toast.voucher.missing_fields') || 'Vui lòng điền đầy đủ các trường bắt buộc!');
                  return;
                }

                if (editingVoucher.salePrice >= editingVoucher.originalPrice) {
                  toast.error(t('toast.voucher.price_error') || 'Giá bán phải nhỏ hơn giá gốc!');
                  return;
                }

                if (new Date(editingVoucher.validEndDateRaw) < new Date(editingVoucher.validStartDateRaw)) {
                  toast.error(t('toast.voucher.date_error') || 'Ngày kết thúc sử dụng phải lớn hơn hoặc bằng ngày bắt đầu!');
                  return;
                }
                
                if (new Date(editingVoucher.saleEndDateRaw) < new Date(editingVoucher.saleStartDateRaw)) {
                  toast.error(t('toast.voucher.date_error') || 'Ngày kết thúc bán phải lớn hơn hoặc bằng ngày bắt đầu bán!');
                  return;
                }

                const executeSave = async () => {
                  try {
                    const partnerId = localStorage.getItem('partnerId') || '1';

                    let backendStatus = 'DRAFT';
                    if (editingVoucher.status === 'active') backendStatus = 'ACTIVE';
                    if (editingVoucher.status === 'paused') backendStatus = 'DRAFT';
                    if (editingVoucher.status === 'pending') backendStatus = 'PENDING_APPROVAL';
                    if (editingVoucher.status === 'rejected') backendStatus = 'REJECTED';

                    const categoryObj = voucherCategories.find((c: any) => editingVoucher.categories && editingVoucher.categories.includes(c.name));

                    const payload = {
                      name: editingVoucher.name,
                      categoryId: categoryObj ? categoryObj.id : editingVoucher.categoryId,
                      partnerId: parseInt(partnerId, 10),
                      description: editingVoucher.description,
                      terms: editingVoucher.terms,
                      originalPrice: editingVoucher.originalPrice,
                      salePrice: editingVoucher.salePrice,
                      quantity: editingVoucher.quantity,
                      saleStartDate: editingVoucher.saleStartDateRaw,
                      saleEndDate: editingVoucher.saleEndDateRaw,
                      validStartDate: editingVoucher.validStartDateRaw,
                      validEndDate: editingVoucher.validEndDateRaw,
                      status: backendStatus,
                      refundPolicy: editingVoucher.refundPolicy,
                      usageInstructions: editingVoucher.usageInstructions,
                      imageUrl: editImages.length > 0 ? editImages.map((img: any) => img.url.replace('http://localhost:5000', '')).join(',') : null
                    };

                    await api.put(`/vouchers/${editingVoucher.id}`, payload);

                    setVouchers((prev: any) => prev.map((v: any) => v.id === editingVoucher.id ? {
                      ...v,
                      name: editingVoucher.name!,
                      originalPrice: editingVoucher.originalPrice!,
                      salePrice: editingVoucher.salePrice!,
                      quantity: editingVoucher.quantity!,
                      status: editingVoucher.status === 'paused' ? 'draft' : editingVoucher.status!,
                      categoryId: editingVoucher.categoryId,
                      validStartDateRaw: editingVoucher.validStartDateRaw,
                      validEndDateRaw: editingVoucher.validEndDateRaw,
                      validFrom: new Date(editingVoucher.validStartDateRaw!).toLocaleDateString('vi-VN'),
                      validTo: new Date(editingVoucher.validEndDateRaw!).toLocaleDateString('vi-VN'),
                      description: editingVoucher.description,
                      terms: editingVoucher.terms,
                      refundPolicy: editingVoucher.refundPolicy,
                      usageInstructions: editingVoucher.usageInstructions,
                      imageUrl: editingVoucher.imageUrl
                    } : v));
                    setEditDialogOpen(false);
                    fetchVouchers(); // Refresh
                    toast.success(t('toast.voucher.update_success') || 'Cập nhật Voucher thành công!');
                  } catch (err: any) {
                    console.error(err);
                    toast.error(err.response?.data?.message ? t(err.response.data.message as string) : t('toast.voucher.update_failed') || 'Cập nhật thất bại. Vui lòng kiểm tra lại thông tin!');
                  }
                };

                if (editingVoucher.status === 'paused') {
                  setConfirmModalState({
                    isOpen: true,
                    title: t('partner.vouchers.save_changes') || 'Lưu thay đổi',
                    description: t('partner.vouchers.save_paused_warn') || 'Lưu thay đổi sẽ khiến voucher này bị chuyển về trạng thái Bản nháp và bạn sẽ phải Gửi duyệt lại. Bạn có chắc chắn muốn tiếp tục không?',
                    onConfirm: executeSave
                  });
                } else {
                  await executeSave();
                }
              }}>{t('profile.save')}</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
  );
};
