import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  ShoppingCart,
  User,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  Store,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Button, Modal, Badge } from '../components';

export const PublicLayout = () => {
  const { user, isAuthenticated, logout, role } = useAuth();
  const { itemCount, conflictModal, resolveConflict } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'partner') return '/partner/dashboard';
    if (role === 'delivery') return '/delivery/tasks';
    return '/orders';
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white shadow-md shadow-primary-600/30 group-hover:bg-primary-700 transition-colors">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-primary-600 transition-colors">
                    Quick<span className="text-primary-600">Cart</span>
                  </span>
                  <span className="text-[10px] font-medium text-slate-400 -mt-1 tracking-wider uppercase">
                    Hyperlocal
                  </span>
                </div>
              </Link>

              {/* Desktop Nav Links */}
              <nav className="hidden md:flex items-center gap-1">
                <Link
                  to="/"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/')
                      ? 'text-primary-700 bg-primary-50 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Home
                </Link>
                <Link
                  to="/stores"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/stores')
                      ? 'text-primary-700 bg-primary-50 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Stores
                </Link>
                {isAuthenticated && role === 'customer' && (
                  <Link
                    to="/orders"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/orders')
                        ? 'text-primary-700 bg-primary-50 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    My Orders
                  </Link>
                )}
              </nav>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Cart Button */}
              <Link
                to="/cart"
                className="relative p-2.5 rounded-xl text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                aria-label={`Cart with ${itemCount} items`}
              >
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-[11px] font-bold rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center ring-2 ring-white shadow-sm animate-in zoom-in-50">
                    {itemCount}
                  </span>
                )}
              </Link>

              {/* User Menu / Auth CTAs */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors text-left"
                    aria-expanded={userDropdownOpen}
                    aria-haspopup="true"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-xs font-semibold text-slate-800 leading-tight">
                        {user?.name || 'Account'}
                      </p>
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        {role}
                      </span>
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setUserDropdownOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200/80 py-1.5 z-20 animate-in fade-in zoom-in-95">
                        <div className="px-4 py-2.5 border-b border-slate-100">
                          <p className="text-xs font-semibold text-slate-900 truncate">
                            {user?.name}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                          <div className="mt-1.5">
                            <Badge variant="primary" size="sm">
                              {role}
                            </Badge>
                          </div>
                        </div>

                        {role !== 'customer' && (
                          <Link
                            to={getDashboardPath()}
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            <LayoutDashboard className="h-4 w-4 text-slate-400" />
                            {role === 'admin'
                              ? 'Admin Portal'
                              : role === 'partner'
                              ? 'Store Dashboard'
                              : 'Delivery Tasks'}
                          </Link>
                        )}

                        <Link
                          to="/orders"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <Clock className="h-4 w-4 text-slate-400" />
                          Order History
                        </Link>

                        <div className="border-t border-slate-100 my-1" />

                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-danger-600 hover:bg-danger-50 transition-colors"
                        >
                          <LogOut className="h-4 w-4 text-danger-500" />
                          Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link to="/login">
                    <Button variant="ghost" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="primary" size="sm">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Home
            </Link>
            <Link
              to="/stores"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Browse Stores
            </Link>
            <Link
              to="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <span>Shopping Cart</span>
              {itemCount > 0 && <Badge variant="primary">{itemCount}</Badge>}
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  My Orders
                </Link>
                {role !== 'customer' && (
                  <Link
                    to={getDashboardPath()}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-primary-700 bg-primary-50"
                  >
                    Go to Portal ({role})
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-danger-600 hover:bg-danger-50"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="secondary" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Main Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Store Conflict Modal */}
      <Modal
        isOpen={conflictModal.isOpen}
        onClose={() => resolveConflict(false)}
        title="Replace cart items?"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => resolveConflict(false)}>
              Keep Current Cart
            </Button>
            <Button variant="danger" onClick={() => resolveConflict(true)}>
              Start Fresh with New Store
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Your cart currently contains items from a different store. QuickCart orders items from one
          store at a time for fastest hyperlocal delivery.
        </p>
        <p className="text-sm text-slate-800 font-semibold mt-3">
          Would you like to empty your cart and add this item from{' '}
          <span className="text-primary-600">{conflictModal.pendingStore?.name}</span> instead?
        </p>
      </Modal>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-12 pb-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800 text-sm">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold">
                  <ShoppingBag className="h-4 w-4" />
                </div>
                <span className="text-white font-extrabold text-lg tracking-tight">QuickCart</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Hyperlocal delivery platform uniting inventory management, instant ordering, and live
                order tracking across your neighborhood.
              </p>
            </div>

            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">
                Shop Local
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/stores" className="hover:text-primary-400 transition-colors">
                    Browse All Stores
                  </Link>
                </li>
                <li>
                  <Link to="/cart" className="hover:text-primary-400 transition-colors">
                    View Shopping Cart
                  </Link>
                </li>
                <li>
                  <Link to="/orders" className="hover:text-primary-400 transition-colors">
                    Track Orders
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">
                Platform Roles
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/register" className="hover:text-primary-400 transition-colors">
                    Become a Store Partner
                  </Link>
                </li>
                <li>
                  <Link to="/partner/dashboard" className="hover:text-primary-400 transition-colors">
                    Store Partner Portal
                  </Link>
                </li>
                <li>
                  <Link to="/delivery/tasks" className="hover:text-primary-400 transition-colors">
                    Delivery Executive Portal
                  </Link>
                </li>
                <li>
                  <Link to="/admin/dashboard" className="hover:text-primary-400 transition-colors">
                    Administrator Center
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">
                Order Lifecycle
              </h4>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                  Placed
                </span>
                <span className="text-[10px] bg-amber-950/60 text-amber-300 px-2 py-0.5 rounded">
                  Accepted
                </span>
                <span className="text-[10px] bg-amber-950/60 text-amber-400 px-2 py-0.5 rounded">
                  Packed
                </span>
                <span className="text-[10px] bg-blue-950/60 text-blue-300 px-2 py-0.5 rounded">
                  Out for Delivery
                </span>
                <span className="text-[10px] bg-emerald-950/60 text-emerald-300 px-2 py-0.5 rounded">
                  Delivered
                </span>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>© {new Date().getFullYear()} QuickCart. All rights reserved.</p>
            <p>Fast, reliable, neighborhood commerce.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
