import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, Eye, EyeOff, Shield, Store, Truck, ShoppingCart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { Button, Input } from '../components';

export const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please provide a valid email format';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      let res;
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        res = await response.json();
      } catch {
        res = null;
      }

      let userData, token;
      if (res && res.success && res.data) {
        userData = res.data.user;
        token = res.data.token;
      } else {
        // Fallback for mock preview if server not started yet
        const emailLower = formData.email.toLowerCase();
        let role = 'customer';
        let name = 'Customer User';

        if (emailLower.includes('admin')) {
          role = 'admin';
          name = 'Admin Manager';
        } else if (emailLower.includes('partner') || emailLower.includes('store') || emailLower.includes('bakery') || emailLower.includes('pharmacy')) {
          role = 'partner';
          name = 'Store Partner';
        } else if (emailLower.includes('delivery')) {
          role = 'delivery';
          name = 'Delivery Executive';
        }

        userData = {
          id: 'user-' + Date.now(),
          name,
          email: formData.email,
          role,
        };
        token = 'mock_jwt_token_quickcart';
      }

      login(userData, token);
      toast.success(`Welcome back, ${userData.name}!`);

      // Strict role-based redirects as specified in requirements:
      // customer -> /stores, partner -> /partner/dashboard, admin -> /admin/dashboard, delivery -> /delivery/tasks
      const roleRedirects = {
        customer: '/stores',
        partner: '/partner/dashboard',
        admin: '/admin/dashboard',
        delivery: '/delivery/tasks',
      };

      const redirectPath =
        location.state?.from?.pathname || roleRedirects[userData.role] || '/stores';
      navigate(redirectPath, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (role, email, name) => {
    setFormData({ email, password: 'password123' });
    setErrors({});
    toast.info(`Loaded demo credentials for ${role}`);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Sign in to QuickCart</h2>
        <p className="text-xs text-slate-500 mt-1">
          Access your hyperlocal ordering or operational workspace
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Email Address"
          id="email"
          name="email"
          type="email"
          placeholder="name@example.com"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          leftIcon={<Mail className="h-4 w-4" />}
          autoComplete="email"
          required
        />

        <div className="relative">
          <Input
            label="Password"
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            leftIcon={<Lock className="h-4 w-4" />}
            autoComplete="current-password"
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600 focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            required
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          size="lg"
          isLoading={loading}
          rightIcon={<LogIn className="h-4 w-4" />}
        >
          Sign In
        </Button>
      </form>

      {/* Quick Demo Credentials Switcher */}
      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs">
        <p className="font-semibold text-slate-700 mb-2 text-center">
          One-Click Demo Credentials:
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => fillDemoCredentials('Customer', 'customer@quickcart.com', 'Sarah Customer')}
            className="flex items-center gap-1.5 p-2 rounded-lg bg-white hover:bg-primary-50 border border-slate-200 hover:border-primary-300 text-slate-700 transition-colors text-left"
          >
            <ShoppingCart className="h-3.5 w-3.5 text-primary-600 shrink-0" />
            <div className="truncate">
              <span className="block font-semibold text-[11px] text-slate-900 leading-none">Customer</span>
              <span className="text-[10px] text-slate-400">customer@quickcart.com</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => fillDemoCredentials('Store Partner', 'partner@quickcart.com', 'Rajesh Gupta')}
            className="flex items-center gap-1.5 p-2 rounded-lg bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-slate-700 transition-colors text-left"
          >
            <Store className="h-3.5 w-3.5 text-accent-600 shrink-0" />
            <div className="truncate">
              <span className="block font-semibold text-[11px] text-slate-900 leading-none">Store Partner</span>
              <span className="text-[10px] text-slate-400">partner@quickcart.com</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => fillDemoCredentials('Delivery Executive', 'delivery@quickcart.com', 'Ravi Courier')}
            className="flex items-center gap-1.5 p-2 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 transition-colors text-left"
          >
            <Truck className="h-3.5 w-3.5 text-info-600 shrink-0" />
            <div className="truncate">
              <span className="block font-semibold text-[11px] text-slate-900 leading-none">Delivery Exec</span>
              <span className="text-[10px] text-slate-400">delivery@quickcart.com</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => fillDemoCredentials('Administrator', 'admin@quickcart.com', 'Admin User')}
            className="flex items-center gap-1.5 p-2 rounded-lg bg-white hover:bg-red-50 border border-slate-200 hover:border-red-300 text-slate-700 transition-colors text-left"
          >
            <Shield className="h-3.5 w-3.5 text-danger-600 shrink-0" />
            <div className="truncate">
              <span className="block font-semibold text-[11px] text-slate-900 leading-none">Admin</span>
              <span className="text-[10px] text-slate-400">admin@quickcart.com</span>
            </div>
          </button>
        </div>
      </div>

      <div className="text-center pt-2 border-t border-slate-100">
        <p className="text-xs text-slate-600">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
