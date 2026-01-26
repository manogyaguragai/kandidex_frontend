import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  userId: string | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  userId: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initial auth check
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      userId: user?.userId || null,
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
