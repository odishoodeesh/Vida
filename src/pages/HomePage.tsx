import Hero from '../components/Hero';
import FloatingSlider from '../components/FloatingSlider';
import AboutSection from '../components/AboutSection';
import { motion } from 'motion/react';

export default function HomePage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Hero />
      <FloatingSlider />
      <AboutSection />
    </motion.div>
  );
}
