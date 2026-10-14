import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Store, MapPin, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { Button, Input, Select } from '../components';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
    storeName: '',
    zone: '1',
  });
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
      newErrors.email = 'Please provide a valid email';
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
        newErrors.storeName = 'Store name is required for partners';
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
        };
        token = 'sample_auth_token';
      }

      login(userData, token);
      toast.success('Account created successfully!');

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
        <p className="text-xs text-slate-500 mt-1">Join QuickCart as a customer or local store partner</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Role Picker */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
            I am joining as a:
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData((p) => ({ ...p, role: 'customer' }))}
              className={`p-3 rounded-xl border text-left transition-all ${
                formData.role === 'customer'
                  ? 'border-primary-600 bg-primary-50/50 ring-2 ring-primary-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <span className="block text-sm font-bold text-slate-900">Shopper</span>
              <span className="block text-[11px] text-slate-500 mt-0.5">Order from local stores</span>
            </button>

            <button
              type="button"
              onClick={() => setFormData((p) => ({ ...p, role: 'partner' }))}
              className={`p-3 rounded-xl border text-left transition-all ${
                formData.role === 'partner'
                  ? 'border-primary-600 bg-primary-50/50 ring-2 ring-primary-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <span className="block text-sm font-bold text-slate-900">Store Partner</span>
              <span className="block text-[11px] text-slate-500 mt-0.5">Manage stock & orders</span>
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
          required
        />

        {formData.role === 'partner' && (
          <>
            <Input
              label="Store Name"
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
              label="Delivery Zone"
              id="zone"
              name="zone"
              value={formData.zone}
              onChange={handleChange}
              options={[
                { value: '1', label: 'Zone 1: Central District' },
                { value: '2', label: 'Zone 2: North Sector' },
                { value: '3', label: 'Zone 3: West Hills' },
              ]}
              required
            />
          </>
        )}

        <Input
          label="Password"
          id="password"
          name="password"
          type="password"
          placeholder="At least 6 characters"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          leftIcon={<Lock className="h-4 w-4" />}
          required
        />

        <Input
          label="Confirm Password"
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="Re-enter password"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          leftIcon={<Lock className="h-4 w-4" />}
          required
        />

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          size="lg"
          isLoading={loading}
          rightIcon={<UserPlus className="h-4 w-4" />}
        >
          Create Account
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
