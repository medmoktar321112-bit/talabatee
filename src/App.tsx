import React, { useState, useEffect } from 'react';
import { CartProvider, useCart } from './context/CartContext';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { CategoryGrid } from './components/CategoryGrid';
import { FoodCategory } from './components/FoodCategory';
import { MedicineCategory } from './components/MedicineCategory';
import { ClothesCategory } from './components/ClothesCategory';
import { OtherOrdersCategory } from './components/OtherOrdersCategory';
import { WhatsAppSection } from './components/WhatsAppSection';
import { BottomNavbar } from './components/BottomNavbar';
import { CartModal } from './components/CartModal';
import { AdminPanel } from './components/AdminPanel';
import { NotificationToast } from './components/NotificationToast';
import { DownloadAppModal } from './components/DownloadAppModal';
import { Footer } from './components/Footer';
import { Product, StoreSettings, CategoryType } from './types';
import { fetchSettings, fetchProducts, verifyAdminToken } from './services/api';
import { INITIAL_PRODUCTS, INITIAL_SETTINGS } from './data/initialData';
import { ArrowRight, Layers } from 'lucide-react';

function MainApp() {
  const {
    activeTab,
    setActiveTab,
    selectedCategory,
    setSelectedCategory,
    setIsCartOpen,
  } = useCart();

  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return sessionStorage.getItem('talabatee_admin_token');
  });

  // Load initial settings and products
  useEffect(() => {
    loadInitial();
  }, []);

  // Save admin token to sessionStorage
  useEffect(() => {
    if (adminToken) {
      sessionStorage.setItem('talabatee_admin_token', adminToken);
    } else {
      sessionStorage.removeItem('talabatee_admin_token');
    }
  }, [adminToken]);

  const loadInitial = async () => {
    try {
      const [sData, pData] = await Promise.all([
        fetchSettings(),
        fetchProducts(),
      ]);
      if (sData) setSettings(sData);
      if (pData && pData.length > 0) setProducts(pData);
    } catch (err) {
      console.warn('Using initial fallback data:', err);
    }
  };

  const handleSelectCategory = (cat: CategoryType) => {
    setSelectedCategory(cat);
    // Smooth scroll to category view area
    const viewArea = document.getElementById('active-category-container');
    if (viewArea) {
      viewArea.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBackToAllCategories = () => {
    setSelectedCategory(null);
    const grid = document.getElementById('categories-section');
    if (grid) {
      grid.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-stone-800 font-sans antialiased selection:bg-emerald-500 selection:text-white">
      
      {/* Header */}
      <Header
        settings={settings}
        onOpenAdmin={() => setIsAdminOpen(true)}
        isAdminLoggedIn={!!adminToken}
        onOpenDownload={() => setIsDownloadOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection
          settings={settings}
          onBrowseCategories={() => {
            const el = document.getElementById('categories-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          onOpenWhatsApp={() => {
            const el = document.getElementById('whatsapp-contact-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* 4 Main Categories Grid (2 columns x 2 rows) */}
        <CategoryGrid
          onSelectCategory={handleSelectCategory}
          selectedCategory={selectedCategory}
        />

        {/* Active Category Display Area */}
        <div id="active-category-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 scroll-mt-24">
          {selectedCategory && (
            <div className="mb-6 flex items-center justify-between">
              <button
                type="button"
                onClick={handleBackToAllCategories}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 hover:text-emerald-700 hover:border-emerald-300 font-bold text-xs sm:text-sm shadow-2xs transition-all active:scale-95"
              >
                <ArrowRight className="w-4 h-4" />
                <span>العودة إلى جميع الأقسام الأربعة</span>
              </button>

              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>القسم النشط: </span>
                <span className="text-emerald-800 font-black">
                  {selectedCategory === 'food' && 'الطعام (10 وجبات)'}
                  {selectedCategory === 'medicine' && 'الأدوية'}
                  {selectedCategory === 'clothes' && 'الملابس'}
                  {selectedCategory === 'other' && 'الطلبات الأخرى'}
                </span>
              </div>
            </div>
          )}

          {/* Render Active Category or Food by default */}
          {selectedCategory === 'food' || !selectedCategory ? (
            <FoodCategory products={products} currency={settings.currency} />
          ) : null}

          {selectedCategory === 'medicine' && <MedicineCategory />}

          {selectedCategory === 'clothes' && (
            <ClothesCategory currency={settings.currency} />
          )}

          {selectedCategory === 'other' && (
            <OtherOrdersCategory currency={settings.currency} />
          )}
        </div>

        {/* Contact Us via WhatsApp Section */}
        <WhatsAppSection
          settings={settings}
          onOpenAdminSettings={() => {
            setIsAdminOpen(true);
          }}
        />
      </main>

      {/* Footer */}
      <Footer
        settings={settings}
        onSelectCategory={handleSelectCategory}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Sticky Bottom Navigation Bar (3 items: الرئيسية، السلة، تواصل معنا) */}
      <BottomNavbar settings={settings} />

      {/* Shopping Cart Modal / Checkout */}
      <CartModal settings={settings} />

      {/* Admin Panel Modal */}
      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        adminToken={adminToken}
        setAdminToken={setAdminToken}
        settings={settings}
        onSettingsUpdated={(newSettings) => setSettings(newSettings)}
        onProductsUpdated={loadInitial}
      />

      {/* Notification Toast */}
      <NotificationToast />

      {/* Download APK / Project ZIP Modal */}
      <DownloadAppModal
        isOpen={isDownloadOpen}
        onClose={() => setIsDownloadOpen(false)}
      />

    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <MainApp />
    </CartProvider>
  );
}
