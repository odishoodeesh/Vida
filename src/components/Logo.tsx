import { motion } from 'motion/react';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'short';
  theme?: 'dark' | 'light';
}

const LOGO_URLS = {
  'full-dark': 'https://i.ibb.co/67GLkv94/LOGO-VIDABOTANICALS.png',
  'full-light': 'https://i.ibb.co/NH42g57/LOGO-VIDABOTANICALS1.png',
  'short-dark': 'https://i.ibb.co/cX1cbmPq/LOGO-VIDA.png',
  'short-light': 'https://i.ibb.co/pB5v7FRx/LOGO-VIDA1.png',
};

export default function Logo({ className = "h-16", variant = "full", theme = "dark" }: LogoProps) {
  const key = `${variant}-${theme}` as keyof typeof LOGO_URLS;
  const logoUrl = LOGO_URLS[key];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`relative inline-flex items-center justify-center ${className} select-none`}
    >
      <img 
        src={logoUrl} 
        alt="VIDA logo" 
        className="h-full w-auto object-contain"
        referrerPolicy="no-referrer"
      />
    </motion.div>
  );
}
