import React, { useState, useEffect, useCallback } from 'react';
import { AnnouncementBar } from './components/AnnouncementBar';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { StoreCatalog } from './components/StoreCatalog';
import { ContactView } from './components/ContactView';
import { ProductGallery } from './components/ProductGallery';
import { ProductInfo } from './components/ProductInfo';
import { ProductTabs } from './components/ProductTabs';
import { SizeGuideModal } from './components/SizeGuideModal';
import { CartDrawer } from './components/CartDrawer';
import { PayPalCheckoutModal } from './components/PayPalCheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { AdminModal } from './components/AdminModal';
import { QuickViewModal } from './components/QuickViewModal';
import { LegalModal, LegalPolicyType } from './components/LegalModal';
import { StickyAddToCart } from './components/StickyAddToCart';
import { SocialProofToast } from './components/SocialProofToast';
import { FloatingWhatsAppButton } from './components/FloatingWhatsAppButton';
import { ScrollToTopButton } from './components/ScrollToTopButton';
import { RelatedProducts } from './components/RelatedProducts';
import { Footer } from './components/Footer';
import { Product, CartItem, Order, StoreSettings } from './types';
import { INITIAL_PRODUCTS, INITIAL_SETTINGS } from './data/initialProducts';
import { AlertCircle, CheckCircle2, ChevronRight, Home } from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);
  const [currency, setCurrency] = useState<string>('GBP');

  // Page Routing & Navigation
  const [activePage, setActivePage] = useState<'home' | 'collections' | 'contact' | 'detail'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Currently viewed product
  const [currentProduct, setCurrentProduct] = useState<Product>(INITIAL_PRODUCTS[0]);
  const [selectedColor, setSelectedColor] = useState<string>(INITIAL_PRODUCTS[0].colors[0]?.name || 'Standard');
  const [selectedSize, setSelectedSize] = useState<string>(INITIAL_PRODUCTS[0].sizes[0] || 'Standard');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  // Modals & Drawers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPayPalCheckoutOpen, setIsPayPalCheckoutOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [legalPolicyType, setLegalPolicyType] = useState<LegalPolicyType>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const [successOrderData, setSuccessOrderData] = useState<{
    order: Order;
    whatsappUrl: string;
    removedProducts: string[];
  } | null>(null);

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [inventoryAlert, setInventoryAlert] = useState<string | null>(null);

  // Load data from Backend API
  const refreshData = useCallback(async () => {
    try {
      const resProducts = await fetch('/api/products?all=true');
      if (resProducts.ok) {
        const prodData: Product[] = await resProducts.json();
        if (Array.isArray(prodData) && prodData.length > 0) {
          setProducts(prodData);
          setCurrentProduct((prev) => {
            const match = prodData.find((p) => p.id === prev.id);
            return match || prodData.find(p => p.status === 'active') || prodData[0];
          });
        }
      }

      const resOrders = await fetch('/api/orders');
      if (resOrders.ok) {
        const orderData = await resOrders.json();
        setOrders(orderData);
      }

      const resSettings = await fetch('/api/settings');
      if (resSettings.ok) {
        const setData = await resSettings.json();
        setSettings(setData);
      }
    } catch (e) {
      console.warn('Backend API fetch error (using fallback state):', e);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Navigation Handler
  const handleNavigate = (page: 'home' | 'collections' | 'contact' | 'detail', category?: string) => {
    setActivePage(page);
    if (category) {
      setSelectedCategory(category);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectColor = (colorName: string) => {
    setSelectedColor(colorName);
    const colorObj = currentProduct.colors.find((c) => c.name === colorName);
    if (colorObj && typeof colorObj.imageIndex === 'number' && currentProduct.images[colorObj.imageIndex]) {
      setActiveImageIndex(colorObj.imageIndex);
    }
  };

  const handleSelectProduct = (product: Product) => {
    setCurrentProduct(product);
    setSelectedColor(product.colors[0]?.name || 'Standard');
    setSelectedSize(product.sizes[0] || 'Standard');
    setQuantity(1);
    setActiveImageIndex(0);
    setActivePage('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generic Add-To-Cart handler from card or list
  const handleAddToCartFromCard = (product: Product, size?: string) => {
    if (product.stock <= 0) {
      alert('Sorry, this unique pre-loved piece is already reserved.');
      return;
    }

    const targetSize = size || product.sizes[0] || 'Standard';
    const targetColor = product.colors[0]?.name || 'Standard';

    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (it) =>
          it.product.id === product.id &&
          it.selectedColor === targetColor &&
          it.selectedSize === targetSize
      );

      if (existingIdx > -1) {
        const updated = [...prev];
        const newQty = Math.min(product.stock, updated[existingIdx].quantity + 1);
        updated[existingIdx] = { ...updated[existingIdx], quantity: newQty };
        return updated;
      } else {
        return [
          ...prev,
          {
            product,
            selectedColor: targetColor,
            selectedSize: targetSize,
            quantity: 1
          }
        ];
      }
    });

    setIsCartOpen(true);
  };

  // Cart Handlers
  const handleAddToCart = () => {
    if (currentProduct.stock <= 0) {
      alert('Sorry, this product is currently sold out.');
      return;
    }

    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (it) =>
          it.product.id === currentProduct.id &&
          it.selectedColor === selectedColor &&
          it.selectedSize === selectedSize
      );

      if (existingIdx > -1) {
        const updated = [...prev];
        const newQty = Math.min(currentProduct.stock, updated[existingIdx].quantity + quantity);
        updated[existingIdx] = { ...updated[existingIdx], quantity: newQty };
        return updated;
      } else {
        return [
          ...prev,
          {
            product: currentProduct,
            selectedColor,
            selectedSize,
            quantity: Math.min(currentProduct.stock, quantity)
          }
        ];
      }
    });

    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (idx: number, newQty: number) => {
    setCart((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], quantity: newQty };
      return updated;
    });
  };

  const handleRemoveCartItem = (idx: number) => {
    setCart((prev) => prev.filter((_, i) => i !== idx));
  };

  // Direct PayPal Buy Button on Product Page
  const handleBuyWithPayPalDirect = () => {
    if (currentProduct.stock <= 0) return;
    setCart([
      {
        product: currentProduct,
        selectedColor,
        selectedSize,
        quantity
      }
    ]);
    setIsCartOpen(false);
    setIsPayPalCheckoutOpen(true);
  };

  // Direct WhatsApp Order Button on Product Page
  const handleOrderViaWhatsAppDirect = () => {
    const cleanPhone = (settings.merchantWhatsApp || '+447591878215').replace(/[^0-9+]/g, '').replace('+', '');
    const message = `👋 Hello Style & Class London! I want to order the:\n\n👗 *${currentProduct.title}* [${currentProduct.code || currentProduct.sku || '1-of-1'}]\nBrand: ${currentProduct.brand || 'Designer'}\nSize: ${selectedSize}\nQuantity: ${quantity}\nPrice: £${(currentProduct.price * quantity).toFixed(2)}\n\nPlease assist me with quick UK delivery checkout!`;
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // WhatsApp Order from Cart Drawer
  const handleCheckoutWhatsAppFromCart = () => {
    if (cart.length === 0) return;
    const cleanPhone = (settings.merchantWhatsApp || '+447591878215').replace(/[^0-9+]/g, '').replace('+', '');
    const itemsText = cart
      .map(
        (it) => `• ${it.product.title} [${it.product.code || it.product.sku || '1-of-1'}] (${it.selectedSize}) x${it.quantity} - £${(it.product.price * it.quantity).toFixed(2)}`
      )
      .join('\n');
    const subtotal = cart.reduce((a, b) => a + b.product.price * b.quantity, 0);

    const message = `👋 Hello Style & Class London! I'd like to place an order directly via WhatsApp:\n\n*Items in Bag:*\n${itemsText}\n\n*Subtotal: £${subtotal.toFixed(2)}*\nPlease provide payment and UK delivery confirmation!`;
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // Order Completed
  const handleOrderSuccess = async (
    order: Order,
    whatsappUrl: string,
    removedProducts: string[]
  ) => {
    setIsPayPalCheckoutOpen(false);
    setIsCartOpen(false);
    setCart([]);

    if (removedProducts && removedProducts.length > 0) {
      setInventoryAlert(
        `Automated Store Notice: "${removedProducts.join(', ')}" was purchased (final 1 piece in stock) and has been automatically archived from the storefront!`
      );
    }

    setSuccessOrderData({
      order,
      whatsappUrl,
      removedProducts: removedProducts || []
    });

    await refreshData();
  };

  // Admin CRUD operations
  const handleAddProduct = async (productData: Partial<Product>) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      if (res.ok) {
        await refreshData();
      }
    } catch (e) {
      console.error('Error adding product:', e);
    }
  };

  const handleUpdateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        await refreshData();
      }
    } catch (e) {
      console.error('Error updating product:', e);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await refreshData();
      }
    } catch (e) {
      console.error('Error deleting product:', e);
    }
  };

  const handleUpdateSettings = async (newSettings: Partial<StoreSettings>) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
      }
    } catch (e) {
      console.error('Error updating settings:', e);
    }
  };

  // Active products for public storefront
  const activeProducts = products.filter((p) => p.status === 'active' && p.stock > 0);
  const isCurrentProductSoldOut = currentProduct.stock <= 0 || currentProduct.status === 'archived';

  return (
    <div className="min-h-screen bg-[#07080b] text-slate-100 flex flex-col font-sans antialiased selection:bg-[#d4a853] selection:text-black">
      {/* Top Urgency & Announcement Bar */}
      <AnnouncementBar
        settings={settings}
        currency={currency}
        onCurrencyChange={setCurrency}
      />

      {/* Main Header with full Style And Class menus */}
      <Header
        activePage={activePage === 'detail' ? 'collections' : activePage}
        selectedCategory={selectedCategory}
        onNavigate={handleNavigate}
        onOpenLegal={(policy) => setLegalPolicyType(policy)}
        cartCount={cart.reduce((a, b) => a + b.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onSelectProduct={handleSelectProduct}
        products={activeProducts}
        merchantWhatsApp={settings.merchantWhatsApp}
      />

      {/* Inventory Automation Notification Banner */}
      {inventoryAlert && (
        <div className="bg-[#d4a853]/15 border-b border-[#d4a853]/30 text-[#f5c469] px-4 py-3 text-xs sm:text-sm font-semibold flex items-center justify-between">
          <div className="max-w-7xl mx-auto flex items-center gap-2.5 w-full">
            <CheckCircle2 className="w-4 h-4 text-[#d4a853] flex-shrink-0" />
            <span>{inventoryAlert}</span>
          </div>
          <button
            type="button"
            onClick={() => setInventoryAlert(null)}
            className="text-slate-400 hover:text-white font-bold ml-2 p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Dynamic Breadcrumbs */}
      <div className="bg-[#090a0f] border-b border-slate-900">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 w-full">
          <ol className="flex items-center space-x-2 text-xs text-slate-400 font-medium">
            <li>
              <button
                type="button"
                onClick={() => handleNavigate('home')}
                className="hover:text-[#d4a853] flex items-center gap-1.5 transition-colors"
              >
                <Home className="w-3.5 h-3.5 text-slate-400" />
                <span>Home</span>
              </button>
            </li>

            {activePage === 'collections' && (
              <>
                <li><ChevronRight className="w-3 h-3 text-slate-600" /></li>
                <li className="font-bold text-white capitalize">
                  {selectedCategory === 'all' ? 'All Items' : `${selectedCategory} Collection`}
                </li>
              </>
            )}

            {activePage === 'contact' && (
              <>
                <li><ChevronRight className="w-3 h-3 text-slate-600" /></li>
                <li className="font-bold text-white">Customer Concierge &middot; Contact</li>
              </>
            )}

            {activePage === 'detail' && (
              <>
                <li><ChevronRight className="w-3 h-3 text-slate-600" /></li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavigate('collections', currentProduct.collection || 'all')}
                    className="hover:text-[#d4a853] transition-colors capitalize"
                  >
                    {currentProduct.collection || 'Catalog'}
                  </button>
                </li>
                <li><ChevronRight className="w-3 h-3 text-slate-600" /></li>
                <li className="font-bold text-white truncate max-w-[200px] sm:max-w-md">
                  {currentProduct.title} ({currentProduct.code || currentProduct.sku})
                </li>
              </>
            )}
          </ol>
        </nav>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {/* VIEW 1: HOME VIEW */}
        {activePage === 'home' && (
          <HomeView
            products={products}
            onSelectProduct={handleSelectProduct}
            onAddToCart={handleAddToCartFromCard}
            onQuickView={(p) => setQuickViewProduct(p)}
            onNavigateCollections={(cat) => handleNavigate('collections', cat)}
            settings={settings}
          />
        )}

        {/* VIEW 2: COLLECTIONS / STORE CATALOG */}
        {activePage === 'collections' && (
          <StoreCatalog
            products={products}
            currentProduct={currentProduct}
            onSelectProduct={handleSelectProduct}
            onAddToCart={handleAddToCartFromCard}
            onQuickView={(p) => setQuickViewProduct(p)}
            settings={settings}
            selectedCategory={selectedCategory}
            onCategoryChange={(cat) => setSelectedCategory(cat)}
          />
        )}

        {/* VIEW 3: CONTACT VIEW */}
        {activePage === 'contact' && (
          <ContactView
            settings={settings}
            onNavigateHome={() => handleNavigate('home')}
            onNavigateCollections={() => handleNavigate('collections', 'all')}
          />
        )}

        {/* VIEW 4: PRODUCT DETAIL SHOWCASE */}
        {activePage === 'detail' && (
          <div id="product-showcase" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
            {isCurrentProductSoldOut ? (
              <div className="p-8 my-6 bg-[#0e1017] border-2 border-dashed border-[#d4a853]/40 rounded-3xl text-center space-y-3">
                <AlertCircle className="w-12 h-12 text-[#d4a853] mx-auto" />
                <h2 className="text-xl sm:text-2xl font-black text-white font-serif">
                  This 1-of-1 Item Was Purchased &amp; Removed
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                  In accordance with Style &amp; Class inventory rules, when a unique pre-loved garment is purchased, it is immediately archived so nobody else can buy it.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleNavigate('collections', 'all')}
                    className="px-6 py-2.5 bg-[#d4a853] text-black font-extrabold text-xs rounded-xl"
                  >
                    View Available Pieces
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                {/* Left Column: Image Gallery */}
                <div className="lg:col-span-7">
                  <ProductGallery
                    images={currentProduct.images}
                    title={currentProduct.title}
                    activeImageIndex={activeImageIndex}
                    onSelectImage={setActiveImageIndex}
                  />
                </div>

                {/* Right Column: Buy Box & Product Info */}
                <div className="lg:col-span-5">
                  <ProductInfo
                    product={currentProduct}
                    selectedColor={selectedColor}
                    onSelectColor={handleSelectColor}
                    selectedSize={selectedSize}
                    onSelectSize={setSelectedSize}
                    quantity={quantity}
                    onQuantityChange={setQuantity}
                    onAddToCart={handleAddToCart}
                    onBuyWithPayPal={handleBuyWithPayPalDirect}
                    onOrderViaWhatsApp={handleOrderViaWhatsAppDirect}
                    onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
                    currencySymbol={settings.currencySymbol || '£'}
                  />
                </div>
              </div>
            )}

            {/* Technical Specs, Description, and Verified Reviews */}
            <div id="features-section">
              <ProductTabs
                product={currentProduct}
                currencySymbol={settings.currencySymbol || '£'}
              />
            </div>

            {/* Related Products Section */}
            <RelatedProducts
              products={activeProducts}
              currentProductId={currentProduct.id}
              onSelectProduct={handleSelectProduct}
              currencySymbol={settings.currencySymbol || '£'}
            />
          </div>
        )}
      </main>

      {/* Floating Social Proof Toast */}
      <SocialProofToast />

      {/* Floating Persistent WhatsApp Action Button */}
      <FloatingWhatsAppButton
        settings={settings}
        currentProduct={activePage === 'detail' ? currentProduct : null}
        activePage={activePage}
        hasStickyBar={activePage === 'detail' && !isCurrentProductSoldOut}
      />

      {/* Floating Left-Side Jump to Top Button */}
      <ScrollToTopButton
        hasStickyBar={activePage === 'detail' && !isCurrentProductSoldOut}
      />

      {/* Sticky Bottom Add-To-Cart Bar (active during detail view) */}
      {activePage === 'detail' && !isCurrentProductSoldOut && (
        <StickyAddToCart
          product={currentProduct}
          selectedColor={selectedColor}
          selectedSize={selectedSize}
          onSelectSize={setSelectedSize}
          onAddToCart={handleAddToCart}
          onBuyWithPayPal={handleBuyWithPayPalDirect}
          currencySymbol={settings.currencySymbol || '£'}
        />
      )}

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={(p, sz) => {
          handleAddToCartFromCard(p, sz);
          setQuickViewProduct(null);
        }}
        onBuyNowWithPayPal={(p, sz) => {
          setCart([
            {
              product: p,
              selectedColor: p.colors[0]?.name || 'Standard',
              selectedSize: sz || p.sizes[0] || 'Standard',
              quantity: 1
            }
          ]);
          setQuickViewProduct(null);
          setIsPayPalCheckoutOpen(true);
        }}
        settings={settings}
      />

      {/* Legal Modal (Terms & Conditions, Privacy Policy, Cookie Policy) */}
      <LegalModal
        policyType={legalPolicyType}
        onClose={() => setLegalPolicyType(null)}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveCartItem}
        onCheckoutPayPal={() => {
          setIsCartOpen(false);
          setIsPayPalCheckoutOpen(true);
        }}
        onCheckoutWhatsApp={handleCheckoutWhatsAppFromCart}
        currencySymbol={settings.currencySymbol || '£'}
      />

      {/* PayPal UK Checkout Modal */}
      <PayPalCheckoutModal
        isOpen={isPayPalCheckoutOpen}
        onClose={() => setIsPayPalCheckoutOpen(false)}
        items={cart}
        currencySymbol={settings.currencySymbol || '£'}
        paypalClientId={settings.paypalClientId}
        merchantWhatsApp={settings.merchantWhatsApp}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Order Confirmation Modal with WhatsApp Direct Dispatch Link */}
      <OrderSuccessModal
        order={successOrderData?.order || null}
        whatsappUrl={successOrderData?.whatsappUrl || ''}
        removedProducts={successOrderData?.removedProducts || []}
        onClose={() => setSuccessOrderData(null)}
        currencySymbol={settings.currencySymbol || '£'}
      />

      {/* Size Guide Modal */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        selectedSize={selectedSize}
        onSelectSize={setSelectedSize}
      />

      {/* Store Database & Admin Manager Modal */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        products={products}
        orders={orders}
        settings={settings}
        onAddProduct={handleAddProduct}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
        onUpdateSettings={handleUpdateSettings}
        onRefreshData={refreshData}
        currencySymbol={settings.currencySymbol || '£'}
      />

      {/* Footer with full navigation, social links, legal modals, and support */}
      <Footer
        onOpenAdmin={() => setIsAdminOpen(true)}
        settings={settings}
        onNavigate={handleNavigate}
        onOpenLegal={(policy) => setLegalPolicyType(policy)}
      />
    </div>
  );
}
