'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  id: string;
  email: string;
  fullName: string;
  contactNo?: string;
  vehicleNumber?: string;
  nic?: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to get redirect path based on role
const getRedirectPath = (role: string) => {
  switch (role) {
    case 'ADMIN':
      return '/admin';
    case 'CUSTOMER':
      return '/customer';
    case 'COUNTER':
      return '/counter';
    case 'LAND_OWNER':
      return '/land-owner';
    case 'WASHER':
      return '/washer';
    default:
      return '/customer';
  }
};

// Protected routes that require authentication
const protectedRoutes = ['/customer', '/admin', '/counter', '/land-owner', '/washer'];

// Check if a path is protected
const isProtectedRoute = (path: string) => {
  return protectedRoutes.some(route => path.startsWith(route));
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });
      
      const data = await response.json();
      
      if (data.success && data.data) {
        setUser(data.data);
        return data.data;
      } else {
        setUser(null);
        return null;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      // Call backend to clear session/token
      await fetch('/api/auth/sign-out', {
        method: 'POST',
        credentials: 'include',
      });
      
      // Clear user state
      setUser(null);
      
      // Clear any localStorage data if exists
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
      
      // Redirect to home page with replace to prevent back navigation
      router.replace('/');
    } catch (error) {
      console.error('Sign out error:', error);
      // Even if the API call fails, clear local state and redirect
      setUser(null);
      router.replace('/');
    }
  }, [router]);

  // Check auth on mount and when pathname changes
  useEffect(() => {
    const verifyAuth = async () => {
      setIsLoading(true);
      const authenticatedUser = await checkAuth();
      
      // If on a protected route and not authenticated, redirect to sign-in
      if (isProtectedRoute(pathname) && !authenticatedUser) {
        router.replace('/sign-in');
      }
    };

    verifyAuth();
  }, [checkAuth, pathname, router]);

  // Prevent accessing protected routes when not authenticated
  useEffect(() => {
    if (!isLoading && !user && isProtectedRoute(pathname)) {
      router.replace('/sign-in');
    }
  }, [isLoading, user, pathname, router]);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signOut,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { getRedirectPath, isProtectedRoute };
