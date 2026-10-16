import React from 'react';
import { ShoppingBag, Heart, ShieldCheck, Phone, MessageCircle } from 'lucide-react';
import { StoreSettings, CategoryType } from '../types';

interface FooterProps {
  settings: StoreSettings;
  onSelectCategory: (cat: CategoryType) => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  onSelectCategory,
  onOpenAdmin,
}) => {
  return (
    <footer className="bg-stone-900 text-white pt-12 pb-24 sm:pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-stone-800 text-stone-300 text-xs sm:text-sm">
          
          {/* Col 1: Brand Info */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                {settings.storeName || 'طلباتي'}
              </span>
            </div>

            <p className="text-stone-400 max-w-md leading-relaxed">
              «{settings.tagline || 'أنت تطلب، ونحن نتكفّل بالباقي'}»
              <br />
              خدمة تسوق وشراء شخصي وتوصيل متكاملة. نشتري عنك الطعام، الأدوية، الملابس، وأي منتج تحتاجه ونوصله حتى باب بيتك بكل أمان وشفافية.
            </p>

            <div className="flex items-center gap-2 text-stone-400 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>خصوصية تامة، وأسعار شفافة، وموافقة مسبقة قبل الشراء</span>
            </div>
          </div>

          {/* Col 2: Categories */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm">الأقسام الرئيسية</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onSelectCategory('food')}
                  className="hover:text-emerald-400 transition-colors text-right"
                >
                  1. قسم الطعام (10 وجبات مميزة)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('medicine')}
                  className="hover:text-emerald-400 transition-colors text-right"
                >
                  2. قسم الأدوية والصيدلية
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('clothes')}
                  className="hover:text-emerald-400 transition-colors text-right"
                >
                  3. قسم الملابس بالصورة والمقاس
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('other')}
                  className="hover:text-emerald-400 transition-colors text-right"
                >
                  4. قسم الطلبات المتنوعة والخاصة
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Quick Links & Admin */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm">روابط وتواصل</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#whatsapp-contact-section"
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>تواصل عبر واتساب</span>
                </a>
              </li>
              <li>
                <button
                  onClick={onOpenAdmin}
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 text-stone-400"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>لوحة تحكم صاحب المشروع</span>
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-stone-400 text-xs gap-3 text-center sm:text-right">
          <p>
            جميع الحقوق محفوظة © {new Date().getFullYear()} «طلباتي». أنت تطلب، ونحن نتكفّل بالباقي.
          </p>
          <p className="text-[11px]">
            تُنفذ مشتريات الأدوية من خلال صيدليات نظامية مرخصة وفق القوانين المحلية.
          </p>
        </div>
      </div>
    </footer>
  );
};
