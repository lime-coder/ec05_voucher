  import { useEffect, useState } from "react";
  import { useNavigate } from "react-router";
  import { Search, ChevronDown } from "lucide-react";
  import { Button, Input, Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@voucherhub/ui";
  import { useLanguage } from "../../shared/contexts/LanguageContext";
  import { useAuth } from "../../auth/AuthContext";
  import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

interface VoucherItem {
  voucherId: number;
  orderDetailId: number;
  name: string;
}

interface Order {
  id: string;
  orderId: string;
  paymentTime: string;
  vouchers: VoucherItem[];
  total: number;
}

  export function OrderHistoryPage() {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState("");
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [openSort, setOpenSort] = useState(false);
    const [sortBy, setSortBy] = useState("newest");
    const [ sortedOrders, setSortedOrders ] = useState<Order[]>( [] );
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 7;
    
    const [orders, setOrders] =
    useState<Order[]>([]);

    const [loading, setLoading] =
    useState(true);

    const { user } = useAuth();
    // Keep internal state as keys for sortBy
    const sortOptions = [
      { key: "newest", label: t('orders.sort.newest') },
      { key: "oldest", label: t('orders.sort.oldest') },
      { key: "highest", label: t('orders.sort.highest_price') },
      { key: "lowest", label: t('orders.sort.lowest_price') }
    ];

    useEffect(() => {

      const fetchOrders =
        async () => {

          try {

            const response =
              await fetch(
                `/api/orders/customer/${user?.IDTaiKhoan || 1}`
              );

            const data =
              await response.json();

            if (response.ok) {

              const formatted =
                (Array.isArray(data)
                  ? data
                  : []
                ).map((order: any) => ({

                  id:
                    String(order.MaDonHang),

                  orderId:
                    `#ORD-${order.MaDonHang}`,

                  paymentTime:
                    new Date(
                      order.ThoiGianThanhToan
                    ).toLocaleString(),

                  vouchers:
                    (
                      order.ChiTietDonHangs || []
                    ).map(
                      (detail: any) => ({
                        voucherId:
                          detail.Voucher?.VoucherID,

                        orderDetailId:
                          detail.MaCTDonHang,

                        name:
                          detail.Voucher?.TenVoucher || "Voucher",
                      })
                    ),

                  total:
                    Number(order.TongTien),
                }));

              setOrders(
                formatted
              );
            }

          } catch (error) {

            console.error(error);
          } finally {

            setLoading(false);
          }
        };

      fetchOrders();

    }, [user]);

    const filteredOrders = sortedOrders.filter((o) => {
      const orderId = o.orderId || "";
      const vouchers = o.vouchers || [];
      const matchesSearch =
        orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vouchers.some((v) => String(v.name).toLowerCase().includes(searchQuery.toLowerCase()));

      let matchesDate = true;
      if (startDate && endDate) {
        // Parse dd/MM/yyyy HH:mm:ss string to Date object for accurate comparison
        const timeParts = o.paymentTime.split(" ");
        let orderDate = new Date(o.paymentTime);
        if (timeParts.length === 2) {
            // Assume format like "14:30:00 12/05/2026"
            const dateParts = timeParts[1]?.split("/") || timeParts[0]?.split("/");
            if (dateParts.length === 3) {
                const day = parseInt(dateParts[0], 10);
                const month = parseInt(dateParts[1], 10) - 1;
                const year = parseInt(dateParts[2], 10);
                orderDate = new Date(year, month, day);
            }
        }
        
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (orderDate < start || orderDate > end) matchesDate = false;
      }

      return matchesSearch && matchesDate;
    });

    useEffect(() => {
      setCurrentPage(1);
    }, [searchQuery, startDate, endDate, sortBy]);

    const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
    const paginatedOrders = filteredOrders.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );

    
    useEffect(() => {

      let temp = [...orders];

      // =====================
      // Sort newest
      // =====================
      if (
        sortBy === "newest"
      ) {

        temp.sort(
          (a, b) =>
            new Date(
              b.paymentTime
            ).getTime() -
            new Date(
              a.paymentTime
            ).getTime()
        );
      }

      // =====================
      // Sort oldest
      // =====================
      if (
        sortBy === "oldest"
      ) {

        temp.sort(
          (a, b) =>
            new Date(
              a.paymentTime
            ).getTime() -
            new Date(
              b.paymentTime
            ).getTime()
        );
      }

      // =====================
      // Sort highest
      // =====================
      if (
        sortBy === "highest"
      ) {

        temp.sort(
          (a, b) =>
            b.total - a.total
        );
      }

      // =====================
      // Sort lowest
      // =====================
      if (
        sortBy === "lowest"
      ) {

        temp.sort(
          (a, b) =>
            a.total - b.total
        );
      }

      setSortedOrders(
        temp
      );

    }, [sortBy, orders]);

    if (loading) {

      return (
        <div className="min-h-screen flex items-center justify-center">
          <p>Loading orders...</p>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex flex-col bg-background">
        
        <main className="flex-1 max-w-[1440px] mx-auto px-6 py-8 w-full">
          {/* Page Title */}
          <h1 className="text-4xl font-bold mb-2">{t('orders.title')}</h1>
          <p className="text-muted-foreground mb-8">
            {t('orders.desc')}
          </p>

          {/* Recent Transactions Section */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <div>
                <h2 className="font-bold text-lg mb-1">{t('orders.recent_transactions')}</h2>
                <p className="text-sm italic text-muted-foreground">
                  {t('orders.showing_recent')}
                </p>
              </div>
              <div className="flex items-center gap-2 relative">
                <button 
                  onClick={() => setOpenSort(!openSort)}
                  onBlur={() => setTimeout(() => setOpenSort(false), 200)}
                  className="flex items-center gap-2 px-4 py-2 border border-border rounded-md hover:bg-secondary transition-colors bg-white font-semibold"
                >
                  <span className="text-sm">{sortBy === 'Newest' ? t('orders.sort.newest') : sortOptions.find(o => o.key === sortBy)?.label || sortBy}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {openSort && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-border overflow-hidden z-50 py-1">
                    {sortOptions.map((option) => (
                      <button
                        key={option.key}
                        onClick={() => setSortBy(option.key)}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-primary/5 font-medium transition-colors"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Search and Date Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('orders.search_placeholder')}
                  className="pl-10 bg-input-background"
                />
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-auto bg-white shadow-sm border-gray-200 text-sm"
                />
                <span className="text-gray-400 text-sm">-</span>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-auto bg-white shadow-sm border-gray-200 text-sm"
                />
                {(startDate || endDate) && (
                  <Button
                    variant="ghost"
                    onClick={() => { setStartDate(''); setEndDate(''); }}
                    className="text-xs text-gray-500 hover:text-gray-700 px-2 h-10 border border-gray-200 bg-white"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto mb-6 bg-white border border-border rounded-lg">
            <Table>
              <TableHeader className="bg-primary/5 border-b border-border">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs font-semibold uppercase text-muted-foreground">
                    {t('orders.col.order_id')}
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase text-muted-foreground">
                    {t('orders.col.payment_time')}
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase text-muted-foreground">
                    {t('orders.col.vouchers')}
                  </TableHead>
                  <TableHead className="text-right text-xs font-semibold uppercase text-muted-foreground">
                    {t('orders.col.total')}
                  </TableHead>
                  <TableHead className="text-center text-xs font-semibold uppercase text-muted-foreground">
                    {t('orders.col.action')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-primary/5 transition-colors">
                    <TableCell>
                      <span className="font-mono font-bold">{order.orderId}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">{order.paymentTime}</span>
                    </TableCell>
                    <TableCell>
                      {(order.vouchers || []).length === 1 ? (
                        <span className="text-sm font-semibold px-4 py-1.5 bg-secondary border border-transparent rounded-full inline-block">
                          {(order.vouchers || [])[0]?.name}
                        </span>
                      ) : (
                        <DropdownMenu.Root>
                          <DropdownMenu.Trigger asChild>
                            <button
                              className="w-[180px] flex items-center justify-between bg-secondary rounded-full px-4 py-1.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary cursor-pointer border border-transparent hover:border-primary hover:bg-white focus:bg-white transition-colors"
                            >
                              <span>{t('orders.vouchers_included').replace('{count}', String((order.vouchers || []).length))}</span>
                              <ChevronDown className="w-4 h-4 text-foreground ml-2" />
                            </button>
                          </DropdownMenu.Trigger>
                          <DropdownMenu.Portal>
                            <DropdownMenu.Content
                              className="bg-white rounded-xl shadow-lg border border-border overflow-hidden z-[100] py-1 min-w-[180px]"
                              align="start"
                              sideOffset={4}
                            >
                              {(order.vouchers || []).map((v, i) => (
                                <DropdownMenu.Item key={i} className="px-4 py-2 hover:bg-primary/5 text-sm text-left outline-none cursor-pointer">
                                  {v.name}
                                </DropdownMenu.Item>
                              ))}
                            </DropdownMenu.Content>
                          </DropdownMenu.Portal>
                        </DropdownMenu.Root>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {order.total.toLocaleString('vi-VN')} VND
                    </TableCell>
                    <TableCell className="text-center h-full py-4">
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/orders/${order.id}`)}
                        className="font-semibold"
                      >
                        {t('orders.view_details')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-gray-500">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)} of {filteredOrders.length} entries
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="text-sm font-medium">
                  {currentPage} / {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Notice Box */}
          <div className="border border-border rounded-lg p-6 bg-white">
            <h3 className="font-bold mb-2">{t('orders.notice_title')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('orders.notice_desc')}
            </p>
          </div>
        </main>

            </div>
    );
  }
