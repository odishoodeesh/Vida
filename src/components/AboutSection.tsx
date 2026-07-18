import { motion } from 'motion/react';
import { useTranslation } from '../lib/translations';

export default function AboutSection() {
  const { t } = useTranslation();

  return (
    <section className="py-32 px-6 bg-brand-beige overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
        <div className="relative">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="rounded-[40px] overflow-hidden aspect-[3/4] max-w-md mx-auto"
          >
            <img 
              src="https://i.ibb.co/LdM1R6Wr/POST-06-100.jpg" 
              alt="Botanical lifestyle"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>
          <motion.div 
             initial={{ opacity: 0, scale: 0.8 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             transition={{ delay: 0.5, duration: 1 }}
             className="absolute -bottom-10 -right-10 bg-brand-primary text-brand-paper p-12 rounded-full hidden lg:flex flex-col items-center justify-center w-48 h-48 text-center"
          >
            <span className="text-3xl font-serif mb-1 italic">{t('est_label')}</span>
            <span className="text-sm tracking-widest font-medium text-brand-paper/80">MMXXIII</span>
          </motion.div>
        </div>
        
        <div className="space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-serif text-brand-primary leading-tight mb-8">
              {t('about_sec_title')}
            </h2>
            <div className="space-y-6 text-brand-secondary leading-relaxed opacity-90 text-lg">
              <p>
                {t('about_sec_p1')}
              </p>
              <p>
                {t('about_sec_p2')}
              </p>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-3 gap-4 md:gap-12"
          >
            <div>
              <span className="block text-2xl font-serif text-brand-primary">{t('organic_label')}</span>
              <span className="text-[10px] uppercase tracking-widest text-brand-gold font-bold">{t('organic_sub')}</span>
            </div>
            <div>
              <span className="block text-2xl font-serif text-brand-primary shrink-0">{t('hand_poured_label')}</span>
              <span className="text-[10px] uppercase tracking-widest text-brand-gold font-bold">{t('hand_poured_sub')}</span>
            </div>
            <div>
              <span className="block text-2xl font-serif text-brand-primary">{t('pure_glass')}</span>
              <span className="text-[10px] uppercase tracking-widest text-brand-gold font-bold">{t('eco_friendly')}</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
