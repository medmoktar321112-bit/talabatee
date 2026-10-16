export type CategoryType = 'food' | 'medicine' | 'clothes' | 'other';

export type OrderStatus =
  | 'جديد'
  | 'قيد المراجعة'
  | 'بانتظار موافقة العميل على السعر'
  | 'تمت الموافقة على السعر'
  | 'جارٍ شراء المنتجات'
  | 'قيد التوصيل'
  | 'مكتمل'
  | 'ملغي';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number | null; // null means "السعر يُحدّد عند تأكيد الطلب"
  image: string;
  category: 'food';
  isAvailable: boolean;
}

export interface OrderItem {
  id: string;
  category: CategoryType;
  categoryNameArabic: string;
  title: string;
  description?: string;
  quantity: number;
  price?: number | null;
  notes?: string;
  image?: string;
  
  // Medicine specific
  prescriptionImage?: string;
  
  // Clothes specific
  size?: string;
  color?: string;
  budget?: string;
  
  // Other orders specific
  estimatedBudget?: string;
}

export interface OrderFinances {
  purchaseCost: number;     // تكلفة شراء المنتجات
  serviceFee: number;       // رسوم الخدمة
  deliveryFee: number;      // رسوم التوصيل
  totalAmount: number;      // إجمالي المبلغ المستحق على العميل (تكلفة + خدمة + توصيل)
  amountPaid: number;       // المبلغ المدفوع من العميل
  remainingAmount: number;  // المبلغ المتبقي على العميل
  netProfit: number;        // صافي الربح
}

export interface Order {
  id: string;
  orderNumber: string;      // e.g., TLB-2610-8492
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  customerNotes?: string;
  items: OrderItem[];
  status: OrderStatus;
  statusHistory: {
    status: OrderStatus;
    timestamp: string;
    note?: string;
  }[];
  finances: OrderFinances;
  createdAt: string;
  updatedAt: string;
  source: 'web';
  whatsappSentClicked?: boolean;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  whatsappNumber: string;   // Leaves blank if not set
  currency: string;
  defaultServiceFee: number;
  defaultDeliveryFee: number;
  contactNotes: string;
}

export interface AdminUser {
  username: string;
  name: string;
  role: 'admin';
}
