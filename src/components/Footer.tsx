import Logo from './Logo';
import { Link } from 'react-router-dom';
import { useTranslation } from '../lib/translations';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-brand-primary text-brand-paper py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          <div className="md:col-span-2">
            <Link to="/admin" className="inline-block hover:opacity-90 transition-opacity">
              <Logo className="h-32 mb-6" theme="light" />
            </Link>
          </div>
          
          <div>
            <h4 className="text-[10px] uppercase tracking-widest font-black text-brand-gold mb-8">{t('navigation')}</h4>
            <ul className="space-y-4 text-sm font-light opacity-60">
              <li><Link to="/collection" className="hover:opacity-100 transition-opacity">{t('collection')}</Link></li>
              <li><Link to="/philosophy" className="hover:opacity-100 transition-opacity">{t('philosophy')}</Link></li>
              <li><Link to="/about" className="hover:opacity-100 transition-opacity">{t('about_us')}</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
