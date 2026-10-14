import React, { useState, useEffect } from 'react';
import {
  Check,
  X,
  Package,
  Truck,
  Clock,
  RefreshCw,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { Card, Badge, Button, Modal, Input, EmptyState } from '../components';
import { useToast } from '../components/Toast';
import { formatCurrency, formatDate } from '../utils';

const INITIAL_ORDERS = [
  {
    id: 'ord-101',
    customer: 'Sarah Jenkins',
    phone: '+91 98765 43210',
    delivery_address: 'Flat 402, Green Avenue, Central District',
    total: 270,
    status: 'placed',
    created_at: new Date(Date.now() - 1000 * 60 * 6).toISOString(),
    items: [
      { id: 'i-1', name: 'Organic Whole Milk (1L)', qty: 2, price: 65 },
      { id: 'i-2', name: 'Artisan Sourdough Loaf', qty: 1, price: 140 },
    ],
  },
  {
    id: 'ord-102',
    customer: 'David Kumar',
    phone: '+91 98111 22334',
    delivery_address: 'House #12, 4th Main, Central District',
    total: 360,
    status: 'accepted',
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    items: [
      { id: 'i-3', name: 'Crisp Red Gala Apples (1kg)', qty: 1, price: 190 },
      { id: 'i-4', name: 'Farm Fresh Brown Eggs (Pack of 6)', qty: 2, price: 85 },
    ],
  },
  {
    id: 'ord-103',
    customer: 'Elena Rostova',
    phone: '+91 97234 56789',
    delivery_address: 'Block B-3, Metro Towers, Central District',
    total: 499,
    status: 'packed',
    created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    items: [{ id: 'i-5', name: 'Cold Pressed Olive Oil (500ml)', qty: 1, price: 499 }],
  },
  {
    id: 'ord-104',
    customer: 'Rahul Verma',
    phone: '+91 98450 11223',
    delivery_address: '15/A, Sunrise Apartments, Central District',
    total: 130,
    status: 'delivered',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    items: [{ id: 'i-6', name: 'Organic Whole Milk (1L)', qty: 2, price: 65 }],
  },
];

export const PartnerOrdersPage = () => {
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'in_progress', 'completed'
  const [rejectModal, setRejectModal] = useState({ isOpen: false, orderId: null, reason: '' });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const toast = useToast();

  // Polling every 10 seconds
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders');
        const data = await res.json();
        if (data.success && data.data) {
          setOrders(data.data);
        }
      } catch {
        // Mock fallback
      }
    };

    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusTransition = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
    );

    const labels = {
      accepted: 'Order accepted! Stock decremented.',
      packed: 'Order marked as packed & ready for dispatch.',
      out_for_delivery: 'Dispatched! Handed over to zone delivery executive.',
    };
    toast.success(labels[newStatus] || `Order moved to ${newStatus}`);
  };

  const handleRejectSubmit = () => {
    if (!rejectModal.reason.trim()) {
      toast.error('Please specify a reason for rejecting the order');
      return;
    }

    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === rejectModal.orderId
          ? { ...ord, status: 'rejected', rejectReason: rejectModal.reason }
          : ord
      )
    );
    toast.warning(`Order #${rejectModal.orderId} rejected.`);
    setRejectModal({ isOpen: false, orderId: null, reason: '' });
  };

  const pendingOrders = orders.filter((o) => o.status === 'placed');
  const inProgressOrders = orders.filter((o) => ['accepted', 'packed'].includes(o.status));
  const completedOrders = orders.filter((o) =>
    ['out_for_delivery', 'delivered', 'rejected', 'cancelled'].includes(o.status)
  );

  const getVisibleOrders = () => {
    if (activeTab === 'pending') return pendingOrders;
    if (activeTab === 'in_progress') return inProgressOrders;
    return completedOrders;
  };

  const visibleList = getVisibleOrders();

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Order Fulfillment Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Accept incoming requests, verify inventory, pack goods, and handover to couriers.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsRefreshing(true);
            setTimeout(() => {
              setIsRefreshing(false);
              toast.info('Orders list updated');
            }, 500);
          }}
          className="inline-flex items-center gap-1.5 text-xs text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-primary-600 ${isRefreshing ? 'animate-spin' : ''}`} />
          Auto-polling Active (10s)
        </button>
      </div>

      {/* Fulfillment Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'pending'
              ? 'bg-accent-500 text-white shadow-sm shadow-accent-500/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <span>Pending Orders</span>
          {pendingOrders.length > 0 && (
            <span className="bg-white/90 text-accent-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {pendingOrders.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('in_progress')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'in_progress'
              ? 'bg-primary-600 text-white shadow-sm shadow-primary-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <span>In Progress (Packing)</span>
          {inProgressOrders.length > 0 && (
            <span className="bg-white/90 text-primary-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {inProgressOrders.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('completed')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'completed'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <span>Dispatched / History</span>
          <span className="text-slate-400 text-[10px]">({completedOrders.length})</span>
        </button>
      </div>

      {/* Orders List */}
      {visibleList.length === 0 ? (
        <EmptyState
          icon={CheckCircle}
          title={`No ${activeTab.replace('_', ' ')} orders`}
          description="All incoming tasks in this tab have been processed."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {visibleList.map((order) => (
            <Card key={order.id} className="p-5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      #{order.id}
                    </span>
                    <Badge status={order.status} size="sm" />
                  </div>
                  <span className="text-[11px] text-slate-400">{formatDate(order.created_at)}</span>
                </div>

                <div className="border-t border-b border-slate-100 py-2.5">
                  <p className="text-xs font-semibold text-slate-900">{order.customer}</p>
                  <p className="text-[11px] text-slate-500">{order.delivery_address}</p>
                </div>

                {/* Items List */}
                <div className="space-y-1 text-xs">
                  {order.items.map((i) => (
                    <div key={i.id} className="flex justify-between text-slate-700">
                      <span>
                        {i.qty}x {i.name}
                      </span>
                      <span className="font-medium text-slate-900">
                        {formatCurrency(i.price * i.qty)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons depending on status */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-slate-900">
                  Total: {formatCurrency(order.total)}
                </span>

                <div className="flex items-center gap-2">
                  {order.status === 'placed' && (
                    <>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() =>
                          setRejectModal({ isOpen: true, orderId: order.id, reason: '' })
                        }
                        leftIcon={<X className="h-3.5 w-3.5" />}
                      >
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleStatusTransition(order.id, 'accepted')}
                        leftIcon={<Check className="h-3.5 w-3.5" />}
                      >
                        Accept
                      </Button>
                    </>
                  )}

                  {order.status === 'accepted' && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleStatusTransition(order.id, 'packed')}
                      leftIcon={<Package className="h-3.5 w-3.5" />}
                    >
                      Mark as Packed
                    </Button>
                  )}

                  {order.status === 'packed' && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleStatusTransition(order.id, 'out_for_delivery')}
                      leftIcon={<Truck className="h-3.5 w-3.5" />}
                    >
                      Handover to Delivery
                    </Button>
                  )}

                  {['out_for_delivery', 'delivered', 'rejected', 'cancelled'].includes(
                    order.status
                  ) && (
                    <Badge status={order.status} size="sm">
                      {order.status.replace(/_/g, ' ')}
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Reject Order Modal */}
      <Modal
        isOpen={rejectModal.isOpen}
        onClose={() => setRejectModal({ isOpen: false, orderId: null, reason: '' })}
        title={`Reject Order #${rejectModal.orderId}?`}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setRejectModal({ isOpen: false, orderId: null, reason: '' })}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleRejectSubmit}>
              Confirm Rejection
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600 mb-4">
          Please provide a valid operational reason for rejecting this order (e.g. inventory shortage, store closing, or kitchen capacity limit):
        </p>
        <Input
          placeholder="Reason for rejection (required)..."
          value={rejectModal.reason}
          onChange={(e) =>
            setRejectModal((p) => ({ ...p, reason: e.target.value }))
          }
          required
        />
      </Modal>
    </div>
  );
};

export default PartnerOrdersPage;
