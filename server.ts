import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import QRCode from "qrcode";
import { INITIAL_PRODUCTS, INITIAL_SETTINGS, INITIAL_REVIEWS } from "./src/data/initialProducts.js";
import { Product, Order, StoreSettings, CustomerReview } from "./src/types.js";
import { generateAddressBarcode, bufferToDataUri } from "./lib/barcode.js";
import { sendOrderAlertToWhatsApp } from "./lib/whatsapp.js";
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

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let products: Product[] = [];
let orders: Order[] = [];
let settings: StoreSettings = { ...INITIAL_SETTINGS };
let soldProductIds: Set<string> = new Set();
let reviews: CustomerReview[] = [];

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

// Remove any sold products from active catalog
products = products.filter((p) => !soldProductIds.has(p.id));

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

// GET products (filtered by active for store; or ?all=true for admin; supports ?limit=&page=&category=)
app.get("/api/products", (req, res) => {
  const showAll = req.query.all === "true";
  let result = showAll 
    ? products.filter((p) => !soldProductIds.has(p.id))
    : products.filter((p) => p.status === "active" && p.stock > 0 && !soldProductIds.has(p.id));

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
  if (soldProductIds.has(id)) {
    const soldItem = INITIAL_PRODUCTS.find((p) => p.id === id || p.slug === id);
    if (soldItem) {
      return res.json({ ...soldItem, stock: 0, status: "sold" });
    }
  }
  let product = products.find((p) => (p.id === id || p.slug === id) && !soldProductIds.has(p.id));
  if (!product && !soldProductIds.has(id)) {
    product = INITIAL_PRODUCTS.find((p) => p.id === id || p.slug === id);
  }
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
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

      // CRITICAL USER REQUIREMENT:
      // "when client buy an item and pay for it - delete it from the website"
      removedFromStoreProducts.push(product.title);
      console.log(`[STORE INVENTORY] Product "${product.title}" (${product.code || product.sku}) bought & paid. Deleted completely from website.`);
    }

    // Permanently remove all purchased items from active store products and record in soldProductIds
    const purchasedProductIds = new Set(orderedItems.map((it) => it.productId));
    purchasedProductIds.forEach((id) => soldProductIds.add(id));
    persistSoldProducts();

    products = products.filter((p) => !soldProductIds.has(p.id));
    persistProducts();

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
    const isPaid = normalizedPaymentMethod === "paypal_uk" || normalizedPaymentMethod === "card_uk" || normalizedPaymentMethod === "card";

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
      paymentStatus: isPaid ? "completed" : "pending",
      whatsappNotified: false,
      addressQrDataUrl,
      addressQrUrl,
      paypalCheckoutUrl,
      cardSummary: req.body?.cardSummary || undefined,
      notes: notes || ""
    };

    orders.unshift(order);
    persistProducts();
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

    const waResult = await sendOrderAlertToWhatsApp(waPayload);
    const whatsappUrl = waResult.directWhatsAppUrl;
    const whatsappMessage = waResult.reportText;

    order.barcodeUrl = barcodeUrl;
    order.whatsappUrl = whatsappUrl;
    order.whatsappReportText = whatsappMessage;

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

// Helper to obtain fresh live PayPal access token
async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID || settings.paypalClientId;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET || process.env.PAYPAL_SECRET || settings.paypalSecret;

  if (!clientId || !clientSecret) {
    throw new Error("PayPal Client ID or Secret is not configured.");
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch("https://api-m.paypal.com/v1/oauth2/token", {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("PayPal token error:", res.status, errorText);
    throw new Error(`PayPal authentication failed: ${res.status}`);
  }

  const data = await res.json();
  return data.access_token;
}

// GET PayPal configuration for client checkout
app.get("/api/paypal/config", (req, res) => {
  const clientId = process.env.PAYPAL_CLIENT_ID || settings.paypalClientId || "";
  const hasSecret = Boolean(process.env.PAYPAL_CLIENT_SECRET || process.env.PAYPAL_SECRET || settings.paypalSecret);
  res.json({
    clientId,
    currency: settings.currency || "GBP",
    configured: Boolean(clientId),
    connected: Boolean(clientId && hasSecret),
    merchantEmail: settings.merchantPayPalEmail || settings.merchantEmail || "styleandclasslondon@gmail.com"
  });
});

// Server-side PayPal Order Creation with verified product amounts
app.post(["/api/paypal/create-order", "/api/checkout/paypal/create-order"], async (req, res) => {
  try {
    const { items: orderItemsParam, shippingCarrierId, customer } = req.body;
    
    // Server-side validation of items and price calculation
    let calculatedSubtotal = 0;
    const verifiedItems: any[] = [];

    if (Array.isArray(orderItemsParam) && orderItemsParam.length > 0) {
      for (const reqItem of orderItemsParam) {
        const prod = products.find(p => p.id === (reqItem.id || reqItem.product?.id));
        if (prod) {
          const qty = Number(reqItem.quantity) || 1;
          calculatedSubtotal += prod.price * qty;
          verifiedItems.push({
            name: `${prod.title} [${prod.code || '1-of-1'}]`.slice(0, 127),
            unit_amount: {
              currency_code: "GBP",
              value: prod.price.toFixed(2)
            },
            quantity: String(qty),
            category: "PHYSICAL_GOODS"
          });
        }
      }
    }

    // Fallback if raw amount passed
    if (calculatedSubtotal === 0 && req.body.amount) {
      calculatedSubtotal = parseFloat(req.body.amount) || 0;
    }

    if (calculatedSubtotal <= 0) {
      return res.status(400).json({ success: false, error: "Order subtotal must be greater than £0.00" });
    }

    // Shipping calculation
    const carrierRates: Record<string, number> = {
      evri: 2.60,
      inpost: 2.89,
      royalmail: 3.65
    };
    const freeThreshold = settings.freeShippingThreshold ?? 45.0;
    const shippingCost = calculatedSubtotal >= freeThreshold ? 0 : (carrierRates[shippingCarrierId] ?? 2.60);
    const calculatedTotal = Number((calculatedSubtotal + shippingCost).toFixed(2));

    const accessToken = await getPayPalAccessToken();

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

    if (verifiedItems.length > 0) {
      purchaseUnit.items = verifiedItems;
    }

    if (customer?.address) {
      purchaseUnit.shipping = {
        name: { full_name: customer.fullName || "UK Fashion Customer" },
        address: {
          address_line_1: customer.address.slice(0, 300),
          admin_area_2: (customer.city || "London").slice(0, 120),
          postal_code: (customer.postcode || "").slice(0, 60),
          country_code: "GB"
        }
      };
    }

    const orderRes = await fetch("https://api-m.paypal.com/v2/checkout/orders", {
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
          shipping_preference: customer?.address ? "SET_PROVIDED_ADDRESS" : "NO_SHIPPING",
          user_action: "PAY_NOW"
        }
      })
    });

    const orderData = await orderRes.json();
    if (!orderRes.ok) {
      console.error("PayPal Create Order error:", orderRes.status, orderData);
      return res.status(orderRes.status).json({
        success: false,
        error: orderData.message || orderData.details?.[0]?.description || "Failed to create order on PayPal",
        details: orderData
      });
    }

    return res.json({
      success: true,
      orderId: orderData.id,
      calculatedTotal: calculatedTotal.toFixed(2)
    });
  } catch (err: any) {
    console.error("Create order exception:", err);
    res.status(500).json({ success: false, error: err.message || "Failed to connect to PayPal API" });
  }
});

// Server-side PayPal Order Capture with verified fund receipt and instant stock deletion
app.post(["/api/paypal/capture-order", "/api/checkout/paypal/capture-order"], async (req, res) => {
  try {
    const { paypalOrderId, customer, carrier: carrierParam, items: orderItemsParam, paymentMethod } = req.body;

    if (!paypalOrderId) {
      return res.status(400).json({ success: false, error: "Missing paypalOrderId for capture" });
    }

    const accessToken = await getPayPalAccessToken();

    // Call PayPal capture endpoint
    const captureRes = await fetch(`https://api-m.paypal.com/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "PayPal-Request-Id": `capture-${paypalOrderId}`
      }
    });

    const captureData = await captureRes.json();

    if (!captureRes.ok) {
      console.error("PayPal Capture failed:", captureRes.status, captureData);
      return res.status(captureRes.status).json({
        success: false,
        error: captureData.message || captureData.details?.[0]?.description || "PayPal payment capture failed",
        details: captureData
      });
    }

    // Verify status is COMPLETED
    const captureStatus = captureData.status;
    const captureDetail = captureData.purchase_units?.[0]?.payments?.captures?.[0];
    const isCompleted = captureStatus === "COMPLETED" || captureDetail?.status === "COMPLETED";

    if (!isCompleted) {
      return res.status(400).json({
        success: false,
        error: `Payment is not completed. Current status: ${captureStatus || 'UNKNOWN'}`
      });
    }

    const captureId = captureDetail?.id || paypalOrderId;
    const amountCaptured = parseFloat(captureDetail?.amount?.value || "0");

    // Reconcile items from inventory
    const orderItems: any[] = [];
    const purchasedProductIds: string[] = [];

    if (Array.isArray(orderItemsParam)) {
      for (const item of orderItemsParam) {
        const prod = products.find(p => p.id === (item.id || item.product?.id));
        if (prod) {
          orderItems.push({
            productId: prod.id,
            productTitle: prod.title,
            price: prod.price,
            quantity: item.quantity || 1,
            images: prod.images,
            image: prod.images[0] || '',
            code: prod.code,
            sku: prod.sku,
            brand: prod.brand,
            size: prod.sizes?.[0] || 'One Size',
            color: prod.colors?.[0] || 'Original',
            category: prod.category
          });
          purchasedProductIds.push(prod.id);
        }
      }
    }

    // CRITICAL USER REQUIREMENT: 1-OF-1 INVENTORY DELETION UPON PAYMENT
    if (purchasedProductIds.length > 0) {
      products = products.filter(p => !purchasedProductIds.includes(p.id));
      persistProducts();
    }

    const carrierId: 'evri' | 'inpost' | 'royalmail' =
      carrierParam === 'royalmail' || carrierParam?.id === 'royalmail'
        ? 'royalmail'
        : carrierParam === 'inpost' || carrierParam?.id === 'inpost'
        ? 'inpost'
        : 'evri';
    const carrierName = carrierId === 'royalmail' ? 'Royal Mail 48 Tracked' : carrierId === 'inpost' ? 'InPost 24/7 Locker' : 'Evri Standard Tracked';
    const trackingPrefix = carrierId === 'royalmail' ? 'GB-RM' : carrierId === 'inpost' ? 'INP' : 'EVR';
    const trackingNumber = `${trackingPrefix}-${Date.now().toString().slice(-8)}`;

    const orderSubtotal = orderItems.reduce((s, it) => s + it.price * it.quantity, 0);
    const orderTotal = amountCaptured > 0 ? amountCaptured : orderSubtotal;

    // 1. Generate scannable barcode for the buyer's shipping address
    let barcodeDataUri = "";
    try {
      const fullAddressText = `${customer?.fullName || 'Customer'}\n${customer?.address || ''}\n${customer?.city || ''}\n${customer?.postcode || ''}\nUK`;
      const barcodeBuffer = await generateAddressBarcode(fullAddressText);
      barcodeDataUri = bufferToDataUri(barcodeBuffer);
    } catch (bcErr) {
      console.warn("Address barcode generation error:", bcErr);
    }

    const newOrder: any = {
      id: `SC-${Date.now()}`,
      customer: {
        fullName: customer?.fullName || "UK Fashion Customer",
        email: customer?.email || settings.merchantEmail,
        phone: customer?.phone || "",
        address: customer?.address || "",
        city: customer?.city || "London",
        postcode: customer?.postcode || ""
      },
      items: orderItems,
      subtotal: orderSubtotal,
      shipping: orderTotal - orderSubtotal > 0 ? orderTotal - orderSubtotal : 0,
      discount: 0,
      total: orderTotal,
      currency: "GBP",
      paymentMethod: paymentMethod === 'card_uk' ? 'card_uk' : 'paypal_uk',
      paymentStatus: 'completed',
      status: 'confirmed',
      whatsappNotified: false,
      carrier: carrierId,
      carrierName,
      trackingNumber,
      paypalOrderId,
      paypalCaptureId: captureId,
      addressBarcode: barcodeDataUri,
      createdAt: new Date().toISOString()
    };

    const host = req.get('host') || 'localhost:3000';
    const proto = req.secure || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
    const appBaseUrl = process.env.APP_URL || `${proto}://${host}`;
    const barcodeUrl = `${appBaseUrl}/api/barcode/${newOrder.id}`;

    let whatsappDirectUrl = "";
    let whatsappReportText = "";

    // 2. Dispatch Automated WhatsApp Alert to Store
    try {
      const firstItem = orderItems[0] || {};
      const itemTitleSummary = orderItems.map(i => `${i.productTitle} [${i.code || '1-of-1'}]`).join(', ');
      const photoUrl = firstItem.image || firstItem.images?.[0] || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=600';
      const paymentMethodLabel = paymentMethod === 'card_uk' ? 'Credit / Debit Card' : 'PayPal UK';

      const waResult = await sendOrderAlertToWhatsApp({
        orderId: newOrder.id,
        itemName: itemTitleSummary || 'Style & Class Curated Fashion',
        itemPrice: orderTotal,
        itemCurrency: 'GBP',
        itemPhotoUrl: photoUrl,
        buyerName: newOrder.customer.fullName,
        buyerPhone: newOrder.customer.phone || 'N/A',
        buyerAddress: `${newOrder.customer.address}, ${newOrder.customer.city}, ${newOrder.customer.postcode}`,
        paymentMethod: paymentMethodLabel,
        shippingCompany: carrierName,
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
        shippingCost: newOrder.shipping,
        total: orderTotal
      });

      if (waResult.success) {
        newOrder.whatsappNotified = true;
      }
      whatsappDirectUrl = waResult.directWhatsAppUrl || "";
      whatsappReportText = waResult.reportText || "";
    } catch (waErr) {
      console.warn("Automated WhatsApp alert exception:", waErr);
    }

    newOrder.barcodeUrl = barcodeUrl;
    newOrder.whatsappUrl = whatsappDirectUrl;
    newOrder.whatsappReportText = whatsappReportText;

    orders.unshift(newOrder);
    persistOrders();

    return res.json({
      success: true,
      order: newOrder,
      captureId,
      whatsappUrl: whatsappDirectUrl,
      whatsappReportText,
      barcodeUrl
    });
  } catch (err: any) {
    console.error("Capture order exception:", err);
    res.status(500).json({ success: false, error: err.message || "Failed to process payment capture" });
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

// Webhook listener for asynchronous PayPal events
app.post("/api/checkout/webhook", (req, res) => {
  const event = req.body || {};
  console.info(`[PayPal Webhook] Event received: ${event.event_type || 'UNKNOWN'}`);
  res.json({ received: true });
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
