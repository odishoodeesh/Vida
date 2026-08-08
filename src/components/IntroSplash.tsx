import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Logo from './Logo';
import { useStore } from '../lib/StoreContext';

export default function IntroSplash() {
  const { isLoaded } = useStore();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let hideTimer: NodeJS.Timeout;
    if (isLoaded) {
      // Once database data is loaded, smoothly hide splash after brief transition
      hideTimer = setTimeout(() => {
        setIsVisible(false);
      }, 400);
    }

    // Safety fallback so splash never stays indefinitely if network drops
    const maxTimer = setTimeout(() => {
      setIsVisible(false);
    }, 3500);

    return () => {
      if (hideTimer) clearTimeout(hideTimer);
      clearTimeout(maxTimer);
    };
  }, [isLoaded]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          id="intro-splash"
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
          }}
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-brand-paper"
        >
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ 
                duration: 0.8, 
                ease: [0.22, 1, 0.36, 1]
              }}
              className="flex flex-col items-center"
            >
              <Logo className="h-32 md:h-48" variant="full" />
              
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.2, duration: 0.6, ease: "easeInOut" }}
                className="h-[1px] bg-brand-gold/30 mt-8 max-w-[200px]"
              />
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-[10px] uppercase tracking-[0.4em] font-black text-brand-primary mt-6"
              >
                Botanical Excellence
              </motion.p>
            </motion.div>

            {/* Ambient background glow */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.05 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-gold rounded-full blur-[120px] pointer-events-none"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
