import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Leaf, Sparkles, Droplets, LayoutGrid, List } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useStore } from '../lib/StoreContext';
import { useTranslation } from '../lib/translations';

type LayoutType = 'immersive' | 'grid-2' | 'grid-3';

export default function FloatingSlider() {
  const { featuredItems } = useStore();
  const [layout, setLayout] = useState<LayoutType>('immersive');
  const { t, language } = useTranslation();

  if (featuredItems.length === 0) return null;

  const getSliderDesc = (id: string, defaultDesc: string) => {
    if (id === 'featured') return t('slider_desc_featured');
    if (id === 'jojoba') return t('slider_desc_jojoba');
    if (id === 'rosemary') return t('slider_desc_rosemary');
    if (id === 'flax') return t('slider_desc_flax');
    if (id === 'almond') return t('slider_desc_almond');
    return t(defaultDesc as any);
  };

  return (
    <div className="bg-brand-paper">
      {/* Layout Controls */}
      <div className="container mx-auto px-6 py-12 flex justify-center sticky top-20 z-[40]">
        <div className="flex bg-white/80 backdrop-blur-md p-1.5 rounded-full border border-brand-primary/5 shadow-2xl shadow-brand-primary/10 transition-all hover:scale-105">
          <button 
            onClick={() => setLayout('immersive')}
            className={`p-3 rounded-full transition-all flex items-center gap-2 ${layout === 'immersive' ? 'bg-brand-primary text-white shadow-lg' : 'text-brand-primary/40 hover:text-brand-primary hover:bg-brand-paper'}`}
          >
            <List size={16} />
            {layout === 'immersive' && <span className="text-[10px] uppercase tracking-widest font-black pr-2">{t('immersive')}</span>}
          </button>
          
          <button 
            onClick={() => setLayout('grid-2')}
            className={`p-3 rounded-full transition-all flex items-center gap-2 ${layout === 'grid-2' ? 'bg-brand-primary text-white shadow-lg' : 'text-brand-primary/40 hover:text-brand-primary hover:bg-brand-paper'}`}
          >
            <LayoutGrid size={16} />
            {layout === 'grid-2' && <span className="text-[10px] uppercase tracking-widest font-black pr-2">{t('editorial_grid')}</span>}
          </button>

          <button 
            onClick={() => setLayout('grid-3')}
            className={`p-3 rounded-full transition-all flex items-center gap-2 ${layout === 'grid-3' ? 'bg-brand-primary text-white shadow-lg' : 'text-brand-primary/40 hover:text-brand-primary hover:bg-brand-paper'}`}
          >
            <div className="grid grid-cols-2 gap-0.5">
              <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
              <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
              <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
              <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
            </div>
            {layout === 'grid-3' && <span className="text-[10px] uppercase tracking-widest font-black pr-2">{t('gallery')}</span>}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {layout === 'immersive' ? (
          <motion.div 
            key="immersive"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="divide-y divide-brand-primary/5"
          >
            {featuredItems.map((item, index) => (
              <section 
                key={item.id} 
                className={`relative py-24 md:py-32 overflow-hidden ${index % 2 === 1 ? 'bg-brand-beige/5' : 'bg-brand-paper'}`}
              >
                <div className="container mx-auto px-6">
                  <div className={`flex flex-col md:flex-row items-center justify-center gap-12 md:gap-8 ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                    
                    {/* Content side */}
                    <div className="w-full md:w-auto md:max-w-md z-10">
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <span className="h-[1.5px] w-8 bg-brand-gold"></span>
                          <span className="text-xs uppercase tracking-[0.25em] font-black text-brand-gold">
                            {t(item.accent as any)} {language === 'en' ? 'COLLECTION' : t('collection')}
                          </span>
                        </div>
                        
                        {/* Big, Clear and Obvious Product Name */}
                        <h2 className="text-5xl md:text-7xl font-serif font-extrabold text-brand-primary leading-none mb-3 tracking-tight">
                          {t(item.name as any)}
                        </h2>

                        {/* Beautiful Poetic Subtitle */}
                        <h3 className="text-lg md:text-xl font-sans font-light italic text-brand-accent mb-6 leading-relaxed">
                          {t(item.title as any)}
                        </h3>
                        
                        <p className="text-brand-secondary/70 max-w-md leading-relaxed mb-8 text-sm md:text-base">
                          {getSliderDesc(item.id, item.description)}
                        </p>

                        <div className="grid grid-cols-3 gap-6 mb-10">
                          <div className="flex flex-col gap-2">
                            <div className="w-8 h-8 rounded-full bg-brand-beige/30 flex items-center justify-center text-brand-accent">
                              <Leaf size={16} />
                            </div>
                            <span className="text-[10px] uppercase tracking-wider font-bold text-brand-primary/60">{t('organic_label')}</span>
                          </div>
                          <div className="flex flex-col gap-2">
                            <div className="w-8 h-8 rounded-full bg-brand-beige/30 flex items-center justify-center text-brand-accent">
                              <Droplets size={16} />
                            </div>
                            <span className="text-[10px] uppercase tracking-wider font-bold text-brand-primary/60">{t('monic_essence')}</span>
                          </div>
                          <div className="flex flex-col gap-2">
                            <div className="w-8 h-8 rounded-full bg-brand-beige/30 flex items-center justify-center text-brand-accent">
                              <Sparkles size={16} />
                            </div>
                            <span className="text-[10px] uppercase tracking-wider font-bold text-brand-primary/60">{t('pure_glass')}</span>
                          </div>
                        </div>

                        <Link 
                          to="/collection" 
                          className="inline-block px-10 py-4 bg-brand-primary text-white text-[10px] uppercase tracking-[0.3em] font-black rounded-full hover:bg-brand-accent transition-all hover:scale-105 active:scale-95 shadow-xl shadow-brand-primary/10 font-sans"
                        >
                          {t('explore_btn')} {t(item.name as any)}
                        </Link>
                      </motion.div>
                    </div>

                    {/* Floating Image Side */}
                    <div className="w-full md:w-auto flex justify-center items-center">
                      <div className="relative">
                        {/* Decorative background element */}
                        <motion.div 
                          animate={{ 
                            scale: [1, 1.1, 1],
                            rotate: [0, 90, 180, 270, 360],
                            opacity: [0.03, 0.05, 0.03]
                          }}
                          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180px] h-[180px] md:w-[300px] md:h-[300px] border border-brand-gold/20 rounded-full"
                        />
                        
                        <motion.div
                          animate={{ 
                            y: [0, -15, 0],
                            rotateZ: [-1, 1, -1]
                          }}
                          transition={{ 
                            duration: 5,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                          className="relative z-10"
                        >
                          <img 
                            src={item.image} 
                            alt={t(item.name as any)} 
                            className="w-[140px] md:w-[220px] drop-shadow-[0_25px_25px_rgba(30,50,44,0.1)] transition-transform duration-500 hover:scale-110"
                            referrerPolicy="no-referrer"
                          />
                        </motion.div>

                        {/* Highly visible elegant name tag badge attached directly to the product image container */}
                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md px-5 py-3 rounded-2xl border border-brand-gold/30 shadow-xl text-center z-20 min-w-[160px] hover:border-brand-gold transition-all duration-300 pointer-events-none">
                          <span className="block text-xs font-black uppercase tracking-[0.2em] text-brand-primary font-sans leading-none whitespace-nowrap mb-1">
                            {t(item.name as any)}
                          </span>
                          <span className="block text-[8px] font-serif italic text-brand-accent leading-none whitespace-nowrap">
                            {t(item.title as any)}
                          </span>
                        </div>

                        {/* Gentle shadow floor */}
                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-32 h-6 bg-brand-primary/5 blur-xl rounded-full scale-x-125 opacity-40" />
                      </div>
                    </div>

                  </div>
                </div>
              </section>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            key={layout}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="container mx-auto px-4 md:px-6 py-12"
          >
            <div className={`grid gap-4 md:gap-8 ${
              layout === 'grid-3' 
                ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
                : 'grid-cols-2 md:grid-cols-2'
            }`}>
              {featuredItems.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`group relative bg-brand-paper rounded-[24px] md:rounded-[40px] border border-brand-primary/10 overflow-hidden p-5 md:p-8 flex flex-col items-center text-center transition-all hover:bg-white hover:shadow-2xl hover:shadow-brand-primary/10 hover:border-brand-gold/30`}
                >
                  <div className="absolute top-4 right-4 md:top-8 md:right-8 text-brand-gold opacity-20 group-hover:opacity-50 transition-opacity">
                    <Sparkles size={layout === 'grid-3' ? 16 : 24} />
                  </div>

                  <div className="relative mb-4 md:mb-8 pt-4">
                    <motion.div 
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <img 
                        src={item.image} 
                        alt={t(item.name as any)} 
                        className={`${layout === 'grid-3' ? 'w-[100px] md:w-[150px]' : 'w-[130px] md:w-[220px]'} drop-shadow-xl transition-transform duration-700 group-hover:scale-110`}
                        referrerPolicy="no-referrer"
                      />
                    </motion.div>
                    <div className="mt-4 w-16 h-1.5 bg-brand-primary/10 blur-md mx-auto rounded-full" />
                  </div>

                  <div className="flex flex-col items-center w-full">
                    <span className="text-[9px] md:text-[11px] uppercase tracking-[0.25em] font-black text-brand-gold mb-1.5 md:mb-3 bg-brand-beige/20 px-3 py-1 rounded-full border border-brand-primary/5">
                      {t(item.accent as any)} {language === 'en' ? 'COLLECTION' : t('collection')}
                    </span>
                    <h4 className="text-xl md:text-3xl font-serif font-black text-brand-primary mb-1 md:mb-2 tracking-tight leading-none animate-fadeIn">
                      {t(item.name as any)}
                    </h4>
                    {/* Clear & obvious item title/subtitle in grid layouts */}
                    <span className="text-[10px] md:text-xs font-serif italic text-brand-accent mb-3 md:mb-4 px-2 block leading-snug">
                      {t(item.title as any)}
                    </span>
                    {layout !== 'grid-3' && (
                      <p className="text-[10px] md:text-xs text-brand-secondary/60 line-clamp-2 md:line-clamp-3 leading-relaxed mb-6 md:mb-8 max-w-[200px]">
                        {getSliderDesc(item.id, item.description)}
                      </p>
                    )}
                    
                    <Link 
                      to="/collection" 
                      className="text-[8px] md:text-[10px] uppercase tracking-widest font-black text-brand-primary hover:text-brand-accent transition-colors flex items-center gap-1 md:gap-2 font-sans"
                    >
                      {layout === 'grid-3' ? t('view_btn') : t('learn_more_btn')} <span className="text-xs md:text-lg">→</span>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
