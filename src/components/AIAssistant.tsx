import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Send, Bot, RotateCcw, ShoppingBag, Check, HelpCircle, Activity, Heart } from 'lucide-react';
import { useStore, Product } from '../lib/StoreContext';
import { useCart } from '../lib/CartContext';
import { askAlchemist, diagnoseRoutine, AdviceResponse } from '../services/geminiService';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  recommendedProducts?: Product[];
}

export default function AIAssistant() {
  const { language, products } = useStore();
  const { addToCart, cart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'quiz'>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Diagnostic Quiz State
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({
    skinType: '',
    concern: '',
    sensitivity: '',
    hairGoals: ''
  });
  const [quizResult, setQuizResult] = useState<AdviceResponse | null>(null);

  // Localization for the AI widget
  const tAi = {
    en: {
      assistant_title: "VIDA Alchemist",
      assistant_subtitle: "Botanical AI Intelligence",
      welcome_text: "Welcome to VIDA. I am the Alchemist of the conservatory. Tell me about your skin concerns or hair goals, and I will tailor a cold-pressed botanical formulation just for you.",
      placeholder: "Ask about oils, dry skin, rosemary...",
      quiz_tab: "Botanical Ritual Diagnostic",
      chat_tab: "Consultation Chat",
      add_to_bag: "Add to Bag",
      added: "Added!",
      analyzing: "Formulating ritual...",
      step_skin_type: "Select your skin type",
      step_concern: "What is your primary concern?",
      step_sensitivity: "Your skin sensitivity level",
      step_hair: "Include hair or scalp goals? (Optional)",
      quiz_intro: "Formulate a personalized skincare ritual using nature's deepest wisdom.",
      start_quiz: "Begin Diagnostic",
      next: "Continue",
      back: "Back",
      submit: "Blend Formulation",
      reset_quiz: "New Consultation",
      dry: "Dry & Dehydrated",
      oily: "Oily & Sebum-Rich",
      sensitive: "Sensitive / Reactive",
      combination: "Combination Skin",
      mature: "Mature / Softening",
      concern_acne: "Blemish & Acne Purifying",
      concern_aging: "Firmness & Anti-Aging",
      concern_hydration: "Deep Barrier Hydration",
      concern_glow: "Brightening & Dull Skin",
      concern_scalp: "Scalp Health",
      sens_high: "Highly Sensitive",
      sens_medium: "Occasional Sensitivity",
      sens_low: "Resilient & Stable",
      hair_growth: "Hair Thickness & Growth",
      hair_frizz: "Frizz Control & Shine",
      hair_none: "Skip hair recommendation",
      suggested_ritual: "Your Bespoke Botanical Ritual:"
    },
    ar: {
      assistant_title: "خبير فيدا الاصطناعي",
      assistant_subtitle: "مستشار الذكاء النباتي الطبيعي",
      welcome_text: "مرحباً بكم في فيدا. أنا خبير المستخلصات في الاستوديو الخاص بنا. أخبرني بمشاكل بشرتك أو أهداف شعرك لتركيب وصفة غنية بالزيوت المعصورة على البارد خصيصاً لك.",
      placeholder: "اسأل عن الزيوت، جفاف البشرة، الروزماري...",
      quiz_tab: "تشخيص طقوس البشرة",
      chat_tab: "دردشة الاستشارة",
      add_to_bag: "إضافة للسلة",
      added: "تمت الإضافة!",
      analyzing: "جاري تركيب وصفتك الطبيعية...",
      step_skin_type: "اختر نوع بشرتك المعتاد",
      step_concern: "ما هي المشكلة الأساسية الحالية؟",
      step_sensitivity: "مستوى حساسية بشرتك",
      step_hair: "هل ترغب في إضافة أهداف للشعر؟ (اختياري)",
      quiz_intro: "صمم روتين عناية نباتي مخصص باستخدام أعمق أسرار الطبيعة.",
      start_quiz: "بدء التشخيص",
      next: "المتابعة",
      back: "رجوع",
      submit: "تحضير التركيبة النباتية",
      reset_quiz: "استشارة جديدة",
      dry: "جافة ومشدودة",
      oily: "دهنية وغنية بالزهم",
      sensitive: "حساسة ومتهيجة",
      combination: "مختلطة",
      mature: "ناضجة وبحاجة لمرونة",
      concern_acne: "تنقية البشرة وحب الشباب",
      concern_aging: "مكافحة التجاعيد والترهلات",
      concern_hydration: "ترطيب حاجز البشرة بعمق",
      concern_glow: "الإشراقة وتفتيح شحوب الجلد",
      concern_scalp: "صحة ونظافة فروة الرأس",
      sens_high: "حساسة للغاية",
      sens_medium: "حساسية موسمية عابرة",
      sens_low: "بشرة مستقرة وغير حساسة",
      hair_growth: "كثافة الشعر وتحفيز النمو",
      hair_frizz: "التحكم في التقصف واللمعان",
      hair_none: "تخطي توصيات الشعر",
      suggested_ritual: "طقوسك النباتية المصممة خصيصاً:"
    },
    kr: {
      assistant_title: "ئەلکیمیستێ ڤیدا",
      assistant_subtitle: "موقەفێ زیرەکیا ڕووەکی",
      welcome_text: "بخێر بێی بۆ ڤیدا. ئەز خبيرێ مستخلصاتانم ل ستۆدیۆیا مە. دەربارەی کێشەیێن پێست یان حەزێن پرچا خۆ بێژە، دا کو ڕیتوالەکا زەیتا سارد-قۆپاندی تایبەت بۆ تە دروست بکەم.",
      placeholder: "پسیار بکە ل سەر زەیتان، پیستێ هشک، روزماری...",
      quiz_tab: "تشخيصا ڕاستەوخۆ یا پێستی",
      chat_tab: "سۆحبەتا ڕاوێژکاریێ",
      add_to_bag: "زێدەکە بۆ سەبەتێ",
      added: "هاتە زێدەکرن!",
      analyzing: "ئامادەکرنا ڕیتوالا ڕووەکی...",
      step_skin_type: "جۆرێ پێستێ خۆ دەستنیشان بکە",
      step_concern: "کێشا سەرەکی یا نوکە چییە؟",
      step_sensitivity: "ئاستێ هەستیاریا پێستێ تە",
      step_hair: "تشتەکی بۆ پرچێ ژی زێدە بکەین؟ (دڵخواز)",
      quiz_intro: "کۆمبۆنەکا چاڤدێریا پێستی یا تایبەت ئۆ ل سەر بنیاتێ زیرەکیا سرۆشت دروست بکە.",
      start_quiz: "دەستپێکرنا دیارکرنێ",
      next: "بەردەوامبە",
      back: "زڤڕین",
      submit: "بەرهەمهێنانا تێکەڵێ",
      reset_quiz: "شاوڕەکا نوو",
      dry: "هشک و بێ ئاڤ",
      oily: "چەور کێشەدار",
      sensitive: "هەستیار و سۆتکەر",
      combination: "تێکەڵاو",
      mature: "مەزن و پێتڤی ب توندکرنێ",
      concern_acne: "پاقژکرنا زیپکە و عەیبان",
      concern_aging: "دژی چرچبوون و توندکرنێ",
      concern_hydration: "تەقاندنا کۆرا ئاڤێ د پیستی دا",
      concern_glow: "درەوشان و لادانا ڕەنگێ شاحب",
      concern_scalp: "تەندروستیا دەمارێن سەرێ",
      sens_high: "گەلەک هەستیارە",
      sens_medium: "هەستیاریا وەرزی",
      sens_low: "جێگر و باوەرپێکری",
      hair_growth: "چڕی و بلندبوونا پرچێ",
      hair_frizz: "نەهێلانا عەیب و بڕەوق کرن",
      hair_none: "بۆ پرچێ دەرباز بکە",
      suggested_ritual: "ڕیتوالا تە یا تایبەت یا ڕووەکی:"
    }
  }[language === 'ar' ? 'ar' : language === 'kr' ? 'kr' : 'en'];

  // Initialize welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'model',
          text: tAi.welcome_text
        }
      ]);
    }
  }, [language]);

  // Scroll to bottom on updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, quizStep]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMsg = inputText.trim();
    setInputText('');
    
    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: userMsg
    };

    setMessages(prev => [...prev, newUserMsg]);
    setIsLoading(true);

    // Format history for context-aware chat
    const formattedHistory = messages.map(m => ({
      role: m.role,
      parts: [m.text]
    }));

    try {
      const response = await askAlchemist(userMsg, formattedHistory, language);
      
      // Map suggested product IDs to actual objects
      const matchedProducts = response.recommendedProductIds
        .map(id => products.find(p => p.id === id))
        .filter((p): p is Product => !!p);

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.reply,
        recommendedProducts: matchedProducts
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartQuiz = () => {
    setQuizStep(1);
    setQuizResult(null);
  };

  const handleSelectQuizOption = (field: string, val: string) => {
    setQuizAnswers(prev => ({ ...prev, [field]: val }));
  };

  const handleQuizSubmit = async () => {
    setIsLoading(true);
    setQuizStep(5); // Show loading state on final step
    try {
      const answers = {
        skinType: quizAnswers.skinType,
        primaryConcern: quizAnswers.concern,
        sensitivity: quizAnswers.sensitivity,
        hairGoals: quizAnswers.hairGoals || undefined
      };
      const result = await diagnoseRoutine(answers, language);
      setQuizResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetQuiz = () => {
    setQuizAnswers({ skinType: '', concern: '', sensitivity: '', hairGoals: '' });
    setQuizResult(null);
    setQuizStep(0);
  };

  // Helper inside card to show whether a product is in cart
  const isProductInCart = (prodId: string) => {
    return cart.some(item => item.id === prodId);
  };

  return (
    <>
      {/* Floating Button with pulse */}
      <div className="fixed bottom-8 right-8 z-[200]">
        <motion.button
          id="ai-droplet-button"
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`relative p-5 rounded-full shadow-2xl transition-all cursor-pointer ${
            isOpen 
              ? 'bg-brand-primary text-white ring-4 ring-brand-light/35' 
              : 'bg-brand-primary text-brand-gold hover:text-white ring-4 ring-brand-gold/15 hover:ring-brand-accent/40'
          }`}
        >
          {isOpen ? <X size={24} /> : <Sparkles className="animate-pulse" size={24} />}
          {!isOpen && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-brand-accent"></span>
            </span>
          )}
        </motion.button>
      </div>

      {/* Slide-out Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="ai-panel-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-brand-primary/20 backdrop-blur-sm z-[150] flex justify-end"
            onClick={() => setIsOpen(false)}
          >
            {/* The Sheet */}
            <motion.div
              id="ai-consultant-sheet"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-lg md:max-w-xl h-full bg-brand-paper shadow-3xl flex flex-col border-l border-brand-primary/10 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 md:p-8 border-b border-brand-primary/5 flex items-center justify-between bg-brand-beige">
                <div className="flex items-center gap-4">
                  <div className="bg-brand-primary/10 p-3 rounded-2xl text-brand-primary">
                    <Sparkles size={20} className="text-brand-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-serif font-semibold italic text-brand-primary leading-tight">
                      {tAi.assistant_title}
                    </h2>
                    <p className="text-[9px] uppercase tracking-[0.25em] font-black text-brand-secondary">
                      {tAi.assistant_subtitle}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-brand-primary/5 rounded-full transition-colors cursor-pointer text-brand-primary/40 hover:text-brand-primary"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Mode selection Tabs */}
              <div className="flex bg-brand-beige/50 border-b border-brand-primary/5 px-2 py-1">
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex-1 py-3 text-[10px] uppercase tracking-widest font-black rounded-xl transition-all ${
                    activeTab === 'chat' 
                      ? 'bg-white text-brand-primary shadow-sm' 
                      : 'text-brand-primary/40 hover:text-brand-primary/70'
                  }`}
                >
                  {tAi.chat_tab}
                </button>
                <button
                  onClick={() => {
                    setActiveTab('quiz');
                    if (quizStep === 0) setQuizStep(0);
                  }}
                  className={`flex-1 py-3 text-[10px] uppercase tracking-widest font-black rounded-xl transition-all ${
                    activeTab === 'quiz' 
                      ? 'bg-white text-brand-primary shadow-sm' 
                      : 'text-brand-primary/40 hover:text-brand-primary/70'
                  }`}
                >
                  {tAi.quiz_tab}
                </button>
              </div>

              {/* Panel Body */}
              <div className="flex-grow overflow-y-auto p-6 md:p-8 space-y-6">
                
                {/* 1. CHAT WORKFLOW */}
                {activeTab === 'chat' && (
                  <div className="space-y-6">
                    {messages.map((m) => (
                      <motion.div
                        key={m.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-4 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {m.role === 'model' && (
                          <div className="w-8 h-8 rounded-full bg-brand-primary/5 border border-brand-primary/10 flex items-center justify-center flex-shrink-0 text-brand-primary">
                            <Bot size={14} />
                          </div>
                        )}
                        
                        <div className="max-w-[85%] space-y-4">
                          <div
                            className={`p-5 rounded-3xl text-sm leading-relaxed ${
                              m.role === 'user'
                                ? 'bg-brand-primary text-white rounded-br-none'
                                : 'bg-brand-beige text-brand-primary rounded-bl-none border border-brand-primary/5'
                            }`}
                          >
                            {m.text}
                          </div>

                          {/* Suggested Product Cards */}
                          {m.recommendedProducts && m.recommendedProducts.length > 0 && (
                            <div className="space-y-3">
                              <p className="text-[9px] uppercase tracking-widest font-black text-brand-gold">
                                {tAi.suggested_ritual}
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {m.recommendedProducts.map((p) => (
                                  <ProductCard key={p.id} p={p} tAi={tAi} addToCart={addToCart} isInCart={isProductInCart(p.id)} />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}

                    {/* Chat Loading Skeleton */}
                    {isLoading && (
                      <div className="flex gap-4 justify-start">
                        <div className="w-8 h-8 rounded-full bg-brand-primary/5 border border-brand-primary/10 flex items-center justify-center flex-shrink-0 text-brand-primary">
                          <Bot size={14} className="animate-spin" />
                        </div>
                        <div className="bg-brand-beige rounded-3xl rounded-bl-none p-5 border border-brand-primary/5 max-w-[80%]">
                          <div className="flex gap-1.5 items-center">
                            <span className="w-2 h-2 bg-brand-primary/30 rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <span className="w-2 h-2 bg-brand-primary/30 rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <span className="w-2 h-2 bg-brand-primary/30 rounded-full animate-bounce" />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}

                {/* 2. DIAGNOSTIC QUIZ */}
                {activeTab === 'quiz' && (
                  <div className="space-y-8">
                    
                    {/* Welcome Screen */}
                    {quizStep === 0 && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-16 px-4 space-y-8 bg-brand-beige/30 rounded-[40px] border border-brand-primary/5"
                      >
                        <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto text-brand-primary">
                          <HelpCircle size={32} />
                        </div>
                        <div className="space-y-3 max-w-sm mx-auto">
                          <h3 className="text-2xl font-serif italic text-brand-primary">
                            {language === 'ar' ? 'التشخيص النباتي الفردي' : language === 'kr' ? 'تەماشاکردنا نوو یا پێستی' : 'Personalized Skin Synthesis'}
                          </h3>
                          <p className="text-brand-secondary text-sm leading-relaxed">
                            {tAi.quiz_intro}
                          </p>
                        </div>
                        <button
                          onClick={handleStartQuiz}
                          className="bg-brand-primary text-white px-10 py-4 rounded-xl text-[10px] uppercase tracking-[0.2em] font-black hover:bg-brand-accent transition-all cursor-pointer shadow-lg shadow-brand-primary/10"
                        >
                          {tAi.start_quiz}
                        </button>
                      </motion.div>
                    )}

                    {/* Step 1: Skin Type */}
                    {quizStep === 1 && (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                      >
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase tracking-widest font-black text-brand-gold">Step 1 of 4</span>
                          <h3 className="text-xl font-serif text-brand-primary italic font-medium">{tAi.step_skin_type}</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          {[
                            { key: 'dry', label: tAi.dry },
                            { key: 'oily', label: tAi.oily },
                            { key: 'sensitive', label: tAi.sensitive },
                            { key: 'combination', label: tAi.combination },
                            { key: 'mature', label: tAi.mature }
                          ].map((opt) => (
                            <button
                              key={opt.key}
                              onClick={() => handleSelectQuizOption('skinType', opt.key)}
                              className={`w-full text-left p-5 rounded-2xl border text-sm font-black uppercase tracking-widest transition-all cursor-pointer ${
                                quizAnswers.skinType === opt.key
                                  ? 'bg-brand-primary border-brand-primary text-white shadow-md'
                                  : 'bg-white border-brand-primary/5 text-brand-primary/80 hover:bg-brand-beige/50'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                        
                        <div className="flex justify-end pt-4">
                          <button
                            disabled={!quizAnswers.skinType}
                            onClick={() => setQuizStep(2)}
                            className="bg-brand-primary disabled:opacity-40 text-white px-8 py-3.5 rounded-xl text-[10px] uppercase tracking-widest font-black hover:bg-brand-accent transition-colors"
                          >
                            {tAi.next}
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 2: Main Concern */}
                    {quizStep === 2 && (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                      >
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase tracking-widest font-black text-brand-gold">Step 2 of 4</span>
                          <h3 className="text-xl font-serif text-brand-primary italic font-medium">{tAi.step_concern}</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          {[
                            { key: 'acne', label: tAi.concern_acne },
                            { key: 'aging', label: tAi.concern_aging },
                            { key: 'hydration', label: tAi.concern_hydration },
                            { key: 'glow', label: tAi.concern_glow },
                            { key: 'scalp', label: tAi.concern_scalp }
                          ].map((opt) => (
                            <button
                              key={opt.key}
                              onClick={() => handleSelectQuizOption('concern', opt.key)}
                              className={`w-full text-left p-5 rounded-2xl border text-sm font-black uppercase tracking-widest transition-all cursor-pointer ${
                                quizAnswers.concern === opt.key
                                  ? 'bg-brand-primary border-brand-primary text-white shadow-md'
                                  : 'bg-white border-brand-primary/5 text-brand-primary/80 hover:bg-brand-beige/50'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                        
                        <div className="flex justify-between pt-4">
                          <button
                            onClick={() => setQuizStep(1)}
                            className="px-6 py-3.5 rounded-xl text-[10px] uppercase tracking-widest font-black text-brand-primary/40 hover:text-brand-primary"
                          >
                            {tAi.back}
                          </button>
                          <button
                            disabled={!quizAnswers.concern}
                            onClick={() => setQuizStep(3)}
                            className="bg-brand-primary disabled:opacity-40 text-white px-8 py-3.5 rounded-xl text-[10px] uppercase tracking-widest font-black hover:bg-brand-accent transition-colors"
                          >
                            {tAi.next}
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 3: Sensitivity */}
                    {quizStep === 3 && (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                      >
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase tracking-widest font-black text-brand-gold">Step 3 of 4</span>
                          <h3 className="text-xl font-serif text-brand-primary italic font-medium">{tAi.step_sensitivity}</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          {[
                            { key: 'high', label: tAi.sens_high },
                            { key: 'medium', label: tAi.sens_medium },
                            { key: 'low', label: tAi.sens_low }
                          ].map((opt) => (
                            <button
                              key={opt.key}
                              onClick={() => handleSelectQuizOption('sensitivity', opt.key)}
                              className={`w-full text-left p-5 rounded-2xl border text-sm font-black uppercase tracking-widest transition-all cursor-pointer ${
                                quizAnswers.sensitivity === opt.key
                                  ? 'bg-brand-primary border-brand-primary text-white shadow-md'
                                  : 'bg-white border-brand-primary/5 text-brand-primary/80 hover:bg-brand-beige/50'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                        
                        <div className="flex justify-between pt-4">
                          <button
                            onClick={() => setQuizStep(2)}
                            className="px-6 py-3.5 rounded-xl text-[10px] uppercase tracking-widest font-black text-brand-primary/40 hover:text-brand-primary"
                          >
                            {tAi.back}
                          </button>
                          <button
                            disabled={!quizAnswers.sensitivity}
                            onClick={() => setQuizStep(4)}
                            className="bg-brand-primary disabled:opacity-40 text-white px-8 py-3.5 rounded-xl text-[10px] uppercase tracking-widest font-black hover:bg-brand-accent transition-colors"
                          >
                            {tAi.next}
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 4: Hair Goals */}
                    {quizStep === 4 && (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                      >
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase tracking-widest font-black text-brand-gold">Step 4 of 4</span>
                          <h3 className="text-xl font-serif text-brand-primary italic font-medium">{tAi.step_hair}</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          {[
                            { key: 'growth', label: tAi.hair_growth },
                            { key: 'frizz', label: tAi.hair_frizz },
                            { key: 'none', label: tAi.hair_none }
                          ].map((opt) => (
                            <button
                              key={opt.key}
                              onClick={() => handleSelectQuizOption('hairGoals', opt.key)}
                              className={`w-full text-left p-5 rounded-2xl border text-sm font-black uppercase tracking-widest transition-all cursor-pointer ${
                                quizAnswers.hairGoals === opt.key
                                  ? 'bg-brand-primary border-brand-primary text-white shadow-md'
                                  : 'bg-white border-brand-primary/5 text-brand-primary/80 hover:bg-brand-beige/50'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                        
                        <div className="flex justify-between pt-4">
                          <button
                            onClick={() => setQuizStep(3)}
                            className="px-6 py-3.5 rounded-xl text-[10px] uppercase tracking-widest font-black text-brand-primary/40 hover:text-brand-primary"
                          >
                            {tAi.back}
                          </button>
                          <button
                            disabled={!quizAnswers.hairGoals}
                            onClick={handleQuizSubmit}
                            className="bg-brand-accent text-white px-10 py-3.5 rounded-xl text-[10px] uppercase tracking-[0.15em] font-black hover:bg-brand-primary transition-all cursor-pointer shadow-lg shadow-brand-accent/20"
                          >
                            {tAi.submit}
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 5: Loading or Result */}
                    {quizStep === 5 && (
                      <div className="space-y-8">
                        {isLoading ? (
                          <div className="text-center py-20">
                            <Bot size={48} className="mx-auto text-brand-primary/20 animate-spin mb-6" />
                            <p className="text-[10px] uppercase tracking-[0.25em] font-black text-brand-primary animate-pulse">
                              {tAi.analyzing}
                            </p>
                          </div>
                        ) : quizResult ? (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-8"
                          >
                            <div className="bg-brand-beige/40 p-6 rounded-[32px] border border-brand-primary/5 space-y-4">
                              <div className="flex items-center gap-2 text-brand-gold">
                                <Heart size={18} />
                                <span className="text-[10px] uppercase tracking-[0.3em] font-black">Botanical Diagnostics Result</span>
                              </div>
                              <h3 className="text-2xl font-serif text-brand-primary italic">Alchemical formulation created</h3>
                              <p className="text-[13px] text-brand-primary/90 leading-relaxed font-sans mt-3 whitespace-pre-wrap">
                                {quizResult.reply}
                              </p>
                            </div>

                            {/* Render Recommended products */}
                            {quizResult.recommendedProductIds && quizResult.recommendedProductIds.length > 0 && (
                              <div className="space-y-4">
                                <p className="text-[10px] uppercase tracking-widest font-black text-brand-gold">
                                  {tAi.suggested_ritual}
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  {quizResult.recommendedProductIds
                                    .map(id => products.find(p => p.id === id))
                                    .filter((p): p is Product => !!p)
                                    .map((p) => (
                                      <ProductCard key={p.id} p={p} tAi={tAi} addToCart={addToCart} isInCart={isProductInCart(p.id)} />
                                    ))}
                                </div>
                              </div>
                            )}

                            <div className="flex justify-center pt-4">
                              <button
                                onClick={handleResetQuiz}
                                className="flex items-center gap-2 bg-brand-primary text-white px-8 py-3.5 rounded-xl text-[10px] uppercase tracking-widest font-black hover:bg-brand-accent transition-all cursor-pointer"
                              >
                                <RotateCcw size={14} /> {tAi.reset_quiz}
                              </button>
                            </div>
                          </motion.div>
                        ) : null}
                      </div>
                    )}

                  </div>
                )}

              </div>

              {/* Chat Input Bar (only on Chat tab) */}
              {activeTab === 'chat' && (
                <div className="p-4 md:p-6 bg-brand-beige border-t border-brand-primary/5">
                  <form onSubmit={handleSendMessage} className="flex gap-4 items-center">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder={tAi.placeholder}
                      disabled={isLoading}
                      className="flex-grow bg-white border border-brand-primary/5 rounded-2xl px-5 py-4 text-xs outline-none focus:ring-2 ring-brand-accent/20 transition-all font-medium text-brand-primary"
                    />
                    <button
                      type="submit"
                      disabled={!inputText.trim() || isLoading}
                      className="bg-brand-primary text-white p-4 rounded-2xl hover:bg-brand-accent disabled:opacity-45 hover:scale-105 disabled:pointer-events-none transition-all flex items-center justify-center cursor-pointer flex-shrink-0"
                    >
                      <Send size={16} />
                    </button>
                  </form>
                </div>
              )}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Minimalist Card Component for recommended items in Chat
interface ProductCardProps {
  key?: any;
  p: Product;
  tAi: any;
  addToCart: (product: Product) => void;
  isInCart: boolean;
}

function ProductCard({ p, tAi, addToCart, isInCart }: ProductCardProps) {
  const { language } = useStore();
  
  // Choose correct localized preview or main image
  let imageSource = p.image;
  if (language === 'ar' && p.localizedImages?.ar?.[0]) {
    imageSource = p.localizedImages.ar[0];
  } else if (language === 'kr' && p.localizedImages?.kr?.[0]) {
    imageSource = p.localizedImages.kr[0];
  }

  return (
    <div className="bg-white rounded-2xl border border-brand-primary/5 p-4 flex gap-3 hover:shadow-md transition-shadow relative">
      <div className="w-16 h-20 bg-brand-paper rounded-xl overflow-hidden flex-shrink-0">
        <img src={imageSource} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
      </div>
      <div className="flex-grow flex flex-col justify-between">
        <div>
          <h4 className="font-serif text-brand-primary italic leading-tight text-xs md:text-sm">{p.name}</h4>
          <span className="text-[8px] uppercase tracking-widest font-black text-brand-gold leading-none">{p.price}</span>
        </div>
        
        <button
          onClick={() => addToCart(p)}
          className={`flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg text-[8px] uppercase tracking-widest font-black transition-all cursor-pointer ${
            isInCart 
              ? 'bg-green-50 text-green-700' 
              : 'bg-brand-primary text-white hover:bg-brand-accent'
          }`}
        >
          {isInCart ? (
            <>
              <Check size={10} /> {tAi.added}
            </>
          ) : (
            <>
              <ShoppingBag size={10} /> {tAi.add_to_bag}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
