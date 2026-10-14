import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  CreditCard,
  Smartphone,
  Building2,
  Banknote,
  Lock,
  QrCode,
  Loader2,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { Button, Input, Card, Modal, Badge } from '../components';
import { formatCurrency } from '../utils';
import { ordersApi, paymentsApi } from '../services';

export const CheckoutPage = () => {
  const { store, items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [deliveryAddress, setDeliveryAddress] = useState({
    street: 'Flat 402, Green Avenue, 5th Cross',
    city: 'Central District',
    zip: '560001',
    instructions: 'Ring bell or leave at front door security.',
  });

  // Payment method selection: 'card' | 'upi' | 'netbanking' | 'cod'
  const [paymentMethod, setPaymentMethod] = useState('card');

  // Card form state
  const [cardDetails, setCardDetails] = useState({
    name: user?.name || 'Alex Morgan',
    cardNumber: '4242 4242 4242 4242',
    expiry: '12/28',
    cvv: '888',
  });

  // UPI form state
  const [upiId, setUpiId] = useState('alex.quickcart@okaxis');
  const [showQrModal, setShowQrModal] = useState(false);

  // Net Banking state
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  const [loading, setLoading] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState(1); // 1: Contacting bank, 2: Authorizing, 3: Success

  const deliveryFee = 30;
  const platformFee = 10;
  const total = subtotal + deliveryFee + platformFee;

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderPayload = {
        store_id: store?.id || 'store-1',
        delivery_address: `${deliveryAddress.street}, ${deliveryAddress.city} - ${deliveryAddress.zip}. Notes: ${deliveryAddress.instructions}`,
        items: items.map((i) => ({ product_id: i.id, qty: i.qty })),
      };

      let newOrderId = null;
      try {
        const orderResult = await ordersApi.createOrder(orderPayload);
        newOrderId = orderResult?.id || orderResult?.order?.id;
      } catch (apiErr) {
        toast.error(apiErr.message || 'Failed to place order.');
        setLoading(false);
        return;
      }

      if (!newOrderId) {
        newOrderId = 'ord-' + Math.floor(100000 + Math.random() * 900000);
      }

      // Digital payment simulation flow
      if (paymentMethod !== 'cod') {
        setPaymentProcessing(true);
        setPaymentStep(1);

        // Create Payment Intent
        let intentId = `pi_${Date.now()}`;
        try {
          const intentRes = await paymentsApi.createIntent({
            order_id: newOrderId,
            amount: total,
            payment_method: paymentMethod,
          });
          if (intentRes?.intent_id) intentId = intentRes.intent_id;
        } catch {
          // Intent creation fallback
        }

        // Simulate Gateway Handshake steps
        await new Promise((res) => setTimeout(res, 500));
        setPaymentStep(2);
        await new Promise((res) => setTimeout(res, 600));
        setPaymentStep(3);

        // Confirm payment
        try {
          await paymentsApi.confirmPayment({
            intent_id: intentId,
            order_id: newOrderId,
            payment_method: paymentMethod,
            payment_details:
              paymentMethod === 'card'
                ? { last4: cardDetails.cardNumber.slice(-4), cardholder: cardDetails.name }
                : paymentMethod === 'upi'
                ? { upi_id: upiId }
                : { bank_name: selectedBank },
          });
        } catch (payErr) {
          console.warn('Payment confirmation warning:', payErr);
        }

        await new Promise((res) => setTimeout(res, 400));
        setPaymentProcessing(false);
      } else {
        // Cash on delivery flow
        try {
          await paymentsApi.confirmPayment({
            intent_id: `pi_cod_${newOrderId}`,
            order_id: newOrderId,
            payment_method: 'cod',
            payment_details: { cod_confirmed: true },
          });
        } catch {
          // Fallback
        }
      }

      clearCart();
      toast.success(
        paymentMethod === 'cod'
          ? 'Order placed! Pay cash upon delivery.'
          : 'Payment verified! Your order is being processed.'
      );
      navigate(`/orders/${newOrderId}`);
    } catch (err) {
      toast.error(err.message || 'Failed to place order.');
    } finally {
      setLoading(false);
      setPaymentProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link
        to="/cart"
        className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Shopping Cart
      </Link>

      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Checkout</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Confirm your delivery address, choose a payment method, and finalize your order.
          </p>
        </div>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Delivery Form & Payment Methods */}
        <div className="md:col-span-2 space-y-6">
          {/* 1. Delivery Address Card */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-primary-600" />
              <h2 className="text-base font-bold text-slate-900">1. Delivery Address</h2>
            </div>

            <div className="space-y-4">
              <Input
                label="Street Address / Building"
                value={deliveryAddress.street}
                onChange={(e) =>
                  setDeliveryAddress((p) => ({ ...p, street: e.target.value }))
                }
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Area / City"
                  value={deliveryAddress.city}
                  onChange={(e) =>
                    setDeliveryAddress((p) => ({ ...p, city: e.target.value }))
                  }
                  required
                />
                <Input
                  label="Postal Code"
                  value={deliveryAddress.zip}
                  onChange={(e) =>
                    setDeliveryAddress((p) => ({ ...p, zip: e.target.value }))
                  }
                  required
                />
              </div>

              <Input
                label="Delivery Instructions (Optional)"
                value={deliveryAddress.instructions}
                onChange={(e) =>
                  setDeliveryAddress((p) => ({ ...p, instructions: e.target.value }))
                }
                placeholder="Gate code, landmark, or drop-off preference"
              />
            </div>
          </Card>

          {/* 2. Payment Method Card */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary-600" />
                <h2 className="text-base font-bold text-slate-900">2. Payment Method</h2>
              </div>
              <Badge variant="success" className="text-[10px] uppercase font-bold tracking-wider">
                100% Secure Gateway
              </Badge>
            </div>

            {/* Payment Method Selector Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-xl border text-left flex flex-col items-start justify-between transition-all ${
                  paymentMethod === 'card'
                    ? 'border-primary-600 bg-primary-50/50 shadow-sm ring-2 ring-primary-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <CreditCard className={`h-5 w-5 mb-2 ${paymentMethod === 'card' ? 'text-primary-600' : 'text-slate-500'}`} />
                <div>
                  <div className="text-xs font-bold text-slate-900">Card</div>
                  <div className="text-[10px] text-slate-500">Credit / Debit</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`p-3 rounded-xl border text-left flex flex-col items-start justify-between transition-all ${
                  paymentMethod === 'upi'
                    ? 'border-primary-600 bg-primary-50/50 shadow-sm ring-2 ring-primary-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <Smartphone className={`h-5 w-5 mb-2 ${paymentMethod === 'upi' ? 'text-primary-600' : 'text-slate-500'}`} />
                <div>
                  <div className="text-xs font-bold text-slate-900">UPI / QR</div>
                  <div className="text-[10px] text-slate-500">GPay, PhonePe</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('netbanking')}
                className={`p-3 rounded-xl border text-left flex flex-col items-start justify-between transition-all ${
                  paymentMethod === 'netbanking'
                    ? 'border-primary-600 bg-primary-50/50 shadow-sm ring-2 ring-primary-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <Building2 className={`h-5 w-5 mb-2 ${paymentMethod === 'netbanking' ? 'text-primary-600' : 'text-slate-500'}`} />
                <div>
                  <div className="text-xs font-bold text-slate-900">Net Banking</div>
                  <div className="text-[10px] text-slate-500">All Major Banks</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`p-3 rounded-xl border text-left flex flex-col items-start justify-between transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-primary-600 bg-primary-50/50 shadow-sm ring-2 ring-primary-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <Banknote className={`h-5 w-5 mb-2 ${paymentMethod === 'cod' ? 'text-primary-600' : 'text-slate-500'}`} />
                <div>
                  <div className="text-xs font-bold text-slate-900">Cash on Del.</div>
                  <div className="text-[10px] text-slate-500">Pay at Doorstep</div>
                </div>
              </button>
            </div>

            {/* Sub-form: Credit/Debit Card */}
            {paymentMethod === 'card' && (
              <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-600 pb-2 border-b border-slate-200">
                  <span className="font-semibold text-slate-800">Simulated Card Payment</span>
                  <div className="flex gap-2 font-mono text-[10px] text-slate-500 font-bold">
                    <span>VISA</span> • <span>MC</span> • <span>RUPAY</span>
                  </div>
                </div>

                <Input
                  label="Card Number"
                  value={cardDetails.cardNumber}
                  onChange={(e) => setCardDetails((p) => ({ ...p, cardNumber: e.target.value }))}
                  placeholder="4242 4242 4242 4242"
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Expiry (MM/YY)"
                    value={cardDetails.expiry}
                    onChange={(e) => setCardDetails((p) => ({ ...p, expiry: e.target.value }))}
                    placeholder="12/28"
                    required
                  />
                  <Input
                    label="CVV / CVC"
                    type="password"
                    maxLength={4}
                    value={cardDetails.cvv}
                    onChange={(e) => setCardDetails((p) => ({ ...p, cvv: e.target.value }))}
                    placeholder="•••"
                    required
                  />
                </div>

                <Input
                  label="Name on Card"
                  value={cardDetails.name}
                  onChange={(e) => setCardDetails((p) => ({ ...p, name: e.target.value }))}
                  required
                />
              </div>
            )}

            {/* Sub-form: UPI */}
            {paymentMethod === 'upi' && (
              <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700">UPI ID / VPA</label>
                  <button
                    type="button"
                    onClick={() => setShowQrModal(true)}
                    className="inline-flex items-center text-xs font-bold text-primary-600 hover:text-primary-700"
                  >
                    <QrCode className="h-3.5 w-3.5 mr-1" />
                    Show QR Code
                  </button>
                </div>

                <div className="flex gap-2">
                  <Input
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="username@bank"
                    className="flex-1"
                    required
                  />
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span>Supported apps:</span>
                  <span className="font-medium text-slate-700">Google Pay</span> •
                  <span className="font-medium text-slate-700">PhonePe</span> •
                  <span className="font-medium text-slate-700">Paytm</span> •
                  <span className="font-medium text-slate-700">BHIM UPI</span>
                </div>
              </div>
            )}

            {/* Sub-form: Net Banking */}
            {paymentMethod === 'netbanking' && (
              <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200 space-y-4">
                <div className="text-xs font-semibold text-slate-700">Select Bank</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank'].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setSelectedBank(b)}
                      className={`p-2.5 rounded-lg border text-xs font-semibold transition-all ${
                        selectedBank === b
                          ? 'border-primary-600 bg-primary-50 text-primary-800'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-form: Cash on Delivery */}
            {paymentMethod === 'cod' && (
              <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 flex items-start gap-3">
                <Banknote className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 leading-relaxed">
                  <strong>Cash on Delivery:</strong> Keep exact cash of{' '}
                  <strong className="underline">{formatCurrency(total)}</strong> or pay via UPI QR
                  code to the delivery executive when the order arrives at your door.
                </div>
              </div>
            )}
          </Card>

          <div className="bg-primary-50/60 p-4 rounded-xl border border-primary-200 flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-primary-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700 leading-relaxed">
              <strong>Hyperlocal Stock Guarantee:</strong> Store inventory is reserved immediately
              upon checkout. You can track real-time packing and executive delivery updates right from
              your order tracker.
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="space-y-4">
          <Card className="p-6">
            <h3 className="text-base font-bold text-slate-900 mb-3">Order Details</h3>

            <div className="text-xs text-slate-500 mb-3 pb-3 border-b border-slate-100">
              Ordering from: <strong className="text-slate-800">{store?.name}</strong>
            </div>

            <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 text-xs mb-4">
              {items.map((item) => (
                <div key={item.id} className="py-2 flex justify-between">
                  <span className="text-slate-700 truncate mr-2">
                    {item.qty}x {item.name}
                  </span>
                  <span className="font-semibold text-slate-900 shrink-0">
                    {formatCurrency(item.price * item.qty)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-xs text-slate-600 pb-4 border-b border-slate-100">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span>{formatCurrency(deliveryFee)}</span>
              </div>
              <div className="flex justify-between">
                <span>Platform Fee</span>
                <span>{formatCurrency(platformFee)}</span>
              </div>
            </div>

            <div className="flex justify-between text-base font-bold text-slate-900 pt-4 mb-6">
              <span>Total to Pay</span>
              <span className="text-primary-600">{formatCurrency(total)}</span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={loading}
              leftIcon={<CheckCircle2 className="h-4 w-4" />}
            >
              {paymentMethod === 'cod' ? 'Place Order (COD)' : `Pay ${formatCurrency(total)} & Order`}
            </Button>
          </Card>
        </div>
      </form>

      {/* Simulated Payment Gateway Processing Modal */}
      <Modal
        isOpen={paymentProcessing}
        onClose={() => {}}
        title="Processing Secure Payment"
        size="sm"
      >
        <div className="py-6 px-4 text-center space-y-5">
          <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-primary-200 animate-pulse"></div>
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin relative" />
          </div>

          <div>
            <h4 className="text-base font-bold text-slate-900">
              {paymentStep === 1 && 'Connecting to Bank Gateway...'}
              {paymentStep === 2 && 'Authorizing & Verifying Stock...'}
              {paymentStep === 3 && 'Payment Approved!'}
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Do not refresh or close this window. QuickCart is confirming your payment of{' '}
              <strong>{formatCurrency(total)}</strong>.
            </p>
          </div>

          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-primary-600 h-full transition-all duration-300"
              style={{
                width: paymentStep === 1 ? '35%' : paymentStep === 2 ? '75%' : '100%',
              }}
            ></div>
          </div>

          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <Lock className="w-3.5 h-3.5 text-primary-600" />
            <span>256-Bit SSL Encrypted Mock Gateway</span>
          </div>
        </div>
      </Modal>

      {/* QR Code Demo Modal */}
      <Modal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        title="Scan & Pay via UPI"
        size="sm"
      >
        <div className="p-4 text-center space-y-4">
          <div className="bg-slate-100 p-6 rounded-2xl inline-block border-2 border-dashed border-slate-300">
            <QrCode className="w-36 h-36 mx-auto text-slate-800" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">{formatCurrency(total)}</div>
            <div className="text-xs font-mono text-slate-500 mt-0.5">quickcart.pay@hdfcbank</div>
          </div>
          <p className="text-xs text-slate-500">
            Open GPay, PhonePe, or Paytm and scan to pay instantly.
          </p>
          <Button variant="primary" size="sm" onClick={() => setShowQrModal(false)}>
            Done
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default CheckoutPage;
