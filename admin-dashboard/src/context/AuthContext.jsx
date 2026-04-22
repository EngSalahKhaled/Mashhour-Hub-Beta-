import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthChange, loginWithEmail, logoutUser } from '../services/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        // Automatically fetch and store token on auth change/refresh
        try {
          const token = await firebaseUser.getIdToken(true);
          localStorage.setItem('token', token);
        } catch (err) {
          console.error('Failed to sync token:', err);
        }
      } else {
        localStorage.removeItem('token');
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
    <AuthContext.Provider value={{ user, loading, login, logout }}>
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
