import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type CartVoucherItem } from "../data/mock/vouchers";
import api from "../lib/api";

interface CartState {
  items: CartVoucherItem[];
  addItem: (item: CartVoucherItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  syncCartWithServer: () => Promise<void>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        });

        // Background sync
        const token = localStorage.getItem('token');
        if (token) {
          api.post('/cart/items', { voucherId: parseInt(item.id, 10), quantity: item.quantity }).catch(console.error);
        }
      },
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }));

        // Background sync
        const token = localStorage.getItem('token');
        if (token) {
          api.delete(`/cart/items/${id}`).catch(console.error);
        }
      },
      updateQuantity: (id, quantity) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity } : i
          ),
        }));

        // Background sync
        const token = localStorage.getItem('token');
        if (token) {
          api.put(`/cart/items/${id}`, { quantity }).catch(console.error);
        }
      },
      clearCart: () => {
        set({ items: [] });

        // Background sync
        const token = localStorage.getItem('token');
        if (token) {
          api.delete('/cart').catch(console.error);
        }
      },
      getCartTotal: () => {
        const { items } = get();
        return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },
      syncCartWithServer: async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
          const { items } = get();
          
          // Format local items for the sync payload
          const formattedItems = items.map(i => ({ voucherId: parseInt(i.id, 10), quantity: i.quantity }));
          
          // Request backend to sync and merge
          const res = await api.post('/cart/sync', { items: formattedItems });
          
          if (res.data && res.data.ChiTiet) {
            // Map the server items back to local Zustand store
            const serverItems: CartVoucherItem[] = res.data.ChiTiet.map((ct: any) => ({
              id: ct.VoucherID.toString(),
              partnerId: ct.Voucher.MaDoiTac?.toString() || '1',
              name: ct.Voucher.TenVoucher,
              price: Number(ct.Voucher.GiaBan),
              originalPrice: Number(ct.Voucher.GiaGoc),
              discount: Math.round(((Number(ct.Voucher.GiaGoc) - Number(ct.Voucher.GiaBan)) / Number(ct.Voucher.GiaGoc)) * 100) || 0,
              image: ct.Voucher.ImageUrl || "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=1000",
              quantity: ct.SoLuong
            }));
            
            set({ items: serverItems });
          }
        } catch (error) {
          console.error("Lỗi đồng bộ giỏ hàng:", error);
        }
      }
    }),
    {
      name: "voucherhub-cart",
    }
  )
);
