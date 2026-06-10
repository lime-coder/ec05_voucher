import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Button } from '@voucherhub/ui';
import { useLanguage } from '../contexts/LanguageContext';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
}

export function ConfirmModal({ isOpen, onClose, onConfirm, title, description }: ConfirmModalProps) {
  const { t } = useLanguage();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <DialogDescription className="text-sm text-gray-600">
            {description}
          </DialogDescription>
        </div>
        <DialogFooter className="flex space-x-3 justify-end sm:justify-end">
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel') || 'Hủy'}
          </Button>
          <Button onClick={() => { onConfirm(); onClose(); }}>
            {t('common.confirm') || 'Đồng ý'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
