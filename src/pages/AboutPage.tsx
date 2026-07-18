import { motion } from 'motion/react';
import { Instagram, Mail, Phone, MapPin, Clock } from 'lucide-react';
import { useTranslation } from '../lib/translations';

export default function AboutPage() {
  const { t, language } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="pt-48 pb-32 px-6 bg-brand-paper min-h-screen"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
          {/* Content Left */}
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-serif text-brand-primary mb-12"
            >
              {language === 'ar' ? (
                <>عن <span className="italic">فيدا</span></>
              ) : language === 'kr' ? (
                <>ل دۆر <span className="italic">ڤیدا</span></>
              ) : (
                <>About <span className="italic">VIDA</span></>
              )}
            </motion.h1>
            
            <div className="space-y-8 text-brand-secondary leading-relaxed text-lg">
              <p>
                {t('about_p1')}
              </p>
              <p>
                {t('about_p2')}
              </p>
              <p className="font-serif italic text-brand-primary">
                "{t('about_p3')}"
              </p>
            </div>

            <div className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t border-brand-primary/10">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-brand-gold">
                  <MapPin size={18} />
                  <span className="text-[10px] uppercase tracking-[0.3em] font-black">{t('location')}</span>
                </div>
                <div className="text-brand-primary">
                  <p className="font-semibold">{t('hq_title')}</p>
                  <p>{language === 'kr' ? 'دهۆک KRO' : language === 'ar' ? 'دهوك KRO' : 'Duhok KRO'}</p>
                  <p>{t('kr_region')}</p>
                  <button 
                    onClick={() => {
                      document.getElementById('live-map')?.scrollIntoView({ behavior: 'smooth' });
                    }} 
                    className="mt-3 text-[10px] font-black uppercase tracking-widest text-brand-gold hover:text-brand-accent transition-colors flex items-center gap-1.5 cursor-pointer border-0 bg-transparent p-0"
                    id="btn-scroll-map"
                  >
                    {language === 'ar' ? 'عرض على الخريطة ←' : language === 'kr' ? 'نیشاندان ل سەر نەخشەیێ ←' : 'View on Map ←'}
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-brand-gold">
                  <Clock size={18} />
                  <span className="text-[10px] uppercase tracking-[0.3em] font-black">{t('hours')}</span>
                </div>
                <div className="text-brand-primary text-sm">
                  <p className="flex justify-between border-b border-brand-primary/5 pb-1 gap-4">
                    <span>{t('mon_fri')}</span>
                    <span>٠٩:٠٠ - ١٩:٠٠</span>
                  </p>
                  <p className="flex justify-between border-b border-brand-primary/5 pb-1 mt-2 gap-4">
                    <span>{t('sat')}</span>
                    <span>١٠:٠٠ - ١٦:٠٠</span>
                  </p>
                  <p className="flex justify-between mt-2 opacity-50 gap-4">
                    <span>{t('sun')}</span>
                    <span>{t('closed')}</span>
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-brand-gold">
                  <Phone size={18} />
                  <span className="text-[10px] uppercase tracking-[0.3em] font-black">{t('call_us')}</span>
                </div>
                <div className="text-brand-primary font-medium">
                  <a href="tel:+9647500000000" className="hover:text-brand-accent transition-colors">+964 750 000 0000</a>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-brand-gold">
                  <Instagram size={18} />
                  <span className="text-[10px] uppercase tracking-[0.3em] font-black">{t('follow_us')}</span>
                </div>
                <div className="flex gap-4">
                  <a href="#" className="p-2 border border-brand-primary/10 rounded-full hover:bg-brand-primary hover:text-white transition-all">
                    <Instagram size={16} />
                  </a>
                  <a href="#" className="p-2 border border-brand-primary/10 rounded-full hover:bg-brand-primary hover:text-white transition-all">
                    <Mail size={16} />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Right */}
          <div className="sticky top-48">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 1 }}
              className="rounded-[40px] overflow-hidden aspect-[4/5] bg-brand-beige"
            >
              <img 
                src="https://i.ibb.co/0jLSmbBs/POST-07-100.jpg" 
                alt="VIDA Botanical Studio Interior"
                className="w-full h-full object-cover hover:scale-105 transition-all duration-1000"
                referrerPolicy="no-referrer"
              />
            </motion.div>
            
            <div className="absolute -bottom-8 -left-8 bg-brand-accent p-8 rounded-2xl shadow-xl hidden md:block">
              <p className="text-white text-[10px] uppercase tracking-widest font-black leading-tight">
                {language === 'ar' ? (
                  <>زوروا مقرنا<br/>الرئيسي<br/>في دهوك</>
                ) : language === 'kr' ? (
                  <>سەردانا ستۆدیۆیا مە<br/>یا سەرەکی بکە<br/>ل دهۆکێ</>
                ) : (
                  <>VISIT OUR<br/>FLAGSHIP<br/>IN DUHOK</>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <motion.div 
          id="live-map"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-32 pt-20 border-t border-brand-primary/10"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-center">
            {/* Map Info */}
            <div className="lg:col-span-1 space-y-8">
              <span className="text-[10px] uppercase tracking-[0.3em] font-black text-brand-gold block">{t('location')}</span>
              <h2 className="text-3xl md:text-4xl font-serif text-brand-primary leading-tight" id="map-heading">
                {language === 'ar' ? (
                  <>موقعنا على <span className="italic">الخريطة</span></>
                ) : language === 'kr' ? (
                  <>جهێ مە ل سەر <span className="italic">نەخشەیێ</span></>
                ) : (
                  <>Find Us on the <span className="italic">Live Map</span></>
                )}
              </h2>
              <p className="text-brand-secondary text-base leading-relaxed" id="map-description">
                {language === 'ar' ? (
                  "يقع مقرنا الرئيسي في قلب دهوك KRO، ويقدم تجربة استثنائية. تفضل بزيارتنا لتجربة مجموعتنا الكاملة من الزيوت النباتية الخام، والحصول على الاستشارات الخاصة بالتركيبات المخصصة، واكتشاف فن العناية بالبشرة والجمال العضوي."
                ) : language === 'kr' ? (
                  "ئۆفيسا مە یا سەرەکی ل دلێ دهۆک KRO ژینگۆهەکا تایبەت پێشکێش دکەت. سەردانا مە بکە ژ بۆ تاقیکرنا هەمی بەرهەمێن مە یێن سرۆشتی و شاوڕیکرنا ل سەر ئاوێتەیێن تایبەت بۆ تە."
                ) : (
                  "Located in the heart of Duhok KRO, our Flagship Botanical Studio offers a unique offline experience. Visit us to sample our entire range of raw botanical oils, consult on custom formulations, and discover the art of cold pressed care."
                )}
              </p>
              
              <div className="pt-4">
                <a 
                  id="waze-btn"
                  href="https://www.waze.com/ul?ll=36.865141,42.966542&navigate=yes&zoom=17" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-brand-primary text-white hover:bg-brand-gold hover:text-brand-primary transition-all duration-300 px-8 py-4 rounded-full text-xs uppercase tracking-widest font-black shadow-md hover:shadow-lg"
                >
                  <MapPin size={14} />
                  {language === 'ar' ? "افتح في Waze" : language === 'kr' ? "د ناڤ Waze دا ڤەکە" : "Open in Waze"}
                </a>
              </div>
            </div>

            {/* Map Iframe */}
            <div className="lg:col-span-2">
              <div className="rounded-[32px] overflow-hidden shadow-2xl border border-brand-primary/5 bg-brand-beige p-3 md:p-4" id="map-frame-wrapper">
                <div className="w-full h-[350px] md:h-[450px] rounded-[24px] overflow-hidden relative group">
                  <iframe 
                    id="waze-iframe"
                    src="https://embed.waze.com/iframe?zoom=17&lat=36.865141&lon=42.966542&ct=livemap" 
                    width="100%" 
                    height="100%" 
                    allowFullScreen 
                    style={{ border: 0 }}
                    loading="lazy"
                    title="VIDA Botanical Studio Location Map"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
