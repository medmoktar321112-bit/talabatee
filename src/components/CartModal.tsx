import React, { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Send,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Phone,
  MapPin,
  User,
  FileText,
  Clock,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { StoreSettings, Order } from '../types';
import { createOrder, markWhatsappSent } from '../services/api';
import { formatWhatsAppUrl } from '../utils/whatsapp';

interface CartModalProps {
  settings: StoreSettings;
  onOpenSettingsAlert?: () => void;
}

export const CartModal: React.FC<CartModalProps> = ({ settings }) => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    hasUnpricedItems,
    itemCount,
  } = useCart();

  // Checkout form state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Confirmed Order State for the confirmation dialog
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [whatsAppUrl, setWhatsAppUrl] = useState<string | null>(null);

  if (!isCartOpen) return null;

  // Build formatted Arabic WhatsApp message
  const buildWhatsAppMessage = (orderNumber: string) => {
    let msg = `🛒 *طلب جديد من موقع «طلباتي»*\n`;
    msg += `🏷️ *رقم الطلب المرجعي:* ${orderNumber}\n\n`;

    msg += `👤 *معلومات العميل:*\n`;
    msg += `• الاسم: ${customerName.trim()}\n`;
    msg += `• رقم الهاتف: ${customerPhone.trim()}\n`;
    msg += `• عنوان التوصيل: ${deliveryAddress.trim()}\n`;
    if (customerNotes.trim()) {
      msg += `• ملاحظات عامة: ${customerNotes.trim()}\n`;
    }
    msg += `\n📦 *تفاصيل المنتجات والطلبات (${items.length} عنصر):*\n`;

    items.forEach((item, index) => {
      msg += `\n${index + 1}. *${item.title}* [${item.categoryNameArabic || item.category}]\n`;
      msg += `   - الكمية: ${item.quantity}\n`;
      if (item.price !== null && item.price !== undefined) {
        msg += `   - السعر: ${item.price} ${settings.currency} (المجموع: ${item.price * item.quantity} ${settings.currency})\n`;
      } else {
        msg += `   - السعر: يُحدّد عند التحقق والتأكيد\n`;
      }
      if (item.size) msg += `   - المقاس: ${item.size}\n`;
      if (item.color) msg += `   - اللون: ${item.color}\n`;
      if (item.notes) msg += `   - ملاحظة: ${item.notes}\n`;
      if (item.prescriptionImage) msg += `   - (مرفق وصفة طبية / صورة بالطلب)\n`;
      else if (item.image && !item.image.includes('unsplash.com')) msg += `   - (مرفق صورة للمنتج بالطلب)\n`;
    });

    msg += `\n--------------------------\n`;
    if (subtotal > 0) {
      msg += `💰 *المجموع التقديري للمواد المسعرة:* ${subtotal} ${settings.currency}\n`;
    }
    msg += `⚠️ *ملاحظة مهمة:* السعر النهائي للمنتجات غير المسعرة وتكلفة الشراء ورسوم التوصيل ستُؤكد معي الآن قبل الشراء الفعلي.\n`;
    msg += `\n✨ شكرًا لاختياركم «طلباتي»!`;

    return msg;
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (items.length === 0) {
      setErrorMessage('السلة فارغة حاليًا. يرجى إضافة منتجات أولاً.');
      return;
    }

    if (!customerName.trim() || !customerPhone.trim() || !deliveryAddress.trim()) {
      setErrorMessage('يرجى ملء الاسم ورقم الهاتف وعنوان التوصيل بشكل صحيح.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Save order to backend database first
      const order = await createOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        deliveryAddress: deliveryAddress.trim(),
        customerNotes: customerNotes.trim(),
        items,
      });

      // 2. Format Arabic message
      const textMessage = buildWhatsAppMessage(order.orderNumber);

      // Build WhatsApp URL with automatic Mauritania country code (222) if 8 digits
      const waUrl = formatWhatsAppUrl(settings.whatsappNumber || '42481202', textMessage);

      setConfirmedOrder(order);
      setWhatsAppUrl(waUrl);

      // Open WhatsApp in new window/tab
      try {
        window.open(waUrl, '_blank');
        markWhatsappSent(order.id);
      } catch (err) {
        console.warn('Could not auto-open popup', err);
      }

      // Clear the cart
      clearCart();
    } catch (err: any) {
      console.error('Checkout error:', err);
      setErrorMessage(err.message || 'حدث خطأ أثناء حفظ الطلب. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsCartOpen(false);
    setConfirmedOrder(null);
    setWhatsAppUrl(null);
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-stone-200 overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-stone-900">
                سلة مشتريات «طلباتي»
              </h3>
              <p className="text-xs text-stone-700">
                {itemCount} {itemCount === 1 ? 'عنصر' : 'عناصر'} في سلتك
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-stone-700 hover:text-stone-900 hover:bg-stone-200/60 transition-colors"
            title="إغلاق"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* Success Screen if order was submitted */}
          {confirmedOrder ? (
            <div className="text-center py-6 px-3 space-y-5 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black mb-2">
                  تم تسجيل الطلب في النظام بنجاح
                </span>
                <h4 className="text-2xl font-black text-stone-900">
                  رقم طلبك المرجعي:
                </h4>
                <div className="text-2xl sm:text-3xl font-mono font-black text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-2xl py-2 px-4 inline-block mt-2 tracking-wider">
                  #{confirmedOrder.orderNumber}
                </div>
              </div>

              {/* Crucial WhatsApp Instructions required by user prompt */}
              <div className="bg-stone-50 rounded-2xl p-4 sm:p-5 border border-stone-200 text-right space-y-3 text-sm text-stone-700">
                <div className="flex items-center gap-2 font-bold text-stone-900">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>خطوة أخيرة هامة لإتمام الطلب:</span>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed">
                  تم حفظ تفاصيل طلبك في قاعدة بيانات «طلباتي» وتم فتح محادثة واتساب المخصصة لخدمتكم.
                </p>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs space-y-1">
                  <p className="font-bold">⚠️ تنبيه هام:</p>
                  <p>
                    • يُرجى الضغط على زر <strong>«إرسال»</strong> داخل تطبيق واتساب لتصلنا الرسالة ونبدأ في مراجعتها.
                  </p>
                  <p>
                    • إذا كان طلبك يحتوي على وصفة طبية أو صورة لقطعة ملابس، يُرجى إرفاق الصورة الأصلية مباشرة داخل محادثة واتساب لضمان أعلى دقة ووضوح.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                {whatsAppUrl && (
                  <a
                    href={whatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all active:scale-98"
                  >
                    <Send className="w-5 h-5" />
                    <span>فتح محادثة واتساب وإرسال الطلب الآن</span>
                    <ExternalLink className="w-4 h-4 opacity-75" />
                  </a>
                )}

                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full py-3 px-6 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-sm transition-colors"
                >
                  العودة لتصفح الموقع
                </button>
              </div>
            </div>
          ) : items.length === 0 ? (
            /* Empty State */
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-700">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-stone-800">
                سلة المشتريات فارغة
              </h4>
              <p className="text-xs sm:text-sm text-stone-700 max-w-sm mx-auto">
                اختر وجبة من قسم الطعام، أو اطلب دواءً أو ملابس أو أي منتج تحتاجه وسنقوم بشرائه وتوصيله لك.
              </p>
              <button
                onClick={handleClose}
                className="mt-2 px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors"
              >
                تصفح الأقسام الآن
              </button>
            </div>
          ) : (
            /* Cart Items List */
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    المنتجات والطلبات ({items.length})
                  </span>
                  <button
                    onClick={clearCart}
                    className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>تفريغ السلة</span>
                  </button>
                </div>

                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 sm:p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    {/* Item Info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border border-stone-200 shrink-0 bg-white"
                        />
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm sm:text-base font-black text-stone-900 truncate">
                            {item.title}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-stone-200 text-stone-700 text-[10px] font-bold">
                            {item.categoryNameArabic || item.category}
                          </span>
                        </div>

                        {item.description && (
                          <p className="text-xs text-stone-700 truncate mt-0.5">
                            {item.description}
                          </p>
                        )}

                        {item.notes && (
                          <p className="text-[11px] text-amber-800 font-medium mt-0.5 flex items-center gap-1">
                            <span>ملاحظة:</span>
                            <span>{item.notes}</span>
                          </p>
                        )}

                        {/* Price display */}
                        <div className="mt-1 text-xs font-bold text-emerald-800">
                          {item.price !== null && item.price !== undefined ? (
                            <span>
                              {item.price * item.quantity} {settings.currency} ({item.price} {settings.currency} للقطعة)
                            </span>
                          ) : (
                            <span className="text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-sm text-[11px]">
                              السعر يُحدّد عند التحقق والتأكيد
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quantity controls & Delete */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-200">
                      <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-stone-200">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-7 h-7 rounded-lg bg-stone-50 hover:bg-stone-200 text-stone-700 flex items-center justify-center font-bold text-xs"
                          title="تقليل"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center font-black text-xs text-stone-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-7 h-7 rounded-lg bg-stone-50 hover:bg-stone-200 text-stone-700 flex items-center justify-center font-bold text-xs"
                          title="زيادة"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-stone-700 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        title="حذف العنصر"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Subtotal & Notice */}
              <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-stone-700">
                    المجموع التقديري للمواد المسعرة:
                  </span>
                  <span className="text-lg font-black text-emerald-800">
                    {subtotal > 0 ? `${subtotal} ${settings.currency}` : 'حسب الفاتورة'}
                  </span>
                </div>

                {hasUnpricedItems && (
                  <p className="text-xs text-stone-700 leading-relaxed border-t border-emerald-200/60 pt-2 flex items-start gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      تنبيه: تحتوي سلتك على طلبات لم يُحدد سعرها مسبقًا (مثل الأدوية أو الملابس أو الطلبات الخاصة). سيتم تدقيق الأسعار الفعلية ورسوم الخدمة والتوصيل وإبلاغكم بها لاعتمادها قبل الشراء.
                    </span>
                  </p>
                )}
              </div>

              {/* Customer Checkout Form */}
              <form onSubmit={handleCheckout} className="space-y-4 pt-2 border-t border-stone-200">
                <h4 className="text-base font-black text-stone-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-600" />
                  <span>معلومات التوصيل والتأكيد</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      الاسم الكامل <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="أدخل اسمك الكريم..."
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-emerald-500 outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      رقم الهاتف (للتواصل والواتساب) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        placeholder="مثال: 0501234567"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-emerald-500 outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    عنوان التوصيل بالتفصيل <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="الحي، اسم الشارع، رقم المبنى أو معلم بارز..."
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-emerald-500 outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    ملاحظات عامة حول التوصيل (اختياري)
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: التوصيل بعد الساعة 5 مساءً، الاتصال قبل الوصول..."
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-emerald-500 outline-hidden"
                  />
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Prominent "اطلب الآن" Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2.5 active:scale-98 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>جارٍ حفظ الطلب وتجهيز رسالة واتساب...</span>
                    </div>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>اطلب الآن عبر واتساب</span>
                    </>
                  )}
                </button>

                <p className="text-center text-[11px] text-stone-700 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>يتم حفظ الطلب برقم مرجعي فريد وفتح واتساب لتأكيد الشراء معكم</span>
                </p>

              </form>
            </>
          )}

        </div>

      </div>
    </div>
  );
};
