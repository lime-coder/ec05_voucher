import React from 'react';
import { Search } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Input } from '@voucherhub/ui';
import { useLanguage } from '../../../../shared/contexts/LanguageContext';

export const CategoryModal = ({
  showCategoryModal,
  setShowCategoryModal,
  currentCategory,
  categoryForm,
  setCategoryForm,
  handleSaveCategory,
  iconSearch,
  setIconSearch,
  PRESET_ICONS
}: any) => {
  const { language } = useLanguage();
  const tText = (en: string, vi: string) => (language === 'vi' ? vi : en);

  return (
    <>
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
                onChange={(e: any) => setCategoryForm((prev: any) => ({ ...prev, TenDanhMuc: e.target.value }))}
                placeholder={tText("e.g. Food & Dining, Entertainment...", "VD: Ăn uống, Giải trí...")}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{tText('Category Description', 'Mô tả danh mục')}</label>
              <textarea
                value={categoryForm.MoTa}
                onChange={(e: any) => setCategoryForm((prev: any) => ({ ...prev, MoTa: e.target.value }))}
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
                {PRESET_ICONS.map((iconName: string) => {
                  const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Tag;
                  const isSelected = categoryForm.Icon === iconName;
                  return (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setCategoryForm((prev: any) => ({ ...prev, Icon: iconName }))}
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

      </>
  );
};
