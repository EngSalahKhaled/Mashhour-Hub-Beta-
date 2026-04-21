import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import Navbar  from './Navbar';

// Pages (lazy-imported for code splitting)
import { lazy, Suspense } from 'react';
const OverviewPage    = lazy(() => import('../pages/Overview'));
const LeadsPage       = lazy(() => import('../pages/Leads'));
const MediaPage       = lazy(() => import('../pages/Media'));
const CmsServicesPage = lazy(() => import('../pages/CmsServices'));
const CmsCasesPage    = lazy(() => import('../pages/CmsCases'));
const SettingsPage    = lazy(() => import('../pages/Settings'));
const WebsiteEditor   = lazy(() => import('../pages/WebsiteEditor'));

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0,  transition: { duration: 0.3, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2, ease: 'easeIn'  } },
};

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-full min-h-[60vh]">
      <div className="spinner" />
    </div>
  );
}

export default function Layout({ isSidebarOpen, setIsSidebarOpen, dir }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex h-screen overflow-hidden mesh-bg" dir={dir}>
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} dir={dir} />

      {/* Mobile overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Main area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} dir={dir} />

        <main className="flex-1 overflow-y-auto p-6">
          <Suspense fallback={<PageLoader />}>
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={
                  <motion.div key="overview" {...pageVariants}>
                    <OverviewPage />
                  </motion.div>
                }/>
                <Route path="/leads" element={
                  <motion.div key="leads" {...pageVariants}>
                    <LeadsPage />
                  </motion.div>
                }/>
                <Route path="/media" element={
                  <motion.div key="media" {...pageVariants}>
                    <MediaPage />
                  </motion.div>
                }/>
                <Route path="/cms/services" element={
                  <motion.div key="cms-services" {...pageVariants}>
                    <CmsServicesPage />
                  </motion.div>
                }/>
                <Route path="/cms/case-studies" element={
                  <motion.div key="cms-cases" {...pageVariants}>
                    <CmsCasesPage />
                  </motion.div>
                }/>
                <Route path="/website-editor" element={
                  <motion.div key="website-editor" {...pageVariants}>
                    <WebsiteEditor />
                  </motion.div>
                }/>
                <Route path="/settings" element={
                  <motion.div key="settings" {...pageVariants}>
                    <SettingsPage />
                  </motion.div>
                }/>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AnimatePresence>
          </Suspense>
        </main>
      </div>

      {/* Toast Notifications */}
      <Toaster
        position={dir === 'rtl' ? 'bottom-left' : 'bottom-right'}
        toastOptions={{
          style: {
            background: '#111827',
            color: '#f1f5f9',
            border: '1px solid rgba(99,179,237,0.15)',
            borderRadius: '12px',
            fontSize: '14px',
            fontFamily: 'Inter, Cairo, sans-serif',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#111827' },
          },
          error: {
            iconTheme: { primary: '#f43f5e', secondary: '#111827' },
          },
        }}
      />
    </div>
  );
}
