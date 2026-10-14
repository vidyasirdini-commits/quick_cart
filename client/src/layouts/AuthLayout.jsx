import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 group mb-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-600/30 group-hover:bg-primary-700 transition-colors">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-slate-900">
            Quick<span className="text-primary-600">Cart</span>
          </span>
        </Link>
      </div>

      <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-200/80 sm:px-10">
          <Outlet />
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Hyperlocal delivery platform • Protected by Role-Based Access Control
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;
