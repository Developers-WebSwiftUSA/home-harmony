import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authService } from "@/services/auth.service";
import { User, UserRole } from "@/types/models";

type AuthContextType = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: {
    email: string;
    password: string;
    role: UserRole;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }) => Promise<User>;
  logout: () => void;
  updateUser: (user: User) => void;
  /** Refreshes profile from GET /auth/me (e.g. after license activation). */
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem(TOKEN_KEY));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem(USER_KEY);
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const persist = (nextUser: User, nextToken: string) => {
    setUser(nextUser);
    setToken(nextToken);
    localStorage.setItem(TOKEN_KEY, nextToken);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
  };

  const login = async (email: string, password: string) => {
    const response = await authService.login(email, password);
    const nextUser = response.data.user;
    const nextToken = response.data.token;
    persist(nextUser, nextToken);
    return nextUser;
  };

  const register = async (payload: {
    email: string;
    password: string;
    role: UserRole;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }) => {
    const response = await authService.register(payload);
    const nextUser = response.data.user;
    const nextToken = response.data.token;
    persist(nextUser, nextToken);
    return nextUser;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const updateUser = (updatedUser: User, newToken?: string) => {
    setUser(updatedUser);
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    if (newToken) {
      setToken(newToken);
      localStorage.setItem(TOKEN_KEY, newToken);
    }
  };

  const refreshUser = useCallback(async () => {
    const t = localStorage.getItem(TOKEN_KEY);
    if (!t) return;
    const res = await authService.me();
    if (res.data) {
      setUser(res.data);
      localStorage.setItem(USER_KEY, JSON.stringify(res.data));
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isLoading,
      login,
      register,
      logout,
      updateUser,
      refreshUser,
    }),
    [user, token, isLoading, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

