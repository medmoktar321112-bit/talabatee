import React, { useState } from 'react';
import { Shirt, Upload, X, Plus, Minus, Check, Image as ImageIcon, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { uploadImageFile } from '../services/api';

const COMMON_SIZES = ['S', 'M', 'L', 'XL', 'XXL', '3XL', 'مقاس موحد / فري سايز', 'أطفال'];

export const ClothesCategory: React.FC<{ currency: string }> = ({ currency }) => {
  const { addItem } = useCart();

  const [description, setDescription] = useState('');
  const [size, setSize] = useState('L');
  const [customSize, setCustomSize] = useState('');
  const [color, setColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [budget, setBudget] = useState('');
  const [notes, setNotes] = useState('');
  const [clothingImage, setClothingImage] = useState<string | null>(null);
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
      setClothingImage(url);
      setImagePreview(url);
    } catch (err: any) {
      setUploadError(err.message || 'حدث خطأ أثناء تحميل الصورة');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setClothingImage(null);
    setImagePreview(null);
    setUploadError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim() && !clothingImage) {
      setUploadError('يرجى وصف القطعة المطلوبة أو رفع صورتها');
      return;
    }

    const effectiveSize = customSize.trim() ? customSize.trim() : size;
    const title = description.trim() || 'قطعة ملابس مخصصة بالصورة';

    addItem({
      category: 'clothes',
      categoryNameArabic: 'ملابس',
      title,
      description: `المقاس: ${effectiveSize} | اللون: ${color || 'غير محدد'} | الميزانية: ${budget ? `${budget} ${currency}` : 'حسب المتوفر'}`,
      quantity,
      price: budget ? parseFloat(budget) || null : null,
      notes: notes.trim(),
      size: effectiveSize,
      color: color.trim() || undefined,
      budget: budget.trim() || undefined,
      image: clothingImage || 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80',
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
    }, 2500);

    // Reset form
    setDescription('');
    setSize('L');
    setCustomSize('');
    setColor('');
    setQuantity(1);
    setBudget('');
    setNotes('');
    setClothingImage(null);
    setImagePreview(null);
  };

  return (
    <div className="space-y-6">
      {/* Category Header */}
      <div className="bg-white p-5 sm:p-7 rounded-3xl border border-stone-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-800">قسم الملابس والأزياء</span>
          </div>
          <h3 className="text-xl sm:text-3xl font-black text-stone-900 mt-1">
            البحث عن الملابس وقطع الأزياء
          </h3>
          <p className="text-xs sm:text-sm text-stone-700 mt-1">
            ارفع صورة لأي فستان، قميص، بنطال، حذاء أو زي ترغب فيه، وسنبحث عنه في أفضل المتاجر والأسواق نيابةً عنك
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-medium self-start md:self-auto">
          <Shirt className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>خدمة متسوق شخصي (Personal Shopper) متكاملة</span>
        </div>
      </div>

      {/* Main Request Form */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-8 max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Image Upload for Clothes */}
          <div>
            <label className="block text-sm font-bold text-stone-800 mb-2">
              صورة القطعة المطلوبة <span className="text-stone-700 font-normal">(مستحسن جدًا للمطابقة)</span>
            </label>

            {!imagePreview ? (
              <label className="border-2 border-dashed border-stone-300 hover:border-indigo-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-stone-50/60 hover:bg-indigo-50/20 transition-all group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-white border border-stone-200 flex items-center justify-center text-indigo-600 group-hover:scale-110 group-hover:border-indigo-300 transition-all shadow-xs mb-3">
                  {isUploading ? (
                    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Upload className="w-6 h-6" />
                  )}
                </div>
                <span className="text-sm font-bold text-stone-800 group-hover:text-indigo-700">
                  {isUploading ? 'جارٍ رفع الصورة...' : 'اضغط هنا لرفع صورة الملابس التي تبحث عنها'}
                </span>
                <span className="text-xs text-stone-700 mt-1">
                  لقطة شاشة من إنستغرام أو صورة من متجر إلكتروني أو تصوير حقيقي
                </span>
              </label>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-indigo-200 bg-indigo-50/30 p-3 flex items-center gap-4">
                <img
                  src={imagePreview}
                  alt="معاينة الملابس"
                  className="w-20 h-20 object-cover rounded-xl border border-stone-200"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                    <ImageIcon className="w-4 h-4 text-indigo-600" />
                    <span>تم رفع صورة القطعة بنجاح</span>
                  </div>
                  <p className="text-xs text-stone-700 mt-0.5">
                    سيتم استخدام الصورة للبحث عن القطعة المطابقة تمامًا في المحلات والمولات
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

          {/* Piece Description */}
          <div>
            <label className="block text-sm font-bold text-stone-800 mb-2">
              وصف القطعة بالتفصيل <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="مثال: فستان سهرة شيفون طويل بأكمام، أو هودي قطني رمادي مع غطاء رأس، أو طقم رياضي..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (uploadError) setUploadError(null);
              }}
              className="w-full text-sm px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden transition-all text-stone-800"
            />
          </div>

          {/* Size & Color & Quantity Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Size Selector */}
            <div>
              <label className="block text-sm font-bold text-stone-800 mb-2">
                المقاس
              </label>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full text-sm px-3 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden text-stone-800"
              >
                {COMMON_SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
                <option value="مخصص">مقاس مخصص (أكتبه بالأسفل)</option>
              </select>

              {size === 'مخصص' && (
                <input
                  type="text"
                  placeholder="أدخل المقاس هنا..."
                  value={customSize}
                  onChange={(e) => setCustomSize(e.target.value)}
                  className="mt-2 w-full text-xs px-3 py-2 rounded-xl bg-stone-50 border border-stone-200"
                />
              )}
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-bold text-stone-800 mb-2">
                اللون المفضل
              </label>
              <input
                type="text"
                placeholder="مثال: أسود، كحلي، بيج..."
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full text-sm px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden text-stone-800"
              />
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-bold text-stone-800 mb-2">
                الكمية
              </label>
              <div className="flex items-center justify-between bg-stone-100 rounded-2xl p-1.5 border border-stone-200">
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

          </div>

          {/* Budget & Additional Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-stone-800 mb-2">
                الميزانية التقريبية ({currency})
              </label>
              <input
                type="number"
                min="0"
                placeholder="مثال: 150"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full text-sm px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden text-stone-800"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-stone-800 mb-2">
                ملاحظات إضافية (الماركة، المول...)
              </label>
              <input
                type="text"
                placeholder="مثال: زارا، إتش آند إم، أو أي بديل مشابه..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-sm px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden text-stone-800"
              />
            </div>
          </div>

          {/* Submit / Add to cart */}
          <button
            type="submit"
            disabled={isUploading}
            className={`w-full py-4 px-6 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-2 shadow-md active:scale-98 ${
              isSuccess
                ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                : 'bg-indigo-700 hover:bg-indigo-800 text-white shadow-indigo-700/25'
            }`}
          >
            {isSuccess ? (
              <>
                <Check className="w-5 h-5" />
                <span>تمت إضافة طلب الملابس إلى السلة بنجاح!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>أضف طلب الملابس إلى السلة</span>
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
};
