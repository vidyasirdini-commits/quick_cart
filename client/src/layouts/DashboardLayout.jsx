import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  LayoutDashboard,
  Boxes,
  ClipboardList,
  MapPin,
  Users,
  CreditCard,
  Truck,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Store,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components';

export const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const { user, role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Define navigation items based on role
  const getNavLinks = () => {
    if (role === 'admin') {
      return [
        { label: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'Transactions', path: '/admin/transactions', icon: CreditCard },
        { label: 'Delivery Zones', path: '/admin/zones', icon: MapPin },
        { label: 'User Directory', path: '/admin/users', icon: Users },
      ];
    }
    if (role === 'partner') {
      return [
        { label: 'Store Overview', path: '/partner/dashboard', icon: LayoutDashboard },
        { label: 'Inventory', path: '/partner/inventory', icon: Boxes },
        { label: 'Incoming Orders', path: '/partner/orders', icon: ClipboardList },
      ];
    }
    if (role === 'delivery') {
      return [{ label: 'Assigned Dispatches', path: '/delivery/tasks', icon: Truck }];
    }
    return [];
  };

  const navLinks = getNavLinks();

  const getRoleTitle = () => {
    if (role === 'admin') return 'Administrator';
    if (role === 'partner') return 'Store Partner';
    if (role === 'delivery') return 'Delivery Executive';
    return 'Dashboard';
  };

  const getRoleBadgeVariant = () => {
    if (role === 'admin') return 'danger';
    if (role === 'partner') return 'accent';
    return 'info';
  };

  const isLinkActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-100/70 flex">
      {/* Mobile Drawer Backdrop */}
      {mobileDrawerOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-xs"
          onClick={() => setMobileDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Left Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-slate-900 text-slate-300 transition-all duration-300 ease-in-out border-r border-slate-800 ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 shrink-0">
          <Link to="/" className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-primary-600/30">
              <ShoppingBag className="h-5 w-5" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight text-white">
                  Quick<span className="text-primary-400">Cart</span>
                </span>
                <span className="text-[10px] text-slate-400 -mt-1 font-medium tracking-wide uppercase">
                  {getRoleTitle()}
                </span>
              </div>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setMobileDrawerOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Snapshot in Sidebar (when expanded) */}
        {!collapsed && (
          <div className="px-4 py-3 mx-3 my-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary-700 text-white flex items-center justify-center font-bold text-sm shrink-0">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{user?.name || 'User'}</p>
              <Badge variant={getRoleBadgeVariant()} size="sm" className="mt-0.5">
                {role}
              </Badge>
            </div>
          </div>
        )}

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const active = isLinkActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileDrawerOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-primary-600 text-white shadow-sm shadow-primary-600/30 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                } ${collapsed ? 'justify-center px-2' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`h-5 w-5 shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer Controls */}
        <div className="p-3 border-t border-slate-800 shrink-0 space-y-1">
          {/* Public Storefront Link */}
          <Link
            to="/stores"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ${
              collapsed ? 'justify-center px-2' : ''
            }`}
            title="Go to Consumer Store"
          >
            <Store className="h-4 w-4 shrink-0 text-slate-400" />
            {!collapsed && <span>Consumer Store</span>}
          </Link>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-danger-400 hover:text-danger-300 hover:bg-danger-950/40 transition-colors ${
              collapsed ? 'justify-center px-2' : ''
            }`}
            title="Sign Out"
          >
            <LogOut className="h-4 w-4 shrink-0 text-danger-400" />
            {!collapsed && <span>Sign Out</span>}
          </button>

          {/* Desktop Collapse Toggle */}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex w-full items-center justify-center p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors mt-2"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      </aside>

      {/* Main Dashboard Wrapper */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          collapsed ? 'md:pl-20' : 'md:pl-64'
        }`}
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200/80 shadow-xs px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Open sidebar"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
              {getRoleTitle()} Management
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/stores"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-primary-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-primary-200 hover:bg-primary-50/50 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Storefront
            </Link>

            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <span className="block text-xs font-semibold text-slate-800 leading-tight">
                  {user?.name || 'Administrator'}
                </span>
                <span className="block text-[11px] text-slate-400 capitalize">{role}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
