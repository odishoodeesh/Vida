import { useState, useEffect, useRef } from 'react';
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
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      setIsScrolled(currentScrollY > 20);

      // Hide navbar when scrolling down past 60px, show when scrolling up or near top
      if (currentScrollY > 60 && currentScrollY > lastScrollY.current) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'EN' },
    { code: 'ar', label: 'AR' },
    { code: 'kr', label: 'KR' },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 w-full z-[300] transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      } ${
        isScrolled 
          ? 'bg-brand-paper/98 backdrop-blur-xl shadow-md border-b border-brand-primary/10' 
          : 'bg-brand-paper/90 backdrop-blur-md border-b border-brand-primary/5'
      }`}
    >
      <div 
        className={`max-w-7xl mx-auto px-6 flex items-center justify-between transition-all duration-300 ${
          isScrolled ? 'h-16 md:h-20' : 'h-20 md:h-24'
        }`}
      >
        <div className="hidden md:flex space-x-12 text-xs uppercase tracking-widest font-medium text-brand-primary/80">
          <Link to="/collection" className="hover:text-brand-primary transition-colors">{t('collection')}</Link>
          <Link to="/philosophy" className="hover:text-brand-primary transition-colors">{t('philosophy')}</Link>
        </div>
        
        <Link to="/" className="flex items-center">
          <Logo className={`transition-all duration-300 ${isScrolled ? 'h-12 md:h-14' : 'h-16 md:h-18'}`} variant="short" />
        </Link>
        
        <div className="hidden md:flex space-x-8 text-xs uppercase tracking-widest font-medium text-brand-primary/80 items-center">
          {/* Language Switcher */}
          <div className="flex items-center gap-3 border-r border-brand-primary/10 pr-8 mr-2">
            <Globe size={14} className="text-brand-primary/50" />
            <div className="flex gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`px-2 py-1 rounded transition-colors ${
                    language === lang.code 
                    ? 'text-brand-primary font-bold bg-brand-primary/5' 
                    : 'text-brand-primary/40 hover:text-brand-primary/70'
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
            className="hover:text-brand-primary transition-colors flex items-center gap-2 group border-l border-brand-primary/10 pl-8 cursor-pointer"
          >
            <div className="relative">
              <ShoppingBag size={18} className="group-hover:scale-110 transition-transform" strokeWidth={1.5} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-brand-accent text-white text-[8px] font-black rounded-full flex items-center justify-center shadow-sm">
                  {totalItems}
                </span>
              )}
            </div>
            <span>{t('cart')}</span>
          </button>
        </div>
        
        <div className="md:hidden flex items-center gap-3">
          <button 
            onClick={onCartClick}
            className="relative text-brand-primary p-2 hover:bg-brand-primary/5 rounded-xl transition-all cursor-pointer"
            aria-label="Cart"
          >
            <ShoppingBag size={20} strokeWidth={1.5} />
            {totalItems > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-brand-accent text-white text-[8px] font-black rounded-full flex items-center justify-center shadow-sm">
                {totalItems}
              </span>
            )}
          </button>
          <button 
            onClick={onMenuClick}
            className="text-brand-primary p-2 hover:bg-brand-primary/5 rounded-xl transition-all cursor-pointer"
            aria-label="Open menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8h16M4 16h16" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}

