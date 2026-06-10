import React from 'react';
import { Search } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Input } from '@voucherhub/ui';
import { useLanguage } from '../../../../shared/contexts/LanguageContext';

export const ArticleModal = ({
  showArticleModal,
  setShowArticleModal,
  currentArticle,
  articleForm,
  setArticleForm,
  handleSaveArticle
}: any) => {
  const { language } = useLanguage();
  const tText = (en: string, vi: string) => (language === 'vi' ? vi : en);

  return (
    <>
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
                onChange={(e: any) => setArticleForm((prev: any) => ({ ...prev, TieuDe: e.target.value }))}
                placeholder={tText("Enter title...", "Nhập tiêu đề...")}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{tText('Author', 'Tác giả')}</label>
              <Input
                value={articleForm.TacGia}
                onChange={(e: any) => setArticleForm((prev: any) => ({ ...prev, TacGia: e.target.value }))}
                placeholder="e.g. Admin"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{tText('Article Content', 'Nội dung bài viết')}</label>
              <textarea
                value={articleForm.NoiDung}
                onChange={(e: any) => setArticleForm((prev: any) => ({ ...prev, NoiDung: e.target.value }))}
                placeholder={tText("Enter detailed content here...", "Nhập nội dung chi tiết bài viết...")}
                className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-y text-sm"
                rows={6}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{tText('Status', 'Trạng thái')}</label>
              <select
                value={articleForm.TrangThai}
                onChange={(e: any) => setArticleForm((prev: any) => ({ ...prev, TrangThai: e.target.value }))}
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
    </>
  );
};
