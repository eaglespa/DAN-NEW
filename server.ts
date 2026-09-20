import express from "express";
import path from "path";
import fs from "fs";
import QRCode from "qrcode";
import { createServer as createViteServer } from "vite";
import { INITIAL_PRODUCTS, INITIAL_SETTINGS } from "./src/data/initialProducts.js";
import { Product, Order, StoreSettings } from "./src/types.js";

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory + persistent disk fallback database
const DATA_DIR = path.join(process.cwd(), "data");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let products: Product[] = [];
let orders: Order[] = [];
let settings: StoreSettings = { ...INITIAL_SETTINGS };

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
    if (process.env.WHATSAPP_BUSINESS_PHONE) {
      settings.merchantWhatsApp = process.env.WHATSAPP_BUSINESS_PHONE;
    }
    if (process.env.PAYPAL_CLIENT_ID) {
      settings.paypalClientId = process.env.PAYPAL_CLIENT_ID;
    }
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
  }
} catch (e) {
  settings = { ...INITIAL_SETTINGS };
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

// ==================== API ROUTES ====================

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// GET products (filtered by active for store; or ?all=true for admin)
app.get("/api/products", (req, res) => {
  const showAll = req.query.all === "true";
  if (showAll) {
    return res.json(products);
  }
  // Storefront view: only active items with stock > 0
  const activeProducts = products.filter(
    (p) => p.status === "active" && p.stock > 0
  );
  res.json(activeProducts);
});

// GET single product by id or slug
app.get("/api/products/:id", (req, res) => {
  const { id } = req.params;
  const product = products.find((p) => p.id === id || p.slug === id);
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
  const { items, customer, paymentMethod, notes } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "No items in order" });
  }
  if (!customer || !customer.fullName || !customer.phone) {
    return res.status(400).json({ error: "Customer name and phone are required" });
  }

  let subtotal = 0;
  const orderedItems: Order["items"] = [];
  const removedFromStoreProducts: string[] = [];

  // Verify and process stock for each item
  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) {
      return res.status(400).json({ error: `Product not found: ${item.productId}` });
    }

    if (product.stock < item.quantity) {
      return res.status(400).json({
        error: `Insufficient stock for "${product.title}". Only ${product.stock} available.`
      });
    }

    const itemPrice = product.price;
    subtotal += itemPrice * item.quantity;

    orderedItems.push({
      productId: product.id,
      productTitle: product.title,
      color: item.color || "Standard",
      size: item.size || "Standard",
      quantity: item.quantity,
      price: itemPrice,
      image: item.image || product.images[0] || "",
      code: product.code || "",
      brand: product.brand || ""
    });

    // Deduct stock
    const priorStock = product.stock;
    product.stock = Math.max(0, product.stock - item.quantity);

    // CRITICAL USER REQUIREMENT:
    // "also when client buy any item and it's 1 piece only - remove it directly from website (store)"
    if (priorStock === 1 || product.stock === 0) {
      product.status = "archived";
      removedFromStoreProducts.push(product.title);
      console.log(`[STORE INVENTORY] Product "${product.title}" (${product.code || product.sku}) reached 0 stock (1-piece purchased). Automatically REMOVED from active storefront.`);
    }
  }

  // Carrier selection support: Evri (£2.60), InPost (£2.89), Royal Mail (£3.65)
  const carrierKey = req.body.carrier || 'evri';
  const carrierRates: { [key: string]: { name: string; cost: number; time: string } } = {
    evri: { name: 'Evri Standard Delivery', cost: 2.60, time: '2-3 Working Days' },
    inpost: { name: 'InPost Locker / Shop', cost: 2.89, time: '2-3 Working Days' },
    royalmail: { name: 'Royal Mail 48 Tracked', cost: 3.65, time: '2 Working Days' }
  };
  const chosenCarrier = carrierRates[carrierKey] || carrierRates['evri'];
  const shipping = subtotal >= (settings.freeShippingThreshold || 45) ? 0 : chosenCarrier.cost;
  const discount = 0;
  const total = Number((subtotal + shipping - discount).toFixed(2));

  // Generate QR code for buyer address
  const fullAddress = `${customer.address}, ${customer.city}, ${customer.postcode}, United Kingdom`;
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

  const orderId = `SAC-${Math.floor(100000 + Math.random() * 900000)}`;
  const order: Order = {
    id: orderId,
    createdAt: new Date().toISOString(),
    items: orderedItems,
    customer,
    carrier: carrierKey,
    carrierName: chosenCarrier.name,
    subtotal: Number(subtotal.toFixed(2)),
    shipping,
    discount,
    total,
    currency: settings.currency || "GBP",
    paymentMethod: paymentMethod || "paypal_uk",
    paymentStatus: paymentMethod === "paypal_uk" ? "completed" : "pending",
    whatsappNotified: false,
    addressQrDataUrl,
    addressQrUrl,
    notes: notes || ""
  };

  orders.unshift(order);
  persistProducts();
  persistOrders();

  // Determine host for absolute product photo URLs
  const host = req.get("host") || "styleandclass.store";
  const protocol = req.headers["x-forwarded-proto"] || req.protocol || "https";
  const baseUrl = `${protocol}://${host}`;

  // Structured alert with all 6 required items:
  // 1- Name of the buyer
  // 2- Address of the buyer (also generate qr for address)
  // 3- Buyer phone number
  // 4- Product name and price
  // 5- Product photo (1 photo at least)
  // 6- Shipping company

  const itemsFormatted = orderedItems
    .map((it, idx) => {
      const photoUrl = it.image.startsWith("http") ? it.image : `${baseUrl}${it.image}`;
      return `📦 *ITEM ${idx + 1}:*
• *Product Name:* ${it.productTitle} [${it.code || '1-of-1'}]
• *Brand:* ${it.brand || 'Designer Vintage'}
• *Size:* ${it.size} | *Qty:* ${it.quantity}
• *Price:* £${it.price.toFixed(2)}
• *Product Photo:* ${photoUrl}`;
    })
    .join("\n\n");

  const photosList = orderedItems
    .map((it, idx) => {
      const photoUrl = it.image.startsWith("http") ? it.image : `${baseUrl}${it.image}`;
      return `📸 *Photo ${idx + 1} (${it.productTitle}):*\n${photoUrl}`;
    })
    .join("\n\n");

  const cleanCustomerPhone = customer.phone.replace(/[^0-9+]/g, '');

  const removalNotice =
    removedFromStoreProducts.length > 0
      ? `\n\n🚨 *INVENTORY AUTOMATION (1-PIECE RULE):*\nSold out & automatically removed from active store: ${removedFromStoreProducts.join(", ")}`
      : "";

  const whatsappMessage = `🚨 *NEW PAID ORDER ALERT - STYLE & CLASS LONDON* 🚨
Order ID: #${order.id}
Status: *PAID ALREADY via PayPal UK* ✅
Date: ${new Date().toLocaleString("en-GB")}

----------------------------------------
1️⃣ *BUYER NAME:*
${customer.fullName}

2️⃣ *BUYER ADDRESS & QR CODE:*
📍 ${customer.address}, ${customer.city}, ${customer.postcode}, United Kingdom
📲 *Address QR Code (Scan/Print):*
${addressQrUrl}
🗺️ *Google Maps:* https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}

3️⃣ *BUYER PHONE NUMBER:*
📞 ${customer.phone}
💬 *Chat directly:* https://wa.me/${cleanCustomerPhone.replace('+', '')}

4️⃣ *PRODUCT NAME & PRICE:*
${itemsFormatted}

💰 *PAYMENT SUMMARY:*
• Subtotal: £${order.subtotal.toFixed(2)}
• Shipping: ${shipping === 0 ? "FREE UK Delivery" : `£${shipping.toFixed(2)}`}
• *TOTAL PAID: £${order.total.toFixed(2)} [PAID]*

5️⃣ *PRODUCT PHOTO (At least 1 photo):*
${photosList}

6️⃣ *SHIPPING COMPANY:*
🚚 *${chosenCarrier.name}* (£${shipping === 0 ? "FREE" : shipping.toFixed(2)})
⏱️ Tracked Delivery: ${chosenCarrier.time}
----------------------------------------${removalNotice}

Style And Class London &middot; Sustainable Pre-Loved Luxury`;

  const cleanMerchantPhone = (settings.merchantWhatsApp || "+447591878215").replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/${cleanMerchantPhone}?text=${encodeURIComponent(whatsappMessage)}`;

  res.status(201).json({
    success: true,
    order,
    whatsappUrl,
    whatsappMessage,
    addressQrUrl,
    addressQrDataUrl,
    removedFromStoreProducts,
    remainingActiveProductsCount: products.filter((p) => p.status === "active" && p.stock > 0).length
  });
});

// GET orders (Admin)
app.get("/api/orders", (req, res) => {
  res.json(orders);
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

// ==================== VITE & STATIC SERVING ====================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
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

startServer();
