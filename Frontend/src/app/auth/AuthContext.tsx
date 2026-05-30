import React, { createContext, useContext, useState, ReactNode } from "react";
import { useNavigate } from "react-router";

type Role = "admin" | "partner" | "customer" | null;

interface User {
  id: string;
  role: Role;
  name: string;
  username?: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (username: string, password: string) => {
    // Mock login logic based on user prompt
    if (password === "123456") {
      if (username === "admin") {
        setUser({ id: "1", role: "admin", name: "System Admin" });
        return true;
      }
      if (username === "partner") {
        setUser({ id: "2", role: "partner", name: "Partner Store" });
        return true;
      }
      if (username === "customer") {
        setUser({ id: "3", role: "customer", name: "John Customer" });
        return true;
      }
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
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
