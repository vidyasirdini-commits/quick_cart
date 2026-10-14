const EventEmitter = require('events');

class QuickCartEventBus extends EventEmitter {
  constructor() {
    super();
    this.clients = new Set();

    // Heartbeat interval to prevent socket timeout
    this.heartbeatTimer = setInterval(() => {
      this.sendHeartbeat();
    }, 25000);

    // Ensure timer doesn't block node process shutdown
    if (this.heartbeatTimer.unref) {
      this.heartbeatTimer.unref();
    }
  }

  /**
   * Register a connected SSE client
   */
  addClient({ id, userId, role, storeId, res }) {
    const client = { id, userId, role, storeId, res };
    this.clients.add(client);

    // Send initial handshake
    this.sendToClient(client, 'connected', {
      status: 'connected',
      clientId: id,
      userId,
      role,
      connectedAt: new Date().toISOString(),
    });

    res.on('close', () => {
      this.clients.delete(client);
    });

    return client;
  }

  /**
   * Send formatted SSE packet
   */
  sendToClient(client, eventType, data) {
    try {
      if (client.res.writableEnded) return;
      client.res.write(`event: ${eventType}\n`);
      client.res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (err) {
      this.clients.delete(client);
    }
  }

  /**
   * Broadcast order status update to relevant parties
   */
  broadcastOrderUpdate(order, message = '') {
    const payload = {
      type: 'order_update',
      orderId: order.id,
      status: order.status,
      deliveryExecId: order.delivery_exec_id,
      storeId: order.store_id,
      customerId: order.customer_id,
      total: order.total,
      message,
      updatedAt: new Date().toISOString(),
    };

    for (const client of this.clients) {
      const isCustomer = client.userId === order.customer_id;
      const isPartner = client.storeId === order.store_id || (client.role === 'partner' && !client.storeId);
      const isCourier = client.userId === order.delivery_exec_id || (client.role === 'delivery' && !order.delivery_exec_id);
      const isAdmin = client.role === 'admin';

      if (isCustomer || isPartner || isCourier || isAdmin) {
        this.sendToClient(client, 'order_update', payload);
      }
    }

    this.emit('order_update', payload);
  }

  /**
   * Broadcast newly placed order to partner and admins
   */
  broadcastNewOrder(order) {
    const payload = {
      type: 'new_order',
      orderId: order.id,
      storeId: order.store_id,
      customerId: order.customer_id,
      total: order.total,
      itemsCount: order.items?.length || 0,
      deliveryAddress: order.delivery_address,
      createdAt: order.created_at || new Date().toISOString(),
    };

    for (const client of this.clients) {
      const isPartner = client.storeId === order.store_id || (client.role === 'partner' && !client.storeId);
      const isAdmin = client.role === 'admin';

      if (isPartner || isAdmin) {
        this.sendToClient(client, 'new_order', payload);
      }
    }

    this.emit('new_order', payload);
  }

  /**
   * Send periodic heartbeat comment to keep SSE connections open
   */
  sendHeartbeat() {
    for (const client of this.clients) {
      try {
        if (!client.res.writableEnded) {
          client.res.write(': keepalive\n\n');
        }
      } catch {
        this.clients.delete(client);
      }
    }
  }

  /**
   * Get active connection count
   */
  getClientCount() {
    return this.clients.size;
  }
}

const eventBus = new QuickCartEventBus();

module.exports = eventBus;
