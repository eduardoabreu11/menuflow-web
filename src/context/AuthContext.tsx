"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getMe,
  login as loginRequest,
  logout as logoutRequest,
  type AuthUser,
} from "@/services/authService";

import { clearSelectedRestaurant } from "@/services/restaurantService";

type LoginData = {
  email: string;
  password: string;
};

type AuthContextData = {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (data: LoginData) => Promise<AuthUser>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextData | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const me = await getMe();

      setUser(me);
    } catch {
      setUser(null);
      clearSelectedRestaurant();
    }
  }, []);

  async function signIn(data: LoginData) {
    const result = await loginRequest(data);

    clearSelectedRestaurant();
    setUser(result.user);

    return result.user;
  }

  async function signOut() {
    try {
      await logoutRequest();
    } finally {
      clearSelectedRestaurant();
      setUser(null);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      try {
        const me = await getMe();

        if (isMounted) {
          setUser(me);
        }
      } catch {
        if (isMounted) {
          setUser(null);
          clearSelectedRestaurant();
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      signIn,
      signOut,
      refreshUser,
    }),
    [user, loading, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }

  return context;
}