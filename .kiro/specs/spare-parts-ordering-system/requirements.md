# وثيقة المتطلبات — نظام طلب قطع الغيار للمحلات المعتمدة

## المقدمة

نظام ويب لعرض مخزون قطع الغيار وتسجيل الطلبات، يستهدف المحلات المعتمدة في السعودية. يحل محل العمليات اليدوية (Excel / مكالمات / واتساب) بمنصة موحدة تجمع عرض المخزون وإنشاء الطلبات ومتابعة حالتها. يتكون من ثلاثة أجزاء: واجهة المحلات (Next.js)، لوحة الإدارة (React)، والخادم الخلفي (NestJS).

## المصطلحات (Glossary)

- **Shop_Frontend**: واجهة المحلات المعتمدة المبنية بـ Next.js — تُستخدم للبحث عن القطع وإنشاء الطلبات ومتابعة حالتها
- **Admin_Dashboard**: لوحة تحكم الإدارة والمخزن المبنية بـ React — تُستخدم لإدارة المنتجات والطلبات
- **Backend_API**: الخادم الخلفي المبني بـ NestJS — يعالج المنطق التجاري ويدير البيانات
- **Authorized_Shop**: محل معتمد لديه بيانات دخول صالحة للنظام
- **Part**: قطعة غيار لها رقم فريد (Part_Number) واسم وسعر ووصف وكمية مخزون
- **Part_Number**: رقم القطعة الفريد — المرجع الأساسي لتحديد أي قطعة في النظام
- **Cart**: سلة الطلب المؤقتة التي يجمع فيها المحل القطع المطلوبة قبل الإرسال
- **Order**: طلب مُرسل من محل معتمد يحتوي على قطعة واحدة أو أكثر مع الكميات
- **Order_Status**: حالة الطلب وتمر بالمراحل التالية: pending → approved → preparing → ready → delivered
- **Warehouse_Staff**: موظف المخزن المسؤول عن استقبال الطلبات واعتمادها وتجهيزها

## المتطلبات

### المتطلب 1: تسجيل دخول المحلات المعتمدة

**User Story:** بصفتي صاحب محل معتمد، أريد تسجيل الدخول بحسابي المعتمد، حتى أتمكن من الوصول لكتالوج القطع وإنشاء الطلبات.

#### معايير القبول (Acceptance Criteria)

1. WHEN an Authorized_Shop provides valid credentials, THE Backend_API SHALL authenticate the shop and return an access token
2. WHEN an Authorized_Shop provides invalid credentials, THE Backend_API SHALL return an authentication error message without revealing which field is incorrect
3. IF an unauthenticated user attempts to access any protected page, THEN THE Shop_Frontend SHALL redirect the user to the login page
4. THE Shop_Frontend SHALL display a login form with username and password fields and a submit button
5. WHILE an Authorized_Shop session is active, THE Shop_Frontend SHALL maintain the authentication state across page navigation

### المتطلب 2: تسجيل دخول الإدارة والمخزن

**User Story:** بصفتي موظف مخزن أو مدير، أريد تسجيل الدخول للوحة الإدارة، حتى أتمكن من إدارة المنتجات والطلبات.

#### معايير القبول (Acceptance Criteria)

1. WHEN a Warehouse_Staff member provides valid credentials, THE Backend_API SHALL authenticate the user and return an access token with admin privileges
2. WHEN a Warehouse_Staff member provides invalid credentials, THE Backend_API SHALL return an authentication error message
3. IF an unauthenticated user attempts to access the Admin_Dashboard, THEN THE Admin_Dashboard SHALL redirect the user to the admin login page
4. THE Admin_Dashboard SHALL display a login form with username and password fields

### المتطلب 3: عرض كتالوج قطع الغيار

**User Story:** بصفتي صاحب محل معتمد، أريد تصفح كتالوج القطع المتاحة، حتى أتمكن من معرفة ما هو متوفر وأسعاره.

#### معايير القبول (Acceptance Criteria)

1. WHEN an Authorized_Shop opens the catalog page, THE Shop_Frontend SHALL display a list of parts showing Part_Number, part name, price, and short description for each Part
2. THE Shop_Frontend SHALL display parts in a paginated layout with a clear and readable card or table format
3. WHEN an Authorized_Shop scrolls to the end of the current page, THE Shop_Frontend SHALL provide navigation to load the next set of parts
4. THE Backend_API SHALL return part data including Part_Number, name, price, description, and available stock quantity

### المتطلب 4: البحث والفلترة في الكتالوج

**User Story:** بصفتي صاحب محل معتمد، أريد البحث عن قطعة بالرقم أو الاسم، حتى أجد ما أحتاجه بسرعة.

#### معايير القبول (Acceptance Criteria)

1. WHEN an Authorized_Shop types a search query, THE Shop_Frontend SHALL filter the displayed parts by matching Part_Number or part name
2. THE Shop_Frontend SHALL display search results within 500ms of the last keystroke
3. WHEN the search query matches zero parts, THE Shop_Frontend SHALL display a "no results found" message in Arabic
4. WHEN an Authorized_Shop clears the search field, THE Shop_Frontend SHALL display the full catalog list

### المتطلب 5: سلة الطلب

**User Story:** بصفتي صاحب محل معتمد، أريد إضافة قطع لسلة الطلب وتعديل الكميات، حتى أجهّز طلبي قبل إرساله.

#### معايير القبول (Acceptance Criteria)

1. WHEN an Authorized_Shop clicks the add-to-cart button on a Part, THE Shop_Frontend SHALL add that Part to the Cart with a default quantity of 1
2. WHILE the Cart contains items, THE Shop_Frontend SHALL display a cart icon with the total number of items
3. WHEN an Authorized_Shop changes the quantity of a Part in the Cart, THE Shop_Frontend SHALL update the Cart total accordingly
4. WHEN an Authorized_Shop removes a Part from the Cart, THE Shop_Frontend SHALL remove that Part and update the Cart total
5. WHEN an Authorized_Shop sets the quantity of a Part to zero, THE Shop_Frontend SHALL remove that Part from the Cart
6. THE Shop_Frontend SHALL persist the Cart contents in browser local storage so the Cart survives page refresh

### المتطلب 6: إرسال الطلب

**User Story:** بصفتي صاحب محل معتمد، أريد إرسال طلبي للمخزن، حتى يبدأ تجهيزه.

#### معايير القبول (Acceptance Criteria)

1. WHEN an Authorized_Shop submits the Cart, THE Backend_API SHALL create a new Order with Order_Status set to "pending"
2. WHEN the Order is created successfully, THE Shop_Frontend SHALL clear the Cart and display a confirmation message with the Order number
3. IF the Cart is empty when the Authorized_Shop attempts to submit, THEN THE Shop_Frontend SHALL display a validation message indicating the Cart is empty
4. THE Backend_API SHALL record the Authorized_Shop identity, order timestamp, and all Part items with quantities in the Order

### المتطلب 7: متابعة حالة الطلبات

**User Story:** بصفتي صاحب محل معتمد، أريد متابعة حالة طلباتي، حتى أعرف متى سيكون جاهزًا دون الحاجة للاتصال.

#### معايير القبول (Acceptance Criteria)

1. WHEN an Authorized_Shop opens the orders page, THE Shop_Frontend SHALL display a list of all orders placed by that shop sorted by newest first
2. THE Shop_Frontend SHALL display the Order_Status for each order using clear Arabic labels (قيد الانتظار، معتمد، قيد التحضير، جاهز، تم التسليم)
3. WHEN an Authorized_Shop clicks on an order, THE Shop_Frontend SHALL display the order details including all parts, quantities, and current Order_Status
4. THE Backend_API SHALL return only orders belonging to the requesting Authorized_Shop

### المتطلب 8: إدارة المنتجات (لوحة الإدارة)

**User Story:** بصفتي مدير أو موظف مخزن، أريد إضافة وتعديل بيانات القطع، حتى يكون الكتالوج محدّثًا دائمًا.

#### معايير القبول (Acceptance Criteria)

1. WHEN a Warehouse_Staff member submits a new part form, THE Backend_API SHALL create a new Part with Part_Number, name, price, description, and stock quantity
2. WHEN a Warehouse_Staff member edits an existing Part, THE Backend_API SHALL update the Part data and reflect changes in the catalog
3. IF a Warehouse_Staff member submits a Part with a duplicate Part_Number, THEN THE Backend_API SHALL return a validation error indicating the Part_Number already exists
4. THE Admin_Dashboard SHALL display a parts management page with a table listing all parts and options to add, edit, and view each Part
5. THE Admin_Dashboard SHALL provide a form for adding and editing parts with fields for Part_Number, name, price, description, and stock quantity

### المتطلب 9: استقبال وإدارة الطلبات (لوحة الإدارة)

**User Story:** بصفتي موظف مخزن، أريد استقبال الطلبات وتحديث حالتها، حتى أنظّم عملية التجهيز والتسليم.

#### معايير القبول (Acceptance Criteria)

1. WHEN a new Order is created, THE Admin_Dashboard SHALL display the order in the incoming orders list
2. WHEN a Warehouse_Staff member approves an Order, THE Backend_API SHALL update the Order_Status from "pending" to "approved"
3. WHEN a Warehouse_Staff member marks an Order as preparing, THE Backend_API SHALL update the Order_Status from "approved" to "preparing"
4. WHEN a Warehouse_Staff member marks an Order as ready, THE Backend_API SHALL update the Order_Status from "preparing" to "ready"
5. WHEN a Warehouse_Staff member marks an Order as delivered, THE Backend_API SHALL update the Order_Status from "ready" to "delivered"
6. THE Admin_Dashboard SHALL display orders with filtering options by Order_Status
7. THE Admin_Dashboard SHALL display order details including shop name, order date, all parts with quantities, and current Order_Status

### المتطلب 10: طباعة الطلب

**User Story:** بصفتي موظف مخزن، أريد طباعة الطلب، حتى أستخدمه كمرجع أثناء تجهيز القطع.

#### معايير القبول (Acceptance Criteria)

1. WHEN a Warehouse_Staff member clicks the print button on an Order, THE Admin_Dashboard SHALL generate a print-friendly view of the order
2. THE Admin_Dashboard SHALL include in the print view: order number, shop name, order date, list of parts with Part_Number, name, quantity, and price
3. THE Admin_Dashboard SHALL format the print view to fit A4 paper size

### المتطلب 11: واجهة مستخدم عربية وجذابة

**User Story:** بصفتي مستخدم للنظام، أريد واجهة عربية جميلة وسهلة الاستخدام، حتى أتمكن من استخدام النظام بسلاسة.

#### معايير القبول (Acceptance Criteria)

1. THE Shop_Frontend SHALL render all interface elements in Arabic with right-to-left (RTL) text direction
2. THE Admin_Dashboard SHALL render all interface elements in Arabic with right-to-left (RTL) text direction
3. THE Shop_Frontend SHALL use a modern, clean design with consistent color scheme and readable Arabic typography
4. THE Admin_Dashboard SHALL use a modern, clean design with consistent color scheme and readable Arabic typography
5. THE Shop_Frontend SHALL be responsive and usable on both desktop and mobile screen sizes
6. THE Admin_Dashboard SHALL be responsive and usable on both desktop and tablet screen sizes
