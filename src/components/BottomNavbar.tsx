import React from 'react';
import { Home, ShoppingCart, MessageCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { StoreSettings } from '../types';
import { formatWhatsAppUrl } from '../utils/whatsapp';

interface BottomNavbarProps {
  settings: StoreSettings;
}

export const BottomNavbar: React.FC<BottomNavbarProps> = ({ settings }) => {
  const {
    itemCount,
    setIsCartOpen,
    activeTab,
    setActiveTab,
    setSelectedCategory,
  } = useCart();

  const handleHomeClick = () => {
    setActiveTab('home');
    setSelectedCategory(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCartClick = () => {
    setIsCartOpen(true);
  };

  const handleContactClick = () => {
    setActiveTab('contact');
    const section = document.getElementById('whatsapp-contact-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    } else {
      const url = formatWhatsAppUrl(
        settings.whatsappNumber || '42481202',
        'مرحبًا «طلباتي»، أود الاستفسار عن خدمة الشراء والتوصيل.'
      );
      window.open(url, '_blank');
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/90 shadow-lg py-2 px-6 sm:hidden">
      <div className="max-w-md mx-auto grid grid-cols-3 gap-2">
        
        {/* 1. الرئيسية */}
        <button
          type="button"
          onClick={handleHomeClick}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
            activeTab === 'home'
              ? 'text-emerald-700 font-black'
              : 'text-stone-700 hover:text-emerald-600'
          }`}
        >
          <div className="relative">
            <Home className={`w-5 h-5 ${activeTab === 'home' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            {activeTab === 'home' && (
              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            )}
          </div>
          <span className="text-[11px] mt-1 font-bold">الرئيسية</span>
        </button>

        {/* 2. السلة */}
        <button
          type="button"
          onClick={handleCartClick}
          className="flex flex-col items-center justify-center py-1 rounded-xl text-stone-700 hover:text-emerald-600 transition-all relative"
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5 stroke-2" />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 bg-emerald-600 text-white font-extrabold text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 border-white px-1 shadow-xs animate-scale-in">
                {itemCount}
              </span>
            )}
          </div>
          <span className="text-[11px] mt-1 font-bold">السلة</span>
        </button>

        {/* 3. تواصل معنا */}
        <button
          type="button"
          onClick={handleContactClick}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
            activeTab === 'contact'
              ? 'text-emerald-700 font-black'
              : 'text-stone-700 hover:text-emerald-600'
          }`}
        >
          <div className="relative">
            <MessageCircle className={`w-5 h-5 ${activeTab === 'contact' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            {activeTab === 'contact' && (
              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            )}
          </div>
          <span className="text-[11px] mt-1 font-bold">تواصل معنا</span>
        </button>

      </div>
    </nav>
  );
};
