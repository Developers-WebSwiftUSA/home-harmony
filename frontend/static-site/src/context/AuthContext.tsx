import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { User, UserRole } from "@/types/models";
import { mockUsers, delay } from "@/data/mockData";

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
  updateUser: (user: User, newToken?: string) => void;
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
    await delay(800); // Simulate API delay
    
    // Find user by email (in real app, this would be an API call)
    const foundUser = mockUsers.find((u) => u.email === email);
    
    if (!foundUser) {
      throw new Error("Invalid email or password");
    }
    
    // In a static site, we accept any password
    const mockToken = `mock_token_${foundUser._id}_${Date.now()}`;
    persist(foundUser, mockToken);
    return foundUser;
  };

  const register = async (payload: {
    email: string;
    password: string;
    role: UserRole;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }) => {
    await delay(1000); // Simulate API delay
    
    // Check if user already exists
    const existingUser = mockUsers.find((u) => u.email === payload.email);
    if (existingUser) {
      throw new Error("User with this email already exists");
    }
    
    // Create new user
    const newUser: User = {
      _id: `user_${Date.now()}`,
      email: payload.email,
      role: payload.role,
      firstName: payload.firstName,
      lastName: payload.lastName,
      phone: payload.phone,
      status: "active",
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${payload.email}`,
    };
    
    const mockToken = `mock_token_${newUser._id}_${Date.now()}`;
    persist(newUser, mockToken);
    return newUser;
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
