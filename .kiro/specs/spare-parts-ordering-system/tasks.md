# خطة التنفيذ: نظام طلب قطع الغيار للمحلات المعتمدة

## نظرة عامة

تنفيذ تدريجي يبدأ بالخادم الخلفي (Backend) ثم لوحة الإدارة (Admin Dashboard) ثم واجهة المحلات (Shop Frontend). كل خطوة تبني على ما قبلها لضمان عدم وجود كود معلّق.

## المهام

- [x] 1. إعداد قاعدة البيانات والكيانات (Backend)
  - [x] 1.1 تثبيت الحزم المطلوبة في `backend/`: `@nestjs/typeorm`, `typeorm`, `better-sqlite3`, `bcrypt`, `@types/bcrypt`
    - تشغيل `npm install` مع الحزم المذكورة
  - [x] 1.2 إنشاء ملف إعداد قاعدة البيانات `backend/src/database/database.module.ts`
    - إعداد TypeORM مع SQLite وملف `data/spare-parts.db`
    - تسجيل جميع الكيانات (User, Part, Order, OrderItem)
    - _Requirements: Design — Database Setup_
  - [x] 1.3 إنشاء كيانات TypeORM
    - إنشاء `backend/src/users/user.entity.ts` — كيان المستخدم مع الحقول: id, username, password (bcrypt), role (shop|admin), shopName, isActive, createdAt
    - إنشاء `backend/src/parts/part.entity.ts` — كيان القطعة مع الحقول: id, partNumber (unique), name, price, description, stock, createdAt, updatedAt
    - إنشاء `backend/src/orders/order.entity.ts` — كيان الطلب مع الحقول: id, orderNumber (unique), userId, status, createdAt, updatedAt, items relation
    - إنشاء `backend/src/orders/order-item.entity.ts` — كيان عنصر الطلب مع الحقول: id, orderId, partId, partNumber, partName, unitPrice, quantity
    - _Requirements: 3.4, 6.4, 8.1_
  - [x] 1.4 إنشاء seed script لبيانات تجريبية `backend/src/database/seed.ts`
    - إضافة مستخدم admin (username: admin, password: admin123, role: admin)
    - إضافة مستخدم محل (username: shop1, password: shop123, role: shop, shopName: محل النور)
    - إضافة 10 قطع غيار تجريبية بأسماء عربية
    - إضافة script في package.json لتشغيل الـ seed
    - _Requirements: Design — Soft User Management_

- [x] 2. وحدة المصادقة (Backend — AuthModule)
  - [x] 2.1 تثبيت حزم المصادقة: `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt`, `@types/passport-jwt`
  - [x] 2.2 إنشاء `backend/src/users/users.module.ts` و `backend/src/users/users.service.ts`
    - دالة `findByUsername(username)` لجلب المستخدم
    - تصدير UsersService للاستخدام في AuthModule
    - _Requirements: 1.1, 2.1_
  - [x] 2.3 إنشاء وحدة المصادقة `backend/src/auth/`
    - `auth.module.ts` — تسجيل JwtModule مع secret و expiresIn
    - `auth.service.ts` — دالة `validateUser` للتحقق من بيانات الدخول بـ bcrypt، ودالة `login` لإصدار JWT مع payload يحتوي id, username, role, shopName
    - `auth.controller.ts` — `POST /api/auth/login` يستقبل username/password ويُرجع access_token وبيانات المستخدم
    - `jwt.strategy.ts` — استراتيجية Passport لفك تشفير JWT من header Authorization
    - `jwt-auth.guard.ts` — Guard لحماية المسارات المحمية
    - `admin.guard.ts` — Guard إضافي يتحقق أن role = admin
    - _Requirements: 1.1, 1.2, 2.1, 2.2_
  - [x] 2.4 تفعيل CORS في `backend/src/main.ts` وإضافة global prefix `/api`
    - السماح بالطلبات من `localhost:3000` و `localhost:5173`
    - إضافة `ValidationPipe` عام
    - _Requirements: Design — Communication Pattern_

- [x] 3. نقطة تفتيش — التحقق من عمل المصادقة
  - تأكد من أن الـ Backend يعمل وأن endpoint تسجيل الدخول يُرجع token صحيح. اسأل المستخدم إذا كانت هناك أسئلة.

- [x] 4. وحدة القطع (Backend — PartsModule)
  - [x] 4.1 إنشاء `backend/src/parts/parts.module.ts`, `parts.service.ts`, `parts.controller.ts`
    - `GET /api/parts?page=1&limit=20&search=text` — جلب القطع مع pagination والبحث في partNumber و name، محمي بـ JwtAuthGuard
    - `GET /api/parts/:id` — جلب قطعة واحدة، محمي بـ JwtAuthGuard
    - `POST /api/parts` — إضافة قطعة جديدة، محمي بـ JwtAuthGuard + AdminGuard، مع التحقق من عدم تكرار partNumber (إرجاع 409)
    - `PUT /api/parts/:id` — تعديل قطعة، محمي بـ JwtAuthGuard + AdminGuard
    - _Requirements: 3.1, 3.4, 4.1, 8.1, 8.2, 8.3_
  - [x] 4.2 إنشاء DTOs للتحقق من صحة البيانات
    - `create-part.dto.ts` — التحقق من partNumber, name, price, description, stock مع رسائل عربية
    - `update-part.dto.ts` — نفس الحقول لكن اختيارية (PartialType)
    - استخدام `class-validator` و `class-transformer`
    - _Requirements: 8.1, 8.3_

- [x] 5. وحدة الطلبات (Backend — OrdersModule)
  - [x] 5.1 إنشاء `backend/src/orders/orders.module.ts`, `orders.service.ts`, `orders.controller.ts`
    - `POST /api/orders` — إنشاء طلب جديد بحالة pending، حفظ snapshots (partNumber, partName, unitPrice) في OrderItem، توليد orderNumber بصيغة `ORD-YYYYMMDD-XXX`، محمي بـ JwtAuthGuard
    - `GET /api/orders` — جلب طلبات المحل الحالي فقط (حسب userId من JWT)، مرتبة من الأحدث، محمي بـ JwtAuthGuard
    - `GET /api/orders/all` — جلب جميع الطلبات مع فلترة اختيارية حسب status، محمي بـ AdminGuard
    - `GET /api/orders/:id` — تفاصيل طلب واحد مع items وبيانات المحل، محمي بـ JwtAuthGuard (المحل يرى طلباته فقط، الأدمن يرى الكل)
    - `PATCH /api/orders/:id/status` — تحديث حالة الطلب مع التحقق من صحة الانتقال (pending→approved→preparing→ready→delivered)، محمي بـ AdminGuard
    - _Requirements: 6.1, 6.4, 7.1, 7.3, 7.4, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_
  - [x] 5.2 إنشاء DTOs للطلبات
    - `create-order.dto.ts` — التحقق من items array مع partId و quantity
    - `update-status.dto.ts` — التحقق من status مع القيم المسموحة
    - _Requirements: 6.1_

- [x] 6. تسجيل الوحدات في AppModule وتشغيل الـ Seed
  - تحديث `backend/src/app.module.ts` لتسجيل DatabaseModule, AuthModule, UsersModule, PartsModule, OrdersModule
  - حذف أو تنظيف الملفات الافتراضية (app.controller.ts, app.service.ts) إذا لم تعد مطلوبة
  - تشغيل seed script لإنشاء البيانات التجريبية
  - _Requirements: All backend requirements_

- [x] 7. نقطة تفتيش — التحقق من عمل جميع APIs
  - تأكد من أن جميع الـ endpoints تعمل بشكل صحيح. اسأل المستخدم إذا كانت هناك أسئلة.

- [x] 8. تهيئة مشروع لوحة الإدارة (Admin Dashboard)
  - [x] 8.1 تهيئة مشروع React + Vite + TypeScript في مجلد `dashbaord/`
    - تشغيل `npm create vite@latest . -- --template react-ts` داخل مجلد `dashbaord/`
    - تثبيت Tailwind CSS v4 وإعداده
    - تثبيت `react-router-dom` و `axios`
    - _Requirements: 11.2, 11.4_
  - [x] 8.2 إعداد البنية الأساسية والخط العربي والـ RTL
    - إعداد `dir="rtl"` و `lang="ar"` في `index.html`
    - إضافة خط IBM Plex Sans Arabic من Google Fonts
    - إعداد Tailwind مع الخط كـ default font family
    - إنشاء ملف `dashbaord/src/types/index.ts` مع TypeScript types (User, Part, Order, OrderItem, OrderStatus)
    - إنشاء `dashbaord/src/api/client.ts` — Axios instance مع baseURL و interceptor لإضافة JWT token من localStorage
    - _Requirements: 11.2, 11.4_

- [x] 9. مصادقة لوحة الإدارة
  - [x] 9.1 إنشاء `dashbaord/src/context/AuthContext.tsx`
    - AuthProvider يحفظ token و user في state و localStorage
    - دوال login و logout
    - التحقق من وجود token عند تحميل التطبيق
    - _Requirements: 2.1, 2.3_
  - [x] 9.2 إنشاء صفحة تسجيل الدخول `dashbaord/src/pages/LoginPage.tsx`
    - نموذج بسيط وجميل مع حقول username و password وزر دخول
    - عرض رسالة خطأ عربية عند فشل الدخول
    - إعادة التوجيه للوحة الرئيسية عند النجاح
    - _Requirements: 2.2, 2.4_
  - [x] 9.3 إنشاء `dashbaord/src/components/ProtectedRoute.tsx` و إعداد React Router
    - حماية جميع صفحات اللوحة — إعادة التوجيه لصفحة الدخول إذا لم يكن مسجلاً
    - إعداد routes في `App.tsx`
    - _Requirements: 2.3_

- [x] 10. تخطيط لوحة الإدارة (Layout)
  - إنشاء `dashbaord/src/components/DashboardLayout.tsx`
    - Sidebar navigation جانبي مع روابط: إدارة القطع، الطلبات
    - Header مع اسم المستخدم وزر تسجيل الخروج
    - تصميم RTL جميل ومتجاوب مع الشاشات المختلفة (desktop + tablet)
    - ألوان متناسقة واحترافية
    - _Requirements: 11.2, 11.4, 11.6_

- [x] 11. صفحة إدارة القطع (Admin Dashboard)
  - [x] 11.1 إنشاء `dashbaord/src/pages/PartsListPage.tsx`
    - جدول يعرض جميع القطع (partNumber, name, price, stock) مع تصميم جميل
    - زر "إضافة قطعة جديدة"
    - أزرار تعديل لكل قطعة
    - _Requirements: 8.4_
  - [x] 11.2 إنشاء `dashbaord/src/pages/PartFormModal.tsx`
    - Modal/نموذج لإضافة وتعديل القطع
    - حقول: partNumber, name, price, description, stock
    - التحقق من صحة البيانات قبل الإرسال
    - عرض رسالة خطأ عند تكرار رقم القطعة
    - إغلاق الـ modal وتحديث الجدول عند النجاح
    - _Requirements: 8.1, 8.2, 8.3, 8.5_

- [x] 12. صفحة إدارة الطلبات (Admin Dashboard)
  - [x] 12.1 إنشاء `dashbaord/src/components/StatusBadge.tsx`
    - شارة ملونة لكل حالة طلب بتسميات عربية (قيد الانتظار، معتمد، قيد التحضير، جاهز، تم التسليم)
    - ألوان مميزة لكل حالة
    - _Requirements: 9.7_
  - [x] 12.2 إنشاء `dashbaord/src/pages/OrdersListPage.tsx`
    - قائمة الطلبات مع فلترة حسب الحالة (tabs أو dropdown)
    - عرض: رقم الطلب، اسم المحل، التاريخ، الحالة
    - الضغط على طلب يفتح صفحة التفاصيل
    - _Requirements: 9.1, 9.6, 9.7_
  - [x] 12.3 إنشاء `dashbaord/src/pages/OrderDetailPage.tsx`
    - عرض تفاصيل الطلب: رقم الطلب، اسم المحل، التاريخ، الحالة الحالية
    - جدول بالقطع المطلوبة (partNumber, name, quantity, unitPrice)
    - أزرار تحديث الحالة حسب الانتقال الصحيح (الزر التالي فقط يظهر)
    - زر طباعة الطلب
    - _Requirements: 9.2, 9.3, 9.4, 9.5, 9.7_
  - [x] 12.4 إنشاء `dashbaord/src/pages/OrderPrintView.tsx`
    - عرض الطلب بتنسيق مناسب للطباعة (A4)
    - يحتوي: رقم الطلب، اسم المحل، التاريخ، جدول القطع مع الكميات والأسعار
    - استخدام CSS `@media print` لإخفاء عناصر التنقل
    - _Requirements: 10.1, 10.2, 10.3_

- [x] 13. نقطة تفتيش — التحقق من عمل لوحة الإدارة
  - تأكد من أن لوحة الإدارة تعمل بشكل كامل مع الـ Backend. اسأل المستخدم إذا كانت هناك أسئلة.

- [x] 14. إعداد واجهة المحلات (Shop Frontend)
  - [x] 14.1 تنظيف مشروع Next.js في `landing/` وإعداد البنية
    - تثبيت `axios` إذا لم يكن مثبتاً
    - التأكد من إعداد Tailwind CSS (أو تثبيته)
    - إعداد `dir="rtl"` و `lang="ar"` في layout الرئيسي
    - إضافة خط IBM Plex Sans Arabic من Google Fonts
    - إعداد Tailwind مع الخط كـ default font family
    - تنظيف الصفحات والمكونات الافتراضية غير المطلوبة
    - _Requirements: 11.1, 11.3, 11.5_
  - [x] 14.2 إنشاء الأنواع والـ API client
    - إنشاء `landing/src/types/index.ts` مع TypeScript types
    - إنشاء `landing/src/lib/api.ts` — Axios instance مع baseURL و interceptor لإضافة JWT
    - _Requirements: Design — API Contracts_

- [x] 15. مصادقة واجهة المحلات
  - [x] 15.1 إنشاء `landing/src/context/AuthContext.tsx`
    - AuthProvider يحفظ token و user في state و localStorage
    - دوال login و logout
    - التحقق من وجود token عند تحميل التطبيق
    - _Requirements: 1.1, 1.5_
  - [x] 15.2 إنشاء صفحة تسجيل الدخول `landing/src/app/login/page.tsx`
    - تصميم جميل وبسيط مع حقول username و password وزر دخول
    - عرض رسالة خطأ عربية عند فشل الدخول (رسالة موحدة لا تكشف أي حقل خاطئ)
    - إعادة التوجيه للكتالوج عند النجاح
    - _Requirements: 1.2, 1.4_
  - [x] 15.3 إنشاء middleware أو مكون حماية للصفحات المحمية
    - إعادة التوجيه لصفحة الدخول إذا لم يكن مسجلاً
    - الحفاظ على حالة المصادقة عبر التنقل بين الصفحات
    - _Requirements: 1.3, 1.5_

- [x] 16. سلة الطلب (Cart Context)
  - إنشاء `landing/src/context/CartContext.tsx`
    - CartProvider يدير حالة السلة (items مع quantities)
    - دوال: addToCart, removeFromCart, updateQuantity, clearCart
    - حفظ السلة في localStorage تلقائياً واستعادتها عند تحميل التطبيق
    - إزالة القطعة تلقائياً عند تعيين الكمية إلى صفر
    - حساب إجمالي عدد العناصر
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [x] 17. التخطيط الرئيسي وشريط التنقل (Shop Frontend)
  - إنشاء `landing/src/components/AppLayout.tsx`
    - Header مع شعار/اسم النظام، روابط التنقل (الكتالوج، طلباتي)، أيقونة السلة مع عدد العناصر، وزر تسجيل الخروج
    - تصميم RTL جميل ومتجاوب (desktop + mobile)
    - ألوان متناسقة واحترافية
    - _Requirements: 5.2, 11.1, 11.3, 11.5_

- [x] 18. صفحة كتالوج القطع (Shop Frontend)
  - [x] 18.1 إنشاء `landing/src/app/catalog/page.tsx` مع مكونات البحث والعرض
    - شريط بحث (SearchBar) مع debounce 500ms يبحث في partNumber و name
    - عرض القطع في بطاقات (cards) جميلة تعرض: partNumber, name, price, description
    - زر "أضف للسلة" في كل بطاقة
    - عرض رسالة "لا توجد نتائج" بالعربية عند عدم وجود نتائج
    - _Requirements: 3.1, 3.2, 4.1, 4.2, 4.3, 4.4, 5.1_
  - [x] 18.2 إضافة Pagination للكتالوج
    - أزرار تنقل بين الصفحات (السابق / التالي / أرقام الصفحات)
    - _Requirements: 3.2, 3.3_

- [x] 19. صفحة سلة الطلب (Shop Frontend)
  - إنشاء `landing/src/app/cart/page.tsx`
    - عرض جميع القطع في السلة مع: اسم القطعة، رقمها، السعر، الكمية
    - أزرار تعديل الكمية (+ / -) وزر حذف
    - عرض الإجمالي
    - زر "إرسال الطلب" — يرسل الطلب للـ API
    - عرض رسالة تأكيد مع رقم الطلب عند النجاح وتفريغ السلة
    - عرض رسالة تحذير إذا كانت السلة فارغة عند محاولة الإرسال
    - _Requirements: 5.3, 5.4, 5.5, 6.1, 6.2, 6.3_

- [x] 20. صفحة متابعة الطلبات (Shop Frontend)
  - [x] 20.1 إنشاء `landing/src/app/orders/page.tsx`
    - قائمة طلبات المحل مرتبة من الأحدث
    - عرض: رقم الطلب، التاريخ، الحالة بتسميات عربية ملونة (قيد الانتظار، معتمد، قيد التحضير، جاهز، تم التسليم)
    - الضغط على طلب يعرض التفاصيل
    - _Requirements: 7.1, 7.2_
  - [x] 20.2 إنشاء صفحة تفاصيل الطلب `landing/src/app/orders/[id]/page.tsx`
    - عرض: رقم الطلب، التاريخ، الحالة الحالية
    - جدول بالقطع المطلوبة (partNumber, name, quantity, unitPrice)
    - _Requirements: 7.3_

- [x] 21. نقطة تفتيش نهائية — التحقق من عمل النظام بالكامل
  - تأكد من أن جميع الأجزاء الثلاثة تعمل معاً بشكل صحيح. اسأل المستخدم إذا كانت هناك أسئلة.

## ملاحظات

- كل مهمة تبني على المهام السابقة — التنفيذ يجب أن يكون بالترتيب
- نقاط التفتيش تضمن التحقق التدريجي من صحة العمل
- المستخدمون يُضافون عبر seed script — لا توجد واجهة تسجيل ذاتي في الـ MVP
- مجلد لوحة الإدارة مكتوب `dashbaord/` (كما هو في المشروع)
