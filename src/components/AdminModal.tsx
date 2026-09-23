import React, { useState } from 'react';
import { X, Plus, Edit, Trash2, Database, MessageCircle, ShoppingBag, Settings, Check, AlertTriangle, RefreshCw, Sparkles, Tag, ExternalLink, QrCode, Download, Truck, MapPin } from 'lucide-react';
import { Product, Order, StoreSettings } from '../types';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  orders: Order[];
  settings: StoreSettings;
  onAddProduct: (product: Partial<Product>) => Promise<void>;
  onUpdateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
  onUpdateSettings: (newSettings: Partial<StoreSettings>) => Promise<void>;
  onRefreshData: () => Promise<void>;
  currencySymbol: string;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  products,
  orders,
  settings,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onUpdateSettings,
  onRefreshData,
  currencySymbol
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'settings'>('inventory');
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Form states for Add/Edit
  const [formCode, setFormCode] = useState('BOX 1 -7');
  const [formBrand, setFormBrand] = useState('RALPH LAUREN');
  const [formTitle, setFormTitle] = useState('');
  const [formCondition, setFormCondition] = useState<'New Without Tags' | 'Excellent' | 'Very Good' | 'Good'>('Excellent');
  const [formPrice, setFormPrice] = useState('28.00');
  const [formComparePrice, setFormComparePrice] = useState('75.00');
  const [formStock, setFormStock] = useState('1');
  const [formCategory, setFormCategory] = useState('Dresses');
  const [formCollection, setFormCollection] = useState<'women' | 'men' | 'kids' | 'accessories'>('women');
  const [formImageUrl, setFormImageUrl] = useState('https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80');
  const [formDescription, setFormDescription] = useState('Pre-loved designer garment in excellent condition.');
  const [formStatus, setFormStatus] = useState<'active' | 'archived'>('active');
  const [formSizes, setFormSizes] = useState('UK 10');
  const [formColors, setFormColors] = useState('Navy Blue');

  // Settings form states
  const [settingsPhone, setSettingsPhone] = useState(settings.merchantWhatsApp);
  const [settingsPayPalId, setSettingsPayPalId] = useState(settings.paypalClientId);
  const [settingsStoreName, setSettingsStoreName] = useState(settings.storeName);
  const [settingsSavedNotice, setSettingsSavedNotice] = useState(false);
  const [actionNotice, setActionNotice] = useState('');

  if (!isOpen) return null;

  const showNotification = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(''), 3500);
  };

  const openAddModal = () => {
    setFormCode(`BOX 1 -${products.length + 1}`);
    setFormBrand('DESIGNER');
    setFormTitle('');
    setFormCondition('Excellent');
    setFormPrice('25.00');
    setFormComparePrice('65.00');
    setFormStock('1');
    setFormCategory('Dresses');
    setFormCollection('women');
    setFormImageUrl('https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80');
    setFormDescription('Pre-loved curated piece, steam-pressed & verified in London.');
    setFormStatus('active');
    setFormSizes('UK 10');
    setFormColors('Navy Blue');
    setIsAdding(true);
    setIsEditing(false);
  };

  const openEditModal = (p: Product) => {
    setSelectedProduct(p);
    setFormCode(p.code || '');
    setFormBrand(p.brand || '');
    setFormTitle(p.title);
    setFormCondition((p.condition as any) || 'Excellent');
    setFormPrice(p.price.toString());
    setFormComparePrice(p.compareAtPrice.toString());
    setFormStock(p.stock.toString());
    setFormCategory(p.category);
    setFormCollection((p.collection as any) || 'women');
    setFormImageUrl(p.images[0] || '');
    setFormDescription(p.description);
    setFormStatus(p.status);
    setFormSizes(p.sizes.join(', '));
    setFormColors(p.colors.map(c => c.name).join(', '));
    setIsEditing(true);
    setIsAdding(false);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const sizesArray = formSizes.split(',').map(s => s.trim()).filter(Boolean);
    const colorsArray = formColors.split(',').map(c => ({
      name: c.trim(),
      hex: c.toLowerCase().includes('white') ? '#f3f4f6' : c.toLowerCase().includes('black') ? '#111111' : '#c59b27'
    })).filter(c => c.name);

    if (isAdding) {
      await onAddProduct({
        code: formCode,
        brand: formBrand,
        title: formTitle,
        condition: formCondition,
        price: parseFloat(formPrice) || 25.00,
        compareAtPrice: parseFloat(formComparePrice) || 60.00,
        stock: parseInt(formStock, 10) || 1,
        category: formCategory,
        collection: formCollection,
        images: [formImageUrl],
        description: formDescription,
        status: formStatus,
        sizes: sizesArray,
        colors: colorsArray
      });
      showNotification(`Added "${formTitle}" to Store Catalog!`);
      setIsAdding(false);
    } else if (isEditing && selectedProduct) {
      await onUpdateProduct(selectedProduct.id, {
        code: formCode,
        brand: formBrand,
        title: formTitle,
        condition: formCondition,
        price: parseFloat(formPrice) || selectedProduct.price,
        compareAtPrice: parseFloat(formComparePrice) || selectedProduct.compareAtPrice,
        stock: parseInt(formStock, 10),
        category: formCategory,
        collection: formCollection,
        images: [formImageUrl, ...(selectedProduct.images.slice(1))],
        description: formDescription,
        status: formStatus,
        sizes: sizesArray,
        colors: colorsArray
      });
      showNotification(`Updated item "${formTitle}" successfully!`);
      setIsEditing(false);
    }
  };

  const handleQuickStockChange = async (productId: string, currentStock: number, delta: number) => {
    const newStock = Math.max(0, currentStock + delta);
    const updates: Partial<Product> = {
      stock: newStock,
      status: newStock > 0 ? 'active' : 'archived'
    };
    await onUpdateProduct(productId, updates);
    showNotification(`Stock set to ${newStock}. ${newStock === 0 ? 'Item automatically archived and removed from storefront.' : ''}`);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateSettings({
      merchantWhatsApp: settingsPhone,
      paypalClientId: settingsPayPalId,
      storeName: settingsStoreName
    });
    setSettingsSavedNotice(true);
    setTimeout(() => setSettingsSavedNotice(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-[#13151f] text-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden border border-[#d4a853]/40 my-auto flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 bg-[#090a0f] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#d4a853] text-black flex items-center justify-center font-bold shadow-md">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2 font-serif">
                <span>Style And Class &middot; Store Database &amp; Management</span>
                <span className="text-[10.5px] bg-[#181a24] text-[#d4a853] font-mono px-2 py-0.5 rounded-full border border-slate-700">
                  Admin Console
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Organize catalog, add/remove 1-of-1 items, adjust stock, manage PayPal &amp; WhatsApp orders
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/api/download-zip"
              download="style-and-class-london-store.zip"
              title="Download entire website as ZIP"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#d4a853]/20 hover:bg-[#d4a853] text-[#d4a853] hover:text-black border border-[#d4a853]/50 rounded-lg text-xs font-bold transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export ZIP</span>
            </a>
            <button
              type="button"
              onClick={onRefreshData}
              title="Refresh database"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 border-b border-slate-800 bg-[#0e1017] flex items-center justify-between overflow-x-auto">
          <div className="flex gap-4 sm:gap-6">
            <button
              type="button"
              onClick={() => setActiveTab('inventory')}
              className={`py-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'inventory'
                  ? 'border-[#d4a853] text-[#d4a853]'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Catalog Database ({products.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`py-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'orders'
                  ? 'border-[#d4a853] text-[#d4a853]'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Orders &amp; WhatsApp Logs ({orders.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`py-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'border-[#d4a853] text-[#d4a853]'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Store &amp; WhatsApp Settings</span>
            </button>
          </div>

          {activeTab === 'inventory' && (
            <button
              type="button"
              onClick={openAddModal}
              className="my-1.5 px-3.5 py-1.5 bg-[#d4a853] hover:bg-[#e8c97a] text-black text-xs font-black rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Pre-Loved Item</span>
            </button>
          )}
        </div>

        {actionNotice && (
          <div className="mx-5 mt-3 p-2.5 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-xl border border-emerald-500/30 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Tab 1: Product Inventory Database */}
        {activeTab === 'inventory' && (
          <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-4">
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-amber-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-300">1-Piece Auto-Removal Storefront Rule Active: </span>
                When any item stock is 1 and a client buys it, the system automatically sets status to <strong>Archived</strong> and removes it directly from the live public storefront.
              </div>
            </div>

            {/* Products Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#090a0f]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#181a24] text-slate-300 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-3">Item / Brand</th>
                    <th className="py-3 px-3">Code / Category</th>
                    <th className="py-3 px-3">Price</th>
                    <th className="py-3 px-3 text-center">Stock</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {products.map((p) => {
                    const isRemoved = p.status === 'archived' || p.stock === 0;
                    const isOnePiece = p.stock === 1;

                    return (
                      <tr
                        key={p.id}
                        className={isRemoved ? 'bg-[#0e1017] opacity-60' : isOnePiece ? 'bg-[#14120c]' : 'hover:bg-[#13151f]'}
                      >
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.images[0] || 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80'}
                              alt={p.title}
                              className="w-12 h-12 object-cover rounded-xl border border-slate-700 bg-black shrink-0"
                            />
                            <div className="min-w-0">
                              <span className="text-[10px] font-bold text-[#d4a853] uppercase block">
                                {p.brand || 'DESIGNER'}
                              </span>
                              <p className="font-bold text-white line-clamp-1">{p.title}</p>
                              <p className="text-[11px] text-slate-400">
                                Condition: {p.condition || 'Pre-Loved'} &middot; Size: {p.sizes.join(', ')}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span className="font-mono text-[#f5c469] bg-[#181a24] px-1.5 py-0.5 rounded border border-slate-700 text-[11px]">
                            {p.code || p.sku}
                          </span>
                          <p className="text-[11px] text-slate-400 mt-1">{p.category} &middot; {p.collection}</p>
                        </td>

                        <td className="py-3 px-3 font-bold text-[#d4a853]">
                          {currencySymbol}{p.price.toFixed(2)}
                          {p.compareAtPrice > p.price && (
                            <span className="text-[10px] text-slate-500 line-through block">
                              {currencySymbol}{p.compareAtPrice.toFixed(2)}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-center">
                          <div className="inline-flex items-center border border-slate-700 rounded-lg overflow-hidden bg-[#181a24]">
                            <button
                              type="button"
                              onClick={() => handleQuickStockChange(p.id, p.stock, -1)}
                              title="Decrease stock (test reaching 1 or 0)"
                              className="w-6 h-6 flex items-center justify-center font-bold text-slate-300 hover:bg-slate-700 cursor-pointer"
                            >
                              -
                            </button>
                            <span className={`w-8 text-center font-bold font-mono ${isOnePiece ? 'text-amber-400' : p.stock === 0 ? 'text-red-400' : 'text-white'}`}>
                              {p.stock}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQuickStockChange(p.id, p.stock, 1)}
                              title="Increase stock"
                              className="w-6 h-6 flex items-center justify-center font-bold text-slate-300 hover:bg-slate-700 cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          {isRemoved ? (
                            <span className="inline-flex items-center gap-1 bg-red-950 text-red-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-red-800">
                              Archived (Removed from Store)
                            </span>
                          ) : isOnePiece ? (
                            <span className="inline-flex items-center gap-1 bg-amber-950 text-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-600/40">
                              ⚠️ 1 Piece (Auto-removes on buy)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-emerald-950 text-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-800">
                              Active in Store
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditModal(p)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                              title="Edit item details"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteProduct(p.id)}
                              className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-300 transition-colors cursor-pointer"
                              title="Delete from database"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Orders & WhatsApp Notifications */}
        {activeTab === 'orders' && (
          <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-4">
            <div className="p-3.5 bg-[#0a0a0f] border border-slate-800 rounded-2xl text-xs text-slate-300 flex items-center justify-between">
              <div>
                <p className="font-bold text-white">
                  Style And Class WhatsApp: <span className="font-mono text-[#25D366] font-extrabold">{settings.merchantWhatsApp}</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Every order automatically crafts a customer receipt &amp; delivery notification directly to this number.
                </p>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-sm font-bold text-white">No orders recorded in database yet.</p>
                <p className="text-xs text-slate-400">
                  Try placing an order with PayPal UK or WhatsApp in the store to see live records here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((o) => {
                  const cleanPhone = (settings.merchantWhatsApp || "+447591878215").replace(/[^0-9]/g, '');
                  const fullAddress = `${o.customer.address}, ${o.customer.city}, ${o.customer.postcode}, UK`;
                  const qrUrl = o.addressQrDataUrl || o.addressQrUrl || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(fullAddress)}`;

                  const itemsAlertText = o.items
                    .map((it, idx) => `• Item ${idx + 1}: ${it.productTitle} [${it.code || '1-of-1'}] - £${it.price.toFixed(2)} (${it.size})`)
                    .join('\n');

                  const alertMessage = `🚨 *PAID ORDER ALERT - STYLE & CLASS LONDON* 🚨
Order ID: #${o.id}
1️⃣ BUYER: ${o.customer.fullName}
2️⃣ ADDRESS: ${fullAddress}
QR Code: ${qrUrl}
3️⃣ PHONE: ${o.customer.phone}
4️⃣ PRODUCTS:
${itemsAlertText}
Total: £${o.total.toFixed(2)} [PAID]
5️⃣ PHOTO: ${o.items[0]?.image || ''}
6️⃣ SHIPPING: ${o.carrierName || 'Evri Standard Delivery'}`;

                  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(alertMessage)}`;

                  return (
                    <div
                      key={o.id}
                      className="p-4 rounded-2xl border border-slate-800 bg-[#0e1017] space-y-3 text-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-800 pb-2">
                        <div>
                          <span className="font-black text-sm text-[#d4a853] font-mono">
                            #{o.id}
                          </span>
                          <span className="text-slate-400 ml-2">
                            {new Date(o.createdAt).toLocaleString('en-GB')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                            {o.paymentMethod === 'paypal_uk' ? 'PayPal UK Confirmed' : 'WhatsApp Order'}
                          </span>
                          <span className="font-black text-white text-sm font-mono">
                            {currencySymbol}{o.total.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-slate-300">
                        {/* Buyer Details & Shipping */}
                        <div className="md:col-span-6 space-y-1.5">
                          <p className="font-bold text-white flex items-center gap-1.5">
                            <span className="text-[#d4a853]">1. Buyer:</span> {o.customer.fullName}
                          </p>
                          <p className="text-slate-300 flex items-center gap-1.5">
                            <span className="text-[#d4a853]">3. Phone:</span> {o.customer.phone}
                          </p>
                          <p className="text-slate-300 leading-snug">
                            <span className="text-[#d4a853]">2. Address:</span> {fullAddress}
                          </p>
                          {o.carrierName && (
                            <p className="text-slate-200 flex items-center gap-1.5 font-bold pt-1">
                              <Truck className="w-3.5 h-3.5 text-[#d4a853]" />
                              <span>6. Shipping: {o.carrierName}</span>
                            </p>
                          )}
                        </div>

                        {/* Items Purchased & Photos */}
                        <div className="md:col-span-4 space-y-1.5">
                          <p className="font-bold text-white text-[11px] uppercase tracking-wider text-[#d4a853]">
                            4. Items &amp; 5. Photos:
                          </p>
                          <div className="space-y-1.5">
                            {o.items.map((it, idx) => (
                              <div key={idx} className="flex items-center gap-2 bg-[#0a0a0f] p-1.5 rounded-lg border border-slate-800">
                                <img
                                  src={it.image}
                                  alt={it.productTitle}
                                  className="w-8 h-8 rounded object-cover shrink-0 bg-black"
                                />
                                <div className="truncate flex-1">
                                  <div className="font-bold text-white truncate">{it.productTitle}</div>
                                  <div className="text-[10px] text-slate-400">
                                    Size: {it.size} &middot; £{it.price.toFixed(2)}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Address QR Code */}
                        <div className="md:col-span-2 flex flex-col items-center justify-center p-2 bg-white rounded-xl shadow border border-slate-300 text-black">
                          <img
                            src={qrUrl}
                            alt="Address QR"
                            className="w-16 h-16 object-contain"
                          />
                          <span className="text-[9px] font-black uppercase text-slate-700 tracking-wider mt-0.5">
                            Address QR
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 flex justify-end gap-2 border-t border-slate-800/80">
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#20ba5a] text-black rounded-xl text-xs font-black shadow-sm transition-all"
                        >
                          <MessageCircle className="w-3.5 h-3.5 fill-black" />
                          <span>Dispatch Alert to WhatsApp</span>
                          <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Store Settings */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-5 max-w-xl text-left">
            {settingsSavedNotice && (
              <div className="p-3 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-xl border border-emerald-500/30">
                ✅ Settings saved successfully!
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Storefront Name
              </label>
              <input
                type="text"
                value={settingsStoreName}
                onChange={(e) => setSettingsStoreName(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-700 bg-[#0a0a0f] text-white outline-none focus:border-[#d4a853]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Style And Class WhatsApp Business Number *
              </label>
              <p className="text-[11px] text-slate-400 mb-1.5">
                Include country code (e.g. +44 7591 878215 for UK). Customers will send orders directly to this number.
              </p>
              <input
                type="text"
                required
                value={settingsPhone}
                onChange={(e) => setSettingsPhone(e.target.value)}
                placeholder="+447591878215"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-700 bg-[#0a0a0f] text-white outline-none focus:border-[#d4a853] font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                PayPal UK Client ID (Live or Sandbox) *
              </label>
              <p className="text-[11px] text-slate-400 mb-1.5">
                Enter your live PayPal UK merchant client ID or 'sb' for sandbox mode.
              </p>
              <input
                type="text"
                required
                value={settingsPayPalId}
                onChange={(e) => setSettingsPayPalId(e.target.value)}
                placeholder="e.g. sb or AXz...UK"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-700 bg-[#0a0a0f] text-white outline-none focus:border-[#d4a853] font-mono"
              />
            </div>

            <div className="p-4 bg-[#0a0a0f] rounded-2xl text-xs text-slate-300 space-y-1.5 border border-slate-800">
              <p className="font-bold text-white">UK Delivery Carriers Profile:</p>
              <p>&bull; Evri Standard: <strong>£2.60</strong></p>
              <p>&bull; InPost Locker: <strong>£2.89</strong></p>
              <p>&bull; Royal Mail 48 Tracked: <strong>£3.65</strong></p>
              <p className="text-[#d4a853] font-bold">&bull; Free Delivery Threshold: £45.00+</p>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-[#d4a853] hover:bg-[#e8c97a] text-black text-xs font-black rounded-xl transition-all shadow-md cursor-pointer"
            >
              Save Store Settings
            </button>
          </form>
        )}

        {/* Modal Sub-window: Add or Edit Item */}
        {(isAdding || isEditing) && (
          <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-xs flex items-center justify-center p-3">
            <div className="bg-[#13151f] text-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-[#d4a853]/50 animate-fade-in text-left">
              <div className="p-4 border-b border-slate-800 bg-[#090a0f] flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-white font-serif">
                  {isAdding ? 'Add New Pre-Loved 1-of-1 Item' : `Edit Item: ${selectedProduct?.title}`}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setIsEditing(false);
                  }}
                  className="p-1 rounded-full text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="p-4 sm:p-5 space-y-3.5 max-h-[75vh] overflow-y-auto text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">
                      Box / Item Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={formCode}
                      onChange={(e) => setFormCode(e.target.value)}
                      placeholder="BOX 1 -7"
                      className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#0a0a0f] text-white outline-none focus:border-[#d4a853] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">
                      Brand / Designer *
                    </label>
                    <input
                      type="text"
                      required
                      value={formBrand}
                      onChange={(e) => setFormBrand(e.target.value)}
                      placeholder="e.g. KATE SPADE"
                      className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#0a0a0f] text-white outline-none focus:border-[#d4a853]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Striped Wool Knit Cardigan"
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#0a0a0f] text-white outline-none focus:border-[#d4a853]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">
                      Condition *
                    </label>
                    <select
                      value={formCondition}
                      onChange={(e) => setFormCondition(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#0a0a0f] text-white outline-none focus:border-[#d4a853]"
                    >
                      <option value="New Without Tags">New Without Tags</option>
                      <option value="Excellent">Excellent</option>
                      <option value="Very Good">Very Good</option>
                      <option value="Good">Good</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">
                      Collection
                    </label>
                    <select
                      value={formCollection}
                      onChange={(e) => setFormCollection(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#0a0a0f] text-white outline-none focus:border-[#d4a853]"
                    >
                      <option value="women">Women's Pre-Loved</option>
                      <option value="men">Men's Pre-Loved</option>
                      <option value="kids">Kids</option>
                      <option value="accessories">Bags &amp; Accessories</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">
                      Sale Price (£) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#0a0a0f] text-white outline-none focus:border-[#d4a853]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">
                      Compare At / Retail (£)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formComparePrice}
                      onChange={(e) => setFormComparePrice(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#0a0a0f] text-white outline-none focus:border-[#d4a853]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">
                      Stock Quantity (1 for 1-of-1) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formStock}
                      onChange={(e) => setFormStock(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#0a0a0f] text-white outline-none focus:border-[#d4a853]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">
                      Garment Size
                    </label>
                    <input
                      type="text"
                      value={formSizes}
                      onChange={(e) => setFormSizes(e.target.value)}
                      placeholder="e.g. UK 10 or Medium"
                      className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#0a0a0f] text-white outline-none focus:border-[#d4a853]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#0a0a0f] text-white outline-none focus:border-[#d4a853] font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Storefront Visibility Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#0a0a0f] text-white outline-none focus:border-[#d4a853]"
                  >
                    <option value="active">Active (Visible on Storefront)</option>
                    <option value="archived">Archived / Removed from Storefront</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Description &amp; Highlights
                  </label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#0a0a0f] text-white outline-none focus:border-[#d4a853]"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAdding(false);
                      setIsEditing(false);
                    }}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#d4a853] hover:bg-[#e8c97a] text-black font-black transition-colors cursor-pointer"
                  >
                    {isAdding ? 'Create Pre-Loved Item' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
