'use client';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  ReactNode,
} from 'react';
import { authApi } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  image_url?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const token = localStorage.getItem('accessToken');
    if (!token) {
      setLoading(false);
      return;
    }

    authApi
      .me()
      .then((res) => {
        if (res.data?.user) {
          setUser(res.data.user);
        } else {
          setUser(null);
          localStorage.removeItem('accessToken');
        }
      })
      .catch(() => {
        setUser(null);
        localStorage.removeItem('accessToken');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    const token = res.data.accessToken;
    if (token) {
      localStorage.setItem('accessToken', token);
    }
    setUser(res.data.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await authApi.register({ name, email, password });
    const token = res.data.accessToken;
    if (token) {
      localStorage.setItem('accessToken', token);
    }
    setUser(res.data.user);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    localStorage.removeItem('accessToken');
    setUser(null);
    window.location.replace('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};