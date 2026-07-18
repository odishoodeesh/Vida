import BrandStory from '../components/BrandStory';
import { motion } from 'motion/react';
import { useTranslation } from '../lib/translations';

export default function PhilosophyPage() {
  const { t, language } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="pt-24"
    >
      <BrandStory />
      
      {/* Additional philosophy content */}
      <section className="py-24 px-6 bg-brand-paper">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="aspect-[16/9] w-full rounded-[40px] overflow-hidden mb-16">
            <img src="https://i.ibb.co/dsc3jtDr/POST-05-100.jpg" alt="Science & Soul" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-4xl font-serif text-brand-primary italic">{t('sustainable_compact')}</h2>
          <p className="text-brand-secondary leading-relaxed">
            {t('sustainable_desc')}
          </p>
          <div className="pt-12 grid grid-cols-3 gap-8">
             <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-brand-light/20 rounded-full flex items-center justify-center mb-4">
                   <div className="w-2 h-2 bg-brand-accent rounded-full" />
                </div>
                <span className="text-[10px] uppercase tracking-widest font-bold">
                  {language === 'ar' ? 'نباتي بالكامل' : language === 'kr' ? 'ڤیگن' : 'Vegan'}
                </span>
             </div>
             <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-brand-light/20 rounded-full flex items-center justify-center mb-4">
                   <div className="w-2 h-2 bg-brand-accent rounded-full" />
                </div>
                <span className="text-[10px] uppercase tracking-widest font-bold">
                  {language === 'ar' ? 'بدون قسوة' : language === 'kr' ? 'بێ ئازاردانا جانەوەران' : 'Cruelty Free'}
                </span>
             </div>
             <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-brand-light/20 rounded-full flex items-center justify-center mb-4">
                   <div className="w-2 h-2 bg-brand-accent rounded-full" />
                </div>
                <span className="text-[10px] uppercase tracking-widest font-bold">
                  {language === 'ar' ? 'عضوي سرّي' : language === 'kr' ? 'ئۆرگانیک' : 'Organic'}
                </span>
             </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
