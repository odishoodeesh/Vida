import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Globe, Info, Heart, LayoutGrid } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore, Language } from '../lib/StoreContext';
import { useTranslation } from '../lib/translations';
import { useCart } from '../lib/CartContext';
import Logo from './Logo';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onCartClick: () => void;
}

export default function MobileMenu({ isOpen, onClose, onCartClick }: MobileMenuProps) {
  const { language, setLanguage } = useStore();
  const { totalItems } = useCart();
  const { t } = useTranslation();

  const isRtl = language === 'ar' || language === 'kr';

  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'ar', label: 'العربية' },
    { code: 'kr', label: 'کوردى (بادينى)' },
  ];

  const menuItems = [
    { name: t('collection'), path: '/collection', icon: <LayoutGrid size={18} /> },
    { name: t('philosophy'), path: '/philosophy', icon: <Heart size={18} /> },
    { name: t('about_us'), path: '/about', icon: <Info size={18} /> },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-brand-primary/40 backdrop-blur-sm z-[100] md:hidden"
            id="mobile-menu-backdrop"
          />

          {/* Menu Panel */}
          <motion.div
            initial={{ x: isRtl ? '100%' : '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: isRtl ? '100%' : '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed inset-y-0 ${isRtl ? 'right-0' : 'left-0'} w-[80%] max-w-xs bg-brand-paper shadow-2xl z-[101] md:hidden flex flex-col`}
            id="mobile-menu-panel"
          >
            <div className="p-6 h-24 flex items-center justify-between border-b border-brand-primary/5">
              <Logo className="h-10" variant="short" />
              <button 
                onClick={onClose}
                className="p-2 text-brand-primary/40 hover:text-brand-primary transition-colors hover:bg-brand-primary/5 rounded-full"
                id="mobile-menu-close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto py-8 bg-brand-paper">
              <div className="space-y-2 px-4">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className="flex items-center gap-4 p-4 text-[10px] uppercase tracking-[0.3em] font-black text-brand-secondary hover:text-brand-primary hover:bg-brand-primary/5 rounded-2xl transition-all"
                  >
                    <span className="text-brand-gold/40">{item.icon}</span>
                    {item.name}
                  </Link>
                ))}
              </div>

              <div className="mt-12 px-8">
                <div className="flex items-center gap-3 mb-6">
                  <Globe size={14} className="text-brand-primary/20" />
                  <span className="text-[10px] uppercase tracking-widest font-black text-brand-primary/30">{t('language')}</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        onClose();
                      }}
                      className={`px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                        language === lang.code 
                          ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/10' 
                          : 'text-brand-primary/40 hover:bg-brand-primary/5'
                      }`}
                      style={{ textAlign: language === 'en' ? 'left' : 'right' }}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-brand-primary/5 bg-brand-beige/20">
              <button 
                onClick={() => {
                  onClose();
                  onCartClick();
                }}
                className="w-full flex items-center justify-between bg-brand-primary text-white p-5 rounded-2xl shadow-xl shadow-brand-primary/10 hover:bg-brand-accent transition-all"
                id="mobile-menu-view-cart"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <ShoppingBag size={20} />
                    {totalItems > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-accent text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-brand-primary">
                        {totalItems}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] uppercase tracking-widest font-black">{t('view_cart')}</span>
                </div>
                <span className="text-white/40">{isRtl ? '←' : '→'}</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
