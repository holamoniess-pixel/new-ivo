import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { userApi, sellerApi } from "@/lib/api";

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  phoneNumber?: string;
  location?: string;
  bio?: string;
  storeName?: string;
  profilePic?: { imageUrl: string };
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSeller: boolean;
  login: (email: string, password: string, asSeller?: boolean) => Promise<void>;
  register: (formData: FormData, asSeller?: boolean) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Derived from user state — reactive, not a stale localStorage read
  const isSeller = user?.role === "SELLER";

  const refreshProfile = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    const role = localStorage.getItem("userRole");

    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    const seller = role === "SELLER";

    try {
      const profile = seller
        ? await sellerApi.getProfile()
        : await userApi.getProfile();
      setUser(profile);
    } catch {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userRole");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const login = async (
    email: string,
    password: string,
    asSeller = false
  ) => {
    const res = asSeller
      ? await sellerApi.login({ email, password })
      : await userApi.login({ email, password });

    localStorage.setItem("accessToken", res.accessToken);
    localStorage.setItem("refreshToken", res.refreshToken);
    localStorage.setItem("userRole", res.role);
    await refreshProfile();
  };

  const register = async (formData: FormData, asSeller = false) => {
    asSeller
      ? await sellerApi.register(formData)
      : await userApi.register(formData);
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userRole");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isSeller,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    return {
      user: null,
      isLoading: true,
      isAuthenticated: false,
      isSeller: false,
      login: async () => {},
      register: async () => {},
      logout: () => {},
      refreshProfile: async () => {},
    } as AuthContextType;
  }
  return ctx;
};