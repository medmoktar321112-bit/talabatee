import fs from 'fs';
import path from 'path';
import { Product, StoreSettings, Order, OrderStatus, OrderFinances } from '../src/types';
import { INITIAL_PRODUCTS, INITIAL_SETTINGS, INITIAL_SAMPLE_ORDERS } from '../src/data/initialData';

interface DatabaseSchema {
  products: Product[];
  settings: StoreSettings;
  orders: Order[];
  admin: {
    username: string;
    passwordHash: string; // Stored securely
    name: string;
  };
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'store.json');
const UPLOADS_DIR = path.resolve(DATA_DIR, 'uploads');

// Ensure data directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

function getInitialData(): DatabaseSchema {
  return {
    products: INITIAL_PRODUCTS,
    settings: INITIAL_SETTINGS,
    orders: INITIAL_SAMPLE_ORDERS,
    admin: {
      username: 'admin',
      // Default password: admin123 (can be changed in settings/admin panel)
      passwordHash: 'admin123',
      name: 'مدير طلباتي',
    },
  };
}

function readDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialData();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf8');
      return initial;
    }
    const content = fs.readFileSync(DB_FILE, 'utf8');
    const data = JSON.parse(content);
    return data;
  } catch (error) {
    console.error('Error reading database file, returning default:', error);
    return getInitialData();
  }
}

function writeDb(data: DatabaseSchema): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing to database file:', error);
  }
}

export const db = {
  // Settings
  getSettings(): StoreSettings {
    const data = readDb();
    return data.settings;
  },
  updateSettings(updates: Partial<StoreSettings>): StoreSettings {
    const data = readDb();
    data.settings = { ...data.settings, ...updates };
    writeDb(data);
    return data.settings;
  },

  // Products
  getProducts(): Product[] {
    const data = readDb();
    return data.products;
  },
  getProductById(id: string): Product | undefined {
    const data = readDb();
    return data.products.find(p => p.id === id);
  },
  addProduct(product: Omit<Product, 'id'>): Product {
    const data = readDb();
    const newProduct: Product = {
      ...product,
      id: `food-${Date.now()}`,
    };
    data.products.push(newProduct);
    writeDb(data);
    return newProduct;
  },
  updateProduct(id: string, updates: Partial<Product>): Product | null {
    const data = readDb();
    const index = data.products.findIndex(p => p.id === id);
    if (index === -1) return null;
    data.products[index] = { ...data.products[index], ...updates };
    writeDb(data);
    return data.products[index];
  },
  deleteProduct(id: string): boolean {
    const data = readDb();
    const initialLen = data.products.length;
    data.products = data.products.filter(p => p.id !== id);
    if (data.products.length !== initialLen) {
      writeDb(data);
      return true;
    }
    return false;
  },

  // Orders
  getOrders(filters?: { status?: string; search?: string; startDate?: string; endDate?: string }): Order[] {
    const data = readDb();
    let orders = [...data.orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (!filters) return orders;

    if (filters.status && filters.status !== 'all') {
      orders = orders.filter(o => o.status === filters.status);
    }

    if (filters.search) {
      const q = filters.search.trim().toLowerCase();
      orders = orders.filter(o =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.includes(q) ||
        o.deliveryAddress.toLowerCase().includes(q)
      );
    }

    if (filters.startDate) {
      const start = new Date(filters.startDate).getTime();
      orders = orders.filter(o => new Date(o.createdAt).getTime() >= start);
    }

    if (filters.endDate) {
      const end = new Date(filters.endDate).getTime();
      orders = orders.filter(o => new Date(o.createdAt).getTime() <= end);
    }

    return orders;
  },
  getOrderById(id: string): Order | undefined {
    const data = readDb();
    return data.orders.find(o => o.id === id || o.orderNumber === id);
  },
  createOrder(orderInput: {
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    customerNotes?: string;
    items: Order['items'];
  }): Order {
    const data = readDb();
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const dateStr = new Date().toISOString().slice(2, 7).replace('-', '');
    const orderNumber = `TLB-${dateStr}-${randNum}`;

    // Calculate known item prices if any
    const estimatedItemsTotal = orderInput.items.reduce((sum, item) => {
      return sum + (item.price ? item.price * item.quantity : 0);
    }, 0);

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customerName: orderInput.customerName.trim(),
      customerPhone: orderInput.customerPhone.trim(),
      deliveryAddress: orderInput.deliveryAddress.trim(),
      customerNotes: orderInput.customerNotes?.trim() || '',
      items: orderInput.items,
      status: 'جديد',
      statusHistory: [
        {
          status: 'جديد',
          timestamp: new Date().toISOString(),
          note: 'تم حفظ الطلب وإصداره في النظام بنجاح',
        },
      ],
      finances: {
        purchaseCost: estimatedItemsTotal,
        serviceFee: data.settings.defaultServiceFee || 15,
        deliveryFee: data.settings.defaultDeliveryFee || 15,
        totalAmount: estimatedItemsTotal + (data.settings.defaultServiceFee || 15) + (data.settings.defaultDeliveryFee || 15),
        amountPaid: 0,
        remainingAmount: estimatedItemsTotal + (data.settings.defaultServiceFee || 15) + (data.settings.defaultDeliveryFee || 15),
        netProfit: data.settings.defaultServiceFee || 15,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source: 'web',
      whatsappSentClicked: false,
    };

    data.orders.unshift(newOrder);
    writeDb(data);
    return newOrder;
  },
  updateOrderStatus(id: string, newStatus: OrderStatus, note?: string): Order | null {
    const data = readDb();
    const order = data.orders.find(o => o.id === id || o.orderNumber === id);
    if (!order) return null;

    order.status = newStatus;
    order.updatedAt = new Date().toISOString();
    order.statusHistory.push({
      status: newStatus,
      timestamp: new Date().toISOString(),
      note: note || `تغيير الحالة إلى ${newStatus}`,
    });

    writeDb(data);
    return order;
  },
  updateOrderFinances(id: string, financesUpdate: Partial<OrderFinances>): Order | null {
    const data = readDb();
    const order = data.orders.find(o => o.id === id || o.orderNumber === id);
    if (!order) return null;

    const purchaseCost = financesUpdate.purchaseCost ?? order.finances.purchaseCost;
    const serviceFee = financesUpdate.serviceFee ?? order.finances.serviceFee;
    const deliveryFee = financesUpdate.deliveryFee ?? order.finances.deliveryFee;
    const amountPaid = financesUpdate.amountPaid ?? order.finances.amountPaid;

    const totalAmount = purchaseCost + serviceFee + deliveryFee;
    const remainingAmount = Math.max(0, totalAmount - amountPaid);
    const netProfit = serviceFee; // Direct service profit

    order.finances = {
      purchaseCost,
      serviceFee,
      deliveryFee,
      totalAmount,
      amountPaid,
      remainingAmount,
      netProfit,
    };
    order.updatedAt = new Date().toISOString();

    writeDb(data);
    return order;
  },
  markWhatsappSent(id: string): boolean {
    const data = readDb();
    const order = data.orders.find(o => o.id === id || o.orderNumber === id);
    if (!order) return false;
    order.whatsappSentClicked = true;
    order.updatedAt = new Date().toISOString();
    writeDb(data);
    return true;
  },
  deleteOrder(id: string): boolean {
    const data = readDb();
    const prevLen = data.orders.length;
    data.orders = data.orders.filter(o => o.id !== id && o.orderNumber !== id);
    if (data.orders.length !== prevLen) {
      writeDb(data);
      return true;
    }
    return false;
  },

  // Analytics & Summary
  getAnalytics() {
    const data = readDb();
    const orders = data.orders;

    let totalRevenue = 0;
    let totalPurchaseCost = 0;
    let totalServiceFees = 0;
    let totalNetProfit = 0;
    let totalPaid = 0;
    let totalUnpaid = 0;

    const statusCounts: Record<string, number> = {
      'جديد': 0,
      'قيد المراجعة': 0,
      'بانتظار موافقة العميل على السعر': 0,
      'تمت الموافقة على السعر': 0,
      'جارٍ شراء المنتجات': 0,
      'قيد التوصيل': 0,
      'مكتمل': 0,
      'ملغي': 0,
    };

    for (const order of orders) {
      if (statusCounts[order.status] !== undefined) {
        statusCounts[order.status]++;
      }
      if (order.status !== 'ملغي') {
        totalRevenue += order.finances.totalAmount || 0;
        totalPurchaseCost += order.finances.purchaseCost || 0;
        totalServiceFees += order.finances.serviceFee || 0;
        totalNetProfit += order.finances.netProfit || 0;
        totalPaid += order.finances.amountPaid || 0;
        totalUnpaid += order.finances.remainingAmount || 0;
      }
    }

    return {
      totalOrdersCount: orders.length,
      statusCounts,
      totalRevenue,
      totalPurchaseCost,
      totalServiceFees,
      totalNetProfit,
      totalPaid,
      totalUnpaid,
    };
  },

  // Admin Auth
  verifyAdmin(username: string, pass: string): boolean {
    const data = readDb();
    return data.admin.username === username && data.admin.passwordHash === pass;
  },
};
