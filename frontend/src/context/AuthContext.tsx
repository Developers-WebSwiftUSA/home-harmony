import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authService } from "@/services/auth.service";
import { User, UserRole } from "@/types/models";
import { normalizeUser } from "@/lib/userDisplay";
import { clearAuthToken, getAuthToken, setAuthToken } from "@/lib/auth-token";

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
    avatar?: string;
  }) => Promise<User>;
  logout: () => void;
  updateUser: (user: User) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_KEY = "auth_user";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => getAuthToken());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const hydrate = async () => {
      const savedToken = getAuthToken();
      if (savedToken) {
        setAuthToken(savedToken);
      }
      const savedUser = localStorage.getItem(USER_KEY);
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          localStorage.removeItem(USER_KEY);
        }
      }
      if (savedToken) {
        try {
          const response = await authService.me();
          const profile = normalizeUser(response.data);
          setUser(profile);
          localStorage.setItem(USER_KEY, JSON.stringify(profile));
        } catch {
          setUser(null);
          setToken(null);
          clearAuthToken();
          localStorage.removeItem(USER_KEY);
        }
      }
      setIsLoading(false);
    };
    hydrate();
  }, []);

  const persist = (nextUser: User, nextToken: string) => {
    const normalized = normalizeUser(nextUser);
    setUser(normalized);
    setToken(nextToken);
    setAuthToken(nextToken);
    localStorage.setItem(USER_KEY, JSON.stringify(normalized));
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
    avatar?: string;
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
    clearAuthToken();
    localStorage.removeItem(USER_KEY);
  };

  const updateUser = (updatedUser: User, newToken?: string) => {
    const normalized = normalizeUser(updatedUser);
    setUser(normalized);
    localStorage.setItem(USER_KEY, JSON.stringify(normalized));
    if (newToken) {
      setToken(newToken);
      setAuthToken(newToken);
    }
  };

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
    }),
    [user, token, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

