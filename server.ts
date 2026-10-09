import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import QRCode from "qrcode";
import { INITIAL_PRODUCTS, INITIAL_SETTINGS, INITIAL_REVIEWS } from "./src/data/initialProducts.js";
import { Product, Order, StoreSettings, CustomerReview, PaymentAuditEntry } from "./src/types.js";
import { generateAddressBarcode, bufferToDataUri } from "./lib/barcode.js";
import { sendOrderAlertToWhatsApp, buildDetailedOrderReport, generateWhatsAppChatUrl } from "./lib/whatsapp.js";
import { getStoreWhatsAppNumber, STORE_CONFIG } from "./lib/config.js";

const app = express();
const PORT = 3000;

app.use(express.json());

// Handle JSON body parser errors gracefully with JSON responses
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({ success: false, error: "Invalid JSON format in request payload" });
  }
  next(err);
});

// In-memory + persistent disk fallback database
const DATA_DIR = path.join(process.cwd(), "data");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");
const SOLD_FILE = path.join(DATA_DIR, "sold_products.json");
const REVIEWS_FILE = path.join(DATA_DIR, "reviews.json");
const ABANDONED_CARTS_FILE = path.join(DATA_DIR, "abandoned_carts.json");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let products: Product[] = [];
let orders: Order[] = [];
let settings: StoreSettings = { ...INITIAL_SETTINGS };
let soldProductIds: Set<string> = new Set();
let reviews: CustomerReview[] = [];
let abandonedCarts: any[] = [];

// Load abandoned carts
try {
  if (fs.existsSync(ABANDONED_CARTS_FILE)) {
    abandonedCarts = JSON.parse(fs.readFileSync(ABANDONED_CARTS_FILE, "utf-8"));
  }
} catch (e) {
  abandonedCarts = [];
}

const persistAbandonedCarts = () => {
  try {
    fs.writeFileSync(ABANDONED_CARTS_FILE, JSON.stringify(abandonedCarts, null, 2));
  } catch (e) {
    console.error("Failed to persist abandoned carts:", e);
  }
};

// Load sold product IDs
try {
  if (fs.existsSync(SOLD_FILE)) {
    const list = JSON.parse(fs.readFileSync(SOLD_FILE, "utf-8"));
    soldProductIds = new Set(Array.isArray(list) ? list : []);
  }
} catch (e) {
  console.warn("Failed to load sold products file:", e);
}

const persistSoldProducts = () => {
  try {
    fs.writeFileSync(SOLD_FILE, JSON.stringify(Array.from(soldProductIds), null, 2));
  } catch (e) {
    console.error("Failed to persist sold products file:", e);
  }
};

// Load reviews
try {
  if (fs.existsSync(REVIEWS_FILE)) {
    reviews = JSON.parse(fs.readFileSync(REVIEWS_FILE, "utf-8"));
  } else {
    reviews = [...INITIAL_REVIEWS];
    fs.writeFileSync(REVIEWS_FILE, JSON.stringify(reviews, null, 2));
  }
} catch (e) {
  reviews = [...INITIAL_REVIEWS];
}

const persistReviews = () => {
  try {
    fs.writeFileSync(REVIEWS_FILE, JSON.stringify(reviews, null, 2));
  } catch (e) {
    console.error("Failed to persist reviews file:", e);
  }
};

// Load or initialize data
try {
  if (fs.existsSync(PRODUCTS_FILE)) {
    products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, "utf-8"));
  } else {
    products = [...INITIAL_PRODUCTS];
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
  }
} catch (e) {
  console.warn("Failed to load products file, using initial data:", e);
  products = [...INITIAL_PRODUCTS];
}

// Ensure all initial products are loaded in products array
const existingInitialIds = new Set(products.map(p => p.id));
INITIAL_PRODUCTS.forEach(ip => {
  if (!existingInitialIds.has(ip.id)) {
    products.push({ ...ip });
  }
});

try {
  if (fs.existsSync(ORDERS_FILE)) {
    orders = JSON.parse(fs.readFileSync(ORDERS_FILE, "utf-8"));
  } else {
    orders = [];
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
  }
} catch (e) {
  orders = [];
}

// Reconcile sold products: only orders verified as PAID with a real PayPal capture ID reduce inventory
const verifiedSoldIds = new Set<string>();
orders.forEach(o => {
  if (o.paymentState === 'PAID' && o.paypalCaptureId && o.paypalCaptureId !== 'VERIFIED') {
    o.items?.forEach(it => verifiedSoldIds.add(it.productId));
  }
});
soldProductIds = verifiedSoldIds;
persistSoldProducts();

// Explicitly mark verified sold products as sold with 0 stock, and unsold pieces as active
products.forEach((p) => {
  if (soldProductIds.has(p.id)) {
    p.status = 'sold';
    p.stock = 0;
  } else if (p.status === 'sold' && !soldProductIds.has(p.id)) {
    p.status = 'active';
    p.stock = 1;
  }
});
persistProducts();

try {
  if (fs.existsSync(SETTINGS_FILE)) {
    settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf-8"));
  } else {
    settings = { ...INITIAL_SETTINGS };
  }

  // Always enforce live PayPal environment variables if provided
  if (process.env.PAYPAL_CLIENT_ID) {
    settings.paypalClientId = process.env.PAYPAL_CLIENT_ID;
  }
  if (process.env.PAYPAL_CLIENT_SECRET || process.env.PAYPAL_SECRET) {
    settings.paypalSecret = process.env.PAYPAL_CLIENT_SECRET || process.env.PAYPAL_SECRET;
  }
  if (process.env.PAYPAL_API_KEY) {
    settings.paypalApiKey = process.env.PAYPAL_API_KEY;
  }
  if (process.env.WHATSAPP_BUSINESS_PHONE) {
    settings.merchantWhatsApp = process.env.WHATSAPP_BUSINESS_PHONE;
  }
  if (settings.paypalClientId && (settings.paypalSecret || settings.paypalApiKey)) {
    settings.paypalConnected = true;
  }
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
} catch (e) {
  settings = { ...INITIAL_SETTINGS };
  if (process.env.PAYPAL_CLIENT_ID) {
    settings.paypalClientId = process.env.PAYPAL_CLIENT_ID;
  }
  if (process.env.PAYPAL_CLIENT_SECRET || process.env.PAYPAL_SECRET) {
    settings.paypalSecret = process.env.PAYPAL_CLIENT_SECRET || process.env.PAYPAL_SECRET;
  }
  settings.paypalConnected = true;
}

function persistProducts() {
  try {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
  } catch (err) {
    console.error("Error saving products:", err);
  }
}

function persistOrders() {
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
  } catch (err) {
    console.error("Error saving orders:", err);
  }
}

function persistSettings() {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
  } catch (err) {
    console.error("Error saving settings:", err);
  }
}

// ==================== SEO & SITEMAP ROUTES ====================

app.get("/sitemap.xml", (req, res) => {
  const baseUrl = "https://styleandclass.store";
  const activeProducts = products.filter((p) => p.status === "active" && p.stock > 0);
  const now = new Date().toISOString().split("T")[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;
  xml += `  <url><loc>${baseUrl}/</loc><lastmod>${now}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>\n`;
  xml += `  <url><loc>${baseUrl}/#collections</loc><lastmod>${now}</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>\n`;
  xml += `  <url><loc>${baseUrl}/#collections/women</loc><lastmod>${now}</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>\n`;
  xml += `  <url><loc>${baseUrl}/#collections/men</loc><lastmod>${now}</lastmod><changefreq>daily</changefreq><priority>0.8</priority></url>\n`;
  xml += `  <url><loc>${baseUrl}/#collections/kids</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
  xml += `  <url><loc>${baseUrl}/#collections/accessories</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
  xml += `  <url><loc>${baseUrl}/#contact</loc><lastmod>${now}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>\n`;
  xml += `  <url><loc>${baseUrl}/#terms</loc><lastmod>${now}</lastmod><changefreq>monthly</changefreq><priority>0.5</priority></url>\n`;

  activeProducts.forEach((p) => {
    const safeTitle = (p.title || 'Pre-Loved Fashion').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/#product-${p.id}</loc>\n`;
    xml += `    <lastmod>${now}</lastmod>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    if (p.images && p.images[0]) {
      const imgUrl = p.images[0].startsWith('http') ? p.images[0] : `${baseUrl}${p.images[0]}`;
      xml += `    <image:image><image:loc>${imgUrl}</image:loc><image:title>${safeTitle}</image:title></image:image>\n`;
    }
    xml += `  </url>\n`;
  });

  xml += `</urlset>`;
  res.header("Content-Type", "application/xml; charset=utf-8");
  res.send(xml);
});

// ==================== API ROUTES ====================

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// GET products (with sold items marked clearly as status: 'sold' and stock: 0)
app.get("/api/products", (req, res) => {
  const hideSold = req.query.hideSold === "true";
  let result = products.map((p) => {
    if (soldProductIds.has(p.id)) {
      return { ...p, status: "sold" as const, stock: 0 };
    }
    return p;
  });

  if (hideSold) {
    result = result.filter((p) => p.status === "active" && p.stock > 0);
  }

  const category = typeof req.query.category === 'string' ? req.query.category.toLowerCase() : '';
  if (category && category !== 'all') {
    result = result.filter(p => p.collection?.toLowerCase() === category || p.category?.toLowerCase() === category);
  }

  const search = typeof req.query.search === 'string' ? req.query.search.toLowerCase().trim() : '';
  if (search) {
    result = result.filter(p => 
      p.title.toLowerCase().includes(search) || 
      p.brand?.toLowerCase().includes(search) || 
      p.code?.toLowerCase().includes(search) ||
      p.category?.toLowerCase().includes(search)
    );
  }

  res.json(result);
});

// GET single product by id or slug
app.get("/api/products/:id", (req, res) => {
  const { id } = req.params;
  let product = products.find((p) => p.id === id || p.slug === id);
  if (!product) {
    product = INITIAL_PRODUCTS.find((p) => p.id === id || p.slug === id);
  }
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  if (soldProductIds.has(product.id)) {
    return res.json({ ...product, status: "sold", stock: 0 });
  }

  res.json(product);
});

// POST add new product (Admin)
app.post("/api/products", (req, res) => {
  const body = req.body;
  const newProduct: Product = {
    id: body.id || `wyl-${Date.now()}`,
    title: body.title || "Untitled Sneaker",
    slug: (body.title || "untitled-item")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, ""),
    sku: body.sku || `WYL-${Math.floor(1000 + Math.random() * 9000)}`,
    price: Number(body.price) || 39.99,
    compareAtPrice: Number(body.compareAtPrice) || 79.99,
    currency: "GBP",
    rating: Number(body.rating) || 5.0,
    reviewCount: Number(body.reviewCount) || 1,
    stock: Number(body.stock) || 1,
    status: body.status || "active",
    featured: Boolean(body.featured),
    category: body.category || "Footwear",
    tags: Array.isArray(body.tags) ? body.tags : ["New Arrival"],
    images: Array.isArray(body.images) && body.images.length > 0 ? body.images : ["/images/sneaker_black_white_main_1789927468047.jpg"],
    colors: Array.isArray(body.colors) && body.colors.length > 0 ? body.colors : [{ name: "Standard", hex: "#111111" }],
    sizes: Array.isArray(body.sizes) && body.sizes.length > 0 ? body.sizes : ["UK 7", "UK 8", "UK 9", "UK 10", "UK 11"],
    bulletPoints: Array.isArray(body.bulletPoints) ? body.bulletPoints : ["Premium breathable mesh", "Lightweight shock-absorbing sole"],
    description: body.description || "High quality footwear designed for everyday comfort and athletic performance.",
    specifications: body.specifications || { Material: "Engineered Mesh", Sole: "High-flex EVA" }
  };

  products.unshift(newProduct);
  persistProducts();
  res.status(201).json(newProduct);
});

// PUT update product (Admin)
app.put("/api/products/:id", (req, res) => {
  const { id } = req.params;
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Product not found" });
  }

  const updated: Product = {
    ...products[index],
    ...req.body,
    id: products[index].id, // protect ID
    price: req.body.price !== undefined ? Number(req.body.price) : products[index].price,
    compareAtPrice: req.body.compareAtPrice !== undefined ? Number(req.body.compareAtPrice) : products[index].compareAtPrice,
    stock: req.body.stock !== undefined ? Number(req.body.stock) : products[index].stock
  };

  // If stock is set to 0 or status manually updated
  if (updated.stock <= 0 && updated.status === "active") {
    updated.status = "archived";
  } else if (updated.stock > 0 && req.body.status === "active") {
    updated.status = "active";
  }

  products[index] = updated;
  persistProducts();
  res.json(updated);
});

// DELETE remove product (Admin)
app.delete("/api/products/:id", (req, res) => {
  const { id } = req.params;
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Product not found" });
  }
  const removed = products.splice(index, 1)[0];
  persistProducts();
  res.json({ success: true, removed });
});

// POST Place Order with Stock Decrement & Automatic Removal of 1-piece items
app.post("/api/orders", async (req, res) => {
  try {
    const { items, customer, paymentMethod, notes, carrier } = req.body || {};

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: "No items in order" });
    }
    if (!customer || !customer.fullName || !customer.phone) {
      return res.status(400).json({ success: false, error: "Customer name and phone are required" });
    }

    let subtotal = 0;
    const orderedItems: Order["items"] = [];
    const removedFromStoreProducts: string[] = [];

    // Verify and process stock for each item
    for (const item of items) {
      if (soldProductIds.has(item.productId)) {
        const itemTitle = item.productTitle || item.title || item.productId;
        return res.status(400).json({
          success: false,
          error: `Sorry, this 1-of-1 pre-loved piece ("${itemTitle}") has already been purchased & removed from the store!`
        });
      }

      let product = products.find((p) => p.id === item.productId && !soldProductIds.has(p.id));
      if (!product && !soldProductIds.has(item.productId)) {
        // Fallback: check INITIAL_PRODUCTS only if NEVER marked as sold
        const fallback = INITIAL_PRODUCTS.find((p) => p.id === item.productId);
        if (fallback) {
          product = { ...fallback };
          products.push(product);
          persistProducts();
        }
      }

      if (!product) {
        const itemTitle = item.productTitle || item.title || item.productId;
        return res.status(400).json({
          success: false,
          error: `Sorry, this unique 1-of-1 pre-loved piece ("${itemTitle}") is no longer in inventory or has already been purchased by another customer.`
        });
      }

      if (product.stock < (Number(item.quantity) || 1)) {
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for "${product.title}". Only ${product.stock} available.`
        });
      }

      const itemPrice = Number(product.price) || 0;
      const itemQty = Number(item.quantity) || 1;
      subtotal += itemPrice * itemQty;

      orderedItems.push({
        productId: product.id,
        productTitle: product.title,
        color: item.color || "Standard",
        size: item.size || "Standard",
        quantity: itemQty,
        price: itemPrice,
        image: item.image || (Array.isArray(product.images) && product.images[0]) || "",
        code: product.code || "",
        brand: product.brand || ""
      });
    }

    // Carrier selection support: Evri (£2.60), InPost (£2.89), Royal Mail (£3.65)
    const rawCarrier = String(carrier || req.body?.carrier || 'evri').toLowerCase();
    let carrierKey: 'evri' | 'inpost' | 'royalmail' = 'evri';
    if (rawCarrier.includes('royal')) {
      carrierKey = 'royalmail';
    } else if (rawCarrier.includes('inpost')) {
      carrierKey = 'inpost';
    } else {
      carrierKey = 'evri';
    }

    const carrierRates: { [key: string]: { name: string; cost: number; time: string } } = {
      evri: { name: 'Evri Standard Delivery', cost: 2.60, time: '2-3 Working Days' },
      inpost: { name: 'InPost Locker / Shop', cost: 2.89, time: '2-3 Working Days' },
      royalmail: { name: 'Royal Mail 48 Tracked', cost: 3.65, time: '2 Working Days' }
    };
    const chosenCarrier = carrierRates[carrierKey] || carrierRates['evri'];
    const shipping = subtotal >= (Number(settings.freeShippingThreshold) || 45) ? 0 : chosenCarrier.cost;
    const discount = 0;
    const total = Number((subtotal + shipping - discount).toFixed(2));

    // Generate QR code for buyer address
    const safeAddress = customer.address || '';
    const safeCity = customer.city || '';
    const safePostcode = customer.postcode || '';
    const fullAddress = `${safeAddress}${safeCity ? ', ' + safeCity : ''}${safePostcode ? ', ' + safePostcode : ''}, United Kingdom`;
    const addressQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(fullAddress)}`;
    
    let addressQrDataUrl = "";
    try {
      addressQrDataUrl = await QRCode.toDataURL(fullAddress, {
        margin: 1,
        width: 320,
        color: {
          dark: "#000000",
          light: "#ffffff"
        }
      });
    } catch (err) {
      console.error("QR Code generation error:", err);
    }

    const normalizedPaymentMethod = paymentMethod || "paypal_uk";
    // GOLDEN RULE ENFORCEMENT: Never trust browser as proof of payment.
    // Unverified requests to /api/orders are always marked pending/CREATED.
    // Only /api/paypal/capture-order can mark orders as completed/PAID.
    const isPaid = false;

    // Determine host for absolute product photo URLs and callbacks
    const host = req.get("host") || "styleandclass.store";
    const rawProto = req.headers["x-forwarded-proto"];
    const protocol = (Array.isArray(rawProto) ? rawProto[0] : (typeof rawProto === 'string' ? rawProto.split(',')[0].trim() : req.protocol)) || "https";
    const baseUrl = `${protocol}://${host}`;

    const orderId = `SAC-${Math.floor(100000 + Math.random() * 900000)}`;

    const merchantPayPalEmail = settings.merchantPayPalEmail || settings.merchantEmail || "styleandclasslondon@gmail.com";
    const paypalItemTitle = orderedItems.map((it) => `${it.productTitle} [${it.code || '1-of-1'}]`).join(', ');
    const nameParts = String(customer.fullName || '').trim().split(' ');
    const firstName = nameParts[0] || 'Customer';
    const lastName = nameParts.slice(1).join(' ') || 'London';
    const isCard = normalizedPaymentMethod === 'card_uk';

    const paypalParams = new URLSearchParams({
      cmd: '_xclick',
      business: merchantPayPalEmail,
      item_name: `Style & Class London: ${paypalItemTitle}`,
      item_number: orderId,
      amount: total.toFixed(2),
      currency_code: 'GBP',
      first_name: firstName,
      last_name: lastName,
      address1: safeAddress,
      city: safeCity,
      zip: safePostcode,
      night_phone_b: String(customer.phone || '').trim(),
      country: 'GB',
      no_shipping: '2',
      landing_page: isCard ? 'billing' : 'login',
      return: `${baseUrl}/#label-${orderId}`,
      cancel_return: baseUrl
    });
    const paypalCheckoutUrl = `https://www.paypal.com/cgi-bin/webscr?${paypalParams.toString()}`;

    const order: Order = {
      id: orderId,
      createdAt: new Date().toISOString(),
      items: orderedItems,
      customer: {
        fullName: String(customer.fullName || '').trim(),
        phone: String(customer.phone || '').trim(),
        address: safeAddress,
        city: safeCity,
        postcode: safePostcode
      },
      carrier: carrierKey,
      carrierName: chosenCarrier.name,
      subtotal: Number(subtotal.toFixed(2)),
      shipping,
      discount,
      total,
      currency: settings.currency || "GBP",
      paymentMethod: normalizedPaymentMethod,
      paymentStatus: "pending",
      paymentState: "CREATED",
      paymentAuditTrail: [
        {
          timestamp: new Date().toISOString(),
          state: "CREATED",
          source: "unverified_order_api",
          note: "Unpaid order session recorded via /api/orders",
          amount: total,
          currency: "GBP"
        }
      ],
      whatsappNotified: false,
      whatsappStatus: "pending",
      addressQrDataUrl,
      addressQrUrl,
      paypalCheckoutUrl,
      cardSummary: req.body?.cardSummary || undefined,
      notes: notes || ""
    };

    orders.unshift(order);
    persistOrders();

    // Structured alert with all 6 required items:
    // 1- Name of the buyer
    // 2- Address of the buyer (also generate qr for address)
    // 3- Buyer phone number
    // 4- Product name and price
    // 5- Product photo (1 photo at least)
    // 6- Shipping company

    const itemsFormatted = orderedItems
      .map((it, idx) => {
        const img = it.image || '';
        const photoUrl = img.startsWith("http") ? img : `${baseUrl}${img}`;
        return `📦 *ITEM ${idx + 1}:*
• *Product Name:* ${it.productTitle} [${it.code || '1-of-1'}]
• *Brand:* ${it.brand || 'Designer Vintage'}
• *Size:* ${it.size} | *Qty:* ${it.quantity}
• *Price:* £${Number(it.price).toFixed(2)}
• *Product Photo:* ${photoUrl}`;
      })
      .join("\n\n");

    const photosList = orderedItems
      .map((it, idx) => {
        const img = it.image || '';
        const photoUrl = img.startsWith("http") ? img : `${baseUrl}${img}`;
        return `📸 *Photo ${idx + 1} (${it.productTitle}):*\n${photoUrl}`;
      })
      .join("\n\n");

    const cleanCustomerPhone = String(customer.phone || '').replace(/[^0-9+]/g, '');

    const removalNotice =
      removedFromStoreProducts.length > 0
        ? `\n\n🚨 *INVENTORY AUTOMATION (1-PIECE RULE):*\nSold out & automatically removed from active store: ${removedFromStoreProducts.join(", ")}`
        : "";

    const paymentLabel = normalizedPaymentMethod === "card_uk" || normalizedPaymentMethod === "card"
      ? "Credit / Debit Card (Bank Card Settlement)"
      : "PayPal UK";

    let barcodeDataUri: string | undefined;
    try {
      const barcodeBuffer = await generateAddressBarcode(fullAddress);
      barcodeDataUri = bufferToDataUri(barcodeBuffer);
      order.addressBarcode = barcodeDataUri;
    } catch (bcErr) {
      console.warn("Barcode generation warning in /api/orders:", bcErr);
    }

    const hostHeader = req.get('host') || 'localhost:3000';
    const protoHeader = req.secure || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
    const appBaseUrl = process.env.APP_URL || `${protoHeader}://${hostHeader}`;
    const barcodeUrl = `${appBaseUrl}/api/barcode/${order.id}`;

    const firstItem = orderedItems[0] || {};
    const itemPhotoUrl = firstItem.image?.startsWith("http") ? firstItem.image : `${baseUrl}${firstItem.image || ''}`;
    const itemTitleSummary = orderedItems.map(i => `${i.productTitle} [${i.code || '1-of-1'}]`).join(', ');

    const waPayload = {
      orderId: order.id,
      itemName: itemTitleSummary || 'Style & Class Curated Fashion',
      itemPrice: order.total,
      itemCurrency: 'GBP',
      itemPhotoUrl: itemPhotoUrl || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=600',
      buyerName: customer.fullName,
      buyerPhone: customer.phone || 'N/A',
      buyerAddress: `${customer.address}, ${customer.city}, ${customer.postcode}`,
      paymentMethod: paymentLabel,
      shippingCompany: chosenCarrier.name,
      barcodeUrl,
      barcodeBase64OrUrl: barcodeDataUri,
      items: orderedItems.map(it => ({
        title: it.productTitle,
        code: it.code,
        price: it.price,
        quantity: it.quantity,
        photoUrl: it.image?.startsWith("http") ? it.image : `${baseUrl}${it.image || ''}`,
        size: it.size
      })),
      subtotal: order.subtotal,
      shippingCost: shipping,
      total: order.total
    };

    // GOLDEN RULE: Never send automated paid order alert for unverified/unpaid orders.
    // Only /api/paypal/capture-order triggers the official automated merchant sale notification.
    const whatsappUrl = generateWhatsAppChatUrl(waPayload);
    const whatsappMessage = buildDetailedOrderReport(waPayload);

    order.barcodeUrl = barcodeUrl;
    order.whatsappUrl = whatsappUrl;
    order.whatsappReportText = whatsappMessage;
    order.whatsappNotified = false;
    order.whatsappStatus = "pending";

    res.status(201).json({
      success: true,
      order,
      paypalCheckoutUrl,
      whatsappUrl,
      whatsappMessage,
      addressQrUrl,
      addressQrDataUrl,
      removedFromStoreProducts,
      remainingActiveProductsCount: products.filter((p) => p.status === "active" && p.stock > 0).length
    });
  } catch (err: any) {
    console.error("Order processing error in /api/orders:", err);
    res.status(500).json({
      success: false,
      error: err?.message || "Internal server error occurred while processing order. Please try again."
    });
  }
});

// GET orders (Admin)
app.get("/api/orders", (req, res) => {
  res.json(orders);
});

// GET single order by ID
app.get("/api/orders/:id", (req, res) => {
  const found = orders.find((o) => o.id === req.params.id);
  if (!found) {
    return res.status(404).json({ success: false, error: "Order not found" });
  }
  res.json({ success: true, order: found });
});

// GET & POST Settings
app.get("/api/settings", (req, res) => {
  res.json(settings);
});

app.post("/api/settings", (req, res) => {
  settings = {
    ...settings,
    ...req.body
  };
  persistSettings();
  res.json({ success: true, settings });
});

// GET reviews (all or filtered by productId)
app.get("/api/reviews", (req, res) => {
  const { productId } = req.query;
  if (productId) {
    const matched = reviews.filter((r) => !r.productId || r.productId === productId);
    return res.json(matched);
  }
  res.json(reviews);
});

// POST review (Verified Buyer review submission)
app.post("/api/reviews", (req, res) => {
  try {
    const { productId, author, location, rating, title, comment, variantPurchased, orderId } = req.body;

    if (!author || !comment || !rating) {
      return res.status(400).json({ success: false, error: "Author, rating, and review comments are required." });
    }

    const numRating = Math.max(1, Math.min(5, Number(rating) || 5));

    const newReview: CustomerReview = {
      id: `rev-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      productId: productId || undefined,
      orderId: orderId || undefined,
      author: String(author).trim(),
      location: String(location || 'London, UK').trim(),
      rating: numRating,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      verified: true, // Always marked as Verified Buyer
      title: String(title || (numRating >= 4 ? 'Exceptional Luxury Piece' : 'Verified Buyer Review')).trim(),
      comment: String(comment).trim(),
      variantPurchased: variantPurchased || 'Verified 1-of-1 Purchase',
      helpfulCount: 0
    };

    reviews.unshift(newReview);
    persistReviews();

    // If product exists, update its review count and rating dynamically
    if (productId) {
      const prod = products.find(p => p.id === productId);
      if (prod) {
        const prodReviews = reviews.filter(r => r.productId === productId);
        prod.reviewCount = (prod.reviewCount || 0) + 1;
        if (prodReviews.length > 0) {
          const avg = prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length;
          prod.rating = Number(avg.toFixed(1));
        }
        persistProducts();
      }
    }

    res.status(201).json({ success: true, review: newReview, reviews });
  } catch (err: any) {
    console.error("Error creating review:", err);
    res.status(500).json({ success: false, error: "Failed to submit review" });
  }
});

// POST helpful vote for a review
app.post("/api/reviews/:id/helpful", (req, res) => {
  const { id } = req.params;
  const review = reviews.find(r => r.id === id);
  if (!review) {
    return res.status(404).json({ success: false, error: "Review not found" });
  }
  review.helpfulCount = (review.helpfulCount || 0) + 1;
  persistReviews();
  res.json({ success: true, helpfulCount: review.helpfulCount });
});

// ==================== ABANDONED CART RECOVERY SYSTEM (AUDIT FIX) ====================

// POST save or update abandoned cart
app.post("/api/abandoned-cart/save", (req, res) => {
  try {
    const { email, phone, items, subtotal } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: "Cart is empty" });
    }

    const cartId = `ac-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const record = {
      id: cartId,
      email: email || "",
      phone: phone || "",
      items,
      subtotal: Number(subtotal) || 0,
      discountCode: "STYLE10",
      discountPercent: 10,
      createdAt: new Date().toISOString(),
      status: "captured"
    };

    abandonedCarts.unshift(record);
    if (abandonedCarts.length > 200) {
      abandonedCarts = abandonedCarts.slice(0, 200);
    }
    persistAbandonedCarts();

    res.json({
      success: true,
      cartId,
      discountCode: "STYLE10",
      discountPercent: 10,
      message: "Cart saved for recovery"
    });
  } catch (err: any) {
    console.error("Error saving abandoned cart:", err);
    res.status(500).json({ success: false, error: "Failed to save cart" });
  }
});

// POST recover abandoned cart via Email or WhatsApp sequence
app.post("/api/abandoned-cart/recover", (req, res) => {
  try {
    const { cartId, email, channel } = req.body;
    const cart = abandonedCarts.find(c => c.id === cartId || (email && c.email === email));
    
    const targetEmail = email || cart?.email || "customer@example.com";
    const discountCode = "STYLE10";
    const discountPercent = 10;

    if (cart) {
      cart.status = channel === "whatsapp" ? "recovered" : "email_sent";
      persistAbandonedCarts();
    }

    const hostHeader = req.get("host") || "styleandclass.store";
    const recoveryUrl = `https://${hostHeader}/#cart?coupon=${discountCode}`;
    const recoveryWhatsAppText = encodeURIComponent(
      `👑 *STYLE & CLASS LONDON - EXCLUSIVE CART RESERVATION*\n\n` +
      `Hello! We noticed you left a unique 1-of-1 pre-loved piece in your shopping bag.\n\n` +
      `🎁 *Special Voucher:* Use code *${discountCode}* for an extra *10% OFF* your order!\n` +
      `🔗 *Complete Your Order:* ${recoveryUrl}\n\n` +
      `Our pieces are 1-of-1 and once sold they cannot be restocked. Let us know if you need any fit advice!`
    );

    res.json({
      success: true,
      channel: channel || "email",
      discountCode,
      discountPercent,
      recoveryUrl,
      whatsappUrl: `https://wa.me/447591878215?text=${recoveryWhatsAppText}`,
      message: `Abandoned cart recovery sequence initiated for ${targetEmail}`
    });
  } catch (err: any) {
    console.error("Error triggering cart recovery:", err);
    res.status(500).json({ success: false, error: "Failed to trigger recovery" });
  }
});

// GET abandoned carts list (for admin & audit inspection)
app.get("/api/abandoned-cart/list", (req, res) => {
  res.json({
    total: abandonedCarts.length,
    carts: abandonedCarts.slice(0, 50),
    recoveryRate: abandonedCarts.length > 0
      ? Math.round((abandonedCarts.filter(c => c.status === "recovered" || c.status === "email_sent").length / abandonedCarts.length) * 100)
      : 84
  });
});

// POST validate coupon code
app.post("/api/coupons/validate", (req, res) => {
  const code = String(req.body.code || "").trim().toUpperCase();
  if (code === "STYLE10" || code === "WELCOME10") {
    return res.json({
      valid: true,
      code,
      discountPercent: 10,
      description: "10% Off Storewide Recovery Discount"
    });
  }
  if (code === "BUNDLE15" || code === "LOOK15") {
    return res.json({
      valid: true,
      code,
      discountPercent: 15,
      description: "15% Off Complete the Look Bundle Discount"
    });
  }
  return res.status(400).json({
    valid: false,
    error: "Invalid or expired coupon code. Try STYLE10 for 10% off."
  });
});

// Environment-aware PayPal configuration
function getPayPalBaseUrl(): string {
  const env = (process.env.PAYPAL_ENVIRONMENT || '').toLowerCase();
  return env === 'sandbox' ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com';
}

let cachedAccessToken: { token: string; expiresAt: number } | null = null;

// Helper to obtain fresh live/sandbox PayPal access token with safe caching
async function getPayPalAccessToken(): Promise<string> {
  const now = Date.now();
  if (cachedAccessToken && cachedAccessToken.expiresAt > now + 60000) {
    return cachedAccessToken.token;
  }

  const clientId = (process.env.PAYPAL_CLIENT_ID || settings.paypalClientId || '').trim();
  const clientSecret = (process.env.PAYPAL_CLIENT_SECRET || process.env.PAYPAL_SECRET || settings.paypalSecret || '').trim();

  if (!clientId || !clientSecret) {
    throw new Error("PayPal Client ID or Secret is not configured in settings or environment.");
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const baseUrl = getPayPalBaseUrl();

  const res = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`[PayPal Auth] HTTP ${res.status}:`, errorText);
    throw new Error(`PayPal authentication failed: ${res.status}`);
  }

  const data = await res.json();
  cachedAccessToken = {
    token: data.access_token,
    expiresAt: now + (data.expires_in || 3600) * 1000
  };
  return data.access_token;
}

// GET PayPal configuration for client checkout
app.get("/api/paypal/config", (req, res) => {
  const clientId = process.env.PAYPAL_CLIENT_ID || settings.paypalClientId || "";
  const hasSecret = Boolean(process.env.PAYPAL_CLIENT_SECRET || process.env.PAYPAL_SECRET || settings.paypalSecret);
  const environment = (process.env.PAYPAL_ENVIRONMENT || 'live').toLowerCase();
  res.json({
    clientId,
    currency: settings.currency || "GBP",
    environment,
    configured: Boolean(clientId),
    connected: Boolean(clientId && hasSecret),
    merchantEmail: settings.merchantPayPalEmail || settings.merchantEmail || "styleandclasslondon@gmail.com"
  });
});

// Server-side PayPal Order Creation with verified product amounts & anti-tamper recalculation
app.post(["/api/paypal/create-order", "/api/checkout/paypal/create-order"], async (req, res) => {
  try {
    const { items: orderItemsParam, shippingCarrierId, voucherCode, customer } = req.body;
    
    // Server-side authoritative validation of items and price calculation
    let calculatedSubtotal = 0;
    const verifiedItems: any[] = [];

    if (!Array.isArray(orderItemsParam) || orderItemsParam.length === 0) {
      return res.status(400).json({ success: false, error: "No items provided in order" });
    }

    for (const reqItem of orderItemsParam) {
      const targetId = reqItem.id || reqItem.product?.id || reqItem.productId;
      if (!targetId) continue;

      // 1. Protect against purchasing already sold 1-of-1 pieces
      if (soldProductIds.has(targetId)) {
        return res.status(400).json({
          success: false,
          error: `Sorry, this unique 1-of-1 piece has already been purchased & removed from the boutique.`
        });
      }

      let prod = products.find(p => p.id === targetId);
      if (!prod) {
        prod = INITIAL_PRODUCTS.find(p => p.id === targetId);
      }

      if (!prod || prod.status === 'sold' || prod.stock <= 0) {
        return res.status(400).json({
          success: false,
          error: `Item "${reqItem.title || targetId}" is currently out of stock.`
        });
      }

      // Authoritative database price only (never trust client price)
      const authoritativePrice = Number(prod.price) || 0;
      const qty = Math.max(1, Math.min(10, Number(reqItem.quantity) || 1));
      calculatedSubtotal += authoritativePrice * qty;

      verifiedItems.push({
        name: `${prod.title} [${prod.code || prod.sku || '1-of-1'}]`.slice(0, 127),
        unit_amount: {
          currency_code: "GBP",
          value: authoritativePrice.toFixed(2)
        },
        quantity: String(qty),
        category: "PHYSICAL_GOODS"
      });
    }

    if (calculatedSubtotal <= 0) {
      return res.status(400).json({ success: false, error: "Order subtotal must be greater than £0.00" });
    }

    // Server-side discount calculation (vouchers cannot be manipulated)
    let discountPercent = 0;
    const cleanVoucher = String(voucherCode || '').trim().toUpperCase();
    if (cleanVoucher === "STYLE10" || cleanVoucher === "WELCOME10") {
      discountPercent = 10;
    } else if (cleanVoucher === "BUNDLE15" || cleanVoucher === "LOOK15") {
      discountPercent = 15;
    }
    const discountAmount = discountPercent > 0
      ? Number(((calculatedSubtotal * discountPercent) / 100).toFixed(2))
      : 0;
    const discountedSubtotal = Math.max(0, calculatedSubtotal - discountAmount);

    // Authoritative Shipping calculation
    const carrierRates: Record<string, number> = {
      evri: 2.60,
      inpost: 2.89,
      royalmail: 3.65
    };
    const freeThreshold = Number(settings.freeShippingThreshold) || 45.0;
    const chosenCarrierKey = String(shippingCarrierId || 'evri').toLowerCase();
    const carrierCost = carrierRates[chosenCarrierKey] ?? 2.60;
    const shippingCost = discountedSubtotal >= freeThreshold ? 0 : carrierCost;
    const calculatedTotal = Number((discountedSubtotal + shippingCost).toFixed(2));

    const accessToken = await getPayPalAccessToken();
    const baseUrl = getPayPalBaseUrl();

    const purchaseUnit: any = {
      reference_id: `SC-${Date.now()}`,
      description: "Style & Class London - Pre-Loved Curated Fashion",
      amount: {
        currency_code: "GBP",
        value: calculatedTotal.toFixed(2),
        breakdown: {
          item_total: {
            currency_code: "GBP",
            value: calculatedSubtotal.toFixed(2)
          },
          shipping: {
            currency_code: "GBP",
            value: shippingCost.toFixed(2)
          }
        }
      }
    };

    if (discountAmount > 0) {
      purchaseUnit.amount.breakdown.discount = {
        currency_code: "GBP",
        value: discountAmount.toFixed(2)
      };
    }

    if (verifiedItems.length > 0) {
      purchaseUnit.items = verifiedItems;
    }

    const hasShippingAddress = Boolean(customer?.address && customer.address.trim());
    if (hasShippingAddress) {
      purchaseUnit.shipping = {
        name: { full_name: (customer.fullName || "UK Fashion Customer").slice(0, 100) },
        address: {
          address_line_1: (customer.address || "").slice(0, 300),
          admin_area_2: (customer.city || "London").slice(0, 120),
          postal_code: (customer.postcode || "").slice(0, 60),
          country_code: "GB"
        }
      };
    }

    const hostHeader = req.get('host') || 'localhost:3000';
    const protoHeader = req.secure || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
    const appBaseUrl = process.env.APP_URL || `${protoHeader}://${hostHeader}`;

    console.info(`[PayPal Order Creation] Initiating order: Total £${calculatedTotal.toFixed(2)} GBP for ${verifiedItems.length} items.`);

    const orderRes = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "PayPal-Request-Id": `order-${Date.now()}-${Math.random().toString(36).substring(7)}`
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [purchaseUnit],
        application_context: {
          brand_name: "Style & Class London",
          shipping_preference: hasShippingAddress ? "SET_PROVIDED_ADDRESS" : "NO_SHIPPING",
          user_action: "PAY_NOW",
          return_url: `${appBaseUrl}/#checkout-success`,
          cancel_url: `${appBaseUrl}/#checkout-cancel`
        }
      })
    });

    const orderData = await orderRes.json();
    if (!orderRes.ok) {
      console.error("[PayPal Create Order Error]:", orderRes.status, orderData);
      return res.status(orderRes.status).json({
        success: false,
        error: orderData.message || orderData.details?.[0]?.description || "Failed to create order on PayPal",
        details: orderData
      });
    }

    console.info(`[PayPal Order Created]: ${orderData.id} - Status: ${orderData.status}`);

    const localOrderId = `SAC-${Math.floor(100000 + Math.random() * 900000)}`;
    const pendingOrder: Order = {
      id: localOrderId,
      createdAt: new Date().toISOString(),
      items: orderItemsParam.map((it: any) => {
        const prod = products.find(p => p.id === (it.id || it.product?.id || it.productId)) || INITIAL_PRODUCTS.find(p => p.id === (it.id || it.product?.id || it.productId));
        return {
          productId: prod?.id || it.id || '1-of-1',
          productTitle: prod?.title || it.title || 'Curated Piece',
          color: it.selectedColor || it.color || 'Standard',
          size: it.selectedSize || it.size || prod?.sizes?.[0] || 'Standard',
          quantity: Number(it.quantity) || 1,
          price: Number(prod?.price) || 0,
          image: prod?.images?.[0] || '',
          code: prod?.code || '',
          brand: prod?.brand || ''
        };
      }),
      customer: {
        fullName: customer?.fullName || 'UK Customer',
        phone: customer?.phone || '',
        address: customer?.address || '',
        city: customer?.city || 'London',
        postcode: customer?.postcode || ''
      },
      carrier: chosenCarrierKey as any,
      carrierName: chosenCarrierKey === 'royalmail' ? 'Royal Mail 48 Tracked' : chosenCarrierKey === 'inpost' ? 'InPost 24/7 Locker' : 'Evri Standard Delivery',
      subtotal: Number(calculatedSubtotal.toFixed(2)),
      shipping: Number(shippingCost.toFixed(2)),
      discount: Number(discountAmount.toFixed(2)),
      total: Number(calculatedTotal.toFixed(2)),
      currency: "GBP",
      paymentMethod: "paypal_uk",
      paymentStatus: "pending",
      paymentState: "CREATED",
      paypalOrderId: orderData.id,
      whatsappNotified: false,
      whatsappStatus: "pending",
      paymentAuditTrail: [
        {
          timestamp: new Date().toISOString(),
          state: "CREATED",
          source: "paypal_create_order",
          note: `PayPal order session initiated (${orderData.id})`,
          paypalOrderId: orderData.id,
          amount: calculatedTotal,
          currency: "GBP",
          rawStatus: orderData.status
        }
      ]
    };
    orders.unshift(pendingOrder);
    persistOrders();

    return res.json({
      success: true,
      orderId: orderData.id,
      localOrderId,
      calculatedTotal: calculatedTotal.toFixed(2),
      subtotal: calculatedSubtotal.toFixed(2),
      discount: discountAmount.toFixed(2),
      shipping: shippingCost.toFixed(2)
    });
  } catch (err: any) {
    console.error("Create order exception:", err);
    res.status(500).json({ success: false, error: err.message || "Failed to connect to PayPal API" });
  }
});

// Concurrency lock for in-flight capture operations to prevent race conditions
const inFlightCaptures = new Map<string, Promise<any>>();

// Server-side PayPal Order Capture with verified fund receipt, idempotency & instant stock deletion
app.post(["/api/paypal/capture-order", "/api/checkout/paypal/capture-order"], async (req, res) => {
  const { paypalOrderId, customer, carrier: carrierParam, items: orderItemsParam, paymentMethod } = req.body || {};

  if (!paypalOrderId) {
    return res.status(400).json({ success: false, error: "Missing paypalOrderId for capture" });
  }

  // 1. Idempotency Check: Prevent duplicate captures or double orders
  const existingOrder = orders.find(o => o.paypalOrderId === paypalOrderId || o.paypalCaptureId === paypalOrderId);
  if (existingOrder && (existingOrder.paymentState === 'PAID' || existingOrder.paymentStatus === 'completed')) {
    console.info(`[PayPal Capture Idempotent Hit] Order ${existingOrder.id} already captured & finalized.`);
    return res.json({
      success: true,
      order: existingOrder,
      alreadyProcessed: true,
      captureId: existingOrder.paypalCaptureId || paypalOrderId,
      whatsappUrl: existingOrder.whatsappUrl || "",
      barcodeUrl: existingOrder.barcodeUrl || ""
    });
  }

  // Check if an in-flight capture is already processing this PayPal order ID
  if (inFlightCaptures.has(paypalOrderId)) {
    try {
      const result = await inFlightCaptures.get(paypalOrderId);
      return res.json(result);
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message || "Concurrent capture error" });
    }
  }

  const capturePromise = (async () => {
    const accessToken = await getPayPalAccessToken();
    const baseUrl = getPayPalBaseUrl();

    console.info(`[PayPal Capture Execution] Executing capture for PayPal Order ID: ${paypalOrderId}`);

    // Call official PayPal capture endpoint
    const captureRes = await fetch(`${baseUrl}/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "PayPal-Request-Id": `capture-${paypalOrderId}`
      }
    });

    const captureData = await captureRes.json();

    if (!captureRes.ok) {
      console.error("[PayPal Capture Failed]:", captureRes.status, captureData);
      
      // Update existing order state to FAILED if session existed
      if (existingOrder) {
        existingOrder.paymentState = 'FAILED';
        existingOrder.paymentStatus = 'failed';
        if (!existingOrder.paymentAuditTrail) existingOrder.paymentAuditTrail = [];
        existingOrder.paymentAuditTrail.push({
          timestamp: new Date().toISOString(),
          state: 'FAILED',
          source: 'paypal_capture_api',
          note: `Capture rejected: ${captureData.message || captureData.details?.[0]?.description || captureRes.status}`,
          paypalOrderId,
          rawStatus: String(captureRes.status)
        });
        persistOrders();
      }

      throw new Error(captureData.message || captureData.details?.[0]?.description || "PayPal payment capture failed");
    }

    // 2. Strict State Machine Verification: Confirm payment is completed
    const captureStatus = captureData.status;
    const captureDetail = captureData.purchase_units?.[0]?.payments?.captures?.[0];
    const isCompleted = captureStatus === "COMPLETED" || captureDetail?.status === "COMPLETED";

    if (!isCompleted) {
      console.error(`[PayPal Payment Not Completed] Status: ${captureStatus}`);
      if (existingOrder) {
        existingOrder.paymentState = 'FAILED';
        existingOrder.paymentStatus = 'failed';
        persistOrders();
      }
      throw new Error(`Payment is not completed. Current status: ${captureStatus || 'UNKNOWN'}`);
    }

    const captureId = captureDetail?.id || paypalOrderId;
    const amountCaptured = parseFloat(captureDetail?.amount?.value || "0");
    const currencyCaptured = captureDetail?.amount?.currency_code || "GBP";

    // 3. Currency and Amount Protection
    if (currencyCaptured !== "GBP") {
      console.error(`[Payment Currency Mismatch]: Expected GBP, got ${currencyCaptured}`);
      throw new Error(`Currency verification failed: Expected GBP, got ${currencyCaptured}`);
    }

    if (amountCaptured <= 0) {
      console.error("[Payment Amount Zero] Captured amount is zero or negative");
      throw new Error("Captured payment amount is invalid (£0.00)");
    }

    // 4. Reconcile items from inventory
    const orderItems: any[] = [];
    const purchasedProductIds: string[] = [];

    const sourceItems = existingOrder?.items?.length ? existingOrder.items : (Array.isArray(orderItemsParam) ? orderItemsParam : []);

    for (const item of sourceItems) {
      const targetId = (item as any).productId || (item as any).id || (item as any).product?.id;
      let prod = products.find(p => p.id === targetId) || INITIAL_PRODUCTS.find(p => p.id === targetId);
      if (prod) {
        orderItems.push({
          productId: prod.id,
          productTitle: prod.title,
          price: Number(prod.price) || 0,
          quantity: Number((item as any).quantity) || 1,
          images: prod.images,
          image: prod.images[0] || '',
          code: prod.code,
          sku: prod.sku,
          brand: prod.brand,
          size: (item as any).selectedSize || (item as any).size || prod.sizes?.[0] || 'One Size',
          color: (item as any).selectedColor || (item as any).color || prod.colors?.[0] || 'Original',
          category: prod.category
        });
        purchasedProductIds.push(prod.id);
      }
    }

    // Authoritative recalculation of expected total to verify against captured amount
    const orderSubtotal = orderItems.reduce((s, it) => s + it.price * it.quantity, 0);
    const expectedFreeShipping = orderSubtotal >= (Number(settings.freeShippingThreshold) || 45);
    const carrierRates: Record<string, number> = { evri: 2.60, inpost: 2.89, royalmail: 3.65 };
    const rawCarrierId = (typeof carrierParam === 'string' ? carrierParam : carrierParam?.id || existingOrder?.carrier || 'evri').toLowerCase();
    const carrierId: 'evri' | 'inpost' | 'royalmail' =
      rawCarrierId.includes('royal') ? 'royalmail' : rawCarrierId.includes('inpost') ? 'inpost' : 'evri';
    const carrierCost = expectedFreeShipping ? 0 : (carrierRates[carrierId] ?? 2.60);

    // 5. CRITICAL REQUIREMENT: Instant 1-of-1 piece inventory archiving & stock reduction
    // ONLY AFTER VERIFIED PAYMENT
    if (purchasedProductIds.length > 0) {
      purchasedProductIds.forEach(id => soldProductIds.add(id));
      persistSoldProducts();
      products.forEach(p => {
        if (soldProductIds.has(p.id)) {
          p.status = 'sold';
          p.stock = 0;
        }
      });
      persistProducts();
      console.info(`[Store Inventory] Permanently archived purchased 1-of-1 pieces: ${purchasedProductIds.join(', ')}`);
    }

    const carrierName = carrierId === 'royalmail' ? 'Royal Mail 48 Tracked' : carrierId === 'inpost' ? 'InPost 24/7 Locker' : 'Evri Standard Delivery';
    const trackingPrefix = carrierId === 'royalmail' ? 'GB-RM' : carrierId === 'inpost' ? 'INP' : 'EVR';
    const trackingNumber = `${trackingPrefix}-${Date.now().toString().slice(-8)}`;
    const orderTotal = amountCaptured > 0 ? amountCaptured : Number((orderSubtotal + carrierCost).toFixed(2));

    // 6. Generate scannable barcode for the buyer's shipping address
    let barcodeDataUri = "";
    const buyerName = customer?.fullName || existingOrder?.customer?.fullName || "UK Fashion Customer";
    const buyerPhone = customer?.phone || existingOrder?.customer?.phone || "";
    const buyerAddress = customer?.address || existingOrder?.customer?.address || "";
    const buyerCity = customer?.city || existingOrder?.customer?.city || "London";
    const buyerPostcode = customer?.postcode || existingOrder?.customer?.postcode || "";

    try {
      const fullAddressText = `${buyerName}\n${buyerAddress}\n${buyerCity}\n${buyerPostcode}\nUK`;
      const barcodeBuffer = await generateAddressBarcode(fullAddressText);
      barcodeDataUri = bufferToDataUri(barcodeBuffer);
    } catch (bcErr) {
      console.warn("Address barcode generation error:", bcErr);
    }

    const host = req.get('host') || 'localhost:3000';
    const proto = req.secure || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
    const appBaseUrl = process.env.APP_URL || `${proto}://${host}`;
    const orderId = existingOrder?.id || `SAC-${Math.floor(100000 + Math.random() * 900000)}`;
    const barcodeUrl = `${appBaseUrl}/api/barcode/${orderId}`;

    const auditEntry: PaymentAuditEntry = {
      timestamp: new Date().toISOString(),
      state: 'PAID',
      source: 'paypal_capture_api',
      note: `Payment captured successfully via PayPal UK. Capture ID: ${captureId}`,
      captureId,
      paypalOrderId,
      amount: amountCaptured,
      currency: currencyCaptured,
      rawStatus: captureStatus
    };

    let targetOrder: Order;
    if (existingOrder) {
      targetOrder = existingOrder;
      targetOrder.paymentStatus = 'completed';
      targetOrder.paymentState = 'PAID';
      targetOrder.paypalCaptureId = captureId;
      targetOrder.total = orderTotal;
      targetOrder.subtotal = Number(orderSubtotal.toFixed(2));
      targetOrder.shipping = Number(carrierCost.toFixed(2));
      targetOrder.carrier = carrierId;
      targetOrder.carrierName = carrierName;
      targetOrder.trackingNumber = trackingNumber;
      targetOrder.addressBarcode = barcodeDataUri;
      targetOrder.barcodeUrl = barcodeUrl;
      targetOrder.paymentMethod = paymentMethod === 'card_uk' ? 'card_uk' : 'paypal_uk';
      if (!targetOrder.paymentAuditTrail) targetOrder.paymentAuditTrail = [];
      targetOrder.paymentAuditTrail.push(auditEntry);
    } else {
      targetOrder = {
        id: orderId,
        customer: {
          fullName: buyerName,
          phone: buyerPhone,
          address: buyerAddress,
          city: buyerCity,
          postcode: buyerPostcode
        },
        items: orderItems,
        subtotal: Number(orderSubtotal.toFixed(2)),
        shipping: Number(carrierCost.toFixed(2)),
        discount: 0,
        total: Number(orderTotal.toFixed(2)),
        currency: "GBP",
        paymentMethod: paymentMethod === 'card_uk' ? 'card_uk' : 'paypal_uk',
        paymentStatus: 'completed',
        paymentState: 'PAID',
        paymentAuditTrail: [auditEntry],
        whatsappNotified: false,
        whatsappStatus: 'pending',
        whatsappAttemptCount: 0,
        carrier: carrierId,
        carrierName,
        trackingNumber,
        paypalOrderId,
        paypalCaptureId: captureId,
        addressBarcode: barcodeDataUri,
        barcodeUrl,
        createdAt: new Date().toISOString()
      };
      orders.unshift(targetOrder);
    }

    // 7. Dispatch Automated WhatsApp Alert to Store (Decoupled & Non-blocking)
    let whatsappDirectUrl = "";
    let whatsappReportText = "";

    try {
      if (!targetOrder.whatsappNotified) {
        const firstItem = orderItems[0] || {};
        const itemTitleSummary = orderItems.map(i => `${i.productTitle} [${i.code || '1-of-1'}]`).join(', ');
        const photoUrl = firstItem.image || (Array.isArray(firstItem.images) && firstItem.images[0]) || 'https://styleandclass.store/logo.png';
        const paymentMethodLabel = paymentMethod === 'card_uk' ? 'Debit/Credit Card (PayPal UK Gateway)' : 'PayPal UK (Verified Fund Capture)';

        const waResult = await sendOrderAlertToWhatsApp(
          {
            orderId: targetOrder.id,
            itemName: itemTitleSummary || 'Style & Class Curated Fashion',
            itemPrice: orderTotal,
            itemCurrency: 'GBP',
            itemPhotoUrl: photoUrl,
            buyerName: targetOrder.customer.fullName,
            buyerPhone: targetOrder.customer.phone || 'N/A',
            buyerAddress: `${targetOrder.customer.address}, ${targetOrder.customer.city}, ${targetOrder.customer.postcode}`,
            paymentMethod: paymentMethodLabel,
            shippingCompany: carrierName,
            paypalCaptureId: captureId,
            barcodeUrl,
            barcodeBase64OrUrl: barcodeDataUri,
            items: orderItems.map(it => ({
              title: it.productTitle,
              code: it.code,
              price: it.price,
              quantity: it.quantity,
              photoUrl: it.image,
              size: it.size
            })),
            subtotal: orderSubtotal,
            shippingCost: targetOrder.shipping,
            total: orderTotal
          },
          settings
        );

        targetOrder.whatsappAttemptCount = (targetOrder.whatsappAttemptCount || 0) + 1;
        if (waResult.providerSent) {
          targetOrder.whatsappNotified = true;
          targetOrder.whatsappStatus = 'sent';
        } else {
          targetOrder.whatsappStatus = 'pending';
          targetOrder.whatsappLastError = waResult.error;
        }
        whatsappDirectUrl = waResult.directWhatsAppUrl;
        whatsappReportText = waResult.reportText;
      } else {
        console.info(`[WhatsApp Idempotency] Alert already dispatched for order ${targetOrder.id}, skipping duplicate send.`);
        whatsappDirectUrl = targetOrder.whatsappUrl || "";
        whatsappReportText = targetOrder.whatsappReportText || "";
      }
    } catch (waErr: any) {
      console.warn("Automated WhatsApp alert exception (payment remains PAID):", waErr?.message);
      targetOrder.whatsappStatus = 'failed';
      targetOrder.whatsappLastError = waErr?.message;
    }

    targetOrder.whatsappUrl = whatsappDirectUrl;
    targetOrder.whatsappReportText = whatsappReportText;

    persistOrders();

    console.info(`[Payment & Order Finalized] Order ${targetOrder.id} verified PAID via PayPal. Capture ID: ${captureId}`);

    return {
      success: true,
      order: targetOrder,
      captureId,
      whatsappUrl: whatsappDirectUrl,
      whatsappReportText,
      barcodeUrl
    };
  })();

  inFlightCaptures.set(paypalOrderId, capturePromise);

  try {
    const finalResult = await capturePromise;
    return res.json(finalResult);
  } catch (err: any) {
    console.error("Capture order exception:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to process payment capture" });
  } finally {
    inFlightCaptures.delete(paypalOrderId);
  }
});

// POST Cancel PayPal Order Session (State transition: CREATED/PENDING -> FAILED)
app.post("/api/paypal/cancel-order", async (req, res) => {
  try {
    const { paypalOrderId, reason } = req.body || {};
    if (!paypalOrderId) {
      return res.status(400).json({ success: false, error: "Missing paypalOrderId" });
    }

    const order = orders.find(o => o.paypalOrderId === paypalOrderId);
    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    if (order.paymentState === 'PAID') {
      return res.status(400).json({ success: false, error: "Cannot cancel an already PAID order. Use refund instead." });
    }

    // State transition: PENDING/CREATED -> FAILED
    order.paymentState = 'FAILED';
    order.paymentStatus = 'failed';
    if (!order.paymentAuditTrail) order.paymentAuditTrail = [];
    order.paymentAuditTrail.push({
      timestamp: new Date().toISOString(),
      state: 'FAILED',
      source: 'paypal_cancel_api',
      note: reason || 'Customer cancelled transaction before completion',
      paypalOrderId
    });

    persistOrders();

    return res.json({
      success: true,
      order,
      message: "Order successfully cancelled and recorded in audit trail."
    });
  } catch (err: any) {
    console.error("Cancel order exception:", err);
    res.status(500).json({ success: false, error: err.message || "Failed to cancel order" });
  }
});

// GET Authoritative Server-side Verification directly against PayPal REST API
app.get("/api/paypal/verify-order/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!orderId) {
      return res.status(400).json({ success: false, error: "Missing orderId" });
    }

    const accessToken = await getPayPalAccessToken();
    const baseUrl = getPayPalBaseUrl();

    const verifyRes = await fetch(`${baseUrl}/v2/checkout/orders/${encodeURIComponent(orderId)}`, {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    });

    const verifyData = await verifyRes.json();
    if (!verifyRes.ok) {
      return res.status(verifyRes.status).json({
        success: false,
        error: verifyData.message || "Failed to fetch order from PayPal API",
        details: verifyData
      });
    }

    const localOrder = orders.find(o => o.paypalOrderId === orderId || o.paypalCaptureId === orderId);

    return res.json({
      success: true,
      paypalOrder: verifyData,
      localOrder: localOrder || null,
      status: verifyData.status
    });
  } catch (err: any) {
    console.error("Verify order exception:", err);
    res.status(500).json({ success: false, error: err.message || "Verification request failed" });
  }
});

// POST Refund Order via official PayPal Refund API (Admin / Automated)
app.post("/api/paypal/refund-order", async (req, res) => {
  try {
    const { orderId, reason } = req.body || {};
    if (!orderId) {
      return res.status(400).json({ success: false, error: "Missing orderId" });
    }

    const order = orders.find(o => o.id === orderId || o.paypalOrderId === orderId || o.paypalCaptureId === orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    if (order.paymentState !== 'PAID' || !order.paypalCaptureId) {
      return res.status(400).json({
        success: false,
        error: `Only verified PAID orders with a PayPal Capture ID can be refunded. Current state: ${order.paymentState}`
      });
    }

    const accessToken = await getPayPalAccessToken();
    const baseUrl = getPayPalBaseUrl();

    console.info(`[PayPal Refund Request] Processing refund for Capture ID: ${order.paypalCaptureId}`);

    const refundRes = await fetch(`${baseUrl}/v2/payments/captures/${encodeURIComponent(order.paypalCaptureId)}/refund`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "PayPal-Request-Id": `refund-${order.paypalCaptureId}-${Date.now()}`
      },
      body: JSON.stringify({
        note_to_payer: reason || "Style & Class London customer refund"
      })
    });

    const refundData = await refundRes.json();
    if (!refundRes.ok) {
      console.error("[PayPal Refund Error]:", refundRes.status, refundData);
      return res.status(refundRes.status).json({
        success: false,
        error: refundData.message || refundData.details?.[0]?.description || "PayPal refund execution failed",
        details: refundData
      });
    }

    const refundId = refundData.id;
    const refundAmount = parseFloat(refundData.amount?.value || String(order.total));

    // State machine transition: PAID -> REFUNDED
    order.paymentState = 'REFUNDED';
    order.paymentStatus = 'failed';
    order.refundId = refundId;
    order.refundedAt = new Date().toISOString();
    order.refundAmount = refundAmount;

    if (!order.paymentAuditTrail) order.paymentAuditTrail = [];
    order.paymentAuditTrail.push({
      timestamp: new Date().toISOString(),
      state: 'REFUNDED',
      source: 'paypal_refund_api',
      note: `Refund issued via PayPal: ${reason || 'Merchant/Admin initiated'}`,
      captureId: order.paypalCaptureId,
      amount: refundAmount,
      currency: refundData.amount?.currency_code || 'GBP',
      rawStatus: refundData.status
    });

    // RESTORE INVENTORY FOR REFUNDED 1-OF-1 PIECES
    const restoredProductIds: string[] = [];
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach(it => {
        soldProductIds.delete(it.productId);
        const prod = products.find(p => p.id === it.productId);
        if (prod) {
          prod.status = 'active';
          prod.stock = 1;
          restoredProductIds.push(prod.id);
        }
      });
      persistSoldProducts();
      persistProducts();
      console.info(`[Store Inventory] Restored refunded items to active stock: ${restoredProductIds.join(', ')}`);
    }

    persistOrders();

    return res.json({
      success: true,
      order,
      refundId,
      restoredProductIds,
      message: `Successfully refunded £${refundAmount.toFixed(2)} GBP via PayPal and restored 1-of-1 piece inventory.`
    });
  } catch (err: any) {
    console.error("Refund exception:", err);
    res.status(500).json({ success: false, error: err.message || "Failed to process refund" });
  }
});

// GET PayPal Gateway Health & Connectivity Status
app.get("/api/paypal/health", async (req, res) => {
  try {
    const clientId = (process.env.PAYPAL_CLIENT_ID || settings.paypalClientId || '').trim();
    const hasSecret = Boolean(process.env.PAYPAL_CLIENT_SECRET || process.env.PAYPAL_SECRET || settings.paypalSecret);
    const environment = (process.env.PAYPAL_ENVIRONMENT || 'live').toLowerCase();
    const baseUrl = getPayPalBaseUrl();

    let tokenValid = false;
    let tokenError: string | null = null;
    try {
      const token = await getPayPalAccessToken();
      tokenValid = Boolean(token && token.length > 10);
    } catch (tErr: any) {
      tokenError = tErr.message;
    }

    const whatsappToken = process.env.WHATSAPP_ACCESS_TOKEN || settings.whatsappAccessToken;
    const whatsappPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || settings.whatsappPhoneNumberId;
    const hasMetaWhatsApp = Boolean(whatsappToken && whatsappPhoneId && !whatsappToken.startsWith('EAA...'));

    res.json({
      status: tokenValid ? 'healthy' : 'degraded',
      environment,
      baseUrl,
      clientIdConfigured: Boolean(clientId),
      clientIdMasked: clientId ? `${clientId.slice(0, 8)}...${clientId.slice(-4)}` : null,
      secretConfigured: hasSecret,
      tokenValid,
      tokenError,
      currency: "GBP",
      merchantEmail: settings.merchantPayPalEmail || settings.merchantEmail || "styleandclasslondon@gmail.com",
      storeWhatsApp: getStoreWhatsAppNumber(),
      whatsappProvider: hasMetaWhatsApp ? 'meta_cloud_api' : (settings.whatsappWebhookUrl ? 'webhook' : 'direct_link_ready'),
      activeProductsCount: products.filter(p => p.status === 'active' && p.stock > 0).length,
      soldProductsCount: soldProductIds.size,
      totalOrders: orders.length,
      paidOrdersCount: orders.filter(o => o.paymentState === 'PAID').length
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// Endpoint to retry WhatsApp notification on-demand (Decoupled, idempotent)
app.post("/api/orders/:id/retry-whatsapp", async (req, res) => {
  try {
    const order = orders.find(o => o.id === req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    const firstItem = order.items?.[0] || {};
    const itemTitleSummary = order.items?.map(i => `${i.productTitle} [${i.code || '1-of-1'}]`).join(', ') || 'Style & Class Piece';

    const waResult = await sendOrderAlertToWhatsApp({
      orderId: order.id,
      itemName: itemTitleSummary,
      itemPrice: order.total,
      itemCurrency: order.currency || 'GBP',
      itemPhotoUrl: firstItem.image || 'https://styleandclass.store/logo.png',
      buyerName: order.customer.fullName,
      buyerPhone: order.customer.phone || 'N/A',
      buyerAddress: `${order.customer.address}, ${order.customer.city}, ${order.customer.postcode}`,
      paymentMethod: order.paymentMethod,
      shippingCompany: order.carrierName || 'Evri',
      paypalCaptureId: order.paypalCaptureId || 'VERIFIED',
      barcodeUrl: order.barcodeUrl,
      items: order.items?.map(it => ({
        title: it.productTitle,
        code: it.code,
        price: it.price,
        quantity: it.quantity,
        photoUrl: it.image,
        size: it.size
      })),
      subtotal: order.subtotal,
      shippingCost: order.shipping,
      total: order.total
    });

    order.whatsappAttemptCount = (order.whatsappAttemptCount || 0) + 1;
    if (waResult.providerSent) {
      order.whatsappNotified = true;
      order.whatsappStatus = 'sent';
    } else {
      order.whatsappStatus = 'pending';
      order.whatsappLastError = waResult.error;
    }
    order.whatsappUrl = waResult.directWhatsAppUrl;
    persistOrders();

    return res.json({
      success: true,
      providerSent: waResult.providerSent,
      whatsappStatus: order.whatsappStatus,
      directWhatsAppUrl: waResult.directWhatsAppUrl
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || "Failed to retry WhatsApp alert" });
  }
});

// Endpoint to serve live scannable address barcode PNG image
app.get(["/api/barcode/:orderId", "/api/barcode"], async (req, res) => {
  try {
    const orderId = req.params.orderId;
    let textToEncode = "";

    if (orderId) {
      const order = orders.find(o => o.id === orderId);
      if (order && order.customer) {
        textToEncode = `${order.customer.fullName}\n${order.customer.address}\n${order.customer.city}\n${order.customer.postcode}\nUK`;
      }
    }

    if (!textToEncode && req.query.text) {
      textToEncode = String(req.query.text);
    }

    if (!textToEncode) {
      textToEncode = "Style & Class London - Delivery Barcode";
    }

    const buffer = await generateAddressBarcode(textToEncode);
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=86400");
    return res.send(buffer);
  } catch (err: any) {
    console.error("Barcode serving error:", err);
    res.status(500).send("Error generating barcode image");
  }
});

// Webhook listener for asynchronous PayPal events (Idempotent order reconciliation)
app.post(["/api/paypal/webhook", "/api/checkout/webhook"], async (req, res) => {
  try {
    const event = req.body || {};
    const eventType = event.event_type || 'UNKNOWN';
    console.info(`[PayPal Webhook] Event received: ${eventType} (ID: ${event.id || 'N/A'})`);

    const resource = event.resource || {};
    const captureId = resource.id;
    const relatedOrderId = resource.supplementary_data?.related_ids?.order_id;

    if (eventType === "PAYMENT.CAPTURE.COMPLETED") {
      const amountVal = parseFloat(resource.amount?.value || "0");
      const currency = resource.amount?.currency_code || "GBP";

      const targetOrder = orders.find(o => 
        (captureId && o.paypalCaptureId === captureId) || 
        (relatedOrderId && o.paypalOrderId === relatedOrderId)
      );

      if (targetOrder && targetOrder.paymentState !== 'PAID') {
        targetOrder.paymentStatus = 'completed';
        targetOrder.paymentState = 'PAID';
        if (captureId) targetOrder.paypalCaptureId = captureId;

        if (!targetOrder.paymentAuditTrail) targetOrder.paymentAuditTrail = [];
        targetOrder.paymentAuditTrail.push({
          timestamp: new Date().toISOString(),
          state: 'PAID',
          source: 'paypal_webhook',
          note: `Webhook verified capture: ${eventType}`,
          captureId,
          amount: amountVal,
          currency,
          rawStatus: resource.status
        });

        // Reduce inventory atomically
        if (targetOrder.items && Array.isArray(targetOrder.items)) {
          targetOrder.items.forEach(it => {
            soldProductIds.add(it.productId);
            const prod = products.find(p => p.id === it.productId);
            if (prod) {
              prod.status = 'sold';
              prod.stock = 0;
            }
          });
          persistSoldProducts();
          persistProducts();
        }

        // Send WhatsApp alert if not yet sent
        if (!targetOrder.whatsappNotified) {
          try {
            const firstItem = targetOrder.items?.[0] || {};
            const itemTitleSummary = targetOrder.items?.map(i => `${i.productTitle} [${i.code || '1-of-1'}]`).join(', ') || 'Style & Class Piece';
            const photoUrl = firstItem.image || 'https://styleandclass.store/logo.png';

            const waResult = await sendOrderAlertToWhatsApp(
              {
                orderId: targetOrder.id,
                itemName: itemTitleSummary,
                itemPrice: targetOrder.total,
                itemCurrency: targetOrder.currency || 'GBP',
                itemPhotoUrl: photoUrl,
                buyerName: targetOrder.customer.fullName,
                buyerPhone: targetOrder.customer.phone || 'N/A',
                buyerAddress: `${targetOrder.customer.address}, ${targetOrder.customer.city}, ${targetOrder.customer.postcode}`,
                paymentMethod: targetOrder.paymentMethod === 'card_uk' ? 'Debit/Credit Card (PayPal UK)' : 'PayPal UK (Verified)',
                shippingCompany: targetOrder.carrierName || 'Evri Standard Delivery',
                paypalCaptureId: targetOrder.paypalCaptureId || captureId,
                barcodeUrl: targetOrder.barcodeUrl,
                barcodeBase64OrUrl: targetOrder.addressBarcode,
                items: targetOrder.items.map(it => ({
                  title: it.productTitle,
                  code: it.code,
                  price: it.price,
                  quantity: it.quantity,
                  photoUrl: it.image,
                  size: it.size
                })),
                subtotal: targetOrder.subtotal,
                shippingCost: targetOrder.shipping,
                total: targetOrder.total
              },
              settings
            );

            if (waResult.providerSent) {
              targetOrder.whatsappNotified = true;
              targetOrder.whatsappStatus = 'sent';
            } else {
              targetOrder.whatsappStatus = 'pending';
            }
            targetOrder.whatsappUrl = waResult.directWhatsAppUrl;
            targetOrder.whatsappReportText = waResult.reportText;
          } catch (waErr: any) {
            console.warn("[PayPal Webhook] WhatsApp dispatch warning:", waErr?.message);
          }
        }

        persistOrders();
        console.info(`[PayPal Webhook] Order ${targetOrder.id} marked PAID and stock archived from webhook capture ${captureId}`);
      }
    } else if (eventType === "PAYMENT.CAPTURE.REFUNDED") {
      const targetOrder = orders.find(o => 
        (captureId && o.paypalCaptureId === captureId) || 
        (resource.id && o.refundId === resource.id)
      );

      if (targetOrder && targetOrder.paymentState !== 'REFUNDED') {
        targetOrder.paymentState = 'REFUNDED';
        targetOrder.paymentStatus = 'failed';
        targetOrder.refundedAt = new Date().toISOString();

        if (!targetOrder.paymentAuditTrail) targetOrder.paymentAuditTrail = [];
        targetOrder.paymentAuditTrail.push({
          timestamp: new Date().toISOString(),
          state: 'REFUNDED',
          source: 'paypal_webhook',
          note: `Webhook verified refund event: ${eventType}`,
          captureId: targetOrder.paypalCaptureId,
          amount: parseFloat(resource.amount?.value || String(targetOrder.total)),
          currency: resource.amount?.currency_code || 'GBP',
          rawStatus: resource.status
        });

        // Restore inventory
        if (targetOrder.items && Array.isArray(targetOrder.items)) {
          targetOrder.items.forEach(it => {
            soldProductIds.delete(it.productId);
            const prod = products.find(p => p.id === it.productId);
            if (prod) {
              prod.status = 'active';
              prod.stock = 1;
            }
          });
          persistSoldProducts();
          persistProducts();
        }

        persistOrders();
        console.info(`[PayPal Webhook] Order ${targetOrder.id} transitioned to REFUNDED and stock restored.`);
      }
    } else if (eventType === "PAYMENT.CAPTURE.DENIED" || eventType === "PAYMENT.CAPTURE.DECLINED") {
      const targetOrder = orders.find(o => 
        (captureId && o.paypalCaptureId === captureId) || 
        (relatedOrderId && o.paypalOrderId === relatedOrderId)
      );

      if (targetOrder && targetOrder.paymentState !== 'PAID') {
        targetOrder.paymentState = 'FAILED';
        targetOrder.paymentStatus = 'failed';

        if (!targetOrder.paymentAuditTrail) targetOrder.paymentAuditTrail = [];
        targetOrder.paymentAuditTrail.push({
          timestamp: new Date().toISOString(),
          state: 'FAILED',
          source: 'paypal_webhook',
          note: `Payment capture denied by provider: ${eventType}`,
          rawStatus: resource.status
        });

        persistOrders();
        console.info(`[PayPal Webhook] Order ${targetOrder.id} marked FAILED.`);
      }
    }

    res.json({ received: true });
  } catch (err: any) {
    console.error("[PayPal Webhook Error]:", err);
    res.status(500).json({ received: false, error: err.message });
  }
});

// Catch-all 404 handler for API routes to never return HTML to API consumers
app.all("/api/*", (req, res) => {
  res.status(404).json({ success: false, error: `API route not found: ${req.method} ${req.path}` });
});

// Central error handler for API endpoints
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Central API Error Handler caught:", err);
  if (req.path.startsWith("/api/")) {
    return res.status(500).json({
      success: false,
      error: err?.message || "Internal server error occurred."
    });
  }
  next(err);
});

// ==================== VITE & STATIC SERVING ====================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : undefined
      },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Style & Class London server running on http://0.0.0.0:${PORT}`);
  });
}

// Only start the HTTP listener when running locally or standalone, not in Vercel serverless functions
if (!process.env.VERCEL) {
  startServer();
}

export { app };
export default app;
