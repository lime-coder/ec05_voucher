import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Ticket, ChevronDown, ChevronUp, QrCode, MessageSquare, Search } from "lucide-react";
import { useLanguage } from "../../shared/contexts/LanguageContext";

interface VoucherCode {
  MaVoucher: number;

  SoMaVoucher: string;

  TrangThaiSuDung: string;

  NgayHetHan?: string;
}

interface VoucherItem {
  MaCTDonHang: number;

  VoucherID: number;

  SoLuongMua: number;

  DonGia: number;

  Voucher: {
    TenVoucher: string;
  };

  MaVouchers: VoucherCode[];
}

export function OrderDetailPage() {
  const { t } = useLanguage();
  const { orderId } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [expandedVouchers, setExpandedVouchers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [qrModal, setQrModal] = useState<{isOpen: boolean, code: string}>({isOpen: false, code: ''});

  const toggleExpand = (id: string) => {
    setExpandedVouchers((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    const fetchOrder =
      async () => {

        try {

          const response =
            await fetch(
              `/api/orders/${orderId}`
            );

          const data =
            await response.json();

          setOrder(data);

        } catch (error) {

          console.error(error);

        } finally {

          setLoading(false);
        }
      };

    fetchOrder();

  }, [orderId]);

  const StatusBadge = ({ status }: { status: "unused" | "used" }) => {
    const styles =
      status === "unused"
        ? "border-primary text-primary bg-primary/10"
        : "border-[#9CA3AF] text-[#9CA3AF] bg-[#9CA3AF]/10";

    return (
      <span className={`px-3 py-1 rounded border text-xs font-semibold uppercase ${styles}`}>
        {status}
      </span>
    );
  };

  const vouchers =
  order?.ChiTietDonHangs || [];

  const filteredVouchers =
    vouchers.filter(
      (v: any) => {

        const voucherName =
          v.Voucher?.TenVoucher || "";

        const voucherCode =
          v.MaVouchers?.[0]
            ?.SoMaVoucher || "";

        return (
          voucherName
            .toLowerCase()
            .includes(
              searchQuery.toLowerCase()
            ) ||

          voucherCode
            .toLowerCase()
            .includes(
              searchQuery.toLowerCase()
            )
        );
      }
    );
    
  if (loading) {
    return (
      <div className="p-10">
        Loading...
      </div>
    );
  }
  return (
    <div className="min-h-screen flex flex-col bg-background">
      
      <main className="flex-1 max-w-[1440px] mx-auto px-6 py-8 w-full">
        {/* Back Link */}
        <Link to="/orders" className="inline-block mb-6 text-primary hover:underline">
          &lt; {t('order.back')}
        </Link>

        {/* Order Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <p className="text-xs text-muted mb-1">{t('order.details')}</p>
            <h1 className="text-4xl font-bold">{t('order.id')} #{orderId || "10023"}</h1>
          </div>
          <div className="text-left md:text-right">
            <p className="text-sm text-muted mb-1">{t('order.purchase_date')}</p>
              <p className="font-bold text-lg">{new Date(order.ThoiGianThanhToan).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Your Vouchers Section */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div className="flex items-center gap-3">
              <h2 className="font-bold text-xl">{t('order.your_vouchers')}</h2>
              <span className="px-3 py-1 border border-border rounded-full text-sm font-semibold">
                {t('order.total_vouchers', { count: vouchers.length })}
              </span>
            </div>
          </div>
          
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('order.search_placeholder')}
              className="w-full pl-10 pr-4 py-2 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>
        </div>

        {/* Voucher Items */}
        <div className="space-y-4 mb-6">
          {filteredVouchers.map((voucher: VoucherItem) => {
            const isExpanded =
              expandedVouchers.includes(
                String(
                  voucher.MaCTDonHang || voucher.MaCTDonHang
                )
              );
            const isGrouped = voucher.SoLuongMua > 1;

            if (isGrouped && voucher.MaVouchers) {
              // Grouped Voucher (Collapsible)
              return (
                <div key={voucher.MaCTDonHang} className="border border-border rounded-lg bg-white overflow-hidden">
                  {/* Parent Row */}
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <Ticket className="w-10 h-10 text-muted" />
                      <div>
                        <Link to={`/voucher/${voucher.VoucherID}`} className="font-bold text-lg text-foreground hover:underline hover:text-primary mb-1 inline-block">
                          {voucher.Voucher.TenVoucher}
                        </Link>
                        <p className="text-sm text-muted">
                          {t('order.total_vouchers', { count: voucher.SoLuongMua })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right mr-4">
                        <p className="text-sm text-muted">{t('order.total_price')}</p>
                        <p className="font-bold text-lg">
                          ${Number(voucher.DonGia || 0).toFixed(2)}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          toggleExpand(
                            String(voucher.MaCTDonHang)
                          )
                        }
                        className="text-primary hover:underline flex items-center gap-1 font-semibold"
                      >
                        {isExpanded ? (
                          <>
                            <span>{t('order.hide_details')}</span>
                            <ChevronUp className="w-4 h-4" />
                          </>
                        ) : (
                          <>
                            <span>{t('order.show_details')}</span>
                            <ChevronDown className="w-4 h-4" />
                          </>
                        )}
                      </button>
                      <span className="px-3 py-1 bg-secondary text-foreground rounded text-base font-bold ml-2">
                        x{voucher.SoLuongMua}
                      </span>
                    </div>
                  </div>

                  {/* Sub Rows (Expanded) */}
                  {isExpanded && (
                    <div className="bg-[#F9FAFB] border-t border-border">
                      {voucher.MaVouchers.map((codeItem, index) => (
                        <div
                          key={index}
                          className="px-8 py-4 flex items-center justify-between border-b border-border last:border-b-0"
                        >
                          <div className="flex-1">
                            <p className="font-mono text-sm text-muted mb-1">
                              {t('order.code_label')}{codeItem.SoMaVoucher}
                            </p>
                            <p className="text-xs text-muted">
                              {t('order.expires')} {codeItem.NgayHetHan || "N/A"}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className="font-semibold">${Number(voucher.DonGia || 0).toFixed(2)}</p>
                            <StatusBadge
                              status={
                                codeItem.TrangThaiSuDung === "USED"
                                  ? "used"
                                  : "unused"
                              }
                            />
                            <button 
                              onClick={() => setQrModal({ isOpen: true, code: codeItem.SoMaVoucher })}
                              className="px-3 py-2 border border-border rounded hover:bg-white transition-colors text-sm font-semibold flex items-center gap-1"
                            >
                              <QrCode className="w-4 h-4" /> {t('order.view_qr')}
                            </button>
                            <button
                              onClick={() => navigate(`/review/${voucher.MaCTDonHang}`)}
                              className="px-3 py-2 border border-border rounded hover:bg-white transition-colors text-sm font-semibold flex items-center gap-1"
                            >
                              <MessageSquare className="w-4 h-4" /> {t('order.review')}
                            </button>
                            <span className="px-3 py-1 ml-2 bg-secondary text-foreground rounded text-base font-bold">x1</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            } else {
              // Single Voucher
              return (
                <div key={voucher.MaCTDonHang} className="border border-border rounded-lg p-4 bg-white">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <Ticket className="w-10 h-10 text-muted-foreground" />
                      <div>
                        <Link to={`/voucher/${voucher.MaCTDonHang}`} className="font-bold text-lg text-foreground hover:underline hover:text-primary mb-1 inline-block">
                          {voucher.Voucher.TenVoucher}
                        </Link>
                        <p className="font-mono text-sm text-muted-foreground">
                          {t('order.code_label')}{voucher.MaVouchers[0]?.SoMaVoucher || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground uppercase">{t('order.unit_price')}</p>
                        <p className="font-semibold">
                          ${Number(voucher.DonGia || 0 ).toFixed(2)}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-muted-foreground uppercase">
                          {t('order.expiration_date')}
                        </p>
                        <p className="font-semibold">{voucher.MaVouchers[0]?.NgayHetHan || 'N/A'}</p>
                      </div>

                      <StatusBadge status={voucher.MaVouchers?.[0]
                                            ?.TrangThaiSuDung === "USED"
                                            ? "used"
                                            : "unused"} />

                      <div className="flex gap-2">
                        <button 
                          onClick={() => setQrModal({ isOpen: true, code:voucher.MaVouchers?.[0]?.SoMaVoucher || '' })}
                          className="px-3 py-2 border border-border rounded hover:bg-secondary transition-colors text-sm font-semibold flex items-center gap-1"
                        >
                          <QrCode className="w-4 h-4" /> {t('order.view_qr')}
                        </button>
                        <button
                          onClick={() => navigate(`/review/${voucher.MaCTDonHang}`)}
                          className="px-3 py-2 border border-border rounded hover:bg-secondary transition-colors text-sm font-semibold flex items-center gap-1"
                        >
                          <MessageSquare className="w-4 h-4" /> {t('order.review')}
                        </button>
                      </div>

                      <span className="px-3 py-1 ml-2 bg-secondary text-foreground rounded text-base font-bold">
                        x{voucher.SoLuongMua}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }
          })}
        </div>

        {/* How to Use Box */}
        <div className="border border-border rounded-lg p-6 bg-white">
          <h3 className="font-bold mb-4">{t('order.how_to_use')}</h3>
          <ul className="space-y-3 text-sm text-muted">
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>
                {t('order.step1')}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>
                {t('order.step2')}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>
                {t('order.step3')}
              </span>
            </li>
          </ul>
        </div>

        {/* QR Code Modal */}
        {qrModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 animate-in fade-in zoom-in duration-200 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-xl">{t('order.qr_title', { code: qrModal.code })}</h3>
                <button onClick={() => setQrModal({isOpen: false, code: ''})} className="text-muted-foreground hover:text-foreground">✕</button>
              </div>
              <div className="aspect-square bg-secondary rounded-xl flex items-center justify-center mb-6 border-2 border-dashed border-border">
                <QrCode className="w-32 h-32 text-muted-foreground" />
              </div>
              <p className="text-center text-muted-foreground mb-6">
                {t('order.qr_desc')}
              </p>
              <button 
                onClick={() => setQrModal({isOpen: false, code: ''})}
                className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-colors"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        )}
      </main>

          </div>
  );
}
