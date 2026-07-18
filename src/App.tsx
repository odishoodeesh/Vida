import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { useState } from 'react';
import Navbar from './components/Navbar';
import MobileMenu from './components/MobileMenu';
import IntroSplash from './components/IntroSplash';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import CartSidebar from './components/CartSidebar';
import AIAssistant from './components/AIAssistant';
import { CartProvider } from './lib/CartContext';
import { StoreProvider } from './lib/StoreContext';

import HomePage from './pages/HomePage';
import CollectionPage from './pages/CollectionPage';
import PhilosophyPage from './pages/PhilosophyPage';
import AboutPage from './pages/AboutPage';
import AdminPage from './pages/AdminPage';

export default function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <StoreProvider>
      <CartProvider>
        <IntroSplash />
        <Router>
          <ScrollToTop />
          <main className="min-h-screen bg-brand-paper font-sans">
            <Navbar 
              onCartClick={() => setIsCartOpen(true)} 
              onMenuClick={() => setIsMenuOpen(true)} 
            />
            <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
            <MobileMenu 
              isOpen={isMenuOpen} 
              onClose={() => setIsMenuOpen(false)} 
              onCartClick={() => setIsCartOpen(true)}
            />
            <AIAssistant />
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/collection" element={<CollectionPage />} />
                <Route path="/philosophy" element={<PhilosophyPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/admin" element={<AdminPage />} />
              </Routes>
            </AnimatePresence>
            <Footer />
          </main>
        </Router>
      </CartProvider>
    </StoreProvider>
  );
}
