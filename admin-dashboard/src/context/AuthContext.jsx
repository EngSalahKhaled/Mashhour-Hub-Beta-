import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthChange, loginWithEmail, logoutUser } from '../services/firebase';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const unsub = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        // Automatically fetch and store token on auth change/refresh
        try {
          const tokenResult = await firebaseUser.getIdTokenResult(true);
          localStorage.setItem('token', tokenResult.token);

          const claimRole = tokenResult.claims.role || null;
          let resolvedRole = claimRole;

          if (!resolvedRole) {
            try {
              const response = await fetch(`${API_BASE}/auth/me`, {
                headers: {
                  Authorization: `Bearer ${tokenResult.token}`,
                },
              });

              if (response.ok) {
                const data = await response.json();
                resolvedRole =
                  data?.user?.role ||
                  data?.user?.customClaims?.role ||
                  null;
              }
            } catch (error) {
              console.error('Failed to resolve role from API:', error);
            }
          }

          setUserRole(resolvedRole);
        } catch (err) {
          console.error('Failed to sync token:', err);
          setUserRole(null);
        }
      } else {
        localStorage.removeItem('token');
        setUserRole(null);
      }
      
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const login = async (email, password) => {
    const cred = await loginWithEmail(email, password);
    // Token will be handled by the onAuthChange listener above
    return cred.user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    return logoutUser();
  };

  return (
    <AuthContext.Provider value={{ user, userRole, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
