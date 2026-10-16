import React, { useState } from 'react';
import { ShoppingBag, Upload, X, Plus, Minus, Check, Image as ImageIcon, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { uploadImageFile } from '../services/api';

export const OtherOrdersCategory: React.FC<{ currency: string }> = ({ currency }) => {
  const { addItem } = useCart();

  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [budget, setBudget] = useState('');
  const [notes, setNotes] = useState('');
  const [itemImage, setItemImage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setIsUploading(true);

    try {
      const url = await uploadImageFile(file);
      setItemImage(url);
      setImagePreview(url);
    } catch (err: any) {
      setUploadError(err.message || 'حدث خطأ أثناء تحميل الصورة');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setItemImage(null);
    setImagePreview(null);
    setUploadError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!itemName.trim()) {
      setUploadError('يرجى كتابة اسم المنتج أو وصف ما تريد شراؤه');
      return;
    }

    addItem({
      category: 'other',
      categoryNameArabic: 'طلب آخر',
      title: itemName.trim(),
      description: budget ? `الميزانية التقديرية: ${budget} ${currency}` : 'طلب تسوق مخصص',
      quantity,
      price: budget ? parseFloat(budget) || null : null,
      notes: notes.trim(),
      estimatedBudget: budget.trim() || undefined,
      image: itemImage || 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?auto=format&fit=crop&w=800&q=80',
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
    }, 2500);

    // Reset form
    setItemName('');
    setQuantity(1);
    setBudget('');
    setNotes('');
    setItemImage(null);
    setImagePreview(null);
  };

  return (
    <div className="space-y-6">
      {/* Category Header */}
      <div className="bg-white p-5 sm:p-7 rounded-3xl border border-stone-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">قسم الطلبات المتنوعة</span>
          </div>
          <h3 className="text-xl sm:text-3xl font-black text-stone-900 mt-1">
            طلب أي منتج أو غرض خاص
          </h3>
          <p className="text-xs sm:text-sm text-stone-700 mt-1">
            إكسسوارات، مواد غذائية، أغراض سوبرماركت، أدوات منزلية، هدايا وتغليف... مهما كان طلبك، نحن هنا لشرائه لك
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium self-start md:self-auto">
          <ShoppingBag className="w-4 h-4 text-amber-600 shrink-0" />
          <span>خدمة توصيل شاملة لجميع الاحتياجات</span>
        </div>
      </div>

      {/* Main Request Form */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-8 max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Item Name / Description */}
          <div>
            <label className="block text-sm font-bold text-stone-800 mb-2">
              اسم المنتج أو وصف الغرض المطلوب <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="مثال: شاحن آيفون أصلي، سلة فواكه طازجة، ورد طبيعي مع بطاقة إهداء..."
              value={itemName}
              onChange={(e) => {
                setItemName(e.target.value);
                if (uploadError) setUploadError(null);
              }}
              className="w-full text-sm sm:text-base px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-hidden transition-all text-stone-800"
            />
          </div>

          {/* Quantity & Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Quantity */}
            <div>
              <label className="block text-sm font-bold text-stone-800 mb-2">
                الكمية المطلوبة
              </label>
              <div className="flex items-center justify-between bg-stone-100 rounded-2xl p-2 border border-stone-200">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 rounded-xl bg-white hover:bg-stone-200 text-stone-800 flex items-center justify-center font-bold text-base shadow-2xs transition-colors active:scale-95"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-black text-base text-stone-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-9 h-9 rounded-xl bg-white hover:bg-stone-200 text-stone-800 flex items-center justify-center font-bold text-base shadow-2xs transition-colors active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Approximate Budget */}
            <div>
              <label className="block text-sm font-bold text-stone-800 mb-2">
                الميزانية التقريبية ({currency}) <span className="text-stone-700 font-normal">(اختياري)</span>
              </label>
              <input
                type="number"
                min="0"
                placeholder="مثال: 100"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full text-sm px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-hidden text-stone-800"
              />
            </div>

          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-bold text-stone-800 mb-2">
              ملاحظات وتفاصيل إضافية (اختياري)
            </label>
            <textarea
              rows={3}
              placeholder="مثال: يرجى الشراء من سوبرماركت محدد، أو نوع معين أو ماركة معينة..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-sm px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-hidden transition-all text-stone-800"
            />
          </div>

          {/* Optional Image Upload */}
          <div>
            <label className="block text-sm font-bold text-stone-800 mb-2">
              صورة المنتج، إن توفرت (اختياري)
            </label>

            {!imagePreview ? (
              <label className="border-2 border-dashed border-stone-300 hover:border-amber-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-stone-50/60 hover:bg-amber-50/20 transition-all group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-white border border-stone-200 flex items-center justify-center text-amber-600 group-hover:scale-110 group-hover:border-amber-300 transition-all shadow-xs mb-3">
                  {isUploading ? (
                    <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Upload className="w-6 h-6" />
                  )}
                </div>
                <span className="text-sm font-bold text-stone-800 group-hover:text-amber-700">
                  {isUploading ? 'جارٍ رفع الصورة...' : 'اضغط هنا لرفع صورة توضيحية للمنتج'}
                </span>
                <span className="text-xs text-stone-700 mt-1">
                  صورة من الإنترنت أو تصوير للمنتج المطلوب
                </span>
              </label>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-amber-200 bg-amber-50/30 p-3 flex items-center gap-4">
                <img
                  src={imagePreview}
                  alt="معاينة المنتج"
                  className="w-20 h-20 object-cover rounded-xl border border-stone-200"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <ImageIcon className="w-4 h-4 text-amber-600" />
                    <span>تم رفع صورة المنتج بنجاح</span>
                  </div>
                  <p className="text-xs text-stone-700 mt-0.5">
                    ستظهر الصورة في سلة المشتريات ولدى المندوب لتأمين المنتج بدقة
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="p-2 rounded-xl bg-white text-stone-700 hover:text-red-600 hover:bg-red-50 border border-stone-200 transition-all"
                  title="حذف الصورة"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {uploadError && (
              <p className="text-xs text-red-600 font-bold mt-2">{uploadError}</p>
            )}
          </div>

          {/* Submit / Add to cart */}
          <button
            type="submit"
            disabled={isUploading}
            className={`w-full py-4 px-6 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-2 shadow-md active:scale-98 ${
              isSuccess
                ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                : 'bg-amber-700 hover:bg-amber-800 text-white shadow-amber-700/25'
            }`}
          >
            {isSuccess ? (
              <>
                <Check className="w-5 h-5" />
                <span>تمت إضافة الطلب إلى السلة بنجاح!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>أضف هذا الطلب إلى السلة</span>
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
};
