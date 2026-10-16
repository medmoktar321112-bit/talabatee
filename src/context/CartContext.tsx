import React, { createContext, useContext, useState, useEffect } from 'react';
import { OrderItem } from '../types';

interface CartContextType {
  items: OrderItem[];
  addItem: (item: Omit<OrderItem, 'id'>) => void;
  updateQuantity: (id: string, delta: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  hasUnpricedItems: boolean;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  activeTab: 'home' | 'cart' | 'contact' | 'admin';
  setActiveTab: (tab: 'home' | 'cart' | 'contact' | 'admin') => void;
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  notification: string | null;
  showNotification: (msg: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'talabatee_cart_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<OrderItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not read cart from localStorage', e);
    }
    return [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'cart' | 'contact' | 'admin'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Could not save cart to localStorage', e);
    }
  }, [items]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 3500);
  };

  const addItem = (newItem: Omit<OrderItem, 'id'>) => {
    const id = `item_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    
    // If it's a food item with the exact same title and notes, increment quantity
    if (newItem.category === 'food') {
      const existingIndex = items.findIndex(
        (i) => i.category === 'food' && i.title === newItem.title && (i.notes || '') === (newItem.notes || '')
      );
      if (existingIndex > -1) {
        setItems((prev) => {
          const updated = [...prev];
          updated[existingIndex].quantity += newItem.quantity;
          return updated;
        });
        showNotification(`تم زيادة كمية «${newItem.title}» في السلة`);
        return;
      }
    }

    setItems((prev) => [...prev, { ...newItem, id }]);
    showNotification(`تمت إضافة «${newItem.title}» إلى السلة بنجاح`);
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as OrderItem[]
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    showNotification('تم إزالة العنصر من السلة');
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce((sum, item) => {
    if (item.price && typeof item.price === 'number') {
      return sum + item.price * item.quantity;
    }
    return sum;
  }, 0);

  const hasUnpricedItems = items.some((item) => item.price === null || item.price === undefined);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        itemCount,
        subtotal,
        hasUnpricedItems,
        isCartOpen,
        setIsCartOpen,
        activeTab,
        setActiveTab,
        selectedCategory,
        setSelectedCategory,
        notification,
        showNotification,
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
