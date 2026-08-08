import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Package, Phone, Calendar, CheckCircle2, Clock, ChevronDown, Plus, Trash2, Edit3, X, Image as ImageIcon, LayoutGrid, ShoppingBag, Lock, LogOut } from 'lucide-react';
import { useStore, Product, Category } from '../lib/StoreContext';
import ImageUpload from '../components/ImageUpload';
import { supabase } from '../lib/supabase';

interface OrderItem {
  id: number;
  product_name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  created_at: string;
  phone_number: string;
  total_price: number;
  status: 'pending' | 'completed' | 'cancelled';
  order_items: OrderItem[];
}

export default function AdminPage() {
  const { products, categories, featuredItems, addProduct, updateProduct, deleteProduct, addCategory, updateCategory, deleteCategory, addFeaturedItem, updateFeaturedItem, deleteFeaturedItem, heroImage, setHeroImage } = useStore();
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'categories' | 'sliders' | 'site'>('orders');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isSliderModalOpen, setIsSliderModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingSlider, setEditingSlider] = useState<any | null>(null);
  const [newCatImage, setNewCatImage] = useState('');
  const [newCatName, setNewCatName] = useState('');

  // Password authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('vida_admin_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'vida.organic@admin') {
      setIsAuthenticated(true);
      try {
        sessionStorage.setItem('vida_admin_auth', 'true');
      } catch (e) {
        console.error('Session storage error:', e);
      }
      setPasswordError('');
      setPasswordInput('');
    } else {
      setPasswordError('Invalid password. Access denied.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    try {
      sessionStorage.removeItem('vida_admin_auth');
    } catch (e) {
      console.error('Session storage error:', e);
    }
  };

  // State for orders - load from localStorage as initial state, then fetch from Supabase if available
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('vida_orders');
      return saved && saved !== 'undefined' ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to parse vida_orders from localStorage:", e);
      return [];
    }
  });

  // Fetch real orders from Supabase if available
  useEffect(() => {
    if (!supabase) return;

    const fetchOrders = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*, order_items(*)');
        
        if (!error && data) {
          // Map to match local Order structure
          const mappedOrders: Order[] = data.map((order: any) => ({
            id: order.id,
            created_at: order.created_at,
            phone_number: order.phone_number,
            total_price: Number(order.total_price),
            status: order.status,
            order_items: (order.order_items || []).map((item: any) => ({
              id: item.id,
              product_name: item.product_name,
              quantity: item.quantity,
              price: Number(item.price)
            }))
          }));

          // Sort descending by id or date
          const sorted = mappedOrders.sort((a, b) => b.id - a.id);
          setOrders(sorted);
          localStorage.setItem('vida_orders', JSON.stringify(sorted));
        } else if (error) {
          console.error("Supabase order fetch error:", error);
        }
      } catch (err) {
        console.error("Failed to fetch orders from Supabase:", err);
      }
    };

    fetchOrders();
  }, []);

  const updateOrderStatus = async (orderId: number, status: Order['status']) => {
    if (supabase) {
      try {
        const { error } = await supabase
          .from('orders')
          .update({ status })
          .eq('id', orderId);
        
        if (error) throw error;
      } catch (err) {
        console.error("Failed to update order status in Supabase:", err);
      }
    }

    const updated = orders.map(o => o.id === orderId ? { ...o, status } : o);
    setOrders(updated);
    try {
      localStorage.setItem('vida_orders', JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save orders to localStorage:", e);
    }
  };

  const deleteOrder = async (orderId: number) => {
    if (supabase) {
      try {
        const { error } = await supabase
          .from('orders')
          .delete()
          .eq('id', orderId);
        
        if (error) throw error;
      } catch (err) {
        console.error("Failed to delete order from Supabase:", err);
      }
    }

    const updated = orders.filter(o => o.id !== orderId);
    setOrders(updated);
    try {
      localStorage.setItem('vida_orders', JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save orders to localStorage:", e);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-28 pb-16 px-4 sm:px-6 bg-brand-paper flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-[24px] sm:rounded-[32px] p-6 sm:p-10 border border-brand-primary/10 shadow-xl text-center space-y-6"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-brand-primary/5 text-brand-gold rounded-full flex items-center justify-center mx-auto">
            <Lock size={24} className="sm:w-7 sm:h-7" />
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-serif text-brand-primary italic mb-1 sm:mb-2">Studio Control</h1>
            <p className="text-[9px] sm:text-[10px] uppercase tracking-widest font-black text-brand-primary/40">Restricted Administration Access</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2 text-left">
              <label className="text-[10px] uppercase tracking-widest font-black text-brand-primary/40 px-1">
                Password
              </label>
              <input 
                type="password"
                required
                autoFocus
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  if (passwordError) setPasswordError('');
                }}
                placeholder="Enter admin password..."
                className="w-full bg-brand-paper border border-brand-primary/10 rounded-xl px-4 py-3.5 text-sm font-mono text-brand-primary outline-none focus:ring-2 ring-brand-accent/30 transition-all"
              />
            </div>

            {passwordError && (
              <p className="text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-100 font-medium">
                {passwordError}
              </p>
            )}

            <button 
              type="submit"
              className="w-full bg-brand-primary text-white py-3.5 sm:py-4 rounded-xl text-xs uppercase tracking-widest font-black hover:bg-brand-accent transition-colors shadow-lg shadow-brand-primary/10"
            >
              Authenticate
            </button>
          </form>

          <div className="pt-4 border-t border-brand-primary/5">
            <a 
              href="/" 
              className="text-[10px] uppercase tracking-widest font-black text-brand-primary/40 hover:text-brand-primary transition-colors"
            >
              ← Return to Storefront
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 sm:pt-32 pb-20 sm:pb-24 px-3 sm:px-6 bg-brand-paper">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 sm:mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 sm:gap-8">
          <div className="w-full md:w-auto">
            <div className="flex items-center justify-between sm:justify-start gap-4 mb-4">
              <h1 className="text-3xl sm:text-5xl font-serif text-brand-primary italic">Studio Control</h1>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-black text-brand-primary/40 hover:text-red-600 transition-colors bg-white px-3 py-1.5 rounded-lg border border-brand-primary/10"
                title="Log Out"
              >
                <LogOut size={12} /> Exit
              </button>
            </div>
            <div className="flex gap-4 sm:gap-8 overflow-x-auto max-w-full pb-2 scrollbar-none whitespace-nowrap">
              {(['orders', 'products', 'categories', 'sliders', 'site'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-[10px] uppercase tracking-[0.2em] font-black transition-all pb-2 border-b-2 shrink-0 ${
                    activeTab === tab ? 'border-brand-accent text-brand-primary' : 'border-transparent text-brand-primary/30'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            {activeTab === 'products' && (
              <button 
                onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand-primary text-white px-5 py-3 rounded-xl text-[10px] uppercase tracking-widest font-black hover:bg-brand-accent transition-colors"
              >
                <Plus size={14} /> Add Product
              </button>
            )}

            {activeTab === 'sliders' && (
              <button 
                onClick={() => { setEditingSlider(null); setIsSliderModalOpen(true); }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand-primary text-white px-5 py-3 rounded-xl text-[10px] uppercase tracking-widest font-black hover:bg-brand-accent transition-colors"
              >
                <Plus size={14} /> Add Slide
              </button>
            )}
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'orders' && (
            <motion.div 
              key="orders"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {orders.length === 0 ? (
                <div className="text-center py-24 border-2 border-dashed border-brand-primary/5 rounded-[40px]">
                  <ShoppingBag size={48} className="mx-auto text-brand-primary/20 mb-4" strokeWidth={1} />
                  <p className="text-brand-primary/40 tracking-widest uppercase text-xs font-black">No orders received yet</p>
                </div>
              ) : (
                orders.map((order) => (
                  <OrderCard key={order.id} order={order} onUpdateStatus={updateOrderStatus} onDelete={deleteOrder} />
                ))
              )}
            </motion.div>
          )}

          {activeTab === 'products' && (
            <motion.div 
              key="products"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {products.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onEdit={() => { setEditingProduct(product); setIsProductModalOpen(true); }}
                  onDelete={() => deleteProduct(product.id)}
                />
              ))}
            </motion.div>
          )}

          {activeTab === 'categories' && (
            <motion.div 
              key="categories"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl"
            >
              <div className="bg-white rounded-[24px] sm:rounded-[40px] p-5 sm:p-10 border border-brand-primary/5 space-y-8 sm:space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 items-end">
                  <div className="space-y-4 sm:space-y-6">
                    <h3 className="text-lg sm:text-xl font-serif text-brand-primary italic">Inscribe New Collection</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-black text-brand-primary/40 px-1">Collection Name</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Pure Essence"
                          value={newCatName}
                          onChange={(e) => setNewCatName(e.target.value)}
                          className="w-full bg-brand-paper rounded-xl px-4 sm:px-6 py-3.5 sm:py-4 text-xs font-black uppercase tracking-widest outline-none focus:ring-2 ring-brand-accent/20"
                        />
                      </div>
                      <ImageUpload 
                        label="Collection Signature Image"
                        value={newCatImage}
                        onChange={setNewCatImage}
                      />
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      if (newCatName.trim()) {
                        addCategory(newCatName.trim(), newCatImage);
                        setNewCatName('');
                        setNewCatImage('');
                      }
                    }}
                    className="w-full bg-brand-primary text-white h-[50px] sm:h-[60px] rounded-2xl text-[10px] uppercase tracking-widest font-black hover:bg-brand-accent transition-colors shadow-xl shadow-brand-primary/10"
                  >
                    Found Collection
                  </button>
                </div>

                <div className="space-y-6 pt-8 sm:pt-10 border-t border-brand-primary/5">
                  <h3 className="text-[10px] uppercase tracking-[0.2em] font-black text-brand-primary/40 mb-4">Manage Collections</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                    {categories.map((cat) => (
                      <CategoryCard 
                        key={cat.id} 
                        category={cat} 
                        onUpdate={(name, image) => updateCategory(cat.id, name, image)} 
                        onDelete={() => deleteCategory(cat.id)} 
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          {activeTab === 'sliders' && (
            <motion.div 
              key="sliders"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
            >
              {featuredItems.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-brand-primary/5 flex gap-3 sm:gap-4 group relative">
                  <div className="w-16 h-20 sm:w-20 sm:h-24 bg-brand-paper rounded-xl overflow-hidden flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="font-serif text-brand-primary italic leading-tight mb-1">{item.name}</h3>
                      <p className="text-[8px] uppercase tracking-widest font-black text-brand-gold line-clamp-1">{item.title}</p>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[10px] uppercase tracking-widest font-medium opacity-40">{item.accent}</span>
                      <div className="flex gap-1.5">
                        <button 
                          onClick={() => { setEditingSlider(item); setIsSliderModalOpen(true); }}
                          className="p-1.5 hover:bg-brand-paper rounded-lg text-brand-primary transition-colors"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button 
                          onClick={() => deleteFeaturedItem(item.id)}
                          className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
          {activeTab === 'site' && (
            <motion.div 
              key="site"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-xl"
            >
              <div className="bg-white rounded-[24px] sm:rounded-[40px] p-5 sm:p-10 border border-brand-primary/5 space-y-6 sm:space-y-8">
                <div>
                  <h3 className="text-lg sm:text-xl font-serif text-brand-primary italic mb-1 sm:mb-2">Home Page Aesthetics</h3>
                  <p className="text-[10px] uppercase tracking-widest font-black text-brand-primary/30">Set the visual mood for your storefront</p>
                </div>
                
                <div className="space-y-4">
                  <ImageUpload 
                    label="Hero Cover Image"
                    value={heroImage}
                    onChange={setHeroImage}
                  />
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-black text-brand-primary/40 px-1">Or Backdrop URL</label>
                    <input 
                      type="text" 
                      value={heroImage}
                      onChange={e => setHeroImage(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-brand-paper border border-brand-primary/5 rounded-xl px-4 py-3 text-[10px] outline-none focus:ring-2 ring-brand-accent/20"
                    />
                  </div>
                </div>

                <div className="pt-4 sm:pt-6 border-t border-brand-primary/5">
                  <p className="text-[9px] text-brand-primary/40 italic">Note: High-resolution vertical or panoramic images work best for the hero section.</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Product Edit Modal */}
        {isProductModalOpen && (
          <ProductFormModal 
            editingProduct={editingProduct}
            categories={categories}
            onClose={() => setIsProductModalOpen(false)}
            onSave={(data) => {
              // Clean up arrays before saving
              const cleanedData = {
                ...data,
                benefits: data.benefits?.filter(b => b && b.trim() !== '') || [],
                images: data.images?.filter(img => img && img.trim() !== '') || []
              };
              if (editingProduct) updateProduct(editingProduct.id, cleanedData);
              else addProduct(cleanedData as any);
              setIsProductModalOpen(false);
            }}
          />
        )}

        {/* Slider Edit Modal */}
        {isSliderModalOpen && (
          <SliderFormModal 
            editingSlider={editingSlider}
            onClose={() => setIsSliderModalOpen(false)}
            onSave={(data) => {
              if (editingSlider) updateFeaturedItem(editingSlider.id, data);
              else addFeaturedItem(data as any);
              setIsSliderModalOpen(false);
            }}
          />
        )}
      </div>
    </div>
  );
}

function SliderFormModal({ editingSlider, onClose, onSave }: { 
  editingSlider: any | null, 
  onClose: () => void, 
  onSave: (data: any) => void 
}) {
  const [formData, setFormData] = useState(editingSlider || {
    title: '',
    name: '',
    description: '',
    image: '',
    accent: ''
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="fixed inset-0 bg-brand-primary/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-2xl bg-brand-paper rounded-[24px] sm:rounded-[40px] shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]"
      >
        <div className="p-5 sm:p-8 border-b border-brand-primary/5 flex justify-between items-center shrink-0">
          <h2 className="text-xl sm:text-2xl font-serif text-brand-primary italic">
            {editingSlider ? 'Edit Slide' : 'New Home Slide'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-brand-primary/5 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 sm:p-10 space-y-5 sm:space-y-6 overflow-y-auto flex-grow">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-black text-brand-primary/40 px-1">Display Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. Jojoba"
                className="w-full bg-white border border-brand-primary/5 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-brand-accent/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-black text-brand-primary/40 px-1">Accent Text</label>
              <input 
                type="text" 
                value={formData.accent}
                onChange={e => setFormData({...formData, accent: e.target.value})}
                placeholder="e.g. Desert"
                className="w-full bg-white border border-brand-primary/5 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-brand-accent/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-black text-brand-primary/40 px-1">Catchy Title</label>
            <input 
              type="text" 
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder="e.g. Biomimetic Skin Harmony"
              className="w-full bg-white border border-brand-primary/5 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-brand-accent/20"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-black text-brand-primary/40 px-1">Description</label>
            <textarea 
              rows={3}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full bg-white border border-brand-primary/5 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-brand-accent/20 italic"
            />
          </div>

          <div className="space-y-2">
            <ImageUpload 
              label="Floating PNG Upload"
              value={formData.image}
              onChange={val => setFormData({...formData, image: val})}
            />
            <p className="text-[8px] text-brand-primary/30 px-1 italic">Or paste URL below</p>
            <input 
              type="text" 
              value={formData.image}
              onChange={e => setFormData({...formData, image: e.target.value})}
              placeholder="https://..."
              className="w-full bg-white border border-brand-primary/5 rounded-xl px-4 py-3 text-[10px] outline-none"
            />
          </div>
        </div>

        <div className="p-4 sm:p-8 bg-brand-paper border-t border-brand-primary/5 flex justify-end gap-3 sm:gap-4 shrink-0">
          <button onClick={onClose} className="px-5 sm:px-8 py-3.5 sm:py-4 text-[10px] uppercase tracking-widest font-black text-brand-primary/40 hover:text-brand-primary transition-colors">Cancel</button>
          <button 
            onClick={() => onSave(formData)}
            className="bg-brand-primary text-white px-8 sm:px-12 py-3.5 sm:py-4 rounded-xl text-[10px] uppercase tracking-widest font-black hover:bg-brand-accent transition-colors"
          >
            Save Slide
          </button>
        </div>
      </motion.div>
    </div>
  );
}

interface OrderCardProps {
  order: Order;
  onUpdateStatus: (id: number, status: Order['status']) => void;
  onDelete: (id: number) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onUpdateStatus, onDelete }) => {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[24px] sm:rounded-[32px] p-4 sm:p-8 border border-brand-primary/5 shadow-sm hover:shadow-md transition-shadow relative group"
    >
      {!isConfirmingDelete ? (
        <button 
          onClick={() => setIsConfirmingDelete(true)}
          className="absolute top-4 right-4 sm:top-8 sm:right-8 p-2 text-red-300 hover:text-red-500 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
        >
          <Trash2 size={16} />
        </button>
      ) : (
        <div className="absolute top-4 right-4 sm:top-8 sm:right-8 flex items-center gap-2 bg-red-50 px-3 py-1 rounded-lg border border-red-100 z-10">
          <span className="text-[8px] uppercase font-black text-red-600">Delete?</span>
          <button onClick={() => onDelete(order.id)} className="text-[8px] font-black text-red-600 hover:underline">Yes</button>
          <button onClick={() => setIsConfirmingDelete(false)} className="text-[8px] font-black text-brand-primary/40">No</button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row justify-between gap-6 sm:gap-8">
        <div className="flex-grow space-y-4 sm:space-y-6">
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 pr-8 sm:pr-0">
            <div className="flex items-center gap-2 text-brand-primary">
              <Phone size={14} className="sm:w-4 sm:h-4" />
              <span className="font-mono text-base sm:text-lg">{order.phone_number}</span>
            </div>
            <div className="flex items-center gap-2 text-brand-secondary text-[10px] sm:text-xs uppercase tracking-widest">
              <Calendar size={12} className="sm:w-3.5 sm:h-3.5" />
              {new Date(order.created_at).toLocaleDateString()}
            </div>
            <div className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-brand-beige text-brand-primary text-[9px] sm:text-[10px] uppercase tracking-widest font-black">
              #{order.id}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {order.order_items.map((item, i) => (
              <div key={i} className="flex justify-between items-center bg-brand-paper/50 p-3 sm:p-4 rounded-xl border border-brand-primary/5">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <span className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center bg-brand-primary text-white text-[9px] sm:text-[10px] rounded-md font-bold">
                    {item.quantity}
                  </span>
                  <span className="text-xs sm:text-sm font-serif italic text-brand-primary">{item.product_name}</span>
                </div>
                <span className="text-[10px] font-mono text-brand-primary/40">${item.price}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:w-64 flex flex-row lg:flex-col justify-between items-end sm:items-center lg:items-end gap-4 sm:gap-6 pt-4 lg:pt-0 border-t lg:border-t-0 border-brand-primary/5">
          <div className="text-left lg:text-right">
            <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-black text-brand-primary/40 mb-1">Order Status</p>
            <div className="relative group/status">
              <button className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-[9px] sm:text-[10px] uppercase tracking-widest font-black transition-colors ${
                order.status === 'completed' ? 'bg-green-50 text-green-700' : 
                order.status === 'cancelled' ? 'bg-red-50 text-red-700' : 'bg-brand-primary text-white'
              }`}>
                {order.status} <ChevronDown size={14} />
              </button>
              <div className="absolute top-full left-0 lg:left-auto lg:right-0 mt-2 bg-white rounded-2xl shadow-xl border border-brand-primary/5 p-2 hidden group-hover/status:block z-20 w-40">
                {(['pending', 'completed', 'cancelled'] as const).map(s => (
                  <button 
                    key={s}
                    onClick={() => onUpdateStatus(order.id, s)}
                    className="w-full text-left px-4 py-3 rounded-xl hover:bg-brand-paper text-[10px] uppercase tracking-widest font-black text-brand-primary capitalize"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-black text-brand-primary/40 mb-1">Total Amount</p>
            <p className="text-2xl sm:text-3xl font-sans font-light text-brand-primary tracking-tight">${order.total_price.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

interface ProductCardProps {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onEdit, onDelete }) => {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-brand-primary/5 flex gap-3 sm:gap-4 group relative">
      {isConfirmingDelete && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl z-10 flex flex-col items-center justify-center p-4 text-center">
          <p className="text-[10px] uppercase tracking-widest font-black text-brand-primary mb-3">Delete this item?</p>
          <div className="flex gap-3">
            <button onClick={onDelete} className="bg-red-500 text-white px-5 py-1.5 rounded-xl text-[10px] uppercase tracking-widest font-black shadow-lg shadow-red-200">Confirm</button>
            <button onClick={() => setIsConfirmingDelete(false)} className="bg-brand-beige text-brand-primary px-5 py-1.5 rounded-xl text-[10px] uppercase tracking-widest font-black">Cancel</button>
          </div>
        </div>
      )}
      <div className="w-16 h-20 sm:w-20 sm:h-24 bg-brand-paper rounded-xl overflow-hidden flex-shrink-0">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
      </div>
      <div className="flex-grow flex flex-col justify-between">
        <div>
          <h3 className="font-serif text-brand-primary italic leading-tight mb-1 text-sm sm:text-base">{product.name}</h3>
          <p className="text-[8px] uppercase tracking-widest font-black text-brand-gold">{product.category}</p>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs sm:text-sm font-mono text-brand-primary/60">{product.price}</span>
          <div className="flex gap-1.5">
            <button 
              onClick={onEdit}
              className="p-1.5 hover:bg-brand-paper rounded-lg text-brand-primary transition-colors"
            >
              <Edit3 size={15} />
            </button>
            <button 
              onClick={() => setIsConfirmingDelete(true)}
              className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface CategoryCardProps {
  category: Category;
  onUpdate: (name: string, image?: string) => void;
  onDelete: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [editName, setEditName] = useState(category.name);
  const [editImage, setEditImage] = useState(category.image || '');

  if (isEditing) {
    return (
      <div className="bg-brand-paper p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-brand-accent/20 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="space-y-2">
            <label className="text-[8px] uppercase tracking-widest font-black text-brand-primary/40 px-1">Name</label>
            <input 
              type="text" 
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full bg-white px-3 sm:px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none ring-1 ring-brand-accent/10"
            />
          </div>
          <ImageUpload 
            value={editImage}
            onChange={setEditImage}
            className="aspect-square"
          />
        </div>
        <div className="flex gap-2 justify-end">
          <button 
            onClick={() => { setEditName(category.name); setEditImage(category.image || ''); setIsEditing(false); }}
            className="px-3 py-1.5 text-[10px] uppercase font-black text-brand-primary/40"
          >
            Cancel
          </button>
          <button 
            onClick={() => { if(editName.trim()) { onUpdate(editName.trim(), editImage); setIsEditing(false); } }}
            className="bg-brand-primary text-white px-5 py-1.5 rounded-xl text-[10px] uppercase font-black"
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-brand-primary/5 group relative overflow-hidden">
      <div className="flex gap-3 sm:gap-4 items-center">
        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-brand-paper overflow-hidden flex-shrink-0 flex items-center justify-center">
          {category.image ? (
            <img src={category.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <LayoutGrid size={20} className="text-brand-primary/10 sm:w-6 sm:h-6" />
          )}
        </div>
        <div className="flex-grow">
          <h3 className="text-xs font-black uppercase tracking-widest text-brand-primary">{category.name}</h3>
          <div className="flex gap-2 mt-2">
            <button onClick={() => setIsEditing(true)} className="p-1 px-2 rounded-lg bg-brand-paper text-brand-primary hover:bg-brand-primary hover:text-white transition-all">
              <Edit3 size={12} />
            </button>
            <button onClick={onDelete} className="p-1 px-2 rounded-lg bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all">
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function ProductFormModal({ editingProduct, categories, onClose, onSave }: { 
  editingProduct: Product | null, 
  categories: any[], 
  onClose: () => void, 
  onSave: (data: Partial<Product>) => void 
}) {
  const [formData, setFormData] = useState<Partial<Product>>(() => {
    const base = editingProduct || {
      name: '',
      category: categories[0]?.name || '',
      price: '$0',
      image: '',
      images: ['', '', ''],
      localizedImages: { ar: ['', ''], kr: ['', ''] },
      description: '',
      benefits: ['', '', '']
    };

    // Ensure localizedImages structure even for older products
    return {
      ...base,
      localizedImages: base.localizedImages || { ar: ['', ''], kr: ['', ''] }
    };
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="fixed inset-0 bg-brand-primary/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-4xl bg-brand-paper rounded-[24px] sm:rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col my-auto"
      >
        <div className="p-5 sm:p-8 border-b border-brand-primary/5 flex justify-between items-center shrink-0">
          <h2 className="text-xl sm:text-2xl font-serif text-brand-primary italic">
            {editingProduct ? 'Edit Botanical' : 'New Creation'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-brand-primary/5 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-5 sm:p-10 space-y-6 sm:space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-black text-brand-primary/40 px-1">Product Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-white border border-brand-primary/5 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-brand-accent/20"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-black text-brand-primary/40 px-1">Category</label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-white border border-brand-primary/5 rounded-xl px-4 py-3 text-sm outline-none"
                  >
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-black text-brand-primary/40 px-1">Price</label>
                  <input 
                    type="text" 
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                    className="w-full bg-white border border-brand-primary/5 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-brand-accent/20"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <ImageUpload 
                  label="Featured Image"
                  value={formData.image || ''}
                  onChange={val => setFormData({...formData, image: val})}
                />
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-black text-brand-primary/40 px-1">Or Image URL</label>
                  <input 
                    type="text" 
                    value={formData.image}
                    onChange={e => setFormData({...formData, image: e.target.value})}
                    className="w-full bg-white border border-brand-primary/5 rounded-xl px-4 py-2 text-[10px] outline-none"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-black text-brand-primary/40 px-1">Description</label>
                <textarea 
                  rows={4}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-white border border-brand-primary/5 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-brand-accent/20 italic"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-black text-brand-primary/40 px-1">Benefits (one per line)</label>
                <textarea 
                  rows={3}
                  value={formData.benefits?.join('\n')}
                  onChange={e => setFormData({...formData, benefits: e.target.value.split('\n')})}
                  className="w-full bg-white border border-brand-primary/5 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 ring-brand-accent/20"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-6 sm:pt-10 border-t border-brand-primary/5">
            <h3 className="text-[10px] uppercase tracking-widest font-black text-brand-primary/40">Gallery Carousel (Main Image Uploads)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[0, 1, 2].map(i => (
                <div key={`main-${i}`}>
                  <ImageUpload 
                    value={formData.images?.[i] || ''}
                    onChange={val => {
                      const newImages = [...(formData.images || [])];
                      newImages[i] = val;
                      setFormData({...formData, images: newImages});
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-4 sm:pt-6">
            <h3 className="text-[10px] uppercase tracking-widest font-black text-brand-primary/40">Localized Arabic Images</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[0, 1].map(i => (
                <div key={`ar-${i}`}>
                  <ImageUpload 
                    value={formData.localizedImages?.ar?.[i] || ''}
                    onChange={val => {
                      const newAr = [...(formData.localizedImages?.ar || ['', ''])];
                      newAr[i] = val;
                      setFormData({...formData, localizedImages: { ...formData.localizedImages, ar: newAr } as any});
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-4 sm:pt-6">
            <h3 className="text-[10px] uppercase tracking-widest font-black text-brand-primary/40">Localized Kurdish Images</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[0, 1].map(i => (
                <div key={`kr-${i}`}>
                  <ImageUpload 
                    value={formData.localizedImages?.kr?.[i] || ''}
                    onChange={val => {
                      const newKr = [...(formData.localizedImages?.kr || ['', ''])];
                      newKr[i] = val;
                      setFormData({...formData, localizedImages: { ...formData.localizedImages, kr: newKr } as any});
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-8 bg-brand-paper border-t border-brand-primary/5 flex justify-end gap-3 sm:gap-4 shrink-0">
          <button onClick={onClose} className="px-5 sm:px-8 py-3.5 sm:py-4 text-[10px] uppercase tracking-widest font-black text-brand-primary/40 hover:text-brand-primary transition-colors">Cancel</button>
          <button 
            onClick={() => onSave(formData)}
            className="bg-brand-primary text-white px-8 sm:px-12 py-3.5 sm:py-4 rounded-xl text-[10px] uppercase tracking-widest font-black hover:bg-brand-accent transition-colors"
          >
            {editingProduct ? 'Save Changes' : 'Found Creation'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
