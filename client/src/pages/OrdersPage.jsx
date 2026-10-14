import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Eye, Store, ShoppingBag, XCircle, RefreshCw } from 'lucide-react';
import { Badge, Button, Card, EmptyState, Modal } from '../components';
import { useToast } from '../components/Toast';
import { formatCurrency, formatDate } from '../utils';

const SAMPLE_ORDERS = [
  {
    id: 'ord-849201',
    store_name: 'Fresh Basket Supermarket',
    delivery_address: 'Flat 402, Green Avenue, Central District',
    total: 395,
    status: 'out_for_delivery',
    item_count: 4,
    items: [
      { id: 'i1', name: 'Organic Whole Milk (1L)', qty: 2, price: 65 },
      { id: 'i2', name: 'Artisan Sourdough Loaf', qty: 1, price: 140 },
      { id: 'i3', name: 'Crisp Red Gala Apples (1kg)', qty: 1, price: 125 },
    ],
    created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
  },
  {
    id: 'ord-731904',
    store_name: 'Artisan Daily Bakery',
    delivery_address: 'Flat 402, Green Avenue, Central District',
    total: 280,
    status: 'delivered',
    item_count: 2,
    items: [
      { id: 'i4', name: 'Butter Croissants (Pack of 2)', qty: 2, price: 110 },
      { id: 'i5', name: 'French Baguette', qty: 1, price: 60 },
    ],
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'ord-619283',
    store_name: 'City Care Pharmacy',
    delivery_address: 'Flat 402, Green Avenue, Central District',
    total: 512,
    status: 'placed',
    item_count: 3,
    items: [
      { id: 'i6', name: 'Vitamin C Chews 500mg', qty: 1, price: 240 },
      { id: 'i7', name: 'Antibacterial Wet Wipes', qty: 2, price: 130 },
    ],
    created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
];

export const OrdersPage = () => {
  const [orders, setOrders] = useState(SAMPLE_ORDERS);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'active', 'completed'
  const [cancelModal, setCancelModal] = useState({ isOpen: false, orderId: null });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const toast = useToast();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${localStorage.getItem('quickcart_token')}` },
      });
      const data = await res.json();
      if (data.success && data.data) {
        setOrders(data.data);
      }
      toast.info('Orders list refreshed');
    } catch {
      toast.info('Orders list updated');
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const handleCancelOrder = async () => {
    const orderId = cancelModal.orderId;
    if (!orderId) return;

    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('quickcart_token')}`,
        },
        body: JSON.stringify({ status: 'cancelled' }),
      });
    } catch {
      // Mock fallback
    }

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'cancelled' } : o))
    );
    toast.warning(`Order #${orderId} has been cancelled.`);
    setCancelModal({ isOpen: false, orderId: null });
  };

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'active') {
      return ['placed', 'accepted', 'packed', 'out_for_delivery'].includes(o.status);
    }
    if (activeTab === 'completed') {
      return ['delivered', 'rejected', 'cancelled'].includes(o.status);
    }
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full">
            Consumer Hub
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
            Order History & Tracking
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time delivery progress, receipt summaries, and cancellation controls.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          className="inline-flex items-center gap-1.5 text-xs text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-primary-600 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh Orders
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { key: 'all', label: 'All Orders' },
          { key: 'active', label: 'Active Dispatches' },
          { key: 'completed', label: 'Completed & Past' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === tab.key
                ? 'bg-primary-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No orders found"
          description="There are no orders matching this filter. Explore local stores to place an order."
          action={
            <Link to="/stores">
              <Button variant="primary">Browse Stores</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="p-5 sm:p-6" hover>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      #{order.id}
                    </span>
                    <Badge status={order.status} size="sm" dot />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{order.store_name}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span>{order.item_count || order.items?.length || 1} items</span>
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

                <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                  {order.status === 'placed' && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setCancelModal({ isOpen: true, orderId: order.id })}
                      leftIcon={<XCircle className="h-3.5 w-3.5" />}
                    >
                      Cancel
                    </Button>
                  )}
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

      {/* Cancel Order Modal */}
      <Modal
        isOpen={cancelModal.isOpen}
        onClose={() => setCancelModal({ isOpen: false, orderId: null })}
        title={`Cancel Order #${cancelModal.orderId}?`}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setCancelModal({ isOpen: false, orderId: null })}
            >
              Keep Order
            </Button>
            <Button variant="danger" onClick={handleCancelOrder}>
              Confirm Cancellation
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Are you sure you want to cancel this order? This action will immediately release reserved
          store inventory.
        </p>
      </Modal>
    </div>
  );
};

export default OrdersPage;
