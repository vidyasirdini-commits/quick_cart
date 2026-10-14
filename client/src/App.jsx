import React from 'react';

function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-slate-200 max-w-md">
        <div className="w-12 h-12 bg-primary text-white rounded-lg flex items-center justify-center mx-auto mb-4 font-bold text-xl">
          QC
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">QuickCart</h1>
        <p className="text-slate-600 text-sm mb-4">
          Hyperlocal delivery platform uniting customers, store partners, admins, and delivery executives.
        </p>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
          Environment Ready
        </span>
      </div>
    </div>
  );
}

export default App;
