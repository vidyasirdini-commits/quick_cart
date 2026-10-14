import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';
import { Button } from '../components';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 text-center">
      <div className="max-w-md bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-4">
          <FileQuestion className="h-8 w-8" />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
          404 Not Found
        </span>
        <h2 className="text-2xl font-bold text-slate-900 mt-4 mb-2">Page Does Not Exist</h2>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          The hyperlocal page or resource you are looking for might have been removed, had its name
          changed, or is temporarily unavailable.
        </p>
        <Link to="/">
          <Button variant="primary" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back to QuickCart Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
