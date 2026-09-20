import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Search, Sparkles, Filter, Eye, ShoppingBag, Tag, CheckCircle2, AlertTriangle, ArrowUpDown, ChevronLeft, ChevronRight, Truck } from 'lucide-react';
import { Product, StoreSettings } from '../types';

interface StoreCatalogProps {
  products: Product[];
  currentProduct: Product;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, size?: string) => void;
  onQuickView: (product: Product) => void;
  settings: StoreSettings;
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
}

export const StoreCatalog: React.FC<StoreCatalogProps> = ({
  products,
  currentProduct,
  onSelectProduct,
  onAddToCart,
  onQuickView,
  settings,
  selectedCategory,
  onCategoryChange
}) => {
  const [activeCollection, setActiveCollection] = useState<string>(selectedCategory || 'all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'condition'>('featured');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [hoveredImgIndex, setHoveredImgIndex] = useState<{ [productId: string]: number }>({});

  React.useEffect(() => {
    if (selectedCategory && selectedCategory !== activeCollection) {
      setActiveCollection(selectedCategory);
    }
  }, [selectedCategory]);

  const handleCollectionChange = (colId: string) => {
    setActiveCollection(colId);
    if (onCategoryChange) {
      onCategoryChange(colId);
    }
  };

  // Extract unique brands
  const brands = useMemo(() => {
    const list = products.map(p => p.brand).filter(Boolean) as string[];
    return ['all', ...Array.from(new Set(list))];
  }, [products]);

  // Filter & Sort
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        // Status filter
        if (p.status !== 'active' || p.stock <= 0) return false;

        // Collection filter
        if (activeCollection !== 'all') {
          if (activeCollection === 'accessories') {
            if (p.collection !== 'accessories' && p.category?.toLowerCase() !== 'hand bag' && p.category?.toLowerCase() !== 'accessories') {
              return false;
            }
          } else if (p.collection !== activeCollection) {
            return false;
          }
        }

        // Brand filter
        if (selectedBrand !== 'all' && p.brand !== selectedBrand) {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchCode = p.code?.toLowerCase().includes(q);
          const matchSku = p.sku?.toLowerCase().includes(q);
          const matchBrand = p.brand?.toLowerCase().includes(q);
          const matchCat = p.category?.toLowerCase().includes(q);
          const matchDesc = p.description?.toLowerCase().includes(q);
          const matchSize = p.sizes?.some(s => s.toLowerCase().includes(q));
          if (!matchTitle && !matchCode && !matchSku && !matchBrand && !matchCat && !matchDesc && !matchSize) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'condition') {
          const score = (c?: string) => (c?.includes('New') ? 3 : c?.includes('Excellent') ? 2 : 1);
          return score(b.condition) - score(a.condition);
        }
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      });
  }, [products, activeCollection, selectedBrand, searchQuery, sortBy]);

  const collections = [
    { id: 'all', label: 'All Pre-Loved' },
    { id: 'women', label: "Women's Collection" },
    { id: 'men', label: "Men's Vintage" },
    { id: 'kids', label: "Kids' Wear" },
    { id: 'accessories', label: 'Bags & Accessories' }
  ];

  const handleNextCardImg = (e: React.MouseEvent, p: Product) => {
    e.stopPropagation();
    if (!p.images || p.images.length <= 1) return;
    const current = hoveredImgIndex[p.id] || 0;
    const next = (current + 1) % p.images.length;
    setHoveredImgIndex(prev => ({ ...prev, [p.id]: next }));
  };

  const handlePrevCardImg = (e: React.MouseEvent, p: Product) => {
    e.stopPropagation();
    if (!p.images || p.images.length <= 1) return;
    const current = hoveredImgIndex[p.id] || 0;
    const prevIndex = (current - 1 + p.images.length) % p.images.length;
    setHoveredImgIndex(prev => ({ ...prev, [p.id]: prevIndex }));
  };

  return (
    <section id="store-catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 scroll-mt-24">
      {/* Store Header Banner */}
      <div className="relative rounded-2xl bg-gradient-to-br from-[#12141c] via-[#0f1118] to-[#1a1710] border border-[#d4a853]/30 p-6 sm:p-10 mb-10 overflow-hidden shadow-2xl">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#d4a853]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-amber-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 bg-[#d4a853]/15 text-[#e8c97a] border border-[#d4a853]/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-[#d4a853]" />
              <span>London Pre-Loved Boutique &middot; 1-of-1 Pieces</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#f5f0eb] tracking-tight font-serif">
              Sustainable Style. <span className="text-[#d4a853]">Curated Quality.</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-light">
              Each piece is an authentic, one-of-a-kind pre-loved item hand-inspected in London. Once an item is purchased, it is removed directly from our website store.
            </p>

            {/* Quick stats pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-slate-300">
              <span className="bg-black/50 border border-slate-700/60 px-3 py-1 rounded-md flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero Fast Fashion</span>
              </span>
              <span className="bg-black/50 border border-slate-700/60 px-3 py-1 rounded-md flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-[#d4a853]" />
                <span>UK Delivery via Evri &middot; InPost &middot; Royal Mail</span>
              </span>
              <span className="bg-black/50 border border-slate-700/60 px-3 py-1 rounded-md flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-400" />
                <span>7-Day UK Return Policy</span>
              </span>
            </div>
          </div>

          {/* WhatsApp Direct Order Box */}
          <div className="bg-black/60 border border-[#d4a853]/30 p-5 rounded-xl md:w-80 shrink-0 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#d4a853]">Direct Order Hotline</span>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <p className="text-xs text-slate-300">
              Prefer to order via WhatsApp or ask about sizing? Message our London team directly:
            </p>
            <a
              id="catalog-wa-hotline-btn"
              href={`https://wa.me/447591878215?text=${encodeURIComponent('Hello Style & Class, I would like to inquire about pre-loved items.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-black font-extrabold py-2.5 px-4 rounded-lg text-xs transition-all shadow-md"
            >
              <span>WhatsApp: +44 7591 878215</span>
            </a>
          </div>
        </div>
      </div>

      {/* Catalog Controls: Collections & Search Bar */}
      <div className="space-y-4 mb-8">
        {/* Collection Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {collections.map(col => {
            const isActive = activeCollection === col.id;
            return (
              <button
                key={col.id}
                id={`filter-collection-${col.id}`}
                type="button"
                onClick={() => handleCollectionChange(col.id)}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-[#d4a853] text-[#0a0a0a] shadow-lg shadow-[#d4a853]/20 scale-102'
                    : 'bg-[#13151f] text-slate-300 hover:text-white hover:bg-[#1a1d2b] border border-slate-800'
                }`}
              >
                <span>{col.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search, Brand & Sort Bar */}
        <div className="bg-[#13151f] border border-slate-800 rounded-xl p-3 sm:p-4 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="store-search-input"
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by title, brand, size, or code (e.g. BOX 1-2)..."
              className="w-full bg-[#0a0a0f] border border-slate-700/80 rounded-lg pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#d4a853] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                &times;
              </button>
            )}
          </div>

          {/* Filters & Sorters */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end flex-wrap">
            {/* Brand Filter */}
            {brands.length > 2 && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span>Brand:</span>
                <select
                  id="brand-filter-select"
                  value={selectedBrand}
                  onChange={e => setSelectedBrand(e.target.value)}
                  className="bg-[#0a0a0f] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#d4a853]"
                >
                  <option value="all">All Brands</option>
                  {brands.filter(b => b !== 'all').map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#d4a853]" />
              <span>Sort:</span>
              <select
                id="sort-select"
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="bg-[#0a0a0f] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#d4a853]"
              >
                <option value="featured">Featured Picks</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="condition">Condition Grade</option>
              </select>
            </div>

            {/* Result count */}
            <span className="text-[11px] font-mono text-[#e8c97a] bg-[#d4a853]/10 border border-[#d4a853]/20 px-2 py-1 rounded">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'Item' : 'Items'}
            </span>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-[#13151f] border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <p className="text-base text-slate-300 font-semibold">No pre-loved items found matching your filters.</p>
          <p className="text-xs text-slate-500">Try adjusting your search terms or clearing the selected filters.</p>
          <button
            type="button"
            onClick={() => {
              setActiveCollection('all');
              setSelectedBrand('all');
              setSearchQuery('');
            }}
            className="mt-2 px-4 py-2 bg-[#d4a853] text-black font-bold text-xs rounded-lg hover:bg-[#e8c97a] transition-all"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product, idx) => {
            const isCurrent = currentProduct.id === product.id;
            const currentImgIndex = hoveredImgIndex[product.id] || 0;
            const currentImg = product.images?.[currentImgIndex] || product.images?.[0] || '';
            const discountPct = product.compareAtPrice > product.price
              ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
              : 0;

            return (
              <motion.div
                key={product.id}
                id={`product-card-${product.id}`}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{
                  duration: 0.42,
                  delay: (idx % 4) * 0.07,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{
                  y: -6,
                  transition: { duration: 0.25, ease: 'easeOut' },
                }}
                whileTap={{ scale: 0.985 }}
                className={`group relative bg-[#13151f] border rounded-2xl overflow-hidden transition-colors flex flex-col justify-between hover:shadow-2xl hover:shadow-[#d4a853]/15 cursor-pointer ${
                  isCurrent ? 'border-[#d4a853] ring-1 ring-[#d4a853]/40' : 'border-slate-800 hover:border-[#d4a853]/60'
                }`}
              >
                {/* Image Container with Multi-Photo Carousel */}
                <div className="relative aspect-[3/4] bg-[#0a0a0f] overflow-hidden">
                  <img
                    src={currentImg}
                    alt={`${product.title} - ${product.brand || 'Pre-Loved'} Style & Class`}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />

                  {/* Badges Overlay */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                    {/* Item Code Badge */}
                    {product.code && (
                      <span className="bg-black/85 text-[#f5c469] border border-[#d4a853]/40 text-[10.5px] font-mono font-bold px-2 py-0.5 rounded shadow-sm backdrop-blur-xs">
                        {product.code}
                      </span>
                    )}

                    {/* 1 of 1 Badge */}
                    <span className="bg-red-500/90 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-sm uppercase tracking-wider flex items-center gap-1">
                      <span>1 OF 1 ONLY</span>
                    </span>

                    {/* Condition Badge */}
                    {product.condition && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded shadow-sm ${
                        product.condition.includes('New')
                          ? 'bg-emerald-600 text-white'
                          : product.condition.includes('Excellent')
                          ? 'bg-[#d4a853] text-black font-extrabold'
                          : 'bg-blue-600 text-white'
                      }`}>
                        {product.condition}
                      </span>
                    )}
                  </div>

                  {/* Discount pill */}
                  {discountPct > 0 && (
                    <div className="absolute top-3 right-3 bg-amber-500 text-black text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">
                      SAVE {discountPct}%
                    </div>
                  )}

                  {/* Photo Navigation Arrows (if multiple photos) */}
                  {product.images && product.images.length > 1 && (
                    <>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => handlePrevCardImg(e, product)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer shadow-md"
                        aria-label="Previous photo"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => handleNextCardImg(e, product)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer shadow-md"
                        aria-label="Next photo"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </motion.button>

                      {/* Photo dots counter */}
                      <div className="absolute bottom-2 left-1/2 -translate-y-0 -translate-x-1/2 bg-black/70 px-2 py-0.5 rounded-full text-[9px] text-slate-300 font-mono flex items-center gap-1">
                        <span>{currentImgIndex + 1}/{product.images.length}</span>
                      </div>
                    </>
                  )}

                  {/* Quick View Floating Overlay on Hover */}
                  <div className="absolute inset-x-3 bottom-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <motion.button
                      id={`quick-view-btn-${product.id}`}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => onQuickView(product)}
                      className="flex-1 bg-black/85 hover:bg-black text-white text-xs font-bold py-2 rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 shadow-lg backdrop-blur-xs transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#d4a853]" />
                      <span>Quick View</span>
                    </motion.button>
                    <motion.button
                      id={`inspect-full-btn-${product.id}`}
                      type="button"
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onSelectProduct(product)}
                      className="bg-[#d4a853] hover:bg-[#e8c97a] text-black text-xs font-extrabold px-3 py-2 rounded-xl shadow-lg transition-colors cursor-pointer"
                      title="Inspect full details & buy box"
                    >
                      Inspect
                    </motion.button>
                  </div>
                </div>

                {/* Card Information */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Brand & Category */}
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                      <span className="font-bold text-[#d4a853] uppercase tracking-wider truncate">
                        {product.brand || 'Curated Pre-Loved'}
                      </span>
                      <span className="text-[11px] text-slate-400 capitalize">
                        {product.category}
                      </span>
                    </div>

                    {/* Title */}
                    <h3
                      onClick={() => onSelectProduct(product)}
                      className="text-sm sm:text-base font-bold text-white hover:text-[#d4a853] transition-colors line-clamp-1 cursor-pointer"
                      title={product.title}
                    >
                      {product.title}
                    </h3>

                    {/* Size & Spec Pills */}
                    <div className="flex items-center gap-1.5 flex-wrap mt-2">
                      {product.sizes && product.sizes.map((s, idx) => (
                        <span key={idx} className="text-[10px] bg-slate-800/90 text-slate-300 px-2 py-0.5 rounded border border-slate-700/60 font-medium">
                          Size: {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-black text-white">
                          £{product.price.toFixed(2)}
                        </span>
                        {product.compareAtPrice > product.price && (
                          <span className="text-xs text-slate-500 line-through">
                            £{product.compareAtPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-emerald-400 font-medium block">
                        Tracked UK Dispatch
                      </span>
                    </div>

                    {/* Add to Cart Button */}
                    <motion.button
                      id={`card-add-to-bag-${product.id}`}
                      type="button"
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => onAddToCart(product)}
                      className="bg-[#d4a853] hover:bg-[#e8c97a] text-black p-2.5 rounded-xl transition-colors shadow-md flex items-center gap-1.5 text-xs font-extrabold cursor-pointer"
                      title="Add this 1-of-1 piece to your shopping bag"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span className="hidden xs:inline">Add</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
};
