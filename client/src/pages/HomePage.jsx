import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, ShieldCheck, Zap, Eye, Store, TrendingUp } from 'lucide-react';
import { Button, Card } from '../components';

export const HomePage = () => {
  return (
    <div className="space-y-16 py-12">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-50 border border-primary-200 text-primary-700 text-xs font-semibold">
            <Zap className="h-3.5 w-3.5 text-primary-600" />
            Hyperlocal Commerce Reimagined
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
            Your neighbourhood, <br />
            <span className="text-primary-600">delivered fast.</span>
          </h1>

          <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            QuickCart unifies inventory synchronization, instant customer ordering, and end-to-end
            transparent order tracking between consumers, local store partners, and delivery executives.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link to="/stores" className="w-full sm:w-auto">
              <Button size="lg" className="w-full" rightIcon={<ArrowRight className="h-5 w-5" />}>
                Start Shopping
              </Button>
            </Link>
            <Link to="/register" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full">
                Become a Store Partner
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* The Problem We Solve */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">The Problem We Solve</h2>
          <p className="text-slate-500 text-sm mt-2">
            Eliminating fragmented communication and manual disconnects in local commerce.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="w-12 h-12 rounded-xl bg-danger-50 text-danger-600 flex items-center justify-center mb-4">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Stock Out of Sync</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Disjointed systems lead to orders placed for out-of-stock items, resulting in high
              cancellation rates and disappointed shoppers.
            </p>
          </Card>

          <Card className="p-6">
            <div className="w-12 h-12 rounded-xl bg-accent-50 text-accent-600 flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Slow Order Fulfilment</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Manual communication bottlenecks between stores and couriers drag down fulfillment
              turnaround time and hurt daily efficiency.
            </p>
          </Card>

          <Card className="p-6">
            <div className="w-12 h-12 rounded-xl bg-info-50 text-info-600 flex items-center justify-center mb-4">
              <Eye className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">No Delivery Visibility</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Customers and managers are left guessing order whereabouts without standardized status
              transitions and timestamped audits.
            </p>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-slate-100/60 py-16 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">How It Works</h2>
            <p className="text-slate-500 text-sm mt-2">
              From shelf to doorstep in four synchronized steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Browse Local Stores',
                desc: 'Discover nearby grocers, bakeries, and markets in your assigned delivery zone.',
              },
              {
                step: '02',
                title: 'Place Order',
                desc: 'Add real-time verified in-stock items and checkout with your delivery address.',
              },
              {
                step: '03',
                title: 'Store Accepts & Packs',
                desc: 'Store partners accept incoming orders and package goods for executive dispatch.',
              },
              {
                step: '04',
                title: 'Track to Your Door',
                desc: 'Live stage timeline from out-for-delivery handover to doorstep completion.',
              },
            ].map((item) => (
              <div key={item.step} className="bg-white p-6 rounded-2xl border border-slate-200 relative">
                <span className="text-3xl font-extrabold text-primary-200">{item.step}</span>
                <h3 className="text-base font-bold text-slate-900 mt-2 mb-1">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Built for Everyone */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Built for Everyone</h2>
          <p className="text-slate-500 text-sm mt-2">
            Dedicated experiences tuned for every role in the hyperlocal ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 border-t-4 border-t-primary-500">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Customers</h3>
            <p className="text-sm text-slate-600">
              Transparent live order tracking, guaranteed stock availability, and reliable local
              neighborhood delivery.
            </p>
            <Link to="/stores" className="inline-flex items-center text-xs font-semibold text-primary-600 mt-4">
              Explore stores <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </Card>

          <Card className="p-6 border-t-4 border-t-accent-500">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Store Partners</h3>
            <p className="text-sm text-slate-600">
              Live stock and order control, instant one-click accept or reject, and seamless
              dispatch handover.
            </p>
            <Link to="/register" className="inline-flex items-center text-xs font-semibold text-accent-600 mt-4">
              Partner with us <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </Card>

          <Card className="p-6 border-t-4 border-t-info-500">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Administrators</h3>
            <p className="text-sm text-slate-600">
              Centralized platform telemetry, zone allocations, transaction audits, and order
              completion analytics.
            </p>
            <Link to="/login" className="inline-flex items-center text-xs font-semibold text-info-600 mt-4">
              Admin console <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
