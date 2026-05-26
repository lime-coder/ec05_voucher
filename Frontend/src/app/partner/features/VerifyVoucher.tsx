import { useState } from 'react';
import {
  QrCode,
  CheckCircle,
  XCircle,
  Search,
  History,
  AlertCircle,
} from 'lucide-react';
import { recentVerifications, voucherCodeLookup } from '../data/mockData';
import type { VoucherCode } from '../types/domain';
import { useLanguage } from '../../shared/contexts/LanguageContext';

import {
  Button,
  Input,
  Badge,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@voucherhub/ui';

export default function VerifyVoucher() {
  const { t } = useLanguage();
  const [voucherCode, setVoucherCode] = useState('');
  const [verificationResult, setVerificationResult] = useState<VoucherCode | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  const handleVerify = () => {
    setIsVerifying(true);

    setTimeout(() => {
      const cleanCode = voucherCode.trim();
      const knownVoucher = voucherCodeLookup[cleanCode];
      if (knownVoucher) {
        setVerificationResult(knownVoucher);
      } else {
        setVerificationResult({
          code: cleanCode,
          voucherName: '',
          customerName: '',
          customerPhone: '',
          originalPrice: 0,
          salePrice: 0,
          purchaseDate: '',
          validUntil: '',
          status: 'invalid',
        });
      }
      setIsVerifying(false);
    }, 1000);
  };

  const handleConfirmUse = () => {
    alert(t('verify.confirm_use') + '!');
    setVerificationResult(null);
    setVoucherCode('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">{t('verify.title')}</h1>
        <p className="text-gray-500">{t('verify.desc')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="text-center mb-8">
              <QrCode className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">{t('verify.scan_prompt')}</h2>
              <p className="text-gray-500">{t('verify.scan_desc')}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Input
                className="flex-1 text-lg py-6"
                placeholder={t('verify.input_placeholder')}
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
              />
              <Button
                size="lg"
                onClick={handleVerify}
                disabled={!voucherCode || isVerifying}
                className="gap-2 sm:w-auto w-full py-6"
              >
                <Search className="w-5 h-5" />
                {t('verify.check')}
              </Button>
            </div>

            <div className="text-center">
              <Button variant="outline" className="gap-2" onClick={() => setQrModalOpen(true)}>
                <QrCode className="w-4 h-4" />
                {t('verify.scan_qr')}
              </Button>
            </div>

            {verificationResult && (
              <div className="mt-8 pt-8 border-t border-gray-100">
                {verificationResult.status === 'invalid' ? (
                  <div className="bg-red-50 text-red-800 rounded-lg p-4 flex items-start gap-3">
                    <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold mb-1">{t('verify.invalid.title')}</h3>
                      <p className="text-sm">{t('verify.invalid.desc', { code: verificationResult.code })}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {verificationResult.status === 'used' ? (
                      <div className="bg-yellow-50 text-yellow-800 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-bold mb-1">{t('verify.used.title')}</h3>
                          <p className="text-sm">{t('verify.used.desc', { date: verificationResult.usedDate || '' })}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-green-50 text-green-800 rounded-lg p-4 flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <h3 className="font-bold">{t('verify.valid.title')}</h3>
                      </div>
                    )}

                    <div className="border-2 border-green-500 rounded-xl p-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="sm:col-span-2">
                          <p className="text-sm text-gray-500 mb-1">{t('verify.voucher_name')}</p>
                          <p className="text-lg font-bold">{verificationResult.voucherName}</p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500 mb-1">{t('verify.customer')}</p>
                          <p className="font-semibold">{verificationResult.customerName}</p>
                          <p className="text-sm text-gray-500">{verificationResult.customerPhone}</p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500 mb-1">{t('verify.code')}</p>
                          <p className="font-semibold">{verificationResult.code}</p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500 mb-1">{t('verify.value')}</p>
                          <p className="text-sm line-through text-gray-400">
                            {verificationResult.originalPrice.toLocaleString('vi-VN')}₫
                          </p>
                          <p className="text-lg font-bold text-red-500">
                            {verificationResult.salePrice.toLocaleString('vi-VN')}₫
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500 mb-1">{t('verify.expiry')}</p>
                          <p className="font-medium">{verificationResult.validUntil}</p>
                        </div>

                        <div className="sm:col-span-2">
                          <p className="text-sm text-gray-500 mb-1">{t('verify.branch')}</p>
                          <p className="font-medium">{verificationResult.branch}</p>
                        </div>
                      </div>
                    </div>

                    {verificationResult.status !== 'used' && (
                      <Button
                        size="lg"
                        className="w-full bg-green-500 hover:bg-green-600 text-white gap-2 h-14 text-lg"
                        onClick={handleConfirmUse}
                      >
                        <CheckCircle className="w-6 h-6" />
                        {t('verify.confirm_use')}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
              <History className="w-5 h-5 text-gray-400" />
              {t('verify.history.title')}
            </h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('verify.history.code')}</TableHead>
                  <TableHead>{t('verify.history.name')}</TableHead>
                  <TableHead>{t('verify.history.time')}</TableHead>
                  <TableHead>{t('verify.history.branch')}</TableHead>
                  <TableHead>{t('verify.history.result')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentVerifications.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-semibold">{item.code}</TableCell>
                    <TableCell>{item.voucherName}</TableCell>
                    <TableCell className="text-gray-500">{item.time}</TableCell>
                    <TableCell>{item.branch || '-'}</TableCell>
                    <TableCell>
                      <Badge
                        variant={item.status === 'verified' ? 'default' : 'destructive'}
                        className={item.status === 'verified' ? 'bg-green-100 text-green-700 hover:bg-green-100 shadow-none' : 'bg-red-100 text-red-700 hover:bg-red-100 shadow-none'}
                      >
                        {item.status === 'verified' ? t('verify.history.verified') : t('verify.history.rejected')}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold mb-6">{t('verify.guide.title')}</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-bold mb-1">{t('verify.guide.step1')}</h3>
                <p className="text-sm text-gray-500">{t('verify.guide.step1.desc')}</p>
              </div>
              <div>
                <h3 className="font-bold mb-1">{t('verify.guide.step2')}</h3>
                <p className="text-sm text-gray-500">{t('verify.guide.step2.desc')}</p>
              </div>
              <div>
                <h3 className="font-bold mb-1">{t('verify.guide.step3')}</h3>
                <p className="text-sm text-gray-500">{t('verify.guide.step3.desc')}</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-4 text-sm">
            <strong>Lưu ý:</strong> {t('verify.note')}
          </div>

          <div className="bg-gray-50 rounded-xl border border-gray-100 p-6">
            <h3 className="font-bold mb-4">{t('verify.test_samples')}</h3>
            <div className="flex flex-col gap-2">
              <Badge variant="outline" className="w-fit">VC001-ABC123 ({t('verify.test.valid')})</Badge>
              <Badge variant="outline" className="w-fit">VC002-USED ({t('verify.test.used')})</Badge>
            </div>
          </div>
        </div>
      </div>

      {qrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 animate-in fade-in zoom-in duration-200 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl">{t('verify.qr_scanner')}</h3>
              <button onClick={() => setQrModalOpen(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            <div className="aspect-square bg-slate-900 rounded-xl flex flex-col items-center justify-center mb-6 border-2 border-border relative overflow-hidden">
              <div className="absolute inset-0 border-4 border-primary/50 m-8 rounded-xl opacity-50"></div>
              <div className="w-full h-1 bg-primary/80 absolute top-1/2 left-0 animate-pulse shadow-[0_0_15px_rgba(var(--primary),0.8)]"></div>
              <p className="text-white/70 text-sm mt-32 z-10">{t('verify.camera_scanning')}</p>
            </div>
            <p className="text-center text-muted-foreground mb-6">
              {t('verify.camera_desc')}
            </p>
            <button 
              onClick={() => setQrModalOpen(false)}
              className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-colors"
            >
              {t('common.cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
