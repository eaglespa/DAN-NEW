export interface ProductVariant {
  color: string;
  colorHex?: string;
  image?: string;
}

export interface Product {
  id: string;
  code?: string; // e.g. "BOX 1 -1", "BOX 1-2"
  title: string;
  slug: string;
  sku: string;
  brand?: string;
  condition?: 'New Without Tags' | 'Excellent' | 'Very Good' | 'Good' | string;
  collection?: 'women' | 'men' | 'kids' | 'accessories';
  price: number;
  compareAtPrice: number;
  currency: string;
  currencySymbol?: string;
  rating: number;
  reviewCount: number;
  stock: number;
  status: 'active' | 'archived';
  description: string;
  bulletPoints: string[];
  specifications: { [key: string]: string };
  images: string[];
  colors: { name: string; hex: string; imageIndex?: number }[];
  sizes: string[];
  tags: string[];
  category: string;
  featured?: boolean;
  material?: string;
}

export interface ShippingCarrier {
  id: 'evri' | 'inpost' | 'royalmail';
  name: string;
  cost: number;
  deliveryEstimate: string;
  image: string;
  badge?: string;
}

export interface CartItem {
  product: Product;
  selectedColor: string;
  selectedSize: string;
  quantity: number;
}

export interface CustomerDetails {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postcode: string;
  country: string;
  notes?: string;
}

export interface Order {
  id: string;
  createdAt: string;
  items: {
    productId: string;
    productTitle: string;
    color: string;
    size: string;
    quantity: number;
    price: number;
    image: string;
    code?: string;
    brand?: string;
  }[];
  customer: CustomerDetails;
  carrier?: 'evri' | 'inpost' | 'royalmail';
  carrierName?: string;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  paymentMethod: 'paypal_uk' | 'whatsapp' | 'card';
  paymentStatus: 'completed' | 'pending' | 'failed';
  whatsappNotified: boolean;
  addressQrDataUrl?: string;
  addressQrUrl?: string;
  notes?: string;
}

export interface StoreSettings {
  storeName: string;
  tagline?: string;
  merchantWhatsApp: string;
  merchantPhone: string;
  merchantEmail: string;
  location: string;
  paypalClientId: string;
  currency: string;
  currencySymbol: string;
  freeShippingThreshold: number;
  announcementText: string;
  instagram: string;
  tiktok: string;
  facebook: string;
}

export interface CustomerReview {
  id: string;
  author: string;
  location: string;
  rating: number;
  date: string;
  verified: boolean;
  title: string;
  comment: string;
  variantPurchased: string;
  helpfulCount: number;
}

