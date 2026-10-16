import React from 'react';
import { ShoppingBag, ShoppingCart, MessageCircle, ShieldCheck, Home, Download } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { StoreSettings } from '../types';

interface HeaderProps {
  settings: StoreSettings;
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
  onOpenDownload: () => void;
}

export const Header: React.FC<HeaderProps> = ({ settings, onOpenAdmin, isAdminLoggedIn, onOpenDownload }) => {
  const { itemCount, setIsCartOpen, activeTab, setActiveTab, setSelectedCategory } = useCart();

  const handleHomeClick = () => {
    setActiveTab('home');
    setSelectedCategory(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleContactClick = () => {
    const section = document.getElementById('whatsapp-contact-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    } else {
      setActiveTab('contact');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Identity */}
          <div
            onClick={handleHomeClick}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            {/* Logo Icon Badge */}
            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-6 h-6 transform -rotate-3" />
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full border-2 border-white shadow-xs"></div>
            </div>

            {/* Logo Text & Tagline */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-stone-900 group-hover:text-emerald-700 transition-colors">
                  {settings.storeName || 'طلباتي'}
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  خدمة شراء وتوصيل
                </span>
              </div>
              <span className="text-xs text-stone-700 font-medium hidden sm:inline-block">
                {settings.tagline || 'أنت تطلب، ونحن نتكفّل بالباقي'}
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={handleHomeClick}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'home'
                  ? 'bg-emerald-50 text-emerald-700 font-bold'
                  : 'text-stone-700 hover:text-emerald-700 hover:bg-stone-50'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>الرئيسية</span>
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('categories-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-stone-700 hover:text-emerald-700 hover:bg-stone-50 transition-colors"
            >
              الأقسام الأربعة
            </button>

            <button
              onClick={handleContactClick}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-stone-700 hover:text-emerald-700 hover:bg-stone-50 transition-colors flex items-center gap-1.5"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>تواصل عبر واتساب</span>
            </button>
          </nav>

          {/* Action Buttons: Download, Admin & Cart */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Download APK / ZIP button */}
            <button
              onClick={onOpenDownload}
              className="px-2.5 sm:px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-all shadow-xs"
              title="تحميل التطبيق أو ملف ZIP"
            >
              <Download className="w-4 h-4 text-amber-700" />
              <span className="hidden xs:inline">تحميل التطبيق / ZIP</span>
            </button>

            {/* Admin Panel Button */}
            <button
              onClick={onOpenAdmin}
              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 border transition-all ${
                isAdminLoggedIn
                  ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 shadow-xs'
                  : 'bg-stone-100/80 text-stone-700 border-stone-200 hover:bg-stone-200/70 hover:text-stone-900'
              }`}
              title="لوحة تحكم صاحب المشروع"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span className="hidden sm:inline">لوحة الإدارة</span>
              {isAdminLoggedIn && (
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
              )}
            </button>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold text-sm shadow-md shadow-emerald-700/20 hover:from-emerald-700 hover:to-teal-800 transition-all flex items-center gap-2 group active:scale-95"
              aria-label="سلة المشتريات"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5 group-hover:rotate-6 transition-transform" />
                {itemCount > 0 && (
                  <span className="absolute -top-2.5 -right-2.5 bg-amber-400 text-stone-900 font-extrabold text-[11px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                    {itemCount}
                  </span>
                )}
              </div>
              <span className="hidden xs:inline">السلة</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
