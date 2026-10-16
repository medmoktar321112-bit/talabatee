import React, { useState } from 'react';
import { Pill, Upload, X, ShieldAlert, Plus, Minus, Check, Image as ImageIcon, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { uploadImageFile } from '../services/api';

export const MedicineCategory: React.FC = () => {
  const { addItem } = useCart();

  const [medicineName, setMedicineName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [prescriptionImage, setPrescriptionImage] = useState<string | null>(null);
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
      setPrescriptionImage(url);
      setImagePreview(url);
    } catch (err: any) {
      setUploadError(err.message || 'حدث خطأ أثناء تحميل الصورة');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPrescriptionImage(null);
    setImagePreview(null);
    setUploadError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!medicineName.trim()) {
      setUploadError('يرجى إدخال اسم الدواء أو وصفه أو إرفاق الوصفة الطبية');
      return;
    }

    addItem({
      category: 'medicine',
      categoryNameArabic: 'أدوية',
      title: medicineName.trim(),
      description: 'طلب دواء/وصفة طبية من صيدلية مرخصة',
      quantity,
      price: null, // "السعر يُحدّد عند تأكيد الطلب"
      notes: notes.trim(),
      prescriptionImage: prescriptionImage || undefined,
      image: prescriptionImage || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
    }, 2500);

    // Reset form
    setMedicineName('');
    setQuantity(1);
    setNotes('');
    setPrescriptionImage(null);
    setImagePreview(null);
  };

  return (
    <div className="space-y-6">
      {/* Category Header */}
      <div className="bg-white p-5 sm:p-7 rounded-3xl border border-stone-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-teal-500"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800">قسم الأدوية والصيدلية</span>
          </div>
          <h3 className="text-xl sm:text-3xl font-black text-stone-900 mt-1">
            طلب الأدوية والمستلزمات الطبية
          </h3>
          <p className="text-xs sm:text-sm text-stone-700 mt-1">
            اكتب اسم الدواء أو ارفع صورة الوصفة الطبية، وسنتوجه إلى أقرب صيدلية مرخصة لشرائه وتوصيله إليك فورًا
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs font-medium self-start md:self-auto">
          <Pill className="w-4 h-4 text-teal-600 shrink-0" />
          <span>لا أسعار ثابتة - السعر يُحدّد بناءً على فاتورة الصيدلية الرسمية</span>
        </div>
      </div>

      {/* Main Request Form */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-8 max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Medicine Name Input */}
          <div>
            <label className="block text-sm font-bold text-stone-800 mb-2">
              اسم الدواء أو وصفه <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="مثال: بنادول أزرق، أوغمنتين 1 جم، قطرة ترطيب العين..."
              value={medicineName}
              onChange={(e) => {
                setMedicineName(e.target.value);
                if (uploadError) setUploadError(null);
              }}
              className="w-full text-sm sm:text-base px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-hidden transition-all text-stone-800"
            />
          </div>

          {/* Quantity & Notes in 2 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Quantity Selector */}
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

            {/* Notes */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-bold text-stone-800 mb-2">
                ملاحظات إضافية (اختياري)
              </label>
              <input
                type="text"
                placeholder="مثال: يفضل بديل محلي، أو علبة ذات 20 قرص..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-sm px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-hidden transition-all text-stone-800"
              />
            </div>

          </div>

          {/* Image / Prescription Upload */}
          <div>
            <label className="block text-sm font-bold text-stone-800 mb-2">
              إرفاق صورة للدواء أو الوصفة الطبية (اختياري لكن يُنصح به)
            </label>

            {!imagePreview ? (
              <label className="border-2 border-dashed border-stone-300 hover:border-teal-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-stone-50/60 hover:bg-teal-50/30 transition-all group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-white border border-stone-200 flex items-center justify-center text-teal-600 group-hover:scale-110 group-hover:border-teal-300 transition-all shadow-xs mb-3">
                  {isUploading ? (
                    <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Upload className="w-6 h-6" />
                  )}
                </div>
                <span className="text-sm font-bold text-stone-800 group-hover:text-teal-700">
                  {isUploading ? 'جارٍ رفع الصورة...' : 'اضغط هنا لرفع صورة الوصفة الطبية أو علبة الدواء'}
                </span>
                <span className="text-xs text-stone-700 mt-1">
                  يدعم صيغ JPG، PNG، WEBP حتى 8 ميغابايت
                </span>
              </label>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-teal-200 bg-teal-50/40 p-3 flex items-center gap-4">
                <img
                  src={imagePreview}
                  alt="معاينة الوصفة"
                  className="w-20 h-20 object-cover rounded-xl border border-stone-200"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800">
                    <ImageIcon className="w-4 h-4" />
                    <span>تم إرفاق صورة الوصفة الطبية بنجاح</span>
                  </div>
                  <p className="text-xs text-stone-700 mt-0.5">
                    سيتم حفظ الصورة بأمان وإرفاقها للمسؤول والمندوب للتأكد من الصيدلية
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

          {/* Privacy & Legal Compliance Notice */}
          <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-100 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
            <div className="text-xs text-stone-700 leading-relaxed space-y-1">
              <p className="font-bold text-teal-900">
                تعهد الخصوصية والالتزام الصحي:
              </p>
              <p>
                نتعامل مع الوصفات الطبية وبياناتكم بمنتهى السرية والأمان. تُنفّذ الطلبات حصرًا من خلال صيدليات مرخصة ومعتمدة ووفق القوانين واللوائح الصحية المحلية، ولا تُصرف الأدوية الخاضعة للرقابة أو المقيدة بوصفة طبية إلا بعد التحقق واستيفاء الشروط النظامية.
              </p>
            </div>
          </div>

          {/* Submit / Add to cart button */}
          <button
            type="submit"
            disabled={isUploading}
            className={`w-full py-4 px-6 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-2 shadow-md active:scale-98 ${
              isSuccess
                ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                : 'bg-teal-700 hover:bg-teal-800 text-white shadow-teal-700/25'
            }`}
          >
            {isSuccess ? (
              <>
                <Check className="w-5 h-5" />
                <span>تمت إضافة طلب الدواء إلى السلة بنجاح!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>أضف طلب الدواء إلى السلة</span>
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
};
