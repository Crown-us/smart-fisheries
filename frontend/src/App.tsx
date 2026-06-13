import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/authStore';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Auth Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';

// Farmer Pages
import FarmerDashboard from './pages/FarmerDashboard';
import PondsPage from './pages/PondsPage';
import WaterQualityPage from './pages/WaterQualityPage';
import FeedingPage from './pages/FeedingPage';
import FcrAnalyticsPage from './pages/FcrAnalyticsPage';
import FarmerCatalogPage from './pages/FarmerCatalogPage';
import CertificationsPage from './pages/CertificationsPage';

// Consumer Pages
import ConsumerMarketplace from './pages/ConsumerMarketplace';
import CartPage from './pages/CartPage';
import ConsumerOrders from './pages/ConsumerOrders';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';

const queryClient = new QueryClient();

// Route Protection Middleware
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('ADMIN' | 'FARMER' | 'CONSUMER')[];
}

function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect if role is unauthorized
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'FARMER') return <Navigate to="/farmer/dashboard" replace />;
    return <Navigate to="/consumer/marketplace" replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}

export default function App() {
  const { user, isAuthenticated } = useAuthStore();

  const getDashboardRedirect = () => {
    if (user?.role === 'ADMIN') return '/admin/dashboard';
    if (user?.role === 'FARMER') return '/farmer/dashboard';
    return '/consumer/marketplace';
  };

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public / Auth routes */}
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to={getDashboardRedirect()} replace /> : <LoginPage />} 
          />
          <Route 
            path="/register" 
            element={isAuthenticated ? <Navigate to={getDashboardRedirect()} replace /> : <RegisterPage />} 
          />

          {/* Landing Page is public root */}
          <Route 
            path="/" 
            element={<LandingPage />} 
          />

          {/* Farmer Portal (Protected) */}
          <Route 
            path="/farmer/dashboard" 
            element={<ProtectedRoute allowedRoles={['FARMER', 'ADMIN']}><FarmerDashboard /></ProtectedRoute>} 
          />
          <Route 
            path="/farmer/ponds" 
            element={<ProtectedRoute allowedRoles={['FARMER', 'ADMIN']}><PondsPage /></ProtectedRoute>} 
          />
          <Route 
            path="/farmer/water-quality" 
            element={<ProtectedRoute allowedRoles={['FARMER', 'ADMIN']}><WaterQualityPage /></ProtectedRoute>} 
          />
          <Route 
            path="/farmer/feeding" 
            element={<ProtectedRoute allowedRoles={['FARMER', 'ADMIN']}><FeedingPage /></ProtectedRoute>} 
          />
          <Route 
            path="/farmer/fcr" 
            element={<ProtectedRoute allowedRoles={['FARMER', 'ADMIN']}><FcrAnalyticsPage /></ProtectedRoute>} 
          />
          <Route 
            path="/farmer/catalog" 
            element={<ProtectedRoute allowedRoles={['FARMER', 'ADMIN']}><FarmerCatalogPage /></ProtectedRoute>} 
          />
          <Route 
            path="/farmer/certifications" 
            element={<ProtectedRoute allowedRoles={['FARMER', 'ADMIN']}><CertificationsPage /></ProtectedRoute>} 
          />

          {/* Consumer Marketplace (Protected) */}
          <Route 
            path="/consumer/marketplace" 
            element={<ProtectedRoute allowedRoles={['CONSUMER', 'ADMIN']}><ConsumerMarketplace /></ProtectedRoute>} 
          />
          <Route 
            path="/consumer/cart" 
            element={<ProtectedRoute allowedRoles={['CONSUMER', 'ADMIN']}><CartPage /></ProtectedRoute>} 
          />
          <Route 
            path="/consumer/orders" 
            element={<ProtectedRoute allowedRoles={['CONSUMER', 'ADMIN']}><ConsumerOrders /></ProtectedRoute>} 
          />

          {/* Admin Panel Portal (Protected) */}
          <Route 
            path="/admin/dashboard" 
            element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} 
          />
          
          <Route 
            path="/admin/users" 
            element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} 
          />
          <Route 
            path="/admin/certifications" 
            element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} 
          />
          <Route 
            path="/admin/marketplace" 
            element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} 
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
