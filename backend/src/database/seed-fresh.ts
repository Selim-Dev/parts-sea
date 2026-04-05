import { connect, connection } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { UserSchema } from '../users/user.schema.js';
import { PartSchema } from '../parts/part.schema.js';

async function seedFresh() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://alislimaly_db_user:JxJ.3mhmPx3WnLW@cluster0.tzqlsui.mongodb.net/?appName=Cluster0';
    const dbName = process.env.MONGODB_DB_NAME || 'spare-parts-system';

    console.log('🔌 Connecting to MongoDB...');
    await connect(mongoUri, { dbName });
    console.log('✅ Connected to MongoDB');

    // Create collections
    const UserModel = connection.model('User', UserSchema);
    const PartModel = connection.model('Part', PartSchema);

    // Seed Admin User
    console.log('👤 Creating admin user...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    await UserModel.create({
      username: 'admin',
      passwordHash: adminPassword,
      role: 'admin',
      shopName: 'الإدارة',
      isActive: true,
    });
    console.log('✅ Admin user created (username: admin, password: admin123)');

    // Seed Shop User
    console.log('🏪 Creating shop user...');
    const shopPassword = await bcrypt.hash('shop123', 10);
    await UserModel.create({
      username: 'shop1',
      passwordHash: shopPassword,
      role: 'shop',
      shopName: 'محل النور',
      isActive: true,
    });
    console.log('✅ Shop user created (username: shop1, password: shop123)');

    // Seed Sample Parts
    console.log('📦 Creating sample parts...');
    const sampleParts = [
      {
        partNumber: 'OIL-FLT-001',
        name: 'فلتر زيت المحرك',
        price: 25.0,
        description: 'فلتر زيت عالي الجودة يناسب معظم السيارات اليابانية والكورية',
        stock: 150,
        category: 'فلاتر',
        brand: 'دينسو',
      },
      {
        partNumber: 'AIR-FLT-002',
        name: 'فلتر هواء',
        price: 35.0,
        description: 'فلتر هواء للمحرك يضمن تدفق هواء نظيف وأداء أفضل',
        stock: 120,
        category: 'فلاتر',
        brand: 'بوش',
      },
      {
        partNumber: 'SPK-PLG-003',
        name: 'شمعات إشعال',
        price: 18.0,
        description: 'طقم شمعات إشعال إيريديوم عالية الأداء — 4 قطع',
        stock: 200,
        category: 'كهربائيات',
        brand: 'دينسو',
      },
      {
        partNumber: 'BRK-FRT-004',
        name: 'طقم فرامل أمامي',
        price: 180.0,
        description: 'طقم فحمات فرامل أمامية سيراميك مقاومة للحرارة',
        stock: 60,
        category: 'فرامل',
        brand: 'بريمبو',
      },
      {
        partNumber: 'BRK-RER-005',
        name: 'طقم فرامل خلفي',
        price: 150.0,
        description: 'طقم فحمات فرامل خلفية عالية الجودة',
        stock: 55,
        category: 'فرامل',
        brand: 'بوش',
      },
      {
        partNumber: 'BAT-070-006',
        name: 'بطارية 70 أمبير',
        price: 350.0,
        description: 'بطارية سيارة 70 أمبير ضمان سنتين — مناسبة للأجواء الحارة',
        stock: 40,
        category: 'كهربائيات',
        brand: 'بوش',
      },
      {
        partNumber: 'BLT-AC-007',
        name: 'سير مكيف',
        price: 45.0,
        description: 'سير مكيف مطاطي متين يناسب أغلب الموديلات',
        stock: 90,
        category: 'أسلاك وسيور',
        brand: 'جيتس',
      },
      {
        partNumber: 'WTR-PMP-008',
        name: 'مضخة ماء',
        price: 220.0,
        description: 'مضخة ماء للمحرك تضمن تبريد فعال ومنع ارتفاع الحرارة',
        stock: 30,
        category: 'تبريد',
        brand: 'أصلي',
      },
      {
        partNumber: 'RAD-COL-009',
        name: 'رديتر تبريد',
        price: 450.0,
        description: 'رديتر تبريد ألمنيوم خفيف الوزن وعالي الكفاءة',
        stock: 20,
        category: 'تبريد',
        brand: 'أصلي',
      },
      {
        partNumber: 'O2-SEN-010',
        name: 'حساس أكسجين',
        price: 160.0,
        description: 'حساس أكسجين أصلي يحسّن استهلاك الوقود وأداء المحرك',
        stock: 45,
        category: 'كهربائيات',
        brand: 'دينسو',
      },
    ];

    await PartModel.insertMany(sampleParts);
    console.log(`✅ Created ${sampleParts.length} sample parts`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('   Admin: username=admin, password=admin123');
    console.log('   Shop:  username=shop1, password=shop123');

    await connection.close();
    console.log('\n👋 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedFresh();
