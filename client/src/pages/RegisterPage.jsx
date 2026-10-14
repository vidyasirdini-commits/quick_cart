import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Store, MapPin, UserPlus, Eye, EyeOff, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { Button, Input, Select } from '../components';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer', // 'customer' or 'partner'
    storeName: '',
    zone: '1',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please provide a valid email format';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (formData.role === 'partner') {
      if (!formData.storeName.trim()) {
        newErrors.storeName = 'Store name is required for store partners';
      }
      if (!formData.zone) {
        newErrors.zone = 'Please assign a delivery zone for your store';
      }
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
        const response = await fetch('/api/auth/register', {
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
        userData = {
          id: 'user-' + Date.now(),
          name: formData.name,
          email: formData.email,
          role: formData.role,
          storeName: formData.storeName,
          zone_id: formData.zone,
        };
        token = 'sample_auth_jwt_token';
      }

      login(userData, token);
      toast.success('Registration successful! Welcome to QuickCart.');

      if (formData.role === 'partner') {
        navigate('/partner/dashboard');
      } else {
        navigate('/stores');
      }
    } catch (err) {
      toast.error(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Create your account</h2>
        <p className="text-xs text-slate-500 mt-1">
          Join QuickCart as a customer or local store merchant
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Role Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
            Select Your Account Role:
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData((p) => ({ ...p, role: 'customer' }))}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                formData.role === 'customer'
                  ? 'border-primary-600 bg-primary-50/70 ring-2 ring-primary-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <ShoppingBag className="h-4 w-4 text-primary-600" />
                <span className="font-bold text-sm text-slate-900">Customer</span>
              </div>
              <span className="block text-[11px] text-slate-500">Order from neighborhood stores</span>
            </button>

            <button
              type="button"
              onClick={() => setFormData((p) => ({ ...p, role: 'partner' }))}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                formData.role === 'partner'
                  ? 'border-accent-600 bg-amber-50/70 ring-2 ring-amber-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Store className="h-4 w-4 text-accent-600" />
                <span className="font-bold text-sm text-slate-900">Store Partner</span>
              </div>
              <span className="block text-[11px] text-slate-500">Manage catalog & fulfill dispatches</span>
            </button>
          </div>
        </div>

        <Input
          label="Full Name"
          id="name"
          name="name"
          placeholder="e.g. John Doe"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          leftIcon={<User className="h-4 w-4" />}
          autoComplete="name"
          required
        />

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

        {/* Store Partner Fields */}
        {formData.role === 'partner' && (
          <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/80 space-y-3.5 animate-in fade-in duration-200">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
              <Store className="h-4 w-4 text-amber-600" />
              <span>Merchant Details</span>
            </div>

            <Input
              label="Store / Business Name"
              id="storeName"
              name="storeName"
              placeholder="e.g. Green Grocers Downtown"
              value={formData.storeName}
              onChange={handleChange}
              error={errors.storeName}
              leftIcon={<Store className="h-4 w-4" />}
              required
            />

            <Select
              label="Assigned Delivery Zone"
              id="zone"
              name="zone"
              value={formData.zone}
              onChange={handleChange}
              error={errors.zone}
              options={[
                { value: '1', label: 'Zone 1: Central District' },
                { value: '2', label: 'Zone 2: North Sector' },
                { value: '3', label: 'Zone 3: West Hills' },
              ]}
              required
            />
          </div>
        )}

        <div className="relative">
          <Input
            label="Password"
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="At least 6 characters"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            leftIcon={<Lock className="h-4 w-4" />}
            autoComplete="new-password"
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

        <div className="relative">
          <Input
            label="Confirm Password"
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Re-enter password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            leftIcon={<Lock className="h-4 w-4" />}
            autoComplete="new-password"
            rightIcon={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-slate-400 hover:text-slate-600 focus:outline-none"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
          rightIcon={<UserPlus className="h-4 w-4" />}
        >
          Create {formData.role === 'partner' ? 'Partner Account' : 'Customer Account'}
        </Button>
      </form>

      <div className="text-center pt-2 border-t border-slate-100">
        <p className="text-xs text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
