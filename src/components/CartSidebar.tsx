import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, Loader2 } from 'lucide-react';
import { useCart } from '../lib/CartContext';
import { useTranslation } from '../lib/translations';
import { supabase } from '../lib/supabase';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { cart, removeFromCart, updateQuantity, totalPrice, totalItems, clearCart } = useCart();
  const [isOrdering, setIsOrdering] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [orderStep, setOrderStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [orderError, setOrderError] = useState<string | null>(null);
  const { t } = useTranslation();

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;

    setIsOrdering(true);
    setOrderError(null);

    try {
      let createdOrderId: number | string = Date.now();

      // Submit to Supabase if client is initialized
      if (supabase) {
        // 1. Insert order parent record
        const { data: orderData, error: orderErr } = await supabase
          .from('orders')
          .insert([{
            phone_number: phoneNumber,
            total_price: totalPrice,
            status: 'pending'
          }])
          .select();

        if (orderErr) throw orderErr;

        if (orderData && orderData[0]) {
          createdOrderId = orderData[0].id;
          
          // 2. Insert order child item records
          const itemsToInsert = cart.map(item => ({
            order_id: createdOrderId,
            product_name: item.name,
            quantity: item.quantity,
            price: parseFloat(item.price.replace('$', ''))
          }));

          const { error: itemsErr } = await supabase
            .from('order_items')
            .insert(itemsToInsert);

          if (itemsErr) throw itemsErr;
        }
      } else {
        // Fallback: simulate database latency if Supabase is unavailable
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      const newOrder = {
        id: createdOrderId,
        created_at: new Date().toISOString(),
        phone_number: phoneNumber,
        total_price: totalPrice,
        status: 'pending' as const,
        order_items: cart.map((item, index) => ({
          id: index,
          product_name: item.name,
          quantity: item.quantity,
          price: parseFloat(item.price.replace('$', ''))
        }))
      };

      // Store in local storage for admin access / dual-write redundancy
      let existingOrders = [];
      try {
        const saved = localStorage.getItem('vida_orders');
        existingOrders = saved && saved !== 'undefined' ? JSON.parse(saved) : [];
      } catch (e) {
        console.error("Failed to parse existing orders:", e);
      }
      localStorage.setItem('vida_orders', JSON.stringify([newOrder, ...existingOrders]));

      setOrderStep('success');
      clearCart();
    } catch (err: any) {
      console.error('Order error:', err);
      setOrderError('An error occurred while placing your order.');
    } finally {
      setIsOrdering(false);
    }
  };

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
            className="fixed inset-0 z-[110] bg-brand-primary/40 backdrop-blur-sm"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 z-[120] w-full max-w-md bg-brand-paper shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-8 flex items-center justify-between border-b border-brand-primary/5">
              <h2 className="text-2xl font-serif text-brand-primary italic">
                {orderStep === 'success' ? t('order_confirmed') : `${t('your_cart')} (${totalItems})`}
              </h2>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-brand-primary/5 rounded-full text-brand-primary transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-grow overflow-y-auto p-8">
              {orderStep === 'cart' && (
                <>
                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-30 text-center space-y-4">
                      <ShoppingBag size={48} strokeWidth={1} />
                      <p className="text-sm uppercase tracking-widest">{t('cart_empty')}</p>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {cart.map((item) => (
                        <div key={item.id} className="flex gap-6 group">
                          <div className="w-20 h-24 rounded-xl overflow-hidden bg-brand-beige flex-shrink-0">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-grow">
                            <div className="flex justify-between items-start mb-1">
                              <h3 className="font-serif text-brand-primary italic">{item.name}</h3>
                              <button 
                                onClick={() => removeFromCart(item.id)}
                                className="text-brand-primary/20 hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                            <p className="text-[10px] uppercase tracking-widest text-brand-secondary mb-4">{item.category}</p>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-3 border border-brand-primary/10 rounded-full px-2 py-1">
                                <button 
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="p-1 hover:text-brand-accent"
                                >
                                  <Minus size={12} />
                                </button>
                                <span className="text-xs font-mono">{item.quantity}</span>
                                <button 
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="p-1 hover:text-brand-accent"
                                >
                                  <Plus size={12} />
                                </button>
                              </div>
                              <span className="text-sm font-sans text-brand-primary/60">{item.price}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {orderStep === 'checkout' && (
                <div className="space-y-12">
                  <div className="space-y-4">
                    <h3 className="text-sm uppercase tracking-[0.2em] font-black text-brand-gold">{t('delivery_contact')}</h3>
                    <p className="text-sm text-brand-secondary leading-relaxed">
                      {t('delivery_desc')}
                    </p>
                  </div>

                  <form onSubmit={handleOrder} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-black text-brand-primary/40 px-1">{t('phone_number')}</label>
                      <input 
                        required
                        type="tel"
                        placeholder="+964 750 --- ----"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full bg-transparent border-b border-brand-primary/20 py-4 px-1 text-xl font-mono text-brand-primary outline-none focus:border-brand-accent transition-colors"
                      />
                    </div>

                    {orderError && (
                      <p className="text-xs text-red-500 bg-red-50 p-4 rounded-xl border border-red-100">{orderError}</p>
                    )}

                    <div className="pt-8 flex gap-4">
                      <button 
                        type="button"
                        onClick={() => setOrderStep('cart')}
                        className="p-4 border border-brand-primary/10 rounded-2xl hover:bg-brand-primary/5 transition-colors text-xs uppercase font-bold text-brand-secondary"
                      >
                        {t('back')}
                      </button>
                      <button 
                        disabled={isOrdering}
                        className="flex-grow bg-brand-primary text-white py-6 rounded-2xl flex items-center justify-center gap-3 group hover:bg-brand-accent transition-colors duration-300 disabled:opacity-50"
                      >
                        {isOrdering ? (
                          <Loader2 className="animate-spin" size={20} />
                        ) : (
                          <>
                            <span className="text-xs uppercase tracking-[0.3em] font-black">{t('complete_order')}</span>
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {orderStep === 'success' && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-24 h-24 bg-brand-accent/10 text-brand-accent rounded-full flex items-center justify-center mb-4">
                    <ShoppingBag size={48} />
                  </div>
                  <h3 className="text-3xl font-serif text-brand-primary italic">{t('thank_you')}</h3>
                  <p className="text-brand-secondary text-sm leading-relaxed max-w-xs mx-auto">
                    {t('success_desc').replace('{phone}', phoneNumber)}
                  </p>
                  <button 
                    onClick={() => {
                      onClose();
                      setTimeout(() => {
                        setOrderStep('cart');
                        setPhoneNumber('');
                      }, 500);
                    }}
                    className="mt-12 text-xs uppercase tracking-widest font-black border-b border-brand-primary pb-1 hover:opacity-60 transition-opacity"
                  >
                    {t('continue_exploring')}
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && orderStep === 'cart' && (
              <div className="p-8 border-t border-brand-primary/5 bg-brand-beige/30">
                <div className="flex justify-between items-center mb-8">
                  <span className="text-xs uppercase tracking-widest font-black text-brand-primary/40">{t('total')}</span>
                  <span className="text-2xl font-sans text-brand-primary font-light">${totalPrice.toFixed(2)}</span>
                </div>
                <button 
                  onClick={() => setOrderStep('checkout')}
                  className="w-full bg-brand-primary text-white py-6 rounded-2xl flex items-center justify-center gap-3 group hover:bg-brand-accent transition-colors duration-300"
                >
                  <span className="text-xs uppercase tracking-[0.3em] font-black">{t('continue_checkout')}</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
