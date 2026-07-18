import { motion } from 'motion/react';
import { useTranslation } from '../lib/translations';

export default function BrandStory() {
  const { t, language } = useTranslation();

  return (
    <section className="py-32 px-6 bg-brand-paper">
      <div className="max-w-7xl mx-auto">
        <div className="bg-brand-beige rounded-[60px] overflow-hidden grid grid-cols-1 lg:grid-cols-2 shadow-sm border border-brand-primary/5">
          {/* Left Column: Content */}
          <div className="p-12 md:p-24 flex flex-col justify-center bg-brand-beige">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-16"
            >
              {/* Who is VIDA section */}
              <div className="flex flex-col md:flex-row gap-8 md:gap-16">
                <div className="w-24 shrink-0">
                  <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-gold italic">
                    {language === 'ar' ? (
                      <>من هي<br /> فيدا ؟</>
                    ) : language === 'kr' ? (
                      <>ڤیدا چییە؟</>
                    ) : (
                      <>Who is <br /> VIDA ?</>
                    )}
                  </span>
                </div>
                <div className="space-y-6 text-brand-primary/80 leading-relaxed text-sm max-w-lg">
                  <p className="font-medium text-brand-primary italic">
                    {t('brand_story_p1')}
                  </p>
                  <p>
                    {t('brand_story_p2')}
                  </p>
                  <p>
                    {t('brand_story_p3')}
                  </p>
                </div>
              </div>

              {/* Future in brand design section */}
              <div className="flex flex-col md:flex-row gap-8 md:gap-16 pt-8 border-t border-brand-primary/10">
                <div className="w-24 shrink-0">
                  <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-gold italic">
                    {language === 'ar' ? (
                      <>المستقبل في<br /> تصميم الهوية</>
                    ) : language === 'kr' ? (
                      <>پاشەڕۆژ د<br /> دیزاینکرنا براندی دا</>
                    ) : (
                      <>future <br /> in brand <br /> design</>
                    )}
                  </span>
                </div>
                <div className="space-y-6 text-brand-primary/80 leading-relaxed text-sm max-w-lg">
                  <h4 className="text-[10px] uppercase tracking-[0.4em] font-black text-brand-primary">VIDA BOTANICALS</h4>
                  <p>
                    {t('future_design_desc1')}
                  </p>
                  <p>
                    {t('future_design_desc2')}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Visual */}
          <div className="relative h-[500px] lg:h-auto overflow-hidden">
            <motion.img 
              initial={{ scale: 1.2, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5 }}
              src="https://i.ibb.co/NgcMMBSH/POST-08-100.jpg"
              alt="Golden botanical oils"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {/* Overlay Gradient with Glass effect */}
            <div className="absolute inset-0 bg-brand-primary/10 backdrop-blur-[2px]" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="absolute inset-12 flex items-center justify-center border border-white/20 rounded-[40px] bg-white/5 backdrop-blur-sm shadow-xl"
            >
              <h3 className="text-brand-light text-6xl md:text-8xl font-black uppercase tracking-[0.2em] opacity-90 select-none text-center">
                {t('overview')}
              </h3>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
