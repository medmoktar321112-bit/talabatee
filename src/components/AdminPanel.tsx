import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Package,
  DollarSign,
  Settings as SettingsIcon,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  LogOut,
  Save,
  MessageCircle,
  AlertCircle,
  TrendingUp,
  CreditCard,
  Phone,
  MapPin,
  Calendar,
  X,
  Upload,
} from 'lucide-react';
import { Order, OrderStatus, Product, StoreSettings, OrderFinances } from '../types';
import {
  fetchOrders,
  fetchProducts,
  updateOrderStatus,
  updateOrderFinances,
  deleteOrder,
  createProduct,
  updateProduct,
  deleteProduct,
  updateSettings,
  fetchAnalytics,
  uploadImageFile,
  adminLogin,
} from '../services/api';
import { formatWhatsAppUrl, displayPhoneNumber } from '../utils/whatsapp';

const ALL_STATUSES: OrderStatus[] = [
  'جديد',
  'قيد المراجعة',
  'بانتظار موافقة العميل على السعر',
  'تمت الموافقة على السعر',
  'جارٍ شراء المنتجات',
  'قيد التوصيل',
  'مكتمل',
  'ملغي',
];

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  adminToken: string | null;
  setAdminToken: (token: string | null) => void;
  settings: StoreSettings;
  onSettingsUpdated: (newSettings: StoreSettings) => void;
  onProductsUpdated: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  adminToken,
  setAdminToken,
  settings,
  onSettingsUpdated,
  onProductsUpdated,
}) => {
  // Login form state
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active admin tab
  const [adminTab, setAdminTab] = useState<'orders' | 'products' | 'analytics' | 'settings'>('orders');

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Order Details Modal / Finances Form
  const [editStatus, setEditStatus] = useState<OrderStatus>('جديد');
  const [statusNote, setStatusNote] = useState('');
  const [purchaseCost, setPurchaseCost] = useState<number>(0);
  const [serviceFee, setServiceFee] = useState<number>(0);
  const [deliveryFee, setDeliveryFee] = useState<number>(0);
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [isSavingFinances, setIsSavingFinances] = useState(false);

  // Products Management State
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: 'food' as const,
    isAvailable: true,
  });

  // Settings Form State
  const [settingsForm, setSettingsForm] = useState<StoreSettings>(settings);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Analytics State
  const [analytics, setAnalytics] = useState<any>(null);

  // Image Preview Modal
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Synchronize settings
  useEffect(() => {
    setSettingsForm(settings);
  }, [settings]);

  // Load data when logged in
  useEffect(() => {
    if (adminToken && isOpen) {
      loadOrders();
      loadProducts();
      loadAnalytics();
    }
  }, [adminToken, isOpen, statusFilter, searchQuery, dateFilter]);

  const loadOrders = async () => {
    if (!adminToken) return;
    setIsLoadingOrders(true);
    try {
      const data = await fetchOrders(
        {
          status: statusFilter,
          search: searchQuery,
          startDate: dateFilter,
        },
        adminToken
      );
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (err) {
      console.error('Failed to load products', err);
    }
  };

  const loadAnalytics = async () => {
    if (!adminToken) return;
    try {
      const data = await fetchAnalytics(adminToken);
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load analytics', err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);
    try {
      const { token } = await adminLogin(username, password);
      setAdminToken(token);
    } catch (err: any) {
      setLoginError(err.message || 'بيانات الدخول غير صحيحة');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setAdminToken(null);
    setSelectedOrder(null);
  };

  // Open Order Modal and populate finance state
  const handleOpenOrder = (order: Order) => {
    setSelectedOrder(order);
    setEditStatus(order.status);
    setStatusNote('');
    setPurchaseCost(order.finances.purchaseCost || 0);
    setServiceFee(order.finances.serviceFee || 0);
    setDeliveryFee(order.finances.deliveryFee || 0);
    setAmountPaid(order.finances.amountPaid || 0);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !adminToken) return;
    try {
      const updated = await updateOrderStatus(selectedOrder.id, editStatus, statusNote, adminToken);
      setSelectedOrder(updated);
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      loadAnalytics();
    } catch (err: any) {
      alert(err.message || 'فشل تحديث الحالة');
    }
  };

  const handleSaveFinances = async () => {
    if (!selectedOrder || !adminToken) return;
    setIsSavingFinances(true);
    try {
      const updated = await updateOrderFinances(
        selectedOrder.id,
        {
          purchaseCost: Number(purchaseCost) || 0,
          serviceFee: Number(serviceFee) || 0,
          deliveryFee: Number(deliveryFee) || 0,
          amountPaid: Number(amountPaid) || 0,
        },
        adminToken
      );
      setSelectedOrder(updated);
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      loadAnalytics();
      alert('تم حفظ الحسابات المالية للطلب وتحديث صافي الربح بنجاح');
    } catch (err: any) {
      alert(err.message || 'فشل حفظ الماليات');
    } finally {
      setIsSavingFinances(false);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!adminToken) return;
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذا الطلب نهائيًا من قاعدة البيانات؟')) return;
    try {
      await deleteOrder(orderId, adminToken);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      if (selectedOrder?.id === orderId) setSelectedOrder(null);
      loadAnalytics();
    } catch (err: any) {
      alert(err.message || 'فشل حذف الطلب');
    }
  };

  // Product Actions
  const handleSaveNewProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken) return;
    try {
      await createProduct(
        {
          name: productForm.name,
          description: productForm.description,
          price: productForm.price ? parseFloat(productForm.price) : null,
          image: productForm.image || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
          category: 'food',
          isAvailable: productForm.isAvailable,
        },
        adminToken
      );
      setIsNewProductModalOpen(false);
      setProductForm({
        name: '',
        description: '',
        price: '',
        image: '',
        category: 'food',
        isAvailable: true,
      });
      loadProducts();
      onProductsUpdated();
    } catch (err: any) {
      alert(err.message || 'فشل إضافة الوجبة');
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !adminToken) return;
    try {
      await updateProduct(
        editingProduct.id,
        {
          name: editingProduct.name,
          description: editingProduct.description,
          price: editingProduct.price !== null ? Number(editingProduct.price) : null,
          image: editingProduct.image,
          isAvailable: editingProduct.isAvailable,
        },
        adminToken
      );
      setEditingProduct(null);
      loadProducts();
      onProductsUpdated();
    } catch (err: any) {
      alert(err.message || 'فشل تحديث الوجبة');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!adminToken) return;
    if (!window.confirm('هل أنت متأكد من حذف هذه الوجبة؟')) return;
    try {
      await deleteProduct(productId, adminToken);
      loadProducts();
      onProductsUpdated();
    } catch (err: any) {
      alert(err.message || 'فشل حذف الوجبة');
    }
  };

  // Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken) return;
    setIsSavingSettings(true);
    try {
      const updated = await updateSettings(settingsForm, adminToken);
      onSettingsUpdated(updated);
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'فشل حفظ الإعدادات');
    } finally {
      setIsSavingSettings(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen min-h-screen bg-stone-100 flex flex-col overflow-hidden animate-fade-in select-text">
      <div className="bg-[#FAF8F5] w-full h-full flex flex-col overflow-hidden">
        
        {/* Top Bar - Full Width Header */}
        <div className="bg-stone-900 text-white px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-md shrink-0 border-b border-stone-800">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-xl font-black tracking-tight text-white">لوحة تحكم «طلباتي»</h3>
                <span className="text-[10px] sm:text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
                  شاشة كاملة
                </span>
                <span className="text-[10px] sm:text-xs bg-stone-800 text-stone-300 border border-stone-700 px-2.5 py-0.5 rounded-full font-bold hidden sm:inline-flex items-center gap-1">
                  <span>العملة:</span>
                  <strong className="text-amber-400 font-black">{settings.currency || 'أوقية'}</strong>
                </span>
                <span className="text-[10px] sm:text-xs bg-stone-800 text-stone-300 border border-stone-700 px-2.5 py-0.5 rounded-full font-bold hidden sm:inline-flex items-center gap-1">
                  <span>واتساب:</span>
                  <strong className="text-emerald-400 font-mono font-black" dir="ltr">{settings.whatsappNumber || '42481202'}</strong>
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-stone-400 mt-0.5">
                إدارة الطلبات، الأسعار، المنتجات، التكاليف، والأرباح بالعملة الرسمية (الأوقية)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {adminToken && (
              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                title="تسجيل الخروج"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">تسجيل الخروج</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-3 sm:px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
              title="العودة إلى المتجر وإغلاق لوحة الإدارة"
            >
              <X className="w-4 h-4" />
              <span>العودة للمتجر</span>
            </button>
          </div>
        </div>

        {/* Content area: Login Screen OR Dashboard */}
        {!adminToken ? (
          /* LOGIN SCREEN */
          <div className="flex-1 flex items-center justify-center p-6 bg-stone-50">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-md max-w-md w-full space-y-6">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-black text-stone-900">تسجيل دخول المسؤول</h4>
                <p className="text-xs text-stone-700">
                  لوحة التحكم محمية لمنع وصول العملاء وتأمين بيانات الطلبات والوصفات الطبية
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">اسم المستخدم</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-emerald-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">كلمة المرور</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-emerald-500 outline-hidden"
                  />
                </div>

                {loginError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-[11px] text-emerald-800 space-y-0.5">
                  <span className="font-bold">بيانات الدخول التجريبية الافتراضية:</span>
                  <p>اسم المستخدم: <code className="font-mono bg-white px-1 rounded">admin</code> | كلمة المرور: <code className="font-mono bg-white px-1 rounded">admin123</code></p>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-md transition-all active:scale-98 disabled:opacity-50"
                >
                  {isLoggingIn ? 'جارٍ التحقق...' : 'دخول إلى لوحة الإدارة'}
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* AUTHENTICATED ADMIN DASHBOARD */
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Admin Tabs */}
            <div className="bg-stone-100 border-b border-stone-200 px-4 sm:px-6 flex items-center gap-2 sm:gap-4 overflow-x-auto">
              <button
                type="button"
                onClick={() => setAdminTab('orders')}
                className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  adminTab === 'orders'
                    ? 'border-emerald-600 text-emerald-700 font-black'
                    : 'border-transparent text-stone-700 hover:text-stone-900'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>إدارة الطلبات ({orders.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setAdminTab('products')}
                className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  adminTab === 'products'
                    ? 'border-emerald-600 text-emerald-700 font-black'
                    : 'border-transparent text-stone-700 hover:text-stone-900'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>الوجبات والمنتجات ({products.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAdminTab('analytics');
                  loadAnalytics();
                }}
                className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  adminTab === 'analytics'
                    ? 'border-emerald-600 text-emerald-700 font-black'
                    : 'border-transparent text-stone-700 hover:text-stone-900'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                <span>الملخص المالي والأرباح</span>
              </button>

              <button
                type="button"
                onClick={() => setAdminTab('settings')}
                className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  adminTab === 'settings'
                    ? 'border-emerald-600 text-emerald-700 font-black'
                    : 'border-transparent text-stone-700 hover:text-stone-900'
                }`}
              >
                <SettingsIcon className="w-4 h-4" />
                <span>إعدادات الموقع وواتساب</span>
              </button>
            </div>

            {/* TAB CONTENTS */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#FAF8F5]">
              <div className="max-w-7xl mx-auto w-full">

              {/* TAB 1: ORDERS MANAGEMENT */}
              {adminTab === 'orders' && (
                <div className="space-y-4">
                  {/* Filter Toolbar */}
                  <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
                    <div className="flex-1 w-full md:w-auto flex items-center gap-2">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 text-stone-700 absolute right-3 top-3" />
                        <input
                          type="text"
                          placeholder="ابحث بالاسم، الهاتف، أو رقم الطلب..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full text-xs sm:text-sm pr-9 pl-3 py-2 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-emerald-500 outline-hidden"
                        />
                      </div>
                    </div>

                    <div className="w-full md:w-auto flex flex-wrap items-center gap-2">
                      {/* Status Filter */}
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="text-xs px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-emerald-500 outline-hidden font-bold"
                      >
                        <option value="all">كل الحالات</option>
                        {ALL_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>

                      {/* Date Filter */}
                      <input
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="text-xs px-2.5 py-2 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-emerald-500 outline-hidden"
                      />

                      <button
                        onClick={loadOrders}
                        className="px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors shadow-xs"
                      >
                        تحديث
                      </button>
                    </div>
                  </div>

                  {/* Orders List / Cards */}
                  {isLoadingOrders ? (
                    <div className="py-12 text-center text-stone-700 font-bold">
                      <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <span>جارٍ تحميل الطلبات من الخادم...</span>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-stone-200 text-stone-700">
                      <Package className="w-10 h-10 mx-auto text-stone-300 mb-2" />
                      <p className="font-bold">لا توجد طلبات تطابق الفلتر الحالي</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orders.map((ord) => {
                        const statusColors: Record<OrderStatus, string> = {
                          'جديد': 'bg-blue-100 text-blue-800 border-blue-200',
                          'قيد المراجعة': 'bg-purple-100 text-purple-800 border-purple-200',
                          'بانتظار موافقة العميل على السعر': 'bg-amber-100 text-amber-800 border-amber-200',
                          'تمت الموافقة على السعر': 'bg-teal-100 text-teal-800 border-teal-200',
                          'جارٍ شراء المنتجات': 'bg-indigo-100 text-indigo-800 border-indigo-200',
                          'قيد التوصيل': 'bg-orange-100 text-orange-800 border-orange-200',
                          'مكتمل': 'bg-emerald-100 text-emerald-800 border-emerald-200',
                          'ملغي': 'bg-red-100 text-red-800 border-red-200',
                        };

                        return (
                          <div
                            key={ord.id}
                            className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs hover:border-emerald-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                          >
                            <div className="flex-1 space-y-1.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono font-black text-sm text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                                  #{ord.orderNumber}
                                </span>
                                <span
                                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                                    statusColors[ord.status] || 'bg-stone-100 text-stone-800'
                                  }`}
                                >
                                  {ord.status}
                                </span>
                                <span className="text-xs text-stone-700 flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>{new Date(ord.createdAt).toLocaleString('ar-SA')}</span>
                                </span>
                              </div>

                              <div className="flex items-center gap-4 text-xs font-bold text-stone-800 flex-wrap">
                                <span>العميل: {ord.customerName}</span>
                                <span dir="ltr">📞 {ord.customerPhone}</span>
                                <span className="text-stone-700">العنوان: {ord.deliveryAddress}</span>
                              </div>

                              <p className="text-xs text-stone-700 line-clamp-1">
                                المنتجات ({ord.items.length}): {ord.items.map((i) => `${i.title} (${i.quantity})`).join('، ')}
                              </p>
                            </div>

                            {/* Financial Mini Badge & Actions */}
                            <div className="flex items-center gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-stone-100">
                              <div className="text-left md:text-right bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200">
                                <div className="text-[10px] text-stone-700">المجموع المستحق</div>
                                <div className="text-sm font-black text-stone-900">
                                  {ord.finances.totalAmount} {settings.currency}
                                </div>
                                <div className="text-[10px] text-emerald-800 font-bold">
                                  ربح: {ord.finances.netProfit} {settings.currency}
                                </div>
                              </div>

                              <button
                                onClick={() => handleOpenOrder(ord)}
                                className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                              >
                                <Eye className="w-4 h-4" />
                                <span>التفاصيل والحسابات</span>
                              </button>

                              <button
                                onClick={() => handleDeleteOrder(ord.id)}
                                className="p-2 text-stone-700 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                title="حذف الطلب"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: PRODUCTS MANAGEMENT */}
              {adminTab === 'products' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-stone-200">
                    <div>
                      <h4 className="text-base font-black text-stone-900">قائمة وجبات قسم الطعام</h4>
                      <p className="text-xs text-stone-700">يمكنك تعديل الأسعار، الصور المستقلة، أو إضافة وجبات جديدة</p>
                    </div>
                    <button
                      onClick={() => setIsNewProductModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>إضافة وجبة جديدة</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((p) => (
                      <div
                        key={p.id}
                        className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs flex flex-col justify-between"
                      >
                        <div className="relative h-40 bg-stone-100">
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                          <div className="absolute top-2 right-2">
                            {p.price !== null ? (
                              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-800 text-white text-xs font-black shadow-xs">
                                {p.price} {settings.currency}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-lg bg-stone-900/80 text-amber-300 text-[11px] font-bold">
                                السعر عند التأكيد
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                          <div>
                            <h5 className="font-black text-stone-900 text-base">{p.name}</h5>
                            <p className="text-xs text-stone-700 line-clamp-2 mt-1">{p.description}</p>
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                            <button
                              onClick={() => setEditingProduct(p)}
                              className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center gap-1"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>تعديل</span>
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-1.5 text-stone-700 hover:text-red-600 hover:bg-red-50 rounded-lg"
                              title="حذف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: FINANCIAL ANALYTICS & SUMMARY */}
              {adminTab === 'analytics' && (
                <div className="space-y-6">
                  {analytics && (
                    <>
                      {/* High Level Metrics Cards */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
                          <div className="flex items-center justify-between text-emerald-800 mb-2">
                            <span className="text-xs font-bold text-stone-700">صافي الربح المحقق</span>
                            <TrendingUp className="w-5 h-5" />
                          </div>
                          <div className="text-xl sm:text-2xl font-black text-emerald-800">
                            {analytics.totalNetProfit} {settings.currency}
                          </div>
                          <p className="text-[11px] text-stone-700 mt-1">من رسوم الخدمة المعتمدة</p>
                        </div>

                        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
                          <div className="flex items-center justify-between text-blue-700 mb-2">
                            <span className="text-xs font-bold text-stone-700">إجمالي قيمة الفواتير</span>
                            <CreditCard className="w-5 h-5" />
                          </div>
                          <div className="text-xl sm:text-2xl font-black text-stone-900">
                            {analytics.totalRevenue} {settings.currency}
                          </div>
                          <p className="text-[11px] text-stone-700 mt-1">تكلفة + خدمة + توصيل</p>
                        </div>

                        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
                          <div className="flex items-center justify-between text-amber-700 mb-2">
                            <span className="text-xs font-bold text-stone-700">تكلفة شراء المنتجات</span>
                            <DollarSign className="w-5 h-5" />
                          </div>
                          <div className="text-xl sm:text-2xl font-black text-amber-900">
                            {analytics.totalPurchaseCost} {settings.currency}
                          </div>
                          <p className="text-[11px] text-stone-700 mt-1">المدفوعة للمطاعم والصيدليات والمتاجر</p>
                        </div>

                        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
                          <div className="flex items-center justify-between text-purple-700 mb-2">
                            <span className="text-xs font-bold text-stone-700">المتبقي لدى العملاء</span>
                            <Clock className="w-5 h-5" />
                          </div>
                          <div className="text-xl sm:text-2xl font-black text-purple-900">
                            {analytics.totalUnpaid} {settings.currency}
                          </div>
                          <p className="text-[11px] text-stone-700 mt-1">مبالغ بانتظار التحصيل عند التسليم</p>
                        </div>
                      </div>

                      {/* Orders by Status Breakdown */}
                      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs">
                        <h4 className="text-base font-black text-stone-900 mb-4">
                          توزيع الطلبات حسب الحالة (إجمالي {analytics.totalOrdersCount} طلب)
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {ALL_STATUSES.map((st) => (
                            <div key={st} className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                              <span className="text-xs font-bold text-stone-700 block">{st}</span>
                              <span className="text-xl font-black text-stone-900 mt-1 block">
                                {analytics.statusCounts?.[st] || 0}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* TAB 4: SETTINGS & WHATSAPP CONFIGURATION */}
              {adminTab === 'settings' && (
                <div className="max-w-2xl bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-6">
                  <div>
                    <h4 className="text-lg font-black text-stone-900">إعدادات الموقع وتخصيص واتساب</h4>
                    <p className="text-xs text-stone-700">
                      يمكنك تعديل رقم واتساب المخصص لاستقبال الطلبات ورسوم الخدمة والبيانات الرسمية
                    </p>
                  </div>

                  <form onSubmit={handleSaveSettings} className="space-y-4">
                    {/* WhatsApp Number Field - 42481202 */}
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                      <label className="block text-sm font-black text-emerald-900">
                        رقم واتساب المخصص لمشروع «طلباتي»
                      </label>
                      <input
                        type="text"
                        placeholder="مثال: 42481202"
                        value={settingsForm.whatsappNumber}
                        onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                        className="w-full text-sm font-mono font-bold px-4 py-2.5 rounded-xl bg-white border border-emerald-300 focus:border-emerald-600 outline-hidden text-stone-900"
                      />
                      <p className="text-xs text-emerald-800">
                        * رقم الواتساب المعتمد حالياً: <strong className="font-mono text-emerald-950 font-black" dir="ltr">{settingsForm.whatsappNumber || '42481202'}</strong> (يتم ربطه تلقائياً بمفتاح موريتانيا 222 لفتح المحادثة مباشرة).
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">اسم الموقع</label>
                        <input
                          type="text"
                          value={settingsForm.storeName}
                          onChange={(e) => setSettingsForm({ ...settingsForm, storeName: e.target.value })}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-emerald-500 outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">العملة الرسمية</label>
                        <input
                          type="text"
                          placeholder="مثال: أوقية"
                          value={settingsForm.currency}
                          onChange={(e) => setSettingsForm({ ...settingsForm, currency: e.target.value })}
                          className="w-full text-xs sm:text-sm font-bold px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-emerald-500 outline-hidden"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">العبارة التعريفية (الشعار)</label>
                      <input
                        type="text"
                        value={settingsForm.tagline}
                        onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                        className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-emerald-500 outline-hidden"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">رسوم الخدمة الافتراضية</label>
                        <input
                          type="number"
                          value={settingsForm.defaultServiceFee}
                          onChange={(e) =>
                            setSettingsForm({ ...settingsForm, defaultServiceFee: Number(e.target.value) })
                          }
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-emerald-500 outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">رسوم التوصيل الافتراضية</label>
                        <input
                          type="number"
                          value={settingsForm.defaultDeliveryFee}
                          onChange={(e) =>
                            setSettingsForm({ ...settingsForm, defaultDeliveryFee: Number(e.target.value) })
                          }
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-emerald-500 outline-hidden"
                        />
                      </div>
                    </div>

                    {settingsSuccess && (
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 shrink-0" />
                        <span>تم حفظ وتحديث الإعدادات بنجاح!</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSavingSettings}
                      className="w-full py-3.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md transition-all active:scale-98"
                    >
                      {isSavingSettings ? 'جارٍ الحفظ...' : 'حفظ الإعدادات'}
                    </button>
                  </form>
                </div>
              )}

              </div>
            </div>
          </div>
        )}

        {/* ORDER DETAILS & COST/PROFIT CALCULATOR MODAL */}
        {selectedOrder && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
            <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-stone-200 overflow-hidden max-h-[92vh] flex flex-col">
              
              {/* Header */}
              <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                      #{selectedOrder.orderNumber}
                    </span>
                    <span className="text-sm font-bold text-stone-800">تفاصيل الطلب والحسابات</span>
                  </div>
                  <span className="text-[11px] text-stone-700">
                    تاريخ الطلب: {new Date(selectedOrder.createdAt).toLocaleString('ar-SA')}
                  </span>
                </div>

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 text-stone-700 hover:text-stone-900 rounded-xl hover:bg-stone-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
                
                {/* Customer Information Box */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
                  <h5 className="font-black text-stone-900 text-sm">بيانات العميل والتوصيل</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div><span className="font-bold">الاسم:</span> {selectedOrder.customerName}</div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">الهاتف:</span>
                      <span dir="ltr">{selectedOrder.customerPhone}</span>
                      <a
                        href={formatWhatsAppUrl(
                          selectedOrder.customerPhone,
                          `مرحبًا ${selectedOrder.customerName}، نتواصل معك من إدارة «طلباتي» بخصوص طلبك رقم #${selectedOrder.orderNumber}...`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] flex items-center gap-1 transition-colors"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>محادثة واتساب</span>
                      </a>
                    </div>
                    <div className="sm:col-span-2"><span className="font-bold">العنوان:</span> {selectedOrder.deliveryAddress}</div>
                    {selectedOrder.customerNotes && (
                      <div className="sm:col-span-2 text-amber-800 bg-amber-50 p-2 rounded-lg">
                        <span className="font-bold">ملاحظات العميل:</span> {selectedOrder.customerNotes}
                      </div>
                    )}
                  </div>
                </div>

                {/* Ordered Items List & Uploaded Images / Prescriptions */}
                <div className="space-y-3">
                  <h5 className="font-black text-stone-900 text-sm">
                    محتويات الطلب والمرفقات ({selectedOrder.items.length} عنصر)
                  </h5>

                  <div className="space-y-2">
                    {selectedOrder.items.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl bg-white border border-stone-200 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.title}
                              onClick={() => setPreviewImage(item.prescriptionImage || item.image || null)}
                              className="w-12 h-12 object-cover rounded-lg border border-stone-200 cursor-pointer hover:opacity-80"
                              title="اضغط للتكبير"
                            />
                          )}
                          <div>
                            <div className="font-black text-stone-900 text-sm">
                              {item.title} × {item.quantity}
                            </div>
                            <span className="text-stone-700">[{item.categoryNameArabic || item.category}]</span>
                            {item.size && <span className="mr-2">المقاس: {item.size}</span>}
                            {item.color && <span className="mr-2">اللون: {item.color}</span>}
                            {item.notes && <p className="text-amber-800">ملاحظة: {item.notes}</p>}
                          </div>
                        </div>

                        <div className="text-left font-bold text-emerald-800">
                          {item.price ? `${item.price * item.quantity} ${settings.currency}` : 'سعر عند الشراء'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Updater (8 Statuses) */}
                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-3">
                  <h5 className="font-black text-stone-900 text-sm">تحديث حالة الطلب</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">الحالة الحالية</label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value as OrderStatus)}
                        className="w-full text-xs font-bold px-3 py-2 rounded-xl bg-white border border-blue-300"
                      >
                        {ALL_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">ملاحظة التحديث</label>
                      <input
                        type="text"
                        placeholder="سبب التغيير أو توضيح للعميل..."
                        value={statusNote}
                        onChange={(e) => setStatusNote(e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-blue-300"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleUpdateStatus}
                    className="py-2 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs"
                  >
                    حفظ تغيير الحالة
                  </button>
                </div>

                {/* COST & NET PROFIT CALCULATOR (Requirement 13) */}
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-black text-emerald-950 text-base">حساب التكلفة والربح للطلب</h5>
                      <p className="text-xs text-emerald-800">
                        سجّل تكلفة شراء المواد الفعلية ورسوم الخدمة والتوصيل لحساب صافي الربح بدقة
                      </p>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-200 text-emerald-900">
                      حاسبة الأرباح
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        تكلفة شراء المنتجات ({settings.currency})
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={purchaseCost}
                        onChange={(e) => setPurchaseCost(Number(e.target.value))}
                        className="w-full text-sm font-bold px-3 py-2 rounded-xl bg-white border border-stone-300"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        رسوم الخدمة ({settings.currency})
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={serviceFee}
                        onChange={(e) => setServiceFee(Number(e.target.value))}
                        className="w-full text-sm font-bold px-3 py-2 rounded-xl bg-white border border-stone-300"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        رسوم التوصيل ({settings.currency})
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={deliveryFee}
                        onChange={(e) => setDeliveryFee(Number(e.target.value))}
                        className="w-full text-sm font-bold px-3 py-2 rounded-xl bg-white border border-stone-300"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        المبلغ المدفوع من العميل ({settings.currency})
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={amountPaid}
                        onChange={(e) => setAmountPaid(Number(e.target.value))}
                        className="w-full text-sm font-bold px-3 py-2 rounded-xl bg-white border border-stone-300"
                      />
                    </div>
                  </div>

                  {/* Real-time Summary Card */}
                  {(() => {
                    const totalReq = (Number(purchaseCost) || 0) + (Number(serviceFee) || 0) + (Number(deliveryFee) || 0);
                    const remaining = Math.max(0, totalReq - (Number(amountPaid) || 0));
                    const profit = Number(serviceFee) || 0;

                    return (
                      <div className="bg-white p-4 rounded-xl border border-emerald-300 grid grid-cols-3 gap-2 text-center">
                        <div>
                          <span className="text-[11px] text-stone-700 block">إجمالي المستحق على العميل</span>
                          <span className="text-base font-black text-stone-900">{totalReq} {settings.currency}</span>
                        </div>
                        <div>
                          <span className="text-[11px] text-stone-700 block">المبلغ المتبقي</span>
                          <span className="text-base font-black text-red-600">{remaining} {settings.currency}</span>
                        </div>
                        <div>
                          <span className="text-[11px] text-emerald-800 font-bold block">صافي الربح الفعلي</span>
                          <span className="text-base font-black text-emerald-800">{profit} {settings.currency}</span>
                        </div>
                      </div>
                    );
                  })()}

                  <button
                    onClick={handleSaveFinances}
                    disabled={isSavingFinances}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Save className="w-4 h-4" />
                    <span>حفظ الحسابات وتحديث صافي الربح للطلب</span>
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* EDIT PRODUCT MODAL */}
        {editingProduct && (
          <div className="fixed inset-0 z-70 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h4 className="font-black text-stone-900">تعديل الوجبة «{editingProduct.name}»</h4>
                <button onClick={() => setEditingProduct(null)} className="p-1 text-stone-700 hover:text-stone-900">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateProduct} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">اسم الوجبة</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-stone-50 border border-stone-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">الوصف</label>
                  <textarea
                    rows={2}
                    value={editingProduct.description}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-stone-50 border border-stone-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    السعر ({settings.currency}) - اتركه فارغًا إذا كان يُحدد عند الطلب
                  </label>
                  <input
                    type="number"
                    value={editingProduct.price !== null ? editingProduct.price : ''}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        price: e.target.value === '' ? null : Number(e.target.value),
                      })
                    }
                    className="w-full text-xs px-3 py-2 rounded-xl bg-stone-50 border border-stone-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">رابط الصورة المستقلة</label>
                  <input
                    type="text"
                    value={editingProduct.image}
                    onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-stone-50 border border-stone-200"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isAvailable"
                    checked={editingProduct.isAvailable}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isAvailable: e.target.checked })}
                  />
                  <label htmlFor="isAvailable" className="text-xs font-bold text-stone-800">
                    متوفر حاليًا للطلب
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs"
                >
                  حفظ التعديلات
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ADD NEW PRODUCT MODAL */}
        {isNewProductModalOpen && (
          <div className="fixed inset-0 z-70 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h4 className="font-black text-stone-900">إضافة وجبة طعام جديدة</h4>
                <button onClick={() => setIsNewProductModalOpen(false)} className="p-1 text-stone-700 hover:text-stone-900">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveNewProduct} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">اسم الوجبة</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: شاورما عربي، ملوخية باللحم..."
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-stone-50 border border-stone-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">الوصف</label>
                  <textarea
                    rows={2}
                    placeholder="وصف الوجبة ومكوناتها..."
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-stone-50 border border-stone-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    السعر ({settings.currency}) (اختياري)
                  </label>
                  <input
                    type="number"
                    placeholder="اتركه فارغًا إذا كان السعر يُحدد عند الطلب"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-stone-50 border border-stone-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">رابط صورة الوجبة</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={productForm.image}
                    onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-stone-50 border border-stone-200"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs"
                >
                  إضافة الوجبة
                </button>
              </form>
            </div>
          </div>
        )}

        {/* IMAGE ZOOM PREVIEW MODAL */}
        {previewImage && (
          <div
            className="fixed inset-0 z-80 bg-black/85 flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setPreviewImage(null)}
          >
            <div className="relative max-w-3xl max-h-[90vh]">
              <img
                src={previewImage}
                alt="معاينة المرفق"
                className="max-w-full max-h-[85vh] object-contain rounded-2xl border-2 border-white/20 shadow-2xl"
              />
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-black text-white rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
