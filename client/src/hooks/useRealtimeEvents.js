import { useEffect, useRef } from 'react';
import { useToast } from '../components/Toast';

/**
 * Custom hook to subscribe to server-sent events for real-time updates
 */
export const useRealtimeEvents = ({
  onOrderUpdate,
  onNewOrder,
  enabled = true,
  showToasts = true,
} = {}) => {
  const toast = useToast();
  const eventSourceRef = useRef(null);
  const onOrderUpdateRef = useRef(onOrderUpdate);
  const onNewOrderRef = useRef(onNewOrder);

  // Keep callback refs fresh without causing reconnection
  useEffect(() => {
    onOrderUpdateRef.current = onOrderUpdate;
  }, [onOrderUpdate]);

  useEffect(() => {
    onNewOrderRef.current = onNewOrder;
  }, [onNewOrder]);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const token = localStorage.getItem('quickcart_token');
    if (!token) return;

    const apiBase = import.meta.env.VITE_API_BASE_URL || '/api';
    const sseUrl = `${apiBase}/events?token=${encodeURIComponent(token)}`;

    let es = null;
    try {
      es = new EventSource(sseUrl);
      eventSourceRef.current = es;

      es.addEventListener('order_update', (event) => {
        try {
          const data = JSON.parse(event.data);
          if (showToasts && data.message) {
            toast.info(`🔔 ${data.message}`);
          }
          if (onOrderUpdateRef.current) {
            onOrderUpdateRef.current(data);
          }
        } catch (err) {
          console.error('Failed to parse SSE order_update', err);
        }
      });

      es.addEventListener('new_order', (event) => {
        try {
          const data = JSON.parse(event.data);
          if (showToasts) {
            toast.success(`🎉 New Order #${data.orderId} received!`);
          }
          if (onNewOrderRef.current) {
            onNewOrderRef.current(data);
          }
        } catch (err) {
          console.error('Failed to parse SSE new_order', err);
        }
      });

      es.onerror = () => {
        // SSE will automatically attempt reconnection
      };
    } catch (err) {
      console.warn('Could not initialize SSE connection', err);
    }

    return () => {
      if (es) {
        es.close();
      }
      eventSourceRef.current = null;
    };
  }, [enabled, showToasts]);

  return {
    isConnected: !!eventSourceRef.current,
  };
};

export default useRealtimeEvents;
