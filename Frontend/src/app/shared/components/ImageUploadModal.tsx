import { useState } from 'react';
import { UploadCloud, X } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, Button } from '@voucherhub/ui';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => void;
}

export function ImageUploadModal({ isOpen, onClose, onUpload }: ImageUploadModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'image/jpeg' || file.type === 'image/png') {
        setSelectedFile(file);
      } else {
        toast.error('Chỉ chấp nhận định dạng JPEG và PNG');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'image/jpeg' || file.type === 'image/png') {
        setSelectedFile(file);
      } else {
        toast.error('Chỉ chấp nhận định dạng JPEG và PNG');
      }
    }
  };

  const handleUploadClick = () => {
    if (selectedFile) {
      onUpload(selectedFile);
      setSelectedFile(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tải lên ảnh mới</DialogTitle>
        </DialogHeader>

        <div 
          className={`mt-4 p-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center transition-colors ${
            dragActive ? 'border-primary bg-primary/5' : 'border-gray-300 bg-gray-50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <UploadCloud className="w-12 h-12 text-gray-400 mb-4" />
          
          {selectedFile ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              <button 
                onClick={() => setSelectedFile(null)}
                className="text-xs text-red-500 hover:text-red-700 font-medium"
              >
                Gỡ bỏ
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900">Kéo thả ảnh vào đây</p>
              <p className="text-xs text-gray-500">Hoặc</p>
              <label className="cursor-pointer">
                <span className="text-sm font-medium text-primary hover:underline">Chọn ảnh từ máy tính</span>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/png, image/jpeg, image/jpg" 
                  onChange={handleChange}
                />
              </label>
              <p className="text-xs text-gray-400 mt-2">Hỗ trợ: JPG, PNG. Tối đa 5MB</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={handleUploadClick} disabled={!selectedFile}>
            Tải lên
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
