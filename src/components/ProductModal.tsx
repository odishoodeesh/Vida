import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Leaf, Droplets, Sparkles, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useCart } from '../lib/CartContext';
import { Product, useStore } from '../lib/StoreContext';
import { useTranslation } from '../lib/translations';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export default function ProductModal({ product, onClose }: ProductModalProps) {
  const { addToCart } = useCart();
  const { t, language } = useTranslation();
  const [[page, direction], setPage] = useState([0, 0]);

  if (!product) return null;

  const getLocalizedImages = () => {
    if (language === 'ar' && product.localizedImages?.ar) return product.localizedImages.ar;
    if (language === 'kr' && product.localizedImages?.kr) return product.localizedImages.kr;
    return Array.from(new Set([product.image, ...(product.images || [])])).filter(img => img && img.trim() !== '');
  };

  const allImages = getLocalizedImages();
  const currentImageIndex = Math.abs(page % allImages.length);

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    paginate(1);
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    paginate(-1);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
        {/* Backdrop */}
        <motion.div
           id="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-brand-primary/40 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          id="modal-content"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-5xl bg-brand-paper rounded-[40px] overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] md:max-h-[85vh]"
        >
          {/* Close Button */}
          <button 
            id="close-modal-button"
            onClick={onClose}
            className="absolute top-6 right-6 z-30 p-2 bg-white/20 backdrop-blur-md rounded-full text-brand-primary hover:bg-white/40 transition-colors"
          >
            <X size={20} />
          </button>

          {/* Left: Image Carousel */}
          <div className="w-full md:w-1/2 h-[400px] md:h-auto overflow-hidden relative group bg-brand-paper/50 flex items-center justify-center">
            {/* Ambient Blurred Background for Full Aspect Ratio Image Representation */}
            <div className="absolute inset-0 bg-brand-beige/5 overflow-hidden select-none pointer-events-none">
              <img 
                src={allImages[currentImageIndex]} 
                alt="ambient background"
                className="w-full h-full object-cover blur-2xl opacity-40 scale-110 transition-all duration-700" 
                referrerPolicy="no-referrer"
              />
            </div>

            <AnimatePresence initial={false} custom={direction}>
              <motion.img 
                key={page}
                src={allImages[currentImageIndex]}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 }
                }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipe = Math.abs(offset.x) * velocity.x;

                  if (swipe < -10000) {
                    paginate(1);
                  } else if (swipe > 10000) {
                    paginate(-1);
                  }
                }}
                alt={`${product.name} - ${currentImageIndex + 1}`}
                className="absolute inset-0 w-full h-full object-contain p-6 md:p-8 cursor-grab active:cursor-grabbing"
                referrerPolicy="no-referrer"
              />
            </AnimatePresence>

            {/* Navigation Arrows */}
            {allImages.length > 1 && (
              <>
                <button 
                  id="prev-image-button"
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/20 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  id="next-image-button"
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/20 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40"
                >
                  <ChevronRight size={20} />
                </button>
                
                {/* Dots */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                  {allImages.map((_, i) => (
                    <button 
                      key={i}
                      id={`dot-${i}`}
                      onClick={(e) => { e.stopPropagation(); setPage([i, i > currentImageIndex ? 1 : -1]); }}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === currentImageIndex ? 'bg-white w-4' : 'bg-white/40'}`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Swipe Helper Text (Mobile) */}
            <div className="md:hidden absolute bottom-2 left-1/2 -translate-x-1/2 z-20 text-[8px] uppercase tracking-widest text-white/40 font-black">
              {t('swipe_explore')}
            </div>
          </div>

          {/* Right: Details Container */}
          <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto">
            <div className="mb-8">
              <span className="text-[10px] uppercase tracking-[0.4em] font-black text-brand-gold mb-2 block">
                {t(product.category as any)}
              </span>
              <h2 className="text-4xl md:text-5xl font-serif text-brand-primary italic mb-4">{t(product.name as any)}</h2>
              <p className="text-xl text-brand-secondary/60 font-sans">{product.price}</p>
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="text-[10px] uppercase tracking-widest font-bold text-brand-primary/40 mb-3">{t('description')}</h3>
                <p className="text-brand-secondary leading-relaxed font-light italic">
                  {t(product.description as any)}
                </p>
              </div>

              <div>
                <h3 className="text-[10px] uppercase tracking-widest font-bold text-brand-primary/40 mb-4">{t('benefits')}</h3>
                <div className="space-y-4">
                  {product.benefits.map((benefit, i) => {
                    if (!benefit.trim()) return null;
                    const [category, ...descParts] = benefit.split(':');
                    const description = descParts.join(':').trim();
                    const isCategorized = descParts.length > 0;

                    return (
                      <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-brand-beige/5 border border-brand-primary/2">
                        <div className="mt-0.5 text-brand-accent">
                          {isCategorized ? (
                            category.toLowerCase().includes('hair') ? <Leaf size={16} /> :
                            category.toLowerCase().includes('scalp') ? <Droplets size={16} /> :
                            category.toLowerCase().includes('skin') ? <Sparkles size={16} /> :
                            category.toLowerCase().includes('body') ? <Check size={16} /> :
                            <Check size={16} />
                          ) : (
                            <Check size={16} />
                          )}
                        </div>
                        <div className="flex-1">
                          {isCategorized ? (
                            <>
                              <span className="text-[10px] uppercase tracking-widest font-bold text-brand-accent block mb-1">
                                {t(category.trim() as any)}
                              </span>
                              <p className="text-sm text-brand-primary/80 leading-relaxed font-sans">
                                {t(description as any)}
                              </p>
                            </>
                          ) : (
                            <p className="text-sm text-brand-primary/80 leading-relaxed font-sans">
                              {t(benefit as any)}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-8 border-t border-brand-primary/5">
                <button 
                  onClick={() => {
                    addToCart(product);
                    onClose();
                  }}
                  className="w-full bg-brand-primary text-white py-6 rounded-2xl flex items-center justify-center gap-3 group hover:bg-brand-accent transition-colors duration-300"
                >
                  <ShoppingBag size={20} className="group-hover:scale-110 transition-transform" />
                  <span className="text-xs uppercase tracking-[0.3em] font-black">{t('add_to_cart')}</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
