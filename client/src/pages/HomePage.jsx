import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Zap,
  Eye,
  Store,
  TrendingUp,
  PackageCheck,
  Truck,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Button, Card, Badge } from '../components';

export const HomePage = () => {
  return (
    <div className="space-y-16 sm:space-y-24 py-8 sm:py-12">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headlines & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-50 border border-primary-200 text-primary-700 text-xs font-semibold shadow-xs">
              <Zap className="h-3.5 w-3.5 text-primary-600 animate-pulse" />
              <span>Hyperlocal Delivery Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
              Your neighbourhood, <br />
              <span className="text-primary-600">delivered fast.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              QuickCart is a full-stack, web-based hyperlocal delivery platform bringing inventory
              management, customer ordering, and live end-to-end order tracking into one unified system.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Link to="/stores" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full shadow-md shadow-primary-600/25"
                  rightIcon={<ArrowRight className="h-5 w-5" />}
                >
                  Start Shopping
                </Button>
              </Link>
              <Link to="/register" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="w-full">
                  Become a Store Partner
                </Button>
              </Link>
            </div>

            {/* Quick feature badges */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-primary-600" />
                Live Stock Sync
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-primary-600" />
                Under 30-Min Delivery
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-primary-600" />
                Zero Inventory Mismatch
              </span>
            </div>
          </div>

          {/* Right Column: Interactive Order Visual Mockup */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-2xl shadow-slate-200/60 p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-bold text-slate-900">Live Delivery Tracker</span>
                </div>
                <Badge status="out_for_delivery" size="sm" dot />
              </div>

              {/* Mock Order Card */}
              <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Fresh Basket Supermarket</h4>
                    <p className="text-[11px] text-slate-400">Order #QC-8492 • 3 items</p>
                  </div>
                  <span className="text-xs font-extrabold text-slate-900">₹395.00</span>
                </div>

                {/* Progress Visual */}
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-primary-600 h-full w-3/4 rounded-full transition-all duration-500" />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span className="font-medium text-primary-700 flex items-center gap-1">
                    <Truck className="h-3.5 w-3.5 text-primary-600" /> Courier en route
                  </span>
                  <span>Est. 8 mins</span>
                </div>
              </div>

              {/* Status pills simulation */}
              <div className="space-y-2 pt-1 text-xs">
                <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 text-emerald-800">
                  <span className="flex items-center gap-2 font-medium">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Packed by Store Partner
                  </span>
                  <span className="text-[10px] text-emerald-600">19:12</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-blue-50 text-blue-800">
                  <span className="flex items-center gap-2 font-medium">
                    <Truck className="h-4 w-4 text-blue-600" /> Executive dispatched
                  </span>
                  <span className="text-[10px] text-blue-600">19:20</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: The Problem We Solve */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-danger-600 bg-danger-50 px-3 py-1 rounded-full">
            Pain Points in Hyperlocal Retail
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            The Problem We Solve
          </h2>
          <p className="text-slate-600 text-sm">
            Separate or manual systems cause delays, incorrect stock records, and zero visibility.
            QuickCart fixes the core bottlenecks:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 border-t-4 border-t-danger-500" hover>
            <div className="w-12 h-12 rounded-xl bg-danger-50 text-danger-600 flex items-center justify-center mb-4">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Stock out of sync</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Inventory disconnects result in shoppers purchasing unavailable goods, frequent
              cancellations, and manual refunds that hurt local retailer reputation.
            </p>
          </Card>

          <Card className="p-6 border-t-4 border-t-accent-500" hover>
            <div className="w-12 h-12 rounded-xl bg-accent-50 text-accent-600 flex items-center justify-center mb-4">
              <Clock className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Slow order fulfilment</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Order handover delays between busy merchants and delivery executives stall prep times
              and create logistical bottlenecks during peak hours.
            </p>
          </Card>

          <Card className="p-6 border-t-4 border-t-info-500" hover>
            <div className="w-12 h-12 rounded-xl bg-info-50 text-info-600 flex items-center justify-center mb-4">
              <Eye className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">No delivery visibility</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Fragmented communication leaves customers guessing order status, while store managers
              lack unified telemetry on transit handoffs and courier progress.
            </p>
          </Card>
        </div>
      </section>

      {/* Section: How It Works */}
      <section className="bg-slate-100/70 py-16 sm:py-20 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary-700 bg-primary-100/60 px-3 py-1 rounded-full">
              Fulfillment Journey
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">How It Works</h2>
            <p className="text-slate-600 text-sm">
              A synchronized 4-stage flow designed to eliminate delays and stock mismatches.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Browse local stores',
                desc: 'Explore neighborhood supermarkets, bakeries, and pharmacies in your assigned delivery zone.',
                icon: Store,
              },
              {
                step: '02',
                title: 'Place order',
                desc: 'Add verified in-stock items with automatic single-store validation and fast checkout.',
                icon: ShoppingBag,
              },
              {
                step: '03',
                title: 'Store accepts and packs',
                desc: 'Store partner confirms incoming orders, updates inventory, and bags items for dispatch.',
                icon: PackageCheck,
              },
              {
                step: '04',
                title: 'Track to your door',
                desc: 'Live status timeline and timestamped audit logs from courier pickup to your doorstep.',
                icon: Truck,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-3xl font-extrabold text-primary-300 font-mono">
                        {item.step}
                      </span>
                      <div className="p-2.5 rounded-xl bg-primary-50 text-primary-600">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-1.5">{item.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section: Built for Everyone */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
            Role-Based Workspaces
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Built for everyone
          </h2>
          <p className="text-slate-600 text-sm">
            Purpose-built interfaces tailored to each stakeholder in the hyperlocal ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Customers */}
          <Card className="p-6 border-t-4 border-t-primary-500 flex flex-col justify-between" hover>
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-primary-700 bg-primary-50 px-2 py-0.5 rounded">
                For Shoppers
              </span>
              <h3 className="text-xl font-bold text-slate-900">Customers</h3>
              <p className="text-sm font-semibold text-primary-700">
                Transparent tracking
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Enjoy real-time stage updates from order placement through dispatch handover, with
                zero surprise stockouts and clear delivery timelines.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-slate-100">
              <Link to="/stores">
                <Button variant="secondary" size="sm" className="w-full">
                  Browse Stores
                </Button>
              </Link>
            </div>
          </Card>

          {/* Card 2: Store Partners */}
          <Card className="p-6 border-t-4 border-t-accent-500 flex flex-col justify-between" hover>
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-accent-700 bg-accent-50 px-2 py-0.5 rounded">
                For Merchants
              </span>
              <h3 className="text-xl font-bold text-slate-900">Store Partners</h3>
              <p className="text-sm font-semibold text-accent-700">
                Live stock and order control
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Accept or reject orders with one click, modify stock quantities inline, and manage
                smooth dispatch handovers to delivery couriers.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-slate-100">
              <Link to="/register">
                <Button variant="secondary" size="sm" className="w-full">
                  Partner Sign Up
                </Button>
              </Link>
            </div>
          </Card>

          {/* Card 3: Administrators */}
          <Card className="p-6 border-t-4 border-t-info-500 flex flex-col justify-between" hover>
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-info-700 bg-info-50 px-2 py-0.5 rounded">
                For Operations
              </span>
              <h3 className="text-xl font-bold text-slate-900">Administrators</h3>
              <p className="text-sm font-semibold text-info-700">
                Central dashboard and analytics
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Monitor system-wide transaction volume, allocate regional delivery zones, audit
                fulfillment completion rates, and manage platform users.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-slate-100">
              <Link to="/login">
                <Button variant="secondary" size="sm" className="w-full">
                  Admin Sign In
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
