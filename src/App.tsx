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
import { AdminPasswordModal } from './components/AdminPasswordModal';
import { QuickViewModal } from './components/QuickViewModal';
import { LegalModal, LegalPolicyType } from './components/LegalModal';
import { StickyAddToCart } from './components/StickyAddToCart';
import { SocialProofToast } from './components/SocialProofToast';
import { FloatingWhatsAppButton } from './components/FloatingWhatsAppButton';
import { ScrollToTopButton } from './components/ScrollToTopButton';
import { RelatedProducts } from './components/RelatedProducts';
import { Footer } from './components/Footer';
import { ShippingLabelView } from './components/ShippingLabelView';
import { TrustHeroBar } from './components/TrustHeroBar';
import { FrequentlyBoughtTogether } from './components/FrequentlyBoughtTogether';
import { AbandonedCartRecoveryModal } from './components/AbandonedCartRecoveryModal';
import { StoreAuditModal } from './components/StoreAuditModal';
import { Product, CartItem, Order, StoreSettings } from './types';
import { INITIAL_PRODUCTS, INITIAL_SETTINGS } from './data/initialProducts';
import { AlertCircle, CheckCircle2, ChevronRight, Home } from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);
  const [currency, setCurrency] = useState<string>('GBP');

  // Page Routing & Navigation
  const [activePage, setActivePage] = useState<'home' | 'collections' | 'contact' | 'detail' | 'label'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLabelOrder, setSelectedLabelOrder] = useState<Order | null>(null);

  // Currently viewed product (prefer active in-stock item)
  const [currentProduct, setCurrentProduct] = useState<Product>(
    INITIAL_PRODUCTS.find((p) => p.status === 'active' && p.stock > 0) || INITIAL_PRODUCTS[0]
  );
  const [selectedColor, setSelectedColor] = useState<string>(INITIAL_PRODUCTS[0].colors[0]?.name || 'Standard');
  const [selectedSize, setSelectedSize] = useState<string>(INITIAL_PRODUCTS[0].sizes[0] || 'Standard');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  // Modals & Drawers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPayPalCheckoutOpen, setIsPayPalCheckoutOpen] = useState(false);
  const [checkoutCarrier, setCheckoutCarrier] = useState<string>('evri');
  const [checkoutInitialPaymentMethod, setCheckoutInitialPaymentMethod] = useState<'paypal' | 'card'>('paypal');
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [legalPolicyType, setLegalPolicyType] = useState<LegalPolicyType>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isAbandonedModalOpen, setIsAbandonedModalOpen] = useState(false);
  const [hasShownAbandonedModal, setHasShownAbandonedModal] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; percent: number } | null>(null);

  // Trigger protected store brain/database
  const handleRequestAdminAccess = () => {
    setIsPasswordModalOpen(true);
  };

  const handleAdminPasswordSuccess = () => {
    setIsPasswordModalOpen(false);
    setIsAdminOpen(true);
  };

  const [successOrderData, setSuccessOrderData] = useState<{
    order: Order;
    whatsappUrl: string;
    removedProducts: string[];
  } | null>(null);

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [inventoryAlert, setInventoryAlert] = useState<string | null>(null);

  // Load data from Backend API safely
  const refreshData = useCallback(async () => {
    try {
      const resProducts = await fetch('/api/products?all=true');
      if (resProducts.ok) {
        const text = await resProducts.text();
        if (text) {
          try {
            const prodData: Product[] = JSON.parse(text);
            if (Array.isArray(prodData)) {
              // Intersect with locally cached sold IDs to guarantee immediate sold status
              const localSold: string[] = JSON.parse(localStorage.getItem('styleandclass_sold_ids') || '[]');
              const localSoldSet = new Set(localSold);
              const updatedProds = prodData.map(p => {
                if (localSoldSet.has(p.id) || p.status === 'sold' || p.stock <= 0) {
                  return { ...p, status: 'sold' as const, stock: 0 };
                }
                return p;
              });

              setProducts(updatedProds);
              setCurrentProduct((prev) => {
                const match = updatedProds.find((p) => p.id === prev.id);
                return match || updatedProds[0] || { ...prev, stock: 0, status: 'sold' };
              });
            }
          } catch (jsonErr) {
            console.warn('Failed to parse products JSON:', jsonErr);
          }
        }
      }

      const resOrders = await fetch('/api/orders');
      if (resOrders.ok) {
        const text = await resOrders.text();
        if (text) {
          try {
            const orderData = JSON.parse(text);
            if (Array.isArray(orderData)) {
              setOrders(orderData);
            }
          } catch (jsonErr) {
            console.warn('Failed to parse orders JSON:', jsonErr);
          }
        }
      }

      const resSettings = await fetch('/api/settings');
      if (resSettings.ok) {
        const text = await resSettings.text();
        if (text) {
          try {
            const setData = JSON.parse(text);
            if (setData && typeof setData === 'object') {
              setSettings(setData);
            }
          } catch (jsonErr) {
            console.warn('Failed to parse settings JSON:', jsonErr);
          }
        }
      }
    } catch (e) {
      console.warn('Backend API fetch error (using fallback state):', e);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // URL Hash & Query routing for thermal shipping label
  useEffect(() => {
    const handleUrlRoute = () => {
      const hash = window.location.hash;
      const search = window.location.search;
      const params = new URLSearchParams(search);
      const labelParam = params.get('label') || params.get('order');

      if (hash.startsWith('#label') || labelParam || window.location.pathname.includes('/label')) {
        const rawId = (labelParam || hash.replace('#label-', '').replace('#label/', '').replace('#label', '')).trim();
        setActivePage('label');
        if (rawId && orders.length > 0) {
          const match = orders.find(
            (o) => o.id.toLowerCase() === rawId.toLowerCase() || o.id.toLowerCase() === `sac-${rawId.toLowerCase()}`
          );
          if (match) setSelectedLabelOrder(match);
        }
      } else if (hash === '#terms' || hash === '#terms-and-conditions' || hash === '#terms-conditions') {
        setLegalPolicyType('terms');
      } else if (hash === '#privacy' || hash === '#privacy-policy') {
        setLegalPolicyType('privacy');
      } else if (hash === '#cookie' || hash === '#cookie-policy' || hash === '#cookies') {
        setLegalPolicyType('cookie');
      } else if (hash === '#audit' || hash === '#store-audit') {
        setIsAuditModalOpen(true);
      }
    };

    handleUrlRoute();
    window.addEventListener('hashchange', handleUrlRoute);
    window.addEventListener('popstate', handleUrlRoute);
    return () => {
      window.removeEventListener('hashchange', handleUrlRoute);
      window.removeEventListener('popstate', handleUrlRoute);
    };
  }, [orders]);

  // Smart Exit-Intent & Inactivity Abandoned Cart Recovery (Audit Fix #2)
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 12 && cart.length > 0 && !hasShownAbandonedModal && !isCartOpen && !isPayPalCheckoutOpen) {
        setHasShownAbandonedModal(true);
        setIsAbandonedModalOpen(true);
      }
    };
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [cart.length, hasShownAbandonedModal, isCartOpen, isPayPalCheckoutOpen]);

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

  // Bundle Add handler for FrequentlyBoughtTogether (Audit Fix: Issue #3)
  const handleAddBundleToCart = (bundleProducts: Product[], discountCode: string) => {
    setCart((prev) => {
      let updated = [...prev];
      bundleProducts.forEach((prod) => {
        if (prod.stock > 0 && prod.status !== 'sold') {
          const targetColor = prod.colors[0]?.name || 'Standard';
          const targetSize = prod.sizes[0] || 'Standard';
          const existingIdx = updated.findIndex((it) => it.product.id === prod.id);
          if (existingIdx > -1) {
            updated[existingIdx] = {
              ...updated[existingIdx],
              quantity: Math.min(prod.stock, updated[existingIdx].quantity + 1)
            };
          } else {
            updated.push({
              product: prod,
              selectedColor: targetColor,
              selectedSize: targetSize,
              quantity: 1
            });
          }
        }
      });
      return updated;
    });
    setAppliedCoupon({ code: discountCode, percent: 15 });
    setInventoryAlert(`✓ 15% Complete-The-Look Bundle discount applied (${discountCode})!`);
    setIsCartOpen(true);
  };

  // Cart Handlers
  const handleAddToCart = () => {
    if (currentProduct.stock <= 0) {
      setInventoryAlert('Sorry, this 1-of-1 piece is currently sold out.');
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
    setCheckoutInitialPaymentMethod('paypal');
    setIsCartOpen(false);
    setIsPayPalCheckoutOpen(true);
  };

  // Direct Debit/Credit Card Buy Button on Product Page
  const handleBuyWithCardDirect = () => {
    if (currentProduct.stock <= 0) return;
    setCart([
      {
        product: currentProduct,
        selectedColor,
        selectedSize,
        quantity
      }
    ]);
    setCheckoutInitialPaymentMethod('card');
    setIsCartOpen(false);
    setIsPayPalCheckoutOpen(true);
  };

  // Direct WhatsApp Order Button on Product Page (supports currentProduct or specific product)
  const handleOrderViaWhatsAppDirect = async (productToOrder?: Product) => {
    const targetProduct = productToOrder || currentProduct;
    if (targetProduct.stock <= 0 || targetProduct.status === 'archived' || targetProduct.status === 'sold') {
      alert('This 1-of-1 piece has already been purchased and removed from the store.');
      return;
    }

    const boughtId = targetProduct.id;
    const boughtTitle = targetProduct.title;

    // Persist immediately in localStorage
    try {
      const existing: string[] = JSON.parse(localStorage.getItem('styleandclass_sold_ids') || '[]');
      localStorage.setItem('styleandclass_sold_ids', JSON.stringify(Array.from(new Set([...existing, boughtId]))));
    } catch (e) {}

    // Immediately mark as sold out with clear status: 'sold' and stock: 0
    setProducts((prev) => prev.map((p) => p.id === boughtId ? { ...p, status: 'sold' as const, stock: 0 } : p));
    setCurrentProduct((prev) => {
      if (prev.id === boughtId) {
        return { ...prev, stock: 0, status: 'sold' };
      }
      return prev;
    });

    setInventoryAlert(`✓ "${boughtTitle}" has been purchased & marked SOLD on the website!`);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carrier: 'evri',
          items: [
            {
              productId: targetProduct.id,
              productTitle: targetProduct.title,
              quantity: productToOrder ? 1 : quantity,
              color: productToOrder ? (targetProduct.colors[0]?.name || 'Standard') : selectedColor,
              size: productToOrder ? (targetProduct.sizes[0] || 'Standard') : selectedSize,
              image: targetProduct.images[0] || ''
            }
          ],
          customer: {
            fullName: 'WhatsApp Customer',
            phone: settings.merchantWhatsApp || '+447591878215',
            address: 'Direct WhatsApp Customer UK',
            city: 'London',
            postcode: 'UK'
          },
          paymentMethod: 'whatsapp',
          notes: 'Customer ordered directly via WhatsApp button'
        })
      });

      const data = await response.json();
      const whatsappUrl = data?.whatsappUrl;
      const order = data?.order;

      if (whatsappUrl) {
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      } else {
        const cleanPhone = (settings.merchantWhatsApp || '+447591878215').replace(/[^0-9]/g, '');
        const normPhone = cleanPhone.startsWith('440') ? '44' + cleanPhone.slice(3) : cleanPhone.startsWith('07') ? '44' + cleanPhone.slice(1) : (cleanPhone || '447591878215');
        const message = 
`👑 *STYLE & CLASS LONDON* 👑
_Curated Pre-Loved Luxury Fashion · London, United Kingdom_
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚜️ *NEW ORDER PURCHASE REQUEST* ⚜️
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 *5. ITEM DETAILS*
• *Name:* ${targetProduct.title} [${targetProduct.code || targetProduct.sku || '1-of-1'}]
• *Brand:* ${targetProduct.brand || 'Designer'}
• *Price:* £${targetProduct.price.toFixed(2)} GBP
• *Size:* ${targetProduct.sizes[0] || 'Standard'}
• *Condition:* Pre-Loved / Excellent 1-of-1 Piece
📸 *Photo:*
${targetProduct.images[0] || ''}

👤 *BUYER DETAILS TO COMPLETE DISPATCH:*
1. Buyer Full Name:
2. Buyer Street Address & Postcode:
3. Buyer Phone Number:
4. Preferred Courier (Evri £2.60 / InPost £2.89 / Royal Mail £3.65):

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🇬🇧 *Style & Class London · styleandclass.store*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
        window.open(`https://api.whatsapp.com/send?phone=${normPhone}&text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
      }

      if (order) {
        setSuccessOrderData({
          order,
          whatsappUrl: whatsappUrl || '',
          removedProducts: [boughtTitle]
        });
      }
    } catch (e) {
      console.warn('Backend order recording error:', e);
      const cleanPhone = (settings.merchantWhatsApp || '+447591878215').replace(/[^0-9]/g, '');
      const normPhone = cleanPhone.startsWith('440') ? '44' + cleanPhone.slice(3) : cleanPhone.startsWith('07') ? '44' + cleanPhone.slice(1) : (cleanPhone || '447591878215');
      const message = 
`👑 *STYLE & CLASS LONDON* 👑
_Curated Pre-Loved Luxury Fashion · London, United Kingdom_
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚜️ *NEW ORDER PURCHASE REQUEST* ⚜️
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 *5. ITEM DETAILS*
• *Name:* ${targetProduct.title} [${targetProduct.code || targetProduct.sku || '1-of-1'}]
• *Brand:* ${targetProduct.brand || 'Designer'}
• *Price:* £${targetProduct.price.toFixed(2)} GBP
• *Size:* ${targetProduct.sizes[0] || 'Standard'}
📸 *Photo:*
${targetProduct.images[0] || ''}

👤 *BUYER DETAILS TO COMPLETE DISPATCH:*
1. Buyer Full Name:
2. Buyer Street Address & Postcode:
3. Buyer Phone Number:
4. Preferred Courier (Evri £2.60 / InPost £2.89 / Royal Mail £3.65):

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🇬🇧 *Style & Class London · styleandclass.store*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
      window.open(`https://api.whatsapp.com/send?phone=${normPhone}&text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
    }
  };

  // WhatsApp Order from Cart Drawer
  const handleCheckoutWhatsAppFromCart = async () => {
    if (cart.length === 0) return;

    const boughtIds = new Set(cart.map((it) => it.product.id));
    const boughtTitles = cart.map((it) => it.product.title);
    const cartItems = [...cart];

    // Persist immediately in localStorage
    try {
      const existing: string[] = JSON.parse(localStorage.getItem('styleandclass_sold_ids') || '[]');
      localStorage.setItem('styleandclass_sold_ids', JSON.stringify(Array.from(new Set([...existing, ...Array.from(boughtIds)]))));
    } catch (e) {}

    // Immediately remove bought items from website products state and empty cart
    setProducts((prev) => prev.filter((p) => !boughtIds.has(p.id)));
    setCurrentProduct((prev) => {
      if (boughtIds.has(prev.id)) {
        return { ...prev, stock: 0, status: 'archived' };
      }
      return prev;
    });
    setCart([]);
    setIsCartOpen(false);

    setInventoryAlert(`✓ "${boughtTitles.join(', ')}" purchased & permanently removed from the website!`);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carrier: 'evri',
          items: cartItems.map((it) => ({
            productId: it.product.id,
            productTitle: it.product.title,
            quantity: it.quantity,
            color: it.selectedColor,
            size: it.selectedSize,
            image: it.product.images[0] || ''
          })),
          customer: {
            fullName: 'WhatsApp Customer',
            phone: settings.merchantWhatsApp || '+447591878215',
            address: 'Direct WhatsApp Customer UK',
            city: 'London',
            postcode: 'UK'
          },
          paymentMethod: 'whatsapp',
          notes: 'Customer placed order directly via WhatsApp bag'
        })
      });

      const data = await response.json();
      const whatsappUrl = data?.whatsappUrl;
      const order = data?.order;

      if (whatsappUrl) {
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      }

      if (order) {
        setSuccessOrderData({
          order,
          whatsappUrl: whatsappUrl || '',
          removedProducts: boughtTitles
        });
      }
    } catch (e) {
      console.warn('Backend order recording error from cart:', e);
      const cleanPhone = (settings.merchantWhatsApp || '+447591878215').replace(/[^0-9]/g, '');
      const normPhone = cleanPhone.startsWith('440') ? '44' + cleanPhone.slice(3) : cleanPhone.startsWith('07') ? '44' + cleanPhone.slice(1) : (cleanPhone || '447591878215');
      const itemsText = cartItems
        .map((it, idx) => `• *Item ${idx + 1}:* ${it.product.title} [${it.product.code || it.product.sku || '1-of-1'}]\n  - *Price:* £${(it.product.price * it.quantity).toFixed(2)} GBP (Qty: ${it.quantity}, Size: ${it.selectedSize})\n📸 *Photo:* ${it.product.images[0] || ''}`)
        .join('\n\n');
      const subtotal = cartItems.reduce((a, b) => a + b.product.price * b.quantity, 0);
      const message = 
`👑 *STYLE & CLASS LONDON* 👑
_Curated Pre-Loved Luxury Fashion · London, United Kingdom_
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚜️ *BAG CHECKOUT PURCHASE REQUEST* ⚜️
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 *5. ITEMS DETAILS:*
${itemsText}

💰 *TOTAL BAG VALUE:* £${subtotal.toFixed(2)} GBP

👤 *BUYER DETAILS TO COMPLETE DISPATCH:*
1. Buyer Full Name:
2. Buyer Street Address & Postcode:
3. Buyer Phone Number:
4. Preferred Courier (Evri £2.60 / InPost £2.89 / Royal Mail £3.65):

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🇬🇧 *Style & Class London · styleandclass.store*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
      window.open(`https://api.whatsapp.com/send?phone=${normPhone}&text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
    }
  };

  // Order Completed - Permanently delete purchased items from website
  const handleOrderSuccess = async (
    order: Order,
    whatsappUrl: string,
    removedProducts: string[]
  ) => {
    setIsPayPalCheckoutOpen(false);
    setIsCartOpen(false);
    setCart([]);

    // Get purchased product IDs
    const purchasedIds = new Set(order.items.map((it) => it.productId));

    // Save to localStorage as permanent record in browser
    try {
      const existing: string[] = JSON.parse(localStorage.getItem('styleandclass_sold_ids') || '[]');
      const updated = Array.from(new Set([...existing, ...Array.from(purchasedIds)]));
      localStorage.setItem('styleandclass_sold_ids', JSON.stringify(updated));
    } catch (e) {}

    // Mark bought items as SOLD on website products state
    setProducts((prev) => prev.map((p) => {
      if (purchasedIds.has(p.id)) {
        return { ...p, status: 'sold' as const, stock: 0 };
      }
      return p;
    }));

    // If the product currently on detail view was purchased, update to sold
    setCurrentProduct((prev) => {
      if (purchasedIds.has(prev.id)) {
        return { ...prev, stock: 0, status: 'sold' };
      }
      return prev;
    });

    if (removedProducts && removedProducts.length > 0) {
      setInventoryAlert(
        `✓ "${removedProducts.join(', ')}" has been purchased & marked SOLD on the website!`
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
        const text = await res.text();
        if (text) {
          try {
            const data = JSON.parse(text);
            if (data && data.settings) {
              setSettings(data.settings);
            }
          } catch (jsonErr) {
            console.warn('Failed to parse updated settings JSON:', jsonErr);
          }
        }
      }
    } catch (e) {
      console.error('Error updating settings:', e);
    }
  };

  // Active products for public storefront
  const activeProducts = products.filter((p) => p.status === 'active' && p.stock > 0);
  const isCurrentProductSoldOut = currentProduct.stock <= 0 || currentProduct.status === 'archived';

  // Active label view takes over full screen for distraction-free 4x6 printing
  if (activePage === 'label') {
    return (
      <ShippingLabelView
        order={selectedLabelOrder || orders[0] || null}
        ordersList={orders}
        onSelectOrder={(ord) => setSelectedLabelOrder(ord)}
        onBack={() => {
          setActivePage('home');
          window.location.hash = '';
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#07080b] text-slate-100 flex flex-col font-sans antialiased selection:bg-[#d4a853] selection:text-black">
      {/* Top Urgency & Announcement Bar */}
      <AnnouncementBar
        settings={settings}
        currency={currency}
        onCurrencyChange={setCurrency}
        onOpenAudit={() => setIsAuditModalOpen(true)}
      />

      {/* Main Header with full Style And Class menus */}
      <Header
        activePage={activePage === 'detail' ? 'collections' : activePage}
        selectedCategory={selectedCategory}
        onNavigate={handleNavigate}
        onOpenLegal={(policy) => setLegalPolicyType(policy)}
        cartCount={cart.reduce((a, b) => a + b.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAdmin={handleRequestAdminAccess}
        onOpenAudit={() => setIsAuditModalOpen(true)}
        onSelectProduct={handleSelectProduct}
        products={activeProducts}
        merchantWhatsApp={settings.merchantWhatsApp}
      />

      {/* Trust Hero Bar (Audit Fix: Issue #1 - 100/100 Trust Score) */}
      <TrustHeroBar
        onOpenReviews={() => {
          if (activePage !== 'detail') setActivePage('detail');
          setTimeout(() => {
            const el = document.getElementById('reviews-section') || document.getElementById('features-section');
            el?.scrollIntoView({ behavior: 'smooth' });
          }, 150);
        }}
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
                  onBuyWithCard={handleBuyWithCardDirect}
                  onOrderViaWhatsApp={handleOrderViaWhatsAppDirect}
                  onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
                  currencySymbol={settings.currencySymbol || '£'}
                />
              </div>
            </div>

            {/* Upsell & Cross-Sell Engine (Audit Fix #3: AOV Booster - 15% Bundle) */}
            {!isCurrentProductSoldOut && (
              <FrequentlyBoughtTogether
                currentProduct={currentProduct}
                allProducts={products}
                onAddBundleToCart={handleAddBundleToCart}
                onSelectProduct={handleSelectProduct}
                currencySymbol={settings.currencySymbol || '£'}
              />
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
        onOrderViaWhatsApp={(p) => {
          setQuickViewProduct(null);
          handleOrderViaWhatsAppDirect(p);
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
        allProducts={products}
        onAddProductToCart={handleAddToCartFromCard}
        initialCouponCode={appliedCoupon?.code}
        initialCouponPercent={appliedCoupon?.percent}
        onCheckoutPayPal={(carrier, dCode, dPct) => {
          if (carrier) setCheckoutCarrier(carrier);
          if (dCode && dPct) setAppliedCoupon({ code: dCode, percent: dPct });
          setCheckoutInitialPaymentMethod('paypal');
          setIsCartOpen(false);
          setIsPayPalCheckoutOpen(true);
        }}
        onCheckoutCard={(carrier, dCode, dPct) => {
          if (carrier) setCheckoutCarrier(carrier);
          if (dCode && dPct) setAppliedCoupon({ code: dCode, percent: dPct });
          setCheckoutInitialPaymentMethod('card');
          setIsCartOpen(false);
          setIsPayPalCheckoutOpen(true);
        }}
        onCheckoutWhatsApp={handleCheckoutWhatsAppFromCart}
        currencySymbol={settings.currencySymbol || '£'}
      />

      {/* PayPal UK & Debit/Credit Card Checkout Modal */}
      <PayPalCheckoutModal
        isOpen={isPayPalCheckoutOpen}
        onClose={() => setIsPayPalCheckoutOpen(false)}
        items={cart}
        currencySymbol={settings.currencySymbol || '£'}
        paypalClientId={settings.paypalClientId}
        merchantWhatsApp={settings.merchantWhatsApp}
        initialCarrier={checkoutCarrier}
        initialPaymentMethod={checkoutInitialPaymentMethod}
        initialDiscountCode={appliedCoupon?.code}
        initialDiscountPercent={appliedCoupon?.percent}
        onInstantDelete={(ids) => {
          const toDelete = new Set(ids);
          setProducts((prev) => prev.filter((p) => !toDelete.has(p.id)));
          setCurrentProduct((prev) => {
            if (toDelete.has(prev.id)) {
              const remaining = products.filter((p) => !toDelete.has(p.id) && p.stock > 0);
              return remaining[0] || prev;
            }
            return prev;
          });
        }}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Order Confirmation Modal with WhatsApp Direct Dispatch Link */}
      <OrderSuccessModal
        order={successOrderData?.order || null}
        whatsappUrl={successOrderData?.whatsappUrl || ''}
        removedProducts={successOrderData?.removedProducts || []}
        onClose={() => setSuccessOrderData(null)}
        currencySymbol={settings.currencySymbol || '£'}
        onOpenLabel={(ord) => {
          setSelectedLabelOrder(ord);
          setActivePage('label');
          window.location.hash = `#label-${ord.id}`;
        }}
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
        onOpenAudit={() => setIsAuditModalOpen(true)}
        onOpenLabel={(ord) => {
          setIsAdminOpen(false);
          setSelectedLabelOrder(ord);
          setActivePage('label');
          window.location.hash = `#label-${ord.id}`;
        }}
      />

      {/* Security Gate / Password Protection Modal for Store Brain */}
      <AdminPasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSuccess={handleAdminPasswordSuccess}
      />

      {/* Abandoned Cart Recovery Modal (Audit Fix: Issue #2) */}
      <AbandonedCartRecoveryModal
        isOpen={isAbandonedModalOpen}
        onClose={() => setIsAbandonedModalOpen(false)}
        items={cart}
        subtotal={cart.reduce((acc, it) => acc + it.product.price * it.quantity, 0)}
        currencySymbol={settings.currencySymbol || '£'}
        onApplyCoupon={(code, pct) => {
          setAppliedCoupon({ code, percent: pct });
          setIsCartOpen(true);
        }}
        onProceedToCheckout={() => {
          setIsAbandonedModalOpen(false);
          setIsPayPalCheckoutOpen(true);
        }}
      />

      {/* Store Audit Resolution Report Modal (Audit Score 43 -> 98 / 100) */}
      <StoreAuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        onOpenAbandonedCartDemo={() => {
          setIsAuditModalOpen(false);
          if (cart.length === 0 && activeProducts.length > 0) {
            handleAddToCartFromCard(activeProducts[0]);
          }
          setTimeout(() => setIsAbandonedModalOpen(true), 350);
        }}
        onOpenTrustModal={() => {
          setIsAuditModalOpen(false);
          setActivePage('detail');
        }}
        onTriggerBundleDemo={() => {
          setIsAuditModalOpen(false);
          setActivePage('detail');
        }}
      />

      {/* Footer with full navigation, social links, legal modals, and support */}
      <Footer
        onOpenAdmin={handleRequestAdminAccess}
        onOpenAudit={() => setIsAuditModalOpen(true)}
        settings={settings}
        onNavigate={handleNavigate}
        onOpenLegal={(policy) => setLegalPolicyType(policy)}
      />
    </div>
  );
}
