import React from 'react';
import {
  Download,
  Smartphone,
  FileArchive,
  ExternalLink,
  X,
  CheckCircle2,
  Sparkles,
  ArrowDownToLine,
  HelpCircle,
  Copy,
  Check,
} from 'lucide-react';

interface DownloadAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadAppModal: React.FC<DownloadAppModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const appUrl = window.location.origin;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-emerald-300 shadow-inner">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black">تحميل تطبيق «طلباتي» أو ملف ZIP</h3>
              <p className="text-xs text-emerald-200">اختر الطريقة المناسبة لك للحصول على التطبيق واستخدامه</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">

          {/* Option 1: Direct Download ZIP (Requested by user) */}
          <div className="p-5 rounded-2xl bg-stone-50 border-2 border-emerald-500/40 relative overflow-hidden space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xs">
                  1
                </span>
                <h4 className="font-black text-stone-900 text-base flex items-center gap-2">
                  <FileArchive className="w-5 h-5 text-emerald-700" />
                  <span>تحميل كود المشروع بالكامل (ملف ZIP جاهز)</span>
                </h4>
              </div>
              <span className="text-[11px] font-black bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                متاح الآن
              </span>
            </div>

            <p className="text-xs text-stone-700 leading-relaxed">
              يحتوي ملف الـ ZIP على كامل الكود المصدري للواجهة الأمامية والخلفية وقاعدة البيانات وتصميمات الصفحات وإعدادات واتساب والعملة، جاهز للتشغيل على أي جهاز.
            </p>

            <a
              href="/api/download-zip"
              download="talabatee-project.zip"
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 transition-all active:scale-98"
            >
              <ArrowDownToLine className="w-5 h-5" />
              <span>تحميل ملف ZIP الآن (talabatee-project.zip)</span>
            </a>
          </div>

          {/* Option 2: Install as Android App (PWA - No Store Needed!) */}
          <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-teal-700 text-white flex items-center justify-center font-black text-xs">
                  2
                </span>
                <h4 className="font-black text-stone-900 text-base flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-teal-700" />
                  <span>تثبيت التطبيق على هاتف أندرويد مباشرة (تطبيق PWA)</span>
                </h4>
              </div>
              <span className="text-[11px] font-bold bg-teal-100 text-teal-900 px-2.5 py-0.5 rounded-full">
                الأسهل والأسرع
              </span>
            </div>

            <p className="text-xs text-stone-700 leading-relaxed">
              يدعم موقع «طلباتي» ميزة <strong>تطبيق الويب التقدمي (PWA)</strong> التي تتيح لك ولعملائك تثبيته على شاشة الهاتف كأيقونة تطبيق كاملة بدون الحاجة إلى متجر Google Play:
            </p>

            <div className="bg-white p-3.5 rounded-xl border border-stone-200 text-xs text-stone-700 space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>افتح رابط الموقع من متصفح الهاتف (Chrome).</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>اضغط على خيارات المتصفح (علامة النقاط الثلاث <strong>⁝</strong> بأعلى أو أسفل الشاشة).</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>اضغط على <strong>«تثبيت التطبيق»</strong> أو <strong>«الإضافة إلى الشاشة الرئيسية»</strong>.</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                readOnly
                value={appUrl}
                className="flex-1 text-xs px-3 py-2 rounded-xl bg-white border border-stone-300 font-mono text-stone-700"
              />
              <button
                type="button"
                onClick={handleCopyUrl}
                className="px-3.5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'تم النسخ!' : 'نسخ الرابط'}</span>
              </button>
            </div>
          </div>

          {/* Option 3: Convert to APK via PWABuilder */}
          <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-blue-700 text-white flex items-center justify-center font-black text-xs">
                  3
                </span>
                <h4 className="font-black text-stone-900 text-base flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-700" />
                  <span>طريقة إنشاء ملف APK جاهز خلال دقيقة واحدة</span>
                </h4>
              </div>
            </div>

            <p className="text-xs text-stone-700 leading-relaxed">
              لأن خادم التطوير السحابي هو بيئة ويب Node.js، يمكنك استخراج ملف <strong>APK رسمي جاهز</strong> مجاناً وبنقرة واحدة عبر أداة مايكروسوفت الرسمية المعتمدة:
            </p>

            <div className="bg-white p-3.5 rounded-xl border border-stone-200 text-xs text-stone-700 space-y-1.5">
              <p>1. انسخ رابط موقعك الحالي بالأعلى.</p>
              <p>2. توجه لموقع <strong>PWABuilder.com</strong> (الموقع الرسمي لتحويل مواقع الويب إلى APK).</p>
              <p>3. ألصق الرابط واضغط على <strong>Start</strong> ثم اختر <strong>Android Package (APK)</strong>.</p>
              <p>4. ستحصل على ملف APK جاهز للتثبيت والنشر فوراً!</p>
            </div>

            <a
              href="https://www.pwabuilder.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>فتح موقع PWABuilder لإنشاء الـ APK</span>
            </a>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-100 border-t border-stone-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs transition-colors"
          >
            إغلاق النافذة
          </button>
        </div>

      </div>
    </div>
  );
};
