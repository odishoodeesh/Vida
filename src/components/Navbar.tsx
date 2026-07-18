import { motion } from 'motion/react';
import Logo from './Logo';
import { Link } from 'react-router-dom';
import { useCart } from '../lib/CartContext';
import { useStore, Language } from '../lib/StoreContext';
import { useTranslation } from '../lib/translations';
import { ShoppingBag, Globe } from 'lucide-react';

interface NavbarProps {
  onCartClick: () => void;
  onMenuClick: () => void;
}

export default function Navbar({ onCartClick, onMenuClick }: NavbarProps) {
  const { totalItems } = useCart();
  const { language, setLanguage } = useStore();
  const { t } = useTranslation();

  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'EN' },
    { code: 'ar', label: 'AR' },
    { code: 'kr', label: 'KR' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-brand-paper/80 backdrop-blur-md border-b border-brand-primary/5">
      <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
        <div className="hidden md:flex space-x-12 text-xs uppercase tracking-widest font-medium text-brand-secondary">
          <Link to="/collection" className="hover:text-brand-primary transition-colors">{t('collection')}</Link>
          <Link to="/philosophy" className="hover:text-brand-primary transition-colors">{t('philosophy')}</Link>
        </div>
        
        <Link to="/">
          <Logo className="h-18" variant="short" />
        </Link>
        
        <div className="hidden md:flex space-x-8 text-xs uppercase tracking-widest font-medium text-brand-secondary items-center">
          {/* Language Switcher */}
          <div className="flex items-center gap-3 border-r border-brand-primary/10 pr-8 mr-2">
            <Globe size={14} className="text-brand-primary/40" />
            <div className="flex gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`px-2 py-1 rounded transition-colors ${
                    language === lang.code 
                    ? 'text-brand-primary font-bold' 
                    : 'text-brand-primary/30 hover:text-brand-primary/60'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          <Link to="/about" className="hover:text-brand-primary transition-colors">{t('about_us')}</Link>
          <button 
            onClick={onCartClick}
            className="hover:text-brand-primary transition-colors flex items-center gap-2 group border-l border-brand-primary/10 pl-8"
          >
            <div className="relative">
              <ShoppingBag size={18} className="group-hover:scale-110 transition-transform" strokeWidth={1.5} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-brand-accent text-white text-[8px] font-black rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </div>
            <span>{t('cart')}</span>
          </button>
        </div>
        
        <div className="md:hidden">
          <button 
            onClick={onMenuClick}
            className="text-brand-primary p-2 hover:bg-brand-primary/5 rounded-xl transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 8h16M4 16h16" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}
