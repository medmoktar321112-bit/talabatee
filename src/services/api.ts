import { Product, StoreSettings, Order, OrderStatus, OrderFinances } from '../types';
import { INITIAL_PRODUCTS, INITIAL_SETTINGS } from '../data/initialData';

const BASE_URL = '';

export async function fetchSettings(): Promise<StoreSettings> {
  try {
    const res = await fetch(`${BASE_URL}/api/settings`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Using fallback settings:', err);
  }
  return INITIAL_SETTINGS;
}

export async function updateSettings(settings: Partial<StoreSettings>, token: string): Promise<StoreSettings> {
  const res = await fetch(`${BASE_URL}/api/settings`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(settings),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'فشل تحديث الإعدادات');
  }
  return await res.json();
}

export async function fetchProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/products`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Using fallback products:', err);
  }
  return INITIAL_PRODUCTS;
}

export async function createProduct(product: Omit<Product, 'id'>, token: string): Promise<Product> {
  const res = await fetch(`${BASE_URL}/api/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(product),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'فشل إضافة المنتج');
  }
  return await res.json();
}

export async function updateProduct(id: string, updates: Partial<Product>, token: string): Promise<Product> {
  const res = await fetch(`${BASE_URL}/api/products/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'فشل تحديث المنتج');
  }
  return await res.json();
}

export async function deleteProduct(id: string, token: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/products/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'فشل حذف المنتج');
  }
}

export async function createOrder(orderInput: {
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  customerNotes?: string;
  items: Order['items'];
}): Promise<Order> {
  const res = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderInput),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'فشل تسجيل الطلب في النظام');
  }
  const result = await res.json();
  return result.order;
}

export async function fetchOrders(
  filters: { status?: string; search?: string; startDate?: string; endDate?: string },
  token: string
): Promise<Order[]> {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.search) params.append('search', filters.search);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);

  const res = await fetch(`${BASE_URL}/api/orders?${params.toString()}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    throw new Error('فشل جلب الطلبات');
  }
  return await res.json();
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  note: string,
  token: string
): Promise<Order> {
  const res = await fetch(`${BASE_URL}/api/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ status, note }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'فشل تحديث حالة الطلب');
  }
  return await res.json();
}

export async function updateOrderFinances(
  orderId: string,
  finances: Partial<OrderFinances>,
  token: string
): Promise<Order> {
  const res = await fetch(`${BASE_URL}/api/orders/${orderId}/finances`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(finances),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'فشل تحديث ماليات الطلب');
  }
  return await res.json();
}

export async function markWhatsappSent(orderId: string): Promise<void> {
  try {
    await fetch(`${BASE_URL}/api/orders/${orderId}/whatsapp-sent`, {
      method: 'POST',
    });
  } catch (err) {
    console.error('Failed to mark whatsapp sent', err);
  }
}

export async function deleteOrder(orderId: string, token: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/orders/${orderId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'فشل حذف الطلب');
  }
}

export async function fetchAnalytics(token: string) {
  const res = await fetch(`${BASE_URL}/api/analytics`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    throw new Error('فشل جلب الإحصائيات');
  }
  return await res.json();
}

export async function adminLogin(username: string, pass: string): Promise<{ token: string; user: any }> {
  const res = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password: pass }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'اسم المستخدم أو كلمة المرور غير صحيحة');
  }
  const data = await res.json();
  return { token: data.token, user: data.admin };
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/api/admin/verify`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Upload file to server or convert to safe compressed Data URL
export async function uploadImageFile(file: File): Promise<string> {
  // Validate file type
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowed.includes(file.type)) {
    throw new Error('نوع الصورة غير مدعوم. يرجى اختيار ملف صورة بتنسيق JPG أو PNG أو WEBP');
  }

  // Validate size (max 8MB)
  if (file.size > 8 * 1024 * 1024) {
    throw new Error('حجم الصورة كبير جدًا. الحد الأقصى المسموح هو 8 ميغابايت');
  }

  // Convert to base64
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('فشل قراءة ملف الصورة'));
    reader.readAsDataURL(file);
  });

  try {
    // Attempt uploading to backend
    const res = await fetch(`${BASE_URL}/api/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataUrl, filename: file.name }),
    });

    if (res.ok) {
      const data = await res.json();
      return data.url;
    }
  } catch (err) {
    console.warn('Backend upload failed, utilizing data URL fallback:', err);
  }

  // Safe fallback to dataUrl
  return dataUrl;
}
