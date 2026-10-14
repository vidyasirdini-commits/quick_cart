import React from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  IndianRupee,
  ArrowRight,
  Eye,
  Boxes,
} from 'lucide-react';
import { StatCard, Card, Badge, Button } from '../components';
import { formatCurrency, formatDate } from '../utils';

export const PartnerDashboardPage = () => {
  const stats = [
    { title: 'Pending Orders', value: '4', icon: Clock, trend: 12, variant: 'accent' },
    { title: "Today's Orders", value: '28', icon: CheckCircle, trend: 8, variant: 'default' },
    { title: 'Low Stock Alerts', value: '3', icon: AlertTriangle, trend: -5, variant: 'danger' },
    { title: "Today's Revenue", value: '₹14,250', icon: IndianRupee, trend: 15, variant: 'default' },
  ];

  const recentOrders = [
    {
      id: 'ord-901',
      customer: 'Sarah Jenkins',
      items_summary: '2x Milk, 1x Bread',
      total: 205,
      status: 'placed',
      created_at: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    },
    {
      id: 'ord-899',
      customer: 'David Kumar',
      items_summary: '1x Organic Eggs, 2x Apples',
      total: 335,
      status: 'accepted',
      created_at: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    },
    {
      id: 'ord-895',
      customer: 'Elena Rostova',
      items_summary: '1x Olive Oil, 1x Avocados',
      total: 739,
      status: 'packed',
      created_at: new Date(Date.now() - 1000 * 60 * 32).toISOString(),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-accent-700 bg-accent-50 px-2.5 py-1 rounded-full">
            Store Partner Hub
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1.5">
            Store Overview & Operations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time fulfillment metrics, incoming orders and stock sync.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/partner/inventory">
            <Button variant="secondary" size="sm" leftIcon={<Boxes className="h-4 w-4" />}>
              Manage Stock
            </Button>
          </Link>
          <Link to="/partner/orders">
            <Button variant="primary" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Fulfill Orders
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s) => (
          <StatCard
            key={s.title}
            title={s.title}
            value={s.value}
            icon={s.icon}
            trend={s.trend}
            variant={s.variant}
          />
        ))}
      </div>

      {/* Recent Orders Action Table */}
      <Card>
        <Card.Header className="flex items-center justify-between">
          <div>
            <Card.Title>Recent Incoming Orders</Card.Title>
            <Card.Description>Review orders awaiting acceptance or packing.</Card.Description>
          </div>
          <Link to="/partner/orders">
            <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
              View All
            </Button>
          </Link>
        </Card.Header>

        <div className="divide-y divide-slate-100 overflow-x-auto">
          {recentOrders.map((ord) => (
            <div
              key={ord.id}
              className="p-4 sm:px-6 flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                    #{ord.id}
                  </span>
                  <Badge status={ord.status} size="sm" />
                  <span className="text-xs font-medium text-slate-700">{ord.customer}</span>
                </div>
                <p className="text-xs text-slate-500">{ord.items_summary}</p>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <span className="text-sm font-bold text-slate-900">
                    {formatCurrency(ord.total)}
                  </span>
                  <p className="text-[10px] text-slate-400">{formatDate(ord.created_at)}</p>
                </div>
                <Link to="/partner/orders">
                  <Button size="sm" variant="secondary">
                    Review
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default PartnerDashboardPage;
