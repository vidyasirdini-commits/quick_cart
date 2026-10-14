import React, { useState } from 'react';
import { Truck, CheckCircle2, MapPin, Store, Phone, Clock, Navigation } from 'lucide-react';
import { Card, Badge, Button, EmptyState } from '../components';
import { useToast } from '../components/Toast';
import { formatCurrency, formatDate } from '../utils';

const INITIAL_TASKS = [
  {
    id: 'ord-849201',
    status: 'packed',
    store_name: 'Fresh Basket Supermarket',
    pickup_address: 'Main Market, Lane 4, Central District',
    customer: 'Sarah Jenkins',
    phone: '+91 98765 43210',
    delivery_address: 'Flat 402, Green Avenue, Central District',
    total: 395,
    items_count: 4,
    created_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
  },
  {
    id: 'ord-850112',
    status: 'out_for_delivery',
    store_name: 'Artisan Daily Bakery',
    pickup_address: 'Baker Street, Corner 12, Central District',
    customer: 'Arun Patel',
    phone: '+91 99887 76655',
    delivery_address: 'Plot 18, Sunset Villa, Central District',
    total: 240,
    items_count: 2,
    created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
  },
  {
    id: 'ord-847290',
    status: 'delivered',
    store_name: 'City Care Pharmacy',
    pickup_address: 'Healthcare Arcade, North Sector',
    customer: 'David Kumar',
    phone: '+91 98111 22334',
    delivery_address: 'House #12, 4th Main, Central District',
    total: 512,
    items_count: 3,
    created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
];

export const DeliveryTasksPage = () => {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'history'
  const toast = useToast();

  const handleUpdateStatus = (taskId, newStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    if (newStatus === 'out_for_delivery') {
      toast.info(`Task #${taskId} is now Out for Delivery`);
    } else if (newStatus === 'delivered') {
      toast.success(`Task #${taskId} marked as Delivered! Great job.`);
    }
  };

  const activeTasks = tasks.filter((t) => ['packed', 'out_for_delivery'].includes(t.status));
  const completedTasks = tasks.filter((t) => t.status === 'delivered');

  const visibleTasks = activeTab === 'active' ? activeTasks : completedTasks;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-info-700 bg-info-50 px-2.5 py-1 rounded-full">
          Courier Operations
        </span>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1.5">
          Assigned Delivery Dispatches
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Pick up packed orders from local store partners and hand off to customers.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('active')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'active'
              ? 'bg-primary-600 text-white shadow-sm shadow-primary-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <span>Active Dispatches</span>
          {activeTasks.length > 0 && (
            <span className="bg-white/90 text-primary-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {activeTasks.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'history'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <span>Delivered Today</span>
          <span className="text-slate-400 text-[10px]">({completedTasks.length})</span>
        </button>
      </div>

      {/* Task Cards */}
      {visibleTasks.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="No dispatches in this list"
          description="You have completed all active deliveries. New orders will appear when packed by store partners."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {visibleTasks.map((task) => (
            <Card key={task.id} className="p-5 sm:p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded">
                      #{task.id}
                    </span>
                    <Badge status={task.status} size="sm" dot />
                  </div>
                  <span className="text-xs font-bold text-slate-900">
                    {formatCurrency(task.total)}
                  </span>
                </div>

                {/* Pickup Address */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <Store className="h-4 w-4 text-primary-600" />
                    <span>Pickup: {task.store_name}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 pl-5.5">{task.pickup_address}</p>
                </div>

                {/* Delivery Address */}
                <div className="bg-primary-50/40 p-3 rounded-xl border border-primary-100 space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span className="flex items-center gap-1.5">
                      <Navigation className="h-4 w-4 text-info-600" />
                      <span>Deliver to: {task.customer}</span>
                    </span>
                    <a
                      href={`tel:${task.phone}`}
                      className="text-primary-600 hover:text-primary-700 flex items-center gap-1 text-[11px]"
                    >
                      <Phone className="h-3 w-3" /> Call
                    </a>
                  </div>
                  <p className="text-[11px] text-slate-600 pl-5.5">{task.delivery_address}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <span className="text-xs text-slate-400">
                  {task.items_count} items • {formatDate(task.created_at)}
                </span>

                <div>
                  {task.status === 'packed' && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleUpdateStatus(task.id, 'out_for_delivery')}
                      leftIcon={<Truck className="h-4 w-4" />}
                    >
                      Start Delivery
                    </Button>
                  )}

                  {task.status === 'out_for_delivery' && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleUpdateStatus(task.id, 'delivered')}
                      leftIcon={<CheckCircle2 className="h-4 w-4" />}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      Mark as Delivered
                    </Button>
                  )}

                  {task.status === 'delivered' && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Completed
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeliveryTasksPage;
