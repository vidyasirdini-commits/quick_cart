import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '../components';

export const ForbiddenPage = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 text-center">
      <div className="max-w-md bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-danger-50 text-danger-600 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-danger-600 bg-danger-50 px-3 py-1 rounded-full">
          403 Access Denied
        </span>
        <h2 className="text-2xl font-bold text-slate-900 mt-4 mb-2">Restricted Access</h2>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          You do not have the required permissions or role to view this operational portal. Please
          contact platform administration or sign in with an authorized account.
        </p>
        <Link to="/">
          <Button variant="primary" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Return to Homepage
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ForbiddenPage;
