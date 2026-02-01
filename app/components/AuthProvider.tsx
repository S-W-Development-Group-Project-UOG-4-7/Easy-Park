'use client';

import { createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

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
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const initializedRef = useRef(false);
  const inFlightRef = useRef<AbortController | null>(null);

  // Fetch current user from API
  const refreshUser = useCallback(async () => {
    try {
      inFlightRef.current?.abort();
      const controller = new AbortController();
      inFlightRef.current = controller;

      const response = await fetch('/api/auth/me', {
        credentials: 'include',
        signal: controller.signal,
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
      // Ignore aborted requests during fast navigation/unmounts.
      if (error instanceof DOMException && error.name === 'AbortError') return null;
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

  // Initial auth check (do it once; middleware handles route protection/redirects).
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    (async () => {
      setLoading(true);
      await refreshUser();
      setLoading(false);
    })();

    return () => {
      inFlightRef.current?.abort();
    };
  }, [refreshUser, router]);

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
