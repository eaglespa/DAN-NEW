import React from 'react';
import { Star, AlertTriangle } from 'lucide-react';
import { Product } from '../types';

interface RelatedProductsProps {
  products: Product[];
  currentProductId: string;
  onSelectProduct: (product: Product) => void;
  currencySymbol: string;
}

export const RelatedProducts: React.FC<RelatedProductsProps> = ({
  products,
  currentProductId,
  onSelectProduct,
  currencySymbol
}) => {
  const otherProducts = products.filter((p) => p.id !== currentProductId);

  if (otherProducts.length === 0) return null;

  return (
    <div className="w-full mt-16 pt-12 border-t border-slate-200">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
            You May Also Like
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Engineered footwear from the Wyluxe Athletics London catalogue
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {otherProducts.map((p) => {
          const discountPercent = Math.round(
            ((p.compareAtPrice - p.price) / p.compareAtPrice) * 100
          );

          return (
            <div
              key={p.id}
              onClick={() => {
                onSelectProduct(p);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="group cursor-pointer bg-white rounded-3xl border border-slate-200/90 overflow-hidden hover:shadow-xl hover:border-slate-400 transition-all duration-300 flex flex-col"
            >
              {/* Product Image Stage */}
              <div className="relative bg-gradient-to-b from-slate-100/90 to-slate-200/50 aspect-square overflow-hidden">
                <img
                  src={p.images[0]}
                  alt={p.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1">
                  {discountPercent > 0 && (
                    <span className="bg-amber-500 text-slate-950 text-[10.5px] font-black px-2.5 py-0.5 rounded-full shadow-xs">
                      -{discountPercent}%
                    </span>
                  )}
                  {p.stock === 1 && (
                    <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                      <AlertTriangle className="w-3 h-3" />
                      1 Left Only
                    </span>
                  )}
                </div>

                <div className="absolute top-3 right-3">
                  <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                    Stock: {p.stock}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 text-amber-500 text-xs mb-1.5">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-slate-900">{p.rating.toFixed(1)}</span>
                    <span className="text-slate-400">({p.reviewCount})</span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-950 line-clamp-1 group-hover:text-amber-600 transition-colors">
                    {p.title}
                  </h4>

                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {p.description}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-black text-slate-950">
                      {currencySymbol}{p.price.toFixed(2)}
                    </span>
                    {p.compareAtPrice > p.price && (
                      <span className="text-xs text-slate-400 line-through">
                        {currencySymbol}{p.compareAtPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <span className="text-xs font-bold text-slate-900 group-hover:text-amber-600 underline underline-offset-2 transition-colors">
                    View Product →
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
