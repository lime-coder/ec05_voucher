import React from 'react';
import { Search } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Input } from '@voucherhub/ui';
import { useLanguage } from '../../../../shared/contexts/LanguageContext';

export const FaqModal = ({
  showFaqModal,
  setShowFaqModal,
  currentFaq,
  faqForm,
  setFaqForm,
  handleSaveFaq
}: any) => {
  const { language } = useLanguage();
  const tText = (en: string, vi: string) => (language === 'vi' ? vi : en);

  return (
    <>
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
                onChange={(e: any) => setFaqForm((prev: any) => ({ ...prev, CauHoi: e.target.value }))}
                placeholder={tText("e.g. How to buy a voucher?", "VD: Làm thế nào để mua voucher?")}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{tText('Answer *', 'Trả lời *')}</label>
              <textarea
                value={faqForm.TraLoi}
                onChange={(e: any) => setFaqForm((prev: any) => ({ ...prev, TraLoi: e.target.value }))}
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
                  onChange={(e: any) => setFaqForm((prev: any) => ({ ...prev, DanhMucFAQ: e.target.value }))}
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
                  onChange={(e: any) => setFaqForm((prev: any) => ({ ...prev, ThuTu: Number(e.target.value) }))}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{tText('Status', 'Trạng thái')}</label>
              <select
                value={faqForm.TrangThai}
                onChange={(e: any) => setFaqForm((prev: any) => ({ ...prev, TrangThai: e.target.value }))}
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
    </>
  );
};
