import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Eye, Store, ShoppingBag } from 'lucide-react';
import { Badge, Button, Card, EmptyState } from '../components';
import { formatCurrency, formatDate } from '../utils';

const SAMPLE_ORDERS = [
  {
    id: 'ord-849201',
    store_name: 'Fresh Basket Supermarket',
    total: 395,
    status: 'out_for_delivery',
    item_count: 4,
    created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
  },
  {
    id: 'ord-731904',
    store_name: 'Artisan Daily Bakery',
    total: 280,
    status: 'delivered',
    item_count: 2,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'ord-619283',
    store_name: 'City Care Pharmacy',
    total: 512,
    status: 'placed',
    item_count: 3,
    created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
];

export const OrdersPage = () => {
  const [orders] = useState(SAMPLE_ORDERS);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full">
          Customer Portal
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">Your Orders</h1>
        <p className="text-sm text-slate-500 mt-1">
          Review recent transactions and view live step-by-step delivery progress.
        </p>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No orders yet"
          description="You haven't placed any orders yet. Discover items from neighborhood stores."
          action={
            <Link to="/stores">
              <Button variant="primary">Browse Stores</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="p-5 sm:p-6" hover>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      #{order.id}
                    </span>
                    <Badge status={order.status} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{order.store_name}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>{order.item_count} items</span>
                    <span>•</span>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(order.total)}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDate(order.created_at)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link to={`/orders/${order.id}`}>
                    <Button
                      variant="primary"
                      size="sm"
                      rightIcon={<Eye className="h-4 w-4" />}
                    >
                      Track Order
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
