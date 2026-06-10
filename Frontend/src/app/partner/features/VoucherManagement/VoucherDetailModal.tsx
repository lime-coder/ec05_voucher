import React from 'react';
import { Eye } from 'lucide-react';
import { Badge, Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@voucherhub/ui';
import type { PartnerVoucher as Voucher } from '@voucherhub/types';
import { useLanguage } from '../../../shared/contexts/LanguageContext';

export const VoucherDetailModal = ({
  detailDialogOpen,
  setDetailDialogOpen,
  selectedVoucher,
  setPreviewImage,
  statusTranslations
}: any) => {
  const { t, language } = useLanguage();

  return (
    <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-[750px] p-0 overflow-hidden bg-white rounded-2xl">
          <DialogHeader className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-500" />
              {t('partner.vouchers.details_title')}
            </DialogTitle>
          </DialogHeader>
          {selectedVoucher && (
            <div className="max-h-[75vh] overflow-y-auto custom-scrollbar">
              {/* Header section with image and key info */}
              <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50/30 border-b border-gray-100">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Image Gallery */}
                  <div className="w-full md:w-1/3 shrink-0">
                    <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-white shadow-sm border border-white flex items-center justify-center relative group">
                      {selectedVoucher.imageUrl ? (
                        <div className="flex flex-col h-full w-full overflow-y-auto snap-y custom-scrollbar">
                          {selectedVoucher.imageUrl.split(',').map((url: string, i: number) => {
                            const fullUrl = url.startsWith('http') ? url : `http://localhost:5000${url}`;
                            return (
                              <div key={i} className="relative w-full h-full shrink-0 snap-center">
                                <img src={fullUrl} alt="Voucher" className="w-full h-full object-cover cursor-pointer transition-transform duration-500 group-hover:scale-105" onClick={() => setPreviewImage(fullUrl)} />
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center justify-center">
                                  <Eye className="text-white w-8 h-8 drop-shadow-md" />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                            <Eye className="w-5 h-5 text-gray-300" />
                          </div>
                          <span className="text-sm font-medium">{t('partner.vouchers.no_image') || 'Chưa có ảnh'}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Key Info */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <h3 className="text-2xl font-bold text-gray-900 leading-tight">{selectedVoucher.name}</h3>
                        <Badge
                          className={`shrink-0 px-3 py-1 text-sm font-medium rounded-full shadow-sm ${selectedVoucher.status === 'active'
                            ? 'bg-green-100 text-green-700 hover:bg-green-100 border-green-200'
                            : selectedVoucher.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200'
                              : ['deleted', 'rejected', 'expired'].includes(selectedVoucher.status as string)
                                ? 'bg-red-100 text-red-700 hover:bg-red-100 border-red-200'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-100 border-gray-200'
                            }`}
                        >
                          {language === 'en' ? (selectedVoucher.status === 'active' ? 'Active' : selectedVoucher.status === 'pending' ? 'Pending' : 'Paused') : (statusTranslations[selectedVoucher.status] || selectedVoucher.status)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                        <span className="bg-white/60 px-2 py-1 rounded-md border border-gray-200/60 font-mono text-xs">{selectedVoucher.id}</span>
                        <span>•</span>
                        <div className="flex flex-wrap gap-1">
                          {selectedVoucher.categories.map((cat: string) => (
                            <Badge key={cat} variant="secondary" className="bg-white/60 hover:bg-white text-gray-600 font-normal shadow-none border-gray-200/60">
                              {cat}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 bg-white/60 p-4 rounded-xl border border-gray-100 backdrop-blur-sm">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{t('partner.vouchers.sale_price_label')}</p>
                        <p className="text-2xl font-bold text-red-600">{selectedVoucher.salePrice.toLocaleString('vi-VN')}₫</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{t('partner.vouchers.original_price_label')}</p>
                        <p className="text-lg font-semibold text-gray-400 line-through decoration-gray-300">{selectedVoucher.originalPrice.toLocaleString('vi-VN')}₫</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Details Sections */}
              <div className="p-6 space-y-8">
                {/* Metrics & Dates Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{t('partner.vouchers.sold_total_label')}</p>
                    <div className="flex items-end gap-2">
                      <p className="text-xl font-bold text-gray-900">{selectedVoucher.sold}</p>
                      <p className="text-sm text-gray-500 mb-1">/ {selectedVoucher.quantity}</p>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full mt-3 overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full transition-all duration-500 group-hover:bg-blue-600" style={{ width: `${(selectedVoucher.sold / selectedVoucher.quantity) * 100}%` }} />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow sm:col-span-3 flex flex-col justify-center gap-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{t('partner.create.sale_start_label') || 'Thời gian bán'}</p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-50 rounded-lg py-2 px-3 border border-gray-100 text-center">
                          <span className="text-sm font-medium text-gray-800">{selectedVoucher.saleStartDateRaw ? new Date(selectedVoucher.saleStartDateRaw).toLocaleDateString('vi-VN') : 'N/A'}</span>
                        </div>
                        <span className="text-gray-400 font-medium">→</span>
                        <div className="flex-1 bg-gray-50 rounded-lg py-2 px-3 border border-gray-100 text-center">
                          <span className="text-sm font-medium text-gray-800">{selectedVoucher.saleEndDateRaw ? new Date(selectedVoucher.saleEndDateRaw).toLocaleDateString('vi-VN') : 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{t('partner.create.valid_start_label') || 'Thời gian sử dụng'}</p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-50 rounded-lg py-2 px-3 border border-gray-100 text-center">
                          <span className="text-sm font-medium text-gray-800">{selectedVoucher.validFrom}</span>
                        </div>
                        <span className="text-gray-400 font-medium">→</span>
                        <div className="flex-1 bg-gray-50 rounded-lg py-2 px-3 border border-gray-100 text-center">
                          <span className="text-sm font-medium text-gray-800">{selectedVoucher.validTo}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Text Content Sections */}
                <div className="space-y-6">
                  {/* Row 1: Description & Terms */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <section className="h-full flex flex-col">
                      <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-4 bg-blue-500 rounded-full"></span>
                        {t('partner.vouchers.description_label') || 'Mô tả'}
                      </h4>
                      <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-100 shadow-inner flex-1">
                        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{selectedVoucher.description || t('partner.vouchers.not_updated') || 'Chưa cập nhật'}</p>
                      </div>
                    </section>
                    <section className="h-full flex flex-col">
                      <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-4 bg-orange-500 rounded-full"></span>
                        {t('partner.vouchers.terms_label') || 'Điều kiện áp dụng'}
                      </h4>
                      <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-100 shadow-inner flex-1">
                        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{selectedVoucher.terms || t('partner.vouchers.not_updated') || 'Chưa cập nhật'}</p>
                      </div>
                    </section>
                  </div>

                  {/* Row 2: Usage Guide & Refund Policy */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <section className="h-full flex flex-col">
                      <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-4 bg-purple-500 rounded-full"></span>
                        {t('partner.create.guide_label') || 'Hướng dẫn sử dụng'}
                      </h4>
                      <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-100 shadow-inner flex-1">
                        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{selectedVoucher.usageInstructions || t('partner.vouchers.not_updated') || 'Chưa cập nhật'}</p>
                      </div>
                    </section>
                    <section className="h-full flex flex-col">
                      <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-4 bg-green-500 rounded-full"></span>
                        {t('partner.create.refund_policy_label') || 'Chính sách hoàn tiền'}
                      </h4>
                      <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-100 shadow-inner flex-1">
                        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{selectedVoucher.refundPolicy || t('partner.vouchers.not_updated') || 'Chưa cập nhật'}</p>
                      </div>
                    </section>
                  </div>
                </div>

                {/* Branches */}
                {selectedVoucher.branches && selectedVoucher.branches.length > 0 && (
                  <section>
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <span className="w-1.5 h-4 bg-teal-500 rounded-full"></span>
                      {t('partner.vouchers.branches_label') || 'Chi nhánh'}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedVoucher.branches.map((branch: string) => (
                        <div key={branch} className="px-3 py-1.5 bg-teal-50 text-teal-700 text-sm font-medium rounded-lg border border-teal-100 flex items-center gap-1.5 shadow-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
                          {branch}
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </div>
          )}
          <DialogFooter className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 sm:justify-between items-center">
            <p className="text-xs text-gray-400 hidden sm:block">ID: {selectedVoucher?.id}</p>
            <Button variant="outline" className="px-6 rounded-full hover:bg-gray-100 font-medium border-gray-200" onClick={() => setDetailDialogOpen(false)}>{t('partner.vouchers.close')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  );
};
