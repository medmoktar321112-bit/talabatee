import React from 'react';
import { MessageCircle, Send, ShieldCheck, Sparkles, AlertCircle, Phone } from 'lucide-react';
import { StoreSettings } from '../types';
import { formatWhatsAppUrl, displayPhoneNumber } from '../utils/whatsapp';

interface WhatsAppSectionProps {
  settings: StoreSettings;
  onOpenAdminSettings?: () => void;
}

export const WhatsAppSection: React.FC<WhatsAppSectionProps> = ({
  settings,
  onOpenAdminSettings,
}) => {
  const number = settings.whatsappNumber || '42481202';

  const handleWhatsAppClick = () => {
    const greetingText = `مرحبًا «طلباتي»، أود الاستفسار عن خدمة الشراء والتوصيل أو طلب منتج غير معروض بالموقع.`;
    const waUrl = formatWhatsAppUrl(number, greetingText);
    window.open(waUrl, '_blank');
  };

  return (
    <section id="whatsapp-contact-section" className="py-12 sm:py-16 scroll-mt-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="relative rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-900 to-teal-950 text-white p-7 sm:p-12 shadow-xl overflow-hidden border border-emerald-700/50">
          
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-amber-400/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative z-10 text-center space-y-6">
            
            {/* WhatsApp Icon */}
            <div className="w-16 h-16 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-emerald-300 mx-auto shadow-inner">
              <MessageCircle className="w-8 h-8" />
            </div>

            {/* Title exact copy */}
            <div className="space-y-3">
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-700/60 border border-emerald-600/50 text-emerald-200 text-xs font-bold">
                خدمة العملاء والاستفسارات
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white">
                تواصل معنا عبر واتساب
              </h2>
            </div>

            {/* Text exact copy requested by user prompt */}
            <p className="text-base sm:text-lg text-emerald-100 max-w-2xl mx-auto leading-relaxed font-medium">
              «هل لديك سؤال أو تريد طلب منتج غير موجود في الموقع؟ تواصل معنا عبر واتساب، وسنساعدك في العثور على ما تحتاجه».
            </p>

            {/* Green button exact title */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleWhatsAppClick}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-base shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2.5 active:scale-98"
              >
                <Send className="w-5 h-5 text-stone-950" />
                <span>تواصل معنا الآن ({displayPhoneNumber(number)})</span>
              </button>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-xs border border-white/15 text-xs text-emerald-200">
              <Phone className="w-3.5 h-3.5 text-emerald-300" />
              <span>رقم واتساب المباشر: </span>
              <strong className="text-white font-mono tracking-wider" dir="ltr">{displayPhoneNumber(number)}</strong>
            </div>

            <div className="pt-4 flex items-center justify-center gap-6 text-xs text-emerald-200/80">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>رد سريع ومباشر</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>تأكيد الأسعار قبل الشراء</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
