import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthChange, loginWithEmail, logoutUser } from '../services/firebase';

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
          setUserRole(tokenResult.claims.role || 'superadmin'); // default to superadmin to prevent lockout if claims missing on old accounts
        } catch (err) {
          console.error('Failed to sync token:', err);
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
