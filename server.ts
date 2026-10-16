import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './server/db.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// High body limit for image attachments (recipes, clothes photos)
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Serve uploaded files securely
const uploadsDir = path.resolve(__dirname, 'data', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Simple in-memory session token store for admin
const adminTokens = new Set<string>();

const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'غير مصرّح: يرجى تسجيل الدخول كمسؤول' });
  }
  const token = authHeader.replace(/^Bearer\s+/, '').trim();
  if (!adminTokens.has(token)) {
    return res.status(401).json({ error: 'جلسة الإدارة منتهية أو غير صحيحة' });
  }
  next();
};

// Download Project ZIP Route
app.get('/api/download-zip', (req: Request, res: Response) => {
  const zipPath = path.resolve(__dirname, 'talabatee-project.zip');
  if (fs.existsSync(zipPath)) {
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="talabatee-project.zip"');
    return res.download(zipPath, 'talabatee-project.zip');
  }
  return res.status(404).json({ error: 'ملف ZIP غير متوفر حالياً' });
});

// 1. Settings
app.get('/api/settings', (req: Request, res: Response) => {
  try {
    const settings = db.getSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'فشل في جلب الإعدادات' });
  }
});

app.put('/api/settings', requireAdmin, (req: Request, res: Response) => {
  try {
    const updated = db.updateSettings(req.body);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'فشل في تحديث الإعدادات' });
  }
});

// 2. Products
app.get('/api/products', (req: Request, res: Response) => {
  try {
    const products = db.getProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'فشل في جلب المنتجات' });
  }
});

app.post('/api/products', requireAdmin, (req: Request, res: Response) => {
  try {
    const { name, description, price, image, category, isAvailable } = req.body;
    if (!name || !image) {
      return res.status(400).json({ error: 'اسم المنتج والصورة مطلوبان' });
    }
    const newProduct = db.addProduct({
      name,
      description: description || '',
      price: price !== undefined && price !== '' ? Number(price) : null,
      image,
      category: category || 'food',
      isAvailable: isAvailable ?? true,
    });
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: 'فشل في إضافة المنتج' });
  }
});

app.put('/api/products/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = db.updateProduct(id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'المنتج غير موجود' });
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'فشل في تحديث المنتج' });
  }
});

app.delete('/api/products/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = db.deleteProduct(id);
    if (!deleted) {
      return res.status(404).json({ error: 'المنتج غير موجود' });
    }
    res.json({ success: true, message: 'تم حذف المنتج بنجاح' });
  } catch (error) {
    res.status(500).json({ error: 'فشل في حذف المنتج' });
  }
});

// 3. Orders
app.get('/api/orders', requireAdmin, (req: Request, res: Response) => {
  try {
    const { status, search, startDate, endDate } = req.query;
    const orders = db.getOrders({
      status: status as string,
      search: search as string,
      startDate: startDate as string,
      endDate: endDate as string,
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'فشل في جلب الطلبات' });
  }
});

app.get('/api/orders/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = db.getOrderById(id);
    if (!order) {
      return res.status(404).json({ error: 'الطلب غير موجود' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'فشل في جلب تفاصيل الطلب' });
  }
});

app.post('/api/orders', (req: Request, res: Response) => {
  try {
    const { customerName, customerPhone, deliveryAddress, customerNotes, items } = req.body;

    if (!customerName || !customerPhone || !deliveryAddress) {
      return res.status(400).json({ error: 'يرجى ملء جميع الحقول المطلوبة (الاسم، الهاتف، العنوان)' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'السلة فارغة، يرجى إضافة عناصر للطلب' });
    }

    const order = db.createOrder({
      customerName,
      customerPhone,
      deliveryAddress,
      customerNotes,
      items,
    });

    res.status(201).json({
      success: true,
      message: 'تم تسجيل الطلب بنجاح في النظام',
      order,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء حفظ الطلب' });
  }
});

app.patch('/api/orders/:id/status', requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'حالة الطلب مطلوبة' });
    }
    const updated = db.updateOrderStatus(id, status, note);
    if (!updated) {
      return res.status(404).json({ error: 'الطلب غير موجود' });
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'فشل في تحديث حالة الطلب' });
  }
});

app.patch('/api/orders/:id/finances', requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const finances = req.body;
    const updated = db.updateOrderFinances(id, finances);
    if (!updated) {
      return res.status(404).json({ error: 'الطلب غير موجود' });
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'فشل في تحديث الحسابات المالية للطلب' });
  }
});

app.post('/api/orders/:id/whatsapp-sent', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    db.markWhatsappSent(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'فشل في تحديث حالة إرسال واتساب' });
  }
});

app.delete('/api/orders/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = db.deleteOrder(id);
    if (!deleted) {
      return res.status(404).json({ error: 'الطلب غير موجود' });
    }
    res.json({ success: true, message: 'تم حذف الطلب' });
  } catch (error) {
    res.status(500).json({ error: 'فشل في حذف الطلب' });
  }
});

// 4. Analytics
app.get('/api/analytics', requireAdmin, (req: Request, res: Response) => {
  try {
    const analytics = db.getAnalytics();
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: 'فشل في جلب التقارير المالية' });
  }
});

// 5. Image Upload (handles base64 images from client file input safely)
app.post('/api/upload', (req: Request, res: Response) => {
  try {
    const { dataUrl, filename } = req.body;
    if (!dataUrl || typeof dataUrl !== 'string') {
      return res.status(400).json({ error: 'بيانات الصورة غير صالحة' });
    }

    // Match data:image/...;base64,
    const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'صيغة الصورة غير مدعومة' });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(mimeType.toLowerCase())) {
      return res.status(400).json({ error: 'نوع الملف غير مسموح به (JPG, PNG, WEBP فقط)' });
    }

    // Limit size ~10MB
    const buffer = Buffer.from(base64Data, 'base64');
    if (buffer.length > 10 * 1024 * 1024) {
      return res.status(400).json({ error: 'حجم الصورة كبير جدًا (الحد الأقصى 10 ميغابايت)' });
    }

    const ext = mimeType.split('/')[1] || 'png';
    const safeName = `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const filePath = path.join(uploadsDir, safeName);

    fs.writeFileSync(filePath, buffer);

    const fileUrl = `/uploads/${safeName}`;
    res.json({
      success: true,
      url: fileUrl,
      size: buffer.length,
      mimeType,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء حفظ الصورة' });
  }
});

// 6. Admin Authentication
app.post('/api/admin/login', (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'اسم المستخدم وكلمة المرور مطلوبان' });
    }

    const isValid = db.verifyAdmin(username.trim(), password);
    if (!isValid) {
      return res.status(401).json({ error: 'بيانات الدخول غير صحيحة' });
    }

    const token = `adm_token_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    adminTokens.add(token);

    res.json({
      success: true,
      token,
      admin: {
        username: 'admin',
        name: 'مدير طلباتي',
        role: 'admin',
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'فشل في تسجيل الدخول' });
  }
});

app.get('/api/admin/verify', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ authenticated: false });
  }
  const token = authHeader.replace(/^Bearer\s+/, '').trim();
  if (adminTokens.has(token)) {
    return res.json({ authenticated: true, user: { username: 'admin', name: 'مدير طلباتي' } });
  }
  return res.status(401).json({ authenticated: false });
});

// --- VITE DEV OR PROD MIDDLEWARE ---
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 خادم تطبيق «طلباتي» يعمل بنجاح على http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
