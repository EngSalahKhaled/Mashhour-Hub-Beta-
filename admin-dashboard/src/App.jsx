import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout    from './components/Layout';
import LoginPage from './pages/Login';

function AppRoutes() {
  const { user, loading }       = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dir, setDir]           = useState('ltr');

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--bg-primary)' }}
      >
        <div className="spinner" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public */}
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <LoginPage />}
      />

      {/* Protected — all sub-routes handled inside Layout */}
      <Route
        path="/*"
        element={
          <Layout
            isSidebarOpen={sidebarOpen}
            setIsSidebarOpen={setSidebarOpen}
            dir={dir}
            onToggleDir={() => setDir((d) => (d === 'ltr' ? 'rtl' : 'ltr'))}
          />
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter basename="/admin">
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
