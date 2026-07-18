import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Filter, Search, SlidersHorizontal, Grid2X2, Grid3X3, LayoutGrid } from 'lucide-react';
import ProductModal from '../components/ProductModal';
import { useStore, Product } from '../lib/StoreContext';
import { useTranslation } from '../lib/translations';

export default function CollectionPage() {
  const { products, categories } = useStore();
  const { t, language } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState("All");

  const getProductImages = (product: Product) => {
    let imgs: string[] = [];
    if (language === 'ar' && product.localizedImages?.ar) {
      imgs = product.localizedImages.ar;
    } else if (language === 'kr' && product.localizedImages?.kr) {
      imgs = product.localizedImages.kr;
    } else {
      imgs = [product.image, ...(product.images || [])];
    }
    return Array.from(new Set(imgs)).filter(img => img && img.trim() !== '');
  };

  const getProductImage = (product: Product) => {
    return getProductImages(product)[0] || product.image;
  };
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [gridCols, setGridCols] = useState<2 | 3 | 4>(4);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           product.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery, products]);

  const gridClass = {
    2: 'grid-cols-2 lg:grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
  }[gridCols as 2 | 3 | 4];

  const gapClass = {
    2: 'gap-x-4 md:gap-x-12 gap-y-8 md:gap-y-24',
    3: 'gap-x-4 md:gap-x-8 gap-y-6 md:gap-y-16',
    4: 'gap-x-4 md:gap-x-6 gap-y-4 md:gap-y-12'
  }[gridCols as 2 | 3 | 4];

  return (
    <div className="pt-32 pb-24 px-6 md:px-12 bg-brand-paper min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-end gap-8"
          >
            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] font-black text-brand-gold mb-4">{t('complete_archive')}</p>
              <h1 className="text-6xl md:text-8xl font-serif text-brand-primary italic leading-none">{t('botanical_collection')}</h1>
            </div>
            
            <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest font-black text-brand-primary/40">
              <span className="w-12 h-px bg-brand-primary/10" />
              <span>{t('showing_selections').replace('{count}', filteredProducts.length.toString())}</span>
            </div>
          </motion.div>
        </header>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-8 mb-16 border-b border-brand-primary/5 pb-12 items-end">
          {/* Categories */}
          <div className="flex-grow flex flex-wrap gap-3">
            <button 
              onClick={() => setSelectedCategory("All")}
              className={`px-6 py-3 rounded-full text-[10px] uppercase tracking-widest font-black transition-all ${
                selectedCategory === "All" 
                ? 'bg-brand-primary text-white' 
                : 'bg-brand-beige text-brand-primary hover:bg-brand-primary/10'
              }`}
            >
              {t('all')}
            </button>
            {categories.map((cat) => (
              <button 
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-6 py-3 rounded-full text-[10px] uppercase tracking-widest font-black transition-all ${
                  selectedCategory === cat.name 
                  ? 'bg-brand-primary text-white shadow-lg' 
                  : 'bg-brand-beige text-brand-primary hover:bg-brand-primary/10'
                }`}
              >
                {t(cat.name as any)}
              </button>
            ))}
          </div>

          {/* Layout Controls */}
          <div className="flex items-center gap-3 bg-brand-beige/50 p-1.5 rounded-2xl border border-brand-primary/5 h-fit">
            <button 
              onClick={() => setGridCols(2)}
              className={`p-2.5 rounded-xl transition-all ${gridCols === 2 ? 'bg-brand-primary text-white shadow-lg' : 'text-brand-primary/30 hover:text-brand-primary/60'}`}
              title={t('full_size')}
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setGridCols(3)}
              className={`p-2.5 rounded-xl transition-all ${gridCols === 3 ? 'bg-brand-primary text-white shadow-lg' : 'text-brand-primary/30 hover:text-brand-primary/60'}`}
              title={t('medium')}
            >
              <Grid2X2 size={18} />
            </button>
            <button 
              onClick={() => setGridCols(4)}
              className={`p-2.5 rounded-xl transition-all ${gridCols === 4 ? 'bg-brand-primary text-white shadow-lg' : 'text-brand-primary/30 hover:text-brand-primary/60'}`}
              title={t('smaller_scale')}
            >
              <Grid3X3 size={18} />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-primary/20 group-focus-within:text-brand-accent transition-colors" size={16} />
            <input 
              type="text" 
              placeholder={t('search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-brand-beige/50 border border-brand-primary/5 rounded-2xl py-4 pl-12 pr-6 text-xs outline-none focus:ring-2 ring-brand-accent/20 transition-all font-medium text-brand-primary"
            />
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <motion.div 
            key={`grid-${gridCols}-${selectedCategory}`}
            layout
            className={`grid ${gridClass} ${gapClass}`}
          >
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ 
                    duration: 0.4,
                    ease: [0.22, 1, 0.36, 1]
                  }}
                  onClick={() => setSelectedProduct(product)}
                  className="group cursor-pointer"
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[32px] mb-6">
                    <img 
                      src={getProductImage(product)} 
                      alt={t(product.name as any)}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-8 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                      <div className="bg-brand-paper/90 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between shadow-xl">
                        <span className="text-[10px] uppercase tracking-widest font-black text-brand-primary">{t('view_details')}</span>
                        <SlidersHorizontal size={14} className="text-brand-accent" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-2">
                    <p className="text-[10px] uppercase tracking-[0.3em] font-black text-brand-gold mb-2">{t(product.category as any)}</p>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-baseline gap-1 sm:gap-2">
                      <h3 className={`font-serif text-brand-primary italic transition-all duration-500 ${
                        gridCols === 4 ? 'text-sm md:text-lg' : gridCols === 3 ? 'text-base md:text-xl' : 'text-lg md:text-3xl'
                      }`}>
                        {t(product.name as any)}
                      </h3>
                      <span className="text-xs sm:text-sm font-sans font-light text-brand-primary/40 leading-none">{product.price}</span>
                    </div>
                    
                    {/* Thumbnails */}
                    <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                      {getProductImages(product).map((img, idx) => (
                        <div 
                          key={idx}
                          className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border border-brand-primary/5 hover:border-brand-accent/30 transition-colors"
                        >
                          <img 
                            src={img} 
                            alt={`${t(product.name as any)} preview ${idx + 1}`}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="py-32 text-center">
            <Filter className="mx-auto text-brand-primary/10 mb-6" size={48} />
            <p className="text-[10px] uppercase tracking-[0.2em] font-black text-brand-primary/30">{t('no_matches')}</p>
          </div>
        )}

        {/* Detailed Product Modal */}
        <ProductModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      </div>
    </div>
  );
}
