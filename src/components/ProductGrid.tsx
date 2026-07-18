import { useState } from 'react';
import { motion } from 'motion/react';
import ProductModal from './ProductModal';
import { useStore, Product } from '../lib/StoreContext';
import { useTranslation } from '../lib/translations';

export default function ProductGrid() {
  const { products } = useStore();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { t } = useTranslation();

  return (
    <section id="collection" className="py-32 px-6 bg-brand-paper">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div className="max-w-md">
            <h2 className="text-4xl md:text-5xl font-serif text-brand-primary mb-6">
              {t('curated_botanicals_normal')} <span className="italic">{t('curated_botanicals_italic')}</span>
            </h2>
            <p className="text-brand-secondary leading-relaxed opacity-80">
              {t('curated_botanicals_desc')}
            </p>
          </div>
          <button className="text-xs uppercase tracking-widest font-medium border-b border-brand-primary pb-1 hover:opacity-60 transition-opacity">
            {t('shop_all')}
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-12">
          {products.map((product, index) => (
            <motion.div 
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group cursor-pointer"
              onClick={() => setSelectedProduct(product)}
            >
              <div className="aspect-[4/5] overflow-hidden bg-brand-light/30 mb-4 md:mb-6 rounded-2xl relative">
                <div className="absolute top-2 left-2 md:top-4 md:left-4 bg-brand-accent text-white text-[6px] md:text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 md:px-2 md:py-1 rounded-full z-10">
                  {t('new_collection')}
                </div>
                <img 
                  src={product.image} 
                  alt={t(product.name as any)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex justify-between items-start gap-1">
                <div>
                  <h3 className="text-xs md:text-xl font-serif text-brand-primary mb-1 italic">{t(product.name as any)}</h3>
                  <p className="text-[8px] md:text-[10px] uppercase tracking-widest text-brand-gold font-bold">{t(product.category as any)}</p>
                </div>
                <span className="text-xs md:text-sm font-sans text-brand-primary/60">{product.price}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <ProductModal 
        product={selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
      />
    </section>
  );
}
