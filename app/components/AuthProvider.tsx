'use client';

<<<<<<< HEAD
import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
=======
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
>>>>>>> 7804710b074a678f7a53c3e46fee4da1ef830302
import { useRouter, usePathname } from 'next/navigation';

interface User {
  id: string;
  email: string;
  fullName: string;
  contactNo?: string;
  vehicleNumber?: string;
<<<<<<< HEAD
=======
  nic?: string;
>>>>>>> 7804710b074a678f7a53c3e46fee4da1ef830302
  role: string;
}

interface AuthContextType {
  user: User | null;
<<<<<<< HEAD
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
=======
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<void>;
>>>>>>> 7804710b074a678f7a53c3e46fee4da1ef830302
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

<<<<<<< HEAD
// Role to redirect path mapping
const ROLE_REDIRECT_MAP: Record<string, string> = {
  ADMIN: '/admin',
  CUSTOMER: '/customer',
  COUNTER: '/counter',
  LAND_OWNER: '/land-owner',
  WASHER: '/washer',
};

// Protected route patterns
const PROTECTED_ROUTES = ['/customer', '/admin', '/counter', '/land-owner', '/washer'];

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/', '/sign-in', '/sign-up'];

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
=======
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
>>>>>>> 7804710b074a678f7a53c3e46fee4da1ef830302
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });
      
<<<<<<< HEAD
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
=======
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
>>>>>>> 7804710b074a678f7a53c3e46fee4da1ef830302
      await fetch('/api/auth/sign-out', {
        method: 'POST',
        credentials: 'include',
      });
<<<<<<< HEAD
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
=======
      
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
>>>>>>> 7804710b074a678f7a53c3e46fee4da1ef830302
      router.replace('/');
    }
  }, [router]);

<<<<<<< HEAD
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
=======
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
>>>>>>> 7804710b074a678f7a53c3e46fee4da1ef830302
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
<<<<<<< HEAD
=======

export { getRedirectPath, isProtectedRoute };
>>>>>>> 7804710b074a678f7a53c3e46fee4da1ef830302
