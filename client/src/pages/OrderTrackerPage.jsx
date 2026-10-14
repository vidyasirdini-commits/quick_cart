import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Store,
  MapPin,
  Clock,
  RefreshCw,
  XCircle,
  Truck,
  CheckCircle,
} from 'lucide-react';
import { Stepper, Card, Badge, Button, Modal } from '../components';
import { useToast } from '../components/Toast';
import { formatCurrency, formatDate } from '../utils';

export const OrderTrackerPage = () => {
  const { id } = useParams();
  const toast = useToast();

  const [order, setOrder] = useState({
    id: id || 'ord-849201',
    status: 'out_for_delivery',
    store_name: 'Fresh Basket Supermarket',
    delivery_address: 'Flat 402, Green Avenue, 5th Cross, Central District - 560001',
    total: 395,
    delivery_fee: 30,
    items: [
      { id: 'item-1', name: 'Organic Whole Milk (1L)', qty: 2, price: 65 },
      { id: 'item-2', name: 'Artisan Sourdough Loaf', qty: 1, price: 140 },
      { id: 'item-3', name: 'Crisp Red Gala Apples (1kg)', qty: 1, price: 125 },
    ],
    status_history: [
      {
        id: 'h-1',
        status: 'placed',
        changed_by: 'Customer',
        changed_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
      },
      {
        id: 'h-2',
        status: 'accepted',
        changed_by: 'Store Partner',
        changed_at: new Date(Date.now() - 1000 * 60 * 28).toISOString(),
      },
      {
        id: 'h-3',
        status: 'packed',
        changed_by: 'Store Partner',
        changed_at: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
      },
      {
        id: 'h-4',
        status: 'out_for_delivery',
        changed_by: 'Delivery Executive',
        changed_at: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
      },
    ],
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  // Poll for status update every 10 seconds
  useEffect(() => {
    const fetchOrderStatus = async () => {
      try {
        const response = await fetch(`/api/orders/${id}`);
        const res = await response.json();
        if (res.success && res.data) {
          setOrder(res.data);
        }
      } catch {
        // Fallback in mock mode
      }
    };

    const interval = setInterval(fetchOrderStatus, 10000);
    return () => clearInterval(interval);
  }, [id]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch(`/api/orders/${id}`);
      const res = await response.json();
      if (res.success && res.data) {
        setOrder(res.data);
      }
      toast.info('Order progress updated');
    } catch {
      toast.info('Order details up to date');
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const handleCancelOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('quickcart_token')}`,
        },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      const res = await response.json();
      if (res.success) {
        setOrder((prev) => ({
          ...prev,
          status: 'cancelled',
          status_history: [
            ...prev.status_history,
            {
              id: `h-${Date.now()}`,
              status: 'cancelled',
              changed_by: 'Customer',
              changed_at: new Date().toISOString(),
            },
          ],
        }));
        toast.warning('Order has been cancelled.');
      }
    } catch {
      // Mock cancellation update
      setOrder((prev) => ({
        ...prev,
        status: 'cancelled',
        status_history: [
          ...prev.status_history,
          {
            id: `h-${Date.now()}`,
            status: 'cancelled',
            changed_by: 'Customer',
            changed_at: new Date().toISOString(),
          },
        ],
      }));
      toast.warning('Order marked as cancelled.');
    } finally {
      setCancelModalOpen(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/orders"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          All Orders
        </Link>
        <button
          type="button"
          onClick={handleRefresh}
          className="inline-flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-medium"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          Auto-refreshing (10s)
        </button>
      </div>

      {/* Header Info */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded">
              #{order.id}
            </span>
            <Badge status={order.status} dot />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Order Live Tracker
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Store: {order.store_name}</p>
        </div>

        {order.status === 'placed' && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => setCancelModalOpen(true)}
            leftIcon={<XCircle className="h-4 w-4" />}
          >
            Cancel Order
          </Button>
        )}
      </div>

      {/* Stepper Timeline */}
      <Card className="p-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">
          Fulfillment Journey
        </h2>
        <Stepper currentStatus={order.status} history={order.status_history} />
      </Card>

      {/* Order Details & Address */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Items Summary */}
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">Order Items</h3>
          <div className="divide-y divide-slate-100 text-xs">
            {order.items.map((item) => (
              <div key={item.id} className="py-2.5 flex justify-between items-center">
                <div>
                  <span className="font-semibold text-slate-800">{item.name}</span>
                  <p className="text-[11px] text-slate-500">Qty: {item.qty}</p>
                </div>
                <span className="font-medium text-slate-900">
                  {formatCurrency(item.price * item.qty)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-between text-sm font-bold text-slate-900">
            <span>Total Paid</span>
            <span className="text-primary-600">{formatCurrency(order.total)}</span>
          </div>
        </Card>

        {/* Delivery Details & Timestamp History */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3">
              Delivery Details
            </h3>
            <div className="flex items-start gap-2.5 text-xs text-slate-600">
              <MapPin className="h-4 w-4 text-primary-600 shrink-0 mt-0.5" />
              <span>{order.delivery_address}</span>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3">
              Status Change Audit Log
            </h3>
            <div className="space-y-2 text-xs">
              {order.status_history.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800 capitalize">
                      {h.status.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[10px] text-slate-400">by {h.changed_by}</span>
                  </div>
                  <span className="text-[11px] text-slate-500">{formatDate(h.changed_at)}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel this order?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCancelModalOpen(false)}>
              Keep Order
            </Button>
            <Button variant="danger" onClick={handleCancelOrder}>
              Confirm Cancellation
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Are you sure you want to cancel order #{order.id}? This will immediately release the
          reserved inventory back to the store.
        </p>
      </Modal>
    </div>
  );
};

export default OrderTrackerPage;
