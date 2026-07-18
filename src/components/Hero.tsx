import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useStore } from '../lib/StoreContext';
import { useTranslation } from '../lib/translations';

export default function Hero() {
  const { heroImage } = useStore();
  const { t } = useTranslation();

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-brand-beige">
      <div className="absolute inset-0 z-0">
        <motion.img 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.6 }}
          transition={{ duration: 2, ease: "easeOut" }}
          src={heroImage}
          alt="Botanical background"
          className="w-full h-full object-cover grayscale-[0.2]"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-paper/20 to-brand-paper/80" />
      </div>
      
      <div className="relative z-10 text-center px-6">
        <motion.span 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="block text-xs uppercase tracking-[0.6em] text-brand-secondary mb-6 font-medium"
        >
          {t('earth_born')}
        </motion.span>
        
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 1 }}
          className="text-6xl md:text-8xl font-serif text-brand-primary leading-[1.1] mb-12 max-w-4xl"
        >
          {t('welcome_splash')}
        </motion.h1>
        
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 1.5, duration: 1 }}
        >
          <Link 
            to="/collection" 
            className="inline-block px-10 py-4 border border-brand-primary text-brand-primary text-xs uppercase tracking-widest hover:bg-brand-primary hover:text-brand-paper transition-all duration-500 rounded-full"
          >
            {t('explore_collection')}
          </Link>
        </motion.div>
      </div>
      
      {/* Scroll indicator */}
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 hidden md:block"
      >
        <div className="w-px h-16 bg-gradient-to-b from-brand-primary to-transparent opacity-30" />
      </motion.div>
    </section>
  );
}
