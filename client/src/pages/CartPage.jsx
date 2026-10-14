import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Trash2, Plus, Minus, ArrowRight, Store } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Button, Card, EmptyState } from '../components';
import { formatCurrency } from '../utils';

export const CartPage = () => {
  const { store, items, updateQuantity, removeFromCart, clearCart, subtotal } = useCart();
  const navigate = useNavigate();

  const deliveryFee = items.length > 0 ? 30 : 0;
  const platformFee = items.length > 0 ? 10 : 0;
  const grandTotal = subtotal + deliveryFee + platformFee;

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Your shopping cart is empty"
          description="Browse nearby stores in your zone to add groceries and essentials to your cart."
          action={
            <Link to="/stores">
              <Button variant="primary" leftIcon={<Store className="h-4 w-4" />}>
                Browse Local Stores
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <Link
          to="/stores"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Continue Shopping
        </Link>
        <button
          type="button"
          onClick={clearCart}
          className="text-xs text-danger-600 hover:text-danger-700 font-medium"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-primary-50 text-primary-600">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">{store?.name || 'Local Store'}</h2>
                <p className="text-xs text-slate-500">Single-store direct dispatch</p>
              </div>
            </div>
            <span className="text-xs font-medium text-slate-500">{items.length} items</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm divide-y divide-slate-100 overflow-hidden">
            {items.map((item) => (
              <div key={item.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-100 shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900 truncate">{item.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {formatCurrency(item.price)} each
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="flex items-center gap-1.5 bg-slate-50 rounded-lg p-1 border border-slate-200">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.qty - 1)}
                      className="p-1 rounded text-slate-600 hover:bg-slate-200"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-xs font-bold text-slate-800 px-1.5">{item.qty}</span>
                    <button
                      type="button"
                      disabled={item.qty >= (item.stock_qty || 99)}
                      onClick={() => updateQuantity(item.id, item.qty + 1)}
                      className="p-1 rounded text-slate-600 hover:bg-slate-200 disabled:opacity-30"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <span className="text-sm font-bold text-slate-900 w-16 text-right">
                    {formatCurrency(item.price * item.qty)}
                  </span>

                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-danger-600 hover:bg-danger-50 transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="space-y-4">
          <Card className="p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">Order Summary</h3>

            <div className="space-y-2.5 text-xs text-slate-600 pb-4 border-b border-slate-100">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="font-semibold text-slate-900">{formatCurrency(deliveryFee)}</span>
              </div>
              <div className="flex justify-between">
                <span>Platform Fee</span>
                <span className="font-semibold text-slate-900">{formatCurrency(platformFee)}</span>
              </div>
            </div>

            <div className="flex justify-between text-base font-bold text-slate-900 pt-4 mb-6">
              <span>Total Amount</span>
              <span className="text-primary-600">{formatCurrency(grandTotal)}</span>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              rightIcon={<ArrowRight className="h-4 w-4" />}
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
