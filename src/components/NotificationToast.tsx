import React from 'react';
import { CheckCircle2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const NotificationToast: React.FC = () => {
  const { notification, setIsCartOpen } = useCart();

  if (!notification) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 left-4 sm:left-auto sm:right-6 z-50 animate-bounce-subtle">
      <div className="bg-stone-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center justify-between gap-3 border border-stone-800 max-w-md ml-auto">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-bold">{notification}</span>
        </div>

        <button
          onClick={() => setIsCartOpen(true)}
          className="text-xs font-black text-amber-400 hover:text-amber-300 underline whitespace-nowrap"
        >
          عرض السلة
        </button>
      </div>
    </div>
  );
};
