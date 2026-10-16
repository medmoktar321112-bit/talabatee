import React, { useState } from 'react';
import { Plus, Minus, ShoppingCart, Check, Info } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface FoodCategoryProps {
  products: Product[];
  currency: string;
}

export const FoodCategory: React.FC<FoodCategoryProps> = ({ products, currency }) => {
  const { addItem } = useCart();

  // Local state per product for quantity, notes, and added-animation feedback
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [addedFlags, setAddedFlags] = useState<Record<string, boolean>>({});

  const getQty = (productId: string) => quantities[productId] || 1;
  const getNote = (productId: string) => notes[productId] || '';

  const handleQtyChange = (productId: string, delta: number) => {
    const current = getQty(productId);
    const next = Math.max(1, current + delta);
    setQuantities(prev => ({ ...prev, [productId]: next }));
  };

  const handleNoteChange = (productId: string, value: string) => {
    setNotes(prev => ({ ...prev, [productId]: value }));
  };

  const handleAddToCart = (product: Product) => {
    const qty = getQty(product.id);
    const itemNote = getNote(product.id);

    addItem({
      category: 'food',
      categoryNameArabic: 'طعام',
      title: product.name,
      description: product.description,
      quantity: qty,
      price: product.price,
      notes: itemNote,
      image: product.image,
    });

    // Flash added feedback
    setAddedFlags(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedFlags(prev => ({ ...prev, [product.id]: false }));
    }, 1500);

    // Reset notes or keep? Let's clear notes after adding to allow fresh note next time
    setNotes(prev => ({ ...prev, [product.id]: '' }));
    setQuantities(prev => ({ ...prev, [product.id]: 1 }));
  };

  return (
    <div className="space-y-6">
      {/* Category Header */}
      <div className="bg-white p-5 sm:p-7 rounded-3xl border border-stone-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">قسم الوجبات والمأكولات</span>
          </div>
          <h3 className="text-xl sm:text-3xl font-black text-stone-900 mt-1">
            وجبات شهية ومشاوي طازجة
          </h3>
          <p className="text-xs sm:text-sm text-stone-700 mt-1">
            اختر وجبتك المفضلة، حدد الكمية والملاحظات الخاصة بك، وسنشتريها طازجة ونوصلها ساخنة إليك
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium self-start md:self-auto">
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          <span>تُطبخ وتُشترى من أفضل المطاعم الموثوقة فور اعتماد طلبك</span>
        </div>
      </div>

      {/* Food Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {products.map((product) => {
          const qty = getQty(product.id);
          const note = getNote(product.id);
          const isAdded = addedFlags[product.id];

          return (
            <div
              key={product.id}
              className="bg-white rounded-3xl border border-stone-200/90 hover:border-emerald-300 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
            >
              {/* Product Independent Image */}
              <div className="relative h-48 w-full overflow-hidden bg-stone-100">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                
                {/* Price Tag Badge */}
                <div className="absolute top-3 right-3">
                  {product.price !== null && product.price !== undefined ? (
                    <span className="px-3 py-1 rounded-xl bg-white/95 backdrop-blur-xs text-emerald-800 font-black text-sm shadow-sm flex items-center gap-1">
                      <span>{product.price}</span>
                      <span className="text-[11px] font-bold text-stone-700">{currency}</span>
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-xl bg-stone-900/85 backdrop-blur-xs text-amber-300 font-bold text-xs shadow-sm">
                      السعر يُحدّد عند تأكيد الطلب
                    </span>
                  )}
                </div>

                {/* Name Overlay */}
                <div className="absolute bottom-3 right-3 left-3">
                  <h4 className="text-xl font-black text-white drop-shadow-md">
                    {product.name}
                  </h4>
                </div>
              </div>

              {/* Product Body */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                {/* Description */}
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed min-h-[2.5rem]">
                  {product.description || 'وجبة طازجة محضرة بأعلى معايير الجودة والمذاق الرائع.'}
                </p>

                {/* Notes Input Field */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    ملاحظاتك على الوجبة (اختياري):
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: بدون بصل، زيادة صلصة، حار..."
                    value={note}
                    onChange={(e) => handleNoteChange(product.id, e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-hidden transition-all text-stone-800"
                  />
                </div>

                {/* Quantity Controls & Add to Cart */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-3">
                  {/* Quantity selector */}
                  <div className="flex items-center gap-2 bg-stone-100 rounded-xl p-1 border border-stone-200">
                    <button
                      type="button"
                      onClick={() => handleQtyChange(product.id, -1)}
                      className="w-7 h-7 rounded-lg bg-white hover:bg-stone-200 text-stone-700 flex items-center justify-center font-bold text-sm shadow-2xs transition-colors active:scale-95"
                      title="تقليل الكمية"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center font-black text-sm text-stone-800">
                      {qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleQtyChange(product.id, 1)}
                      className="w-7 h-7 rounded-lg bg-white hover:bg-stone-200 text-stone-700 flex items-center justify-center font-bold text-sm shadow-2xs transition-colors active:scale-95"
                      title="زيادة الكمية"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Add Button */}
                  <button
                    type="button"
                    onClick={() => handleAddToCart(product)}
                    className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs active:scale-95 ${
                      isAdded
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-700/20'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>تمت الإضافة!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        <span>أضف إلى السلة</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
