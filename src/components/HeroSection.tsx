import React from 'react';
import { ShoppingBag, ArrowDown, CheckCircle2, Clock, ShieldCheck, Sparkles } from 'lucide-react';
import { StoreSettings } from '../types';

interface HeroSectionProps {
  settings: StoreSettings;
  onBrowseCategories: () => void;
  onOpenWhatsApp: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  settings,
  onBrowseCategories,
  onOpenWhatsApp,
}) => {
  return (
    <section className="relative overflow-hidden pt-8 pb-14 sm:pt-12 sm:pb-20 bg-gradient-to-b from-emerald-50/60 via-[#FAF8F5] to-[#FAF8F5]">
      {/* Decorative ambient blobs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-200/25 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-10 left-10 w-72 h-72 bg-amber-200/25 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/90 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-bold shadow-xs">
            <Sparkles className="w-4 h-4 text-emerald-600 animate-spin-slow" />
            <span>خدمة التسوّق والشراء بالنيابة والتوصيل المباشر</span>
          </div>

          {/* Main Title & Slogan */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-stone-900 tracking-tight leading-tight sm:leading-none">
              مرحبًا بك في{' '}
              <span className="text-emerald-700 underline decoration-amber-400 decoration-wavy decoration-2 underline-offset-8">
                {settings.storeName || 'طلباتي'}
              </span>
            </h1>
            <p className="text-xl sm:text-2xl font-bold text-emerald-800/90 font-serif">
              «{settings.tagline || 'أنت تطلب، ونحن نتكفّل بالباقي'}»
            </p>
          </div>

          {/* Description */}
          <p className="text-base sm:text-lg text-stone-700 max-w-2xl mx-auto leading-relaxed font-medium">
            اطلب طعامك أو ملابسك أو أي شيء تحتاجه، وسنتولى شراءه وتوصيله إليك. نتحقق من الأسعار والتوفر ونتواصل معك لتأكيد كل التفاصيل قبل الشراء.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={onBrowseCategories}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-base shadow-lg shadow-emerald-700/25 hover:shadow-emerald-800/35 transition-all flex items-center justify-center gap-2 group active:scale-98"
            >
              <span>تصفح الأقسام واطلب الآن</span>
              <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
            </button>

            <button
              onClick={onOpenWhatsApp}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-stone-50 text-stone-800 font-bold text-base border border-stone-200 shadow-xs hover:border-emerald-300 transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
              <span>طلب خاص عبر واتساب</span>
            </button>
          </div>

          {/* Trust Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-stone-200/70 text-right sm:text-center">
            <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-2xl border border-stone-200/60 flex items-center sm:flex-col gap-3 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-stone-900">موافقة العميل أولاً</h4>
                <p className="text-[11px] sm:text-xs text-stone-700 mt-0.5">لا نشتري إلا بعد اعتمادك للسعر النهائي</p>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-2xl border border-stone-200/60 flex items-center sm:flex-col gap-3 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-stone-900">سرعة في التنفيذ</h4>
                <p className="text-[11px] sm:text-xs text-stone-700 mt-0.5">شراء وتوصيل مرن وسريع لباب بيتك</p>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-2xl border border-stone-200/60 flex items-center sm:flex-col gap-3 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center text-teal-800 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-stone-900">سرية وأمان</h4>
                <p className="text-[11px] sm:text-xs text-stone-700 mt-0.5">خصوصية تامة للوصفات والطلبات الخاصة</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
