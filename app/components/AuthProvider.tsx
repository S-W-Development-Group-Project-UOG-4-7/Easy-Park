'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  id: string;
  email: string;
  fullName: string;
  contactNo?: string;
  vehicleNumber?: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Role to redirect path mapping
const ROLE_REDIRECT_MAP: Record<string, string> = {
  ADMIN: '/admin',
  CUSTOMER: '/customer',
  COUNTER: '/counter',
  LAND_OWNER: '/land-owner',
  WASHER: '/washer',
};

// Protected route patterns
const PROTECTED_ROUTES = ['/admin', '/counter', '/land-owner', '/washer'];

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/', '/sign-in', '/sign-up', '/customer'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Check if current route is protected
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  // Fetch current user from API
  const refreshUser = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setUser(data.data);
          return data.data;
        }
      }
      setUser(null);
      return null;
    } catch (error) {
      console.error('Error fetching user:', error);
      setUser(null);
      return null;
    }
  }, []);

  // Sign out function
  const signOut = useCallback(async () => {
    try {
      await fetch('/api/auth/sign-out', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      // Clear user state
      setUser(null);
      
      // Clear any client-side storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      
      // Redirect to home using replace
      router.replace('/');
    }
  }, [router]);

  // Check authentication on mount and route changes
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      const currentUser = await refreshUser();
      
      // If on a protected route and not authenticated, redirect to sign-in
      if (isProtectedRoute && !currentUser) {
        router.replace('/sign-in');
      }
      
      setLoading(false);
    };

    checkAuth();
  }, [pathname, isProtectedRoute, refreshUser, router]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = async () => {
      const currentUser = await refreshUser();
      if (isProtectedRoute && !currentUser) {
        router.replace('/sign-in');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isProtectedRoute, refreshUser, router]);

  return (
    <AuthContext.Provider value={{ user, loading, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
