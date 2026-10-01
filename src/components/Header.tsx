import React, { useState } from 'react';
import { ShoppingBag, Search, Database, MessageCircle, Menu, X, Phone, Home, LayoutGrid, Mail, ChevronDown, Sparkles, FileText, Shield, Cookie } from 'lucide-react';
import { Product } from '../types';

interface HeaderProps {
  activePage: 'home' | 'collections' | 'contact';
  selectedCategory: string;
  onNavigate: (page: 'home' | 'collections' | 'contact', category?: string) => void;
  onOpenLegal: (policy: 'terms' | 'privacy' | 'cookie') => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenAdmin: () => void;
  onSelectProduct: (product: Product) => void;
  products: Product[];
  merchantWhatsApp: string;
}

export const Header: React.FC<HeaderProps> = ({
  activePage,
  selectedCategory,
  onNavigate,
  onOpenLegal,
  cartCount,
  onOpenCart,
  onOpenAdmin,
  onSelectProduct,
  products,
  merchantWhatsApp
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [collectionsDropdownOpen, setCollectionsDropdownOpen] = useState(false);

  const filteredProducts = searchQuery.trim()
    ? products.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const cleanPhone = merchantWhatsApp.replace(/[^0-9+]/g, '').replace('+', '');
  const waHelpUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent('Hi Style & Class London, I have a question about your pre-loved collections.')}`;

  const handleNav = (page: 'home' | 'collections' | 'contact', category?: string) => {
    onNavigate(page, category);
    setMobileMenuOpen(false);
    setCollectionsDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-[#090a0f]/95 backdrop-blur-md border-b border-[#d4a853]/25 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Left Navigation Stack (matching styleandclass.store) */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mobile Hamburger Toggle */}
            <button
              id="menuToggle"
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 -ml-2 text-slate-300 hover:text-[#d4a853] focus:outline-none transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Desktop Left Nav Links */}
            <nav className="hidden lg:flex items-center gap-2" id="navLeft">
              {/* Home */}
              <button
                type="button"
                onClick={() => handleNav('home')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-[13px] font-bold tracking-wide transition-all ${
                  activePage === 'home'
                    ? 'bg-[#d4a853]/15 text-[#d4a853] border border-[#d4a853]/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </button>

              {/* All Items & Collections Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setCollectionsDropdownOpen(true)}
                onMouseLeave={() => setCollectionsDropdownOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => handleNav('collections', 'all')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-[13px] font-bold tracking-wide transition-all ${
                    activePage === 'collections'
                      ? 'bg-[#d4a853]/15 text-[#d4a853] border border-[#d4a853]/40'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span>All Items</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${collectionsDropdownOpen ? 'rotate-180 text-[#d4a853]' : 'text-slate-400'}`} />
                </button>

                {/* Dropdown Menu for Categories */}
                {collectionsDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-52 bg-[#0e1017] border border-[#d4a853]/35 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#d4a853]/80 border-b border-slate-800">
                      Collections
                    </div>
                    <button
                      type="button"
                      onClick={() => handleNav('collections', 'all')}
                      className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-800/80 transition-colors ${
                        activePage === 'collections' && selectedCategory === 'all' ? 'text-[#d4a853] font-bold bg-[#d4a853]/10' : 'text-slate-300'
                      }`}
                    >
                      <span>All Pre-Loved</span>
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-full">{products.length}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNav('collections', 'women')}
                      className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-800/80 transition-colors ${
                        activePage === 'collections' && selectedCategory === 'women' ? 'text-[#d4a853] font-bold bg-[#d4a853]/10' : 'text-slate-300'
                      }`}
                    >
                      <span>Women Collection</span>
                      <span className="text-[10px] bg-[#d4a853]/15 text-[#d4a853] px-1.5 py-0.5 rounded-full font-bold">1-of-1</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNav('collections', 'men')}
                      className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-800/80 transition-colors ${
                        activePage === 'collections' && selectedCategory === 'men' ? 'text-[#d4a853] font-bold bg-[#d4a853]/10' : 'text-slate-300'
                      }`}
                    >
                      <span>Men Collection</span>
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-full">Vintage</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNav('collections', 'kids')}
                      className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-800/80 transition-colors ${
                        activePage === 'collections' && selectedCategory === 'kids' ? 'text-[#d4a853] font-bold bg-[#d4a853]/10' : 'text-slate-300'
                      }`}
                    >
                      <span>Kids Collection</span>
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-full">Organic</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNav('collections', 'accessories')}
                      className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-800/80 transition-colors ${
                        activePage === 'collections' && selectedCategory === 'accessories' ? 'text-[#d4a853] font-bold bg-[#d4a853]/10' : 'text-slate-300'
                      }`}
                    >
                      <span>Accessories</span>
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-full">Luxury</span>
                    </button>
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Center Brand Wordmark: Style And Class */}
          <button
            type="button"
            onClick={() => handleNav('home')}
            className="flex flex-col items-center group cursor-pointer text-center"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-xl sm:text-2xl font-black tracking-wider text-white uppercase font-serif">
                Style <span className="text-[#d4a853] font-serif font-bold">&amp;</span> Class
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#d4a853] mb-1" />
            </div>
            <span className="text-[8.5px] sm:text-[9.5px] tracking-[0.28em] text-[#b8b0a8] font-bold uppercase mt-0.5">
              CURATED PRE-LOVED FASHION &middot; LONDON
            </span>
          </button>

          {/* Right Action Stack (matching styleandclass.store) */}
          <div className="flex items-center gap-2 sm:gap-3" id="navRight">
            {/* Contact Nav Link */}
            <button
              type="button"
              onClick={() => handleNav('contact')}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-[13px] font-bold tracking-wide transition-all ${
                activePage === 'contact'
                  ? 'bg-[#d4a853]/15 text-[#d4a853] border border-[#d4a853]/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Contact</span>
            </button>

            {/* Quick Search Button */}
            <button
              id="header-search-btn"
              type="button"
              onClick={() => setSearchOpen(true)}
              className="p-2 text-slate-300 hover:text-[#d4a853] rounded-xl hover:bg-slate-800/60 transition-colors"
              aria-label="Search Catalog"
              title="Search catalog"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Admin Console Trigger */}
            <button
              id="header-admin-btn"
              type="button"
              onClick={onOpenAdmin}
              className="p-2 text-slate-400 hover:text-[#d4a853] rounded-xl hover:bg-slate-800/60 transition-colors"
              aria-label="Store Admin"
              title="Store Management & Database"
            >
              <Database className="w-5 h-5" />
            </button>

            {/* Shopping Cart Button with Badge */}
            <button
              id="cartBtnHeader"
              type="button"
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-3.5 py-2 bg-[#d4a853] hover:bg-[#c29642] text-black font-extrabold text-xs rounded-xl transition-all shadow-md active:scale-95"
              aria-label="Shopping Bag"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Bag</span>
              <span
                id="cartCount"
                className="w-5 h-5 rounded-full bg-black text-[#d4a853] text-[11px] font-black flex items-center justify-center -mr-1"
              >
                {cartCount}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu (Matching styleandclass.store mobile drawer) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Dark Overlay */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="fixed top-0 left-0 bottom-0 w-4/5 max-w-sm bg-[#0e1017] border-r border-[#d4a853]/30 shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-200">
            <div className="space-y-6">
              {/* Header inside drawer */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex flex-col">
                  <span className="text-lg font-black text-white font-serif uppercase tracking-wider">
                    Style <span className="text-[#d4a853]">&amp;</span> Class
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    Pre-Loved UK Boutique
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-slate-400 hover:text-white"
                  aria-label="Close Mobile Menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Primary Links */}
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => handleNav('home')}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3 transition-colors ${
                    activePage === 'home' ? 'bg-[#d4a853]/15 text-[#d4a853]' : 'text-slate-200 hover:bg-slate-800/80'
                  }`}
                >
                  <Home className="w-5 h-5 text-[#d4a853]" />
                  <span>Home</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNav('collections', 'all')}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3 transition-colors ${
                    activePage === 'collections' && selectedCategory === 'all' ? 'bg-[#d4a853]/15 text-[#d4a853]' : 'text-slate-200 hover:bg-slate-800/80'
                  }`}
                >
                  <LayoutGrid className="w-5 h-5 text-[#d4a853]" />
                  <span>All Items</span>
                </button>
              </div>

              {/* Mobile Categories (Women, Men, Kids, Accessories) */}
              <div className="pt-2 border-t border-slate-800">
                <span className="px-4 text-[10px] font-extrabold uppercase tracking-widest text-[#d4a853] block mb-2">
                  Browse by Collection
                </span>
                <div className="space-y-1 pl-2">
                  <button
                    type="button"
                    onClick={() => handleNav('collections', 'women')}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm flex items-center justify-between transition-colors ${
                      activePage === 'collections' && selectedCategory === 'women' ? 'bg-[#d4a853]/15 text-[#d4a853] font-bold' : 'text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <span>Women</span>
                    <span className="text-[10px] text-amber-300 font-bold">1-of-1</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNav('collections', 'men')}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm flex items-center justify-between transition-colors ${
                      activePage === 'collections' && selectedCategory === 'men' ? 'bg-[#d4a853]/15 text-[#d4a853] font-bold' : 'text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <span>Men</span>
                    <span className="text-[10px] text-slate-400">Vintage</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNav('collections', 'kids')}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm flex items-center justify-between transition-colors ${
                      activePage === 'collections' && selectedCategory === 'kids' ? 'bg-[#d4a853]/15 text-[#d4a853] font-bold' : 'text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <span>Kids</span>
                    <span className="text-[10px] text-slate-400">Organic</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNav('collections', 'accessories')}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm flex items-center justify-between transition-colors ${
                      activePage === 'collections' && selectedCategory === 'accessories' ? 'bg-[#d4a853]/15 text-[#d4a853] font-bold' : 'text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <span>Accessories</span>
                    <span className="text-[10px] text-slate-400">Luxury</span>
                  </button>
                </div>
              </div>

              {/* Contact Link */}
              <div className="pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => handleNav('contact')}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3 transition-colors ${
                    activePage === 'contact' ? 'bg-[#d4a853]/15 text-[#d4a853]' : 'text-slate-200 hover:bg-slate-800/80'
                  }`}
                >
                  <Mail className="w-5 h-5 text-[#d4a853]" />
                  <span>Contact &amp; Concierge</span>
                </button>
              </div>

              {/* Legal Links */}
              <div className="pt-2 border-t border-slate-800 text-xs text-slate-400 space-y-2 px-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-1">
                  Legal &amp; Policies
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenLegal('terms');
                  }}
                  className="block hover:text-white"
                >
                  Terms &amp; Conditions
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenLegal('privacy');
                  }}
                  className="block hover:text-white"
                >
                  Privacy Policy
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenLegal('cookie');
                  }}
                  className="block hover:text-white"
                >
                  Cookie Policy
                </button>
              </div>
            </div>

            {/* Bottom Support in Drawer */}
            <div className="pt-6 border-t border-slate-800 space-y-3">
              <a
                href={waHelpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 bg-[#25D366] text-black font-extrabold text-xs rounded-xl flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 fill-black" />
                <span>WhatsApp: +44 7591 878215</span>
              </a>
              <p className="text-[11px] text-center text-slate-500 font-mono">
                UK Tracked Dispatches &middot; London
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Global Quick Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
          <div className="bg-[#0e1017] border border-[#d4a853]/40 rounded-2xl w-full max-w-2xl shadow-2xl p-6 text-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3 flex-1">
                <Search className="w-5 h-5 text-[#d4a853]" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by designer, garment code (e.g. BOX 1 -1), size or category..."
                  className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery('');
                }}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Results */}
            <div className="mt-4 max-h-96 overflow-y-auto divide-y divide-slate-800/60">
              {searchQuery.trim() === '' ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  Type to search across Women, Men, Kids, and Accessories.
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No items found matching &quot;{searchQuery}&quot;.
                </div>
              ) : (
                filteredProducts.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      onSelectProduct(p);
                      setSearchOpen(false);
                      setSearchQuery('');
                      onNavigate('collections');
                    }}
                    className="w-full text-left py-3 px-2 flex items-center gap-4 hover:bg-slate-800/40 rounded-xl transition-colors"
                  >
                    <img
                      src={p.images[0]}
                      alt={p.title}
                      className="w-12 h-12 object-cover rounded-lg bg-slate-900 border border-slate-700"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#d4a853]/15 text-[#d4a853] rounded font-bold">
                          {p.code || p.sku}
                        </span>
                        <span className="text-xs font-bold text-white truncate">{p.title}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{p.brand}</span>
                        <span>&middot;</span>
                        <span className="capitalize">{p.collection}</span>
                        <span>&middot;</span>
                        <span>{p.condition}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-white">£{p.price.toFixed(2)}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
