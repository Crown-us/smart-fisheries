import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { notificationService } from '../services/api';
import { Notification } from '../types';
import { 
  Waves, LayoutDashboard, Database, AlertTriangle, 
  Flame, LineChart, Award, ShoppingBag, ClipboardList, 
  Users, Bell, LogOut, ShieldCheck, Menu, X, CheckSquare
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.listUnread();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications([]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = {
    FARMER: [
      { path: '/farmer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/farmer/ponds', label: 'Kolam & Bibit', icon: Database },
      { path: '/farmer/water-quality', label: 'Kualitas Air', icon: Waves },
      { path: '/farmer/feeding', label: 'Pemberian Pakan', icon: Flame },
      { path: '/farmer/fcr', label: 'Analisis FCR', icon: LineChart },
      { path: '/farmer/catalog', label: 'Katalog Penjualan', icon: ShoppingBag },
      { path: '/farmer/certifications', label: 'Sertifikasi', icon: Award },
    ],
    CONSUMER: [
      { path: '/consumer/marketplace', label: 'Marketplace', icon: ShoppingBag },
      { path: '/consumer/cart', label: 'Keranjang Belanja', icon: ClipboardList },
      { path: '/consumer/orders', label: 'Riwayat Pesanan', icon: ClipboardList },
    ],
    ADMIN: [
      { path: '/admin/dashboard', label: 'Admin Panel', icon: ShieldCheck },
      { path: '/admin/users', label: 'Manajemen Pengguna', icon: Users },
      { path: '/admin/certifications', label: 'Digital Verifikasi', icon: Award },
      { path: '/admin/marketplace', label: 'Moderasi Produk', icon: ShoppingBag },
    ]
  };

  const currentRole = user?.role || 'CONSUMER';
  const roleNavItems = navItems[currentRole] || [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row">
      
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white font-bold text-sm shadow">
            e
          </div>
          <span className="font-extrabold tracking-tight text-slate-800 text-base">Smart Fisheries</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowNotifications(!showNotifications)} 
            className="relative p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <Bell className="h-5.5 w-5.5" />
            {notifications.length > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full text-[9px] w-4.5 h-4.5 flex items-center justify-center font-bold">
                {notifications.length}
              </span>
            )}
          </button>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 text-slate-500 hover:bg-slate-150 rounded-lg"
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-[280px] bg-white border-r border-slate-200 p-6 flex flex-col transition-transform duration-300 md:translate-x-0 md:static ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="hidden md:flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-teal-400 flex items-center justify-center text-white font-bold shadow-md shadow-sky-100">
            eF
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight text-slate-900 leading-tight">Smart Fisheries</h1>
            <p className="text-[10px] text-sky-600 font-bold tracking-wider uppercase">{user?.role} PORTAL</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {roleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl transition-all duration-150 group text-sm font-medium ${
                  isActive 
                    ? 'bg-sky-50 text-sky-700 shadow-sm border border-sky-100/50' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 transition-colors ${isActive ? 'text-sky-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User profile section at the bottom */}
        <div className="mt-auto pt-6 border-t border-slate-100">
          <div className="flex items-center gap-3.5 mb-5">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-700 border border-slate-200">
              {user?.username.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <h4 className="font-bold truncate text-sm text-slate-800">{user?.firstName || user?.username}</h4>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors duration-150 text-sm font-semibold"
          >
            <LogOut className="h-4.5 w-4.5" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Desktop Header */}
        <header className="hidden md:flex items-center justify-between px-8 py-5 bg-white border-b border-slate-200 sticky top-0 z-30">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900">
              Selamat datang, <span className="bg-gradient-to-r from-sky-600 to-teal-500 bg-clip-text text-transparent">{user?.firstName || user?.username}</span>
            </h2>
            <p className="text-xs text-slate-400">Budidaya Perikanan Pintar & Penjualan Terintegrasi</p>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-700 transition-colors shadow-sm"
            >
              <Bell className="h-4.5 w-4.5" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-[10px] w-5 h-5 flex items-center justify-center font-bold">
                  {notifications.length}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </div>

        {/* Notification Overlay Drawer */}
        {showNotifications && (
          <div className="absolute right-8 top-[72px] z-50 w-96 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-100/80 p-5 max-h-[80vh] overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <Bell className="h-4.5 w-4.5 text-sky-600" />
                Notifikasi Peringatan
              </h3>
              <button 
                onClick={handleMarkAllRead} 
                className="text-xs text-sky-600 hover:text-sky-700 font-semibold"
              >
                Tandai Semua Dibaca
              </button>
            </div>
            
            <div className="flex-1 space-y-2.5">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <CheckSquare className="h-9 w-9 mx-auto mb-2 text-slate-300" />
                  <p className="text-xs">Tidak ada notifikasi baru</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className="p-3 bg-slate-50 border border-slate-150 rounded-xl border-l-4 border-l-sky-500">
                    <h5 className="font-bold text-xs flex items-center gap-1.5 text-slate-800">
                      {n.type === 'ALERT' && <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
                      {n.title}
                    </h5>
                    <p className="text-[11px] text-slate-500 mt-1">{n.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
