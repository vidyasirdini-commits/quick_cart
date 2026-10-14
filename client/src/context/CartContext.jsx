import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartState, setCartState] = useState(() => {
    try {
      const saved = localStorage.getItem('quickcart_cart');
      return saved ? JSON.parse(saved) : { store: null, items: [] };
    } catch {
      return { store: null, items: [] };
    }
  });

  const [conflictModal, setConflictModal] = useState({
    isOpen: false,
    pendingItem: null,
    pendingStore: null,
  });

  useEffect(() => {
    try {
      localStorage.setItem('quickcart_cart', JSON.stringify(cartState));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cartState]);

  const addToCart = (product, store, qty = 1) => {
    if (cartState.store && cartState.store.id !== store.id && cartState.items.length > 0) {
      // Trigger conflict modal
      setConflictModal({
        isOpen: true,
        pendingItem: { ...product, qty },
        pendingStore: store,
      });
      return false;
    }

    setCartState((prev) => {
      const existingIndex = prev.items.findIndex((item) => item.id === product.id);
      let updatedItems;

      if (existingIndex > -1) {
        updatedItems = [...prev.items];
        const newQty = Math.min(
          updatedItems[existingIndex].qty + qty,
          product.stock_qty || 99
        );
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          qty: newQty,
        };
      } else {
        updatedItems = [
          ...prev.items,
          {
            id: product.id,
            name: product.name,
            price: Number(product.price),
            image_url: product.image_url,
            stock_qty: product.stock_qty,
            qty: Math.min(qty, product.stock_qty || 99),
          },
        ];
      }

      return {
        store: store,
        items: updatedItems,
      };
    });

    return true;
  };

  const resolveConflict = (proceedWithNewStore) => {
    if (proceedWithNewStore && conflictModal.pendingItem && conflictModal.pendingStore) {
      setCartState({
        store: conflictModal.pendingStore,
        items: [
          {
            id: conflictModal.pendingItem.id,
            name: conflictModal.pendingItem.name,
            price: Number(conflictModal.pendingItem.price),
            image_url: conflictModal.pendingItem.image_url,
            stock_qty: conflictModal.pendingItem.stock_qty,
            qty: conflictModal.pendingItem.qty || 1,
          },
        ],
      });
    }
    setConflictModal({ isOpen: false, pendingItem: null, pendingStore: null });
  };

  const updateQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartState((prev) => {
      const updatedItems = prev.items.map((item) => {
        if (item.id === productId) {
          return {
            ...item,
            qty: Math.min(newQty, item.stock_qty || 99),
          };
        }
        return item;
      });

      return { ...prev, items: updatedItems };
    });
  };

  const removeFromCart = (productId) => {
    setCartState((prev) => {
      const updated = prev.items.filter((item) => item.id !== productId);
      return {
        store: updated.length === 0 ? null : prev.store,
        items: updated,
      };
    });
  };

  const clearCart = () => {
    setCartState({ store: null, items: [] });
  };

  const itemCount = cartState.items.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = cartState.items.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <CartContext.Provider
      value={{
        store: cartState.store,
        items: cartState.items,
        itemCount,
        subtotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        conflictModal,
        resolveConflict,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
