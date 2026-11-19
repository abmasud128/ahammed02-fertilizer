'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useLanguage } from '@/i18n/provider';
import { formatWhatsAppUrl, getWhatsAppProductMessage } from '@/lib/utils';
import { siteConfig } from '@/config/site';
import type { Product } from '@/data/products';

export interface ProductCardProps {
  product: Product;
  className?: string;
  featured?: boolean;
}

/**
 * Premium 3D Tilt Product Card with rear dynamic glow,
 * bilingual crop compatibility pills, and direct WhatsApp enquiry.
 */
export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  className = '',
  featured = false,
}) => {
  const { locale, t } = useLanguage();
  const cardRef = useRef<HTMLDivElement>(null);

  // 3D Tilt calculations
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 200, mass: 0.1 };
  const rotateXSpring = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), springConfig);
  const rotateYSpring = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only apply tilt on pointer devices with hover capability
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    }
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const name = locale === 'bn' ? product.namebn : product.name;
  const description = locale === 'bn' ? product.descriptionbn : product.description;
  const usage = locale === 'bn' ? product.usagebn : product.usage;
  const category = locale === 'bn' ? product.categorybn : product.category;
  const cropList = locale === 'bn' ? product.cropsbn : product.crops;

  const whatsappMessage = getWhatsAppProductMessage(product.name, locale);
  const whatsappUrl = formatWhatsAppUrl(siteConfig.whatsapp, whatsappMessage);

  return (
    <div className={`card-glow-wrapper perspective-1000 h-full ${className}`}>
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transformStyle: 'preserve-3d',
          rotateX: rotateXSpring,
          rotateY: rotateYSpring,
        }}
        whileHover={{ y: -5 }}
        className="relative h-full flex flex-col rounded-2xl bg-white/95 dark:bg-[#071d15]/95 backdrop-blur-xl border border-white/40 dark:border-white/15 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
      >
        {/* Top Accent Gradient Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-leaf via-harvest to-forest" />

        {/* Card Header & Category Tag */}
        <div className="p-5 pb-3">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-leaf/10 dark:bg-leaf/20 text-leaf border border-leaf/20 uppercase tracking-wide">
              {product.category === 'fertilizers' ? '🧪' :
               product.category === 'micronutrients' ? '💎' :
               product.category === 'insecticides' ? '🐛' :
               product.category === 'fungicides' ? '🍄' :
               product.category === 'seeds' ? '🌱' : '🛡️'}
              <span>{category}</span>
            </span>

            {featured && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-harvest/20 text-forest dark:text-harvest border border-harvest/30">
                ★ {locale === 'bn' ? 'জনপ্রিয়' : 'Featured'}
              </span>
            )}
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-forest dark:text-white leading-snug group-hover:text-leaf transition-colors line-clamp-2">
            <Link href={`/products/${product.slug}`} className="hover:underline">
              {name}
            </Link>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 font-medium">
            {product.brand}
          </p>
        </div>

        {/* Description & Short Usage */}
        <div className="px-5 flex-1 flex flex-col justify-between">
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-2 mb-3">
              {description}
            </p>

            {/* Short Use Box */}
            <div className="rounded-xl p-2.5 bg-cream/60 dark:bg-dark-bg/60 border border-forest/10 dark:border-forest/20 text-xs mb-3">
              <span className="font-bold text-forest dark:text-leaf block mb-0.5">
                💡 {locale === 'bn' ? 'ব্যবহার:' : 'Usage:'}
              </span>
              <span className="text-gray-600 dark:text-gray-400 line-clamp-2">
                {usage}
              </span>
            </div>
          </div>

          {/* Best Suitable Crops Pills */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
              🌾 {locale === 'bn' ? 'উপযুক্ত প্রধান ফসল:' : 'Best For Crops:'}
            </span>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {cropList.slice(0, 4).map((crop, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-forest/5 dark:bg-white/5 text-forest dark:text-cream border border-forest/10 dark:border-white/10"
                >
                  {crop}
                </span>
              ))}
              {cropList.length > 4 && (
                <span className="px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                  +{cropList.length - 4}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Card Footer: Price & Enquire Buttons */}
        <div className="p-5 pt-3 border-t border-forest/10 dark:border-leaf/20 bg-cream/30 dark:bg-dark-bg/30 mt-auto">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs text-muted-foreground">
              {locale === 'bn' ? 'মূল্য:' : 'Price:'}
            </span>
            <span className="text-sm font-extrabold text-forest dark:text-harvest text-right">
              {product.price}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Link
              href={`/products/${product.slug}`}
              className="inline-flex items-center justify-center px-3 py-2 rounded-xl text-xs font-bold text-forest dark:text-cream bg-white dark:bg-dark-surface border border-forest/20 dark:border-leaf/30 hover:bg-forest/5 dark:hover:bg-dark-bg transition-colors min-h-[44px]"
            >
              {t('products.viewDetails', 'Details')}
            </Link>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Enquire about ${product.name} on WhatsApp`}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-green-600 hover:bg-green-700 shadow-sm transition-all active:scale-95 min-h-[44px]"
            >
              <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
              <span>{locale === 'bn' ? 'জানুন' : 'Enquire'}</span>
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProductCard;
