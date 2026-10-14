import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  CreditCard,
  CheckCircle2,
  Clock,
  Layers,
  MapPin,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { StatCard, Card } from '../components';
import { adminApi } from '../services';

const DEFAULT_DAILY_ORDERS = [
  { day: 'Mon', orders: 45, volume: 14200 },
  { day: 'Tue', orders: 52, volume: 16800 },
  { day: 'Wed', orders: 58, volume: 19100 },
  { day: 'Thu', orders: 63, volume: 21400 },
  { day: 'Fri', orders: 84, volume: 29500 },
  { day: 'Sat', orders: 96, volume: 34100 },
  { day: 'Sun', orders: 90, volume: 31000 },
];

const DEFAULT_ZONE_ORDERS = [
  { zone: 'Central District', orders: 215 },
  { zone: 'North Sector', orders: 142 },
  { zone: 'West Hills', orders: 98 },
];

const DEFAULT_STATUS_PIE = [
  { name: 'Delivered', value: 340, color: '#16A34A' },
  { name: 'Out for Delivery', value: 45, color: '#2563EB' },
  { name: 'Accepted / Packed', value: 38, color: '#F59E0B' },
  { name: 'Placed', value: 18, color: '#64748B' },
  { name: 'Rejected / Cancelled', value: 14, color: '#DC2626' },
];

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState({
    total_orders: 455,
    gross_volume: 166100,
    completion_rate: '96.2%',
    avg_fulfilment_time_min: '24.5 min',
    daily_orders: DEFAULT_DAILY_ORDERS,
    zone_distribution: DEFAULT_ZONE_ORDERS,
    status_distribution: DEFAULT_STATUS_PIE,
  });

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      try {
        const data = await adminApi.getStats();
        if (isMounted && data) {
          setStats((prev) => ({
            ...prev,
            ...data,
            daily_orders: data.daily_orders || prev.daily_orders,
            zone_distribution: data.zone_distribution || prev.zone_distribution,
            status_distribution: data.status_distribution || prev.status_distribution,
          }));
        }
      } catch {
        // Fallback
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-danger-700 bg-danger-50 px-2.5 py-1 rounded-full">
          Platform Administration
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1.5">
          System Analytics & Telemetry
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Platform-wide transaction volumes, completion efficiency, and delivery zone distribution.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Orders"
          value={String(stats.total_orders)}
          trend={14}
          icon={TrendingUp}
          variant="default"
        />
        <StatCard
          title="Gross Volume"
          value={`₹${Number(stats.gross_volume).toLocaleString('en-IN')}`}
          trend={18}
          icon={CreditCard}
          variant="default"
        />
        <StatCard
          title="Completion Rate"
          value={stats.completion_rate}
          trend={2.4}
          icon={CheckCircle2}
          variant="default"
          subtitle="Fulfilled orders"
        />
        <StatCard
          title="Avg Fulfilment Time"
          value={stats.avg_fulfilment_time_min}
          trend={-8}
          icon={Clock}
          variant="info"
          subtitle="Placed to Delivered"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders per day chart */}
        <Card className="p-6">
          <Card.Title>Weekly Order Growth</Card.Title>
          <Card.Description>Daily completed transactions and checkout load</Card.Description>
          <div className="h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.daily_orders}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#16A34A"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#16A34A' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Orders by zone bar chart */}
        <Card className="p-6">
          <Card.Title>Deliveries by Assigned Zone</Card.Title>
          <Card.Description>Demand density across active delivery territories</Card.Description>
          <div className="h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.zone_distribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="zone" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="orders" fill="#2563EB" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Order Status Breakdown */}
        <Card className="p-6 lg:col-span-2">
          <Card.Title>Status Distribution Breakdown</Card.Title>
          <Card.Description>All historical order states across the platform</Card.Description>
          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-6 mt-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.status_distribution}
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {stats.status_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              {stats.status_distribution.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium text-slate-700">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-900">{item.value} orders</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
