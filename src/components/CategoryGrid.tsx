import React from 'react';
import { Utensils, Pill, Shirt, ShoppingBag, ArrowLeft } from 'lucide-react';
import { CategoryType } from '../types';

interface CategoryItem {
  id: CategoryType;
  title: string;
  orderNumber: number;
  subtitle: string;
  description: string;
  image: string;
  badge: string;
  actionText: string;
  icon: React.ReactNode;
}

const CATEGORIES: CategoryItem[] = [
  {
    id: 'food',
    orderNumber: 1,
    title: 'الطعام',
    subtitle: 'وجبات ومشاوي طازجة',
    description: 'كباب، برغر، بيتزا، تاكوس، لحوم مشوية، أطباق الأرز الفاخرة، وكسكس مغاربي أصيل.',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
    badge: '10 وجبات مميزة',
    actionText: 'تصفح الوجبات',
    icon: <Utensils className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-700" />,
  },
  {
    id: 'medicine',
    orderNumber: 2,
    title: 'الأدوية',
    subtitle: 'شراء آمن من الصيدليات',
    description: 'اكتب اسم دوائك أو ارفع وصفتك الطبية وسنقوم بشرائها وتوصيلها بسرية وأمان.',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
    badge: 'خدمة معتمدة وسرية',
    actionText: 'اطلب دواءً الآن',
    icon: <Pill className="w-4 h-4 sm:w-5 sm:h-5 text-teal-700" />,
  },
  {
    id: 'clothes',
    orderNumber: 3,
    title: 'الملابس',
    subtitle: 'ابحث عن أي قطعة أزياء',
    description: 'أرفق صورة القطعة التي تبحث عنها، المقاس، اللون والميزانية وسنبحث عنها في الأسواق.',
    image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80',
    badge: 'بالصورة والمقاس',
    actionText: 'ابحث عن قطعة',
    icon: <Shirt className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-700" />,
  },
  {
    id: 'other',
    orderNumber: 4,
    title: 'الطلبات الأخرى',
    subtitle: 'بقالة، أجهزة، هدايا...',
    description: 'إكسسوارات، تموينات، أدوات منزلية، هدايا خاصة، أو أي غرض تود شراؤه من المتاجر.',
    image: 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?auto=format&fit=crop&w=800&q=80',
    badge: 'أي منتج يخطر ببالك',
    actionText: 'اطلب أي منتج',
    icon: <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-amber-800" />,
  },
];

interface CategoryGridProps {
  onSelectCategory: (categoryId: CategoryType) => void;
  selectedCategory: string | null;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  onSelectCategory,
  selectedCategory,
}) => {
  return (
    <section id="categories-section" className="py-10 sm:py-16 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-3">
            <span>الأقسام الرئيسية</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            ماذا تحب أن نشتري لك اليوم؟
          </h2>
          <p className="mt-2 text-stone-700 text-sm sm:text-base">
            اختر أحد الأقسام الأربعة، وأضف طلباتك إلى السلة لتصلك أينما كنت
          </p>
        </div>

        {/* 2-Column Grid (2 per row, 2 rows in total) */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;

            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`group relative rounded-2xl sm:rounded-3xl border transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'ring-3 ring-emerald-600 border-emerald-500 shadow-xl bg-white'
                    : 'bg-white hover:bg-emerald-50/20 border-stone-200/90 hover:border-emerald-300 shadow-sm hover:shadow-lg'
                }`}
              >
                {/* Image Container with subtle gradient overlay */}
                <div className="relative h-32 sm:h-52 w-full overflow-hidden bg-stone-100">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                  {/* Category Number & Badge */}
                  <div className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 flex items-center gap-1.5">
                    <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/90 backdrop-blur-xs text-stone-900 text-xs sm:text-sm font-black flex items-center justify-center shadow-xs">
                      {cat.orderNumber}
                    </span>
                    <span className="hidden sm:inline-block px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold">
                      {cat.badge}
                    </span>
                  </div>

                  {/* Title on Image for Mobile */}
                  <div className="absolute bottom-2.5 right-2.5 left-2.5 sm:bottom-4 sm:right-4 sm:left-4">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-white">
                      <div className="p-1 sm:p-1.5 rounded-lg bg-white/90 backdrop-blur-xs">
                        {cat.icon}
                      </div>
                      <h3 className="text-base sm:text-2xl font-black drop-shadow-xs">
                        {cat.title}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Card Content & Action Button */}
                <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-xs font-bold text-emerald-800 hidden sm:block">
                      {cat.subtitle}
                    </span>
                    <p className="text-[11px] sm:text-sm text-stone-700 leading-snug line-clamp-2 mt-1">
                      {cat.description}
                    </p>
                  </div>

                  {/* Button */}
                  <button
                    type="button"
                    className={`w-full py-2 sm:py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 shadow-xs ${
                      isSelected
                        ? 'bg-emerald-700 text-white shadow-emerald-700/20'
                        : 'bg-emerald-50 text-emerald-800 group-hover:bg-emerald-700 group-hover:text-white'
                    }`}
                  >
                    <span>{cat.actionText}</span>
                    <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:-translate-x-1" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
