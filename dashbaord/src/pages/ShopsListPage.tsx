import { useEffect, useState } from 'react';
import client from '../api/client';
import type { ShopUser } from '../types/index';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import ShopFormModal from './ShopFormModal';

export default function ShopsListPage() {
  const [shops, setShops] = useState<ShopUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingShop, setEditingShop] = useState<ShopUser | null>(null);
  const [toggling, setToggling] = useState<number | null>(null);
  const [searchText, setSearchText] = useState('');

  const fetchShops = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await client.get('/users');
      setShops(res.data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const handleAdd = () => {
    setEditingShop(null);
    setShowModal(true);
  };

  const handleEdit = (shop: ShopUser) => {
    setEditingShop(shop);
    setShowModal(true);
  };

  const handleSaved = () => {
    setShowModal(false);
    setEditingShop(null);
    fetchShops();
  };

  const handleToggle = async (shop: ShopUser) => {
    setToggling(shop.id);
    try {
      await client.patch(`/users/${shop.id}/toggle`);
      fetchShops();
    } catch {
      /* silent */
    } finally {
      setToggling(null);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  const filteredShops = shops.filter((s) => {
    if (!searchText) return true;
    const q = searchText.toLowerCase();
    return (
      s.username.toLowerCase().includes(q) ||
      (s.shopName || '').toLowerCase().includes(q)
    );
  });

  const activeCount = shops.filter((s) => s.isActive).length;
  const inactiveCount = shops.filter((s) => !s.isActive).length;

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState onRetry={fetchShops} />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">إدارة المتاجر</h1>
          <p className="text-sm text-gray-500 mt-1">
            إدارة حسابات المتاجر المعتمدة — {shops.length} متجر
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          إضافة متجر جديد
        </button>
      </div>

      {/* Status summary */}
      {shops.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            نشط ({activeCount})
          </span>
          {inactiveCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
              <span className="w-2 h-2 rounded-full bg-gray-400" />
              معطّل ({inactiveCount})
            </span>
          )}
        </div>
      )}

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="بحث باسم المستخدم أو اسم المتجر..."
            className="w-full pr-10 pl-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 placeholder-gray-400 transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {filteredShops.length === 0 ? (
          <EmptyState
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
              </svg>
            }
            message={searchText ? 'لا توجد نتائج مطابقة' : 'لا توجد متاجر حالياً'}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b-2 border-gray-200 bg-gray-50/80">
                  <th className="px-5 py-3 text-xs font-semibold uppercase text-gray-500">اسم المستخدم</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase text-gray-500">اسم المتجر</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase text-gray-500">الحالة</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase text-gray-500">تاريخ الإنشاء</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase text-gray-500">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredShops.map((shop) => (
                  <tr
                    key={shop.id}
                    className="border-b border-gray-100 even:bg-gray-50/50 transition-colors hover:bg-blue-50/40"
                  >
                    <td className="px-5 py-3.5 text-sm text-gray-700 font-medium">{shop.username}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-700">{shop.shopName || '—'}</td>
                    <td className="px-5 py-3.5 text-sm">
                      {shop.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          نشط
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                          معطّل
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">{formatDate(shop.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleToggle(shop)}
                          disabled={toggling === shop.id}
                          dir="ltr"
                          title={shop.isActive ? 'إيقاف تفعيل المتجر' : 'تفعيل المتجر'}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
                            shop.isActive ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 ${
                              shop.isActive ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                        <button
                          onClick={() => handleEdit(shop)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors cursor-pointer"
                        >
                          تعديل
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ShopFormModal
        show={showModal}
        shop={editingShop}
        onClose={() => { setShowModal(false); setEditingShop(null); }}
        onSaved={handleSaved}
      />
    </div>
  );
}
