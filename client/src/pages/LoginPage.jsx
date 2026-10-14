import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { Button, Input } from '../components';

export const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
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
      newErrors.email = 'Please provide a valid email';
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
      // In Phase 1 & 2 before backend API integration, or if API available
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
        } else if (emailLower.includes('partner') || emailLower.includes('store')) {
          role = 'partner';
          name = 'Store Partner';
        } else if (emailLower.includes('delivery')) {
          role = 'delivery';
          name = 'Delivery Executive';
        }

        userData = {
          id: 'mock-user-1',
          name,
          email: formData.email,
          role,
        };
        token = 'mock_jwt_token_sample';
      }

      login(userData, token);
      toast.success(`Welcome back, ${userData.name}!`);

      // Redirect by role
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
      toast.error(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Sign in to QuickCart</h2>
        <p className="text-xs text-slate-500 mt-1">
          Access your hyperlocal ordering or store partner workspace
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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
          required
        />

        <Input
          label="Password"
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          leftIcon={<Lock className="h-4 w-4" />}
          required
        />

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

      {/* Quick Role Fillers for quick testing */}
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs">
        <p className="font-semibold text-slate-700 mb-1.5 text-center">Quick Demo Credentials:</p>
        <div className="grid grid-cols-2 gap-1 text-[11px]">
          <button
            type="button"
            onClick={() => setFormData({ email: 'admin@quickcart.com', password: 'password123' })}
            className="text-left p-1 rounded hover:bg-white text-slate-600 hover:text-slate-900 truncate"
          >
            🛡️ admin@quickcart.com
          </button>
          <button
            type="button"
            onClick={() => setFormData({ email: 'partner@quickcart.com', password: 'password123' })}
            className="text-left p-1 rounded hover:bg-white text-slate-600 hover:text-slate-900 truncate"
          >
            🏪 partner@quickcart.com
          </button>
          <button
            type="button"
            onClick={() => setFormData({ email: 'delivery@quickcart.com', password: 'password123' })}
            className="text-left p-1 rounded hover:bg-white text-slate-600 hover:text-slate-900 truncate"
          >
            🛵 delivery@quickcart.com
          </button>
          <button
            type="button"
            onClick={() => setFormData({ email: 'customer@quickcart.com', password: 'password123' })}
            className="text-left p-1 rounded hover:bg-white text-slate-600 hover:text-slate-900 truncate"
          >
            🛒 customer@quickcart.com
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
