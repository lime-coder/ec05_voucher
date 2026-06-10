import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import api from "../../lib/api";
import { useCartStore } from "../../store/useCartStore";

type Role = "admin" | "partner" | "customer" | null;

interface User {
  IDTaiKhoan: string;
  role: Role;
  TenDangNhap: string;
  Email: string;
  HoTenNguoiDung: string;
  MaDoiTac?: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        try {
          const response = await api.get('/auth/me');
          const userData = response.data.user;
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));

          if (userData.role === 'partner' && userData.MaDoiTac) {
            localStorage.setItem('partnerId', String(userData.MaDoiTac));
          }

          if (userData.role === 'customer') {
            useCartStore.getState().syncCartWithServer();
          }
        } catch (error) {
          console.error("Token verification failed:", error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('partnerId');
          setUser(null);
        }
      }
      setLoading(false);
    };
    verifyToken();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { TenDangNhap: username, MatKhau: password });
      const { token, user: userData } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      if (userData.role === 'partner' && userData.MaDoiTac) {
        localStorage.setItem('partnerId', String(userData.MaDoiTac));
      }

      setUser(userData);

      if (userData.role === 'customer') {
        useCartStore.getState().syncCartWithServer();
      }

      return { success: true, user: userData };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('partnerId');
    setUser(null);
    useCartStore.getState().clearCart();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

