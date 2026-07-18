import Logo from './Logo';
import { Link } from 'react-router-dom';
import { useTranslation } from '../lib/translations';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-brand-primary text-brand-paper py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-24">
          <div className="md:col-span-2">
            <Logo className="h-32 mb-12" theme="light" />

          </div>
          
          <div>
            <h4 className="text-[10px] uppercase tracking-widest font-black text-brand-gold mb-8">{t('navigation')}</h4>
            <ul className="space-y-4 text-sm font-light opacity-60">
              <li><Link to="/collection" className="hover:opacity-100 transition-opacity">{t('collection')}</Link></li>
              <li><Link to="/philosophy" className="hover:opacity-100 transition-opacity">{t('philosophy')}</Link></li>
              <li><Link to="/about" className="hover:opacity-100 transition-opacity">{t('about_us')}</Link></li>
              <li><Link to="/admin" className="text-brand-gold/60 hover:text-brand-gold transition-colors">{t('admin_dashboard')}</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-top border-brand-paper/10 text-[10px] uppercase tracking-widest font-medium opacity-40">
          <span>&copy; MMXXVI {t('footer_brand')}</span>
          <Link to="/admin" className="mt-4 md:mt-0 hover:opacity-100 transition-opacity">{t('admin_access')}</Link>
          <span className="mt-4 md:mt-0 italic">{t('about_p3')}</span>
        </div>
      </div>
    </footer>
  );
}
