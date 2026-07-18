import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type Language = 'en' | 'ar' | 'kr';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: string;
  image: string;
  images: string[];
  localizedImages?: {
    ar: string[];
    kr: string[];
  };
  description: string;
  benefits: string[];
}

export interface Category {
  id: string;
  name: string;
  image?: string;
}

export interface FeaturedItem {
  id: string;
  title: string;
  name: string;
  description: string;
  image: string;
  accent: string;
}

interface StoreContextType {
  products: Product[];
  categories: Category[];
  featuredItems: FeaturedItem[];
  language: Language;
  setLanguage: (lang: Language) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addCategory: (name: string, image?: string) => void;
  updateCategory: (id: string, name: string, image?: string) => void;
  deleteCategory: (id: string) => void;
  addFeaturedItem: (item: Omit<FeaturedItem, 'id'>) => void;
  updateFeaturedItem: (id: string, item: Partial<FeaturedItem>) => void;
  deleteFeaturedItem: (id: string) => void;
  heroImage: string;
  setHeroImage: (url: string) => void;
}

const INITIAL_CATEGORIES: Category[] = [
  { id: '1', name: 'Specialty Care' },
  { id: '2', name: 'Deep Moisture' },
  { id: '3', name: 'Gold Collection' },
];

const INITIAL_FEATURED: FeaturedItem[] = [
  {
    id: 'featured',
    title: 'The Essence of Botanical Pureness',
    name: 'Featured Blend',
    description: 'Bridge the gap between ancient botanical wisdom and modern skin science. Cold-pressed, unrefined, and meticulously filtered for maximum potency.',
    image: 'https://i.ibb.co/ksJCbHMQ/4403116-removebg-preview-1.png',
    accent: 'Gold'
  },
  {
    id: 'jojoba',
    title: 'Biomimetic Skin Harmony',
    name: 'Jojoba',
    description: 'Technically a liquid wax, Jojoba mimics the skin\'s natural sebum, providing a breathable barrier that regulates oil production and restores balance.',
    image: 'https://i.ibb.co/GvK1M7Lr/Jojoba.png',
    accent: 'Desert'
  },
  {
    id: 'rosemary',
    title: 'Stimulate & Clarify',
    name: 'Rosemary',
    description: 'A revitalizing botanical masterpiece. Rosemary stimulates micro-circulation to the scalp while providing clarifying benefits for blemish-prone complexions.',
    image: 'https://i.ibb.co/KcKj7RbQ/Rosemary.png',
    accent: 'Verdant'
  },
  {
    id: 'flax',
    title: 'Omega-Rich Radiance',
    name: 'Flax Seed',
    description: 'Brimming with high-concentration Omega-3 fatty acids, our Flax Seed oil stabilizes the skin barrier and calms seasonal sensitivity for a resilient glow.',
    image: 'https://i.ibb.co/KcKj7RbQ/Rosemary.png',
    accent: 'Flaxen'
  },
  {
    id: 'almond',
    title: 'Gentle Deep Comfort',
    name: 'Almond Oil',
    description: 'The ultimate daily moisturizer for sensitive souls. Rich in proteins and Vitamin E, it deeply softens skin texture and improves overall complexion tone.',
    image: 'https://i.ibb.co/zhWfz4dC/Almond-Oil.png',
    accent: 'Sweet'
  }
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: "Castor Oil",
    category: "Specialty Care",
    price: "$32",
    image: "https://i.ibb.co/FL44q5F6/Vida-Castor-Oil-Slide-1-Arabic.png",
    images: ["https://i.ibb.co/FL44q5F6/Vida-Castor-Oil-Slide-1-Arabic.png", "https://i.ibb.co/8gMqJwYS/Vida-Castor-Oil-Slide-2-Arabic.png"],
    localizedImages: {
      ar: ["https://i.ibb.co/FL44q5F6/Vida-Castor-Oil-Slide-1-Arabic.png", "https://i.ibb.co/8gMqJwYS/Vida-Castor-Oil-Slide-2-Arabic.png"],
      kr: ["https://i.ibb.co/FbPHxyW2/Vida-Castor-Oil-Slide-1-Kurdish.png", "https://i.ibb.co/8gMqJwYS/Vida-Castor-Oil-Slide-2-Arabic.png"]
    },
    description: "Botanical Castor Oil. A powerhouse for thickness and hydration.",
    benefits: [
      "Hair: Encourages thicker hair and shine.",
      "Scalp: Deeply conditions and strengthens roots.",
      "Skin: Locks in moisture and improves elasticity.",
      "Body: Protective and deeply hydrating."
    ]
  },
  {
    id: '2',
    name: "Rosemary",
    category: "Specialty Care",
    price: "$36",
    image: "https://i.ibb.co/NgR7yQtR/Rosemary-Vida-1-Arabic.png",
    images: ["https://i.ibb.co/NgR7yQtR/Rosemary-Vida-1-Arabic.png", "https://i.ibb.co/hRwKPgZp/Rosemary-Vida-2-Arabic.png"],
    localizedImages: {
      ar: ["https://i.ibb.co/NgR7yQtR/Rosemary-Vida-1-Arabic.png", "https://i.ibb.co/hRwKPgZp/Rosemary-Vida-2-Arabic.png"],
      kr: ["https://i.ibb.co/V0XrMCcz/Rosemary-Vida-1-Kurdish.png", "https://i.ibb.co/LzsgpWFw/Rosemary-Vida-2-Kurdish.png"]
    },
    description: "Botanical Rosemary Oil. Stimulating and revitalizing for hair and scalp.",
    benefits: [
      "Hair: Supports stronger, thicker-looking hair.",
      "Scalp: Stimulates circulation, helps reduce shedding and dandruff.",
      "Skin: Balances oil and helps clarify blemish-prone skin.",
      "Body: Energizing aroma that improves focus and vitality."
    ]
  },
  {
    id: '3',
    name: "Almond Oil",
    category: "Deep Moisture",
    price: "$34",
    image: "https://i.ibb.co/sd6MQdD5/Almond-Oil-Slide-1-Arabic.png",
    images: [
      "https://i.ibb.co/sd6MQdD5/Almond-Oil-Slide-1-Arabic.png",
      "https://i.ibb.co/v6B0BHQG/Vida-Almond-Oil-Slide-2-Arabic.png",
      "https://i.ibb.co/W4GRLtjq/Almond-Oil-Slide-2-Arabic.png",
      "https://i.ibb.co/mrmgtNqQ/Vida-Almond-Oil-Slide-1-Arabic.png"
    ],
    localizedImages: {
      ar: [
        "https://i.ibb.co/sd6MQdD5/Almond-Oil-Slide-1-Arabic.png",
        "https://i.ibb.co/v6B0BHQG/Vida-Almond-Oil-Slide-2-Arabic.png",
        "https://i.ibb.co/W4GRLtjq/Almond-Oil-Slide-2-Arabic.png",
        "https://i.ibb.co/mrmgtNqQ/Vida-Almond-Oil-Slide-1-Arabic.png"
      ],
      kr: [
        "https://i.ibb.co/BVrJr89p/Almond-Oil-Slide-1-Kurdish.png",
        "https://i.ibb.co/Zz6QXtm4/Almond-Oil-Slide-2-Kurdish.png",
        "https://i.ibb.co/M5cRHpSJ/Vida-Almond-Oil-Slide-2.png",
        "https://i.ibb.co/fzwWffVG/Vida-Almond-Oil-Slide-1.png"
      ]
    },
    description: "Botanical Almond Oil. Gentle nourishment for sensitive skin and hair.",
    benefits: [
      "Hair: Softens and smooths strands.",
      "Scalp: Helps reduce dryness.",
      "Skin: Brightens and deeply moisturizes.",
      "Body: Very Gentle nourishment."
    ]
  },
  {
    id: '4',
    name: "Flax Seed",
    category: "Gold Collection",
    price: "$38",
    image: "https://i.ibb.co/XrVwfkc8/Vida-Flax-Slide-2-Ar.png",
    images: ["https://i.ibb.co/XrVwfkc8/Vida-Flax-Slide-2-Ar.png", "https://i.ibb.co/bjLchYLS/Vida-Jojoba-Ar-2.png"],
    localizedImages: {
      ar: ["https://i.ibb.co/XrVwfkc8/Vida-Flax-Slide-2-Ar.png", "https://i.ibb.co/bjLchYLS/Vida-Jojoba-Ar-2.png"],
      kr: ["https://i.ibb.co/CKtZZpg2/Vida-Flax-Slide-1-Kr-V2.png", "https://i.ibb.co/JwXgDWLj/Vida-Flax-Slide-2-Kr.png"]
    },
    description: "Botanical Flax Seed Oil. Deep hydration with essential omega fatty acids.",
    benefits: [
      "Hair: Improves softness and shine.",
      "Scalp: Reduces dryness and irritation.",
      "Skin: Deep hydration with omega fatty acids.",
      "Body: Supports overall moisture balance."
    ]
  },
  {
    id: '5',
    name: "Jojoba",
    category: "Gold Collection",
    price: "$40",
    image: "https://i.ibb.co/MyzkTkGF/Vida-Jojoba-Ar-1.png",
    images: ["https://i.ibb.co/MyzkTkGF/Vida-Jojoba-Ar-1.png", "https://i.ibb.co/bjLchYLS/Vida-Jojoba-Ar-2.png"],
    localizedImages: {
      ar: ["https://i.ibb.co/MyzkTkGF/Vida-Jojoba-Ar-1.png", "https://i.ibb.co/bjLchYLS/Vida-Jojoba-Ar-2.png"],
      kr: ["https://i.ibb.co/BHcy5Knj/Vida-Jojoba-KR-1-copy.png", "https://i.ibb.co/ksbVJx8x/Vida-Jojoba-KR-2.png"]
    },
    description: "Botanical Jojoba Oil. Balances and restores skin and hair naturally.",
    benefits: [
      "Hair: Softens and improves manageability.",
      "Scalp: Balances natural oil production.",
      "Skin: Lightweight hydration for all skin types.",
      "Body: Restorative and balancing."
    ]
  },
  {
    id: '6',
    name: "Olive",
    category: "Deep Moisture",
    price: "$30",
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbad8a0f?auto=format&fit=crop&q=80&w=800",
    images: ["https://images.unsplash.com/photo-1474979266404-7eaacbad8a0f?auto=format&fit=crop&q=80&w=800"],
    description: "Botanical Olive Oil. Pure liquid gold for deep nourishment.",
    benefits: [
      "Hair: Nourishes, strengthens, adds shine, and helps reduce dryness.",
      "Scalp: Moisturizes and supports a healthy, balanced scalp.",
      "Skin: Deeply hydrates, softens texture, and helps maintain skin elasticity.",
      "Body: Protects against dryness and leaves skin smooth and nourished."
    ]
  },
  {
    id: '7',
    name: "Coconut",
    category: "Deep Moisture",
    price: "$28",
    image: "https://images.unsplash.com/photo-1549472393-27eb84519969?auto=format&fit=crop&q=80&w=800",
    images: ["https://images.unsplash.com/photo-1549472393-27eb84519969?auto=format&fit=crop&q=80&w=800"],
    description: "Botanical Coconut Oil. Versatile moisture for skin and hair.",
    benefits: [
      "Hair: Moisturizes, adds shine, reduces dryness and breakage.",
      "Scalp: Nourishes, helps soothe dryness, supports healthy scalp balance.",
      "Skin: Deeply hydrates, softens, and helps maintain smooth, supple skin.",
      "Body: Protects against dryness and improves overall softness and moisture."
    ]
  },
  {
    id: '8',
    name: "Argan",
    category: "Deep Moisture",
    price: "$45",
    image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&q=80&w=800",
    images: ["https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&q=80&w=800"],
    description: "Botanical Argan Oil. Liquid gold from Morocco for hair repair.",
    benefits: [
      "Hair: Repairs damage and controls frizz.",
      "Scalp: Lightweight nourishment.",
      "Skin: Improves elasticity and hydration.",
      "Body: Luxury conditioning and protection."
    ]
  },
  {
    id: '9',
    name: "Walnut",
    category: "Deep Moisture",
    price: "$38",
    image: "https://images.unsplash.com/photo-1543208918-6c8f948f2191?auto=format&fit=crop&q=80&w=800",
    images: ["https://images.unsplash.com/photo-1543208918-6c8f948f2191?auto=format&fit=crop&q=80&w=800"],
    description: "Botanical Walnut Oil. Rich replenishment for skin and hair.",
    benefits: [
      "Hair: Adds shine and smoothness.",
      "Scalp: Nourishes and supports strength.",
      "Skin: Softening and conditioning.",
      "Body: Rich, replenishing nourishment."
    ]
  },
  {
    id: '10',
    name: "Clove",
    category: "Specialty Care",
    price: "$34",
    image: "https://images.unsplash.com/photo-1615485240214-413158099a4e?auto=format&fit=crop&q=80&w=800",
    images: ["https://images.unsplash.com/photo-1615485240214-413158099a4e?auto=format&fit=crop&q=80&w=800"],
    description: "Botanical Clove Oil. Warming and stimulating root treatment.",
    benefits: [
      "Hair: Stimulates growth and strengthens roots.",
      "Scalp: Helps reduce buildup and irritation.",
      "Skin: Antibacterial, helps with blemishes (use diluted).",
      "Body: Warming and stimulating."
    ]
  },
  {
    id: '11',
    name: "Chia Seed",
    category: "Gold Collection",
    price: "$42",
    image: "https://images.unsplash.com/photo-1596708051778-e50e95143a41?auto=format&fit=crop&q=80&w=800",
    images: ["https://images.unsplash.com/photo-1596708051778-e50e95143a41?auto=format&fit=crop&q=80&w=800"],
    description: "Botanical Chia Seed Oil. Antioxidant-rich protection.",
    benefits: [
      "Hair: Strengthens and enhances shine.",
      "Scalp: Supports moisture balance.",
      "Skin: Antioxidant-rich hydration.",
      "Body: Protective and replenishing."
    ]
  },
  {
    id: '12',
    name: "Akpi",
    category: "Specialty Care",
    price: "$48",
    image: "https://images.unsplash.com/photo-1512149673953-1e251807ec7c?auto=format&fit=crop&q=80&w=800",
    images: ["https://images.unsplash.com/photo-1512149673953-1e251807ec7c?auto=format&fit=crop&q=80&w=800"],
    description: "Botanical Akpi Oil. Promotes strength and skin firmness.",
    benefits: [
      "Hair: Promotes stronger, fuller hair.",
      "Scalp: Encourages growth and density.",
      "Skin: Improves firmness and elasticity.",
      "Body: Nourishing and revitalizing."
    ]
  },
  {
    id: '13',
    name: "Oregano",
    category: "Specialty Care",
    price: "$36",
    image: "https://images.unsplash.com/photo-1533604113093-41c19734e55e?auto=format&fit=crop&q=80&w=800",
    images: ["https://images.unsplash.com/photo-1533604113093-41c19734e55e?auto=format&fit=crop&q=80&w=800"],
    description: "Botanical Oregano Oil. Powerful cleansing and protective properties.",
    benefits: [
      "Hair: Supports scalp health.",
      "Scalp: Helps reduce dandruff and bacteria (use diluted).",
      "Skin: Strong purifying properties.",
      "Body: Cleansing and protective."
    ]
  },
  {
    id: '14',
    name: "Blackseed",
    category: "Specialty Care",
    price: "$40",
    image: "https://images.unsplash.com/photo-1515205737134-191f6d33bce1?auto=format&fit=crop&q=80&w=800",
    images: ["https://images.unsplash.com/photo-1515205737134-191f6d33bce1?auto=format&fit=crop&q=80&w=800"],
    description: "Botanical Blackseed Oil. The ancient cure for common hair and skin ailments.",
    benefits: [
      "Hair: Strengthens strands and reduces breakage.",
      "Scalp: Calms irritation and supports healthy growth.",
      "Skin: Anti-inflammatory, helps soothe acne and dryness.",
      "Body: Nourishing and antioxidant-rich."
    ]
  },
  {
    id: '15',
    name: "Fenugreek",
    category: "Specialty Care",
    price: "$34",
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd05cd?auto=format&fit=crop&q=80&w=800",
    images: ["https://images.unsplash.com/photo-1596040033229-a9821ebd05cd?auto=format&fit=crop&q=80&w=800"],
    description: "Botanical Fenugreek Oil. Nourishes follicles and revitalizes hair growth.",
    benefits: [
      "Hair: Helps reduce thinning and breakage.",
      "Scalp: Nourishes follicles and supports growth.",
      "Skin: Soothing and moisturizing.",
      "Body: Strengthening and revitalizing."
    ]
  },
  {
    id: '16',
    name: "Peppermint",
    category: "Specialty Care",
    price: "$32",
    image: "https://images.unsplash.com/photo-1536701312353-83863486b864?auto=format&fit=crop&q=80&w=800",
    images: ["https://images.unsplash.com/photo-1536701312353-83863486b864?auto=format&fit=crop&q=80&w=800"],
    description: "Botanical Peppermint Oil. Cooling and invigorating vitality boost.",
    benefits: [
      "Hair: Refreshes and improves hair vitality.",
      "Scalp: Cooling sensation that stimulates circulation.",
      "Skin: Clarifying and refreshing.",
      "Body: Invigorating and uplifting."
    ]
  },
  {
    id: '17',
    name: "Watercress",
    category: "Gold Collection",
    price: "$38",
    image: "https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&q=80&w=800",
    images: ["https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&q=80&w=800"],
    description: "Botanical Watercress Oil. Nutrient-rich rejuvenation for dull skin.",
    benefits: [
      "Hair: Supports stronger, healthier strands.",
      "Scalp: Rich in nutrients that encourage growth.",
      "Skin: Revitalizes dull-looking skin.",
      "Body: Vitamin-rich nourishment."
    ]
  },
  {
    id: '18',
    name: "Pumpkin Seed",
    category: "Deep Moisture",
    price: "$36",
    image: "https://images.unsplash.com/photo-1506764483412-3e04a434da30?auto=format&fit=crop&q=80&w=800",
    images: ["https://images.unsplash.com/photo-1506764483412-3e04a434da30?auto=format&fit=crop&q=80&w=800"],
    description: "Botanical Pumpkin Seed Oil. Restorative nutrients for density and softness.",
    benefits: [
      "Hair: Supports hair density and strength.",
      "Scalp: Nourishes follicles and promotes growth.",
      "Skin: Improves elasticity and softness.",
      "Body: Rich in nutrients for restoration."
    ]
  },
  {
    id: '19',
    name: "Sesame",
    category: "Deep Moisture",
    price: "$32",
    image: "https://images.unsplash.com/photo-1533038590840-1cde6e668a91?auto=format&fit=crop&q=80&w=800",
    images: ["https://images.unsplash.com/photo-1533038590840-1cde6e668a91?auto=format&fit=crop&q=80&w=800"],
    description: "Botanical Sesame Oil. Warming and restorative antioxidant protection.",
    benefits: [
      "Hair: Strengthens and protects against dryness.",
      "Scalp: Nourishing and soothing.",
      "Skin: Deeply moisturizing and antioxidant-rich.",
      "Body: Warming and restorative."
    ]
  }
];

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('vida_lang');
    return (saved as Language) || 'en';
  });

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('vida_products');
      return saved && saved !== 'undefined' ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch (e) {
      console.error("Failed to parse vida_products from localStorage:", e);
      return INITIAL_PRODUCTS;
    }
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem('vida_categories');
      return saved && saved !== 'undefined' ? JSON.parse(saved) : INITIAL_CATEGORIES;
    } catch (e) {
      console.error("Failed to parse vida_categories from localStorage:", e);
      return INITIAL_CATEGORIES;
    }
  });

  const [featuredItems, setFeaturedItems] = useState<FeaturedItem[]>(() => {
    try {
      const saved = localStorage.getItem('vida_featured');
      return saved && saved !== 'undefined' ? JSON.parse(saved) : INITIAL_FEATURED;
    } catch (e) {
      console.error("Failed to parse vida_featured from localStorage:", e);
      return INITIAL_FEATURED;
    }
  });

  const [heroImage, setHeroImage] = useState(() => {
    return localStorage.getItem('vida_hero_image') || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=2000';
  });

  useEffect(() => {
    try {
      localStorage.setItem('vida_lang', language);
      // Force set direction for RTL languages
      document.documentElement.dir = language === 'ar' || language === 'kr' ? 'rtl' : 'ltr';
    } catch (e) {
      console.error("Failed to save language to localStorage:", e);
    }
  }, [language]);

  useEffect(() => {
    try {
      localStorage.setItem('vida_products', JSON.stringify(products));
    } catch (e) {
      console.error("Failed to save products to localStorage:", e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('vida_categories', JSON.stringify(categories));
    } catch (e) {
      console.error("Failed to save categories to localStorage:", e);
    }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem('vida_featured', JSON.stringify(featuredItems));
    } catch (e) {
      console.error("Failed to save featuredItems to localStorage:", e);
    }
  }, [featuredItems]);

  useEffect(() => {
    try {
      localStorage.setItem('vida_hero_image', heroImage);
    } catch (e) {
      console.error("Failed to save hero_image to localStorage:", e);
    }
  }, [heroImage]);

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct = { ...product, id: Date.now().toString() };
    setProducts((prev) => [...prev, newProduct]);
  };

  const updateProduct = (id: string, product: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...product } : p)));
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const addCategory = (name: string, image?: string) => {
    setCategories((prev) => [...prev, { id: Date.now().toString(), name, image }]);
  };

  const updateCategory = (id: string, name: string, image?: string) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, name, image } : c)));
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const addFeaturedItem = (item: Omit<FeaturedItem, 'id'>) => {
    const newItem = { ...item, id: Date.now().toString() };
    setFeaturedItems((prev) => [...prev, newItem]);
  };

  const updateFeaturedItem = (id: string, item: Partial<FeaturedItem>) => {
    setFeaturedItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...item } : i)));
  };

  const deleteFeaturedItem = (id: string) => {
    setFeaturedItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        featuredItems,
        language,
        setLanguage,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        addFeaturedItem,
        updateFeaturedItem,
        deleteFeaturedItem,
        heroImage,
        setHeroImage,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
